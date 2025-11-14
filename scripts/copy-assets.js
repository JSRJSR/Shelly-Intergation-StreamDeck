const fs = require('fs');
const path = require('path');

// Stream Deck plugin folder structure
const pluginFolder = path.join(__dirname, '../com.shelly.sdPlugin');
const binDir = path.join(pluginFolder, 'bin');
const imgsDir = path.join(pluginFolder, 'imgs');
const uiDir = path.join(pluginFolder, 'ui');

// Source directories
const manifestPath = path.join(__dirname, '../manifest.json');
const pluginJsPath = path.join(__dirname, '../dist/plugin.js');
const assetsDir = path.join(__dirname, '../assets');
const propertyInspectorDir = path.join(__dirname, '../src/property-inspector');

// Create plugin folder structure
[pluginFolder, binDir, imgsDir, uiDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  if (!exists) {
    console.warn(`Warning: Source path does not exist: ${src}`);
    return;
  }
  
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy manifest.json
if (fs.existsSync(manifestPath)) {
  fs.copyFileSync(manifestPath, path.join(pluginFolder, 'manifest.json'));
  console.log('✓ manifest.json copied');
} else {
  console.error('Error: manifest.json not found!');
  process.exit(1);
}

// Copy bundled plugin.js to bin/
const bundledPluginPath = path.join(__dirname, '../dist/plugin.bundle.js');
if (fs.existsSync(bundledPluginPath)) {
  fs.copyFileSync(bundledPluginPath, path.join(binDir, 'plugin.js'));
  console.log('✓ Bundled plugin.js copied to bin/');
} else {
  console.error('Error: dist/plugin.bundle.js not found! Run "npm run build" first.');
  process.exit(1);
}

// Copy manifest.json to bin/ as well (Stream Deck SDK may look for it there)
if (fs.existsSync(manifestPath)) {
  fs.copyFileSync(manifestPath, path.join(binDir, 'manifest.json'));
  console.log('✓ manifest.json copied to bin/ (for SDK manifest lookup)');
}

// Copy source map if it exists
const sourceMapPath = path.join(__dirname, '../dist/plugin.bundle.js.map');
if (fs.existsSync(sourceMapPath)) {
  fs.copyFileSync(sourceMapPath, path.join(binDir, 'plugin.js.map'));
  console.log('✓ Source map copied to bin/');
}

// Clean up old unbundled files if they exist (no longer needed)
const oldLibDir = path.join(binDir, 'lib');
const oldActionsDir = path.join(binDir, 'actions');
const oldTypesFile = path.join(binDir, 'types.js');
if (fs.existsSync(oldLibDir)) {
  fs.rmSync(oldLibDir, { recursive: true, force: true });
  console.log('✓ Removed old lib/ folder (now bundled)');
}
if (fs.existsSync(oldActionsDir)) {
  fs.rmSync(oldActionsDir, { recursive: true, force: true });
  console.log('✓ Removed old actions/ folder (now bundled)');
}
if (fs.existsSync(oldTypesFile)) {
  fs.unlinkSync(oldTypesFile);
  console.log('✓ Removed old types.js (now bundled)');
}

// Copy sharp and its dependencies to bin/node_modules/
// Sharp is a native module that can't be bundled, so we need to include it
const sharpModulePath = path.join(__dirname, '../node_modules/sharp');
const binNodeModulesDir = path.join(binDir, 'node_modules');
if (fs.existsSync(sharpModulePath)) {
  if (!fs.existsSync(binNodeModulesDir)) {
    fs.mkdirSync(binNodeModulesDir, { recursive: true });
  }
  const binSharpPath = path.join(binNodeModulesDir, 'sharp');
  copyRecursive(sharpModulePath, binSharpPath);
  console.log('✓ sharp module copied to bin/node_modules/');
  
  // Also copy sharp's native bindings if they exist in a parent node_modules
  // This handles the case where sharp's binaries are in node_modules/.bin or platform-specific folders
  const sharpLibPath = path.join(__dirname, '../node_modules/@img');
  if (fs.existsSync(sharpLibPath)) {
    const binImgPath = path.join(binNodeModulesDir, '@img');
    copyRecursive(sharpLibPath, binImgPath);
    console.log('✓ sharp native bindings copied');
  }
} else {
  console.warn('Warning: sharp not found in node_modules - icon generation may not work');
}

// Copy assets to imgs/
if (fs.existsSync(assetsDir)) {
  copyRecursive(assetsDir, imgsDir);
  console.log('✓ Assets copied to imgs/');
} else {
  console.warn('Warning: assets/ directory not found');
}

// Copy property inspector files to ui/
if (fs.existsSync(propertyInspectorDir)) {
  copyRecursive(propertyInspectorDir, uiDir);
  console.log('✓ Property inspector files copied to ui/');
} else {
  console.warn('Warning: Property inspector files not found in dist/');
}

console.log(`\n✓ Plugin structure created at: ${pluginFolder}`);
