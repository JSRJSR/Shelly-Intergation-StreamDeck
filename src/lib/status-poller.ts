import { ShellyClient } from './shelly-client';
import { DeviceConfig, ShellyStatus } from '../types';

export interface StatusUpdateCallback {
  (device: DeviceConfig, status: ShellyStatus | null): void;
}

export class StatusPoller {
  private client: ShellyClient;
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private callbacks: Map<string, StatusUpdateCallback> = new Map();
  private defaultInterval: number = 5000; // 5 seconds

  constructor(client: ShellyClient) {
    this.client = client;
  }

  startPolling(device: DeviceConfig, callback: StatusUpdateCallback, interval?: number): void {
    const key = this.getDeviceKey(device);
    const pollInterval = interval || this.defaultInterval;

    // Stop existing polling if any
    this.stopPolling(device);

    // Store callback
    this.callbacks.set(key, callback);

    // Start polling
    const poll = async () => {
      const componentType = device.componentType || (device.deviceType === 'shelly-plus-1' ? 'switch' : 'light');
      const componentId = device.componentId || 0;
      const status = await this.client.getStatus(device.ip, componentType, componentId);
      callback(device, status);
    };

    // Initial poll
    poll();

    // Set up interval
    const intervalId = setInterval(poll, pollInterval);
    this.intervals.set(key, intervalId);
  }

  stopPolling(device: DeviceConfig): void {
    const key = this.getDeviceKey(device);
    const intervalId = this.intervals.get(key);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(key);
    }
    this.callbacks.delete(key);
  }

  stopAll(): void {
    this.intervals.forEach(intervalId => clearInterval(intervalId));
    this.intervals.clear();
    this.callbacks.clear();
  }

  private getDeviceKey(device: DeviceConfig): string {
    return `${device.ip}-${device.componentId || 0}`;
  }
}

