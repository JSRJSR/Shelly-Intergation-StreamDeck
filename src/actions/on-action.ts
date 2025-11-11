import type { KeyAction } from '@elgato/streamdeck';
import type { WillAppear } from '@elgato/streamdeck/types/api';
import { ShellyClient } from '../lib/shelly-client';
import { ActionSettings, DeviceConfig } from '../types';
import { getDefaultComponent } from '../lib/device-types';
import { updateButtonIcon } from '../lib/icon-helper';

// @ts-ignore - KeyAction exists at runtime but is exported as type
export class OnAction extends (KeyAction as any) {
  private client: ShellyClient;
  private readonly actionUUID = 'com.shelly.on';

  constructor(context: WillAppear<ActionSettings>, client: ShellyClient) {
    super(context);
    this.client = client;
  }

  async onWillAppear(ev: { payload: { settings: ActionSettings } }): Promise<void> {
    await this.updateButtonState(ev.payload.settings);
  }

  async onKeyDown(ev: { payload: { settings: ActionSettings } }): Promise<void> {
    const settings = ev.payload.settings;
    if (!settings.devices || settings.devices.length === 0) {
      await this.showAlert();
      return;
    }

    const promises = settings.devices.map(device => this.turnOnDevice(device));
    await Promise.all(promises);
    await this.updateButtonState(settings);
  }

  async onDidReceiveSettings(ev: { payload: { settings: ActionSettings } }): Promise<void> {
    await this.updateButtonState(ev.payload.settings);
  }

  private async turnOnDevice(device: DeviceConfig): Promise<void> {
    const component = getDefaultComponent(device.deviceType, device.componentId);
    
    if (component.type === 'switch') {
      await this.client.setSwitch(device.ip, component.id, true);
    } else {
      await this.client.setLight(device.ip, component.id, 100, true);
    }
  }

  private async updateButtonState(settings: ActionSettings): Promise<void> {
    if (!settings.devices || settings.devices.length === 0) {
      await this.setTitle('');
      return;
    }

    await this.setTitle('ON');
    await updateButtonIcon(this, this.actionUUID, settings);
  }
}

