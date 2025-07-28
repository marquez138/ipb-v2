import connectDB from '@/config/db'
import User from '@/models/User'
import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { userId } = getAuth(request)

    const { cartData } = await request.json()

    await connectDB()
    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      )
    }

    user.cartItems = cartData
    // IMPORTANT: Mark the cartItems path as modified to ensure Mongoose saves the changes
    user.markModified('cartItems') //
    await user.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating cart:', error) // Log the actual error for debugging
    return NextResponse.json({ success: false, message: error.message })
  }
}
