import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import connectDB from '@/config/db'
import Product from '@/models/Product'
import authSeller from '@/lib/authSeller'

export async function DELETE(request) {
  try {
    const { userId } = getAuth(request)
    const isSeller = await authSeller(userId)

    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 403 }
      )
    }

    const { id } = await request.json()

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

    // Optional: Check if the user owns this product. This is important in multi-seller platforms.
    if (product.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'You do not have permission to delete this product.',
        },
        { status: 403 }
      )
    }

    await Product.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    console.error('Error in /api/product/delete:', error)
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred.' },
      { status: 500 }
    )
  }
}
