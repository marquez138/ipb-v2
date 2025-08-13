// marquez138/ipb-v2/ipb-v2-9987ff656459b9ee12e8bebfdd8aeb8e6a45a8db/app/seller/page.jsx
'use client'
import React, { useState } from 'react'
import { assets, viewOptions } from '@/assets/assets' // Import viewOptions
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { colorSwatches } from '@/lib/colors'

const AddProduct = () => {
  const { getToken } = useAppContext()

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: 'Apparel',
    price: '',
    offerPrice: '',
    colors: [],
    views: [], // Add views to state
    imagesByColor: {},
  })

  const [selectedColor, setSelectedColor] = useState('')
  const [selectedView, setSelectedView] = useState({
    name: '',
    assetName: '',
  })

  const handleTextChange = (e) => {
    const { name, value } = e.target
    setProductData((prev) => ({ ...prev, [name]: value }))
  }

  // --- NEW: Handler to add a product view ---
  const handleAddView = () => {
    if (
      selectedView.assetName &&
      !productData.views.find((v) => v.assetName === selectedView.assetName)
    ) {
      const viewName =
        selectedView.name ||
        viewOptions.find((v) => v.assetName === selectedView.assetName)?.name
      const newView = { name: viewName, assetName: selectedView.assetName }

      setProductData((prev) => {
        const newImagesByColor = { ...prev.imagesByColor }
        // For each existing color, add a null placeholder for the new view's image
        Object.keys(newImagesByColor).forEach((color) => {
          newImagesByColor[color] = [...newImagesByColor[color], null]
        })

        return {
          ...prev,
          views: [...prev.views, newView],
          imagesByColor: newImagesByColor,
        }
      })
      setSelectedView({ name: '', assetName: '' }) // Reset selector
    } else {
      toast.error('Please select a unique view to add.')
    }
  }

  // --- NEW: Handler to remove a product view ---
  const handleRemoveView = (viewIndexToRemove) => {
    setProductData((prev) => {
      const newViews = prev.views.filter((_, i) => i !== viewIndexToRemove)
      const newImagesByColor = { ...prev.imagesByColor }
      Object.keys(newImagesByColor).forEach((color) => {
        newImagesByColor[color] = newImagesByColor[color].filter(
          (_, i) => i !== viewIndexToRemove
        )
      })
      return {
        ...prev,
        views: newViews,
        imagesByColor: newImagesByColor,
      }
    })
  }

  const handleAddColor = () => {
    if (selectedColor && !productData.colors.includes(selectedColor)) {
      setProductData((prev) => ({
        ...prev,
        colors: [...prev.colors, selectedColor],
        imagesByColor: {
          ...prev.imagesByColor,
          [selectedColor]: Array(prev.views.length).fill(null),
        },
      }))
    } else {
      toast.error('Please select or add a unique color.')
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

  // Submit handler remains largely the same, but now includes `views`
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (productData.views.length === 0) {
      return toast.error('Please add at least one product view.')
    }
    if (productData.colors.length === 0) {
      return toast.error('Please add at least one color.')
    }

    const toastId = toast.loading('Uploading images and adding product...')

    try {
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
                  uploadedImagesByColor[color] = Array(
                    productData.views.length
                  ).fill(null)
                }
                uploadedImagesByColor[color][index] = response.data.secure_url
              })
            uploadPromises.push(promise)
          } else {
            if (!uploadedImagesByColor[color]) {
              uploadedImagesByColor[color] = Array(
                productData.views.length
              ).fill(null)
            }
            // Keep null if no file was provided
            uploadedImagesByColor[color][index] = null
          }
        })
      }

      await Promise.all(uploadPromises)

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
        // Optionally reset form here
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
        {/* Product Info Fields (no change) */}
        <div className='flex flex-col gap-1'>
          <label className='font-medium'>Product Name</label>
          <input
            name='name'
            value={productData.name}
            onChange={handleTextChange}
            type='text'
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
          ></textarea>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1 flex flex-col gap-1'>
            <label className='font-medium'>Price</label>
            <input
              name='price'
              value={productData.price}
              onChange={handleTextChange}
              type='number'
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
              required
              className='input-style'
            />
          </div>
        </div>

        {/* --- NEW: View Management UI --- */}
        <div>
          <label className='font-medium'>Product Views</label>
          <div className='flex flex-col sm:flex-row gap-2 mt-2'>
            <select
              value={selectedView.assetName}
              onChange={(e) =>
                setSelectedView({ ...selectedView, assetName: e.target.value })
              }
              className='input-style flex-grow'
            >
              <option value=''>-- Select a View --</option>
              {viewOptions.map((v) => (
                <option key={v.assetName} value={v.assetName}>
                  {v.name}
                </option>
              ))}
            </select>
            <input
              type='text'
              placeholder='Custom view name (optional)'
              value={selectedView.name}
              onChange={(e) =>
                setSelectedView({ ...selectedView, name: e.target.value })
              }
              className='input-style'
            />
            <button
              type='button'
              onClick={handleAddView}
              className='px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300'
            >
              Add View
            </button>
          </div>
          <div className='flex flex-wrap gap-2 mt-2'>
            {productData.views.map((view, index) => (
              <div
                key={index}
                className='flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full'
              >
                <span>{view.name}</span>
                <button
                  type='button'
                  onClick={() => handleRemoveView(index)}
                  className='text-red-500 font-bold'
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Color Management UI (no change) */}
        <div>
          <label className='font-medium'>Product Colors</label>
          <div className='flex flex-col sm:flex-row gap-2 mt-2'>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className='input-style flex-grow'
            >
              <option value=''>-- Select a Color --</option>
              {colorSwatches.map((color) => (
                <option key={color.name} value={color.name}>
                  {' '}
                  {color.name}{' '}
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

        {/* --- UPDATED: Dynamic Image Upload UI based on Views and Colors --- */}
        <div className='space-y-4'>
          {productData.colors.map((color) => (
            <div key={color}>
              <h3 className='font-semibold text-lg'>{color} Images</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2'>
                {productData.views.map((view, viewIndex) => (
                  <div key={view.assetName}>
                    <p className='text-sm text-gray-600 mb-1'>{view.name}</p>
                    <label
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
                        alt={`${color} ${view.name}`}
                        width={112}
                        height={112}
                      />
                    </label>
                  </div>
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
