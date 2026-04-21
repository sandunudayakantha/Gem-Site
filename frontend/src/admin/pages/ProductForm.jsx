import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../shared/config/api'
import Loading from '../components/Loading'

const ProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [availableSizes, setAvailableSizes] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [availableColors, setAvailableColors] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [availableCuts, setAvailableCuts] = useState([])
  const [availableGemColors, setAvailableGemColors] = useState([])
  const [availableClarities, setAvailableClarities] = useState([])
  const [availableOrigins, setAvailableOrigins] = useState([])
  const [availableCertifications, setAvailableCertifications] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    discountPrice: '',
    sizes: '',
    colors: '',
    stock: '',
    featured: false,
    newArrival: false,
    freeDelivery: false,
    weight: '',
    dimensions: '',
    cut: '',
    gemColor: '',
    clarity: '',
    treatment: '',
    origin: '',
    certification: '',
    priceUnit: 'total'
  })
  const [images, setImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [dimensionValues, setDimensionValues] = useState({ length: '', width: '', height: '' })

  useEffect(() => {
    fetchCategories()
    fetchSizes()
    fetchColors()
    fetchCuts()
    fetchGemColors()
    fetchClarities()
    fetchOrigins()
    fetchCertifications()
    if (id) {
      fetchProduct()
    }
  }, [id])

  // Load subcategories when categories are fetched and a category is selected
  useEffect(() => {
    if (categories.length > 0 && formData.category) {
      loadSubcategories(formData.category)
    } else if (!formData.category) {
      // Clear subcategories if no category is selected
      setSubcategories([])
    }
  }, [categories, formData.category])

  // Load sizes when category changes
  useEffect(() => {
    if (formData.category) {
      fetchSizes(formData.category)
    } else {
      fetchSizes()
    }
  }, [formData.category])

  // Load colors when category changes
  useEffect(() => {
    if (formData.category) {
      fetchColors(formData.category)
    } else {
      fetchColors()
    }
  }, [formData.category])

  const loadSubcategories = (categoryId) => {
    if (!categoryId || categories.length === 0) {
      setSubcategories([])
      return
    }
    
    const selectedCategory = categories.find(cat => cat._id == categoryId)
    
    // Check if subcategories exist, are an array, have length > 0, and are populated objects
    if (selectedCategory && 
        Array.isArray(selectedCategory.subcategories) && 
        selectedCategory.subcategories.length > 0) {
      // Filter to ensure we only have valid subcategory objects (not just ObjectIds)
      const validSubcategories = selectedCategory.subcategories.filter(
        sub => sub && typeof sub === 'object' && sub._id && sub.name
      )
      
      if (validSubcategories.length > 0) {
        setSubcategories(validSubcategories)
        return
      }
    }
    
    // No valid subcategories found - clear the array
    setSubcategories([])
  }

  const fetchCategories = async () => {
    try {
      // Fetch all categories with subcategories populated for admin
      const response = await api.get('/categories?includeSubcategories=true')
      // Filter to only main categories for the dropdown (subcategories are shown separately)
      const mainCategories = response.data.filter(cat => !cat.parent)
      setCategories(mainCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchSizes = async (categoryId = null) => {
    try {
      // Fetch all sizes - the backend will filter to show category-specific and global sizes
      const params = categoryId ? { category: categoryId } : {}
      const response = await api.get('/sizes', { params })
      setAvailableSizes(response.data)
      
      // If editing and sizes are already selected, make sure they're still in selectedSizes
      // This handles cases where a size might have been removed from the system
      if (id && selectedSizes.length > 0) {
        const availableSizeNames = response.data.map(s => s.name)
        setSelectedSizes(prev => prev.filter(size => availableSizeNames.includes(size)))
      }
    } catch (error) {
      console.error('Error fetching sizes:', error)
    }
  }

  const fetchColors = async (categoryId = null) => {
    try {
      // Fetch all colors - the backend will filter to show category-specific and global colors
      const params = categoryId ? { category: categoryId } : {}
      const response = await api.get('/colors', { params })
      setAvailableColors(response.data)
      
      // If editing and colors are already selected, make sure they're still in selectedColors
      // This handles cases where a color might have been removed from the system
      if (id && selectedColors.length > 0) {
        const availableColorNames = response.data.map(c => c.name)
        setSelectedColors(prev => prev.filter(color => availableColorNames.includes(color)))
      }
    } catch (error) {
      console.error('Error fetching colors:', error)
    }
  }

  const fetchCuts = async () => {
    try {
      const response = await api.get('/cuts')
      setAvailableCuts(response.data)
    } catch (error) {
      console.error('Error fetching cuts:', error)
    }
  }

  const fetchGemColors = async () => {
    try {
      const response = await api.get('/gem-colors')
      setAvailableGemColors(response.data)
    } catch (error) {
      console.error('Error fetching gem colors:', error)
    }
  }

  const fetchClarities = async () => {
    try {
      const response = await api.get('/clarities')
      setAvailableClarities(response.data)
    } catch (error) {
      console.error('Error fetching clarities:', error)
    }
  }

  const fetchOrigins = async () => {
    try {
      const response = await api.get('/origins')
      setAvailableOrigins(response.data)
    } catch (error) {
      console.error('Error fetching origins:', error)
    }
  }

  const fetchCertifications = async () => {
    try {
      const response = await api.get('/certifications')
      setAvailableCertifications(response.data)
    } catch (error) {
      console.error('Error fetching certifications:', error)
    }
  }

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`)
      const product = response.data
      const categoryId = product.category._id
      
      // Set selected sizes and colors from product
      setSelectedSizes(product.sizes || [])
      setSelectedColors(product.colors || [])
      
      setFormData({
        title: product.title,
        description: product.description,
        category: categoryId,
        subcategory: product.subcategory || '',
        price: product.price,
        discountPrice: product.discountPrice || '',
        sizes: product.sizes.join(', '), // Keep for backward compatibility
        colors: product.colors.join(', '),
        stock: product.stock,
        featured: product.featured,
        newArrival: product.newArrival,
        freeDelivery: product.freeDelivery || false,
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        cut: product.cut || '',
        gemColor: product.gemColor || '',
        clarity: product.clarity || '',
        treatment: product.treatment || '',
        origin: product.origin || '',
        certification: product.certification || '',
        priceUnit: product.priceUnit || 'total'
      })

      // Parse dimensions if they exist
      if (product.dimensions) {
        const dimMatch = product.dimensions.match(/(\d+\.?\d*)\s*[×x*]\s*(\d+\.?\d*)\s*[×x*]\s*(\d+\.?\d*)/i)
        if (dimMatch) {
          setDimensionValues({
            length: dimMatch[1],
            width: dimMatch[2],
            height: dimMatch[3]
          })
        }
      }

      setImages(product.images || [])
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }

  const handleSizeToggle = (sizeName) => {
    setSelectedSizes(prev => {
      if (prev.includes(sizeName)) {
        return prev.filter(s => s !== sizeName)
      } else {
        return [...prev, sizeName]
      }
    })
  }

  const handleColorToggle = (colorName) => {
    setSelectedColors(prev => {
      if (prev.includes(colorName)) {
        return prev.filter(c => c !== colorName)
      } else {
        return [...prev, colorName]
      }
    })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // When category changes, clear subcategories and subcategory selection
    if (name === 'category') {
      setSubcategories([]) // Clear immediately to prevent showing stale data
      setFormData({
        ...formData,
        category: value,
        subcategory: '' // Clear subcategory when category changes
      })
      // loadSubcategories will be called by the useEffect when formData.category changes
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      })
    }
  }

  const handleDimensionChange = (e) => {
    const { name, value } = e.target
    setDimensionValues({
      ...dimensionValues,
      [name]: value
    })
  }

  const handleImageChange = (e) => {
    setNewImages(Array.from(e.target.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Sizes and colors are now optional
    
    try {
      const submitData = new FormData()
      Object.keys(formData).forEach(key => {
        if (key !== 'sizes' && key !== 'colors' && formData[key] !== '' && formData[key] !== null) {
          submitData.append(key, formData[key])
        }
      })

      // Add selected sizes and colors
      submitData.append('sizes', selectedSizes.join(', '))
      submitData.append('colors', selectedColors.join(', '))

      // Format dimensions
      if (dimensionValues.length || dimensionValues.width || dimensionValues.height) {
        const formattedDims = `${dimensionValues.length || 0} × ${dimensionValues.width || 0} × ${dimensionValues.height || 0} mm`
        submitData.append('dimensions', formattedDims)
      }

      newImages.forEach(file => {
        submitData.append('images', file)
      })

      if (id) {
        await api.put(`/products/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Product updated successfully')
      } else {
        await api.post('/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Product created successfully')
      }
      
      navigate('/admin/products')
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error(error.response?.data?.message || 'Failed to save product')
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {id ? 'Edit Product' : 'Add New Product'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Subcategory
            </label>
            {formData.category && Array.isArray(subcategories) && subcategories.length > 0 && subcategories.some(sub => sub && sub._id && sub.name) ? (
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select Subcategory (Optional)</option>
                {subcategories.filter(sub => sub && sub._id && sub.name).map(sub => (
                  <option key={sub._id} value={sub.name}>{sub.name}</option>
                ))}
              </select>
            ) : formData.category ? (
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                placeholder="No subcategories available. Enter custom subcategory name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            ) : (
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                placeholder="Select a category first"
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            )}
            {formData.category && Array.isArray(subcategories) && subcategories.length > 0 && subcategories.some(sub => sub && sub._id && sub.name) && (
              <p className="text-xs text-gray-500 mt-1">
                Select a subcategory or leave empty
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Price
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <select
                name="priceUnit"
                value={formData.priceUnit}
                onChange={handleChange}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="total">Total</option>
                <option value="per_carat">Per Carat</option>
              </select>
            </div>
          </div>

{/* Discount Price and Stock removed */}

{/* Sizes and Colors sections removed */}
        </div>

        {/* Gemstone Specifications Section */}
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Gemstone Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Weight (carats)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                step="0.001"
                min="0"
                placeholder="e.g. 1.25"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Dimensions (L × W × H mm)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <input
                    type="number"
                    name="length"
                    value={dimensionValues.length}
                    onChange={handleDimensionChange}
                    step="0.1"
                    min="0"
                    placeholder="L"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  />
                </div>
                <span className="text-gray-400">×</span>
                <div className="flex-1 min-w-0">
                  <input
                    type="number"
                    name="width"
                    value={dimensionValues.width}
                    onChange={handleDimensionChange}
                    step="0.1"
                    min="0"
                    placeholder="W"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  />
                </div>
                <span className="text-gray-400">×</span>
                <div className="flex-1 min-w-0">
                  <input
                    type="number"
                    name="height"
                    value={dimensionValues.height}
                    onChange={handleDimensionChange}
                    step="0.1"
                    min="0"
                    placeholder="H"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  />
                </div>
                <span className="text-sm font-medium text-gray-500">mm</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Cut (Shape + Grade)
              </label>
              <select
                name="cut"
                value={formData.cut}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select Cut</option>
                {availableCuts.map(cut => (
                  <option key={cut._id} value={cut.displayName}>
                    {cut.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Color Detail
              </label>
              <select
                name="gemColor"
                value={formData.gemColor}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select Color Detail</option>
                {availableGemColors.map(color => (
                  <option key={color._id} value={color.displayName}>
                    {color.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Clarity
              </label>
              <select
                name="clarity"
                value={formData.clarity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select Clarity</option>
                {availableClarities.map(clarity => (
                  <option key={clarity._id} value={clarity.displayName}>
                    {clarity.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Treatment
              </label>
              <select
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select Treatment</option>
                <option value="Natural">Natural</option>
                <option value="Heat-treated">Heat-treated</option>
                <option value="Lab-grown">Lab-grown</option>
                <option value="Irradiated">Irradiated</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Origin (Optional)
              </label>
              <select
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select Origin</option>
                {availableOrigins.map(origin => (
                  <option key={origin._id} value={origin.displayName}>
                    {origin.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Certification
              </label>
              <select
                name="certification"
                value={formData.certification}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select Certification</option>
                {availableCertifications.map(cert => (
                  <option key={cert._id} value={cert.displayName}>
                    {cert.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="6"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Images {!id && '*'}
          </label>
          {id && images.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={`http://localhost:5007${img}`}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            required={!id}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="text-sm text-gray-500 mt-2">You can select multiple images</p>
        </div>


        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            {id ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm

