import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './components/LoginPage'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Services from './pages/Services'
import UserManagement from './pages/UserManagement'
import VendorManagement from './pages/VendorManagement'
import ServiceFormManagement from './pages/ServiceFormManagement'
import ServiceRegistrations from './pages/ServiceRegistrations'
import WalletManagement from './pages/WalletManagement'
import Profile from './pages/Profile'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Overview />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <Layout>
                  <Services />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendors"
            element={
              <ProtectedRoute>
                <Layout>
                  <VendorManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-forms"
            element={
              <ProtectedRoute>
                <Layout>
                  <ServiceFormManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-registrations"
            element={
              <ProtectedRoute>
                <Layout>
                  <ServiceRegistrations />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Layout>
                  <WalletManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App