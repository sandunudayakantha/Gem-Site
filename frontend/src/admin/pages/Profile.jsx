import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../shared/config/api'

const Profile = () => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1) // 1: Info, 2: Request Code, 3: Verify & Change
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    code: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/admin/me')
      setAdmin(response.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestCode = async () => {
    setIsSendingCode(true)
    try {
      await api.post('/auth/admin/request-code')
      toast.success('Verification code sent to your email')
      setStep(3)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send code')
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match')
    }

    if (formData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }

    setIsUpdatingPassword(true)
    try {
      await api.post('/auth/admin/change-password', {
        code: formData.code,
        newPassword: formData.newPassword
      })
      toast.success('Password updated successfully')
      setStep(1)
      setFormData({ code: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-2">Admin Profile</h1>
        <p className="text-gray-500 font-light">Manage your account security and information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-accent/5 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">👤</span>
              </div>
              <h2 className="text-xl font-medium text-gray-900">{admin?.username}</h2>
              <p className="text-sm text-gray-500 mb-6">{admin?.email}</p>
              
              <div className="w-full space-y-4 pt-4 border-t border-gray-50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full text-xs">Active</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Role</span>
                  <span className="text-gray-900 font-medium capitalize">Administrator</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl text-accent">🔐</span>
              <h2 className="text-xl font-medium text-gray-900">Security Settings</h2>
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Password Change</h3>
                  <p className="text-sm text-gray-500 mb-6 font-light leading-relaxed">
                    To change your password, we'll send a verification code to your registered email address 
                    <span className="text-gray-900 font-medium"> ({admin?.email})</span>.
                  </p>
                  <button
                    onClick={() => setStep(2)}
                    className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-lg shadow-black/10"
                  >
                    Manage Password
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm mb-6 flex gap-3">
                  <span className="text-lg">ℹ️</span>
                  <p>We will send a 6-digit code to your email. You will need this code to set a new password.</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleRequestCode}
                    disabled={isSendingCode}
                    className="flex-1 bg-accent text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-opacity-90 transition disabled:opacity-50"
                  >
                    {isSendingCode ? 'Sending Code...' : 'Send Verification Code'}
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition border border-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleUpdatePassword} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength="6"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="ENTER 6 DIGIT CODE"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-center text-2xl font-bold tracking-[10px] placeholder:text-sm placeholder:tracking-normal placeholder:font-normal"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-50 pt-6">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="flex-1 bg-black text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 shadow-xl shadow-black/10"
                  >
                    {isUpdatingPassword ? 'Updating Password...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition border border-gray-200"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
