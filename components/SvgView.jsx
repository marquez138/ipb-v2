'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'

/**
 * SvgView.jsx (with handles + touch)
 * - Loads garment SVG per view
 * - Tints fabric via currentColor
 * - Computes print area -> clipPath #printArea
 * - Renders artwork (<image>) and manipulation handles (corners + rotate)
 * - Emits onArtMouseDown / onHandleDown(type, corner) for mouse & touch
 */
const FILES = {
  front: '/views/tshirt_front.svg',
  back: '/views/tshirt_back.svg',
  sleeve: '/views/tshirt_sleeve.svg',
}

const PRINT_IDS = {
  front: '_front-path',
  back: '_back-path',
  sleeve: '_left_ccw-path',
}

const COLORABLE_IDS = {
  front: ['color_first', 'front'],
  back: ['color_first', 'back'],
  sleeve: ['color_first'],
}

function parseViewBox(svgText) {
  const m = svgText.match(
    /viewBox\s*=\s*["']\s*([\d.\-]+)\s+([\d.\-]+)\s+([\d.\-]+)\s+([\d.\-]+)\s*["']/i
  )
  if (!m) return [0, 0, 1000, 1000]
  return m.slice(1, 5).map(Number)
}

function stripOuterSvg(svgText) {
  const m = svgText.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i)
  return m ? m[1] : svgText
}

export default function SvgView({
  view,
  colorHex,
  art, // { src, xPx, yPx, sizePx, rotation }
  containerW,
  containerH,
  className,
  onArtMouseDown,
  onHandleDown, // (type: 'move'|'resize'|'rotate', corner?: 'nw'|'ne'|'se'|'sw')
}) {
  const rootRef = useRef(null)
  const [markup, setMarkup] = useState(null)
  const [vb, setVb] = useState([0, 0, 1000, 1000])
  const [printRect, setPrintRect] = useState(null)

  // Load SVG garment
  useEffect(() => {
    let dead = false
    ;(async () => {
      try {
        const res = await fetch(FILES[view], { cache: 'force-cache' })
        const text = await res.text()
        if (dead) return
        setVb(parseViewBox(text))
        setMarkup(stripOuterSvg(text))
      } catch (e) {
        console.warn('Failed to load SVG:', e)
      }
    })()
    return () => {
      dead = true
    }
  }, [view])

  // Compute print rect from target element
  useEffect(() => {
    const svg = rootRef.current
    if (!svg) return
    const targetId = PRINT_IDS[view]
    const el = svg.querySelector(`#${CSS.escape(targetId)}`)
    if (!el) return
    const bbox = el.getBBox()
    setPrintRect({
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
    })
    if (el.style) el.style.display = 'none'
  }, [markup, view])

  // Convert px -> vb units
  const sx = useMemo(
    () => (containerW > 0 ? vb[2] / containerW : 1),
    [containerW, vb]
  )
  const sy = useMemo(
    () => (containerH > 0 ? vb[3] / containerH : 1),
    [containerH, vb]
  )

  // Art attributes in vb units
  const artAttrs = useMemo(() => {
    if (!art) return null
    const w = art.sizePx * sx
    const x = art.xPx * sx
    const y = art.yPx * sy
    const cx = x + w / 2
    const cy = y + w / 2
    return { x, y, w, cx, cy, rotation: art.rotation || 0 }
  }, [art, sx, sy])

  // Fabric tinting
  const tintCSS = useMemo(() => {
    const targets = (COLORABLE_IDS[view] || []).map((id) => `#${id}`).join(', ')
    if (!targets) return ''
    return `
      ${targets} * { fill: currentColor !important; }
      ${targets} { fill: currentColor !important; }
    `
  }, [view])

  // Handle sizes
  const handleR = useMemo(
    () => (artAttrs ? Math.max(6, artAttrs.w * 0.04) : 6),
    [artAttrs]
  )
  const rotateOffset = useMemo(
    () => (artAttrs ? Math.max(20, artAttrs.w * 0.15) : 20),
    [artAttrs]
  )

  // Wrappers to unify mouse & touch
  const wrapMouseDown = (fn) => (e) => {
    e.stopPropagation()
    fn?.(e)
  }
  const wrapTouchStart = (fn) => (e) => {
    e.stopPropagation()
    fn?.(e.changedTouches[0])
  }

  return (
    <svg
      ref={rootRef}
      className={className}
      viewBox={`${vb[0]} ${vb[1]} ${vb[2]} ${vb[3]}`}
      style={{ color: colorHex }}
      xmlns='http://www.w3.org/2000/svg'
    >
      {tintCSS && <style dangerouslySetInnerHTML={{ __html: tintCSS }} />}
      {markup && <g dangerouslySetInnerHTML={{ __html: markup }} />}

      <defs>
        {printRect && (
          <clipPath id='printArea'>
            <rect
              x={printRect.x}
              y={printRect.y}
              width={printRect.width}
              height={printRect.height}
              rx='8'
            />
          </clipPath>
        )}
      </defs>

      {/* Artwork + selection UI */}
      {art && art.src && printRect && artAttrs && (
        <g>
          {/* Artwork image in clip */}
          <g
            id='__artwork'
            clipPath='url(#printArea)'
            onMouseDown={wrapMouseDown(
              () => onArtMouseDown && onArtMouseDown()
            )}
            onTouchStart={wrapTouchStart(
              () => onArtMouseDown && onArtMouseDown()
            )}
            style={{ cursor: 'grab' }}
          >
            <g
              transform={`rotate(${artAttrs.rotation}, ${artAttrs.cx}, ${artAttrs.cy})`}
            >
              <image
                href={art.src}
                x={artAttrs.x}
                y={artAttrs.y}
                width={artAttrs.w}
                height={artAttrs.w}
                preserveAspectRatio='xMidYMid meet'
                style={{ pointerEvents: 'none' }}
              />
            </g>
          </g>

          {/* Selection rect */}
          <g
            transform={`rotate(${artAttrs.rotation}, ${artAttrs.cx}, ${artAttrs.cy})`}
          >
            <rect
              x={artAttrs.x}
              y={artAttrs.y}
              width={artAttrs.w}
              height={artAttrs.w}
              fill='none'
              stroke='rgba(0,0,0,0.4)'
              strokeDasharray='6 6'
            />

            {/* Corner handles for resize */}
            {['nw', 'ne', 'se', 'sw'].map((corner) => {
              const dx = corner.includes('w') ? 0 : artAttrs.w
              const dy = corner.includes('n') ? 0 : artAttrs.w
              const hx = artAttrs.x + dx
              const hy = artAttrs.y + dy
              return (
                <circle
                  key={corner}
                  cx={hx}
                  cy={hy}
                  r={handleR}
                  fill='white'
                  stroke='black'
                  onMouseDown={wrapMouseDown(
                    () => onHandleDown && onHandleDown('resize', corner)
                  )}
                  onTouchStart={wrapTouchStart(
                    () => onHandleDown && onHandleDown('resize', corner)
                  )}
                  style={{ cursor: `${corner}-resize` }}
                />
              )
            })}

            {/* Rotate handle above top-center */}
            {(() => {
              const hx = artAttrs.x + artAttrs.w / 2
              const hy = artAttrs.y - rotateOffset
              return (
                <g key='rotate'>
                  <line
                    x1={artAttrs.x + artAttrs.w / 2}
                    y1={artAttrs.y}
                    x2={hx}
                    y2={hy}
                    stroke='black'
                  />
                  <circle
                    cx={hx}
                    cy={hy}
                    r={handleR}
                    fill='white'
                    stroke='black'
                    onMouseDown={wrapMouseDown(
                      () => onHandleDown && onHandleDown('rotate')
                    )}
                    onTouchStart={wrapTouchStart(
                      () => onHandleDown && onHandleDown('rotate')
                    )}
                    style={{ cursor: 'grab' }}
                  />
                </g>
              )
            })()}
          </g>
        </g>
      )}
    </svg>
  )
}
