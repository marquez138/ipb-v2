import { inngest } from '@/config/inngest'
import Product from '@/models/Product'
import User from '@/models/User'
import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    const { address, items } = await request.json()

    if (!address || !items || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid data' })
    }

    const amount = await items.reduce(async (accPromise, item) => {
      const acc = await accPromise
      const product = await Product.findById(item.product)
      return acc + product.offerPrice * item.quantity
    }, Promise.resolve(0))

    // --- UPDATED: Pass the items array with customizations directly ---
    await inngest.send({
      name: 'order/created',
      data: {
        userId,
        address,
        items, // This now includes the customizations object for each item
        amount: amount + Math.floor(amount * 0.02),
        date: Date.now(),
      },
    })

    const user = await User.findById(userId)
    user.cartItems = {}
    await user.save()

    return NextResponse.json({ success: true, message: 'Order Placed' })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ success: false, message: error.message })
  }
}
