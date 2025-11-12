const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const pluginFolder = path.join(__dirname, '../com.shelly.sdPlugin');
const outputPath = path.join(__dirname, '../com.shelly.streamDeckPlugin');

// Check if plugin folder exists
if (!fs.existsSync(pluginFolder)) {
  console.error('Error: Plugin folder not found! Run "npm run build" first.');
  process.exit(1);
}

// Remove existing package if it exists
if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath);
  console.log('✓ Removed existing package');
}

// Create a file to stream archive data to
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', () => {
  const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`✓ Plugin packaged successfully: ${path.basename(outputPath)}`);
  console.log(`  Size: ${sizeInMB} MB`);
});

// Catch warnings and errors
archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

archive.on('error', (err) => {
  console.error('Error packaging plugin:', err);
  process.exit(1);
});

// Pipe archive data to the file
archive.pipe(output);

// Add the entire plugin folder to the archive
archive.directory(pluginFolder, false);

// Finalize the archive
archive.finalize();

