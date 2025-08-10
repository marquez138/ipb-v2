import React, { useState, useEffect } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image'

const HeaderSlider = () => {
  // --- UPDATED: Data structure now includes mobile and desktop images ---
  const sliderData = [
    {
      id: 1,
      title: 'Experience Pure Sound - Your Perfect Headphones Awaits!',
      offer: 'Limited Time Offer 30% Off',
      buttonText1: 'Buy now',
      buttonText2: 'Find more',
      // Assumes you have different images for mobile and desktop
      bgImage: {
        mobile: assets.girl_with_headphone_image.src,
        desktop: assets.header_main_image1.src,
      },
    },
    // {
    //   id: 2,
    //   title: 'Next-Level Gaming Starts Here - Discover PlayStation 5 Today!',
    //   offer: 'Hurry up only few lefts!',
    //   buttonText1: 'Shop Now',
    //   buttonText2: 'Explore Deals',
    //   bgImage: {
    //     mobile: assets.sm_controller_image.src,
    //     desktop: assets.header_playstation_image.src,
    //   },
    // },
    // {
    //   id: 3,
    //   title: 'Power Meets Elegance - Apple MacBook Pro is Here for you!',
    //   offer: 'Exclusive Deal 40% Off',
    //   buttonText1: 'Order Now',
    //   buttonText2: 'Learn More',
    //   bgImage: {
    //     mobile: assets.boy_with_laptop_image.src,
    //     desktop: assets.header_macbook_image.src,
    //   },
    // },
  ]

  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length)
    }, 4000) // Increased interval for a better viewing experience
    return () => clearInterval(interval)
  }, [sliderData.length])

  const handleSlideChange = (index) => {
    setCurrentSlide(index)
  }

  return (
    <div className='overflow-hidden relative w-full mt-6 rounded-3xl'>
      <div
        className='flex transition-transform duration-700 ease-in-out'
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide) => (
          <div
            key={slide.id}
            className='relative flex items-center justify-start min-w-full h-[50vh] md:h-[48vh] bg-cover bg-center text-white'
          >
            {/* --- NEW: Responsive Background Images --- */}
            {/* Mobile Image */}
            <div
              className='absolute inset-0 md:hidden'
              style={{
                backgroundImage: `url(${slide.bgImage.mobile})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            ></div>
            {/* Desktop Image */}
            <div
              className='absolute inset-0 hidden md:block'
              style={{
                backgroundImage: `url(${slide.bgImage.desktop})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            ></div>

            {/* Overlay for better text readability */}
            <div className='absolute inset-0 bg-gradient-to-r from-black/10 via-black/20 to-transparent'></div>

            <div className='relative z-10 p-8 md:p-14'>
              <p className='md:text-base text-orange-600 pb-1 font-semibold'>
                {slide.offer}
              </p>
              <h1 className='max-w-md md:text-[40px] md:leading-[48px] text-2xl font-bold'>
                {slide.title}
              </h1>
              <div className='flex items-center mt-4 md:mt-6 '>
                <button className='md:px-10 px-7 md:py-2.5 py-2 bg-orange-600 rounded-full text-white font-medium hover:bg-orange-700 transition-colors'>
                  {slide.buttonText1}
                </button>
                <button className='group flex items-center gap-2 px-6 py-2.5 font-medium hover:text-black'>
                  {slide.buttonText2}
                  <Image
                    className='group-hover:translate-x-1 transition-transform'
                    src={assets.arrow_icon}
                    alt='arrow_icon'
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Slider Navigation Dots --- */}
      <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2'>
        {sliderData.map((_, index) => (
          <div
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2.5 w-2.5 rounded-full cursor-pointer transition-all ${
              currentSlide === index ? 'w-6 bg-orange-600' : 'bg-white/80'
            }`}
          ></div>
        ))}
      </div>
    </div>
  )
}

export default HeaderSlider
