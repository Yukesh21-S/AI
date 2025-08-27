import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService.js'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuthStatus = () => {
      try {
        const currentUser = authService.getCurrentUser()
        const isAuth = authService.isAuthenticated()
        
        if (currentUser && isAuth) {
          setUser(currentUser)
        } else {
          // Clear any invalid data
          authService.logout()
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        authService.logout()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const signUp = async (email, password, name, specialization) => {
    try {
      const result = await authService.doctorSignup({
        email,
        password,
        name,
        specialization
      })
      
      // For signup, we don't automatically log in the user
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const result = await authService.doctorLogin({
        email,
        password
      })
      
      // Get the current user data after successful login
      const currentUser = authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        console.log('User logged in successfully:', currentUser)
      } else {
        console.error('Failed to get user data after login')
        throw new Error('Failed to get user data after login')
      }
      
      return { data: result, error: null }
    } catch (error) {
      console.error('Login error:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      authService.logout()
      setUser(null)
      console.log('User logged out successfully')
    } catch (error) {
      console.error('Error signing out:', error.message)
    }
  }

  const forgotPassword = async (email) => {
    try {
      const result = await authService.forgotPassword(email)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    return authService.isAuthenticated() && !!user
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    forgotPassword,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
