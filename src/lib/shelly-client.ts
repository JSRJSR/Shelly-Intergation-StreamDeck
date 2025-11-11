import { RGBWColor, ShellyStatus } from '../types';

export class ShellyClient {
  private baseUrl(ip: string): string {
    return `http://${ip}/rpc`;
  }

  async getStatus(ip: string, component: 'switch' | 'light', id: number = 0): Promise<ShellyStatus | null> {
    try {
      const componentName = component === 'switch' ? 'Switch' : 'Light';
      const response = await fetch(`${this.baseUrl(ip)}/${componentName}.GetStatus?id=${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data as ShellyStatus;
    } catch (error) {
      console.error(`Error getting status for ${ip}:`, error);
      return null;
    }
  }

  async setSwitch(ip: string, id: number, on: boolean): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl(ip)}/Switch.Set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          on,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data?.output === on;
    } catch (error) {
      console.error(`Error setting switch for ${ip}:`, error);
      return false;
    }
  }

  async toggleSwitch(ip: string, id: number): Promise<boolean> {
    try {
      const status = await this.getStatus(ip, 'switch', id);
      if (status === null) {
        return false;
      }
      return await this.setSwitch(ip, id, !status.output);
    } catch (error) {
      console.error(`Error toggling switch for ${ip}:`, error);
      return false;
    }
  }

  async setLight(ip: string, id: number, brightness: number, on?: boolean): Promise<boolean> {
    try {
      const payload: any = {
        id,
        brightness,
      };

      if (on !== undefined) {
        payload.on = on;
      }

      const response = await fetch(`${this.baseUrl(ip)}/Light.Set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Error setting light for ${ip}:`, error);
      return false;
    }
  }

  async setRGBW(
    ip: string,
    id: number,
    red: number,
    green: number,
    blue: number,
    white: number,
    brightness?: number
  ): Promise<boolean> {
    try {
      const payload: any = {
        id,
        red: Math.max(0, Math.min(255, red)),
        green: Math.max(0, Math.min(255, green)),
        blue: Math.max(0, Math.min(255, blue)),
        white: Math.max(0, Math.min(255, white)),
      };

      if (brightness !== undefined) {
        payload.brightness = Math.max(0, Math.min(100, brightness));
      }

      const response = await fetch(`${this.baseUrl(ip)}/Light.Set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Error setting RGBW for ${ip}:`, error);
      return false;
    }
  }

  async toggleLight(ip: string, id: number): Promise<boolean> {
    try {
      const status = await this.getStatus(ip, 'light', id);
      if (status === null) {
        return false;
      }
      return await this.setLight(ip, id, status.brightness || 100, !status.output);
    } catch (error) {
      console.error(`Error toggling light for ${ip}:`, error);
      return false;
    }
  }
}

