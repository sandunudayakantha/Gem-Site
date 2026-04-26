import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { getImageUrl } from '../../shared/config/api'
import { useCart } from '../../shared/context/CartContext'
import { useCurrency } from '../../shared/context/CurrencyContext'
import Loading from '../components/Loading'
import DirectOrderModal from '../components/DirectOrderModal'
import ourCollectionBg from '../../shared/images/our-collection.jpg'
import productHeroBg from '../../shared/images/prod-detaill-back.jpeg'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [colorsMap, setColorsMap] = useState({})
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showDirectOrder, setShowDirectOrder] = useState(false)
  const [showCertModal, setShowCertModal] = useState(false)
  const [certifications, setCertifications] = useState([])
  const { cart, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()
  const { formatPrice } = useCurrency()

  useEffect(() => {
    fetchColors()
    fetchCertifications()
    fetchProduct()
  }, [id])

  const fetchCertifications = async () => {
    try {
      const response = await api.get('/certifications')
      setCertifications(response.data)
    } catch (error) {
      console.error('Error fetching certifications:', error)
    }
  }

  const fetchColors = async () => {
    try {
      const response = await api.get('/colors')
      // Create a map of color name -> color object for quick lookup
      const map = {}
      response.data.forEach(color => {
        map[color.name.toLowerCase()] = color
      })
      setColorsMap(map)
    } catch (error) {
      console.error('Error fetching colors:', error)
      // Continue even if colors fail to load
    }
  }

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`)
      setProduct(response.data)
      if (response.data.sizes.length > 0) {
        setSelectedSize(response.data.sizes[0])
      }
      if (response.data.colors.length > 0) {
        setSelectedColor(response.data.colors[0])
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Product not found')
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error('This product is out of stock')
      return
    }

    try {
      addToCart(product, '', '', 1)
      
      // Custom Luxury Toast
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-fade-in' : 'opacity-0'
          } max-w-md w-full bg-white shadow-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 items-center gap-4 border-l-4 border-black`}
        >
          <div className="flex-shrink-0 w-16 h-16 bg-gray-50 border border-black/5 overflow-hidden">
            <img
              src={getImageUrl(product.images?.[0])}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-light text-black tracking-wide truncate">
              {product.title}
            </p>
            <p className="mt-0.5 text-xs text-black/50 font-light tracking-widest uppercase">
              Added to your collection
            </p>
          </div>
          <div className="flex-shrink-0 flex gap-4">
            <button
              onClick={() => {
                toast.dismiss(t.id)
                navigate('/cart')
              }}
              className="text-xs font-light tracking-widest uppercase text-black hover:text-black/60 transition-colors duration-300 underline underline-offset-4"
            >
              View Cart
            </button>
          </div>
        </div>
      ), {
        duration: 4000,
        position: 'top-right'
      })
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart')
    }
  }

  const handleDirectOrder = () => {
    if (product.stock === 0) {
      toast.error('This product is out of stock')
      return
    }

    setShowDirectOrder(true)
  }

  const handleWishlist = () => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist(product)
      toast.success('Added to wishlist')
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!product) {
    return null
  }

  const price = product.discountPrice || product.price
  const hasDiscount = product.discountPrice && product.discountPrice < product.price

  return (
    <div className="w-full pt-20">
      {/* Hero Header Section */}
      <section className="relative bg-black text-white py-16 md:py-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${productHeroBg})` }}
        ></div>
        <div className="absolute inset-0 z-10 bg-black/40"></div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4 animate-fade-in uppercase">
            {product.title}
          </h1>
          {price && (
            <div className="flex items-center gap-4">
              {hasDiscount ? (
                <div className="flex items-center gap-4">
                  <span className="text-2xl md:text-3xl font-light tracking-wide">
                    {formatPrice(product.discountPrice)}{product.priceUnit === 'per_carat' ? ' / ct' : ''}
                  </span>
                  <span className="text-lg md:text-xl text-white/60 line-through font-light">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-2xl md:text-3xl font-light tracking-wide">
                  {formatPrice(product.price)}{product.priceUnit === 'per_carat' ? ' / ct' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Product Content */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background Image with Transparency Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-fixed bg-center opacity-10"
          style={{ backgroundImage: `url(${ourCollectionBg})` }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
            {/* Product Images */}
            <div>
              <div className="aspect-square bg-gray-50 overflow-hidden mb-6 group">
                <img
                  src={getImageUrl(product.images?.[selectedImage])}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x600?text=No+Image'
                  }}
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-gray-50 overflow-hidden border transition-all duration-300 ${
                        selectedImage === index 
                          ? 'border-black' 
                          : 'border-black/20 hover:border-black/40'
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150x150?text=No+Image'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <p className="text-base md:text-lg text-black/70 mb-8 font-light leading-relaxed tracking-wide">
                {product.description}
              </p>

              {/* Gemstone Specifications Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4 mb-12 py-8 border-y border-black/10">
                {product.weight && (
                  <div className="flex flex-col">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-black/40 mb-1.5">Weight</span>
                    <span className="text-sm font-light tracking-wide">{product.weight} ct</span>
                  </div>
                )}
                {product.cut && (
                  <div className="flex flex-col">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-black/40 mb-1.5">Cut</span>
                    <span className="text-sm font-light tracking-wide">{product.cut}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex flex-col">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-black/40 mb-1.5">Dimensions</span>
                    <span className="text-sm font-light tracking-wide">{product.dimensions}</span>
                  </div>
                )}
                {product.clarity && (
                  <div className="flex flex-col">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-black/40 mb-1.5">Clarity</span>
                    <span className="text-sm font-light tracking-wide">{product.clarity}</span>
                  </div>
                )}
                {product.gemColor && (
                  <div className="flex flex-col">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-black/40 mb-1.5">Color</span>
                    <span className="text-sm font-light tracking-wide">{product.gemColor}</span>
                  </div>
                )}
                {product.origin && (
                  <div className="flex flex-col">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-black/40 mb-1.5">Origin</span>
                    <span className="text-sm font-light tracking-wide">{product.origin}</span>
                  </div>
                )}
                {product.treatment && (
                  <div className="flex flex-col">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-black/40 mb-1.5">Treatment</span>
                    <span className="text-sm font-light tracking-wide">{product.treatment}</span>
                  </div>
                )}
                {product.certification && (
                  <div className="flex flex-col">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-black/40 mb-1.5">Certification</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-light tracking-wide">{product.certification}</span>
                      {certifications.find(c => c.displayName === product.certification)?.image && (
                        <button 
                          onClick={() => setShowCertModal(true)}
                          className="group relative flex items-center"
                          title="Click to view full certificate"
                        >
                          <img 
                            src={getImageUrl(certifications.find(c => c.displayName === product.certification).image)}
                            alt={product.certification}
                            className="h-8 w-auto object-contain cursor-zoom-in transition-transform group-hover:scale-110"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>


              {/* Actions */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={cart.some(item => item.product === product._id)}
                    className={`flex-1 border-2 border-black px-8 py-4 text-sm tracking-widest uppercase font-light transition-all duration-300 ${
                      cart.some(item => item.product === product._id)
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                        : 'text-black hover:bg-black hover:text-white'
                    }`}
                  >
                    {cart.some(item => item.product === product._id) ? 'In Cart' : 'Add to Cart'}
                  </button>
                </div>
                <button
                  onClick={handleDirectOrder}
                  className="w-full bg-black text-white px-8 py-4 text-sm tracking-widest uppercase font-light hover:bg-black/90 transition-all duration-300"
                >
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Order Modal */}
      <DirectOrderModal
        isOpen={showDirectOrder}
        onClose={() => setShowDirectOrder(false)}
        product={product}
        selectedSize=""
        selectedColor=""
        quantity={1}
      />

      {/* Certification Image Modal */}
      {showCertModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowCertModal(false)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center animate-zoom-in">
            <button 
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 z-[110]"
              onClick={() => setShowCertModal(false)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={getImageUrl(certifications.find(c => c.displayName === product.certification)?.image)}
              alt="Full Certificate"
              className="max-w-full max-h-[90vh] object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail

