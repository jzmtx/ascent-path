import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Briefcase, TrendingUp, DollarSign, CheckCircle2, AlertCircle,
    ChevronRight, ArrowLeft, Loader2, MapPin, Lock
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const DEMAND_BADGE = {
    high: 'text-green-400 bg-green-500/10 border-green-500/30',
    medium: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    low: 'text-slate-400 bg-white/5 border-white/10',
}

const DIFF_COLOR = {
    beginner: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    intermediate: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    advanced: 'text-red-400 border-red-500/30 bg-red-500/10',
}

export default function RoleDetail() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(true)
    const [enrolling, setEnrolling] = useState(false)
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [error, setError] = useState('')
    const token = localStorage.getItem('access_token')

    useEffect(() => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        fetch(`${API}/api/roles/${slug}/`, { headers })
            .then(r => r.json())
            .then(data => {
                if (data.error) throw new Error(data.error)
                setRole(data)
                // If it already has nodes and they were enrolled, we might know from backend 
                // but let's check a specific endpoint or field if we add it.
                // For now, if nodes exist, it's a good sign.
                if (data.is_enrolled) setIsEnrolled(true)
            })
            .catch(e => setError(e.message || 'Failed to load role'))
            .finally(() => setLoading(false))
    }, [slug])

    const handleEnroll = async () => {
        if (!token) {
            navigate('/login')
            return
        }
        setEnrolling(true)
        try {
            const res = await fetch(`${API}/api/roles/enroll/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ slug })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Enrollment failed')
            setIsEnrolled(true)
            // Refresh role data to see nodes
            const roleRes = await fetch(`${API}/api/roles/${slug}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const updatedRole = await roleRes.json()
            setRole(updatedRole)
            // Navigate to the animated roadmap!
            navigate(`/roadmap/${slug}`)
        } catch (err) {
            alert(err.message)
        } finally {
            setEnrolling(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-orange-400 animate-spin" />
            <p className="text-white font-semibold">Loading role analysis...</p>
            <p className="text-slate-400 text-sm">Gemini AI is analyzing live job data</p>
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center gap-4 text-center px-4">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
            <p className="text-slate-400">{error}</p>
            <button onClick={() => navigate('/explore')} className="px-6 py-3 rounded-xl bg-orange-500 text-black font-bold">
                ← Back to Explore
            </button>
        </div>
    )

    return (
        <div className="min-h-screen pt-24 pb-20 max-w-6xl mx-auto px-6">

            {/* Back */}
            <button onClick={() => navigate('/explore')}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Explore
            </button>

            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <div className="flex items-start justify-between flex-wrap gap-6">
                    <div>
                        <div className="text-5xl mb-3">{role.icon}</div>
                        <h1 className="text-4xl font-black text-white mb-2">{role.title}</h1>
                        <p className="text-slate-400 max-w-2xl">{role.industry_description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${DEMAND_BADGE[role.demand_level] || DEMAND_BADGE.medium}`}>
                            <TrendingUp className="w-4 h-4" />
                            {role.demand_level?.charAt(0).toUpperCase() + role.demand_level?.slice(1)} Demand
                        </div>
                        <div className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full text-sm font-semibold">
                            <Briefcase className="w-4 h-4" />
                            {role.live_job_count} live openings
                        </div>
                        {role.salary_range && (
                            <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-full text-sm font-semibold">
                                <DollarSign className="w-4 h-4" />
                                {role.salary_range}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left — Industry Expectations */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Must-have skills */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-400" />
                            What Industry Expects (Must-Have)
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {role.must_have_skills?.map(skill => (
                                <span key={skill} className="px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-sm font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Nice-to-have */}
                    {role.nice_to_have_skills?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-400" />
                                Nice to Have
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {role.nice_to_have_skills.map(skill => (
                                    <span key={skill} className="px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Interview Topics */}
                    {role.interview_topics?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                            <h2 className="text-white font-bold text-lg mb-4">Common Interview Topics</h2>
                            <div className="space-y-2">
                                {role.interview_topics.map((topic, i) => (
                                    <div key={topic} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                        <span className="text-orange-400 font-bold text-sm w-6">{i + 1}</span>
                                        <span className="text-slate-300 text-sm">{topic}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Roadmap nodes */}
                    {role.nodes?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                            <h2 className="text-white font-bold text-lg mb-4">
                                Learning Roadmap ({role.nodes.length} topics · {role.estimated_months} months)
                            </h2>
                            <div className="space-y-3">
                                {role.nodes.map((node, i) => (
                                    <div key={node.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 transition-all">
                                        <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs flex-shrink-0">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-white font-semibold text-sm">{node.title}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${DIFF_COLOR[node.difficulty]}`}>
                                                    {node.difficulty}
                                                </span>
                                                <span className="text-slate-500 text-xs">~{node.estimated_days} days</span>
                                            </div>
                                            <p className="text-slate-400 text-xs">{node.description}</p>
                                            {node.resource_url && (
                                                <a href={node.resource_url} target="_blank" rel="noopener noreferrer"
                                                    className="text-blue-400 text-xs hover:text-blue-300 mt-1 inline-block">
                                                    Official resource →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right sidebar — Skill Gap + CTA */}
                <div className="space-y-4">
                    {/* Start CTA */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className={`bg-gradient-to-br border rounded-2xl p-6 ${isEnrolled ? 'from-green-500/10 to-green-600/5 border-green-500/30' : 'from-orange-500/10 to-orange-600/5 border-orange-500/30'}`}>
                        <h3 className="text-white font-bold mb-2">
                            {isEnrolled ? 'Already Enrolled!' : 'Start this Roadmap'}
                        </h3>
                        <p className="text-slate-400 text-sm mb-5">
                            {isEnrolled
                                ? 'You are currently tracking this career path. View your progress in the dashboard.'
                                : `Begin your structured journey to ${role.title}`}
                        </p>
                        {!token ? (
                            <button onClick={() => navigate('/register')}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold hover:from-orange-400 hover:to-orange-500 transition-all">
                                Sign Up to Start Free →
                            </button>
                        ) : isEnrolled ? (
                            <button onClick={() => navigate(`/roadmap/${slug}`)}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold hover:from-orange-400 hover:to-orange-500 transition-all">
                                View Your Roadmap →
                            </button>
                        ) : (
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${enrolling
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500'
                                    }`}
                            >
                                {enrolling ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating Path...
                                    </>
                                ) : (
                                    'Enroll & Track Progress →'
                                )}
                            </button>
                        )}
                    </motion.div>

                    {/* Skill Gap (only when logged in) */}
                    {role.skill_gap?.length > 0 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                            className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-bold mb-4">Your Skill Gap</h3>
                            <div className="space-y-2">
                                {role.skill_gap.map(item => (
                                    <div key={item.skill} className="flex items-center gap-2">
                                        {item.have_it
                                            ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                                            : <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                                        <span className={`text-sm ${item.have_it ? 'text-green-400' : 'text-slate-300'}`}>
                                            {item.skill}
                                        </span>
                                        {item.have_it && <span className="text-xs text-green-600 ml-auto">Verified</span>}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
                                    style={{ width: `${(role.skill_gap.filter(s => s.have_it).length / role.skill_gap.length) * 100}%` }} />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                {role.skill_gap.filter(s => s.have_it).length}/{role.skill_gap.length} must-have skills verified
                            </p>
                        </motion.div>
                    )}

                    {/* Quick stats */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                        className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 space-y-4">
                        <h3 className="text-white font-bold">Quick Stats</h3>
                        {[
                            { label: 'Live Job Openings', value: role.live_job_count, icon: <Briefcase className="w-4 h-4" /> },
                            { label: 'Avg Salary', value: role.salary_range || 'Varies', icon: <DollarSign className="w-4 h-4" /> },
                            { label: 'Learning Duration', value: `${role.estimated_months} months`, icon: <MapPin className="w-4 h-4" /> },
                        ].map(stat => (
                            <div key={stat.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400 text-sm">{stat.icon}{stat.label}</div>
                                <span className="text-white font-semibold text-sm">{stat.value}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
