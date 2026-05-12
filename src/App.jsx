import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import ErrorBoundary from './components/ErrorBoundary'

// Public Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Protected Pages
import Dashboard from './pages/Dashboard'
import Links from './pages/Links'
import Wallet from './pages/Wallet'
import Profile from './pages/Profile'
import Support from './pages/Support'

// Static Pages
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import SupportPublic from './pages/SupportPublic'
import ProfilePublic from './pages/ProfilePublic'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PWAInstallPrompt />
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Static Pages - Public Access (No Login Required) */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/support" element={<SupportPublic />} />
        <Route path="/profile" element={<ProfilePublic />} />

        {/* Protected Routes (Require Login) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/links" element={
          <ProtectedRoute>
            <Links />
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        } />
        <Route path="/profile/manage" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/support/manage" element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
