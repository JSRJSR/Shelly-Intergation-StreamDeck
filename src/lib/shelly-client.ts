import { ShellyStatus } from '../types';

export type DeviceGeneration = 'gen1' | 'gen2';

export class ShellyClient {
  private baseUrl(ip: string): string {
    return `http://${ip}`;
  }

  private rpcUrl(ip: string): string {
    return `http://${ip}/rpc`;
  }

  /**
   * Detect device generation by querying device info
   */
  async detectGeneration(ip: string): Promise<DeviceGeneration | null> {
    try {
      // Try Gen2 RPC endpoint first
      const gen2Response = await fetch(`${this.rpcUrl(ip)}/Shelly.GetDeviceInfo`);
      if (gen2Response.ok) {
        return 'gen2';
      }
      
      // Try Gen1 endpoint
      const gen1Response = await fetch(`${this.baseUrl(ip)}/shelly`);
      if (gen1Response.ok) {
        return 'gen1';
      }
      
      return null;
    } catch (error) {
      console.error(`Error detecting generation for ${ip}:`, error);
      return null;
    }
  }

  async getStatus(ip: string, component: 'switch' | 'light', id: number = 0, generation?: DeviceGeneration): Promise<ShellyStatus | null> {
    try {
      const gen = generation || await this.detectGeneration(ip);
      console.log(`[ShellyClient] getStatus - IP: ${ip}, Component: ${component}, ID: ${id}, Generation: ${gen}`);
      
      if (gen === 'gen1') {
        // Gen1: GET /relay/{id}
        const url = `${this.baseUrl(ip)}/relay/${id}`;
        console.log(`[ShellyClient] Gen1 status URL: ${url}`);
        const response = await fetch(url);
        console.log(`[ShellyClient] Gen1 status response status: ${response.status}, ok: ${response.ok}`);
        if (!response.ok) {
          const text = await response.text();
          console.error(`[ShellyClient] Gen1 status failed - Status: ${response.status}, Body: ${text}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: any = await response.json();
        console.log(`[ShellyClient] Gen1 status data:`, JSON.stringify(data));
        const status = {
          id,
          source: 'gen1',
          output: data.ison === true,
        } as ShellyStatus;
        console.log(`[ShellyClient] Parsed Gen1 status - output: ${status.output}`);
        return status;
      } else if (gen === 'gen2') {
        // Gen2: GET /rpc/Switch.GetStatus?id={id} or Light.GetStatus?id={id}
        const componentName = component === 'switch' ? 'Switch' : 'Light';
        const url = `${this.rpcUrl(ip)}/${componentName}.GetStatus?id=${id}`;
        console.log(`[ShellyClient] Gen2 status URL: ${url}`);
        const response = await fetch(url);
        
        if (!response.ok) {
          const text = await response.text();
          console.error(`[ShellyClient] Gen2 status failed - Status: ${response.status}, Body: ${text}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`[ShellyClient] Gen2 status data:`, JSON.stringify(data));
        return data as ShellyStatus;
      }
      
      console.error(`[ShellyClient] getStatus failed - Unknown generation: ${gen}`);
      return null;
    } catch (error) {
      console.error(`[ShellyClient] Error getting status for ${ip}:`, error);
      return null;
    }
  }

  async setSwitch(ip: string, id: number, on: boolean, generation?: DeviceGeneration): Promise<boolean> {
    try {
      const gen = generation || await this.detectGeneration(ip);
      
      if (gen === 'gen1') {
        // Gen1: GET /relay/{id}?turn=on|off
        const turn = on ? 'on' : 'off';
        const response = await fetch(`${this.baseUrl(ip)}/relay/${id}?turn=${turn}`);
        return response.ok;
      } else if (gen === 'gen2') {
        // Gen2: POST /rpc/Switch.Set
        const response = await fetch(`${this.rpcUrl(ip)}/Switch.Set`, {
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

        const data: any = await response.json();
        return data?.output === on;
      }
      
      return false;
    } catch (error) {
      console.error(`Error setting switch for ${ip}:`, error);
      return false;
    }
  }

  async toggleSwitch(ip: string, id: number, generation?: DeviceGeneration): Promise<boolean> {
    try {
      const gen = generation || await this.detectGeneration(ip);
      console.log(`[ShellyClient] toggleSwitch - IP: ${ip}, ID: ${id}, Generation: ${gen}`);
      
      if (gen === 'gen1') {
        // Gen1: GET /relay/{id}?turn=toggle
        const url = `${this.baseUrl(ip)}/relay/${id}?turn=toggle`;
        console.log(`[ShellyClient] Gen1 toggle URL: ${url}`);
        const response = await fetch(url);
        console.log(`[ShellyClient] Gen1 toggle response status: ${response.status}, ok: ${response.ok}`);
        if (!response.ok) {
          const text = await response.text();
          console.error(`[ShellyClient] Gen1 toggle failed - Status: ${response.status}, Body: ${text}`);
        }
        return response.ok;
      } else if (gen === 'gen2') {
        // Gen2: Get status then set opposite
        const status = await this.getStatus(ip, 'switch', id, gen);
        if (status === null) {
          console.error(`[ShellyClient] Gen2 toggle failed - Could not get status`);
          return false;
        }
        return await this.setSwitch(ip, id, !status.output, gen);
      }
      
      console.error(`[ShellyClient] toggleSwitch failed - Unknown generation: ${gen}`);
      return false;
    } catch (error) {
      console.error(`[ShellyClient] Error toggling switch for ${ip}:`, error);
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

