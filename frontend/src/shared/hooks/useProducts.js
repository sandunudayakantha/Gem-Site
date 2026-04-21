import { useState, useEffect } from 'react'
import api from '../../shared/config/api'
import toast from 'react-hot-toast'

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [JSON.stringify(filters)])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })

      const response = await api.get(`/products?${params.toString()}`)
      
      // Handle both structured response and legacy array (for safety)
      if (response.data && response.data.products) {
        setProducts(response.data.products)
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalProducts: response.data.totalProducts
        })
      } else {
        setProducts(response.data || [])
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalProducts: Array.isArray(response.data) ? response.data.length : 0
        })
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err.message)
      
      // Only show toast for network errors once
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        const hasShownError = sessionStorage.getItem('networkErrorShown')
        if (!hasShownError) {
          toast.error('Cannot connect to server. Make sure the backend is running on port 5007', {
            duration: 5000
          })
          sessionStorage.setItem('networkErrorShown', 'true')
        }
      } else {
        toast.error('Failed to load products')
      }
    } finally {
      setLoading(false)
    }
  }

  return { 
    products, 
    pagination,
    loading, 
    error, 
    refetch: fetchProducts 
  }
}

export default useProducts

