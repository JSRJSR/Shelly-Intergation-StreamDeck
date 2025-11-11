const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

// Map of icon files to Material Icon names
const iconMap = {
  'assets/icon.png': 'power', // Main plugin icon
  'assets/actions/on.png': 'power',
  'assets/actions/off.png': 'power_off',
  'assets/actions/toggle.png': 'toggle_on',
  'assets/actions/toggle-on.png': 'toggle_on',
  'assets/actions/toggle-off.png': 'toggle_off',
  'assets/actions/dimming.png': 'brightness_6',
  'assets/actions/rgbw.png': 'palette',
  'assets/actions/status.png': 'info'
};

// Material Icons GitHub repository (most reliable source)
const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/google/material-design-icons/master';

async function downloadSVG(iconName) {
  return new Promise((resolve, reject) => {
    // Try the Material Symbols path first (newer icons)
    const symbolsUrl = `https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/${iconName}/default/48px.svg`;
    
    https.get(symbolsUrl, (res) => {
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
      } else {
        // Fallback to Material Icons GitHub repo
        const githubUrl = `${GITHUB_BASE_URL}/src/${iconName}/materialicons/24px.svg`;
        https.get(githubUrl, (res) => {
          if (res.statusCode === 200) {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve(data));
          } else {
            // Try alternative path
            const altUrl = `${GITHUB_BASE_URL}/src/${iconName}/materialiconsoutlined/24px.svg`;
            https.get(altUrl, (res) => {
              if (res.statusCode === 200) {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => resolve(data));
              } else {
                reject(new Error(`Failed to download ${iconName}: HTTP ${res.statusCode}`));
              }
            }).on('error', reject);
          }
        }).on('error', reject);
      }
    }).on('error', (err) => {
      // Fallback to GitHub on network error
      const githubUrl = `${GITHUB_BASE_URL}/src/${iconName}/materialicons/24px.svg`;
      https.get(githubUrl, (res) => {
        if (res.statusCode === 200) {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => resolve(data));
        } else {
          reject(err);
        }
      }).on('error', reject);
    });
  });
}

async function convertSVGToPNG(svgBuffer, outputPath, size = 72) {
  try {
    await sharp(Buffer.from(svgBuffer))
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .png()
      .toFile(outputPath);
    console.log(`✓ Created ${outputPath}`);
  } catch (error) {
    console.error(`✗ Failed to create ${outputPath}:`, error.message);
    throw error;
  }
}

async function generateIcons() {
  console.log('Generating icons from Google Material Icons...\n');

  // Ensure assets directories exist
  const assetsDir = path.join(__dirname, '../assets');
  const actionsDir = path.join(assetsDir, 'actions');
  
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  if (!fs.existsSync(actionsDir)) {
    fs.mkdirSync(actionsDir, { recursive: true });
  }

  for (const [outputPath, iconName] of Object.entries(iconMap)) {
    const fullPath = path.join(__dirname, '..', outputPath);
    
    try {
      console.log(`Downloading ${iconName}...`);
      const svg = await downloadSVG(iconName);
      await convertSVGToPNG(svg, fullPath, 72);
    } catch (error) {
      console.error(`Error processing ${outputPath} (${iconName}):`, error.message);
      // Continue with other icons
    }
  }

  console.log('\n✓ Icon generation complete!');
}

// Run the script
generateIcons().catch(console.error);

