'use client'
import React, { useEffect, useRef } from 'react'
import Image from 'next/image'

const CustomizedProductImage = ({ baseImageSrc, overlay, className }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const renderCanvas = async () => {
      const canvas = canvasRef.current
      if (!canvas) return // Exit if canvas is not ready

      const ctx = canvas.getContext('2d')

      // Load base product image
      const baseImage = new window.Image()
      baseImage.crossOrigin = 'anonymous'
      baseImage.src = baseImageSrc
      await new Promise((resolve, reject) => {
        baseImage.onload = resolve
        baseImage.onerror = reject
      })

      canvas.width = baseImage.naturalWidth
      canvas.height = baseImage.naturalHeight

      // Always draw the base image first
      ctx.drawImage(baseImage, 0, 0)

      // If there's an overlay, draw it on top
      if (overlay?.src) {
        // Load user's overlay image
        const overlayImage = new window.Image()
        overlayImage.crossOrigin = 'anonymous'
        overlayImage.src = overlay.src
        await new Promise((resolve, reject) => {
          overlayImage.onload = resolve
          overlayImage.onerror = reject
        })

        // --- NEW: Convert Ratios back to Absolute Pixels for this Canvas ---
        const absoluteX = overlay.xRatio * canvas.width
        const absoluteY = overlay.yRatio * canvas.height
        const absoluteSize = overlay.sizeRatio * canvas.width

        // Apply transformations and draw overlay using the calculated absolute values
        ctx.save()
        const centerX = absoluteX + absoluteSize / 2
        const centerY = absoluteY + absoluteSize / 2
        ctx.translate(centerX, centerY)
        ctx.rotate((overlay.rotation * Math.PI) / 180)
        ctx.drawImage(
          overlayImage,
          -absoluteSize / 2,
          -absoluteSize / 2,
          absoluteSize,
          absoluteSize
        )
        ctx.restore()
      }
    }

    renderCanvas().catch(console.error)
  }, [baseImageSrc, overlay])

  // Render a canvas that will be drawn into by the useEffect hook
  return <canvas ref={canvasRef} className={className} />
}

export default CustomizedProductImage
