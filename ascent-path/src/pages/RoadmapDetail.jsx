import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Lock, CheckCircle, Play, MessageCircle, ArrowRight, BookOpen, Code, FileText } from 'lucide-react'

const roadmapData = {
    beginner: [
        { id: 'html', label: 'HTML5', done: true },
        { id: 'css', label: 'CSS3', done: true },
        { id: 'js', label: 'JavaScript', active: true },
        { id: 'git', label: 'Git', done: true },
    ],
    intermediate: [
        { id: 'react', label: 'React', locked: true },
        { id: 'ts', label: 'TypeScript', locked: true },
        { id: 'api', label: 'REST APIs', locked: true },
        { id: 'node', label: 'Node.js', locked: true },
    ],
    advanced: [
        { id: 'sysdesign', label: 'System Design', locked: true },
        { id: 'docker', label: 'Docker', locked: true },
        { id: 'aws', label: 'AWS', locked: true },
        { id: 'cicd', label: 'CI/CD', locked: true },
    ],
}

const resources = [
    { type: 'VIDEO', title: 'JavaScript Crash Course 2024', source: 'Traversy Media', time: '1h 45m', icon: '▶' },
    { type: 'ARTICLE', title: 'A re-introduction to JavaScript', source: 'MDN Web Docs', time: '30 min', icon: '📄' },
    { type: 'DOCS', title: 'JavaScript Guide — MDN Reference', source: 'MDN Web Docs', time: 'Reference', icon: '📚' },
]

const typeColor = { VIDEO: 'text-orange-400 bg-orange-500/15 border-orange-500/30', ARTICLE: 'text-blue-400 bg-blue-500/15 border-blue-500/30', DOCS: 'text-green-400 bg-green-500/15 border-green-500/30' }

export default function RoadmapDetail() {
    return (
        <div className="pt-20 min-h-screen">
            {/* Animated Roadmap Header */}
            <div className="border-b border-white/5 pb-8 pt-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-xs text-orange-400 font-semibold mb-3">Frontend Developer Roadmap</div>
                    <div className="space-y-6">
                        {Object.entries(roadmapData).map(([level, nodes], ri) => (
                            <div key={level} className="flex items-center gap-3">
                                <span className={`text-xs font-bold w-24 capitalize flex-shrink-0 ${level === 'beginner' ? 'text-blue-400' :
                                        level === 'intermediate' ? 'text-orange-400' : 'text-slate-600'
                                    }`}>{level}</span>
                                <div className="flex items-center gap-2 overflow-x-auto">
                                    {nodes.map((node, ni) => (
                                        <div key={node.id} className="flex items-center gap-2 flex-shrink-0">
                                            <motion.button
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: ni * 0.08 + ri * 0.1 }}
                                                whileHover={!node.locked ? { scale: 1.1 } : {}}
                                                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all
                          ${node.done ? 'bg-blue-600/20 border border-blue-500/50 text-blue-300' : ''}
                          ${node.active ? 'bg-orange-500/25 border-2 border-orange-500 text-orange-200 node-pulse shadow-lg shadow-orange-500/20' : ''}
                          ${node.locked ? 'bg-white/5 border border-white/10 text-slate-600 cursor-not-allowed' : ''}
                        `}
                                            >
                                                {node.done && <CheckCircle size={12} className="text-blue-400" />}
                                                {node.active && <Play size={12} className="text-orange-400" fill="currentColor" />}
                                                {node.locked && <Lock size={10} className="text-slate-600" />}
                                                {node.label}
                                            </motion.button>
                                            {ni < nodes.length - 1 && (
                                                <div className={`w-8 h-0.5 flex-shrink-0 ${node.done ? 'bg-blue-500/50' : 'bg-white/10'}`} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Skill Detail */}
            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Skill Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Skill Header */}
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-2xl">
                                🔶
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">JavaScript</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-medium">
                                        Intermediate Gateway
                                    </span>
                                    <span className="text-slate-500 text-xs">Confidence: 0.0 (Not Started)</span>
                                </div>
                            </div>
                        </div>

                        {/* Lifecycle Bar */}
                        <div className="flex items-center gap-1 mt-6 overflow-x-auto">
                            {['Not Started', 'Learning', 'Assessed', 'Project Done', 'Verified'].map((step, i) => (
                                <div key={step} className="flex items-center">
                                    <div className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium ${i === 0 ? 'bg-orange-500 text-black' : 'bg-white/5 border border-white/10 text-slate-600'
                                        }`}>{step}</div>
                                    {i < 4 && <div className="w-4 h-0.5 bg-white/10 flex-shrink-0" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
                        {['Resources', 'Assessment', 'Project', 'MDN Docs'].map((t, i) => (
                            <button key={t} className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all ${i === 0 ? 'bg-orange-500 text-black' : 'text-slate-400 hover:text-white'
                                }`}>{t}</button>
                        ))}
                    </div>

                    {/* Resources */}
                    <div className="space-y-4">
                        {resources.map((r) => (
                            <motion.div
                                key={r.title}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ x: 4 }}
                                className="glass rounded-xl p-4 flex items-center gap-4 cursor-pointer"
                            >
                                <div className="text-2xl flex-shrink-0">{r.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-semibold text-sm truncate">{r.title}</div>
                                    <div className="text-slate-500 text-xs mt-0.5">{r.source} · {r.time}</div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-lg border font-bold flex-shrink-0 ${typeColor[r.type]}`}>
                                    {r.type}
                                </span>
                            </motion.div>
                        ))}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-4 bg-orange-500 hover:bg-orange-400 text-black font-bold py-4 rounded-xl transition-all glow-orange flex items-center justify-center gap-2"
                        >
                            <Play size={16} fill="black" /> Start Learning
                        </motion.button>
                    </div>
                </div>

                {/* Right: Skill Stats */}
                <div className="space-y-4">
                    <div className="glass rounded-2xl p-5">
                        <h3 className="text-white font-bold mb-4 text-sm">Skill Stats</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><CheckCircle size={14} className="text-green-400" />Prerequisites</span>
                                <span className="text-green-400 font-bold">3/3 ✓</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><Lock size={14} className="text-slate-600" />Assessment</span>
                                <span className="text-slate-600">Locked</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><Code size={14} className="text-slate-600" />Project</span>
                                <span className="text-slate-600">Locked</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><BookOpen size={14} className="text-slate-500" />Est. Time</span>
                                <span className="text-white">3–4 weeks</span>
                            </div>
                        </div>
                    </div>

                    <Link to="/mentor" className="block">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="glass-blue rounded-2xl p-4 text-center cursor-pointer"
                        >
                            <MessageCircle size={20} className="text-blue-400 mx-auto mb-2" />
                            <div className="text-blue-400 font-bold text-sm">Ask AI Mentor</div>
                            <div className="text-slate-500 text-xs mt-1">Get grounded MDN guidance</div>
                        </motion.div>
                    </Link>

                    <div className="glass rounded-2xl p-4">
                        <div className="text-white font-bold text-sm mb-3">Related Skills</div>
                        <div className="flex flex-wrap gap-2">
                            {['ES6+', 'Async/Await', 'DOM', 'Closures', 'Modules', 'Promises'].map(tag => (
                                <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
