import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useProducts } from '../../shared/hooks/useProducts'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'
import api from '../../shared/config/api'
import productsHeroBg from '../../shared/images/all-products.jpg'
import productsGridBg from '../../shared/images/all-products-back.jpeg'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState([])
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const pageParam = searchParams.get('page')
  const page = pageParam ? parseInt(pageParam) : 1
  const categoryParam = searchParams.get('category')
  const featured = searchParams.get('featured')
  const newArrival = searchParams.get('newArrival')
  const search = searchParams.get('search')
  const category = categoryParam && categoryParam !== 'null' ? categoryParam : null

  const { products, pagination, loading } = useProducts({
    category: category,
    featured: featured === 'true' ? 'true' : null,
    newArrival: newArrival === 'true' ? 'true' : null,
    search: search || null,
    page: page,
    limit: 8
  })

  useEffect(() => {
    fetchCategories()
    if (category) {
      setSelectedCategory(category)
      // Auto-expand parent if a subcategory is selected
      if (categories.length > 0) {
        const parent = categories.find(c => 
          c._id === category || c.subcategories?.some(s => s._id === category)
        )
        if (parent) setExpandedCategory(parent._id)
      }
    } else {
      setSelectedCategory(null)
      setExpandedCategory(null)
    }
  }, [category, categories.length])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage)
    navigate(`/products?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      const params = new URLSearchParams()
      params.set('search', searchTerm.trim())
      params.set('page', 1)
      navigate(`/products?${params.toString()}`)
    }
  }

  const handleMainCategoryClick = (catId) => {
    const params = new URLSearchParams()
    
    if (catId === null) {
      setExpandedCategory(null)
      setSelectedCategory(null)
    } else {
      // If clicking same category, maybe toggle expansion or just select
      setExpandedCategory(catId)
      setSelectedCategory(catId)
      params.set('category', catId)
    }
    
    params.set('page', 1)
    if (featured === 'true') params.set('featured', featured)
    if (newArrival === 'true') params.set('newArrival', newArrival)
    if (search) params.set('search', search)
    
    const queryString = params.toString()
    navigate(queryString ? `/products?${queryString}` : '/products')
  }

  const handleSubCategoryClick = (subId) => {
    const params = new URLSearchParams()
    setSelectedCategory(subId)
    params.set('category', subId)
    
    params.set('page', 1)
    if (featured === 'true') params.set('featured', featured)
    if (newArrival === 'true') params.set('newArrival', newArrival)
    if (search) params.set('search', search)
    
    const queryString = params.toString()
    navigate(queryString ? `/products?${queryString}` : '/products')
  }

  const clearFilters = () => {
    setSelectedCategory(null)
    setExpandedCategory(null)
    setSearchTerm('')
    navigate('/products')
  }

  const getPageTitle = () => {
    if (featured === 'true') return 'Featured Products'
    if (newArrival === 'true') return 'New Arrivals'
    if (search) return `Search: "${search}"`
    if (category) {
      // Find name in main or subcategories
      let catName = 'Products'
      categories.forEach(c => {
        if (c._id === category) catName = c.name
        const sub = c.subcategories?.find(s => s._id === category)
        if (sub) catName = sub.name
      })
      return catName
    }
    return 'All Products'
  }

  if (loading) {
    return <Loading />
  }

  const hasActiveFilters = category || featured === 'true' || newArrival === 'true' || search

  return (
    <div className="w-full">
      {/* Hero Header Section */}
      <section className="relative bg-black text-white py-24 md:py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${productsHeroBg})` }}
        ></div>
        <div className="absolute inset-0 z-10 bg-black/40"></div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6">
            {getPageTitle()}
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-light tracking-wide max-w-2xl">
            {pagination.totalProducts > 0 
              ? `Showing ${(pagination.currentPage - 1) * 8 + 1}–${Math.min(pagination.currentPage * 8, pagination.totalProducts)} of ${pagination.totalProducts} gemstones`
              : 'Explore our curated selection of premium gemstones'}
          </p>
        </div>
      </section>

      {/* Filters and Search Section */}
      <section className="bg-white border-b border-black/5 py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search Bar - Luxury Style */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm || search || ''}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-6 py-3 border border-black/20 bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors duration-300 font-light tracking-wide text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-black/60 hover:text-black transition-colors duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs tracking-widest uppercase font-light text-black/60">Filters:</span>
                {featured === 'true' && (
                  <span className="text-xs px-3 py-1 border border-black/20 text-black font-light tracking-wide">
                    Featured
                  </span>
                )}
                {newArrival === 'true' && (
                  <span className="text-xs px-3 py-1 border border-black/20 text-black font-light tracking-wide">
                    New Arrivals
                  </span>
                )}
                {search && (
                  <span className="text-xs px-3 py-1 border border-black/20 text-black font-light tracking-wide">
                    Search: {search}
                  </span>
                )}
                {category && (
                  <span className="text-xs px-3 py-1 border border-black/20 text-black font-light tracking-wide">
                    {categories.find(c => c._id === category)?.name || 'Category'}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-black/60 hover:text-black transition-colors duration-300 font-light tracking-wide underline"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Category Filters - Dual Tier Optimized Scroll */}
          {categories.length > 0 && (
            <div className="mt-6 pt-6 border-t border-black/5">
              <div className="flex flex-col gap-6">
                {/* Tier 1: Main Categories */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <span className="text-xs tracking-widest uppercase font-light text-black/60 shrink-0">
                    Vault:
                  </span>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                    <button
                      onClick={() => handleMainCategoryClick(null)}
                      className={`text-[10px] md:text-xs px-5 py-2.5 border transition-all duration-300 font-light tracking-widest uppercase whitespace-nowrap shrink-0 ${
                        !expandedCategory
                          ? 'border-black text-black bg-black/5'
                          : 'border-black/20 text-black/60 hover:border-black hover:text-black'
                      }`}
                    >
                      All
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat._id}
                        onClick={() => handleMainCategoryClick(cat._id)}
                        className={`text-[10px] md:text-xs px-5 py-2.5 border transition-all duration-300 font-light tracking-widest uppercase whitespace-nowrap shrink-0 ${
                          expandedCategory === cat._id
                            ? 'border-black text-black bg-black/5'
                            : 'border-black/20 text-black/60 hover:border-black hover:text-black'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tier 2: Sub-categories (Conditional) */}
                {expandedCategory && categories.find(c => c._id === expandedCategory)?.subcategories?.length > 0 && (
                  <div className="flex flex-col md:flex-row md:items-center gap-4 animate-fade-in">
                    <span className="text-[10px] tracking-widest uppercase font-light text-black/40 shrink-0">
                      Refine:
                    </span>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                      {categories.find(c => c._id === expandedCategory).subcategories.map(sub => (
                        <button
                          key={sub._id}
                          onClick={() => handleSubCategoryClick(sub._id)}
                          className={`text-[10px] md:text-xs px-4 py-2 border-b transition-all duration-300 font-light tracking-widest uppercase whitespace-nowrap shrink-0 ${
                            selectedCategory === sub._id
                              ? 'border-black text-black'
                              : 'border-transparent text-black/40 hover:text-black hover:border-black/20'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Subtle Background Image with Texture Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-fixed bg-center opacity-10"
          style={{ backgroundImage: `url(${productsGridBg})` }}
        ></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="text-2xl font-light tracking-wide text-black/40 mb-4">No products found</p>
              <p className="text-sm font-light tracking-wide text-black/30 mb-8">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={clearFilters}
                className="text-sm px-6 py-3 border border-black/20 text-black hover:bg-black hover:text-white transition-all duration-300 font-light tracking-wide uppercase"
              >
                View All Products
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-20">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="w-10 h-10 flex items-center justify-center border border-black/10 text-black hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Page Numbers */}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-10 h-10 flex items-center justify-center border transition-all duration-300 text-sm font-light ${
                    pagination.currentPage === p
                      ? 'border-black bg-black text-white'
                      : 'border-black/10 text-black hover:border-black'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="w-10 h-10 flex items-center justify-center border border-black/10 text-black hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Products

