const fs = require('fs');
const path = require('path');

// Copy property inspector files to dist
const srcDir = path.join(__dirname, '../src/property-inspector');
const distDir = path.join(__dirname, '../dist/property-inspector');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

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

if (fs.existsSync(srcDir)) {
  copyRecursive(srcDir, distDir);
  console.log('Property inspector files copied to dist/');
}

