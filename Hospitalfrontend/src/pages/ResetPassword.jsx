import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '../services/authService.js'

const ResetPassword = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokens, setTokens] = useState({ access_token: '', refresh_token: '' })
  const [isValidLink, setIsValidLink] = useState(false)

  useEffect(() => {
    // Handle both URL formats: hash fragment and query parameters
    const hash = location.hash || window.location.hash
    const search = location.search || window.location.search
    
    console.log('ResetPassword: Processing URL', { hash, search, location })
    
    let access_token = ''
    let refresh_token = ''
    let type = ''
    
    // Try to extract tokens from hash fragment first
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
      access_token = params.get('access_token') || ''
      refresh_token = params.get('refresh_token') || ''
      type = params.get('type') || ''
      console.log('ResetPassword: Found tokens in hash', { access_token: access_token.substring(0, 20) + '...', type })
    }
    // Fallback to query parameters
    else if (search && search.includes('access_token')) {
      const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      access_token = params.get('access_token') || ''
      refresh_token = params.get('refresh_token') || ''
      type = params.get('type') || ''
      console.log('ResetPassword: Found tokens in search', { access_token: access_token.substring(0, 20) + '...', type })
    }
    
    // Check if this is a valid recovery link
    if (type === 'recovery' && access_token) {
      setIsValidLink(true)
      setTokens({ access_token, refresh_token })
      console.log('ResetPassword: Valid recovery link detected')
    } else {
      setIsValidLink(false)
      console.log('ResetPassword: Invalid or missing recovery tokens', { type, hasAccessToken: !!access_token })
      toast.error('Invalid or expired reset link')
    }
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValidLink) {
      toast.error('Invalid reset link')
      return
    }
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      console.log('ResetPassword: Submitting password reset', { 
        hasAccessToken: !!tokens.access_token, 
        hasRefreshToken: !!tokens.refresh_token 
      })
      
      await authService.resetPassword({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        new_password: password
      })
      toast.success('Password updated successfully. Please login.')
      navigate('/login')
    } catch (err) {
      console.error('ResetPassword: Error resetting password', err)
      toast.error(err?.error || err?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!isValidLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">Invalid Reset Link</h2>
            <p className="mt-2 text-center text-sm text-secondary-600">This password reset link is invalid or has expired.</p>
          </div>
          <div className="text-center">
            <button 
              onClick={() => navigate('/forgot-password')}
              className="btn-primary w-full flex justify-center py-3"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">Reset your password</h2>
          <p className="mt-2 text-center text-sm text-secondary-600">Enter a new password to complete the reset.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary-700">New password</label>
            <input id="password" type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">Confirm password</label>
            <input id="confirmPassword" type="password" className="input-field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full flex justify-center py-3" disabled={loading}>
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword


