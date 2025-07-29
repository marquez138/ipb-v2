'use client'
import React, { useEffect, useRef } from 'react'
import Image from 'next/image'

const CustomizedProductImage = ({ baseImageSrc, overlay, className }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const renderCanvas = async () => {
      const canvas = canvasRef.current
      if (!canvas || !overlay?.src) return

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

      // Load user's overlay image
      const overlayImage = new window.Image()
      overlayImage.crossOrigin = 'anonymous'
      overlayImage.src = overlay.src
      await new Promise((resolve, reject) => {
        overlayImage.onload = resolve
        overlayImage.onerror = reject
      })

      // Draw base image
      ctx.drawImage(baseImage, 0, 0)

      // Apply transformations and draw overlay
      ctx.save()
      const centerX = overlay.position.x + overlay.size / 2
      const centerY = overlay.position.y + overlay.size / 2
      ctx.translate(centerX, centerY)
      ctx.rotate((overlay.rotation * Math.PI) / 180)
      ctx.drawImage(
        overlayImage,
        -overlay.size / 2,
        -overlay.size / 2,
        overlay.size,
        overlay.size
      )
      ctx.restore()
    }

    renderCanvas().catch(console.error)
  }, [baseImageSrc, overlay])

  // If there's no customization for this side, just show the base image
  if (!overlay?.src) {
    return (
      <Image
        src={baseImageSrc}
        alt='Product image'
        className={className}
        width={120}
        height={120}
      />
    )
  }

  // Otherwise, render the canvas
  return <canvas ref={canvasRef} className={className} />
}

export default CustomizedProductImage
