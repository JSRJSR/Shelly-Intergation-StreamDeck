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
const propertyInspectorDir = path.join(__dirname, '../dist/property-inspector');

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

// Copy compiled plugin.js to bin/
if (fs.existsSync(pluginJsPath)) {
  fs.copyFileSync(pluginJsPath, path.join(binDir, 'plugin.js'));
  console.log('✓ plugin.js copied to bin/');
} else {
  console.error('Error: dist/plugin.js not found! Run "npm run build" first.');
  process.exit(1);
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
