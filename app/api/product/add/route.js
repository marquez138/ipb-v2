import { v2 as cloudinary } from 'cloudinary'
import { getAuth } from '@clerk/nextjs/server'
import authSeller from '@/lib/authSeller'
import { NextResponse } from 'next/server'
import connectDB from '@/config/db'
import Product from '@/models/Product'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request) {
  try {
    const { userId } = getAuth(request)

    const isSeller = await authSeller(userId)
    if (!isSeller) {
      return NextResponse.json({ success: false, message: 'Not authorized' })
    }

    const formData = await request.formData()

    const name = formData.get('name')
    const description = formData.get('description')
    const category = formData.get('category')
    const price = formData.get('price')
    const offerPrice = formData.get('offerPrice')
    const colors = formData.getAll('colors[]')

    const imagesByColor = {}

    // --- FIX: Look for unique file keys and rebuild the object ---
    for (const color of colors) {
      imagesByColor[color] = []
      // Assuming a max of 3 views, loop to find the files for this color
      for (let i = 0; i < 3; i++) {
        const fileKey = `images_${color}_${i}`
        const file = formData.get(fileKey) // Use .get() for unique keys

        if (file) {
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: 'auto' },
              (error, result) => {
                if (error) reject(error)
                else resolve(result)
              }
            )
            stream.end(buffer)
          })

          imagesByColor[color].push(result.secure_url)
        }
      }
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
    return NextResponse.json({ success: false, message: error.message })
  }
}
