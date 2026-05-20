const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

async function createOgImage() {
  const width = 1200
  const height = 630

  // Construct SVG representing the brand graphic layout
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#080808" />
      
      <!-- Top Gold accent border gradient -->
      <rect width="100%" height="10" fill="#d4af37" />
      
      <!-- Subtle watermark logo in background -->
      <text x="600" y="340" font-family="system-ui, sans-serif" font-size="180" font-weight="900" fill="rgba(255,255,255,0.015)" text-anchor="middle" letter-spacing="15">AISCA</text>
      
      <!-- Main Centered AISCA Header -->
      <text x="600" y="290" font-family="system-ui, sans-serif" font-size="104" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="8">AISCA</text>
      
      <!-- Accent Divider line -->
      <line x1="450" y1="340" x2="750" y2="340" stroke="#d4af37" stroke-width="2" opacity="0.6" />
      
      <!-- Official Subtitle description -->
      <text x="600" y="390" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="#d4af37" letter-spacing="5" text-anchor="middle">ALL ISLAND SCHOOLS COMMERCE ASSOCIATION</text>
      
      <text x="600" y="440" font-family="system-ui, sans-serif" font-size="14" font-weight="300" fill="rgba(255,255,255,0.3)" letter-spacing="2" text-anchor="middle">THE NATIONAL STUDENT COMMERCE MOVEMENT</text>
    </svg>
  `

  const publicDir = path.join(__dirname, '..', 'public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  const outputPath = path.join(publicDir, 'og-image.jpg')

  try {
    await sharp(Buffer.from(svg))
      .jpeg({ quality: 95 })
      .toFile(outputPath)
    
    console.log(`✓ OG Image successfully generated and saved to: ${outputPath}`)
  } catch (err) {
    console.error('Error generating OG image with sharp:', err)
  }
}

createOgImage()
