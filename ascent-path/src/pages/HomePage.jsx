import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BrainCircuit, FileText, ShieldCheck, Briefcase, ChevronRight } from 'lucide-react'
import RoadmapPreview from '../components/RoadmapPreview'

const features = [
    { icon: FileText, title: 'JD-Aligned Roadmaps', desc: 'Upload a job description and get a personalized skill roadmap instantly.' },
    { icon: BrainCircuit, title: 'Grounded MDN Agent', desc: 'AI mentor backed by MDN docs — zero hallucinations, 100% reliable.' },
    { icon: ShieldCheck, title: 'Proctored Assessments', desc: 'Prove your skills with behavior-monitored coding challenges.' },
    { icon: Briefcase, title: 'Smart Job Matching', desc: 'Match your verified skills to live job listings with readiness scores.' },
]

const stats = [
    { value: '10,000+', label: 'Verified Skills' },
    { value: '500+', label: 'JD-based Roadmaps' },
    { value: '94%', label: 'Job Readiness Accuracy' },
]

export default function HomePage() {
    return (
        <div className="pt-16">
            {/* Hero */}
            <section className="relative min-h-screen flex items-center overflow-hidden orange-grid-bg">
                {/* Glow orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                            AI-Powered Developer Growth Platform
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                            From Learner to{' '}
                            <span className="gradient-text">Industry-Ready</span>{' '}
                            Developer
                        </h1>

                        <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-lg">
                            JD-aligned roadmaps, MDN-grounded AI mentorship, proctored assessments &
                            evidence-backed resumes — all in one platform.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/explore"
                                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black font-bold px-7 py-3.5 rounded-full transition-all glow-orange hover:scale-105 text-sm"
                            >
                                Explore Roadmaps <ArrowRight size={16} />
                            </Link>
                            <Link
                                to="/mentor"
                                className="flex items-center gap-2 border border-blue-500 text-blue-400 hover:bg-blue-500/10 font-semibold px-7 py-3.5 rounded-full transition-all text-sm"
                            >
                                Meet AI Mentor
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right — Animated Roadmap Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hidden lg:block"
                    >
                        <RoadmapPreview />
                    </motion.div>
                </div>
            </section>

            {/* Feature Cards */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-black text-white mb-4">
                        Everything you need to land your{' '}
                        <span className="text-orange-400">dream role</span>
                    </h2>
                    <p className="text-slate-500 max-w-xl mx-auto">
                        Built for developers who want real proof — not just certificates.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {features.map(({ icon: Icon, title, desc }, i) => (
                        <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -6, borderColor: 'rgba(37,99,235,0.5)' }}
                            className="glass rounded-2xl p-6 cursor-pointer transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mb-4 group-hover:glow-orange transition-all">
                                <Icon size={22} className="text-orange-400" />
                            </div>
                            <h3 className="text-white font-bold mb-2">{title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Animated Roadmap Strip */}
            <section className="py-16 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
                    <h2 className="text-3xl font-black text-white">
                        Your <span className="text-orange-400">Learning Journey</span>, Visualized
                    </h2>
                </div>
                <RoadmapStrip />
            </section>

            {/* Stats Band */}
            <section className="py-16">
                <div className="mx-6 lg:mx-auto max-w-7xl rounded-3xl bg-gradient-to-r from-orange-600/20 via-orange-500/10 to-blue-600/20 border border-orange-500/20 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center px-6">
                        {stats.map(({ value, label }) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="text-5xl font-black text-orange-400 mb-2 text-glow-orange">{value}</div>
                                <div className="text-slate-400 font-medium">{label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="py-24 max-w-4xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-5xl font-black text-white mb-6">
                        Ready to ascend?
                    </h2>
                    <p className="text-slate-400 mb-10">
                        Join thousands of developers building verified, evidence-backed careers.
                    </p>
                    <Link
                        to="/explore"
                        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black font-bold px-10 py-4 rounded-full transition-all glow-orange text-lg"
                    >
                        Start Your Roadmap <ChevronRight />
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-10 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600 text-sm">
                    <span>© 2026 Ascent Path. Employability Intelligence Platform.</span>
                    <div className="flex gap-6">
                        {['Privacy', 'Terms', 'Contact'].map(l => (
                            <a key={l} href="#" className="hover:text-orange-400 transition-colors">{l}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    )
}

/* ─── Roadmap Animated Strip ─── */
const roadmapNodes = [
    { label: 'HTML', done: true },
    { label: 'CSS', done: true },
    { label: 'JavaScript', active: true },
    { label: 'React', locked: true },
    { label: 'TypeScript', locked: true },
]

function RoadmapStrip() {
    return (
        <div className="flex items-center justify-center gap-0 px-6 overflow-x-auto py-8">
            {roadmapNodes.map((node, i) => (
                <div key={node.label} className="flex items-center">
                    {/* Node */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.15, duration: 0.4 }}
                        viewport={{ once: true }}
                        className={`relative w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-bold text-xs gap-1 flex-shrink-0
              ${node.done ? 'bg-blue-600/20 border-2 border-blue-500/60 text-blue-300' : ''}
              ${node.active ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-300 node-pulse' : ''}
              ${node.locked ? 'bg-white/5 border border-white/10 text-slate-600' : ''}
            `}
                    >
                        {node.done && <span className="text-lg">✓</span>}
                        {node.active && <span className="text-lg animate-float">▶</span>}
                        {node.locked && <span className="text-lg">🔒</span>}
                        {node.label}
                    </motion.div>
                    {/* Connector line */}
                    {i < roadmapNodes.length - 1 && (
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ delay: i * 0.15 + 0.2, duration: 0.4 }}
                            viewport={{ once: true }}
                            className={`h-0.5 w-12 origin-left flex-shrink-0
                ${i < 2 ? 'bg-blue-500/60' : 'bg-white/10'}
              `}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}
