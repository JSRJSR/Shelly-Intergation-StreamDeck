import { Action } from '@elgato/streamdeck';
import { ShellyClient } from '../lib/shelly-client';
import { ActionSettings, DeviceConfig, RGBWColor } from '../types';
import { getDefaultComponent } from '../lib/device-types';
import { updateButtonIcon } from '../lib/icon-helper';

export class RGBWColorAction extends Action<ActionSettings> {
  private client: ShellyClient;
  private readonly actionUUID = 'com.shelly.rgbw';

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

    if (!settings.rgbwColor) {
      // Default to white if no color set
      settings.rgbwColor = { red: 255, green: 255, blue: 255, white: 255, brightness: 100 };
    }

    const promises = settings.devices.map(device => this.setRGBWColor(device, settings.rgbwColor!));
    await Promise.all(promises);
    await this.updateButtonState(settings);
  }

  async onDialRotate(ev: { payload: { settings: ActionSettings; pressed: boolean; ticks: number } }): Promise<void> {
    const settings = ev.payload.settings;
    if (!settings.devices || settings.devices.length === 0) {
      return;
    }

    if (!settings.rgbwColor) {
      settings.rgbwColor = { red: 255, green: 255, blue: 255, white: 255, brightness: 100 };
    }

    const step = 5;
    const currentBrightness = settings.rgbwColor.brightness || 100;
    const newBrightness = Math.max(0, Math.min(100, currentBrightness + (ev.payload.ticks * step)));

    settings.rgbwColor.brightness = newBrightness;
    await this.setSettings(settings);

    const promises = settings.devices.map(device => this.setRGBWColor(device, settings.rgbwColor!));
    await Promise.all(promises);
    await this.updateButtonState(settings);
  }

  async onDidReceiveSettings(ev: { payload: { settings: ActionSettings } }): Promise<void> {
    await this.updateButtonState(ev.payload.settings);
  }

  private async setRGBWColor(device: DeviceConfig, color: RGBWColor): Promise<void> {
    const component = getDefaultComponent(device.deviceType, device.componentId);
    
    if (component.type === 'light') {
      await this.client.setRGBW(
        device.ip,
        component.id,
        color.red,
        color.green,
        color.blue,
        color.white,
        color.brightness
      );
    }
  }

  private async updateButtonState(settings: ActionSettings): Promise<void> {
    if (!settings.devices || settings.devices.length === 0) {
      await this.setTitle('');
      return;
    }

    if (settings.rgbwColor) {
      // Create a color preview by setting button background
      const rgb = `rgb(${settings.rgbwColor.red}, ${settings.rgbwColor.green}, ${settings.rgbwColor.blue})`;
      await this.setTitle(`${settings.rgbwColor.brightness || 100}%`);
    } else {
      await this.setTitle('RGBW');
    }
    await updateButtonIcon(this, this.actionUUID, settings);
  }
}

