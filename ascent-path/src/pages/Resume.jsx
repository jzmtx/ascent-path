import { motion } from 'framer-motion'
import { Download, Share2, CheckCircle, Lock, ExternalLink, TrendingUp } from 'lucide-react'

const skills = [
    { name: 'HTML', level: 'Advanced', confidence: 0.95, evidence: ['3 proctored challenges', '2 verified projects', '95% consistency'] },
    { name: 'CSS', level: 'Advanced', confidence: 0.91, evidence: ['2 proctored challenges', '2 verified projects', '91% consistency'] },
    { name: 'JavaScript', level: 'Intermediate', confidence: 0.80, evidence: ['2 proctored challenges', '1 verified project', '78% consistency'] },
    { name: 'React', level: 'Intermediate', confidence: 0.72, evidence: ['1 proctored challenge', '1 verified project', '72% consistency'] },
]

const domains = [
    { name: 'Frontend', pct: 88 },
    { name: 'JavaScript', pct: 80 },
    { name: 'React', pct: 72 },
    { name: 'REST APIs', pct: 55 },
    { name: 'Testing', pct: 30 },
    { name: 'TypeScript', pct: 20 },
]

const projects = [
    { title: 'Todo App with Local Storage', tags: ['HTML', 'CSS', 'JS'], originality: 96, passed: true },
    { title: 'Weather Dashboard API', tags: ['JS', 'REST APIs', 'CSS'], originality: 94, passed: true },
    { title: 'React Portfolio Site', tags: ['React', 'CSS'], originality: 91, passed: true },
]

const levelColor = {
    Advanced: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    Intermediate: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
    Beginner: 'text-slate-400 bg-slate-500/15 border-slate-500/30',
}

export default function Resume() {
    return (
        <div className="pt-20 min-h-screen max-w-7xl mx-auto px-6 py-8 pb-24">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6"
            >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center text-3xl font-black text-white flex-shrink-0">
                    AC
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-2xl font-black text-white">Alex Chen</h1>
                    <p className="text-slate-400 text-sm mt-1">Full Stack Developer Candidate</p>
                    <div className="flex flex-wrap gap-3 mt-3 justify-center sm:justify-start">
                        <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-orange-500/15 border border-orange-500/30 rounded-full text-orange-400 font-bold">
                            🎯 Job Readiness: 78%
                        </span>
                        <span className="text-xs px-3 py-1.5 bg-white/5 rounded-full text-slate-500">📍 Remote-ready</span>
                        <span className="text-xs px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded-full text-blue-400">⚡ Evidence-Backed</span>
                    </div>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                    <button className="flex items-center gap-2 text-sm px-4 py-2 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 transition-all">
                        <Download size={14} /> PDF
                    </button>
                    <button className="flex items-center gap-2 text-sm px-4 py-2 bg-orange-500 rounded-xl text-black font-bold hover:bg-orange-400 transition-all">
                        <Share2 size={14} /> Share
                    </button>
                </div>
            </motion.div>

            {/* Confidence Meters */}
            <div className="glass rounded-2xl p-6 mb-8">
                <h2 className="text-white font-bold mb-5">Skill Confidence Domains</h2>
                <div className="space-y-3">
                    {domains.map(({ name, pct }, i) => (
                        <div key={name}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">{name}</span>
                                <span className={`font-bold ${pct > 70 ? 'text-blue-400' : pct > 50 ? 'text-orange-400' : 'text-slate-500'}`}>
                                    {pct}% {pct > 70 ? '✓ Verified' : 'In Progress'}
                                </span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ delay: i * 0.1 + 0.3, duration: 1 }}
                                    className={`h-full rounded-full ${pct > 70 ? 'bg-blue-500' : 'bg-orange-500'}`}
                                    style={{ background: pct > 70 ? 'linear-gradient(90deg, #2563EB, #60A5FA)' : 'linear-gradient(90deg, #EA580C, #F97316)' }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Skill Cards */}
                <div className="lg:col-span-3 space-y-4">
                    <h2 className="text-white font-bold">Verified Skills</h2>
                    {skills.map((skill, i) => (
                        <motion.div
                            key={skill.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass rounded-2xl p-5"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center font-black text-orange-400 text-sm">
                                        {skill.name.slice(0, 2)}
                                    </div>
                                    <div>
                                        <div className="text-white font-bold">{skill.name}</div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${levelColor[skill.level]}`}>
                                            {skill.level}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-black text-white">{Math.round(skill.confidence * 100)}%</div>
                                    <div className="text-slate-600 text-xs">confidence</div>
                                </div>
                            </div>
                            <div className="border-t border-white/5 pt-3">
                                <div className="text-slate-600 text-xs mb-2 font-semibold uppercase tracking-wide">Evidence</div>
                                <div className="space-y-1">
                                    {skill.evidence.map(e => (
                                        <div key={e} className="flex items-center gap-2 text-xs text-slate-400">
                                            <CheckCircle size={11} className="text-green-400 flex-shrink-0" />
                                            {e}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Projects + Auto-Update Rules */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-white font-bold">Verified Projects</h2>
                    {projects.map((p, i) => (
                        <motion.div
                            key={p.title}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass rounded-2xl p-4"
                        >
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <h3 className="text-white font-bold text-sm leading-tight">{p.title}</h3>
                                <span className="text-xs px-2 py-0.5 bg-green-500/15 border border-green-500/30 text-green-400 rounded-full font-bold flex-shrink-0">✓ Passed</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                                {p.tags.map(tag => (
                                    <span key={tag} className="text-xs px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-400">{tag}</span>
                                ))}
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Originality: <span className="text-green-400 font-bold">{p.originality}%</span></span>
                                <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                    <ExternalLink size={11} /> GitHub
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Auto-Update Rules */}
                    <div className="glass-blue rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock size={14} className="text-blue-400" />
                            <span className="text-blue-400 font-bold text-xs">Auto-Update Rules</span>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed">
                            This resume updates automatically only when confidence ≥ threshold, assessment passed, project verified, and consistency is acceptable.
                        </p>
                    </div>

                    {/* Job Match */}
                    <div className="glass rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp size={14} className="text-orange-400" />
                            <span className="text-white font-bold text-sm">Recommended Roles</span>
                        </div>
                        {[
                            { role: 'Frontend Developer', match: 91 },
                            { role: 'React Developer', match: 82 },
                            { role: 'Full Stack Junior', match: 68 },
                        ].map(({ role, match }) => (
                            <div key={role} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <span className="text-slate-400 text-xs">{role}</span>
                                <span className={`text-xs font-bold ${match > 85 ? 'text-green-400' : match > 70 ? 'text-orange-400' : 'text-slate-500'}`}>{match}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
