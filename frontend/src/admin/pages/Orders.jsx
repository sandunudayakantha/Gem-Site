import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../shared/config/api'
import Loading from '../components/Loading'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [selectedStatus])

  const fetchOrders = async () => {
    try {
      const params = selectedStatus ? { status: selectedStatus } : {}
      const response = await api.get('/orders', { params })
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus })
      toast.success('Order status updated')
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">All Orders</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Dispatched">Dispatched</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Order #{order.orderNumber}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`px-4 py-2 rounded-lg font-semibold border-2 ${
                      order.status === 'Delivered' ? 'border-green-500 text-green-700' :
                      order.status === 'Processing' ? 'border-blue-500 text-blue-700' :
                      order.status === 'Dispatched' ? 'border-purple-500 text-purple-700' :
                      'border-yellow-500 text-yellow-700'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <p className="text-xl font-bold text-accent">${Number(order.totalAmount).toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                  <p className="text-sm text-gray-700"><strong>Name:</strong> {order.customer.name}</p>
                  <p className="text-sm text-gray-700"><strong>Email:</strong> {order.customer.email}</p>
                  <p className="text-sm text-gray-700"><strong>Phone:</strong> {order.customer.phone}</p>
                  <p className="text-sm text-gray-700"><strong>Address:</strong> {order.customer.address}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        {item.images && item.images.length > 0 && (
                          <img
                            src={`http://localhost:5007${item.images[0]}`}
                            alt={item.title}
                            className="w-24 h-24 object-cover rounded border border-gray-200"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-lg mb-1">{item.title}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 mt-2">
                            {item.cut && (
                              <p className="text-xs text-gray-600"><strong>Cut:</strong> {item.cut}</p>
                            )}
                            {item.gemColor && (
                              <p className="text-xs text-gray-600"><strong>Color:</strong> {item.gemColor}</p>
                            )}
                            {item.clarity && (
                              <p className="text-xs text-gray-600"><strong>Clarity:</strong> {item.clarity}</p>
                            )}
                            {item.weight && (
                              <p className="text-xs text-gray-600"><strong>Weight:</strong> {item.weight} ct</p>
                            )}
                            {item.origin && (
                              <p className="text-xs text-gray-600"><strong>Origin:</strong> {item.origin}</p>
                            )}
                            {item.certification && (
                              <p className="text-xs text-gray-600"><strong>Certificate:</strong> {item.certification}</p>
                            )}
                            {item.dimensions && (
                              <p className="text-xs text-gray-600"><strong>Size:</strong> {item.dimensions}</p>
                            )}
                            {item.treatment && (
                              <p className="text-xs text-gray-600"><strong>Treatment:</strong> {item.treatment}</p>
                            )}
                          </div>
                          <div className="mt-3 pt-2 border-t border-gray-50 flex justify-between items-center">
                            <p className="text-sm font-medium text-accent">
                              ${Number(item.price).toFixed(2)} {item.priceUnit === 'per_carat' ? '/ ct' : ''} x {item.quantity}
                            </p>
                            {item.size || item.color ? (
                              <p className="text-xs text-gray-400 font-light">
                                {item.size} {item.size && item.color ? '|' : ''} {item.color}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      )}
    </div>
  )
}

export default Orders

