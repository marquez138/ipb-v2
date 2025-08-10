import React from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image'

// --- Define your product categories here ---
const categoryList = [
  {
    label: 'T-Shirts',
    title: 'SIGNATURE SUPER-SOFT TEE',
    image: assets.category_mens,
    link: '/all-products', // Link to the relevant category page
  },
  {
    label: 'Apparel',
    title: 'SUPER-SOFT HOODIE',
    image: assets.category_womens,
    link: '/all-products',
  },
  {
    label: 'Headwear',
    title: 'BEANIES',
    image: assets.category_juniors,
    link: '/all-products',
  },
  {
    label: 'Specialty Ink',
    title: 'DIGITAL INK',
    image: assets.category_hats, // Add this asset
    link: '/all-products',
  },
  {
    label: 'Promo Products',
    title: 'WOOTHOOP',
    image: assets.category_flasks, // Add this asset
    link: '/all-products',
  },
  {
    label: 'Stickers',
    title: 'STICKERS',
    image: assets.category_bags, // Add this asset
    link: '/all-products',
  },
]

const Categories = () => {
  return (
    <div className='py-16 my-8'>
      <div className=' max-w-7xl mx-auto px-6 md:px-16 lg:px-32'>
        <div className='mb-10 text-center'>
          <p className='text-sm font-semibold text-gray-500'>
            BRAND YOUR BRAND
          </p>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-800'>
            POPULAR PRODUCTS
          </h2>
        </div>

        {/* Responsive Grid for Categories */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {categoryList.map((category, index) => (
            <a
              href={category.link}
              key={index}
              className='group relative block rounded-lg overflow-hidden'
            >
              <Image
                src={category.image}
                alt={category.title}
                layout='responsive'
                width={500}
                height={500}
                className='w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300'
              />
              <div className='absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300'></div>
              <div className='absolute bottom-5 left-5 text-white'>
                <p className='text-xs font-medium uppercase'>
                  {category.label}
                </p>
                <h3 className='text-lg font-bold'>{category.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Categories
