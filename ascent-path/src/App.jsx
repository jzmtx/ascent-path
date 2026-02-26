import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ExploreRoadmap from './pages/ExploreRoadmap'
import RoadmapDetail from './pages/RoadmapDetail'
import Dashboard from './pages/Dashboard'
import Assessment from './pages/Assessment'
import AIMentor from './pages/AIMentor'
import Resume from './pages/Resume'
import Jobs from './pages/Jobs'

export default function App() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0F' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExploreRoadmap />} />
        <Route path="/roadmap/:id" element={<RoadmapDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/mentor" element={<AIMentor />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/jobs" element={<Jobs />} />
      </Routes>
    </div>
  )
}
