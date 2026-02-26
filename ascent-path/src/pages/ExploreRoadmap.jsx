import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Search, Upload, TrendingUp, ArrowRight, Lock } from 'lucide-react'

const careers = [
    { title: 'Frontend Developer', skills: 18, level: 'Beginner', emoji: '🎨' },
    { title: 'Backend Developer', skills: 22, level: 'Intermediate', emoji: '⚙️' },
    { title: 'Full Stack Developer', skills: 35, level: 'Intermediate', emoji: '🔗' },
    { title: 'Data Analyst', skills: 20, level: 'Beginner', emoji: '📊' },
    { title: 'DevOps Engineer', skills: 28, level: 'Advanced', emoji: '🚀' },
    { title: 'ML Engineer', skills: 32, level: 'Advanced', emoji: '🤖' },
    { title: 'Cloud Architect', skills: 26, level: 'Advanced', emoji: '☁️' },
    { title: 'Mobile Developer', skills: 24, level: 'Intermediate', emoji: '📱' },
]

const levelColor = {
    Beginner: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    Intermediate: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
    Advanced: 'text-red-400 bg-red-500/15 border-red-500/30',
}

const roadmapRows = [
    { level: 'Beginner', color: 'blue', nodes: ['HTML5', 'CSS3', 'JavaScript', 'Git'], done: [0, 1, 3], active: 2 },
    { level: 'Intermediate', color: 'orange', nodes: ['React', 'TypeScript', 'REST APIs', 'Node.js'], active: -1 },
    { level: 'Advanced', color: 'gray', nodes: ['System Design', 'Docker', 'AWS', 'CI/CD'], active: -1 },
]

export default function ExploreRoadmap() {
    const [tab, setTab] = useState('trending')
    const [query, setQuery] = useState('')
    const [dragging, setDragging] = useState(false)

    const tabs = [
        { id: 'trending', label: '🔥 Trending Careers' },
        { id: 'search', label: '🔍 Search a Role' },
        { id: 'upload', label: '📄 Upload JD' },
    ]

    return (
        <div className="pt-24 min-h-screen max-w-7xl mx-auto px-6 pb-24">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h1 className="text-5xl font-black text-white mb-3">
                    Explore <span className="text-orange-400 underline decoration-orange-500/50 underline-offset-4">Roadmaps</span>
                </h1>
                <p className="text-slate-500 text-lg">Discover your path to employment — JD-aligned, evidence-backed.</p>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-1 mb-10 bg-white/5 p-1 rounded-2xl w-fit">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'text-black' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {tab === t.id && (
                            <motion.div
                                layoutId="tab-pill"
                                className="absolute inset-0 bg-orange-500 rounded-xl"
                            />
                        )}
                        <span className="relative z-10">{t.label}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* Trending Tab */}
                {tab === 'trending' && (
                    <motion.div key="trending" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                            {careers.map((career, i) => (
                                <motion.div
                                    key={career.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -4, borderColor: 'rgba(249,115,22,0.4)' }}
                                    className="glass rounded-2xl p-5 cursor-pointer group transition-all"
                                >
                                    <div className="text-3xl mb-3">{career.emoji}</div>
                                    <h3 className="text-white font-bold text-sm mb-2 leading-tight">{career.title}</h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-slate-500 text-xs">{career.skills} skills</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${levelColor[career.level]}`}>
                                            {career.level}
                                        </span>
                                    </div>
                                    <Link
                                        to="/roadmap/1"
                                        className="flex items-center gap-1 text-orange-400 text-xs font-bold group-hover:gap-2 transition-all"
                                    >
                                        Start Roadmap <ArrowRight size={12} />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Animated Roadmap Visualization */}
                        <AnimatedRoadmapGraph rows={roadmapRows} />
                    </motion.div>
                )}

                {/* Search Tab */}
                {tab === 'search' && (
                    <motion.div key="search" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="max-w-2xl mx-auto">
                            <div className="relative mb-8">
                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="Search a role — e.g. 'Data Scientist', 'React Developer'..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                                />
                            </div>
                            {query && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {careers.filter(c => c.title.toLowerCase().includes(query.toLowerCase())).map(career => (
                                        <motion.div
                                            key={career.title}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="glass rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-orange-500/30 transition-all"
                                        >
                                            <span className="text-2xl">{career.emoji}</span>
                                            <div>
                                                <div className="text-white font-semibold text-sm">{career.title}</div>
                                                <div className="text-slate-500 text-xs">{career.skills} skills</div>
                                            </div>
                                            <ArrowRight size={16} className="text-orange-400 ml-auto" />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Upload JD Tab */}
                {tab === 'upload' && (
                    <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="max-w-2xl mx-auto">
                            <div
                                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={e => { e.preventDefault(); setDragging(false) }}
                                className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all cursor-pointer ${dragging ? 'border-orange-500 bg-orange-500/10' : 'border-orange-500/30 bg-orange-500/5 hover:border-orange-500/60'
                                    }`}
                            >
                                <Upload size={40} className="text-orange-400 mx-auto mb-4" />
                                <h3 className="text-white font-bold text-xl mb-2">Drop your Job Description here</h3>
                                <p className="text-slate-500 mb-6">Supports PDF and plain text files</p>
                                <button className="bg-orange-500 text-black font-bold px-6 py-3 rounded-full hover:bg-orange-400 transition-all">
                                    Browse File
                                </button>
                            </div>

                            {/* AI Flow Diagram */}
                            <div className="mt-10">
                                <div className="text-slate-500 text-sm text-center mb-6">How it works</div>
                                <div className="flex items-center justify-between gap-2">
                                    {['Upload JD', 'Extract Skills', 'Map Taxonomy', 'Generate Roadmap'].map((step, i) => (
                                        <div key={step} className="flex items-center gap-2">
                                            <div className="glass rounded-xl p-3 text-center flex-1 min-w-0">
                                                <div className="text-orange-400 font-bold text-xs">{step}</div>
                                            </div>
                                            {i < 3 && (
                                                <motion.div
                                                    initial={{ scaleX: 0 }}
                                                    animate={{ scaleX: 1 }}
                                                    transition={{ delay: i * 0.3 }}
                                                    className="w-6 h-0.5 bg-blue-500/60 flex-shrink-0 origin-left"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function AnimatedRoadmapGraph({ rows }) {
    return (
        <div className="glass rounded-3xl p-8">
            <h3 className="text-white font-bold mb-8 flex items-center gap-2">
                <TrendingUp size={18} className="text-orange-400" />
                Skill Progression Map — Frontend Developer
            </h3>
            <div className="space-y-8">
                {rows.map((row, ri) => (
                    <div key={row.level} className="flex items-center gap-2">
                        <div className={`text-xs font-bold w-24 flex-shrink-0 ${row.color === 'blue' ? 'text-blue-400' :
                                row.color === 'orange' ? 'text-orange-400' : 'text-slate-600'
                            }`}>{row.level}</div>
                        <div className="flex items-center gap-2 flex-1">
                            {row.nodes.map((node, ni) => {
                                const isDone = row.done?.includes(ni)
                                const isActive = row.active === ni
                                const isLocked = !isDone && !isActive && ri > 0
                                return (
                                    <div key={node} className="flex items-center gap-2">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            transition={{ delay: ni * 0.1 + ri * 0.2 }}
                                            viewport={{ once: true }}
                                            className={`relative px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0
                        ${isDone ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300' : ''}
                        ${isActive ? 'bg-orange-500/20 border border-orange-500 text-orange-300 node-pulse' : ''}
                        ${isLocked ? 'bg-white/5 border border-white/10 text-slate-600' : ''}
                        ${!isDone && !isActive && !isLocked ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400' : ''}
                      `}
                                        >
                                            {isLocked && <Lock size={10} className="inline mr-1" />}
                                            {node}
                                        </motion.div>
                                        {ni < row.nodes.length - 1 && (
                                            <div className={`w-6 h-0.5 flex-shrink-0 ${isDone ? 'bg-blue-500/50' : 'bg-white/10'}`} />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
