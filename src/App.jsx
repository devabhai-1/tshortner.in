import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PWAInstallPrompt from './components/PWAInstallPrompt'

// Public Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import SignupReferral from './pages/SignupReferral'

// Protected Pages
import Dashboard from './pages/Dashboard'
import Links from './pages/Links'
import Wallet from './pages/Wallet'
import Partnership from './pages/Partnership'
import PartnershipDashboard from './pages/PartnershipDashboard'
import Profile from './pages/Profile'
import Support from './pages/Support'

// Static Pages
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import SupportPublic from './pages/SupportPublic'
import PartnershipPublic from './pages/PartnershipPublic'
import ProfilePublic from './pages/ProfilePublic'

function App() {
  return (
    <AuthProvider>
      <PWAInstallPrompt />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup-referral" element={<SignupReferral />} />
        
        {/* Static Pages - Public Access (No Login Required) */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/support" element={<SupportPublic />} />
        <Route path="/partnership" element={<PartnershipPublic />} />
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
        <Route path="/partnership/manage" element={
          <ProtectedRoute>
            <Partnership />
          </ProtectedRoute>
        } />
        <Route path="/partnership/dashboard/:linkId" element={
          <ProtectedRoute>
            <PartnershipDashboard />
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
  )
}

export default App
