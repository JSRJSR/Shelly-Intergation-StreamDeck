import { ToggleActionSettings } from '../types';
import { getActionIconPath } from './icon-generator';

/**
 * Helper function to update button icon
 * @param action The action instance (has setImage method)
 * @param actionUUID The UUID of the action
 * @param settings The action settings
 * @param state Optional state index for multi-state actions
 */
export async function updateButtonIcon(
  action: any,
  actionUUID: string,
  settings: ToggleActionSettings,
  state?: number
): Promise<void> {
  try {
    const iconPath = getActionIconPath(actionUUID);
    
    // For toggle action, use state-specific icons
    if (actionUUID === 'com.shelly.toggle' && state !== undefined) {
      const stateIcons = [
        'imgs/actions/toggle-off.png',
        'imgs/actions/toggle-on.png'
      ];
      if (stateIcons[state] && action.setImage) {
        await action.setImage(stateIcons[state], state);
      }
    } else {
      // For single-state actions
      if (action.setImage) {
        await action.setImage(iconPath);
      }
    }
  } catch (error) {
    console.error('Error updating button icon:', error);
    // Silently fail - use default icon
  }
}

