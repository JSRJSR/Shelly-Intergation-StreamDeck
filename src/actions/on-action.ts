import { Action } from '@elgato/streamdeck';
import { ShellyClient } from '../lib/shelly-client';
import { ActionSettings, DeviceConfig } from '../types';
import { getDefaultComponent } from '../lib/device-types';
import { updateButtonIcon } from '../lib/icon-helper';

export class OnAction extends Action<ActionSettings> {
  private client: ShellyClient;
  private readonly actionUUID = 'com.shelly.on';

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

