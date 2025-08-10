'use client'
import React, { useState, useEffect } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image'

// --- Define your features here ---
// const featureList = [
//   { icon: assets.step1_icon, text: 'STEP1' },
//   { icon: assets.step2_icon, text: 'STEP2' },
//   { icon: assets.step3_icon, text: 'STEP3' },
//   { icon: assets.step4_icon, text: 'STEP4' },
// ]

// --- Define your features here ---
const trustFeatures = [
  {
    icon: assets.step1_icon,
    title: 'World-Class Support',
    description:
      'We build long-term professional relationships with our customers that you can rely on & trust.',
  },
  {
    icon: assets.step2_icon,
    title: 'Documentation & Tutorials',
    description:
      'Over 550 help files & 200 tutorial videos will make building your merch even easier.',
  },
  {
    icon: assets.step3_icon,
    title: '100% Built In-House',
    description:
      'Our platform is not reliant on 3rd party tools to deliver a reliable & stable experience.',
  },
  {
    icon: assets.step4_icon,
    title: 'Free Lifetime Updates',
    description:
      'Your store will receive free & regular updates, compatible with industry standards & trends.',
  },
]

// --- Custom Hook for the Animated Counter ---
const useAnimatedCounter = (endValue, duration = 2000) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime
    const animation = (currentTime) => {
      if (startTime === undefined) startTime = currentTime
      const timePassed = currentTime - startTime
      const progress = Math.min(timePassed / duration, 1)
      const currentCount = Math.floor(progress * endValue)
      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animation)
      }
    }
    requestAnimationFrame(animation)
  }, [endValue, duration])

  return count
}

const Features = () => {
  const websiteOwners = useAnimatedCounter(1027431)

  return (
    <div className='py-16 bg-gray-50'>
      <div className='max-w-6xl mx-auto px-4 text-center'>
        {/* --- Main Heading --- */}
        {/* <h2 className='text-4xl md:text-5xl font-bold text-gray-800'>
          {websiteOwners.toLocaleString()} Website Owners
        </h2>
        <h3 className='text-4xl md:text-5xl font-light text-gray-700 mt-1'>
          Features QuickCart
        </h3>
        <p className='mt-4 text-gray-500'>
          The #1 selling Website Builder on ThemeForest for 12+ years.
        </p> */}

        {/* --- Responsive Grid for Features --- */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 '>
          {trustFeatures.map((feature, index) => (
            <div key={index} className='flex flex-col items-center'>
              <Image
                src={feature.icon}
                alt=''
                width={60}
                height={60}
                className='h-16 w-auto'
              />
              <h4 className='font-bold text-lg mt-4 text-gray-800'>
                {feature.title}
              </h4>
              <p className='mt-2 text-gray-600 text-sm leading-relaxed'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Features
