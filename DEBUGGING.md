# Debugging Guide for Stream Deck Plugin

## Stream Deck Plugin Logs Location

### Windows
The Stream Deck plugin logs are located at:
```
%APPDATA%\Elgato\StreamDeck\logs\
```

Full path example:
```
C:\Users\YourUsername\AppData\Roaming\Elgato\StreamDeck\logs\
```

### macOS
```
~/Library/Logs/StreamDeck/
```

## How to View Logs

1. **Open the logs folder** using the path above
2. **Look for files** named like:
   - `com.shelly.log` - Main plugin log
   - `com.shelly-YYYY-MM-DD.log` - Date-specific logs
   - `com.shelly.test-gen1-light.log` - Test action specific log (if separate)

3. **View in real-time**:
   - Open PowerShell (Windows) or Terminal (macOS)
   - Navigate to the logs folder
   - Run: `Get-Content com.shelly.log -Wait` (PowerShell) or `tail -f com.shelly.log` (macOS)

## Test Action Debugging

The test action (`Test Gen1 Switch`) now includes comprehensive logging. Look for log entries prefixed with `[TestGen1LightAction]`:

- `[TestGen1LightAction] Initialized` - Action was created
- `[TestGen1LightAction] onWillAppear` - Button appeared on Stream Deck
- `[TestGen1LightAction] onKeyDown` - Button was pressed
- `[TestGen1LightAction] toggleDevice` - Toggle command sent
- `[TestGen1LightAction] updateButtonState` - Status check performed
- `[TestGen1LightAction] Error` - Any errors encountered

## Common Issues

### Device Not Responding
- Check if IP address `192.168.77.4` is correct
- Verify device is on the same network
- Try accessing `http://192.168.77.4` in a browser
- Check firewall settings

### Connection Errors
- Look for `Error getting status` or `Error toggling switch` in logs
- Verify Gen1 API endpoint: `http://192.168.77.4/relay/0?turn=toggle`
- Test manually with curl:
  ```bash
  curl "http://192.168.77.4/relay/0?turn=toggle"
  ```

### Status Not Updating
- Check polling interval logs
- Verify `getStatus` calls are succeeding
- Check if device returns valid JSON

## Manual API Testing

Test the Gen1 API directly:

**Get Status:**
```bash
curl http://192.168.77.4/relay/0
```

**Toggle:**
```bash
curl "http://192.168.77.4/relay/0?turn=toggle"
```

**Turn On:**
```bash
curl "http://192.168.77.4/relay/0?turn=on"
```

**Turn Off:**
```bash
curl "http://192.168.77.4/relay/0?turn=off"
```

## Enabling More Verbose Logging

The plugin uses `console.log()` and `console.error()` which are captured by Stream Deck. To see more details:

1. Rebuild the plugin: `npm run build`
2. Restart Stream Deck: `streamdeck restart com.shelly`
3. Check the logs immediately after using the test action

## Stream Deck CLI Commands

Useful commands for debugging:

```bash
# Restart the plugin
streamdeck restart com.shelly

# View plugin info
streamdeck info com.shelly

# Unlink and relink for fresh start
streamdeck unlink com.shelly
streamdeck link com.shelly.sdPlugin
streamdeck restart com.shelly
```

