export interface DeviceConfig {
  ip: string;
  deviceType: 'shelly-plus-1' | 'shelly-plus-rgbw-pm';
  componentId?: number;
  componentType?: 'switch' | 'light';
}

export interface RGBWColor {
  red: number;
  green: number;
  blue: number;
  white: number;
  brightness?: number;
}

export interface ActionSettings {
  devices: DeviceConfig[];
  // RGBW specific settings
  rgbwColor?: RGBWColor;
  presetColors?: RGBWColor[];
  // Dimming settings
  brightness?: number;
  // Status settings
  pollingInterval?: number;
  // Visual customization
  iconColor?: string; // Hex color for icon (e.g., "#ffffff")
  backgroundColor?: string; // Hex color for background (e.g., "#007bff")
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
}

