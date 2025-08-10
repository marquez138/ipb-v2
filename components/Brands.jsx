import React from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image'

// --- Define your logos here ---
const logos = [
  { name: 'Gildan', src: assets.gildan_logo },
  { name: 'Bella Canvas', src: assets.bellacanvas_logo },
  { name: 'Next Level', src: assets.nextlevel_logo },
  { name: 'Hanes', src: assets.hanes_logo },
  { name: 'Alternative', src: assets.alternative_logo },

  // Add all your other logos here
  // { name: 'Harding', src: assets.harding_logo },
  // { name: 'Word of Life', src: assets.wordoflife_logo },
]

const Brands = () => {
  return (
    <div className='bg-amber-100/50 py-8 px-4  '>
      <div className='max-w-7xl mx-auto'>
        <h2 className='text-center text-3xl font-bold tracking-wider text-gray-800 mb-6'>
          MOST POPULAR APPAREL BRANDS
        </h2>
        <div className='flex flex-wrap items-center justify-center gap-x-8 md:gap-x-16 gap-y-4'>
          {logos.map((logo) => (
            <div key={logo.name} className='relative h-[6em] w-[10em]'>
              <Image
                src={logo.src}
                alt={`${logo.name} logo`}
                layout='fill'
                objectFit='contain'
                className='grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300'
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Brands
