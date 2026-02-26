import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts'
import { Flame, Target, Zap, Clock, TrendingUp } from 'lucide-react'

const velocityData = [
    { week: 'W1', score: 20 }, { week: 'W2', score: 35 }, { week: 'W3', score: 28 },
    { week: 'W4', score: 50 }, { week: 'W5', score: 45 }, { week: 'W6', score: 68 },
    { week: 'W7', score: 72 }, { week: 'W8', score: 80 },
]

const skills = [
    { name: 'HTML', pct: 100, done: true },
    { name: 'CSS', pct: 95, done: true },
    { name: 'JavaScript', pct: 80, active: true },
    { name: 'React', pct: 60, active: true },
    { name: 'TypeScript', pct: 30, locked: false },
    { name: 'Node.js', pct: 10, locked: false },
]

const heatmap = [
    { topic: 'Arrays', strength: 0.9 }, { topic: 'DOM', strength: 0.85 },
    { topic: 'Async', strength: 0.6 }, { topic: 'APIs', strength: 0.7 },
    { topic: 'Classes', strength: 0.45 }, { topic: 'Modules', strength: 0.5 },
    { topic: 'Testing', strength: 0.2 }, { topic: 'CI/CD', strength: 0.1 },
]

const stats = [
    { icon: Target, label: 'Roadmap Progress', value: '68%', sub: 'Frontend Dev', color: 'orange' },
    { icon: Zap, label: 'Skills Verified', value: '14/21', sub: 'completed', color: 'blue' },
    { icon: Flame, label: 'Consistency', value: '87%', sub: '12-day streak 🔥', color: 'orange' },
    { icon: Clock, label: 'Est. Completion', value: '28d', sub: 'at current pace', color: 'blue' },
]

export default function Dashboard() {
    return (
        <div className="pt-20 min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-white">Welcome back, <span className="text-orange-400">Alex 👋</span></h1>
                        <p className="text-slate-500 mt-1">Your learning intelligence report — Feb 25, 2026</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/15 border border-orange-500/30 rounded-full">
                        <Flame size={16} className="text-orange-400" />
                        <span className="text-orange-400 font-bold text-sm">12 Day Streak</span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map(({ icon: Icon, label, value, sub, color }) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -3 }}
                            className="glass rounded-2xl p-5"
                        >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color === 'orange' ? 'bg-orange-500/20' : 'bg-blue-500/20'
                                }`}>
                                <Icon size={18} className={color === 'orange' ? 'text-orange-400' : 'text-blue-400'} />
                            </div>
                            <div className="text-2xl font-black text-white">{value}</div>
                            <div className="text-slate-500 text-xs mt-0.5">{label}</div>
                            <div className={`text-xs font-medium mt-1 ${color === 'orange' ? 'text-orange-400' : 'text-blue-400'}`}>{sub}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Skill Progress */}
                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                            <TrendingUp size={16} className="text-orange-400" /> Skill Progress
                        </h3>
                        <div className="space-y-3">
                            {skills.map(({ name, pct, done, active }) => (
                                <div key={name}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">{name}</span>
                                        <span className={done ? 'text-blue-400' : active ? 'text-orange-400' : 'text-slate-600'}>{pct}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ delay: 0.3, duration: 1 }}
                                            className={`h-full rounded-full ${done ? 'bg-blue-500' : active ? 'bg-orange-500' : 'bg-slate-700'}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Velocity Chart */}
                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                            <Zap size={16} className="text-orange-400" /> Learning Velocity
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={velocityData}>
                                <defs>
                                    <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="week" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ background: '#12121A', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 8, color: '#fff' }} />
                                <Area type="monotone" dataKey="score" stroke="#F97316" strokeWidth={2} fill="url(#velGrad)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Heatmap */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-5">Weakness Heatmap</h3>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                        {heatmap.map(({ topic, strength }) => (
                            <div
                                key={topic}
                                className="rounded-xl p-3 text-center"
                                style={{
                                    background: strength > 0.7
                                        ? `rgba(37,99,235,${strength * 0.4})`
                                        : strength > 0.4
                                            ? `rgba(249,115,22,${strength * 0.5})`
                                            : `rgba(255,60,60,${(1 - strength) * 0.3})`,
                                    border: `1px solid rgba(255,255,255,0.08)`
                                }}
                            >
                                <div className="text-white text-xs font-medium">{topic}</div>
                                <div className="text-slate-400 text-xs mt-1">{Math.round(strength * 100)}%</div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500/60" />Strong</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-500/50" />Average</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/30" />Weak</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
