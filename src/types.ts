// Simplified settings for Toggle Action
export interface ToggleActionSettings {
  ipAddress: string;           // Device IP (e.g., "192.168.1.100")
  deviceGeneration?: 'gen1' | 'gen2' | 'auto'; // Auto-detect or manual (default: 'auto')
  deviceType?: string;          // Optional: Device model (auto-detected if not set)
  componentId: number;         // Component/Relay ID (default: 0, range: 0-3)
  pollingInterval: number;     // Status polling interval in ms (default: 5000, min: 1000)
  // Optional customizations:
  buttonTitle?: string;        // Custom button title (shown instead of status if set)
  showStatus: boolean;         // Show ON/OFF text on button (default: true)
  onStateImage?: string;       // Custom image path for ON state (optional)
  offStateImage?: string;      // Custom image path for OFF state (optional)
  // Index signature to satisfy JsonObject constraint
  [key: string]: any;
}

// Legacy interface for backward compatibility (will be removed)
export interface ActionSettings extends ToggleActionSettings {
  devices?: any[]; // Deprecated - use ipAddress directly
}

// Minimal interface for StatusPoller (not used by Toggle action)
export interface DeviceConfig {
  ip: string;
  deviceType?: string;
  componentId?: number;
  componentType?: 'switch' | 'light';
}

export interface ShellyStatus {
  id: number;
  source: string;
  output: boolean;
  // Light specific
  brightness?: number;
  red?: number;
  green?: number;
  blue?: number;
  white?: number;
  // Index signature to satisfy JsonObject constraint
  [key: string]: any;
}

