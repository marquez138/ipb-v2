'use client'
import React from 'react'
import { assets } from '@/assets/assets'
import OrderSummary from '@/components/OrderSummary'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { useAppContext } from '@/context/AppContext'

const Cart = () => {
  const {
    products,
    router,
    cartItems,
    addToCart, // Note: addToCart with customizations is complex from the cart page. This is for quantity increase.
    updateCartQuantity,
    getCartCount,
  } = useAppContext()

  return (
    <>
      <Navbar />
      <div className='flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20'>
        <div className='flex-1'>
          <div className='flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6'>
            <p className='text-2xl md:text-3xl text-gray-500'>
              Your <span className='font-medium text-orange-600'>Cart</span>
            </p>
            <p className='text-lg md:text-xl text-gray-500/80'>
              {getCartCount()} Items
            </p>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full table-auto'>
              <thead className='text-left'>
                <tr>
                  <th className='text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium'>
                    Product Details
                  </th>
                  <th className='pb-6 md:px-4 px-1 text-gray-600 font-medium'>
                    Price
                  </th>
                  <th className='pb-6 md:px-4 px-1 text-gray-600 font-medium'>
                    Quantity
                  </th>
                  <th className='pb-6 md:px-4 px-1 text-gray-600 font-medium'>
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(cartItems).map(([itemKey, itemData]) => {
                  const [productId, selectedColor] = itemKey.split('|')
                  const product = products.find((p) => p._id === productId)

                  if (!product) return null

                  return (
                    <tr key={itemKey}>
                      <td className='py-4 md:px-4 px-1'>
                        <div className='flex items-start gap-4'>
                          <Image
                            src={product.image[0]}
                            alt={product.name}
                            className='w-20 h-auto object-cover mix-blend-multiply bg-gray-100 rounded-lg p-1'
                            width={120}
                            height={120}
                          />
                          <div>
                            <p className='text-gray-800 font-medium'>
                              {product.name}
                            </p>
                            {selectedColor && (
                              <p className='text-xs text-gray-500 mt-1'>
                                Color: {selectedColor}
                              </p>
                            )}

                            {/* --- NEW: Display Customized Images --- */}
                            {itemData.customizations ? (
                              <div className='mt-2'>
                                <p className='text-xs text-gray-600 font-medium mb-1'>
                                  Your Designs:
                                </p>
                                <div className='flex gap-2 flex-wrap'>
                                  {Object.values(itemData.customizations).map(
                                    (imgSrc, idx) => (
                                      <Image
                                        key={idx}
                                        src={imgSrc}
                                        alt={`custom design ${idx + 1}`}
                                        className='w-12 h-12 object-cover bg-gray-200 rounded'
                                        width={48}
                                        height={48}
                                      />
                                    )
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className='text-xs text-gray-500 mt-1'>
                                Standard Product
                              </p>
                            )}
                            <button
                              className='text-xs text-orange-600 mt-2'
                              onClick={() => updateCartQuantity(itemKey, 0)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className='py-4 md:px-4 px-1 text-gray-600'>
                        ${product.offerPrice}
                      </td>
                      <td className='py-4 md:px-4 px-1'>
                        <div className='flex items-center md:gap-2 gap-1'>
                          <button
                            onClick={() =>
                              updateCartQuantity(itemKey, itemData.quantity - 1)
                            }
                          >
                            <Image
                              src={assets.decrease_arrow}
                              alt='decrease_arrow'
                              className='w-4 h-4'
                            />
                          </button>
                          <input
                            type='number'
                            value={itemData.quantity}
                            readOnly
                            className='w-8 border text-center appearance-none'
                          />
                          <button
                            onClick={() =>
                              updateCartQuantity(itemKey, itemData.quantity + 1)
                            }
                          >
                            <Image
                              src={assets.increase_arrow}
                              alt='increase_arrow'
                              className='w-4 h-4'
                            />
                          </button>
                        </div>
                      </td>
                      <td className='py-4 md:px-4 px-1 text-gray-600'>
                        ${(product.offerPrice * itemData.quantity).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => router.push('/all-products')}
            className='group flex items-center mt-6 gap-2 text-orange-600'
          >
            <Image
              className='group-hover:-translate-x-1 transition'
              src={assets.arrow_right_icon_colored}
              alt='arrow_right_icon_colored'
            />
            Continue Shopping
          </button>
        </div>
        <OrderSummary />
      </div>
    </>
  )
}

export default Cart
