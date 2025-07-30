'use client'
import React, { useEffect, useState } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import Footer from '@/components/seller/Footer'
import Loading from '@/components/Loading'
import axios from 'axios'
import toast from 'react-hot-toast'
import CustomizedProductImage from '@/components/CustomizedProductImage' // Import the component

const Orders = () => {
  const { currency, getToken, user } = useAppContext()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSellerOrders = async () => {
    try {
      const token = await getToken()

      const { data } = await axios.get('/api/order/seller-orders', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.success) {
        setOrders(data.orders)
        setLoading(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (user) {
      fetchSellerOrders()
    }
  }, [user])

  return (
    <div className='flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm'>
      {loading ? (
        <Loading />
      ) : (
        <div className='md:p-10 p-4 space-y-5'>
          <h2 className='text-lg font-medium'>Orders</h2>
          <div className='max-w-5xl rounded-md'>
            <table className='min-w-full table-auto'>
              <thead className='text-left'>
                <tr>
                  <th className='text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium'>
                    Order Details
                  </th>
                  <th className='pb-6 md:px-4 px-1 text-gray-600 font-medium'>
                    Address
                  </th>
                  <th className='pb-6 md:px-4 px-1 text-gray-600 font-medium'>
                    Amount
                  </th>
                  <th className='pb-6 md:px-4 px-1 text-gray-600 font-medium'>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={index} className='border-t border-gray-500/20'>
                    {/* --- UPDATED: Order Items Display --- */}
                    <td className='py-4 md:px-4 px-1'>
                      {order.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className='flex items-start gap-4 mb-4'
                        >
                          <div className='flex flex-col gap-2'>
                            {item.product.imagesByColor?.[item.color]?.map(
                              (baseImg, viewIdx) => (
                                <CustomizedProductImage
                                  key={viewIdx}
                                  baseImageSrc={baseImg}
                                  overlay={item.customizations?.[baseImg]}
                                  className='w-20 h-20 object-contain bg-gray-100 rounded-lg p-1'
                                />
                              )
                            )}
                          </div>
                          <p className='flex flex-col gap-1'>
                            <span className='font-medium text-base'>
                              {item.product.name}
                            </span>
                            {item.color && (
                              <span className='text-xs'>
                                Color: {item.color}
                              </span>
                            )}
                            <span className='text-xs'>
                              Quantity: {item.quantity}
                            </span>
                            {item.customizations && (
                              <span className='text-xs text-green-600 font-semibold'>
                                ✓ Customized
                              </span>
                            )}
                          </p>
                        </div>
                      ))}
                    </td>
                    <td className='py-4 md:px-4 px-1 text-gray-600'>
                      <p>{order.address.fullName}</p>
                      <p>{order.address.area}</p>
                    </td>
                    <td className='py-4 md:px-4 px-1 font-medium text-gray-800'>
                      {currency}
                      {order.amount}
                    </td>
                    <td className='py-4 md:px-4 px-1'>
                      <p className='text-yellow-600 font-semibold'>
                        {order.status}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {new Date(order.date).toLocaleDateString()}
                      </p>
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

export default Orders
