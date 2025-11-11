import { Action } from '@elgato/streamdeck';
import { ShellyClient } from '../lib/shelly-client';
import { StatusPoller } from '../lib/status-poller';
import { ActionSettings, DeviceConfig } from '../types';
import { getDefaultComponent } from '../lib/device-types';
import { updateButtonIcon } from '../lib/icon-helper';

export class StatusAction extends Action<ActionSettings> {
  private client: ShellyClient;
  private poller: StatusPoller;
  private pollingInterval: number = 5000;
  private readonly actionUUID = 'com.shelly.status';

  constructor(context: any, client: ShellyClient, poller: StatusPoller) {
    super(context);
    this.client = client;
    this.poller = poller;
  }

  async onWillAppear(ev: { payload: { settings: ActionSettings } }): Promise<void> {
    const settings = ev.payload.settings;
    this.pollingInterval = settings.pollingInterval || 5000;
    await this.startPolling(settings);
    await this.updateButtonState(settings);
  }

  async onWillDisappear(ev: { payload: { settings: ActionSettings } }): Promise<void> {
    const settings = ev.payload.settings;
    if (settings.devices) {
      settings.devices.forEach(device => {
        this.poller.stopPolling(device);
      });
    }
  }

  async onDidReceiveSettings(ev: { payload: { settings: ActionSettings } }): Promise<void> {
    const settings = ev.payload.settings;
    this.pollingInterval = settings.pollingInterval || 5000;
    await this.startPolling(settings);
    await this.updateButtonState(settings);
  }

  private async startPolling(settings: ActionSettings): Promise<void> {
    if (!settings.devices || settings.devices.length === 0) {
      return;
    }

    // Stop existing polling
    settings.devices.forEach(device => {
      this.poller.stopPolling(device);
    });

    // Start polling for first device (for display)
    const firstDevice = settings.devices[0];
    this.poller.startPolling(
      firstDevice,
      async (device: DeviceConfig, status) => {
        await this.updateButtonState(settings, status);
      },
      this.pollingInterval
    );
  }

  private async updateButtonState(settings: ActionSettings, status?: any): Promise<void> {
    if (!settings.devices || settings.devices.length === 0) {
      await this.setTitle('');
      return;
    }

    if (!status) {
      const firstDevice = settings.devices[0];
      const component = getDefaultComponent(firstDevice.deviceType, firstDevice.componentId);
      status = await this.client.getStatus(firstDevice.ip, component.type, component.id);
    }

    if (status) {
      if (status.output) {
        if (status.red !== undefined || status.green !== undefined || status.blue !== undefined) {
          // RGBW device - show color
          const rgb = `rgb(${status.red || 0}, ${status.green || 0}, ${status.blue || 0})`;
          await this.setTitle(`${status.brightness || 0}%`);
        } else {
          // Switch device
          await this.setTitle('ON');
        }
      } else {
        await this.setTitle('OFF');
      }
    } else {
      await this.setTitle('?');
    }
    await updateButtonIcon(this, this.actionUUID, settings);
  }
}

