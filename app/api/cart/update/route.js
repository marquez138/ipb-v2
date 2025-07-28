import connectDB from '@/config/db'
import User from '@/models/User'
import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { userId } = getAuth(request)

    if (!userId) {
      // Ensure user is authenticated
      return NextResponse.json(
        { success: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const { cartData } = await request.json()

    await connectDB()

    // Use findOneAndUpdate to atomically update the cartItems field
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId }, // Query: Find the user by their Clerk userId
      { $set: { cartItems: cartData } }, // Update: Set the cartItems field to the new cartData object
      {
        new: true, // Return the modified document rather than the original
        upsert: true, // Create the document if it doesn't exist (useful if user is new or _id not yet in DB)
        runValidators: true, // Run schema validators on the update operation
      }
    )

    if (!updatedUser) {
      // This case should ideally not be hit with upsert: true,
      // unless there's an issue with the userId itself.
      return NextResponse.json(
        { success: false, message: 'User not found or could not be updated.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating cart:', error) // Log the actual error for better debugging
    return NextResponse.json({ success: false, message: error.message })
  }
}
