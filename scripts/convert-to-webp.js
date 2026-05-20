const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '../public');

async function convertDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await convertDir(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
        const baseName = path.basename(entry.name, ext);
        const webpPath = path.join(dir, `${baseName}.webp`);
        try {
          await sharp(fullPath)
            .webp({ quality: 85 })
            .toFile(webpPath);
          console.log(`Converted: ${entry.name} -> ${baseName}.webp`);
        } catch (err) {
          console.error(`Error converting ${entry.name}:`, err);
        }
      }
    }
  }
}

async function main() {
  console.log('Starting WebP conversion recursively for public/ directory...');
  await convertDir(publicDir);
  console.log('Conversion complete successfully!');
}

main().catch(console.error);
