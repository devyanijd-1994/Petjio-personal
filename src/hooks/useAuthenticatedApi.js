import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export const useAuthenticatedApi = () => {
  const { isAuthenticated, loading } = useAuth()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Wait a bit to ensure token is properly set in axios interceptors
      const timer = setTimeout(() => {
        setIsReady(true)
      }, 100)
      
      return () => clearTimeout(timer)
    } else {
      setIsReady(false)
    }
  }, [isAuthenticated, loading])

  return { isReady, isAuthenticated, loading }
}