import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/adminApi'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('adminToken')
      const savedUser = localStorage.getItem('adminUser')
      
      console.log('Checking auth status:', { token: !!token, savedUser: !!savedUser })
      
      if (token && savedUser) {
        const userData = JSON.parse(savedUser)
        console.log('Setting authenticated user:', userData)
        setIsAuthenticated(true)
        setUser(userData)
      } else {
        console.log('No valid auth data found')
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      // Clear invalid data
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      console.log('Attempting login with:', credentials.email)
      const response = await authApi.login(credentials)
      
      console.log('Login response:', response.data)
      
      if (response.data.success) {
        const { accessToken, refreshToken, admin } = response.data.data
        console.log('Login successful, storing data:', { token: !!accessToken, admin })
        
        // Store token and user data
        localStorage.setItem('adminToken', accessToken)
        localStorage.setItem('adminRefreshToken', refreshToken)
        localStorage.setItem('adminUser', JSON.stringify(admin))
        
        // Update state immediately
        setIsAuthenticated(true)
        setUser(admin)
        
        console.log('Auth state updated successfully')
        
        return { success: true }
      } else {
        return { success: false, error: response.data.message || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      console.error('Error response:', error.response?.data)
      const errorMessage = error.response?.data?.message || 'Network error. Please try again.'
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminRefreshToken')
      localStorage.removeItem('adminUser')
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      // For now, just update local state since there's no profile update endpoint
      const updatedUser = { ...user, ...profileData }
      setUser(updatedUser)
      localStorage.setItem('adminUser', JSON.stringify(updatedUser))
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Update failed' }
    }
  }

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    updateProfile,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}