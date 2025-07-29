'use client'
import { useEffect, useState } from 'react'
import { assets } from '@/assets/assets'
import ProductCard from '@/components/ProductCard'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Loading from '@/components/Loading'
import { useAppContext } from '@/context/AppContext'
import React from 'react'

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
    // add more as needed
  }
  return COLOR_MAP[colorName] || '#cccccc' // fallback to gray if not found
}

const Product = () => {
  const { id } = useParams()

  const { products, router, addToCart, user } = useAppContext()

  const [mainImage, setMainImage] = useState(null)
  const [productData, setProductData] = useState(null)
  const [customImage, setCustomImage] = useState(null)

  const [selectedColor, setSelectedColor] = useState('')

  const fetchProductData = async () => {
    const product = products.find((product) => product._id === id)
    setProductData(product)
  }

  useEffect(() => {
    fetchProductData()
  }, [id, products.length])

  const handleCustomImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCustomImage(e.target.files[0])
    }
  }

  return productData ? (
    <>
      <Navbar />
      <div className='px-6 md:px-16 lg:px-32 pt-14 space-y-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-16'>
          <div className='px-5 lg:px-16 xl:px-20'>
            <div className='rounded-lg overflow-hidden bg-gray-500/10 mb-4'>
              <Image
                src={mainImage || productData.image[0]}
                alt='alt'
                className='w-full h-auto object-cover mix-blend-multiply'
                width={1280}
                height={720}
              />
            </div>

            <div className='grid grid-cols-4 gap-4'>
              {productData.image.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(image)}
                  className='cursor-pointer rounded-lg overflow-hidden bg-gray-500/10'
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

          <div className='flex flex-col'>
            <h1 className='text-3xl font-medium text-gray-800/90 mb-4'>
              {productData.name}
            </h1>
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-0.5'>
                <Image
                  className='h-4 w-4'
                  src={assets.star_icon}
                  alt='star_icon'
                />
                <Image
                  className='h-4 w-4'
                  src={assets.star_icon}
                  alt='star_icon'
                />
                <Image
                  className='h-4 w-4'
                  src={assets.star_icon}
                  alt='star_icon'
                />
                <Image
                  className='h-4 w-4'
                  src={assets.star_icon}
                  alt='star_icon'
                />
                <Image
                  className='h-4 w-4'
                  src={assets.star_dull_icon}
                  alt='star_dull_icon'
                />
              </div>
              <p>(4.5)</p>
            </div>
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
                      onClick={() => setSelectedColor(color)}
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
            <div className='my-6'>
              <p className='text-sm text-gray-700 mb-2'>
                Customize with your own image:
              </p>
              <input
                type='file'
                onChange={handleCustomImageChange}
                className='text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100'
              />
              {customImage && (
                <p className='text-sm text-gray-600 mt-2'>
                  Selected file: <strong>{customImage.name}</strong>
                </p>
              )}
            </div>

            <div className='overflow-x-auto'>
              <table className='table-auto border-collapse w-full max-w-72'>
                <tbody>
                  <tr>
                    <td className='text-gray-600 font-medium'>Brand</td>
                    <td className='text-gray-800/50 '>Generic</td>
                  </tr>
                  <tr>
                    <td className='text-gray-600 font-medium'>Color</td>
                    <td className='text-gray-800/50 '>Multi</td>
                  </tr>
                  <tr>
                    <td className='text-gray-600 font-medium'>Category</td>
                    <td className='text-gray-800/50'>{productData.category}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className='flex items-center mt-10 gap-4'>
              <button
                onClick={() =>
                  addToCart(productData._id, selectedColor, customImage)
                }
                className='w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition'
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  addToCart(productData._id, selectedColor, customImage)
                  router.push(user ? '/cart' : '')
                }}
                className='w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition'
              >
                Buy now
              </button>
            </div>
          </div>
        </div>
        <div className='flex flex-col items-center'>
          <div className='flex flex-col items-center mb-4 mt-16'>
            <p className='text-3xl font-medium'>
              Featured{' '}
              <span className='font-medium text-orange-600'>Products</span>
            </p>
            <div className='w-28 h-0.5 bg-orange-600 mt-2'></div>
          </div>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full'>
            {products.slice(0, 5).map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
          <button className='px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition'>
            See more
          </button>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  )
}

export default Product
