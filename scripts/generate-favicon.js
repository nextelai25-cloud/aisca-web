const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

async function generateFavicon() {
  const publicDir = path.join(__dirname, '..', 'public')
  const logoPath = path.join(publicDir, 'aisca-logo.png')
  const appDir = path.join(__dirname, '..', 'src', 'app')
  const outputPath = path.join(appDir, 'favicon.ico')

  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true })
  }

  if (fs.existsSync(logoPath)) {
    console.log(`Logo found at: ${logoPath}. Resizing and converting to favicon...`)
    try {
      await sharp(logoPath)
        .resize(32, 32)
        .png()
        .toFile(outputPath)
      console.log(`✓ Favicon successfully converted and saved to: ${outputPath}`)
    } catch (err) {
      console.error('Error converting logo to favicon:', err)
      createFallback(outputPath)
    }
  } else {
    console.log('No logo found. Creating a text-based fallback favicon with "A" on black background...')
    createFallback(outputPath)
  }
}

async function createFallback(outputPath) {
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#000000" />
      <text x="16" y="22" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#d4af37" text-anchor="middle">A</text>
    </svg>
  `
  try {
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath)
    console.log(`✓ Fallback text-based favicon saved to: ${outputPath}`)
  } catch (err) {
    console.error('Error creating fallback favicon:', err)
  }
}

generateFavicon()
