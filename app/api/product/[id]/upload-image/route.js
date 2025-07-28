import { v2 as cloudinary } from 'cloudinary'
import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import connectDB from '@/config/db'
import Product from '@/models/Product'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request, { params }) {
  try {
    const { userId } = getAuth(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: 'not authorized' })
    }

    const formData = await request.formData()
    const file = formData.get('image')
    const { id } = params

    if (!file) {
      return NextResponse.json({ success: false, message: 'no file uploaded' })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      )
      stream.end(buffer)
    })

    const imageUrl = result.secure_url

    await connectDB()

    const product = await Product.findById(id)

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' })
    }

    product.image.push(imageUrl)
    await product.save()

    return NextResponse.json({
      success: true,
      message: 'Upload successful',
      product,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message })
  }
}
