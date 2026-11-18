// Sinh icon PWA + ảnh tối ưu từ assets-src/. Chạy: npm run icons
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

mkdirSync('public/icons', { recursive: true })
mkdirSync('public/images', { recursive: true })
const logo = 'assets-src/logo.png'
const BG = '#4a2b1b'

for (const s of [48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512]) {
  await sharp(logo).resize(s, s).png({ compressionLevel: 9 }).toFile(`public/icons/icon-${s}.png`)
}
// maskable: logo thu về 78% trên nền nâu để không bị cắt ở vùng an toàn
const inner = await sharp(logo).resize(400, 400).toBuffer()
await sharp({ create: { width: 512, height: 512, channels: 4, background: BG } })
  .composite([{ input: inner, gravity: 'center' }])
  .png().toFile('public/icons/maskable-512.png')
await sharp(logo).resize(180, 180).png().toFile('public/icons/apple-touch-icon.png')
await sharp(logo).resize(64, 64).png().toFile('public/favicon.png')
await sharp(logo).resize(160, 160).png().toFile('public/images/logo-160.png')
await sharp('assets-src/floorplan-6.png').resize({ width: 2000 }).webp({ quality: 80 }).toFile('public/images/floorplan.webp')
console.log('done')
