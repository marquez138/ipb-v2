'use client'
import React, { useEffect, useState } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import Footer from '@/components/seller/Footer'
import Loading from '@/components/Loading'
import axios from 'axios'
import toast from 'react-hot-toast'

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
          <div className='max-w-4xl rounded-md'>
            <table className='min-w-full table-auto'>
              <thead className='text-left'>
                <tr>
                  <th className='text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium'>
                    Product Details
                  </th>
                  <th className='pb-6 md:px-4 px-1 text-gray-600 font-medium'>
                    Address
                  </th>
                  <th className='pb-6 md:px-4 px-1 text-gray-600 font-medium'>
                    Amount
                  </th>
                  <th className='pb-6 md:px-4 px-1 text-gray-600 font-medium'>
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={index} className='border-t border-gray-500/20'>
                    <td className='flex items-center gap-4 py-4 md:px-4 px-1'>
                      <div className='flex-1 flex gap-5 max-w-80'>
                        <Image
                          className='max-w-16 max-h-16 object-cover'
                          src={order.items[0].customImage || assets.box_icon}
                          alt='box_icon'
                          width={64}
                          height={64}
                        />
                        <p className='flex flex-col gap-3'>
                          <span className='font-medium'>
                            {order.items
                              .map(
                                (item) =>
                                  `${item.product.name} ${
                                    item.customImage ? '(Customized)' : ''
                                  } x ${item.quantity}`
                              )
                              .join(', ')}
                          </span>
                          <span>Items : {order.items.length}</span>
                        </p>
                      </div>
                    </td>
                    <td className='py-4 md:px-4 px-1 text-gray-600'>
                      <p>
                        <span className='font-medium'>
                          {order.address.fullName}
                        </span>
                        <br />
                        <span>{order.address.area}</span>
                        <br />
                        <span>{`${order.address.city}, ${order.address.state}`}</span>
                        <br />
                        <span>{order.address.phoneNumber}</span>
                      </p>
                    </td>
                    <td className='py-4 md:px-4 px-1 text-gray-600'>
                      <p className='font-medium my-auto'>
                        {currency}
                        {order.amount}
                      </p>
                    </td>
                    <td className='py-4 md:px-4 px-1 text-gray-600'>
                      <p className='flex flex-col'>
                        <span>Method : COD</span>
                        <span>
                          Date : {new Date(order.date).toLocaleDateString()}
                        </span>
                        <span>Payment : Pending</span>
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
