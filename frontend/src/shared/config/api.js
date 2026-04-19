import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007'

// Log API URL in development
if (import.meta.env.DEV) {
  console.log('🔗 API URL:', `${API_URL}/api`)
}

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout for slower networks
})

// Request interceptor for Auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - only redirect if in an admin route context
      if (window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('admin_token')
        window.location.href = '/login'
      }
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Network Error - Backend may not be running:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        message: 'Make sure the backend server is running on port 5007'
      })
    } else if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data)
    } else {
      console.error('Request Error:', error.message)
    }
    return Promise.reject(error)
  }
)

// Export API URL for image URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  return `${API_URL}${imagePath}`
}

export default api
