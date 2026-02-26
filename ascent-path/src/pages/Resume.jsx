import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Download, Share2, CheckCircle, Lock, ExternalLink, TrendingUp, Loader2, MapPin, Target, Sparkles } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const levelColor = {
    Advanced: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    Intermediate: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
    Beginner: 'text-slate-400 bg-slate-500/15 border-slate-500/30',
    Learning: 'text-slate-500 bg-white/5 border-white/10',
}

// 3D Tilt Wrapper Component
const TiltCard = ({ children, className = "" }) => {
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseXSpring = useSpring(x)
    const mouseYSpring = useSpring(y)

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"])

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
            <div style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}>
                {children}
            </div>
        </motion.div>
    )
}

export default function Resume() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [data, setData] = useState(null)
    const [downloading, setDownloading] = useState(false)
    const token = localStorage.getItem('access_token')

    useEffect(() => {
        const fetchResumeData = async () => {
            try {
                const res = await fetch(`${API}/api/roles/resume-analytics/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (!res.ok) throw new Error('Failed to fetch resume data')
                const json = await res.json()
                setData(json)
            } catch (err) {
                console.error('Failed to fetch resume analytics', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchResumeData()
    }, [token])

    const handleDownloadPDF = async () => {
        setDownloading(true)
        try {
            const roadmapsRes = await fetch(`${API}/api/roles/roadmaps/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!roadmapsRes.ok) throw new Error('Failed to fetch roadmaps')
            const roadmaps = await roadmapsRes.json()
            const enrolled = roadmaps.filter(r => r.is_enrolled)

            if (enrolled.length === 0) {
                alert('Please enroll in a roadmap first to generate a resume.')
                return
            }

            const slug = enrolled[0].slug
            const res = await fetch(`${API}/api/roles/generate-resume/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ slug: slug })
            })
            if (!res.ok) throw new Error('Failed to generate resume')
            const result = await res.json()
            if (result.resume_url) {
                window.open(`${API}${result.resume_url}`, '_blank')
            }
        } catch (err) {
            alert(err.message || 'Failed to generate resume')
        } finally {
            setDownloading(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
    )

    if (error || !data) return (
        <div className="min-h-screen bg-[#0A0A0F] pt-32 text-center">
            <div className="text-slate-500 text-xl font-bold mb-4">{error || 'Failed to load resume analytics.'}</div>
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-orange-500 text-black font-black rounded-xl hover:bg-orange-400 transition-all"
            >
                RETRY SESSION
            </button>
        </div>
    )

    return (
        <div className="pt-20 min-h-screen max-w-7xl mx-auto px-6 py-8 pb-24 border-none" style={{ perspective: '1000px' }}>
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-8 border-white/5 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles size={120} className="text-orange-500 rotate-12" />
                </div>

                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center text-4xl font-black text-white flex-shrink-0 shadow-2xl shadow-orange-500/20 rotate-3">
                    {data.header?.full_name?.split(' ').filter(Boolean).map(n => n[0]).join('') || '?'}
                </div>
                <div className="flex-1 text-center sm:text-left z-10">
                    <h1 className="text-3xl font-black text-white tracking-tight">{data.header?.full_name || 'Anonymous User'}</h1>
                    <p className="text-blue-400 font-bold text-sm mt-1 uppercase tracking-widest">{data.header?.title || 'Professional Candidate'}</p>

                    <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                        <span className="flex items-center gap-1.5 text-xs px-4 py-2 bg-orange-500/20 border border-orange-500/40 rounded-full text-orange-400 font-black shadow-lg shadow-orange-500/10">
                            <Target size={14} /> Job Readiness: {data.header?.readiness || 0}%
                        </span>
                        <span className="flex items-center gap-1.5 text-xs px-4 py-2 bg-white/5 border border-white/10 rounded-full text-slate-400 font-medium">
                            <MapPin size={12} /> {data.header?.location || 'Remote'}
                        </span>
                        <span className="text-xs px-4 py-2 bg-blue-500/15 border border-blue-500/30 rounded-full text-blue-400 font-bold">
                            ⚡ Evidence-Backed
                        </span>
                    </div>
                </div>
                <div className="flex gap-4 flex-shrink-0 z-10">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="flex items-center gap-2 text-sm px-6 py-3 border border-white/10 rounded-2xl text-slate-300 hover:text-white hover:bg-white/5 transition-all font-bold disabled:opacity-50"
                    >
                        {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={16} />}
                        VERIFIED PDF
                    </button>
                    <button className="flex items-center gap-2 text-sm px-6 py-3 bg-orange-500 rounded-2xl text-black font-black hover:bg-orange-400 shadow-xl shadow-orange-500/20 hover:scale-105 transition-all">
                        <Share2 size={16} /> SHARE
                    </button>
                </div>
            </motion.div>

            {/* Confidence Meters */}
            <div className="glass rounded-3xl p-8 mb-10 border-white/5 shadow-2xl">
                <h2 className="text-white font-black text-xl mb-6 flex items-center gap-2 italic">
                    <TrendingUp size={24} className="text-blue-400" /> PROVEN COMPETENCE DOMAINS
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {(data.domains || []).map(({ name, pct }, i) => (
                        <div key={name} className="relative group">
                            <div className="flex justify-between text-xs mb-2 items-end">
                                <span className="text-slate-200 font-bold uppercase tracking-wider">{name}</span>
                                <span className={`font-black tracking-tighter text-lg ${pct > 70 ? 'text-blue-400' : pct > 40 ? 'text-orange-400' : 'text-slate-600'}`}>
                                    {pct}% {pct > 70 ? '✓ VERIFIED' : 'ACTIVE'}
                                </span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden shadow-inner cursor-help border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ delay: i * 0.1 + 0.3, duration: 1.5, ease: "easeOut" }}
                                    className={`h-full rounded-full relative ${pct > 70 ? 'bg-gradient-to-r from-blue-700 to-blue-400' : 'bg-gradient-to-r from-orange-700 to-orange-400'}`}
                                >
                                    <div className="absolute top-0 right-0 w-2 h-full bg-white/20 blur-sm animate-pulse" />
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* Verified Skills Grid */}
                <div className="lg:col-span-3 space-y-6">
                    <h2 className="text-white font-black text-xl italic flex items-center gap-2">
                        <CheckCircle size={24} className="text-green-400" /> VERIFIED EVIDENCE
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {(data.skills || []).map((skill, i) => (
                            <TiltCard key={skill.name}>
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass rounded-2xl p-6 border-white/5 group hover:border-orange-500/30 transition-colors cursor-default"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-black text-orange-400 text-lg shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                                                {skill.name?.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-xl font-black text-white">{skill.name}</div>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-black uppercase tracking-widest ${levelColor[skill.level] || levelColor.Learning}`}>
                                                    {skill.level}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-white tracking-tighter">{Math.round((skill.confidence || 0) * 100)}%</div>
                                            <div className="text-slate-600 text-[10px] font-black uppercase">confidence</div>
                                        </div>
                                    </div>
                                    <div className="border-t border-white/5 pt-4">
                                        <div className="text-slate-500 text-[10px] mb-3 font-black uppercase tracking-widest italic opacity-60">Verification Chain</div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(skill.evidence || []).map(e => (
                                                <div key={e} className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                                                    <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                                                    {e}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </TiltCard>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-white font-black text-xl italic flex items-center gap-2 uppercase tracking-tighter">
                        <Lock size={24} className="text-blue-500" /> Immutable Proof
                    </h2>

                    {(data.projects || []).map((p, i) => (
                        <motion.div
                            key={p.title || i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass rounded-2xl p-6 border-white/5 hover:bg-white/5 transition-all group"
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <h3 className="text-white font-black text-lg leading-tight tracking-tight group-hover:text-blue-400 transition-colors uppercase italic">{p.title || 'Untitled Project'}</h3>
                                <span className="text-[10px] px-3 py-1 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg font-black uppercase tracking-widest shadow-lg shadow-green-500/5">Verified</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {(p.tags || []).map(tag => (
                                    <span key={tag} className="text-[10px] px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-bold uppercase">{tag}</span>
                                ))}
                            </div>
                            <div className="flex items-center justify-between text-xs pt-4 border-t border-white/5">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Proof: <span className="text-blue-400">{(p.originality || 0)}% Original</span></span>
                                <a
                                    href={p.github_url || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-400 hover:text-white flex items-center gap-1.5 font-black uppercase tracking-tighter transition-all hover:translate-x-1"
                                >
                                    VIEW SOURCE <ExternalLink size={14} />
                                </a>
                            </div>
                        </motion.div>
                    ))}

                    <div className="glass-blue rounded-3xl p-8 relative overflow-hidden border border-blue-500/30 shadow-blue-500/10">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full" />
                        <div className="flex items-center gap-3 mb-4">
                            <Lock size={20} className="text-blue-400" />
                            <span className="text-blue-400 font-black text-sm uppercase tracking-widest">Anti-Fraud Engine</span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed font-medium italic">
                            Evidence in this resume is cryptographically locked to the user's proctored assessment records. Any manipulation of local data will invalidate the verification chain.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
