export const DEVICE_TYPES = {
  SHELLY_PLUS_1: 'shelly-plus-1',
  SHELLY_PLUS_RGBW_PM: 'shelly-plus-rgbw-pm',
} as const;

export function detectDeviceType(ip: string): Promise<'shelly-plus-1' | 'shelly-plus-rgbw-pm' | null> {
  // Try to get device info from Shelly API
  return fetch(`http://${ip}/rpc/Shelly.GetDeviceInfo`)
    .then(response => response.json())
    .then((data: any) => {
      const model = data?.model || '';
      if (model.includes('Plus1')) {
        return 'shelly-plus-1';
      } else if (model.includes('PlusRGBWPM')) {
        return 'shelly-plus-rgbw-pm';
      }
      return null;
    })
    .catch(() => null);
}

export function getDefaultComponent(deviceType: string, componentId: number = 0): { type: 'switch' | 'light'; id: number } {
  if (deviceType === DEVICE_TYPES.SHELLY_PLUS_1) {
    return { type: 'switch', id: componentId };
  } else if (deviceType === DEVICE_TYPES.SHELLY_PLUS_RGBW_PM) {
    return { type: 'light', id: componentId };
  }
  return { type: 'switch', id: componentId };
}

