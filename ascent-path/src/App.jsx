import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ExploreRoadmap from './pages/ExploreRoadmap'
import RoadmapDetail from './pages/RoadmapDetail'
import Dashboard from './pages/Dashboard'
import Assessment from './pages/Assessment'
import AIMentor from './pages/AIMentor'
import Resume from './pages/Resume'
import Jobs from './pages/Jobs'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import Onboarding from './pages/onboarding/Onboarding'
import InitialAssessment from './pages/onboarding/InitialAssessment'
import RoleDetail from './pages/RoleDetail'

const NO_NAVBAR_ROUTES = ['/login', '/register', '/onboarding', '/initial-assessment']

function AppInner() {
  const location = useLocation()
  const showNavbar = !NO_NAVBAR_ROUTES.some(r => location.pathname.startsWith(r))

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0F' }}>
      {showNavbar && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />

        {/* Protected routes */}
        <Route path="/explore" element={<PrivateRoute><ExploreRoadmap /></PrivateRoute>} />
        <Route path="/role/:slug" element={<PrivateRoute><RoleDetail /></PrivateRoute>} />
        <Route path="/roadmap/:slug" element={<PrivateRoute><RoadmapDetail /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/assessment" element={<PrivateRoute><Assessment /></PrivateRoute>} />
        <Route path="/mentor" element={<PrivateRoute><AIMentor /></PrivateRoute>} />
        <Route path="/resume" element={<PrivateRoute><Resume /></PrivateRoute>} />
        <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
        <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
        <Route path="/initial-assessment" element={<PrivateRoute><InitialAssessment /></PrivateRoute>} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
