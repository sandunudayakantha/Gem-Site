import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../shared/config/api'
import Loading from '../components/Loading'

const Certifications = () => {
  const [certifications, setCertifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertifications()
  }, [])

  const fetchCertifications = async () => {
    try {
      const response = await api.get('/certifications')
      setCertifications(response.data)
    } catch (error) {
      console.error('Error fetching certifications:', error)
      toast.error('Failed to fetch certifications')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) {
      return
    }

    try {
      await api.delete(`/certifications/${id}`)
      toast.success('Certification deleted successfully')
      fetchCertifications()
    } catch (error) {
      console.error('Error deleting certification:', error)
      toast.error(error.response?.data?.message || 'Failed to delete certification')
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gemstone Certifications</h1>
        <Link
          to="/admin/certifications/new"
          className="bg-accent text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition"
        >
          Add New Certification
        </Link>
      </div>

      {certifications.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Display Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Order</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certifications.map(cert => (
                  <tr key={cert._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-900">{cert.name}</td>
                    <td className="py-3 px-4 text-gray-700">{cert.displayName}</td>
                    <td className="py-3 px-4 text-gray-700">{cert.order}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/certifications/edit/${cert._id}`}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(cert._id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No certifications found</p>
          <Link
            to="/admin/certifications/new"
            className="text-accent hover:underline font-semibold"
          >
            Add your first certification
          </Link>
        </div>
      )}
    </div>
  )
}

export default Certifications
