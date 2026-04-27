import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../../shared/context/CartContext'
import { useCurrency } from '../../shared/context/CurrencyContext'
import api from '../../shared/config/api'
import logo from '../../shared/images/logo.png'

const Navbar = () => {
  const [categories, setCategories] = useState([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { getCartCount } = useCart()
  const { selectedCurrency, changeCurrency, currencies } = useCurrency()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close categories dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCategoriesOpen && !event.target.closest('.categories-dropdown')) {
        setIsCategoriesOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isCategoriesOpen])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Silently fail - categories dropdown will just be empty
      // This prevents the app from breaking if backend is not available
    }
  }

  return (
    <nav className="fixed bg-white/80 backdrop-blur-md shadow-sm border-b border-black/5 top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-4">
            <img src={logo} alt="A S Gems Logo" className="h-12 md:h-16 w-auto" />
            <span className="text-xl md:text-2xl font-light tracking-[0.2em] uppercase text-gold-gradient hidden sm:block">
              AS COLLECTION
            </span>
          </Link>

          {/* Desktop Navigation - Luxury Style */}
          <div className="hidden md:flex items-center space-x-10">
            <Link
              to="/"
              className="text-sm transition-colors duration-300 tracking-wider uppercase font-light text-black/80 hover:text-[#B38728]"
            >
              Home
            </Link>

            {/* Categories Mega Menu - Click to Open */}
            <div className="categories-dropdown">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="text-sm transition-colors duration-300 flex items-center tracking-wider uppercase font-light text-black/80 hover:text-[#B38728]"
              >
                Categories
                <svg className={`ml-2 h-3 w-3 transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Mega Menu Dropdown */}
              {isCategoriesOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-0 w-screen max-w-6xl z-50">
                  <div className="bg-white/95 backdrop-blur-2xl border border-white/10 shadow-2xl animate-fade-in px-12 py-12 max-h-[80vh] overflow-y-auto hide-scrollbar">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {categories.map((category) => (
                        <div
                          key={category._id}
                          className="group/item"
                        >
                          <Link
                            to={`/products?category=${category._id}`}
                            className="block mb-4"
                            onClick={() => setIsCategoriesOpen(false)}
                          >
                            <h3 className="text-sm font-light tracking-widest uppercase text-black mb-4 pb-2 border-b border-black/10 group-hover/item:border-black/30 transition-colors duration-300">
                              {category.name}
                            </h3>
                          </Link>
                          {category.subcategories && category.subcategories.length > 0 && (
                            <div className="space-y-2">
                              {category.subcategories.map(sub => (
                                <Link
                                  key={sub._id}
                                  to={`/products?category=${sub._id}`}
                                  className="block text-xs text-gray-600 hover:text-black py-2 font-light tracking-wide transition-all duration-300 hover:translate-x-1 cursor-pointer"
                                  onClick={() => setIsCategoriesOpen(false)}
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                          {(!category.subcategories || category.subcategories.length === 0) && (
                            <Link
                              to={`/products?category=${category._id}`}
                              className="block text-xs text-gray-600 hover:text-black py-2 font-light tracking-wide transition-all duration-300 hover:translate-x-1 cursor-pointer"
                              onClick={() => setIsCategoriesOpen(false)}
                            >
                              View All
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* View All Categories Link */}
                    <div className="mt-12 pt-8 border-t border-black/10">
                        <Link
                          to="/products"
                          className="inline-flex items-center text-xs tracking-widest uppercase font-light text-black hover:text-[#B38728] transition-colors duration-300 group/viewall cursor-pointer"
                          onClick={() => setIsCategoriesOpen(false)}
                        >
                          View All Categories
                          <svg className="ml-2 h-3 w-3 transition-transform duration-300 group-hover/viewall:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/products"
              className="text-sm transition-colors duration-300 tracking-wider uppercase font-light text-black/80 hover:text-[#B38728]"
            >
              Products
            </Link>
            <Link
              to="/contact"
              className="text-sm transition-colors duration-300 tracking-wider uppercase font-light text-black/80 hover:text-[#B38728]"
            >
              Contact
            </Link>
            <Link
              to="/cart"
              className="relative transition-colors duration-300 text-black/80 hover:text-[#B38728]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 text-xs rounded-full h-5 w-5 flex items-center justify-center transition-colors duration-300 bg-black text-white">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* Currency Switcher */}
            <div className="relative group/currency ml-2 border-l border-black/10 pl-6 h-6 flex items-center">
              <select
                value={selectedCurrency}
                onChange={(e) => changeCurrency(e.target.value)}
                className="bg-transparent text-[11px] tracking-widest uppercase font-light text-black/70 hover:text-black focus:outline-none appearance-none cursor-pointer pr-4"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
              <svg className="absolute right-0 w-2.5 h-2.5 text-black/40 pointer-events-none group-hover/currency:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Mobile Navigation Controls */}
          <div className="flex md:hidden items-center gap-6">
            <Link
              to="/cart"
              className="relative transition-colors duration-300 text-black/80 hover:text-black"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 text-[10px] rounded-full h-4.5 w-4.5 flex items-center justify-center transition-colors duration-300 bg-black text-white">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* Mobile Currency Switcher */}
            <div className="relative group/currency flex items-center border-l border-black/10 pl-4 h-5">
              <select
                value={selectedCurrency}
                onChange={(e) => changeCurrency(e.target.value)}
                className="bg-transparent text-[10px] tracking-widest uppercase font-light text-black/70 focus:outline-none appearance-none cursor-pointer pr-3"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
              <svg className="absolute right-0 w-2 h-2 text-black/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <button
              className="transition-colors duration-300 text-black"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Synchronized with Desktop Aesthetic */}
        {isMenuOpen && (
          <div className="md:hidden py-8 border-t transition-all duration-300 bg-white/95 backdrop-blur-2xl border-black/5 max-h-[calc(100vh-80px)] overflow-y-auto hide-scrollbar px-6 shadow-2xl">
            <div className="space-y-6">
              <Link
                to="/"
                className="block text-sm tracking-widest uppercase font-light text-black hover:text-[#B38728] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block text-sm tracking-widest uppercase font-light text-black hover:text-[#B38728] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                All Products
              </Link>
              
              <div className="pt-4 border-t border-black/5">
                <span className="block text-[10px] tracking-[0.2em] uppercase font-light text-black/40 mb-6">
                  Experience the AS COLLECTION
                </span>
                {categories.map(category => (
                  <div key={category._id} className="mb-8 last:mb-0">
                    <Link
                      to={`/products?category=${category._id}`}
                      className="block text-sm tracking-widest uppercase font-light text-black hover:text-[#B38728] transition-colors mb-3"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="ml-4 space-y-3">
                        {category.subcategories.map(sub => (
                          <Link
                            key={sub._id}
                            to={`/products?category=${sub._id}`}
                            className="block text-xs tracking-wider font-light text-black/60 hover:text-[#B38728] transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-black/5 space-y-6">
                <Link
                  to="/contact"
                  className="block text-sm tracking-widest uppercase font-light text-black hover:text-[#B38728] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/cart"
                  className="block text-sm tracking-widest uppercase font-light text-black hover:text-[#B38728] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cart ({getCartCount()})
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

