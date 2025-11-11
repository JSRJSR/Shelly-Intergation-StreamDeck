import type { KeyAction } from '@elgato/streamdeck';
import type { WillAppear } from '@elgato/streamdeck/types/api';
import { ShellyClient } from '../lib/shelly-client';
import { ActionSettings, DeviceConfig } from '../types';
import { getDefaultComponent } from '../lib/device-types';
import { updateButtonIcon } from '../lib/icon-helper';

// @ts-ignore - KeyAction exists at runtime but is exported as type
export class ToggleAction extends (KeyAction as any) {
  private client: ShellyClient;
  private readonly actionUUID = 'com.shelly.toggle';

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

    const promises = settings.devices.map(device => this.toggleDevice(device));
    await Promise.all(promises);
    await this.updateButtonState(settings);
  }

  async onDidReceiveSettings(ev: { payload: { settings: ActionSettings } }): Promise<void> {
    await this.updateButtonState(ev.payload.settings);
  }

  private async toggleDevice(device: DeviceConfig): Promise<void> {
    const component = getDefaultComponent(device.deviceType, device.componentId);
    
    if (component.type === 'switch') {
      await this.client.toggleSwitch(device.ip, component.id);
    } else {
      await this.client.toggleLight(device.ip, component.id);
    }
  }

  private async updateButtonState(settings: ActionSettings): Promise<void> {
    if (!settings.devices || settings.devices.length === 0) {
      await this.setState(0);
      await this.setTitle('');
      await updateButtonIcon(this, this.actionUUID, settings, 0);
      return;
    }

    // Check first device status
    const firstDevice = settings.devices[0];
    const component = getDefaultComponent(firstDevice.deviceType, firstDevice.componentId);
    const status = await this.client.getStatus(firstDevice.ip, component.type, component.id);

    if (status) {
      const state = status.output ? 1 : 0;
      await this.setState(state);
      await this.setTitle(status.output ? 'ON' : 'OFF');
      await updateButtonIcon(this, this.actionUUID, settings, state);
    } else {
      await this.setState(0);
      await this.setTitle('?');
      await updateButtonIcon(this, this.actionUUID, settings, 0);
    }
  }
}

