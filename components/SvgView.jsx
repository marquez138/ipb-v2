// components/SvgView.jsx
// Drag/resize/rotate ready + works with Next.js by fetching SVGs as text
'use client'
import React, { useEffect, useMemo, useRef, useState, forwardRef } from 'react'
import PropTypes from 'prop-types'

// Place these files in /public/views/
const FILES = {
  front: '/views/tshirt_front.svg',
  back: '/views/tshirt_back.svg',
  sleeve: '/views/tshirt_sleeve.svg',
}

// Print area measurement targets per view
// (front/back have rect ids; sleeve falls back to a group bbox)
const PRINT_IDS = {
  front: '_front-path',
  back: '_back-path',
  sleeve: 'color_first',
}

// Fabric tint ids per view (filled via CSS currentColor)
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
  const svgRef = useRef(null)
  // expose the <svg> to parent
  useEffect(() => {
    if (!ref) return
    if (typeof ref === 'function') ref(svgRef.current)
    else ref.current = svgRef.current
  }, [ref])

  const [markup, setMarkup] = useState(null)
  const [vb, setVb] = useState([0, 0, 1000, 1000])
  const [printRect, setPrintRect] = useState(null)

  // Load the SVG as text and inline it
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

  // Measure print rect by id (with fallbacks), then hide the source el
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const wanted = PRINT_IDS[view]
    let el = wanted ? svg.querySelector(`#${CSS.escape(wanted)}`) : null

    if (!el && view === 'sleeve') {
      el = svg.querySelector(
        '#_left_ccw-path, rect#print_area, rect[id*="print"]'
      )
    }
    if (!el) {
      el = svg.querySelector('#front, #back, #sleeve, #color_first')
    }

    if (el?.getBBox) {
      const b = el.getBBox()
      setPrintRect({ x: b.x, y: b.y, width: b.width, height: b.height })
      if (el.style) el.style.display = 'none'
    } else {
      setPrintRect(null)
    }
  }, [markup, view])

  // px -> viewBox scaling
  const sx = useMemo(
    () => (containerW > 0 ? vb[2] / containerW : 1),
    [containerW, vb]
  )
  const sy = useMemo(
    () => (containerH > 0 ? vb[3] / containerH : 1),
    [containerH, vb]
  )

  // artwork geometry in viewBox units
  const artAttrs = useMemo(() => {
    if (!art) return null
    const w = art.sizePx * sx
    const x = art.xPx * sx
    const y = art.yPx * sy
    const cx = x + w / 2
    const cy = y + w / 2
    return { x, y, w, cx, cy, rotation: art.rotation || 0 }
  }, [art, sx, sy])

  // CSS tint for garment elements (uses currentColor)
  const tintCSS = useMemo(() => {
    const targets = (COLORABLE_IDS[view] || []).map((id) => `#${id}`).join(', ')
    if (!targets) return ''
    return `
      ${targets} * { fill: currentColor !important; }
      ${targets}   { fill: currentColor !important; }
    `
  }, [view])

  // handle sizes
  const handleR = useMemo(
    () => (artAttrs ? Math.max(6, artAttrs.w * 0.04) : 6),
    [artAttrs]
  )
  const rotateOffset = useMemo(
    () => (artAttrs ? Math.max(20, artAttrs.w * 0.15) : 20),
    [artAttrs]
  )

  // normalize events to the page handlers
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
      {/* Tint fabric using currentColor */}
      {tintCSS && <style dangerouslySetInnerHTML={{ __html: tintCSS }} />}

      {/* Inline garment SVG contents */}
      {markup && <g dangerouslySetInnerHTML={{ __html: markup }} />}

      {/* Clip-path from measured rect */}
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

      {/* Artwork layer */}
      {art && art.src && printRect && artAttrs && (
        <g
          id='__artlayer'
          onMouseDown={wrapMouseDown(onArtMouseDown)} // start MOVE anywhere in box
          onTouchStart={wrapTouchStart(onArtMouseDown)}
          style={{ cursor: 'grab' }}
        >
          {/* Clipped image */}
          <g
            clipPath='url(#printArea)'
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

          {/* Selection outline + handles */}
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
              style={{ pointerEvents: 'none' }} // don't steal clicks
            />

            {/* corner resize handles */}
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

            {/* rotate handle above top-center */}
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
                    style={{ pointerEvents: 'none' }}
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
