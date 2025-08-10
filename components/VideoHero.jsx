import React from 'react'

const VideoHero = () => {
  return (
    <div className='bg-[#2F2C06] overflow-hidden'>
      <div className=''>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[60vh]'>
          {/* Left Column: Text Content */}
          <div className='text-center md:text-left px-12 max-w-xl mx-auto'>
            <h1 className='text-4xl md:text-6xl font-extrabold text-white leading-tight'>
              Custom T-shirts
            </h1>
            <p className='mt-4 text-lg text-gray-300'>
              Design your own custom t-shirts to wear, gift, or sell online.
              Personalize the perfect t-shirt in minutes and we'll ship it
              worldwide - on demand, no hassle.
            </p>
            <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start'>
              <button className='px-8 py-3 bg-green-500 text-black font-semibold rounded-md hover:bg-green-600 transition-colors'>
                Start designing
              </button>
              <button className='px-8 py-3 bg-transparent border border-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors'>
                See t-shirts
              </button>
            </div>
            <p className='mt-6 text-sm text-gray-400 text-center md:text-left'>
              Top brands and styles · No order minimum · Free design tools
            </p>
          </div>

          {/* Right Column: Looping Video */}
          <div className='relative w-full h-64 md:h-full flex items-center justify-center'>
            <video
              className='w-full h-auto rounded-lg'
              src='/videos/hero_clip.mp4'
              autoPlay
              loop
              muted
              playsInline
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoHero
