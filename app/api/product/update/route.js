import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import connectDB from '@/config/db'
import Product from '@/models/Product'
import authSeller from '@/lib/authSeller'

export async function PUT(request) {
  try {
    const { userId } = getAuth(request)
    const isSeller = await authSeller(userId)

    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 403 }
      )
    }

    const { id, name, description, category, price, offerPrice } =
      await request.json()

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

    // Authorization check: ensure the user owns this product
    if (product.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'You do not have permission to edit this product.',
        },
        { status: 403 }
      )
    }

    // Update the fields
    product.name = name
    product.description = description
    product.category = category
    product.price = Number(price)
    product.offerPrice = Number(offerPrice)

    await product.save()

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product,
    })
  } catch (error) {
    console.error('Error in /api/product/update:', error)
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred.' },
      { status: 500 }
    )
  }
}
