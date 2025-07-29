'use client'
import { useEffect, useState, useRef } from 'react'
import { assets } from '@/assets/assets'
import ProductCard from '@/components/ProductCard'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Loading from '@/components/Loading'
import { useAppContext } from '@/context/AppContext'
import React from 'react'

// Icon for the upload area
const UploadIcon = () => (
  <svg
    className='w-8 h-8 text-gray-400'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
    />
  </svg>
)

const getColorHex = (colorName) => {
  const COLOR_MAP = {
    Black: '#000000',
    White: '#ffffff',
    Red: '#ff0000',
    Blue: '#0000ff',
    Green: '#00ff00',
    Orange: '#FFA500',
    Yellow: '#FFFF00',
    Purple: '#800080',
    Pink: '#FFC0CB',
    Gray: '#808080',
    Brown: '#A52A2A',
  }
  return COLOR_MAP[colorName] || '#cccccc'
}

const Product = () => {
  const { id } = useParams()
  const { products, router, addToCart, user } = useAppContext()

  const [mainImage, setMainImage] = useState(null)
  const [productData, setProductData] = useState(null)
  const [selectedColor, setSelectedColor] = useState('')

  // --- NEW STATE & REFS ---
  const [customOverlays, setCustomOverlays] = useState({})
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mainImageContainerRef = useRef(null)

  const fetchProductData = async () => {
    const product = products.find((product) => product._id === id)
    setProductData(product)
    if (product && product.image.length > 0) {
      setMainImage(product.image[0])
    }
  }

  useEffect(() => {
    fetchProductData()
  }, [id, products.length])

  // --- IMAGE & OVERLAY HANDLERS ---
  const handleCustomImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCustomOverlays((prev) => ({
        ...prev,
        [mainImage]: {
          src: URL.createObjectURL(file),
          position: { x: 50, y: 50 }, // Start in a central position
          size: 150,
          rotation: 0,
        },
      }))
    }
  }

  const handleDesignAreaClick = () => {
    fileInputRef.current.click()
  }

  const handleDeleteOverlay = (e) => {
    e.stopPropagation() // Prevent triggering drag
    const newOverlays = { ...customOverlays }
    delete newOverlays[mainImage]
    setCustomOverlays(newOverlays)
  }

  // --- DRAG HANDLERS ---
  const handleMouseDown = (e) => {
    e.stopPropagation()
    setIsDragging(true)
    const overlayState = customOverlays[mainImage]
    setDragStart({
      x: e.clientX - overlayState.position.x,
      y: e.clientY - overlayState.position.y,
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const containerRect = mainImageContainerRef.current.getBoundingClientRect()
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    const overlay = customOverlays[mainImage]
    const clampedX = Math.max(
      0,
      Math.min(newX, containerRect.width - overlay.size)
    )
    const clampedY = Math.max(
      0,
      Math.min(newY, containerRect.height - overlay.size)
    )

    setCustomOverlays((prev) => ({
      ...prev,
      [mainImage]: {
        ...prev[mainImage],
        position: { x: clampedX, y: clampedY },
      },
    }))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // --- CONTROL HANDLERS (SIZE & ROTATION) ---
  const handleControlChange = (property, value) => {
    setCustomOverlays((prev) => ({
      ...prev,
      [mainImage]: {
        ...prev[mainImage],
        [property]: parseInt(value, 10),
      },
    }))
  }

  return productData ? (
    <>
      <Navbar />
      <div className='px-6 md:px-16 lg:px-32 pt-14 space-y-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-16'>
          <div className='px-5 lg:px-16 xl:px-20'>
            <div
              ref={mainImageContainerRef}
              className='relative rounded-lg overflow-hidden bg-gray-500/10 mb-4'
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <Image
                src={mainImage || productData.image[0]}
                alt='alt'
                className='w-full h-auto object-cover mix-blend-multiply'
                width={1280}
                height={720}
              />

              {/* --- NEW DESIGN AREA & OVERLAY LOGIC --- */}
              {!customOverlays[mainImage] ? (
                // If no overlay, show the design area with upload prompt
                <div
                  className='absolute inset-0 m-auto w-3/4 h-3/4 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-400/10'
                  onClick={handleDesignAreaClick}
                >
                  <UploadIcon />
                  <p className='text-sm text-gray-500 mt-2'>
                    Click to add your design
                  </p>
                </div>
              ) : (
                // If overlay exists, show the interactive image
                <div
                  className='absolute cursor-grab group'
                  style={{
                    left: `${customOverlays[mainImage].position.x}px`,
                    top: `${customOverlays[mainImage].position.y}px`,
                    width: `${customOverlays[mainImage].size}px`,
                    transform: `rotate(${customOverlays[mainImage].rotation}deg)`,
                  }}
                  onMouseDown={handleMouseDown}
                >
                  <Image
                    src={customOverlays[mainImage].src}
                    alt='custom overlay'
                    width={customOverlays[mainImage].size}
                    height={customOverlays[mainImage].size}
                    objectFit='contain'
                    className='pointer-events-none'
                  />
                  {/* Delete Button */}
                  <button
                    onClick={handleDeleteOverlay}
                    className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    &#x2715;
                  </button>
                </div>
              )}
            </div>

            {/* --- NEW CONTROLS FOR SIZE AND ROTATION --- */}
            {customOverlays[mainImage] && (
              <div className='mt-4 space-y-3'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Size
                  </label>
                  <input
                    type='range'
                    min='50'
                    max='400'
                    value={customOverlays[mainImage].size}
                    onChange={(e) =>
                      handleControlChange('size', e.target.value)
                    }
                    className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Rotation
                  </label>
                  <input
                    type='range'
                    min='0'
                    max='360'
                    value={customOverlays[mainImage].rotation}
                    onChange={(e) =>
                      handleControlChange('rotation', e.target.value)
                    }
                    className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                  />
                </div>
              </div>
            )}
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleCustomImageChange}
              style={{ display: 'none' }}
              accept='image/*'
            />

            <div className='grid grid-cols-4 gap-4 mt-4'>
              {productData.image.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(image)}
                  className={`cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 ${
                    mainImage === image ? 'ring-2 ring-orange-500' : ''
                  }`}
                >
                  <Image
                    src={image}
                    alt='alt'
                    className='w-full h-auto object-cover mix-blend-multiply'
                    width={1280}
                    height={720}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* --- Right side column (Product Details) --- */}
          <div className='flex flex-col'>
            <h1 className='text-3xl font-medium text-gray-800/90 mb-4'>
              {productData.name}
            </h1>
            <p className='text-gray-600 mt-3'>{productData.description}</p>
            <p className='text-3xl font-medium mt-6'>
              ${productData.offerPrice}
              <span className='text-base font-normal text-gray-800/60 line-through ml-2'>
                ${productData.price}
              </span>
            </p>
            <hr className='bg-gray-600 my-6' />
            {/* Rest of the product details... */}

            <div className='flex items-center mt-10 gap-4'>
              <button
                // You'll need to update `addToCart` to handle the new `customOverlays` object
                // if you want to save the final design.
                onClick={() => addToCart(productData._id, selectedColor, null)}
                className='w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition'
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  addToCart(productData._id, selectedColor, null)
                  router.push(user ? '/cart' : '')
                }}
                className='w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition'
              >
                Buy now
              </button>
            </div>
          </div>
        </div>
        {/* --- Featured Products Section --- */}
        <div className='flex flex-col items-center'>{/* ... */}</div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  )
}

export default Product
