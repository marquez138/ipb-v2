'use client'
import React, { useState } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const AddProduct = () => {
  const { getToken } = useAppContext()

  const [files, setFiles] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Earphone')
  const [price, setPrice] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [designTemplates, setDesignTemplates] = useState({
    front: '',
    back: '',
    sleeveRight: '',
    sleeveLeft: '',
  })

  const handleTemplateChange = (e, key) => {
    setDesignTemplates((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()

    formData.append('name', name)
    formData.append('description', description)
    formData.append('category', category)
    formData.append('price', price)
    formData.append('offerPrice', offerPrice)

    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i])
    }

    // Append design templates as a JSON string
    formData.append('designTemplates', JSON.stringify(designTemplates))

    try {
      const token = await getToken()

      const { data } = await axios.post('/api/product/add', formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.success) {
        toast.success(data.message)
        setFiles([])
        setName('')
        setDescription('')
        setCategory('Earphone')
        setPrice('')
        setOfferPrice('')
        setDesignTemplates({})
        // Reset file inputs visually
        document.getElementById('product-form').reset()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const templateOptions = Object.keys(assets.designTemplates)

  return (
    <div className='flex-1 min-h-screen flex flex-col justify-between'>
      <form
        id='product-form'
        onSubmit={handleSubmit}
        className='md:p-10 p-4 space-y-5 max-w-lg'
      >
        <div>
          <p className='text-base font-medium'>Product Image</p>
          <div className='flex flex-wrap items-center gap-3 mt-2'>
            {[...Array(4)].map((_, index) => (
              <label key={index} htmlFor={`image${index}`}>
                <input
                  onChange={(e) => {
                    const updatedFiles = [...files]
                    updatedFiles[index] = e.target.files[0]
                    setFiles(updatedFiles)
                  }}
                  type='file'
                  id={`image${index}`}
                  hidden
                />
                <Image
                  key={index}
                  className='max-w-24 cursor-pointer'
                  src={
                    files[index]
                      ? URL.createObjectURL(files[index])
                      : assets.upload_area
                  }
                  alt=''
                  width={100}
                  height={100}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Design Templates Section */}
        <div>
          <p className='text-base font-medium'>Design Templates</p>
          <div className='grid grid-cols-2 gap-4 mt-2'>
            <div>
              <label htmlFor='front-template' className='text-sm'>
                Front Side
              </label>
              <select
                id='front-template'
                onChange={(e) => handleTemplateChange(e, 'front')}
                className='block w-full text-sm text-gray-500 p-2 border rounded'
              >
                <option value=''>None</option>
                {templateOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor='back-template' className='text-sm'>
                Back Side
              </label>
              <select
                id='back-template'
                onChange={(e) => handleTemplateChange(e, 'back')}
                className='block w-full text-sm text-gray-500 p-2 border rounded'
              >
                <option value=''>None</option>
                {templateOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor='sleeveRight-template' className='text-sm'>
                Sleeve Right
              </label>
              <select
                id='sleeveRight-template'
                onChange={(e) => handleTemplateChange(e, 'sleeveRight')}
                className='block w-full text-sm text-gray-500 p-2 border rounded'
              >
                <option value=''>None</option>
                {templateOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor='sleeveLeft-template' className='text-sm'>
                Sleeve Left
              </label>
              <select
                id='sleeveLeft-template'
                onChange={(e) => handleTemplateChange(e, 'sleeveLeft')}
                className='block w-full text-sm text-gray-500 p-2 border rounded'
              >
                <option value=''>None</option>
                {templateOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

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

        <button
          type='submit'
          className='px-8 py-2.5 bg-orange-600 text-white font-medium rounded'
        >
          ADD
        </button>
      </form>
    </div>
  )
}

export default AddProduct
