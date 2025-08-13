'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { assets } from '@/assets/assets'
import ProductCard from '@/components/ProductCard'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import NextImage from 'next/image'
import { useParams } from 'next/navigation'
import Loading from '@/components/Loading'
import { useAppContext } from '@/context/AppContext'
import React from 'react'
import toast from 'react-hot-toast'
import SvgView from '@/components/SvgView'

// Define the available sizes
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']

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
  }
  return COLOR_MAP[colorName] || '#cccccc'
}

const Product = () => {
  const { id } = useParams()
  const { products, router, addToCart, user } = useAppContext()

  const [mainImage, setMainImage] = useState(null)
  const [productData, setProductData] = useState(null)
  const [selectedColor, setSelectedColor] = useState('')

  // This state now holds the images for the currently selected color
  const [currentColorImages, setCurrentColorImages] = useState([])

  const [customOverlays, setCustomOverlays] = useState({})
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mainImageContainerRef = useRef(null)
  const [quantitiesBySize, setQuantitiesBySize] = useState({})

  // --- UPDATED: Simplified to use the new data structure directly ---
  const fetchProductData = useCallback(() => {
    const product = products.find((product) => product._id === id)
    if (product) {
      setProductData(product)

      // Directly use the imagesByColor object from the product data
      if (
        product.colors &&
        product.colors.length > 0 &&
        product.imagesByColor
      ) {
        const initialColor = product.colors[0]
        const initialImages = product.imagesByColor[initialColor] || []

        setSelectedColor(initialColor)
        setCurrentColorImages(initialImages)
        setMainImage(initialImages[0] || null) // Set to the first view of the first color
      }
    }
  }, [id, products])

  useEffect(() => {
    fetchProductData()
  }, [fetchProductData])

  const handleColorSelect = (color) => {
    setSelectedColor(color)
    const newImages = productData.imagesByColor[color] || []
    setCurrentColorImages(newImages)
    setMainImage(newImages[0] || null) // Reset to the first view of the newly selected color
  }

  const handleCustomImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()

      reader.onload = (event) => {
        const dataUrl = event.target.result
        setCustomOverlays((prev) => ({
          ...prev,
          [mainImage]: {
            src: dataUrl,
            position: { x: 50, y: 50 },
            size: 150,
            rotation: 0,
          },
        }))
      }

      reader.readAsDataURL(file)
    }
    e.target.value = null
  }

  // ...(The rest of your handler functions and JSX remain exactly the same)...
  const handleDesignAreaClick = () => {
    fileInputRef.current.click()
  }

  const handleDeleteOverlay = (e) => {
    e.stopPropagation()
    const newOverlays = { ...customOverlays }
    delete newOverlays[mainImage]
    setCustomOverlays(newOverlays)
  }

  // --- [PRINT AREA CLAMP HELPERS] ---
  function getPrintBoundsPx() {
    const svg = svgRef.current
    if (!svg || !mainImageContainerRef?.current) return null
    const r = mainImageContainerRef.current.getBoundingClientRect()
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

  const handleControlChange = (property, value) => {
    setCustomOverlays((prev) => ({
      ...prev,
      [mainImage]: {
        ...prev[mainImage],
        [property]: parseInt(value, 10),
      },
    }))
  }

  const handleQuantityChange = (size, quantity) => {
    const numQuantity = Math.max(0, Number(quantity)) // Ensure quantity is not negative
    setQuantitiesBySize((prev) => ({
      ...prev,
      [size]: numQuantity,
    }))
  }

  const handleAddToCart = (buyNow = false) => {
    if (!user) {
      return toast('Please login.', { icon: '⚠️' })
    }

    const itemsToAdd = Object.entries(quantitiesBySize)
      .filter(([size, quantity]) => quantity > 0)
      .map(([size, quantity]) => ({ size, quantity }))

    if (itemsToAdd.length === 0) {
      return toast.error('Please enter a quantity for at least one size.')
    }

    const containerRect = mainImageContainerRef.current.getBoundingClientRect()
    const { width: containerWidth, height: containerHeight } = containerRect

    const customizationsWithRatios = {}

    for (const [baseImageUrl, overlay] of Object.entries(customOverlays)) {
      customizationsWithRatios[baseImageUrl] = {
        src: overlay.src,
        rotation: overlay.rotation,
        xRatio: overlay.position.x / containerWidth,
        yRatio: overlay.position.y / containerHeight,
        sizeRatio: overlay.size / containerWidth,
      }
    }

    const customizations =
      Object.keys(customizationsWithRatios).length > 0
        ? customizationsWithRatios
        : null

    // Pass the array of items to the cart
    addToCart(productData._id, selectedColor, customizations, itemsToAdd)

    toast.success('Added to cart!')
    if (buyNow) {
      router.push('/cart')
    }
  }

  // ... (rest of the component logic)

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
              onClick={handleDesignAreaClick}
            >
              <SvgView
                ref={svgRef}
                view={selectedView}
                colorHex={
                  getColorHex ? getColorHex(selectedColor) : selectedColor
                }
                art={
                  customOverlays[mainImage]
                    ? {
                        src: customOverlays[mainImage].src,
                        xPx: customOverlays[mainImage].position.x,
                        yPx: customOverlays[mainImage].position.y,
                        sizePx: customOverlays[mainImage].size,
                        rotation: customOverlays[mainImage].rotation,
                      }
                    : null
                }
                containerW={containerSize.w}
                containerH={containerSize.h}
                onArtMouseDown={handleMouseDown}
                className='w-full h-auto'
              />

              {/* <NextImage
                src={mainImage || assets.upload_area}
                alt={productData.name || 'product image'}
                className='w-full h-auto object-cover'
                width={1280}
                height={720}
                key={mainImage} // Add key to force re-render on image change
              /> */}
              {!customOverlays[mainImage] ? (
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
                  <NextImage
                    src={customOverlays[mainImage].src}
                    alt='custom overlay'
                    width={customOverlays[mainImage].size}
                    height={customOverlays[mainImage].size}
                    objectFit='contain'
                    className='pointer-events-none'
                  />
                  <button
                    onClick={handleDeleteOverlay}
                    className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    &#x2715;
                  </button>
                </div>
              )}
            </div>

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

            {/* --- This thumbnail section now correctly shows all views for the selected color --- */}
            <div className='grid grid-cols-4 gap-4 mt-4'>
              {currentColorImages.map((image, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setMainImage(image)
                    setSelectedView(viewFromUrl(image))
                  }}
                  className={`cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 ${
                    mainImage === image ? 'ring-2 ring-orange-500' : ''
                  }`}
                >
                  <NextImage
                    src={image}
                    alt={`${selectedColor} view ${index + 1}`}
                    className='w-full h-auto object-cover'
                    width={1280}
                    height={720}
                  />
                </div>
              ))}
            </div>
          </div>

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

            {productData.colors?.length > 0 && (
              <div className='mt-6'>
                <p className='text-sm text-gray-700 mb-2'>Choose a Color:</p>
                <div className='flex gap-3'>
                  {productData.colors.map((color, index) => (
                    <div
                      key={index}
                      onClick={() => handleColorSelect(color)}
                      className={`w-8 h-8 rounded-full cursor-pointer border-2 transition ${
                        selectedColor === color
                          ? 'ring-2 ring-offset-2 ring-orange-500'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: getColorHex(color) }}
                      title={color}
                    ></div>
                  ))}
                </div>
                {selectedColor && (
                  <p className='text-sm text-gray-600 mt-2'>
                    Selected Color: <strong>{selectedColor}</strong>
                  </p>
                )}
              </div>
            )}
            <hr className='bg-gray-600 my-6' />
            {/* --- NEW: Quantity by Size Inputs --- */}
            <div className='my-6'>
              <p className='font-medium text-gray-700 mb-2'>Quantity by Size</p>
              <div className='grid grid-cols-4 gap-3'>
                {SIZES.map((size) => (
                  <div key={size}>
                    <label
                      htmlFor={`quantity-${size}`}
                      className='block text-sm text-gray-600'
                    >
                      {size}
                    </label>
                    <input
                      id={`quantity-${size}`}
                      type='number'
                      min='0'
                      value={quantitiesBySize[size] || ''}
                      onChange={(e) =>
                        handleQuantityChange(size, e.target.value)
                      }
                      className='w-full border-gray-300 rounded-md shadow-sm p-2 text-center'
                      placeholder='0'
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ... Add to Cart / Buy Now buttons ... */}
            <div className='flex items-center mt-10 gap-4'>
              <button
                onClick={() => handleAddToCart(false)}
                className='w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition'
              >
                Add to Cart
              </button>
              <button
                onClick={() => handleAddToCart(true)}
                className='w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition'
              >
                Buy now
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  )
}

export default Product
