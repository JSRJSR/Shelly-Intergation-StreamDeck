# Troubleshooting Guide - Plugin Not Connecting

## Current Issue
The plugin shows "has no attached client" warning, meaning Stream Deck launches the plugin process but it doesn't connect back.

## Symptoms
- ✅ Action appears in Stream Deck (Property Inspector opens)
- ✅ Manifest.json is valid and readable
- ❌ Plugin process doesn't connect (no logs from plugin)
- ❌ Warning: "The plugin 'com.shelly' has no attached client"

## Diagnostic Steps

### 1. Check Plugin Process Logs
Plugin logs should be in:
- `com.shelly.sdPlugin/bin/logs/bin.*.log` - Plugin process logs
- `%APPDATA%\Elgato\StreamDeck\logs\StreamDeck.log` - Stream Deck main logs

### 2. Verify Plugin File
```powershell
cd "D:\Documents\_Files\_Code\GitHub\Shelly-Intergation-StreamDeck"
Test-Path "com.shelly.sdPlugin\bin\plugin.js"
Get-Item "com.shelly.sdPlugin\bin\plugin.js" | Select-Object Length, LastWriteTime
```

### 3. Check Node.js Path
Stream Deck needs to find Node.js. Verify:
```powershell
where.exe node
```

### 4. Test Plugin Manually (with Stream Deck args)
Stream Deck passes these arguments:
- `-port <number>` - Port to connect to
- `-pluginUUID <uuid>` - Plugin UUID
- `-registerEvent <event>` - Registration event name
- `-info <json>` - Plugin info JSON

### 5. Check SDK Version Compatibility
Current installed: `2.0.0-dev.202510211650`
Package.json specifies: `^2.0.0-beta.1`

This version mismatch might cause issues.

## Possible Solutions

### Solution 1: Reinstall SDK
```bash
npm uninstall @elgato/streamdeck
npm install @elgato/streamdeck@^2.0.0-beta.1
npm run build
```

### Solution 2: Check Plugin Location
Ensure the plugin is linked correctly:
```bash
streamdeck unlink com.shelly
streamdeck link com.shelly.sdPlugin
streamdeck restart com.shelly
```

### Solution 3: Verify Manifest Path
The SDK needs to find manifest.json. It's currently in:
- `com.shelly.sdPlugin/manifest.json` ✅
- `com.shelly.sdPlugin/bin/manifest.json` ✅

### Solution 4: Check for Syntax Errors
```bash
node com.shelly.sdPlugin/bin/plugin.js
```
(Will fail without Stream Deck args, but should show syntax errors)

### Solution 5: Enable Stream Deck Developer Mode
```bash
streamdeck dev
```
This enables more verbose logging and debugging.

## Official Resources

1. **Stream Deck SDK Documentation**
   - https://docs.elgato.com/streamdeck/sdk/introduction/getting-started
   - https://docs.elgato.com/streamdeck/sdk/guides/logging

2. **Official Examples**
   - https://github.com/elgatosf/streamdeck

3. **Community Support**
   - Elgato Maker Discord: https://help.elgato.com/hc/en-us/articles/360028243711

## Next Steps

1. Check if plugin logs are being created in `bin/logs/`
2. Try enabling developer mode: `streamdeck dev`
3. Check Windows Event Viewer for Node.js errors
4. Verify Node.js is in PATH when Stream Deck launches
5. Compare with official SDK examples structure

## Log Locations Summary

- **Stream Deck Main Logs**: `%APPDATA%\Elgato\StreamDeck\logs\StreamDeck.log`
- **Plugin Process Logs**: `com.shelly.sdPlugin/bin/logs/bin.*.log`
- **Plugin Logs (if created)**: `%APPDATA%\Elgato\StreamDeck\Plugins\com.shelly.sdPlugin\logs\*.log`

