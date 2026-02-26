import { motion } from 'framer-motion'
import { Briefcase, MapPin, DollarSign, TrendingUp, ArrowRight, Zap } from 'lucide-react'

const jobs = [
    {
        title: 'Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'Remote',
        salary: '$80k–$110k',
        match: 91,
        tags: ['React', 'TypeScript', 'CSS'],
        missing: ['TypeScript'],
        hot: true,
    },
    {
        title: 'React Developer',
        company: 'StartupXY',
        location: 'Hybrid · NYC',
        salary: '$90k–$120k',
        match: 82,
        tags: ['React', 'Node.js', 'REST APIs'],
        missing: ['Node.js'],
    },
    {
        title: 'Full Stack Junior',
        company: 'Agency Labs',
        location: 'Remote',
        salary: '$65k–$85k',
        match: 68,
        tags: ['HTML', 'CSS', 'JS', 'React'],
        missing: ['Node.js', 'System Design'],
    },
    {
        title: 'UI Engineer',
        company: 'DesignHub',
        location: 'Remote',
        salary: '$85k–$115k',
        match: 78,
        tags: ['HTML', 'CSS', 'React', 'Animation'],
        missing: ['Figma Integration'],
    },
]

const matchColor = m => m > 85 ? 'text-green-400 bg-green-500/15 border-green-500/30' : m > 70 ? 'text-orange-400 bg-orange-500/15 border-orange-500/30' : 'text-slate-400 bg-slate-500/10 border-slate-500/20'

export default function Jobs() {
    return (
        <div className="pt-20 min-h-screen max-w-7xl mx-auto px-6 py-8 pb-24">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <h1 className="text-5xl font-black text-white mb-3">
                    Job <span className="text-orange-400">Recommendations</span>
                </h1>
                <p className="text-slate-500">Matched to your verified skill profile — Netrika, 78% readiness</p>
            </motion.div>

            {/* Readiness Banner */}
            <div className="glass rounded-2xl p-5 mb-8 flex items-center gap-6">
                <div className="relative w-16 h-16 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                        <circle
                            cx="32" cy="32" r="28"
                            fill="none"
                            stroke="url(#matchGrad)"
                            strokeWidth="6"
                            strokeDasharray={`${2 * Math.PI * 28 * 0.78} ${2 * Math.PI * 28}`}
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="matchGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop stopColor="#F97316" /><stop offset="1" stopColor="#2563EB" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">78%</div>
                </div>
                <div>
                    <div className="text-white font-bold">Job Readiness Score</div>
                    <div className="text-slate-500 text-sm mt-1">Based on: 14 verified skills · 3 projects · 87% consistency</div>
                </div>
                <div className="ml-auto text-right">
                    <div className="text-orange-400 font-bold text-sm flex items-center gap-1"><Zap size={14} />Priority Skills to Unlock More Jobs</div>
                    <div className="flex gap-2 mt-2">
                        {['TypeScript', 'Node.js', 'Testing'].map(s => (
                            <span key={s} className="text-xs px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400">{s}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Job Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {jobs.map((job, i) => (
                    <motion.div
                        key={job.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -4 }}
                        className="glass rounded-2xl p-5 cursor-pointer relative overflow-hidden group transition-all"
                    >
                        {job.hot && (
                            <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-orange-500 text-black font-bold">
                                🔥 Hot Match
                            </div>
                        )}

                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                                <Briefcase size={20} className="text-orange-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-bold truncate">{job.title}</h3>
                                <p className="text-slate-500 text-sm">{job.company}</p>
                            </div>
                            <span className={`text-sm font-black px-3 py-1 rounded-full border flex-shrink-0 ${matchColor(job.match)}`}>
                                {job.match}%
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-3 mb-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                            <span className="flex items-center gap-1"><DollarSign size={11} />{job.salary}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {job.tags.map(tag => (
                                <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">{tag}</span>
                            ))}
                        </div>

                        {job.missing.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-slate-600 mb-4">
                                <TrendingUp size={11} className="text-orange-400" />
                                <span>Gap skills: </span>
                                {job.missing.map(m => (
                                    <span key={m} className="text-orange-400 font-medium">{m}</span>
                                ))}
                            </div>
                        )}

                        <button className="w-full mt-1 flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-black transition-all group-hover:border-orange-500">
                            View Job <ArrowRight size={14} />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
