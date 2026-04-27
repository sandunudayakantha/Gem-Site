import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../shared/config/api'

const Login = () => {
  const navigate = useNavigate()
  const [view, setView] = useState('login') // 'login', 'forgot-request', 'forgot-reset'
  const [loading, setLoading] = useState(false)
  
  // Login State
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  })

  // Forgot Password State
  const [email, setEmail] = useState('')
  const [formData, setFormData] = useState({
    code: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    })
  }

  const handleResetChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/auth/admin/login', loginData)
      localStorage.setItem('admin_token', response.data.token)
      toast.success('Login successful!')
      navigate('/admin/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotRequest = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/admin/forgot-password', { email })
      toast.success('Verification code sent to your email')
      setView('forgot-reset')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    setLoading(true)
    try {
      await api.post('/auth/admin/reset-password', { 
        email, 
        code: formData.code, 
        newPassword: formData.newPassword 
      })
      toast.success('Password reset successfully!')
      setView('login')
      setLoginData({ ...loginData, password: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transition-all duration-300">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-accent mb-2">
            {view === 'login' ? 'Admin Login' : 'Reset Password'}
          </h1>
          <p className="text-gray-500">
            {view === 'login' 
              ? 'A S Gems Admin Panel' 
              : view === 'forgot-request' 
                ? 'Enter your email to receive an OTP'
                : 'Enter the code and your new password'
            }
          </p>
        </div>
        
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                name="username"
                value={loginData.username}
                onChange={handleLoginChange}
                required
                placeholder="admin@asgems.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <button 
                  type="button"
                  onClick={() => setView('forgot-request')}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {view === 'forgot-request' && (
          <form onSubmit={handleForgotRequest} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>

            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
              >
                {loading ? 'Sending code...' : 'Send Verification Code'}
              </button>
              <button
                type="button"
                onClick={() => setView('login')}
                className="w-full text-gray-500 font-semibold hover:text-gray-700 transition"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {view === 'forgot-reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                OTP Code
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleResetChange}
                required
                maxLength="6"
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleResetChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleResetChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>

            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button
                type="button"
                onClick={() => setView('forgot-request')}
                className="w-full text-gray-500 font-semibold hover:text-gray-700 transition"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login

