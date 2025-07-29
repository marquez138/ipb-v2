import { v2 as cloudinary } from 'cloudinary'
import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request) {
  try {
    const { userId } = getAuth(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: 'not authorized' })
    }

    const formData = await request.formData()
    const image = formData.get('image')

    if (!image) {
      return NextResponse.json({ success: false, message: 'no file uploaded' })
    }

    const arrayBuffer = await image.arrayBuffer()
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

    return NextResponse.json({
      success: true,
      message: 'Upload successful',
      imageUrl: result.secure_url,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message })
  }
}
