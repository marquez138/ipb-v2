import React from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image'

// --- Define your review data here ---
const reviewList = [
  {
    avatar: assets.reviews_image1,
    quote:
      'Super professional. Love the free example shirt. And the stickers. Love super soft shirts. Design quality is great and reflects what my creative team made at church. 10/10.',
    name: 'Jake M.',
    company: 'Great Lakes Church',
  },
  {
    avatar: assets.reviews_image1,
    quote:
      'I had a time-sensitive order that was relatively small and the Sunday Cool team was able to get it all designed, printed, and shipped FAST! It was amazing!!!',
    name: 'Eric K.',
    company: 'First Baptist Church Plains',
  },
  {
    avatar: assets.reviews_image1, // Add this asset
    quote:
      'We had a vision and Sunday Cool made it come to life! The team was easy to work with, the process was painless, and the product is beautiful.',
    name: 'Jackie S.',
    company: 'Fellowship Alliance Chapel',
  },
  {
    avatar: assets.reviews_image1, // Add this asset
    quote:
      'When I placed our order, it was right up against a deadline to get it into production. Our sales rep recognized the urgency and got our quote and artwork pushed through.',
    name: 'Daniel A.',
    company: 'One Community Church',
  },
  {
    avatar: assets.reviews_image1, // Add this asset
    quote:
      'I always love ordering from Sunday Cool. Shirts always turn out great and are super duplicate, and everyone loves wearing them!',
    name: 'Caleb K.',
    company: 'Redeemer Presbytarian',
  },
]

const Reviews = () => {
  // Duplicate the reviews to create a seamless loop
  const duplicatedReviews = [...reviewList, ...reviewList]

  return (
    <div className='py-20 my-10 bg-white'>
      <div className='max-w-6xl mx-auto px-4 text-center'>
        <h2 className='text-3xl md:text-4xl font-bold text-gray-800'>
          WHAT OUR <span className='bg-yellow-300 px-2'>NEW BFF'S</span>
        </h2>
        <h3 className='text-3xl md:text-4xl font-bold text-gray-800 mt-1'>
          ARE SAYING ABOUT US
        </h3>
      </div>

      {/* --- Infinite Scrolling Container --- */}
      <div className='w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)] mt-12'>
        <ul className='flex items-center justify-center md:justify-start [&_li]:mx-4 animate-infinite-scroll'>
          {duplicatedReviews.map((review, index) => (
            <li
              key={index}
              className='bg-cyan-100/60 rounded-lg p-6 w-[350px] flex-shrink-0'
            >
              <div className='flex flex-col items-center text-center'>
                {/* <Image
                  src={review.avatar}
                  alt={`${review.name}'s avatar`}
                  width={200}
                  height={300}
                  className=' -mt-12 mb-4'
                /> */}
                <Image
                  src={review.avatar}
                  alt={`${review.name}'s avatar`}
                  layout='responsive'
                  width={500}
                  height={500}
                  className='w-full h-full object-cover mb-4 rounded-lg'
                />
                <p className='text-gray-700 text-sm leading-relaxed h-32'>
                  {review.quote}
                </p>
                <p className='font-bold text-gray-800 mt-4'>{review.name}</p>
                <p className='text-xs text-gray-500'>{review.company}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Reviews
