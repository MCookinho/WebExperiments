import { useState, useEffect, useRef } from 'react'
import './App.css'

const RECENT_LIMIT = 6
const recentIndices = []

function getViewport() {
  return { x: document.documentElement.clientWidth, y: document.documentElement.clientHeight }
}

function useViewport() {
  const [v, setV] = useState(getViewport())
  useEffect(() => {
    const onResize = () => setV(getViewport())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return v
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
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2
}

function findClosestImage(mouse, positions) {
  let bestIdx = undefined
  let bestDist = Number.MAX_VALUE
  for (let i = 0; i < positions.length; i++) {
    const d = distance(mouse, positions[i])
    if (d < bestDist && !recentIndices.includes(i)) {
      bestDist = d
      bestIdx = i
    }
  }
  recentIndices.unshift(bestIdx)
  recentIndices.length = Math.min(recentIndices.length, RECENT_LIMIT)
  return bestIdx
}

function usePositions() {
  const [positions, setPositions] = useState([])
  useEffect(() => {
    fetch('/positions.json')
      .then(r => r.json())
      .then(data => setPositions(data.map(([x, y]) => ({ x, y }))))
  }, [])
  return positions
}

function LoadingScreen({ position }) {
  const hasPointer = useDelayedValue(position, 1200)
  const hasHover = typeof window !== 'undefined' && window.matchMedia('(any-hover: hover)').matches
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

export default function App() {
  const viewport = useViewport()
  const positions = usePositions()

  const [isOutside, setIsOutside] = useState(false)
  const [rawPointer, setRawPointer] = useState()
  const [imageStyle, setImageStyle] = useState()
  const [loadedImg, setLoadedImg] = useState()

  const delayedPointer = useDelayedValue(rawPointer, 2000)
  const pointer = isOutside ? undefined : rawPointer

  const imgRef = useRef(null)
  const imgIndexRef = useRef()

  useEffect(() => {
    const onMouseMove = (e) => setRawPointer({ x: e.clientX, y: e.clientY })
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        setRawPointer({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      }
    }
    const onMouseLeave = () => setIsOutside(true)
    const onMouseEnter = () => setIsOutside(false)

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
    }
  }, [])

  useEffect(() => {
    if (!delayedPointer || positions.length === 0) {
      imgIndexRef.current = undefined
      setLoadedImg(undefined)
      setImageStyle(undefined)
      return
    }

    const mouseNorm = { x: delayedPointer.x / viewport.x, y: delayedPointer.y / viewport.y }
    const idx = findClosestImage(mouseNorm, positions)

    if (idx === undefined) {
      imgIndexRef.current = undefined
      setLoadedImg(undefined)
      setImageStyle(undefined)
      return
    }

    imgIndexRef.current = idx
    const img = new Image()
    img.onload = () => {
      if (imgIndexRef.current !== idx) return
      setLoadedImg(img)

      const fingerPos = positions[idx]
      const iw = img.width
      const ih = img.height
      const vw = viewport.x
      const vh = viewport.y

      const imageRatio = iw / ih
      const viewportRatio = vw / vh
      const scale = imageRatio > viewportRatio ? vw / iw : vh / ih
      const displayW = iw * scale
      const displayH = ih * scale

      const fingerOffsetX = (fingerPos.x - mouseNorm.x) * -1 * displayW * 1.2
      const fingerOffsetY = (fingerPos.y - mouseNorm.y) * -1 * displayH * 1.2

      const imageX = fingerOffsetX + (mouseNorm.x - fingerPos.x) * displayW
      const imageY = fingerOffsetY + (mouseNorm.y - fingerPos.y) * displayH

      setImageStyle({
        width: `${displayW}px`,
        height: `${displayH}px`,
        transform: `translate(${fingerOffsetX}px, ${fingerOffsetY}px) scale(1.2)`,
        transformOrigin: `${fingerPos.x * 100}% ${fingerPos.y * 100}%`,
      })
    }
    img.src = `/images/${idx}.svg`
  }, [delayedPointer, positions, viewport])

  const imageSrc = imgIndexRef.current !== undefined ? `/images/${imgIndexRef.current}.svg` : undefined

  return (
    <>
      <div className="Interactions" style={{ width: viewport.x, height: viewport.y }} />
      <div className="App" style={{ width: viewport.x, height: viewport.y }}>
        {!isOutside && pointer && <CursorDot position={pointer} />}
        {loadedImg && imageStyle ? (
          <>
            <div style={{ position: 'absolute', transform: 'scale(1.1)' }}>
              <img
                style={{ ...imageStyle, filter: 'blur(8px)' }}
                alt="someone pointing at your pointer"
                key={imageSrc}
                src={imageSrc}
              />
            </div>
            <div style={{ position: 'absolute' }}>
              <img
                style={imageStyle}
                alt="someone pointing at your pointer"
                key={imageSrc}
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
