/**
 * app/designer/page.jsx
 * Demo designer page using SvgView.jsx.
 * - Front/Back/Sleeve view switching
 * - Color tinting via currentColor
 * - URL upload for artwork
 * - Drag to move (mousedown on art), sliders for size/rotation
 * - Drag clamped to the SVG's print area
 *
 * Integrate pieces into your project as needed.
 */
'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import SvgView from '@/components/SvgView'

const DEFAULT_COLOR = '#111827' // slate-900-ish
const COLOR_SWATCHES = [
  '#111827',
  '#1f2937',
  '#374151',
  '#6b7280',
  '#f59e0b',
  '#ef4444',
  '#10b981',
  '#3b82f6',
  '#f9fafb',
  '#000000',
]

export default function DesignerPage() {
  const [selectedView, setSelectedView] = useState('front') // 'front'|'back'|'sleeve'
  const [colorHex, setColorHex] = useState(DEFAULT_COLOR)

  const [overlay, setOverlay] = useState({
    src: '',
    position: { x: 200, y: 250 },
    size: 300,
    rotation: 0,
  })

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ dx: 0, dy: 0 })

  const mainRef = useRef(null)
  const svgRef = useRef(null)
  const [container, setContainer] = useState({ w: 0, h: 0 })

  useEffect(() => {
    if (!mainRef.current) return
    const el = mainRef.current
    const update = () => {
      const r = el.getBoundingClientRect()
      setContainer({ w: r.width, h: r.height })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  function getPrintBoundsPx() {
    const svg = svgRef.current
    if (!svg || !mainRef.current) return null
    const r = mainRef.current.getBoundingClientRect()
    const vb = svg.viewBox?.baseVal
    if (!vb) return null
    const sx = r.width / vb.width
    const sy = r.height / vb.height

    const rect = svg.querySelector('#printArea > rect')
    if (!rect) return null

    const x = parseFloat(rect.getAttribute('x') || '0')
    const y = parseFloat(rect.getAttribute('y') || '0')
    const w = parseFloat(rect.getAttribute('width') || '0')
    const h = parseFloat(rect.getAttribute('height') || '0')

    return { x: x * sx, y: y * sy, w: w * sx, h: h * sy }
  }

  function clampToPrint(x, y, sizePx) {
    const pb = getPrintBoundsPx()
    if (!pb) return { x, y }
    return {
      x: Math.max(pb.x, Math.min(x, pb.x + pb.w - sizePx)),
      y: Math.max(pb.y, Math.min(y, pb.y + pb.h - sizePx)),
    }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({
      dx: e.clientX - overlay.position.x,
      dy: e.clientY - overlay.position.y,
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const { x, y } = clampToPrint(
      e.clientX - dragStart.dx,
      e.clientY - dragStart.dy,
      overlay.size
    )
    setOverlay((prev) => ({ ...prev, position: { x, y } }))
  }

  const handleMouseUp = () => setIsDragging(false)
  const handleDesignAreaClick = () => {}

  return (
    <div className='p-6 grid gap-6 md:grid-cols-[1fr_360px]'>
      {/* Preview */}
      <div
        ref={mainRef}
        className='relative rounded-lg overflow-hidden bg-gray-100 mb-4'
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleDesignAreaClick}
        style={{ minHeight: 480 }}
      >
        <SvgView
          ref={svgRef}
          view={selectedView}
          colorHex={colorHex}
          art={
            overlay.src
              ? {
                  src: overlay.src,
                  xPx: overlay.position.x,
                  yPx: overlay.position.y,
                  sizePx: overlay.size,
                  rotation: overlay.rotation,
                }
              : null
          }
          containerW={container.w}
          containerH={container.h}
          onArtMouseDown={handleMouseDown}
          className='w-full h-auto'
        />

        {!overlay.src && (
          <div className='absolute inset-0 m-auto w-3/4 h-3/4 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center pointer-events-none'>
            <p className='text-sm text-gray-600'>
              Paste an artwork URL to begin
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <aside className='space-y-6'>
        <div>
          <h3 className='font-medium mb-2'>View</h3>
          <div className='flex gap-2 flex-wrap'>
            {['front', 'back', 'sleeve'].map((v) => (
              <button
                key={v}
                className={`px-3 py-1 rounded border ${
                  selectedView === v ? 'bg-black text-white' : 'bg-white'
                }`}
                onClick={() => setSelectedView(v)}
              >
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className='font-medium mb-2'>Color</h3>
          <div className='flex flex-wrap gap-2'>
            {COLOR_SWATCHES.map((hex) => (
              <button
                key={hex}
                className='h-8 w-8 rounded-full border'
                style={{ background: hex }}
                title={hex}
                onClick={() => setColorHex(hex)}
              />
            ))}
            <input
              className='ml-2 border rounded px-2 py-1 text-sm'
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              placeholder='#111827'
            />
          </div>
        </div>

        <div>
          <h3 className='font-medium mb-2'>Artwork URL</h3>
          <input
            type='url'
            className='w-full border rounded px-2 py-1'
            placeholder='https://...your-image.png'
            value={overlay.src}
            onChange={(e) =>
              setOverlay((prev) => ({ ...prev, src: e.target.value }))
            }
          />
        </div>

        <div>
          <h3 className='font-medium mb-2'>Size</h3>
          <input
            type='range'
            min='80'
            max='600'
            value={overlay.size}
            onChange={(e) =>
              setOverlay((prev) => ({ ...prev, size: +e.target.value }))
            }
            className='w-full'
          />
        </div>

        <div>
          <h3 className='font-medium mb-2'>Rotation</h3>
          <input
            type='range'
            min='-180'
            max='180'
            value={overlay.rotation}
            onChange={(e) =>
              setOverlay((prev) => ({ ...prev, rotation: +e.target.value }))
            }
            className='w-full'
          />
        </div>
      </aside>
    </div>
  )
}
