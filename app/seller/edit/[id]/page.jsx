'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { assets } from '@/assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'

const EditProduct = () => {
  const { getToken } = useAppContext()
  const router = useRouter()
  const { id } = useParams() // Get product ID from URL

  const [productData, setProductData] = useState(null)
  const [loading, setLoading] = useState(true)

  // --- Fetch existing product data ---
  const fetchProduct = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/product/${id}`)
      if (data.success) {
        // Set the state with the fetched product data
        setProductData(data.product)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to fetch product data.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  // --- Handlers are similar to AddProduct, but operate on the fetched state ---
  const handleTextChange = (e) => {
    const { name, value } = e.target
    setProductData((prev) => ({ ...prev, [name]: value }))
  }

  // Note: For simplicity, this example doesn't include logic for adding/removing colors or changing images.
  // That would require a more complex state management to track new vs. existing images.

  const handleSubmit = async (e) => {
    e.preventDefault()
    const toastId = toast.loading('Updating product...')

    try {
      const token = await getToken()

      // We only send the fields that can be updated.
      const payload = {
        id: productData._id,
        name: productData.name,
        description: productData.description,
        category: productData.category,
        price: productData.price,
        offerPrice: productData.offerPrice,
      }

      const { data } = await axios.put('/api/product/update', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.success) {
        toast.success('Product updated successfully!', { id: toastId })
        router.push('/seller/product-list')
      } else {
        toast.error(data.message, { id: toastId })
      }
    } catch (error) {
      toast.error('An error occurred while updating.', { id: toastId })
    }
  }

  if (loading) return <Loading />
  if (!productData) return <p>Product not found.</p>

  return (
    <div className='flex-1 min-h-screen'>
      <form
        onSubmit={handleSubmit}
        className='md:p-10 p-4 space-y-6 max-w-2xl mx-auto'
      >
        <h2 className='text-2xl font-bold mb-4'>Edit Product</h2>
        {/* --- Form fields pre-populated with productData --- */}
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
        <p className='text-sm text-gray-500'>
          Note: Color and image editing is not supported in this version.
        </p>

        <button
          type='submit'
          className='px-8 py-2.5 bg-orange-600 text-white font-medium rounded'
        >
          SAVE CHANGES
        </button>
      </form>
    </div>
  )
}

export default EditProduct
