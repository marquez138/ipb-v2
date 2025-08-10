'use client'
import React from 'react'
import HeaderSlider from '@/components/HeaderSlider'
import HomeProducts from '@/components/HomeProducts'
import Banner from '@/components/Banner'
import NewsLetter from '@/components/NewsLetter'
import FeaturedProduct from '@/components/FeaturedProduct'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Brands from '@/components/Brands'
import Features from '@/components/Features'
import Categories from '@/components/Categories'
import Reviews from '@/components/Reviews'
import Faq from '@/components/Faq'
import VideoHero from '@/components/VideoHero'

const Home = () => {
  return (
    <>
      <Navbar />
      <div className=' '>
        {/* <HeaderSlider /> */}
        <VideoHero />
        <Brands />
        <Features />
        <Categories />
        <Reviews />
        {/* <FeaturedProduct /> */}
        {/* <HomeProducts /> */}
        <Faq />
        <Banner />
        <NewsLetter />
      </div>
      <Footer />
    </>
  )
}

export default Home
