'use client'
import React, { useState } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import ColorSwatchSelect from '@/components/ColorSwatchSelect' // We can reuse this for color selection

const AddProduct = () => {
  const { getToken } = useAppContext()

  // --- NEW: Advanced State for Product Data ---
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: 'Apparel',
    price: '',
    offerPrice: '',
    colors: [],
    imagesByColor: {}, // Stores files: { "Black": [file1, file2], "White": [file3, file4] }
  })

  const [newColor, setNewColor] = useState('')

  // --- Handlers for Text Inputs ---
  const handleTextChange = (e) => {
    const { name, value } = e.target
    setProductData((prev) => ({ ...prev, [name]: value }))
  }

  // --- Handlers for Color Management ---
  const handleAddColor = () => {
    if (newColor && !productData.colors.includes(newColor)) {
      setProductData((prev) => ({
        ...prev,
        colors: [...prev.colors, newColor],
        imagesByColor: {
          ...prev.imagesByColor,
          [newColor]: [null, null, null], // Initialize with placeholders for 3 views
        },
      }))
      setNewColor('')
    }
  }

  const handleRemoveColor = (colorToRemove) => {
    setProductData((prev) => {
      const newColors = prev.colors.filter((c) => c !== colorToRemove)
      const newImagesByColor = { ...prev.imagesByColor }
      delete newImagesByColor[colorToRemove]
      return { ...prev, colors: newColors, imagesByColor: newImagesByColor }
    })
  }

  // --- Handler for Image Uploads ---
  const handleImageChange = (e, color, viewIndex) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProductData((prev) => {
        const updatedImages = [...prev.imagesByColor[color]]
        updatedImages[viewIndex] = file
        return {
          ...prev,
          imagesByColor: { ...prev.imagesByColor, [color]: updatedImages },
        }
      })
    }
  }

  // --- Updated Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    const toastId = toast.loading('Adding product...')

    try {
      const token = await getToken()
      const formData = new FormData()

      formData.append('name', productData.name)
      formData.append('description', productData.description)
      formData.append('category', productData.category)
      formData.append('price', productData.price)
      formData.append('offerPrice', productData.offerPrice)

      // Append colors array
      productData.colors.forEach((color) => {
        formData.append('colors[]', color)
      })

      // Append image files with structured keys
      for (const color of productData.colors) {
        productData.imagesByColor[color].forEach((file, index) => {
          if (file) {
            // Key format: "images_COLOR_INDEX" -> e.g., "images_Black_0"
            formData.append(`images_${color}_${index}`, file)
          }
        })
      }

      const { data } = await axios.post('/api/product/add', formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.success) {
        toast.success('Product added successfully!', { id: toastId })
        // Reset form state
        setProductData({
          name: '',
          description: '',
          category: 'Apparel',
          price: '',
          offerPrice: '',
          colors: [],
          imagesByColor: {},
        })
      } else {
        toast.error(data.message, { id: toastId })
      }
    } catch (error) {
      toast.error('An error occurred.', { id: toastId })
      console.error(error)
    }
  }

  return (
    <div className='flex-1 min-h-screen'>
      <form onSubmit={handleSubmit} className='md:p-10 p-4 space-y-6 max-w-2xl'>
        {/* --- Product Info Fields --- */}
        <div className='flex flex-col gap-1'>
          <label className='font-medium'>Product Name</label>
          <input
            name='name'
            value={productData.name}
            onChange={handleTextChange}
            type='text'
            placeholder='Type here'
            required
            className='input-style'
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label className='font-medium'>Product Description</label>
          <textarea
            name='description'
            value={productData.description}
            onChange={handleTextChange}
            rows={4}
            required
            className='input-style resize-none'
            placeholder='Write content here'
          ></textarea>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1 flex flex-col gap-1'>
            <label className='font-medium'>Category</label>
            <select
              name='category'
              value={productData.category}
              onChange={handleTextChange}
              className='input-style'
            >
              <option value='Apparel'>Apparel</option>
              <option value='Accessories'>Accessories</option>
              <option value='Electronics'>Electronics</option>
            </select>
          </div>
          <div className='flex-1 flex flex-col gap-1'>
            <label className='font-medium'>Price</label>
            <input
              name='price'
              value={productData.price}
              onChange={handleTextChange}
              type='number'
              placeholder='$20'
              required
              className='input-style'
            />
          </div>
          <div className='flex-1 flex flex-col gap-1'>
            <label className='font-medium'>Offer Price</label>
            <input
              name='offerPrice'
              value={productData.offerPrice}
              onChange={handleTextChange}
              type='number'
              placeholder='$15'
              required
              className='input-style'
            />
          </div>
        </div>

        {/* --- Color Management UI --- */}
        <div>
          <label className='font-medium'>Product Colors</label>
          <div className='flex gap-2 mt-2'>
            <input
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              type='text'
              placeholder='e.g., Black'
              className='input-style flex-grow'
            />
            <button
              type='button'
              onClick={handleAddColor}
              className='px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300'
            >
              Add Color
            </button>
          </div>
          <div className='flex flex-wrap gap-2 mt-2'>
            {productData.colors.map((color) => (
              <div
                key={color}
                className='flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full'
              >
                <span>{color}</span>
                <button
                  type='button'
                  onClick={() => handleRemoveColor(color)}
                  className='text-red-500 font-bold'
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* --- Dynamic Image Upload UI --- */}
        <div className='space-y-4'>
          {productData.colors.map((color) => (
            <div key={color}>
              <h3 className='font-semibold text-lg'>{color} Images</h3>
              <p className='text-sm text-gray-500'>
                Add up to 3 views (e.g., Front, Back, Sleeve).
              </p>
              <div className='flex flex-wrap items-center gap-3 mt-2'>
                {[...Array(3)].map((_, viewIndex) => (
                  <label
                    key={viewIndex}
                    htmlFor={`${color}-${viewIndex}`}
                    className='cursor-pointer'
                  >
                    <input
                      onChange={(e) => handleImageChange(e, color, viewIndex)}
                      type='file'
                      id={`${color}-${viewIndex}`}
                      hidden
                    />
                    <Image
                      className='w-28 h-28 object-cover border-2 border-dashed rounded-md p-1'
                      src={
                        productData.imagesByColor[color]?.[viewIndex]
                          ? URL.createObjectURL(
                              productData.imagesByColor[color][viewIndex]
                            )
                          : assets.upload_area
                      }
                      alt={`${color} view ${viewIndex + 1}`}
                      width={112}
                      height={112}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type='submit'
          className='px-8 py-2.5 bg-orange-600 text-white font-medium rounded'
        >
          ADD PRODUCT
        </button>
      </form>
    </div>
  )
}

export default AddProduct
