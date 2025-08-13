/**
 * components/SvgView.jsx
 * Multi-view SVG preview that tints via currentColor, builds a clip from the
 * SVG's own print rectangle, and injects user artwork inside the SVG.
 */
'use client'
import React, { useEffect, useMemo, useRef, useState, forwardRef } from 'react'
import PropTypes from 'prop-types'

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

// Groups that should take on the tint color via currentColor
const COLORABLE_IDS = {
  front: ['color_first', 'front'],
  back: ['color_first', 'back'],
  sleeve: ['color_first'],
}

const SvgView = forwardRef(function SvgView(
  { view, colorHex, art, containerW, containerH, className, onArtMouseDown },
  ref
) {
  const [svgMarkup, setSvgMarkup] = useState(null)
  const wrapperRef = useRef(null)

  // Expose the inner svg element via the forwarded ref
  useEffect(() => {
    if (typeof ref === 'function') {
      ref(wrapperRef.current)
    } else if (ref) {
      ref.current = wrapperRef.current
    }
  }, [ref, svgMarkup])

  // Fetch the raw SVG when the view changes
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch(FILES[view], { cache: 'force-cache' })
      const text = await res.text()
      if (!cancelled) setSvgMarkup(text)
    })()
    return () => {
      cancelled = true
    }
  }, [view])

  // After SVG is injected, configure tint + clip path from built-in print rect
  useEffect(() => {
    const svg = wrapperRef.current
    if (!svg) return

    // Find and hide the print border rect, build clipPath from its bbox
    const rect = svg.querySelector(`#${CSS.escape(PRINT_IDS[view])}`)
    if (!rect) return

    const bbox = rect.getBBox()
    rect.style.display = 'none'

    let defs = svg.querySelector('defs')
    if (!defs) {
      defs = document.createElementNS(svg.namespaceURI, 'defs')
      svg.insertBefore(defs, svg.firstChild)
    }

    let clip = svg.querySelector('#printArea')
    if (!clip) {
      clip = document.createElementNS(svg.namespaceURI, 'clipPath')
    }
    clip.setAttribute('id', 'printArea')
    while (clip.firstChild) clip.removeChild(clip.firstChild)

    const clipRect = document.createElementNS(svg.namespaceURI, 'rect')
    clipRect.setAttribute('x', String(bbox.x))
    clipRect.setAttribute('y', String(bbox.y))
    clipRect.setAttribute('width', String(bbox.width))
    clipRect.setAttribute('height', String(bbox.height))
    clipRect.setAttribute('rx', '8')
    clip.appendChild(clipRect)

    if (!clip.parentNode) defs.appendChild(clip)

    // Inject style for tinting
    let style = svg.querySelector("style[data-injected='tint']")
    const targets = (COLORABLE_IDS[view] || []).map((id) => `#${id}`).join(', ')
    const css = `
      ${targets} * { fill: currentColor !important; }
      ${targets} { fill: currentColor !important; }
      /* keep outlines/texture intact */
      #outlines, #outlines_colored, #fabric-image { mix-blend-mode: normal; }
    `

    if (!style) {
      style = document.createElementNS(svg.namespaceURI, 'style')
      style.setAttribute('data-injected', 'tint')
      style.textContent = css
      svg.appendChild(style)
    } else {
      style.textContent = css
    }

    // set tint on root
    svg.style.color = colorHex || '#000000'

    // (Re-bind artwork mouse handler if needed)
    const artGroup = svg.querySelector('#__artwork')
    if (artGroup) {
      artGroup.removeEventListener('mousedown', onArtMouseDown)
      if (onArtMouseDown) artGroup.addEventListener('mousedown', onArtMouseDown)
    }
  }, [view, colorHex, svgMarkup, onArtMouseDown])

  // Compute SVG-space transform for the artwork from container pixels
  const artTransform = useMemo(() => {
    const svg = wrapperRef.current
    if (!svg || !art) return null
    const vb = svg.viewBox?.baseVal || { width: 1000, height: 1000 }
    const sx = containerW > 0 ? vb.width / containerW : 1
    const sy = containerH > 0 ? vb.height / containerH : 1
    const x = art.xPx * sx
    const y = art.yPx * sy
    const w = art.sizePx * sx
    return { x, y, w, rotate: art.rotation || 0, cx: x + w / 2, cy: y + w / 2 }
  }, [art, containerW, containerH, svgMarkup])

  // Once markup is present, inject (or update) artwork layer
  useEffect(() => {
    const svg = wrapperRef.current
    if (!svg || !svgMarkup) return

    // Cleanup previous artwork
    const prev = svg.querySelector('#__artwork')
    if (prev) prev.remove()

    if (!artTransform || !art?.src) return

    const g = document.createElementNS(svg.namespaceURI, 'g')
    g.setAttribute('id', '__artwork')
    g.setAttribute('clip-path', 'url(#printArea)')
    g.style.cursor = 'grab'

    const gi = document.createElementNS(svg.namespaceURI, 'g')
    gi.setAttribute(
      'transform',
      `rotate(${artTransform.rotate}, ${artTransform.cx}, ${artTransform.cy})`
    )

    const img = document.createElementNS(svg.namespaceURI, 'image')
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', art.src)
    img.setAttribute('x', String(artTransform.x))
    img.setAttribute('y', String(artTransform.y))
    img.setAttribute('width', String(artTransform.w))
    img.setAttribute('height', String(artTransform.w))
    img.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    img.style.pointerEvents = 'none' // allow the wrapper group to receive mouse events

    gi.appendChild(img)
    g.appendChild(gi)

    if (onArtMouseDown) g.addEventListener('mousedown', onArtMouseDown)

    // Append as last child so it’s on top
    svg.appendChild(g)

    return () => {
      g.removeEventListener('mousedown', onArtMouseDown)
      g.remove()
    }
  }, [svgMarkup, artTransform, art, onArtMouseDown])

  if (!svgMarkup) {
    return <div className={className} />
  }

  return (
    <svg
      ref={wrapperRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
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
}

export default SvgView
