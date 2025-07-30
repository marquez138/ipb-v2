'use client'
import React, { useEffect, useState } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Loading from '@/components/Loading'
import axios from 'axios'
import toast from 'react-hot-toast'
import CustomizedProductImage from '@/components/CustomizedProductImage' // Import the component

const MyOrders = () => {
  const { currency, getToken, user } = useAppContext()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/order/list', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (data.success) {
        setOrders(data.orders.reverse())
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
      fetchOrders()
    }
  }, [user])

  return (
    <>
      <Navbar />
      <div className='flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen'>
        <div className='space-y-5'>
          <h2 className='text-lg font-medium mt-6'>My Orders</h2>
          {loading ? (
            <Loading />
          ) : (
            <div className='max-w-5xl border-t border-gray-300 text-sm'>
              {orders.map((order, index) => (
                <div
                  key={index}
                  className='grid grid-cols-1 md:grid-cols-4 gap-4 items-start p-5 border-b border-gray-300'
                >
                  {/* --- UPDATED: Order Items Display --- */}
                  <div className='md:col-span-2'>
                    {order.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className='flex items-start gap-4 mb-4'
                      >
                        {/* Use the new component to render the final image */}
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
                            <span className='text-xs'>Color: {item.color}</span>
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
                  </div>

                  {/* Order Details */}
                  <div className='space-y-1'>
                    <p className='font-medium'>{order.address.fullName}</p>
                    <p>{order.address.area}</p>
                    <p>{`${order.address.city}, ${order.address.state}`}</p>
                    <p>{order.address.phoneNumber}</p>
                  </div>

                  <div className='flex flex-col space-y-1'>
                    <p className='font-medium'>
                      Amount: {currency}
                      {order.amount}
                    </p>
                    <p>Method: COD</p>
                    <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                    <p>
                      Status:{' '}
                      <span className='text-yellow-600 font-semibold'>
                        {order.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default MyOrders
