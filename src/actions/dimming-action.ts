import { Action } from '@elgato/streamdeck';
import { ShellyClient } from '../lib/shelly-client';
import { ActionSettings, DeviceConfig } from '../types';
import { getDefaultComponent } from '../lib/device-types';
import { updateButtonIcon } from '../lib/icon-helper';

export class DimmingAction extends Action<ActionSettings> {
  private client: ShellyClient;
  private readonly actionUUID = 'com.shelly.dimming';

  constructor(context: any, client: ShellyClient) {
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

    const brightness = settings.brightness || 50;
    const promises = settings.devices.map(device => this.setBrightness(device, brightness));
    await Promise.all(promises);
    await this.updateButtonState(settings);
  }

  async onDialRotate(ev: { payload: { settings: ActionSettings; pressed: boolean; ticks: number } }): Promise<void> {
    const settings = ev.payload.settings;
    if (!settings.devices || settings.devices.length === 0) {
      return;
    }

    // Get current brightness or default
    const currentBrightness = settings.brightness || 50;
    const step = 5;
    const newBrightness = Math.max(0, Math.min(100, currentBrightness + (ev.payload.ticks * step)));

    // Update settings
    settings.brightness = newBrightness;
    await this.setSettings(settings);

    // Apply to devices
    const promises = settings.devices.map(device => this.setBrightness(device, newBrightness));
    await Promise.all(promises);
    await this.updateButtonState(settings);
  }

  async onDidReceiveSettings(ev: { payload: { settings: ActionSettings } }): Promise<void> {
    await this.updateButtonState(ev.payload.settings);
  }

  private async setBrightness(device: DeviceConfig, brightness: number): Promise<void> {
    const component = getDefaultComponent(device.deviceType, device.componentId);
    
    if (component.type === 'light') {
      await this.client.setLight(device.ip, component.id, brightness, true);
    }
  }

  private async updateButtonState(settings: ActionSettings): Promise<void> {
    if (!settings.devices || settings.devices.length === 0) {
      await this.setTitle('');
      return;
    }

    const brightness = settings.brightness || 50;
    await this.setTitle(`${brightness}%`);
    await updateButtonIcon(this, this.actionUUID, settings);
  }
}

