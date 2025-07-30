import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import connectDB from '@/config/db'
import Product from '@/models/Product'
import authSeller from '@/lib/authSeller'

export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    const isSeller = await authSeller(userId)

    if (!isSeller) {
      return NextResponse.json({ success: false, message: 'Not authorized' })
    }

    // Read the JSON data sent from the client
    const productData = await request.json()

    const {
      name,
      description,
      category,
      price,
      offerPrice,
      colors,
      imagesByColor, // This now contains the final Cloudinary URLs
    } = productData

    // Basic validation
    if (!name || !description || !price || !colors || !imagesByColor) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields.',
      })
    }

    await connectDB()
    const newProduct = await Product.create({
      userId,
      name,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
      colors,
      imagesByColor,
      date: Date.now(),
    })

    return NextResponse.json({
      success: true,
      message: 'Product added successfully',
      newProduct,
    })
  } catch (error) {
    console.error('Error in /api/product/add:', error)
    return NextResponse.json({
      success: false,
      message: 'An internal server error occurred.',
    })
  }
}
