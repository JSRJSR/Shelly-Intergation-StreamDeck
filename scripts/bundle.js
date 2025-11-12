const esbuild = require('esbuild');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

esbuild.build({
  entryPoints: [path.join(__dirname, '../src/plugin.ts')],
  bundle: true,
  outfile: path.join(__dirname, '../dist/plugin.bundle.js'),
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  sourcemap: !isProduction,
  minify: isProduction,
  external: [
    // Node.js built-ins (available in Stream Deck runtime)
    'fs',
    'path',
    'http',
    'https',
    'url',
    'util',
    'stream',
    'buffer',
    'crypto',
    'os',
    'events',
    // Native modules that can't be bundled - must be copied separately
    'sharp',
  ],
  logLevel: 'info',
}).then(() => {
  console.log('✓ Plugin bundled successfully');
}).catch((error) => {
  console.error('✗ Bundling failed:', error);
  process.exit(1);
});

