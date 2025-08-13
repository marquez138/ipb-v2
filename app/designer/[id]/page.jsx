'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import NextImage from 'next/image'
import { useParams } from 'next/navigation'
import Loading from '@/components/Loading'
import { useAppContext } from '@/context/AppContext'
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

const viewFromUrl = (url = '') => {
  const u = url.toLowerCase()
  if (u.includes('sleeve')) return 'sleeve'
  if (u.includes('back')) return 'back'
  return 'front'
}

const Product = () => {
  const { id } = useParams()
  const { products, router, addToCart, user } = useAppContext()

  const [mainImage, setMainImage] = useState(null)
  const [productData, setProductData] = useState(null)
  const [selectedColor, setSelectedColor] = useState('')

  // images for the currently selected color
  const [currentColorImages, setCurrentColorImages] = useState([])

  // overlays keyed by view: front/back/sleeve
  const [customOverlays, setCustomOverlays] = useState({})
  const fileInputRef = useRef(null)

  // gesture state
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState(null) // 'move' | 'resize' | 'rotate'
  const [dragMeta, setDragMeta] = useState(null) // refs for gesture

  const mainImageContainerRef = useRef(null)
  const svgRef = useRef(null)
  const [quantitiesBySize, setQuantitiesBySize] = useState({})

  // --- [SVG VIEW STATE] ---
  const [selectedView, setSelectedView] = useState('front') // 'front' | 'back' | 'sleeve'
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    if (!mainImageContainerRef?.current) return
    const el = mainImageContainerRef.current
    const update = () => {
      const r = el.getBoundingClientRect()
      setContainerSize({ w: r.width, h: r.height })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Load product and prime images/views
  const fetchProductData = useCallback(() => {
    const product = products.find((p) => p._id === id)
    if (product) {
      setProductData(product)
      if (product.colors?.length && product.imagesByColor) {
        const initialColor = product.colors[0]
        const initialImages = product.imagesByColor[initialColor] || []
        setSelectedColor(initialColor)
        setCurrentColorImages(initialImages)
        setMainImage(initialImages[0] || null)
        if (initialImages[0]) setSelectedView(viewFromUrl(initialImages[0]))
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
    setMainImage(newImages[0] || null)
    if (newImages[0]) setSelectedView(viewFromUrl(newImages[0]))
  }

  const handleCustomImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target.result
        setCustomOverlays((prev) => ({
          ...prev,
          [selectedView]: {
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

  const handleDesignAreaClick = () => {
    fileInputRef.current?.click()
  }

  const handleDeleteOverlay = (e) => {
    e.stopPropagation()
    setCustomOverlays((prev) => {
      const next = { ...prev }
      delete next[selectedView]
      return next
    })
  }

  // --- [PRINT AREA CLAMP HELPERS] ---
  function getPrintBoundsPx() {
    let svg =
      svgRef.current || mainImageContainerRef?.current?.querySelector('svg')
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

  // gestures
  const handleMouseDown = (e) => {
    e?.stopPropagation?.()
    const overlayState = customOverlays[selectedView]
    if (!overlayState) return
    setIsDragging(true)
    setDragMode('move')
    setDragMeta({
      startX: e.clientX,
      startY: e.clientY,
      fromPos: { ...overlayState.position },
      fromSize: overlayState.size,
      fromRot: overlayState.rotation,
    })
  }

  const handleHandleDown = (type, corner) => {
    const overlayState = customOverlays[selectedView]
    if (!overlayState) return
    setIsDragging(true)
    setDragMode(type)
    const center = {
      x: overlayState.position.x + overlayState.size / 2,
      y: overlayState.position.y + overlayState.size / 2,
    }
    setDragMeta({
      type,
      corner,
      center,
      startX: null,
      startY: null,
      fromPos: { ...overlayState.position },
      fromSize: overlayState.size,
      fromRot: overlayState.rotation,
    })
  }

  const handleMouseMove = (eOrTouch) => {
    if (!isDragging) return
    const e = eOrTouch.touches ? eOrTouch.touches[0] : eOrTouch
    const overlay = customOverlays[selectedView]
    if (!overlay) return

    if (dragMode === 'move') {
      const dx = e.clientX - dragMeta.startX
      const dy = e.clientY - dragMeta.startY
      const newX = dragMeta.fromPos.x + dx
      const newY = dragMeta.fromPos.y + dy
      const { x, y } = clampToPrint(newX, newY, overlay.size)
      setCustomOverlays((prev) => ({
        ...prev,
        [selectedView]: { ...prev[selectedView], position: { x, y } },
      }))
      return
    }

    if (dragMode === 'resize') {
      const dx = e.clientX - (dragMeta.startX ?? e.clientX)
      const dy = e.clientY - (dragMeta.startY ?? e.clientY)
      const delta = Math.max(dx, dy)
      const newSize = Math.max(50, Math.min(800, dragMeta.fromSize + delta))
      const { x, y } = clampToPrint(
        overlay.position.x,
        overlay.position.y,
        newSize
      )
      setCustomOverlays((prev) => ({
        ...prev,
        [selectedView]: {
          ...prev[selectedView],
          position: { x, y },
          size: newSize,
        },
      }))
      return
    }

    if (dragMode === 'rotate') {
      const cx = dragMeta.center.x
      const cy = dragMeta.center.y
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI)
      const newRot = Math.round((angle + 360) % 360)
      setCustomOverlays((prev) => ({
        ...prev,
        [selectedView]: { ...prev[selectedView], rotation: newRot },
      }))
      return
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragMode(null)
    setDragMeta(null)
  }

  const handleControlChange = (property, value) => {
    setCustomOverlays((prev) => ({
      ...prev,
      [selectedView]: {
        ...prev[selectedView],
        [property]: parseInt(value, 10),
      },
    }))
  }

  const handleQuantityChange = (size, quantity) => {
    const numQuantity = Math.max(0, Number(quantity))
    setQuantitiesBySize((prev) => ({ ...prev, [size]: numQuantity }))
  }

  const handleAddToCart = (buyNow = false) => {
    if (!user) return toast('Please login.', { icon: '⚠️' })

    const itemsToAdd = Object.entries(quantitiesBySize)
      .filter(([_, q]) => q > 0)
      .map(([size, quantity]) => ({ size, quantity }))
    if (!itemsToAdd.length)
      return toast.error('Please enter a quantity for at least one size.')

    const containerRect = mainImageContainerRef.current.getBoundingClientRect()
    const { width: containerWidth, height: containerHeight } = containerRect

    const customizationsWithRatios = {}
    for (const [viewKey, overlay] of Object.entries(customOverlays)) {
      customizationsWithRatios[viewKey] = {
        src: overlay.src,
        rotation: overlay.rotation,
        xRatio: overlay.position.x / containerWidth,
        yRatio: overlay.position.y / containerHeight,
        sizeRatio: overlay.size / containerWidth,
      }
    }

    const customizations = Object.keys(customizationsWithRatios).length
      ? customizationsWithRatios
      : null
    addToCart(productData._id, selectedColor, customizations, itemsToAdd)
    toast.success('Added to cart!')
    if (buyNow) router.push('/cart')
  }

  return productData ? (
    <>
      <Navbar />
      <div className='px-6 md:px-16 lg:px-32 pt-14 space-y-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-16'>
          <div className='px-5 lg:px-16 xl:px-20'>
            {/* View Toggle */}
            <div className='mb-3 flex flex-wrap gap-2'>
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
              <button
                type='button'
                className='ml-2 px-3 py-1 rounded border bg-white hover:bg-gray-100'
                onClick={() => fileInputRef.current?.click()}
              >
                Upload artwork
              </button>
            </div>

            <div
              ref={mainImageContainerRef}
              className='relative rounded-lg overflow-hidden bg-gray-500/10 mb-4'
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              onTouchCancel={handleMouseUp}
              onClick={handleDesignAreaClick}
              style={{ minHeight: 480 }}
            >
              <SvgView
                ref={svgRef}
                view={selectedView}
                colorHex={getColorHex(selectedColor)}
                art={
                  customOverlays[selectedView]
                    ? {
                        src: customOverlays[selectedView].src,
                        xPx: customOverlays[selectedView].position.x,
                        yPx: customOverlays[selectedView].position.y,
                        sizePx: customOverlays[selectedView].size,
                        rotation: customOverlays[selectedView].rotation,
                      }
                    : null
                }
                containerW={containerSize.w}
                containerH={containerSize.h}
                onArtMouseDown={handleMouseDown}
                onHandleDown={handleHandleDown}
                className='w-full h-auto'
              />

              {!customOverlays[selectedView] && (
                <div className='absolute inset-0 m-auto w-3/4 h-3/4 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center pointer-events-none'>
                  <UploadIcon />
                  <p className='text-sm text-gray-500 mt-2'>
                    Click to add your design
                  </p>
                </div>
              )}
            </div>

            {/* Hidden file input for uploads (visually hidden, not display:none) */}
            <input
              id='artUpload'
              type='file'
              ref={fileInputRef}
              onChange={handleCustomImageChange}
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                opacity: 0,
                left: -9999,
                top: 'auto',
              }}
              accept='image/*'
            />

            {/* Thumbnails */}
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

            {/* Quantity by Size */}
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

            {/* Add to Cart / Buy Now */}
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
