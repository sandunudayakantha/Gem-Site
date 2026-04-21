import { Link } from 'react-router-dom'
import { useCart } from '../../shared/context/CartContext'
import { getImageUrl } from '../../shared/config/api'

const ProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useCart()
  const inWishlist = isInWishlist(product._id)
  const price = product.discountPrice || product.price
  const hasDiscount = product.discountPrice && product.discountPrice < product.price

  return (
    <div className="group relative bg-white overflow-hidden">
      {product.newArrival && (
        <span className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1.5 tracking-widest uppercase font-light z-10">
          New
        </span>
      )}
      {product.featured && (
        <span className="absolute top-4 right-4 bg-white text-black text-xs px-3 py-1.5 tracking-widest uppercase font-light z-10 border border-black/10">
          Featured
        </span>
      )}

      <Link to={`/products/${product._id}`}>
        <div className="aspect-square overflow-hidden bg-gray-50">
          <img
            src={getImageUrl(product.images?.[0])}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'
            }}
          />
        </div>
      </Link>

      <div className="pt-6 pb-4 text-center">
        {product.weight && (
          <div className="text-[10px] tracking-[0.2em] uppercase font-light text-black/40 mb-2">
            {product.weight} ct
          </div>
        )}
        <Link to={`/products/${product._id}`}>
          <h3 className="text-sm font-light text-black mb-2 tracking-wide hover:text-black/70 transition-colors duration-300 line-clamp-2">
            {product.title}
          </h3>
        </Link>
        
          {price && (
            <div className="flex flex-col items-center">
              {hasDiscount ? (
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-base font-light text-black tracking-wide">
                    ${Number(price).toFixed(2)}{product.priceUnit === 'per_carat' ? ' / ct' : ''}
                  </span>
                  <span className="text-xs text-gray-400 line-through font-light">${Number(product.price).toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-base font-light text-black tracking-wide">
                  ${Number(price).toFixed(2)}{product.priceUnit === 'per_carat' ? ' / ct' : ''}
                </span>
              )}
            </div>
          )}
      </div>
    </div>
  )
}

export default ProductCard

