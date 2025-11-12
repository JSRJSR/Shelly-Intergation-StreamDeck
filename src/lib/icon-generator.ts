import * as fs from 'fs';
import * as path from 'path';
import sharp = require('sharp');

/**
 * Generates a colored icon with optional background color
 * @param iconPath Path to the base icon file
 * @param iconColor Hex color for the icon (e.g., "#ffffff")
 * @param backgroundColor Hex color for the background (e.g., "#007bff")
 * @returns Base64 data URI of the generated image
 */
export async function generateColoredIcon(
  iconPath: string,
  iconColor?: string,
  backgroundColor?: string
): Promise<string> {
  try {
    // Resolve icon path relative to plugin root
    // When bundled, __dirname points to bin/, so plugin root is one level up
    const pluginRoot = path.resolve(__dirname, '..');
    // Convert 'assets/actions/...' paths to 'imgs/actions/...' for plugin structure
    const pluginIconPath = iconPath.replace(/^assets\//, 'imgs/');
    const fullIconPath = path.isAbsolute(pluginIconPath) 
      ? pluginIconPath 
      : path.join(pluginRoot, pluginIconPath);

    if (!fs.existsSync(fullIconPath)) {
      // Return original path if icon doesn't exist
      return iconPath;
    }

    const size = 72; // Stream Deck icon size
    let image = sharp(fullIconPath).resize(size, size);

    // Apply icon color tint if specified
    if (iconColor && iconColor !== '#ffffff' && iconColor !== '#FFFFFF') {
      const rgb = hexToRgb(iconColor);
      if (rgb) {
        // Create a tinted version by applying color to the icon
        const iconBuffer = await image.toBuffer();
        // Use tint to apply color to the icon (preserves alpha)
        image = sharp(iconBuffer).tint({ r: rgb.r, g: rgb.g, b: rgb.b });
      }
    }

    // Apply background color if specified
    if (backgroundColor) {
      const bgRgb = hexToRgb(backgroundColor);
      if (bgRgb) {
        const iconBuffer = await image.toBuffer();
        const composite = await sharp({
          create: {
            width: size,
            height: size,
            channels: 4,
            background: { r: bgRgb.r, g: bgRgb.g, b: bgRgb.b, alpha: 1 }
          }
        })
        .composite([{
          input: iconBuffer,
          blend: 'over'
        }])
        .png()
        .toBuffer();
        
        image = sharp(composite);
      }
    }

    // Convert to base64 data URI
    const buffer = await image.png().toBuffer();
    const base64 = buffer.toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Error generating colored icon:', error);
    // Return original path on error
    return iconPath;
  }
}

/**
 * Converts hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Gets the default icon path for an action
 */
export function getActionIconPath(actionUUID: string): string {
  const iconMap: Record<string, string> = {
    'com.shelly.toggle': 'imgs/actions/toggle.png',
    'com.shelly.on': 'imgs/actions/on.png',
    'com.shelly.off': 'imgs/actions/off.png',
    'com.shelly.dimming': 'imgs/actions/dimming.png',
    'com.shelly.rgbw': 'imgs/actions/rgbw.png',
    'com.shelly.status': 'imgs/actions/status.png',
  };
  return iconMap[actionUUID] || 'imgs/icon.png';
}

