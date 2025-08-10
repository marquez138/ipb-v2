'use client'
import React, { useEffect, useState } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import Footer from '@/components/seller/Footer'
import Loading from '@/components/Loading'
import axios from 'axios'
import toast from 'react-hot-toast'

const ProductList = () => {
  const { router, getToken, user } = useAppContext()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSellerProduct = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/product/seller-list', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (data.success) {
        setProducts(data.products)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchSellerProduct()
    }
  }, [user])

  // --- NEW: Handle Product Deletion ---
  const handleDelete = async (productId) => {
    if (
      confirm(
        'Are you sure you want to delete this product? This action cannot be undone.'
      )
    ) {
      const toastId = toast.loading('Deleting product...')
      try {
        const token = await getToken()
        const { data } = await axios.delete(`/api/product/delete`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { id: productId },
        })

        if (data.success) {
          toast.success('Product deleted successfully!', { id: toastId })
          // Refresh the product list
          fetchSellerProduct()
        } else {
          toast.error(data.message, { id: toastId })
        }
      } catch (error) {
        toast.error('An error occurred while deleting the product.', {
          id: toastId,
        })
      }
    }
  }

  const getThumbnail = (product) => {
    if (product.colors && product.colors.length > 0 && product.imagesByColor) {
      const firstColor = product.colors[0]
      const imagesForFirstColor = product.imagesByColor[firstColor]
      if (imagesForFirstColor && imagesForFirstColor.length > 0) {
        return imagesForFirstColor[0]
      }
    }
    return assets.upload_area
  }

  return (
    <div className='flex-1 min-h-screen flex flex-col justify-between'>
      {loading ? (
        <Loading />
      ) : (
        <div className='w-full md:p-10 p-4'>
          <h2 className='pb-4 text-lg font-medium'>All Products</h2>
          <div className='flex flex-col items-center max-w-5xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
            <table className='table-fixed w-full overflow-hidden'>
              <thead className='text-gray-900 text-sm text-left'>
                <tr>
                  <th className='w-2/5 px-4 py-3 font-medium truncate'>
                    Product
                  </th>
                  <th className='px-4 py-3 font-medium truncate max-sm:hidden'>
                    Category
                  </th>
                  <th className='px-4 py-3 font-medium truncate'>Price</th>
                  <th className='px-4 py-3 font-medium truncate'>Actions</th>
                </tr>
              </thead>
              <tbody className='text-sm text-gray-500'>
                {products.map((product) => (
                  <tr key={product._id} className='border-t border-gray-500/20'>
                    <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate'>
                      <div className='bg-gray-100 rounded p-2'>
                        <Image
                          src={getThumbnail(product)}
                          alt={product.name}
                          className='w-16 h-16 object-contain'
                          width={64}
                          height={64}
                        />
                      </div>
                      <span className='truncate w-full'>{product.name}</span>
                    </td>
                    <td className='px-4 py-3 max-sm:hidden'>
                      {product.category}
                    </td>
                    <td className='px-4 py-3'>${product.offerPrice}</td>
                    {/* --- NEW: Action Buttons --- */}
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() =>
                            router.push(`/seller/edit/${product._id}`)
                          }
                          className='text-blue-600 hover:underline'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className='text-red-600 hover:underline'
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}

export default ProductList
