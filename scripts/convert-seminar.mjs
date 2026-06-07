import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = './public/events/seminar';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
  console.log(`Created directory: ${outDir}`);
}

const images = [
  { src: "C:\\Users\\Logistics\\Downloads\\seminar images\\main image.jfif", dest: "main-image.webp" },
  { src: "C:\\Users\\Logistics\\Downloads\\seminar images\\WhatsApp Image 2026-06-06 at 20.31.41.jpeg", dest: "photo1.webp" },
  { src: "C:\\Users\\Logistics\\Downloads\\seminar images\\WhatsApp Image 2026-06-06 at 19.36.46.jpeg", dest: "photo2.webp" },
  { src: "C:\\Users\\Logistics\\Downloads\\seminar images\\WhatsApp Image 2026-06-06 at 19.36.17.jpeg", dest: "photo3.webp" },
  { src: "C:\\Users\\Logistics\\Downloads\\seminar images\\WhatsApp Image 2026-06-06 at 19.36.21.jpeg", dest: "photo4.webp" }
];

async function convert() {
  for (const img of images) {
    const destPath = path.join(outDir, img.dest);
    try {
      await sharp(img.src)
        .webp({ quality: 82 })
        .toFile(destPath);
      console.log(`Successfully converted: ${img.src} -> ${destPath}`);
    } catch (err) {
      console.error(`Error converting ${img.src}:`, err.message);
      process.exit(1);
    }
  }
  console.log("All images successfully converted to WebP.");
}

convert();
