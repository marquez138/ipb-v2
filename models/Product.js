import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'user' },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  category: { type: String, required: true },
  colors: {
    type: [String],
    required: true,
  },
  // --- NEW: Add the imagesByColor field ---
  // This allows storing an object where keys are colors and values are image URL arrays.
  imagesByColor: {
    type: Map,
    of: [String],
    required: true,
  },
  // --- REMOVED (or comment out) the old image field ---
  // image: { type: Array, required: true },
  date: { type: Number, required: true },
})

const Product =
  mongoose.models.product || mongoose.model('product', productSchema)

export default Product
