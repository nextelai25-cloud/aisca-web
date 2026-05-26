import fs from 'fs'
import path from 'path'

const eventFolders = {
  'cawalk': 'cawalk-2025',
  'legacy25': 'legacy-night-2025', 
  'giftasmile': 'gift-a-smile',
  'shoreline': 'shoreline-2025',
  'boardlunch': 'board-getogether',
  'legacy26': 'legacy-night-2026',
  'forum': 'aisca-forum-inaugural'
}

const result = {}

for (const [folder, slug] of Object.entries(eventFolders)) {
  const dir = `./public/events/${folder}`
  if (!fs.existsSync(dir)) { console.log('Missing:', dir); continue; }
  
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.webp'))
    .map(f => `/events/${folder}/${f}`)
  
  result[slug] = {
    coverPhoto: files[0] || null,
    photos: files,
    count: files.length
  }
  console.log(`${slug}: ${files.length} photos, cover: ${files[0]}`)
}

// Write to a JSON file for reference
const dataDir = './src/data'
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}
fs.writeFileSync('./src/data/event-photos.json', JSON.stringify(result, null, 2))
console.log('\nWritten to src/data/event-photos.json')
