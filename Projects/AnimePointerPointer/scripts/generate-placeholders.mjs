import { writeFileSync } from 'fs'
import { join } from 'path'

const TOTAL = 100
const WIDTH = 400
const HEIGHT = 400

const animeColors = [
  { bg: '#1a0a2e', skin: '#fce4d6', hair: '#ff6b9d', shirt: '#4a90d9', name: 'Sakura' },
  { bg: '#0a1e3d', skin: '#f5d0b0', hair: '#ffd700', shirt: '#e74c3c', name: 'Naruto' },
  { bg: '#2d1b69', skin: '#fce4d6', hair: '#333', shirt: '#9b59b6', name: 'Sasuke' },
  { bg: '#1b3a2d', skin: '#f5d0b0', hair: '#ff4444', shirt: '#2ecc71', name: 'Asuka' },
  { bg: '#3d1b1b', skin: '#fce4d6', hair: '#fff', shirt: '#e91e63', name: 'Homura' },
  { bg: '#1b2d3d', skin: '#f5d0b0', hair: '#ff8c00', shirt: '#00bcd4', name: 'Rei' },
  { bg: '#2e1a3e', skin: '#fce4d6', hair: '#8b5cf6', shirt: '#ff6b6b', name: 'Rem' },
  { bg: '#3e2e1a', skin: '#f5d0b0', hair: '#e91e63', shirt: '#ff9800', name: 'Miku' },
  { bg: '#0a2e2e', skin: '#fce4d6', hair: '#00e5ff', shirt: '#673ab7', name: 'Kanade' },
  { bg: '#2e0a1a', skin: '#f5d0b0', hair: '#c62828', shirt: '#ffc107', name: 'Makise' },
]

function generatePosition() {
  return [
    Math.round((Math.random() * 0.9 + 0.05) * 1000) / 1000,
    Math.round((Math.random() * 0.9 + 0.05) * 1000) / 1000,
  ]
}

function angleToTarget(fingerX, fingerY, targetX, targetY) {
  return Math.atan2(targetY - fingerY, targetX - fingerX)
}

function generateSVG(index, fingerX, fingerY, colorSet) {
  const angle = angleToTarget(fingerX, fingerY, 0.5, 0.5)
  const headX = 200
  const headY = 120
  const bodyTopY = 170
  const bodyBottomY = 360
  const shoulderWidth = 60

  const armEndX = fingerX * WIDTH
  const armEndY = fingerY * HEIGHT
  const elbowX = (headX + armEndX) / 2 + Math.sin(angle) * 20
  const elbowY = bodyTopY + 50

  const hairStyle = index % 3

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <radialGradient id="bg${index}" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${colorSet.bg}" stop-opacity="1"/>
      <stop offset="100%" stop-color="#000" stop-opacity="1"/>
    </radialGradient>
    <filter id="glow${index}">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg${index})"/>
  <circle cx="${WIDTH/2}" cy="${HEIGHT/2}" r="180" fill="none" stroke="${colorSet.hair}" stroke-opacity="0.1" stroke-width="2"/>
  <circle cx="${WIDTH/2}" cy="${HEIGHT/2}" r="140" fill="none" stroke="${colorSet.hair}" stroke-opacity="0.08" stroke-width="1"/>

  <!-- Body -->
  <path d="M${headX - shoulderWidth},${bodyTopY + 40} Q${headX},${bodyTopY + 30} ${headX + shoulderWidth},${bodyTopY + 40} L${headX + shoulderWidth - 10},${bodyBottomY} L${headX - shoulderWidth + 10},${bodyBottomY} Z" fill="${colorSet.shirt}" opacity="0.9"/>

  <!-- Left arm (resting) -->
  <path d="M${headX - shoulderWidth + 5},${bodyTopY + 50} Q${headX - shoulderWidth - 40},${bodyTopY + 120} ${headX - shoulderWidth - 20},${bodyTopY + 160}" fill="none" stroke="${colorSet.skin}" stroke-width="18" stroke-linecap="round"/>

  <!-- Right arm (pointing) -->
  <path d="M${headX + shoulderWidth - 5},${bodyTopY + 50} Q${elbowX},${elbowY} ${armEndX},${armEndY}" fill="none" stroke="${colorSet.skin}" stroke-width="18" stroke-linecap="round"/>

  <!-- Hand/finger -->
  <circle cx="${armEndX}" cy="${armEndY}" r="10" fill="${colorSet.skin}"/>
  <line x1="${armEndX}" y1="${armEndY}" x2="${armEndX + Math.cos(angle) * 15}" y2="${armEndY + Math.sin(angle) * 15}" stroke="${colorSet.skin}" stroke-width="6" stroke-linecap="round"/>

  <!-- Head -->
  <ellipse cx="${headX}" cy="${headY}" rx="45" ry="50" fill="${colorSet.skin}"/>

  <!-- Hair -->
  ${hairStyle === 0 ? `
    <path d="M${headX - 50},${headY - 20} Q${headX - 30},${headY - 60} ${headX},${headY - 55} Q${headX + 30},${headY - 60} ${headX + 50},${headY - 20}" fill="${colorSet.hair}"/>
    <path d="M${headX - 50},${headY - 20} Q${headX - 55},${headY + 10} ${headX - 45},${headY + 30}" fill="${colorSet.hair}"/>
    <path d="M${headX + 50},${headY - 20} Q${headX + 55},${headY + 10} ${headX + 45},${headY + 30}" fill="${colorSet.hair}"/>
  ` : hairStyle === 1 ? `
    <ellipse cx="${headX}" cy="${headY - 15}" rx="50" ry="40" fill="${colorSet.hair}"/>
    <path d="M${headX - 45},${headY} Q${headX - 60},${headY + 40} ${headX - 30},${headY + 60}" fill="${colorSet.hair}"/>
    <path d="M${headX + 45},${headY} Q${headX + 60},${headY + 40} ${headX + 30},${headY + 60}" fill="${colorSet.hair}"/>
  ` : `
    <path d="M${headX - 55},${headY} Q${headX - 20},${headY - 70} ${headX + 10},${headY - 65} Q${headX + 50},${headY - 55} ${headX + 55},${headY}" fill="${colorSet.hair}"/>
    <path d="M${headX - 48},${headY + 5} L${headX - 55},${headY + 45}" fill="none" stroke="${colorSet.hair}" stroke-width="12" stroke-linecap="round"/>
    <path d="M${headX + 48},${headY + 5} L${headX + 55},${headY + 45}" fill="none" stroke="${colorSet.hair}" stroke-width="12" stroke-linecap="round"/>
  `}

  <!-- Eyes (anime style) -->
  <ellipse cx="${headX - 16}" cy="${headY - 5}" rx="8" ry="10" fill="#fff"/>
  <ellipse cx="${headX + 16}" cy="${headY - 5}" rx="8" ry="10" fill="#fff"/>
  <ellipse cx="${headX - 14}" cy="${headY - 3}" rx="5" ry="7" fill="#222"/>
  <ellipse cx="${headX + 14}" cy="${headY - 3}" rx="5" ry="7" fill="#222"/>
  <circle cx="${headX - 12}" cy="${headY - 6}" r="2" fill="#fff"/>
  <circle cx="${headX + 16}" cy="${headY - 6}" r="2" fill="#fff"/>

  <!-- Mouth -->
  <path d="M${headX - 5},${headY + 15} Q${headX},${headY + 20} ${headX + 5},${headY + 15}" fill="none" stroke="#c0392b" stroke-width="2" stroke-linecap="round"/>

  <!-- Finger indicator glow -->
  <circle cx="${armEndX}" cy="${armEndY}" r="20" fill="${colorSet.hair}" opacity="0.15" filter="url(#glow${index})"/>
  <text x="${armEndX}" y="${armEndY - 25}" text-anchor="middle" fill="${colorSet.hair}" font-size="10" font-family="monospace" opacity="0.4">✦</text>
</svg>`
}

function main() {
  const positions = []

  for (let i = 0; i < TOTAL; i++) {
    const [fx, fy] = generatePosition()
    positions.push([fx, fy])

    const colorSet = animeColors[i % animeColors.length]
    const svg = generateSVG(i, fx, fy, colorSet)
    const filePath = join(process.cwd(), 'public', 'images', `${i}.svg`)
    writeFileSync(filePath, svg)
    console.log(`Generated ${i}.svg (${colorSet.name}) -> finger at [${fx}, ${fy}]`)
  }

  const positionsPath = join(process.cwd(), 'public', 'positions.json')
  writeFileSync(positionsPath, JSON.stringify(positions))
  console.log(`\nGenerated positions.json with ${TOTAL} entries`)
}

main()
