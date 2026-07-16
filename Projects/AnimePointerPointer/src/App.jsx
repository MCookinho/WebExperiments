import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

const TOTAL_IMAGES = 100
const LOADING_DELAY = 1200
const POINTER_DELAY = 2000
const RECENT_LIMIT = 6

function getViewportSize() {
  return { x: document.documentElement.clientWidth, y: document.documentElement.clientHeight }
}

function useViewportSize() {
  const [size, setSize] = useState(getViewportSize())
  useEffect(() => {
    const handleResize = () => setSize(getViewportSize())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return size
}

function useDelayedValue(value, delay) {
  const [delayed, setDelayed] = useState()
  useEffect(() => {
    const timer = setTimeout(() => setDelayed(value), delay)
    return () => { setDelayed(undefined); clearTimeout(timer) }
  }, [value, delay])
  return delayed
}

function distance(a, b) {
  return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
}

function normalizeMouseToImage(mouse, viewport) {
  return { x: mouse.x / viewport.x, y: mouse.y / viewport.y }
}

function scaleVector(v, factor) {
  return { x: v.x * factor, y: v.y * factor }
}

function multiplyVectors(a, b) {
  return { x: a.x * b.x, y: a.y * b.y }
}

function addVectors(a, b) {
  return { x: a.x + b.x, y: a.y + b.y }
}

function subtractVectors(a, b) {
  return { x: a.x - b.x, y: a.y - b.y }
}

function cssTranslate(x, y, unit = 'px') {
  return `translate(${x}${unit}, ${y}${unit})`
}

function findClosestImage(mouseNorm, positions, recentIndices) {
  let bestIndex = undefined
  let bestDist = Number.MAX_VALUE

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i]
    const d = distance(mouseNorm, pos)
    if (d < bestDist && !recentIndices.includes(i)) {
      bestDist = d
      bestIndex = i
    }
  }

  recentIndices.unshift(bestIndex)
  recentIndices.length = Math.min(recentIndices.length, RECENT_LIMIT)
  return bestIndex
}

function getDisplaySize(imageSize, viewport) {
  const iw = imageSize.x
  const ih = imageSize.y
  const vw = viewport.x
  const vh = viewport.y

  const imageRatio = iw / ih
  const viewportRatio = vw / vh

  const scale = imageRatio > viewportRatio ? vw / iw : vh / ih

  return { x: iw * scale, y: ih * scale }
}

async function loadPositions() {
  const res = await fetch('/positions.json')
  const data = await res.json()
  return data.map(([x, y]) => ({ x, y }))
}

function useImageLoader(src) {
  const [state, setState] = useState({ image: undefined, status: 'loading' })

  useEffect(() => {
    if (!src) {
      setState({ image: undefined, status: 'loading' })
      return
    }
    const img = document.createElement('img')
    const onLoad = () => setState({ image: img, status: 'loaded' })
    const onError = () => setState({ image: undefined, status: 'failed' })
    img.addEventListener('load', onLoad)
    img.addEventListener('error', onError)
    img.src = src
    return () => {
      img.removeEventListener('load', onLoad)
      img.removeEventListener('error', onError)
    }
  }, [src])

  return state
}

function useImageStyle(viewport, mouse, imageIndex, positions, imageLoader) {
  const [style, setStyle] = useState(undefined)

  useEffect(() => {
    if (!imageLoader.image || !mouse || imageIndex === undefined) {
      setStyle(undefined)
      return
    }

    const img = imageLoader.image
    const mouseNorm = normalizeMouseToImage(mouse, viewport)
    const fingerPos = positions[imageIndex]
    const displaySize = getDisplaySize({ x: img.width, y: img.height }, viewport)

    const imageScale = scaleVector(displaySize, 1.2)
    const fingerOffset = scaleVector(subtractVectors(fingerPos, mouseNorm), -1)
    const imageCenter = multiplyVectors(fingerOffset, imageScale)
    const transformOrigin = `${fingerPos.x * 100}% ${fingerPos.y * 100}%`

    setStyle({
      width: `${displaySize.x}px`,
      height: `${displaySize.y}px`,
      transform: `${cssTranslate(imageCenter.x, imageCenter.y, 'px')} scale(1.2)`,
      transformOrigin,
    })
  }, [imageLoader.image, mouse, imageIndex, positions, viewport])

  return style
}

function LoadingScreen({ position }) {
  const hasPointer = useDelayedValue(position, LOADING_DELAY)
  const hasHover = window.matchMedia('(any-hover: hover)').matches

  return (
    <div className={`Loading ${position ? 'mod-loader' : ''}`}>
      <div>
        {position
          ? hasPointer
            ? 'Pointer located. Pointing...'
            : 'Finding pointer... Please hold still.'
          : hasHover
            ? 'Please move your pointer'
            : 'Please tap on the screen'}
      </div>
    </div>
  )
}

function CursorDot({ position }) {
  return (
    <div style={{
      zIndex: 2000,
      position: 'absolute',
      transform: `translate(${position.x - 3}px, ${position.y - 4}px)`,
    }}>
      <img src="/cursor.svg" width="15" alt="pointer" />
    </div>
  )
}

function App() {
  const viewport = useViewportSize()
  const recentIndices = useRef([])

  const [positions, setPositions] = useState([])
  const [mouseNorm, setMouseNorm] = useState()
  const [pointerPos, setPointerPos] = useState()
  const [selectedIndex, setSelectedIndex] = useState()
  const [selectedImage, setSelectedImage] = useState()
  const [isOutside, setIsOutside] = useState(false)

  useEffect(() => {
    loadPositions().then(setPositions)
  }, [])

  useEffect(() => {
    const onMove = (e) => {
      const pos = Array.isArray(e) ? { x: e[0], y: e[1] } : { x: e.clientX, y: e.clientY }
      setPointerPos(pos)
    }
    const onLeave = () => setIsOutside(true)
    const onEnter = () => setIsOutside(false)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
    }
  }, [])

  const delayedPointer = useDelayedValue(pointerPos, 2000)

  useEffect(() => {
    if (delayedPointer && positions.length > 0) {
      const norm = normalizeMouseToImage(delayedPointer, viewport)
      const idx = findClosestImage(norm, positions, recentIndices.current)
      setSelectedIndex(idx)
    }
  }, [delayedPointer, positions, viewport])

  const imageSrc = selectedIndex !== undefined ? `/images/${selectedIndex}.svg` : undefined
  const loader = useImageLoader(imageSrc)

  useEffect(() => {
    if (loader.image && loader.status === 'loaded') {
      setSelectedImage(loader.image)
    }
  }, [loader])

  const imageStyle = useImageStyle(viewport, pointerPos, selectedIndex, positions, loader)

  return (
    <>
      <div className="Interactions" style={{ width: viewport.x, height: viewport.y }}>
        {pointerPos && <CursorDot position={pointerPos} />}
      </div>
      <div className="App" style={{ width: viewport.x, height: viewport.y }}>
        {selectedImage && selectedIndex !== undefined && imageStyle ? (
          <>
            <div style={{ position: 'absolute', transform: 'scale(1.1)' }}>
              <img
                style={{ ...imageStyle, filter: 'blur(8px)' }}
                alt="someone pointing at your pointer"
                key={selectedIndex}
                src={imageSrc}
              />
            </div>
            <div style={{ position: 'absolute' }}>
              <img
                style={imageStyle}
                alt="someone pointing at your pointer"
                key={selectedIndex}
                src={imageSrc}
              />
            </div>
          </>
        ) : (
          <LoadingScreen position={delayedPointer} />
        )}
      </div>
    </>
  )
}

export default App
