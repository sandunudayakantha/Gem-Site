import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../shared/config/api'
import Loading from '../components/Loading'

const ClarityForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    order: 0
  })

  useEffect(() => {
    if (id) {
      fetchClarity()
    }
  }, [id])

  const fetchClarity = async () => {
    try {
      const response = await api.get(`/clarities/${id}`)
      const clarity = response.data
      setFormData({
        name: clarity.name,
        displayName: clarity.displayName,
        order: clarity.order || 0
      })
    } catch (error) {
      console.error('Error fetching clarity:', error)
      toast.error('Failed to fetch clarity')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'order' ? parseInt(value) || 0 : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const submitData = {
        ...formData,
        order: parseInt(formData.order) || 0
      }

      if (id) {
        await api.put(`/clarities/${id}`, submitData)
        toast.success('Clarity updated successfully')
      } else {
        await api.post('/clarities', submitData)
        toast.success('Clarity created successfully')
      }
      
      navigate('/admin/clarities')
    } catch (error) {
      console.error('Error saving clarity:', error)
      toast.error(error.response?.data?.message || 'Failed to save clarity')
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {id ? 'Edit Clarity' : 'Add New Clarity'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Clarity Name (internal) *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., vvs1, si2, flawless"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="text-xs text-gray-500 mt-1">Unique internal identifier (will be converted to lowercase)</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Display Name *
          </label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            required
            placeholder="e.g., VVS1, SI2, Flawless"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="text-xs text-gray-500 mt-1">This is how the clarity will be displayed in the product form</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Display Order
          </label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="text-xs text-gray-500 mt-1">Lower numbers appear first (0, 1, 2, ...)</p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            {id ? 'Update Clarity' : 'Create Clarity'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/clarities')}
            className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ClarityForm
