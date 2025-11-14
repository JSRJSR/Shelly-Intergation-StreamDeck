import { action, SingletonAction, type KeyDownEvent, type WillAppearEvent, type WillDisappearEvent, type DidReceiveSettingsEvent, type KeyAction } from '@elgato/streamdeck';
import { ShellyClient, DeviceGeneration } from '../lib/shelly-client';
import { ToggleActionSettings } from '../types';
import { updateButtonIcon } from '../lib/icon-helper';

@action({ UUID: 'com.shelly.toggle' })
export class ToggleAction extends SingletonAction<ToggleActionSettings> {
  private client: ShellyClient;
  private readonly actionUUID = 'com.shelly.toggle';
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(client: ShellyClient) {
    super();
    this.client = client;
  }

  async onWillAppear(ev: WillAppearEvent<ToggleActionSettings>): Promise<void> {
    const action = ev.action as KeyAction<ToggleActionSettings>;
    const settings = ev.payload.settings;
    await this.updateButtonState(action, settings);
    await this.startPolling(action.id, settings);
  }

  async onWillDisappear(ev: WillDisappearEvent<ToggleActionSettings>): Promise<void> {
    const action = ev.action as KeyAction<ToggleActionSettings>;
    const actionId = action.id;
    this.stopPolling(actionId);
  }

  async onKeyDown(ev: KeyDownEvent<ToggleActionSettings>): Promise<void> {
    const settings = ev.payload.settings;
    const action = ev.action as KeyAction<ToggleActionSettings>;
    
    if (!settings.ipAddress) {
      await action.showAlert();
      return;
    }

    const generation = await this.getGeneration(settings);
    await this.toggleDevice(settings.ipAddress, settings.componentId || 0, generation);
    await this.updateButtonState(action, settings);
  }

  async onDidReceiveSettings(ev: DidReceiveSettingsEvent<ToggleActionSettings>): Promise<void> {
    const action = ev.action as KeyAction<ToggleActionSettings>;
    const settings = ev.payload.settings;
    await this.updateButtonState(action, settings);
    await this.startPolling(action.id, settings);
  }

  private async getGeneration(settings: ToggleActionSettings): Promise<DeviceGeneration | null> {
    if (settings.deviceGeneration === 'gen1') {
      return 'gen1';
    }
    if (settings.deviceGeneration === 'gen2') {
      return 'gen2';
    }
    // Auto-detect
    if (settings.ipAddress) {
      return await this.client.detectGeneration(settings.ipAddress);
    }
    return null;
  }

  private async toggleDevice(ip: string, componentId: number, generation: DeviceGeneration | null): Promise<void> {
    if (!generation) {
      return;
    }
    
    await this.client.toggleSwitch(ip, componentId, generation);
  }

  private async startPolling(actionId: string, settings: ToggleActionSettings): Promise<void> {
    this.stopPolling(actionId);
    
    if (!settings.ipAddress || !settings.pollingInterval || settings.pollingInterval < 1000) {
      return;
    }

    const intervalId = setInterval(async () => {
      const action = this.actions.find(a => a.id === actionId);
      if (action) {
        await this.updateButtonState(action as KeyAction<ToggleActionSettings>, settings);
      }
    }, settings.pollingInterval);

    this.pollingIntervals.set(actionId, intervalId);
  }

  private stopPolling(actionId: string): void {
    const intervalId = this.pollingIntervals.get(actionId);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(actionId);
    }
  }

  private async updateButtonState(action: KeyAction<ToggleActionSettings>, settings: ToggleActionSettings): Promise<void> {
    if (!settings.ipAddress) {
      await action.setState(0);
      await action.setTitle('');
      return;
    }

    const generation = await this.getGeneration(settings);
    const componentId = settings.componentId || 0;
    const status = await this.client.getStatus(settings.ipAddress, 'switch', componentId, generation || undefined);

    if (status) {
      const state = status.output ? 1 : 0;
      await action.setState(state);

      // Set title based on settings
      if (settings.buttonTitle) {
        await action.setTitle(settings.buttonTitle);
      } else if (settings.showStatus !== false) {
        await action.setTitle(status.output ? 'ON' : 'OFF');
      } else {
        await action.setTitle('');
      }

      // Set image
      if (state === 1 && settings.onStateImage) {
        await action.setImage(settings.onStateImage);
      } else if (state === 0 && settings.offStateImage) {
        await action.setImage(settings.offStateImage);
      } else {
        // Use default icon with colors
        await updateButtonIcon(action, this.actionUUID, settings, state);
      }
    } else {
      await action.setState(0);
      await action.setTitle('?');
      await updateButtonIcon(action, this.actionUUID, settings, 0);
    }
  }
}
