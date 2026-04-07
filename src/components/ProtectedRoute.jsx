import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  console.log('ProtectedRoute: Auth state', { isAuthenticated, loading })

  if (loading) {
    console.log('ProtectedRoute: Still loading, showing spinner')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('ProtectedRoute: Authenticated, rendering children')
  return children
}

export default ProtectedRoute