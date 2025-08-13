// components/SvgView.jsx
import React, { forwardRef } from 'react'
import frontSvg from '@/assets/tshirt_front.svg'
import backSvg from '@/assets/tshirt_back.svg'
import sleeveSvg from '@/assets/tshirt_sleeve.svg'

// Inline import as string if needed for SSR
const svgs = {
  front: frontSvg,
  back: backSvg,
  sleeve: sleeveSvg,
}

const SvgView = forwardRef(
  (
    {
      view,
      colorHex = '#cccccc',
      art,
      containerW,
      containerH,
      onArtMouseDown,
      onHandleDown,
      className,
    },
    ref
  ) => {
    const svgMarkup = svgs[view] || ''
    // Replace fill on shirt body with selected color
    const coloredSvg = svgMarkup.replace(
      /fill="#[0-9A-Fa-f]{3,6}"/,
      `fill="${colorHex}"`
    )

    return (
      <div
        className={`relative ${className || ''}`}
        style={{
          width: containerW || '100%',
          height: containerH || 'auto',
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: coloredSvg }}
          ref={ref}
          style={{ width: '100%', height: '100%' }}
        />
        {art && (
          <div
            id='__artlayer'
            style={{
              position: 'absolute',
              left: art.xPx,
              top: art.yPx,
              width: art.sizePx,
              height: art.sizePx,
              transform: `rotate(${art.rotation}deg)`,
              transformOrigin: 'center',
              cursor: 'move',
            }}
            onMouseDown={(e) => onArtMouseDown && onArtMouseDown(e)}
            onTouchStart={(e) => onArtMouseDown && onArtMouseDown(e)}
          >
            <img
              src={art.src}
              alt='Custom art'
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
            {/* Resize handle */}
            <div
              style={{
                position: 'absolute',
                bottom: -8,
                right: -8,
                width: 16,
                height: 16,
                background: '#fff',
                border: '1px solid #333',
                cursor: 'nwse-resize',
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
                onHandleDown && onHandleDown('resize')
              }}
              onTouchStart={(e) => {
                e.stopPropagation()
                onHandleDown && onHandleDown('resize')
              }}
            />
            {/* Rotate handle */}
            <div
              style={{
                position: 'absolute',
                top: -24,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 16,
                height: 16,
                background: '#fff',
                border: '1px solid #333',
                cursor: 'grab',
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
                onHandleDown && onHandleDown('rotate')
              }}
              onTouchStart={(e) => {
                e.stopPropagation()
                onHandleDown && onHandleDown('rotate')
              }}
            />
          </div>
        )}
      </div>
    )
  }
)

SvgView.displayName = 'SvgView'
export default SvgView
