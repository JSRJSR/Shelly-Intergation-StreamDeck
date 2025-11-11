# Shelly Stream Deck Plugin

A Stream Deck plugin for controlling Shelly Plus 1 and Shelly Plus RGBW PM devices over your local network.

## Features

- **Toggle Action**: Toggle devices on/off with visual state feedback
- **On/Off Actions**: Separate buttons for turning devices on or off
- **Dimming Control**: Control brightness with dial/encoder support
- **RGBW Color Control**: Full RGBW color control with:
  - HTML5 color picker
  - Individual RGBW sliders (0-255)
  - White channel control
  - Brightness control
  - Preset color buttons
  - Color preview
- **Status Display**: Real-time device status with configurable polling

## Supported Devices

- **Shelly Plus 1**: Basic switch/relay control
- **Shelly Plus RGBW PM**: Full RGBW lighting control with dimming

## Requirements

- Node.js 20 or higher
- Stream Deck software 6.0 or higher
- Shelly devices on the same local network

## Note on Icons

The plugin includes placeholder icon files. You should replace these with actual PNG images (72x72 pixels recommended) for:
- `assets/icon.png` - Main plugin icon
- `assets/actions/*.png` - Action icons

Icons should be PNG format and properly sized for Stream Deck display.

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the plugin:
   ```bash
   npm run build
   ```

3. Package the plugin:
   ```bash
   npm run package
   ```

4. Install the `.streamDeckPlugin` file by double-clicking it or using the Stream Deck software.

## Development

1. Install the Stream Deck CLI globally:
   ```bash
   npm install -g @elgato/cli
   ```

2. Watch for changes during development:
   ```bash
   npm run watch
   ```

3. The plugin will automatically reload when changes are detected.

## Configuration

### Device Setup

1. Add a Shelly action to your Stream Deck
2. Open the property inspector (gear icon)
3. Enter your device's IP address
4. Select the device type (Shelly Plus 1 or Shelly Plus RGBW PM)
5. Configure component ID (default: 0)
6. Test the connection using the "Test Connection" button

### RGBW Color Control

For RGBW devices, use the dedicated RGBW Color action:

1. Configure device IP and component ID
2. Use the HTML5 color picker or RGBW sliders to select colors
3. Adjust brightness as needed
4. Click "Apply Color" to send to device
5. Use preset colors for quick selection

## API Reference

The plugin uses the Shelly Gen2 RPC API:

- **Switch Control**: `http://<device_ip>/rpc/Switch.Set`
- **Light Control**: `http://<device_ip>/rpc/Light.Set`
- **Status**: `http://<device_ip>/rpc/<Component>.GetStatus`

## Troubleshooting

- **Device not responding**: Ensure the device is on the same network and IP address is correct
- **Connection failed**: Check firewall settings and device accessibility
- **Status not updating**: Verify polling interval settings and network connectivity

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

