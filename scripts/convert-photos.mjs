import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

function convertDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir, {withFileTypes: true}).forEach(f => {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      convertDir(full);
    } else if (/\.(jpg|jpeg|png|jfif)$/i.test(f.name)) {
      const out = full.replace(/\.(jpg|jpeg|png|jfif)$/i, '.webp');
      sharp(full)
        .webp({ quality: 82 })
        .toFile(out)
        .then(() => {
          console.log(`Converted: ${path.basename(full)} -> ${path.basename(out)}`);
          try {
            fs.unlinkSync(full);
            console.log(`Removed original: ${path.basename(full)}`);
          } catch (err) {
            console.error(`Failed to remove original ${full}:`, err.message);
          }
        })
        .catch(err => {
          console.error(`Error converting ${full}:`, err.message);
        });
    }
  });
}

console.log('Starting conversion of event photos to WebP...');
convertDir('./public/events');
