import { action, SingletonAction, type KeyDownEvent, type WillAppearEvent, type WillDisappearEvent, type KeyAction } from '@elgato/streamdeck';
import { ShellyClient, DeviceGeneration } from '../lib/shelly-client';

// Hardcoded settings for test action
const TEST_IP = '192.168.77.4';
const TEST_COMPONENT_ID = 0;
const TEST_GENERATION: DeviceGeneration = 'gen1';
const TEST_POLLING_INTERVAL = 5000; // 5 seconds

@action({ UUID: 'com.shelly.test-gen1-light' })
export class TestGen1LightAction extends SingletonAction {
  private client: ShellyClient;
  private readonly actionUUID = 'com.shelly.test-gen1-light';
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(client: ShellyClient) {
    super();
    this.client = client;
    console.log('[TestGen1LightAction] Initialized with IP:', TEST_IP, 'Component ID:', TEST_COMPONENT_ID);
  }

  async onWillAppear(ev: WillAppearEvent): Promise<void> {
    try {
      console.log('[TestGen1LightAction] onWillAppear - Action ID:', ev.action.id);
      const action = ev.action as KeyAction;
      await this.updateButtonState(action);
      await this.startPolling(action.id);
      console.log('[TestGen1LightAction] onWillAppear completed successfully');
    } catch (error) {
      console.error('[TestGen1LightAction] Error in onWillAppear:', error);
    }
  }

  async onWillDisappear(ev: WillDisappearEvent): Promise<void> {
    try {
      console.log('[TestGen1LightAction] onWillDisappear - Action ID:', ev.action.id);
      const action = ev.action as KeyAction;
      const actionId = action.id;
      this.stopPolling(actionId);
    } catch (error) {
      console.error('[TestGen1LightAction] Error in onWillDisappear:', error);
    }
  }

  async onKeyDown(ev: KeyDownEvent): Promise<void> {
    try {
      console.log('[TestGen1LightAction] onKeyDown - Toggling device at', TEST_IP);
      const action = ev.action as KeyAction;
      
      const result = await this.toggleDevice();
      console.log('[TestGen1LightAction] Toggle result:', result);
      
      // Wait a bit for the device to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await this.updateButtonState(action);
      console.log('[TestGen1LightAction] Button state updated after toggle');
    } catch (error) {
      console.error('[TestGen1LightAction] Error in onKeyDown:', error);
      const action = ev.action as KeyAction;
      await action.showAlert();
    }
  }

  private async toggleDevice(): Promise<boolean> {
    try {
      console.log('[TestGen1LightAction] toggleDevice - IP:', TEST_IP, 'Component:', TEST_COMPONENT_ID, 'Generation:', TEST_GENERATION);
      const result = await this.client.toggleSwitch(TEST_IP, TEST_COMPONENT_ID, TEST_GENERATION);
      console.log('[TestGen1LightAction] toggleSwitch returned:', result);
      return result;
    } catch (error) {
      console.error('[TestGen1LightAction] Error in toggleDevice:', error);
      throw error;
    }
  }

  private async startPolling(actionId: string): Promise<void> {
    try {
      this.stopPolling(actionId);
      console.log('[TestGen1LightAction] Starting polling for action:', actionId, 'Interval:', TEST_POLLING_INTERVAL, 'ms');

      const intervalId = setInterval(async () => {
        try {
          const action = this.actions.find(a => a.id === actionId);
          if (action) {
            await this.updateButtonState(action as KeyAction);
          } else {
            console.warn('[TestGen1LightAction] Action not found during polling:', actionId);
          }
        } catch (error) {
          console.error('[TestGen1LightAction] Error in polling interval:', error);
        }
      }, TEST_POLLING_INTERVAL);

      this.pollingIntervals.set(actionId, intervalId);
      console.log('[TestGen1LightAction] Polling started successfully');
    } catch (error) {
      console.error('[TestGen1LightAction] Error starting polling:', error);
    }
  }

  private stopPolling(actionId: string): void {
    const intervalId = this.pollingIntervals.get(actionId);
    if (intervalId) {
      console.log('[TestGen1LightAction] Stopping polling for action:', actionId);
      clearInterval(intervalId);
      this.pollingIntervals.delete(actionId);
    }
  }

  private async updateButtonState(action: KeyAction): Promise<void> {
    try {
      console.log('[TestGen1LightAction] updateButtonState - Fetching status from', TEST_IP);
      const status = await this.client.getStatus(TEST_IP, 'switch', TEST_COMPONENT_ID, TEST_GENERATION);
      console.log('[TestGen1LightAction] Status received:', status);

      if (status) {
        // Simple button - just show status as title
        await action.setTitle(status.output ? 'ON' : 'OFF');
        console.log('[TestGen1LightAction] Set title to:', status.output ? 'ON' : 'OFF');
      } else {
        console.warn('[TestGen1LightAction] No status received, showing error state');
        await action.setTitle('ERR');
      }
    } catch (error) {
      console.error('[TestGen1LightAction] Error in updateButtonState:', error);
      try {
        await action.setTitle('ERR');
      } catch (setError) {
        console.error('[TestGen1LightAction] Error setting error state:', setError);
      }
    }
  }
}

