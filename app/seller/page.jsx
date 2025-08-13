'use client'
import React, { useState } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { colorSwatches } from '@/lib/colors' // 1. Import the color data

const AddProduct = () => {
  const { getToken } = useAppContext()

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: 'Apparel',
    price: '',
    offerPrice: '',
    colors: [],
    imagesByColor: {},
  })

  // 2. State to hold the currently selected color from the dropdown
  const [selectedColor, setSelectedColor] = useState('')

  const handleTextChange = (e) => {
    const { name, value } = e.target
    setProductData((prev) => ({ ...prev, [name]: value }))
  }

  // 3. Update handleAddColor to use the selected color from the state
  const handleAddColor = () => {
    const colorToAdd = selectedColor
    if (colorToAdd && !productData.colors.includes(colorToAdd)) {
      setProductData((prev) => ({
        ...prev,
        colors: [...prev.colors, colorToAdd],
        imagesByColor: {
          ...prev.imagesByColor,
          [colorToAdd]: [null, null, null],
        },
      }))
    } else if (!colorToAdd) {
      toast.error('Please select a color to add.')
    } else {
      toast.error('This color has already been added.')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const toastId = toast.loading('Uploading images and adding product...')

    try {
      // Step 1: Upload images directly to Cloudinary
      const uploadedImagesByColor = {}
      const uploadPromises = []

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

      if (!cloudName || !uploadPreset) {
        toast.error('Cloudinary configuration missing.', { id: toastId })
        return
      }

      for (const color of productData.colors) {
        productData.imagesByColor[color].forEach((file, index) => {
          if (file) {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', uploadPreset)

            const promise = axios
              .post(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                formData
              )
              .then((response) => {
                if (!uploadedImagesByColor[color]) {
                  uploadedImagesByColor[color] = []
                }
                uploadedImagesByColor[color][index] = response.data.secure_url
              })
            uploadPromises.push(promise)
          }
        })
      }

      await Promise.all(uploadPromises)

      // Step 2: Send the product data (with Cloudinary URLs) to your backend
      const payload = {
        ...productData,
        imagesByColor: uploadedImagesByColor,
      }

      const token = await getToken()
      const { data } = await axios.post('/api/product/add', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.success) {
        toast.success('Product added successfully!', { id: toastId })
        // Reset form...
      } else {
        toast.error(data.message, { id: toastId })
      }
    } catch (error) {
      toast.error('An error occurred during upload.', { id: toastId })
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

        {/* --- UPDATED Color Management UI --- */}
        <div>
          <label className='font-medium'>Product Colors</label>
          <div className='flex flex-col sm:flex-row gap-2 mt-2'>
            {/* 4. Replace text input with a dropdown selector */}
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className='input-style flex-grow'
            >
              <option value=''>-- Select a Color --</option>
              {colorSwatches.map((color) => (
                <option key={color.name} value={color.name}>
                  {color.name}
                </option>
              ))}
            </select>

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
                <span
                  className='w-4 h-4 rounded-full border border-gray-400'
                  style={{
                    backgroundColor:
                      colorSwatches.find((c) => c.name === color)?.hex ||
                      '#FFFFFF',
                  }}
                ></span>
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
                      // --- FIX: Remove the unnecessary name attribute ---
                      // name='images' // REMOVE THIS LINE
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
