import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api, { getImageUrl } from '../../shared/config/api'
import ClaimSuccessModal from './ClaimSuccessModal'

const DirectOrderModal = ({ isOpen, onClose, product, selectedSize, selectedColor, quantity }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)
  const [colorsMap, setColorsMap] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchColors()
    }
  }, [isOpen])

  const fetchColors = async () => {
    try {
      const response = await api.get('/colors')
      const map = {}
      response.data.forEach(color => {
        map[color.name.toLowerCase()] = color
      })
      setColorsMap(map)
    } catch (error) {
      console.error('Error fetching colors for modal:', error)
    }
  }

  const getColorInfo = (colorName) => {
    const colorInfo = colorsMap[colorName?.toLowerCase()] || {}
    return {
      hexCode: colorInfo.hexCode || '#000000',
      displayName: colorInfo.displayName || colorName
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.email || !formData.address) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    setLoading(true)

    try {
      const orderData = {
        items: [{
          product: product._id,
          size: '',
          color: '',
          quantity: 1
        }],
        customer: formData
      }

      const response = await api.post('/orders', orderData)
      setSubmitted(true)
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: ''
      })
    } catch (error) {
      console.error('Error placing order:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place order. Please try again.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return <ClaimSuccessModal 
      isOpen={isOpen} 
      onClose={() => {
        setSubmitted(false)
        onClose()
      }} 
    />
  }

  if (!isOpen) return null

  const price = product.discountPrice || product.price
  const total = price * quantity

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-down">
        {/* Header */}
        <div className="bg-black text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-light tracking-tight">Direct Order</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors duration-300"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Product Summary */}
          <div className="border border-black/10 p-4 mb-6">
            <div className="flex gap-4">
              <div className="w-20 h-20 md:w-32 md:h-32 bg-gray-50 overflow-hidden flex-shrink-0">
                <img
                  src={product.images?.[0] ? getImageUrl(product.images[0]) : 'https://via.placeholder.com/160x160?text=No+Image'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/160x160?text=No+Image'
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-sm md:text-lg font-light text-black mb-1 tracking-wide">{product.title}</h3>
                <div className="space-y-1 mb-2">
                </div>
                <p className="text-lg md:text-xl font-light text-black tracking-wide">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="mb-6 pb-4 border-b border-black/10">
            <h3 className="text-lg md:text-xl font-light tracking-tight text-black mb-4">
              Delivery Information
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-widest uppercase font-light text-black/60 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-black/20 bg-transparent backdrop-blur-sm text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors duration-300 font-light tracking-wide"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase font-light text-black/60 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-black/20 bg-transparent backdrop-blur-sm text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors duration-300 font-light tracking-wide"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase font-light text-black/60 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-black/20 bg-transparent backdrop-blur-sm text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors duration-300 font-light tracking-wide"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase font-light text-black/60 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="2"
                  className="w-full px-4 py-2 border border-black/20 bg-transparent backdrop-blur-sm text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors duration-300 font-light tracking-wide resize-none"
                  placeholder="Your complete delivery address"
                />
              </div>

              <div className="bg-transparent backdrop-blur-md p-4 border border-black/10">
                <p className="text-xs font-light tracking-wide text-black text-center italic leading-tight">
                  "We will contact you soon for payment and delivery details."
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border-2 border-black/20 text-black px-4 py-3 text-xs tracking-widest uppercase font-light hover:border-black hover:bg-black hover:text-white transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black text-white px-4 py-3 text-xs tracking-widest uppercase font-light hover:bg-black/90 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {loading ? 'Claiming Gem...' : 'Claim This Gem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DirectOrderModal

