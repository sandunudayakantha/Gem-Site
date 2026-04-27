import { Link, useLocation } from 'react-router-dom'
import logo from '../../shared/images/logo.png'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Products', icon: '💎' },
    { path: '/admin/categories', label: 'Categories', icon: '📁' },
    { path: '/admin/cuts', label: 'Cuts', icon: '📐' },
    { path: '/admin/gem-colors', label: 'Gem Colors', icon: '🌈' },
    { path: '/admin/clarities', label: 'Clarities', icon: '✨' },
    { path: '/admin/origins', label: 'Origins', icon: '🌍' },
    { path: '/admin/certifications', label: 'Certifications', icon: '📜' },
    { path: '/admin/orders', label: 'Orders', icon: '📦' },
    { path: '/admin/contact-messages', label: 'Messages', icon: '💬' },
    { path: '/admin/profile', label: 'Profile', icon: '👤' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="A S Gems Logo" className="h-14 w-auto" />
          <span className="text-xl font-light tracking-widest uppercase text-gold-gradient">
            AS COLLECTION
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-tighter">Admin Panel</p>
      </div>
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-1.5 rounded-lg transition ${
                  location.pathname === item.path
                    ? 'bg-accent text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <button
          onClick={() => {
            localStorage.removeItem('admin_token')
            window.location.href = '/login'
          }}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar

