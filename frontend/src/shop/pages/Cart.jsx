import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../shared/context/CartContext'
import { useCurrency } from '../../shared/context/CurrencyContext'
import { getImageUrl } from '../../shared/config/api'
import api from '../../shared/config/api'
import toast from 'react-hot-toast'
import cartBg from '../../shared/images/cart-back.jpg'
import cartUpperBg from '../../shared/images/cart-upper.jpeg'

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal } = useCart()
  const { formatPrice } = useCurrency()
  const [colorsMap, setColorsMap] = useState({})
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetchColors()
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings')
      setSettings(response.data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  // Calculate delivery fee
  const subtotal = getCartTotal()
  const total = Number(subtotal)

  const fetchColors = async () => {
    try {
      const response = await api.get('/colors')
      const map = {}
      response.data.forEach(color => {
        map[color.name.toLowerCase()] = color
      })
      setColorsMap(map)
    } catch (error) {
      console.error('Error fetching colors:', error)
    }
  }

  const getColorInfo = (colorName) => {
    const colorInfo = colorsMap[colorName?.toLowerCase()] || {}
    return {
      hexCode: colorInfo.hexCode || '#000000',
      displayName: colorInfo.displayName || colorName
    }
  }

  const handleQuantityChange = (productId, size, color, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId, size, color)
      toast.success('Item removed from cart')
    } else {
      
      updateCartQuantity(productId, size, color, newQuantity)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="w-full pt-20">
        {/* Hero Header Section */}
        <section className="relative bg-black text-white py-16 md:py-24 overflow-hidden">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url(${cartUpperBg})` }}
          ></div>
          <div className="absolute inset-0 z-10 bg-black/40"></div>
          <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4 animate-fade-in">
              Your Cart is Empty
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-light tracking-wide mb-8">
              Add some products to get started!
            </p>
          </div>
        </section>

        {/* Empty Cart Content */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-fixed bg-center opacity-10"
            style={{ backgroundImage: `url(${cartBg})` }}
          ></div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <Link
              to="/products"
              className="inline-block border-2 border-black text-black px-10 py-4 text-sm tracking-widest uppercase font-light hover:bg-black hover:text-white transition-all duration-300"
            >
              Continue Shopping
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="w-full pt-20">
      {/* Hero Header Section */}
      <section className="relative bg-black text-white py-16 md:py-24 overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${cartUpperBg})` }}
        ></div>
        <div className="absolute inset-0 z-10 bg-black/40"></div>
        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight mb-2 animate-fade-in">
            Shopping Cart
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-light tracking-wide">
            {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
          </p>
        </div>
      </section>

      {/* Cart Content */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-fixed bg-center opacity-10"
          style={{ backgroundImage: `url(${cartBg})` }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 md:gap-24">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {cart.map((item, index) => (
                  <div
                    key={`${item.product}-${item.size}-${item.color}-${index}`}
                    className="border-b border-black/10 pb-6 last:border-b-0 last:pb-0"
                  >
                    <div className="flex gap-6">
                      <Link
                        to={`/products/${item.product}`}
                        className="flex-shrink-0"
                      >
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-50 overflow-hidden group">
                          <img
                            src={getImageUrl(item.productData.images?.[0])}
                            alt={item.productData.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/160x160?text=No+Image'
                            }}
                          />
                        </div>
                      </Link>
                      <div className="flex-1">
                        <Link to={`/products/${item.product}`}>
                          <h3 className="text-sm md:text-xl font-light text-black mb-2 md:mb-3 tracking-wide hover:text-black/70 transition-colors duration-300">
                            {item.productData.title}
                          </h3>
                        </Link>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
                          <div>
                            <p className="text-lg md:text-2xl font-light text-black tracking-wide">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 md:gap-6">
                            <div className="flex items-center border border-black/10">
                              <button
                                onClick={() => handleQuantityChange(item.product, item.size, item.color, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors"
                              >
                                -
                              </button>
                              <span className="w-10 text-center text-sm font-light">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.product, item.size, item.color, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                removeFromCart(item.product, item.size, item.color)
                                toast.success('Item removed from cart')
                              }}
                              className="text-black/40 hover:text-black transition-colors duration-300"
                              title="Remove item"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border border-black/10 p-8 sticky top-20">
                <h2 className="text-lg md:text-2xl font-light tracking-tight text-black mb-6 md:mb-8 pb-4 border-b border-black/10">
                  Order Summary
                </h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-black/70 font-light tracking-wide text-sm md:text-base">
                    <span>Subtotal</span>
                    <span className="text-black">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="border-t border-black/10 pt-4 mt-4">
                    <div className="flex justify-between text-xl font-light tracking-wide text-black">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="block w-full bg-black text-white text-center px-8 py-4 text-sm tracking-widest uppercase font-light hover:bg-black/90 transition-all duration-300 mb-6"
                >
                  Proceed to Checkout
                </Link>

                <div className="bg-gray-50 p-4 border border-black/5 mb-6">
                  <p className="text-xs font-light tracking-wide text-black/60 text-center italic leading-relaxed">
                    "We will contact you soon for payment and delivery details after you proceed."
                  </p>
                </div>
                <Link
                  to="/products"
                  className="block w-full text-center text-sm tracking-widest uppercase font-light text-black/60 hover:text-black transition-colors duration-300"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Cart

