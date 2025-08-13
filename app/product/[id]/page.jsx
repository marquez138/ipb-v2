'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Loading from '@/components/Loading'
import NextImage from 'next/image'

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

const ProductPage = () => {
  const { id } = useParams()
  const { products } = useAppContext()
  const router = useRouter()

  const [productData, setProductData] = useState(null)
  const [selectedColor, setSelectedColor] = useState('')
  const [mainImage, setMainImage] = useState('')
  const [currentColorImages, setCurrentColorImages] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProductData = useCallback(() => {
    const product = products.find((p) => p._id === id)
    if (product) {
      setProductData(product)
      const initialColor = product.colors?.[0] || ''
      setSelectedColor(initialColor)

      const initialImages = product.imagesByColor?.[initialColor] || []
      setCurrentColorImages(initialImages)
      setMainImage(initialImages[0] || '')
    }
    setLoading(false)
  }, [id, products])

  useEffect(() => {
    fetchProductData()
  }, [fetchProductData])

  const handleColorSelect = (color) => {
    setSelectedColor(color)
    const newImages = productData.imagesByColor?.[color] || []
    setCurrentColorImages(newImages)
    setMainImage(newImages[0] || '')
  }

  if (loading) return <Loading />
  if (!productData)
    return <p className='text-center my-10'>Product not found.</p>

  return (
    <>
      <Navbar />
      <div className='px-6 md:px-16 lg:px-32 pt-14 space-y-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-16'>
          {/* Image Gallery */}
          <div className='px-5 lg:px-16'>
            <div className='rounded-lg overflow-hidden bg-gray-100 mb-4'>
              <NextImage
                src={mainImage || assets.upload_area}
                alt={productData.name}
                className='w-full h-auto object-cover'
                width={800}
                height={800}
                key={mainImage}
              />
            </div>
            <div className='grid grid-cols-4 gap-4'>
              {currentColorImages.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(image)}
                  className={`cursor-pointer rounded-lg overflow-hidden bg-gray-100 ${
                    mainImage === image ? 'ring-2 ring-orange-500' : ''
                  }`}
                >
                  <NextImage
                    src={image}
                    alt={`${selectedColor} view ${index + 1}`}
                    width={200}
                    height={200}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className='flex flex-col'>
            <h1 className='text-3xl font-bold text-gray-800'>
              {productData.name}
            </h1>
            <p className='text-gray-600 mt-3'>{productData.description}</p>
            <p className='text-3xl font-medium mt-6'>
              ${productData.offerPrice}
            </p>
            <hr className='my-6' />

            {/* Color Selector */}
            {productData.colors?.length > 0 && (
              <div className='mt-6'>
                <p className='text-sm font-medium text-gray-700 mb-2'>
                  Color: <span className='font-bold'>{selectedColor}</span>
                </p>
                <div className='flex gap-3'>
                  {productData.colors.map((color) => (
                    <div
                      key={color}
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
              </div>
            )}

            {/* "Start Designing" Button */}
            <div className='mt-10'>
              <button
                onClick={() => router.push(`/designer/${productData._id}`)}
                className='w-full py-3.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition'
              >
                Start Designing
              </button>
              <p className='text-xs text-center text-gray-500 mt-2'>
                Customize this product with your own artwork!
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default ProductPage
