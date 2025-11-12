import { ActionSettings } from '../types';
import { generateColoredIcon, getActionIconPath } from './icon-generator';

/**
 * Helper function to update button icon with custom colors
 * @param action The action instance (has setImage method)
 * @param actionUUID The UUID of the action
 * @param settings The action settings containing iconColor and backgroundColor
 * @param state Optional state index for multi-state actions
 */
export async function updateButtonIcon(
  action: any,
  actionUUID: string,
  settings: ActionSettings,
  state?: number
): Promise<void> {
  try {
    // Only update if colors are specified
    if (!settings.iconColor && !settings.backgroundColor) {
      return;
    }

    const iconPath = getActionIconPath(actionUUID);
    
    // For toggle action, use state-specific icons
    if (actionUUID === 'com.shelly.toggle' && state !== undefined) {
      const stateIcons = [
        'imgs/actions/toggle-off.png',
        'imgs/actions/toggle-on.png'
      ];
      if (stateIcons[state]) {
        const coloredIcon = await generateColoredIcon(
          stateIcons[state],
          settings.iconColor,
          settings.backgroundColor
        );
        if (action.setImage) {
          await action.setImage(coloredIcon, state);
        }
      }
    } else {
      // For single-state actions
      const coloredIcon = await generateColoredIcon(
        iconPath,
        settings.iconColor,
        settings.backgroundColor
      );
      if (action.setImage) {
        await action.setImage(coloredIcon);
      }
    }
  } catch (error) {
    console.error('Error updating button icon:', error);
    // Silently fail - use default icon
  }
}

