import { NextResponse } from 'next/server'
import connectDB from '@/config/db'
import Product from '@/models/Product'

// GET handler to fetch a single product by its ID
export async function GET(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required.' },
        { status: 400 }
      )
    }

    await connectDB()

    const product = await Product.findById(id)

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error in /api/product/[id]:', error)
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred.' },
      { status: 500 }
    )
  }
}
