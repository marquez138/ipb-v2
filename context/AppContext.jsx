'use client'
import { useAuth, useUser } from '@clerk/nextjs'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export const AppContext = createContext()

export const useAppContext = () => {
  return useContext(AppContext)
}

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY
  const router = useRouter()

  const { user } = useUser()
  const { getToken } = useAuth()

  const [products, setProducts] = useState([])
  const [userData, setUserData] = useState(false)
  const [isSeller, setIsSeller] = useState(false)
  const [cartItems, setCartItems] = useState({})

  const fetchProductData = async () => {
    try {
      const { data } = await axios.get('/api/product/list')

      if (data.success) {
        setProducts(data.products)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const fetchUserData = async () => {
    try {
      if (user.publicMetadata.role === 'seller') {
        setIsSeller(true)
      }

      const token = await getToken()

      const { data } = await axios.get('/api/user/data', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.success) {
        setUserData(data.user)
        setCartItems(data.user.cartItems)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // --- UPDATED addToCart and cart logic ---
  const addToCart = async (
    itemId,
    color = '',
    customizations = null,
    itemsBySize = []
  ) => {
    if (!user) {
      return toast('Please login', { icon: '⚠️' })
    }

    let cartData = structuredClone(cartItems)

    itemsBySize.forEach((item) => {
      // Create a unique key for each SIZE
      const itemKey = `${itemId}|${color}|${item.size}|${Date.now()}`
      cartData[itemKey] = {
        quantity: item.quantity,
        customizations: customizations,
      }
    })

    setCartItems(cartData)

    try {
      const token = await getToken()
      await axios.post(
        '/api/cart/update',
        { cartData },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // The toast message is now handled on the product page for better UX
    } catch (error) {
      toast.error(error.message)
      // Revert state if API call fails
      delete cartData[itemKey]
      setCartItems(cartData)
    }
  }

  const updateCartQuantity = async (itemKey, quantity) => {
    let cartData = structuredClone(cartItems)
    if (quantity <= 0) {
      delete cartData[itemKey]
    } else {
      cartData[itemKey].quantity = quantity
    }
    setCartItems(cartData)
    if (user) {
      try {
        const token = await getToken()
        await axios.post(
          '/api/cart/update',
          { cartData },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        toast.success('Cart Updated')
      } catch (error) {
        toast.error(error.message)
      }
    }
  }

  const getCartCount = () => {
    return Object.values(cartItems).reduce(
      (sum, item) => sum + item.quantity,
      0
    )
  }

  const getCartAmount = () => {
    let totalAmount = 0
    for (const key in cartItems) {
      const [productId] = key.split('|')
      const itemInfo = products.find((product) => product._id === productId)
      if (itemInfo) {
        totalAmount += itemInfo.offerPrice * cartItems[key].quantity
      }
    }
    return Math.floor(totalAmount * 100) / 100
  }

  useEffect(() => {
    fetchProductData()
  }, [])

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const value = {
    user,
    getToken,
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
  }

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  )
}
