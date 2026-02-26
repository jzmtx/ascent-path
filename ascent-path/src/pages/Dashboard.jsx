import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Flame, Target, Zap, Clock, TrendingUp, BadgeCheck, Mic, Loader2, ArrowRight } from 'lucide-react'
import InterviewModal from '../components/InterviewModal'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const velocityData = [
    { week: 'W1', score: 20 }, { week: 'W2', score: 35 }, { week: 'W3', score: 28 },
    { week: 'W4', score: 50 }, { week: 'W5', score: 45 }, { week: 'W6', score: 68 },
    { week: 'W7', score: 72 }, { week: 'W8', score: 80 },
]

const heatmap = [
    { topic: 'Arrays', strength: 0.9 }, { topic: 'DOM', strength: 0.85 },
    { topic: 'Async', strength: 0.6 }, { topic: 'APIs', strength: 0.7 },
    { topic: 'Classes', strength: 0.45 }, { topic: 'Modules', strength: 0.5 },
    { topic: 'Testing', strength: 0.2 }, { topic: 'CI/CD', strength: 0.1 },
]

const ICON_MAP = { Target, Zap, Flame, Clock }

// 3D Tilt Wrapper Component
const TiltCard = ({ children, className = "" }) => {
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseXSpring = useSpring(x)
    const mouseYSpring = useSpring(y)

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"])

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const xPct = mouseX / width - 0.5
        const yPct = mouseY / height - 0.5
        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className={`transition-all duration-200 ${className}`}
        >
            <div style={{ transform: "translateZ(10px)", transformStyle: "preserve-3d" }}>
                {children}
            </div>
        </motion.div>
    )
}

export default function Dashboard() {
    const [interviewSkill, setInterviewSkill] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [data, setData] = useState({ stats: [], skills: [], username: 'User' })
    const token = localStorage.getItem('access_token')

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API}/api/roles/dashboard-stats/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to fetch dashboard stats')
            const json = await res.json()
            setData(json)
        } catch (err) {
            console.error('Failed to fetch dashboard stats', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [token])

    const handleVerified = (skillName) => {
        setInterviewSkill(null)
        fetchStats()
    }

    if (loading) return (
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-[#0A0A0F] pt-32 text-center">
            <div className="text-slate-500 text-xl font-bold mb-4">{error}</div>
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-orange-500 text-black font-black rounded-xl hover:bg-orange-400 transition-all"
            >
                RETRY SESSION
            </button>
        </div>
    )

    return (
        <div className="pt-20 min-h-screen" style={{ perspective: '1000px' }}>
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-3xl font-black text-white tracking-tight">Welcome back, <span className="text-orange-400">{data?.first_name || data?.username || 'User'}</span></h1>
                        <p className="text-slate-500 mt-1 font-medium italic">Your learning intelligence report</p>
                    </motion.div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {(data.stats || []).map((stat) => {
                        const Icon = ICON_MAP[stat.icon] || Target
                        return (
                            <TiltCard key={stat.label}>
                                <div className="glass rounded-2xl p-5 border-white/5 h-full transition-colors hover:border-white/10">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color === 'orange' ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}>
                                        <Icon size={18} className={stat.color === 'orange' ? 'text-orange-400' : 'text-blue-400'} />
                                    </div>
                                    <div className="text-2xl font-black text-white tracking-tighter">{stat.value}</div>
                                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">{stat.label}</div>
                                    <div className={`text-[10px] font-black mt-2 italic px-2 py-0.5 rounded-lg w-fit ${stat.color === 'orange' ? 'text-orange-400 bg-orange-500/10' : 'text-blue-400 bg-blue-500/10'}`}>
                                        {stat.sub}
                                    </div>
                                </div>
                            </TiltCard>
                        )
                    })}
                </div>

                {/* My Active Roadmaps */}
                <div className="mb-10">
                    <h3 className="text-white font-black mb-6 flex items-center gap-2 italic uppercase text-lg tracking-tighter">
                        <Target size={20} className="text-orange-400" /> My Learning Command Center
                    </h3>

                    {data.my_roadmaps?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.my_roadmaps.map((rm) => (
                                <Link to={`/roadmap/${rm.slug}`} key={rm.slug}>
                                    <TiltCard>
                                        <div className="glass rounded-2xl p-6 border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/50 hover:shadow-[0_0_40px_rgba(249,115,22,0.15)] transition-all group overflow-hidden relative">
                                            {/* Glow effect */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-orange-500/20 transition-all" />

                                            <div className="flex items-center justify-between mb-5 relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-4xl drop-shadow-lg">{rm.icon}</div>
                                                    <div>
                                                        <div className="text-white font-black text-lg group-hover:text-orange-400 transition-colors uppercase italic tracking-tight">{rm.title}</div>
                                                        <div className="text-[10px] text-orange-200/60 font-black uppercase tracking-[0.2em]">{rm.tier} Level Active</div>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-orange-400 font-black text-3xl tracking-tighter">{rm.progress}%</div>
                                                    <div className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">Mastered</div>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5 relative z-10 mb-5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${rm.progress}%` }}
                                                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                                />
                                            </div>

                                            <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                                                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                                                    Pending nodes await
                                                </div>
                                                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-black font-black text-xs uppercase hover:scale-105 transition-transform">
                                                    Continue Learning <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </TiltCard>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <TiltCard>
                            <div className="glass rounded-2xl p-8 border border-white/5 flex flex-col items-center justify-center text-center min-h-[250px]">
                                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                    <Target className="w-8 h-8 text-slate-500" />
                                </div>
                                <h4 className="text-white font-bold text-xl mb-2">No Active Roadmaps</h4>
                                <p className="text-slate-400 text-sm max-w-sm mb-6">
                                    You haven't enrolled in a learning path yet. Choose a career roadmap to start gaining verified skills.
                                </p>
                                <Link
                                    to="/explore"
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-black font-black uppercase tracking-wide text-sm shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all hover:scale-105 active:scale-95 inline-block"
                                >
                                    Explore Roadmaps
                                </Link>
                            </div>
                        </TiltCard>
                    )}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                    {/* Skill Progress */}
                    <TiltCard>
                        <div className="glass rounded-2xl p-6 border-white/5 h-full">
                            <h3 className="text-white font-black mb-6 flex items-center gap-2 italic uppercase text-sm tracking-tighter">
                                <TrendingUp size={16} className="text-orange-400" /> Live Skill Progress
                            </h3>
                            <div className="space-y-5">
                                {(data.skills || []).map(({ name, pct, done, active, verified: isVerified }) => (
                                    <div key={name}>
                                        <div className="flex justify-between items-center text-[10px] mb-2 font-black uppercase tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-300">{name}</span>
                                                {isVerified && (
                                                    <span className="flex items-center gap-1 text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                                                        <BadgeCheck className="w-2.5 h-2.5" /> Verified
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={done ? 'text-blue-400' : active ? 'text-orange-400' : 'text-slate-600'}>{pct}%</span>
                                                {isVerified && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setInterviewSkill(name)}
                                                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30 text-green-300 hover:from-green-500/30 hover:to-emerald-600/30 transition-all font-semibold shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                                    >
                                                        <Mic className="w-2.5 h-2.5" />
                                                        Interview
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ delay: 0.3, duration: 1 }}
                                                className={`h-full rounded-full ${isVerified ? 'bg-gradient-to-r from-green-600 to-green-400' : done ? 'bg-gradient-to-r from-blue-600 to-blue-400' : active ? 'bg-gradient-to-r from-orange-600 to-orange-400' : 'bg-slate-700'}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TiltCard>

                    {/* Velocity Chart */}
                    <TiltCard>
                        <div className="glass rounded-2xl p-6 border-white/5 h-full">
                            <h3 className="text-white font-black mb-6 flex items-center gap-2 italic uppercase text-sm tracking-tighter">
                                <Zap size={16} className="text-blue-400" /> Learning Velocity
                            </h3>
                            <div className="h-48 mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={velocityData}>
                                        <defs>
                                            <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="week" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                        <YAxis hide />
                                        <Tooltip contentStyle={{ background: '#12121A', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 12, fontSize: 10, fontWeight: 'bold' }} />
                                        <Area type="monotone" dataKey="score" stroke="#F97316" strokeWidth={3} fill="url(#velGrad)" dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </TiltCard>
                </div>

                {/* Real Activity Heatmap */}
                <TiltCard>
                    <div className="glass rounded-2xl p-6 border-white/5">
                        <h3 className="text-white font-black mb-6 italic uppercase text-sm tracking-tighter flex items-center gap-2">
                            <Flame size={16} className="text-orange-400" /> Learning Activity (Last 28 Days)
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 28 }, (_, i) => {
                                const d = new Date()
                                d.setDate(d.getDate() - (27 - i))
                                const dateStr = d.toISOString().split('T')[0]
                                const count = data.activity_map?.[dateStr] || 0
                                return (
                                    <div
                                        key={dateStr}
                                        title={`${dateStr}: ${count} tasks`}
                                        className={`w-8 h-8 rounded-lg border border-white/5 transition-all hover:scale-110 flex items-center justify-center text-[10px] font-black
                                            ${count > 2 ? 'bg-orange-500 text-black' : count > 0 ? 'bg-orange-500/40 text-orange-200' : 'bg-white/5 text-slate-600'}`}
                                    >
                                        {d.getDate()}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex items-center gap-4 mt-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-orange-500" />High Activity</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-orange-500/40" />Some Activity</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-white/5" />No Activity</span>
                        </div>
                    </div>
                </TiltCard>

                {/* AI Interview Modal */}
                {interviewSkill && (
                    <InterviewModal
                        skill={interviewSkill}
                        onClose={() => setInterviewSkill(null)}
                        onVerified={handleVerified}
                    />
                )}
            </div>
        </div>
    )
}
