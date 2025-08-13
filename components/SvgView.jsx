/**
 * components/SvgView.jsx
 * - forwardRef -> page.svgRef points to the <svg>
 * - Loads garment SVG for view: front/back/sleeve
 * - Tints colorable areas via currentColor (set by colorHex prop)
 * - Computes print area (from a known element id) and exposes clipPath #printArea
 * - Renders uploaded artwork inside clip and shows selection handles (resize + rotate)
 * - Emits onArtMouseDown() and onHandleDown(type, corner?) for page-level gesture logic
 */
'use client'
import React, { useEffect, useMemo, useRef, useState, forwardRef } from 'react'
import PropTypes from 'prop-types'

// Adjust these paths to match your public assets
const FILES = {
  front: '/views/tshirt_front.svg',
  back: '/views/tshirt_back.svg',
  sleeve: '/views/tshirt_sleeve.svg',
}

// Update these IDs if your SVGs use different element ids for the print boundary
const PRINT_IDS = {
  front: '_front-path',
  back: '_back-path',
  sleeve: 'color_first',
}

// Elements that should be tinted with currentColor (shirt body etc.)
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

const SvgView = forwardRef(function SvgView(
  {
    view,
    colorHex,
    art,
    containerW,
    containerH,
    className,
    onArtMouseDown,
    onHandleDown,
  },
  ref
) {
  // This ref points to the real <svg> that we return.
  const svgRef = useRef(null)
  // Bridge the forwarded ref
  useEffect(() => {
    if (!ref) return
    if (typeof ref === 'function') ref(svgRef.current)
    else ref.current = svgRef.current
  }, [ref])

  const [markup, setMarkup] = useState(null)
  const [vb, setVb] = useState([0, 0, 1000, 1000])
  const [printRect, setPrintRect] = useState(null)

  // Load garment SVG text for the chosen view
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
        console.warn('SvgView: failed to load', view, e)
        setMarkup(null)
      }
    })()
    return () => {
      dead = true
    }
  }, [view])

  // After markup mounts, measure the print boundary once and hide the original path
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const targetId = PRINT_IDS[view]
    const el = svg.querySelector(`#${CSS.escape(targetId)}`)
    if (!el) {
      setPrintRect(null)
      return
    }
    const bbox = el.getBBox()
    setPrintRect({
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
    })
    if (el.style) el.style.display = 'none'
  }, [markup, view])

  // px -> viewBox unit scaling (non-square containers handled with sx/sy)
  const sx = useMemo(
    () => (containerW > 0 ? vb[2] / containerW : 1),
    [containerW, vb]
  )
  const sy = useMemo(
    () => (containerH > 0 ? vb[3] / containerH : 1),
    [containerH, vb]
  )

  // Artwork geometry in viewBox units
  const artAttrs = useMemo(() => {
    if (!art) return null
    const w = art.sizePx * sx
    const x = art.xPx * sx
    const y = art.yPx * sy
    const cx = x + w / 2
    const cy = y + w / 2
    return { x, y, w, cx, cy, rotation: art.rotation || 0 }
  }, [art, sx, sy])

  // Fabric tint CSS
  const tintCSS = useMemo(() => {
    const targets = (COLORABLE_IDS[view] || []).map((id) => `#${id}`).join(', ')
    if (!targets) return ''
    return `
      ${targets} * { fill: currentColor !important; }
      ${targets} { fill: currentColor !important; }
    `
  }, [view])

  // Manipulation handle sizes
  const handleR = useMemo(
    () => (artAttrs ? Math.max(6, artAttrs.w * 0.04) : 6),
    [artAttrs]
  )
  const rotateOffset = useMemo(
    () => (artAttrs ? Math.max(20, artAttrs.w * 0.15) : 20),
    [artAttrs]
  )

  // Helpers to unify mouse and touch into the page's handlers
  const wrapMouseDown = (fn) => (e) => {
    e.stopPropagation()
    fn?.(e)
  }
  const wrapTouchStart = (fn) => (e) => {
    e.stopPropagation()
    fn?.(e.changedTouches?.[0] ?? e)
  }

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={`${vb[0]} ${vb[1]} ${vb[2]} ${vb[3]}`}
      style={{ color: colorHex }}
      xmlns='http://www.w3.org/2000/svg'
    >
      {/* Tint target ids using currentColor */}
      {tintCSS && <style dangerouslySetInnerHTML={{ __html: tintCSS }} />}

      {/* Inject original garment SVG contents */}
      {markup && <g dangerouslySetInnerHTML={{ __html: markup }} />}

      {/* Clip path from measured print rect */}
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

      {/* Artwork and selection UI */}
      {art && art.src && printRect && artAttrs && (
        <g>
          {/* Draggable image */}
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

          {/* Selection outline + handles (in same rotation space) */}
          <g
            transform={`rotate(${artAttrs.rotation}, ${artAttrs.cx}, ${artAttrs.cy})`}
          >
            <rect
              x={artAttrs.x}
              y={artAttrs.y}
              width={artAttrs.w}
              height={artAttrs.w}
              fill='none'
              stroke='rgba(0,0,0,0.45)'
              strokeDasharray='6 6'
            />

            {/* Resize handles */}
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

            {/* Rotate handle */}
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
})

SvgView.propTypes = {
  view: PropTypes.oneOf(['front', 'back', 'sleeve']).isRequired,
  colorHex: PropTypes.string.isRequired,
  art: PropTypes.shape({
    src: PropTypes.string,
    xPx: PropTypes.number,
    yPx: PropTypes.number,
    sizePx: PropTypes.number,
    rotation: PropTypes.number,
  }),
  containerW: PropTypes.number.isRequired,
  containerH: PropTypes.number.isRequired,
  className: PropTypes.string,
  onArtMouseDown: PropTypes.func,
  onHandleDown: PropTypes.func,
}

export default SvgView
