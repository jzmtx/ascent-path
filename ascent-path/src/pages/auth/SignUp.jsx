import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, Github, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ── Animated background node ─────────────────────────────────── */
function FloatingNode({ x, y, delay, size = 6, color = 'orange' }) {
    const colors = {
        orange: 'border-orange-500/30 bg-orange-500/10',
        blue: 'border-blue-500/30 bg-blue-500/10',
    };
    return (
        <motion.div
            className={`absolute rounded-full border ${colors[color]}`}
            style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
            animate={{ y: [-8, 8, -8], opacity: [0.3, 0.9, 0.3], scale: [1, 1.2, 1] }}
            transition={{ duration: 3 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
        />
    );
}

/* ── Success / confetti overlay ───────────────────────────────── */
function SuccessOverlay({ username }) {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: i % 2 === 0 ? '#F97316' : '#2563EB',
        size: 4 + Math.random() * 8,
        delay: Math.random() * 0.5,
    }));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-[#0A0A0F] flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Confetti particles */}
            {particles.map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, backgroundColor: p.color }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], y: [-20, -80], x: [(Math.random() - 0.5) * 60] }}
                    transition={{ duration: 1.5, delay: 0.3 + p.delay, ease: 'easeOut' }}
                />
            ))}

            {/* Big radial burst */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 3, 0], opacity: [0, 0.15, 0] }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute w-96 h-96 rounded-full bg-orange-500"
                style={{ filter: 'blur(60px)' }}
            />

            {/* Check icon */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                className="w-24 h-24 rounded-full bg-orange-500/20 border-2 border-orange-500/60 flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(249,115,22,0.4)]"
            >
                <CheckCircle2 className="w-12 h-12 text-orange-400" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center"
            >
                <h2 className="text-4xl font-bold text-white mb-2">You're in! 🚀</h2>
                <p className="text-slate-400 text-lg mb-1">Account created for <span className="text-orange-400 font-semibold">{username}</span></p>
                <p className="text-slate-500 text-sm">Setting up your journey...</p>
            </motion.div>

            {/* Loading bar */}
            <motion.div className="mt-10 w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.7, duration: 1.8, ease: 'easeInOut' }}
                    className="h-full bg-gradient-to-r from-orange-500 to-blue-500 rounded-full"
                />
            </motion.div>
        </motion.div>
    );
}

/* ── Consts ── */
const TARGET_ROLES = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Analyst', 'ML Engineer', 'DevOps Engineer', 'Mobile Developer',
    'Cloud Architect', 'Cybersecurity Engineer',
];

const VALUE_PROPS = [
    { icon: '🗺️', text: 'AI-aligned roadmaps to your dream job' },
    { icon: '🤖', text: 'MDN-grounded AI mentor — zero hallucinations' },
    { icon: '📄', text: 'Evidence-backed resume auto-generated' },
    { icon: '✅', text: 'Skill verification through real assessments' },
];

const ROADMAP_NODES = ['HTML', 'CSS', 'JS', 'React', 'TS', 'Node'];

function getPasswordStrength(pw) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

/* ── Background node positions ── */
const BG_NODES = [
    { x: 5, y: 15, delay: 0, size: 8, color: 'orange' },
    { x: 95, y: 10, delay: 1, size: 6, color: 'blue' },
    { x: 8, y: 60, delay: 0.5, size: 10, color: 'blue' },
    { x: 92, y: 65, delay: 1.5, size: 7, color: 'orange' },
    { x: 50, y: 5, delay: 0.8, size: 5, color: 'orange' },
    { x: 20, y: 90, delay: 0.3, size: 9, color: 'blue' },
    { x: 80, y: 88, delay: 1.2, size: 6, color: 'orange' },
];

/* ══════════════════════════════════════════════════════════════ */
export default function SignUp() {
    const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', targetRole: '', agree: false });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const strength = getPasswordStrength(form.password);
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-green-400'];
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.agree) { setError('Please accept the Terms & Privacy Policy to continue.'); return; }
        setLoading(true); setError('');
        try {
            const nameParts = form.fullName.trim().split(/\s+/);
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            const res = await fetch('http://localhost:8000/api/auth/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    username: form.username,
                    password: form.password,
                    target_role: form.targetRole,
                    first_name: firstName,
                    last_name: lastName,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(Object.values(data).flat().join(' '));

            // Store in AuthContext (also saves to localStorage internally)
            login(data.tokens.access, data.tokens.refresh, data.user);

            setSuccess(form.username || form.email);
            setTimeout(() => navigate('/onboarding'), 2500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>{success && <SuccessOverlay username={success} />}</AnimatePresence>

            <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center relative overflow-hidden px-4 py-12">
                {/* Animated background */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.09, 0.04] }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-orange-500 blur-[120px]"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.07, 0.04] }}
                        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-600 blur-[100px]"
                    />
                    <div className="absolute inset-0 opacity-[0.025]" style={{
                        backgroundImage: 'linear-gradient(rgba(249,115,22,0.5)1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.5)1px,transparent 1px)',
                        backgroundSize: '60px 60px',
                    }} />
                    {BG_NODES.map((n, i) => <FloatingNode key={i} {...n} />)}
                </div>

                <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">

                    {/* LEFT — Value prop */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="hidden lg:block lg:col-span-2"
                    >
                        <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
                            <motion.div whileHover={{ rotate: 15, scale: 1.1 }}
                                className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-orange-400" />
                            </motion.div>
                            <span className="text-xl font-bold text-white">Ascent<span className="text-orange-400">Path</span></span>
                        </Link>

                        <h2 className="text-4xl font-bold text-white leading-tight mb-6">
                            Build your<br />
                            <motion.span
                                animate={{ color: ['#F97316', '#2563EB', '#F97316'] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >verified</motion.span>{' '}
                            developer<br />profile
                        </h2>

                        <motion.ul
                            variants={stagger}
                            initial="hidden"
                            animate="show"
                            className="space-y-4 mb-10"
                        >
                            {VALUE_PROPS.map((v, i) => (
                                <motion.li
                                    key={i}
                                    variants={fadeUp}
                                    whileHover={{ x: 6 }}
                                    className="flex items-center gap-3 text-slate-300 cursor-default"
                                >
                                    <span className="text-xl">{v.icon}</span>
                                    <span>{v.text}</span>
                                </motion.li>
                            ))}
                        </motion.ul>

                        {/* Animated roadmap nodes */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {ROADMAP_NODES.map((node, i) => (
                                <motion.div
                                    key={node}
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8 + i * 0.1 }}
                                >
                                    <motion.div
                                        animate={i === 3 ? { boxShadow: ['0 0 0px rgba(249,115,22,0)', '0 0 12px rgba(249,115,22,0.6)', '0 0 0px rgba(249,115,22,0)'] } : {}}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border
                      ${i < 3 ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                                                : i === 3 ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                                                    : 'bg-white/5 border-white/10 text-slate-500'}`}
                                    >
                                        {node}
                                    </motion.div>
                                    {i < ROADMAP_NODES.length - 1 && (
                                        <motion.div
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                            className="w-3 h-px bg-gradient-to-r from-blue-500/60 to-orange-500/60"
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* RIGHT — Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="lg:col-span-3"
                    >
                        <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-6">
                            <Zap className="w-5 h-5 text-orange-400" />
                            <span className="text-xl font-bold text-white">Ascent<span className="text-orange-400">Path</span></span>
                        </Link>

                        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                            {/* Subtle card top glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

                            <motion.div variants={stagger} initial="hidden" animate="show">
                                <motion.div variants={fadeUp} className="flex items-center gap-2 mb-1">
                                    <h1 className="text-2xl font-bold text-white">Create your account</h1>
                                    <Sparkles className="w-5 h-5 text-orange-400" />
                                </motion.div>
                                <motion.p variants={fadeUp} className="text-slate-400 text-sm mb-7">Start your verified developer journey — free forever</motion.p>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Name + Username */}
                                    <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
                                        {['Full Name', 'Username'].map((label, i) => (
                                            <div key={label}>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
                                                <motion.input
                                                    whileFocus={{ borderColor: 'rgba(249,115,22,0.6)', backgroundColor: 'rgba(249,115,22,0.04)' }}
                                                    type="text"
                                                    placeholder={i === 0 ? 'John Smith' : 'johnsmith'}
                                                    required
                                                    value={i === 0 ? form.fullName : form.username}
                                                    onChange={e => setForm({ ...form, [i === 0 ? 'fullName' : 'username']: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none transition-all duration-200"
                                                />
                                            </div>
                                        ))}
                                    </motion.div>

                                    {/* Email */}
                                    <motion.div variants={fadeUp}>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                                        <motion.input
                                            whileFocus={{ borderColor: 'rgba(249,115,22,0.6)', backgroundColor: 'rgba(249,115,22,0.04)' }}
                                            type="email" placeholder="you@example.com" required value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none transition-all duration-200"
                                        />
                                    </motion.div>

                                    {/* Password */}
                                    <motion.div variants={fadeUp}>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                                        <div className="relative">
                                            <motion.input
                                                whileFocus={{ borderColor: 'rgba(249,115,22,0.6)', backgroundColor: 'rgba(249,115,22,0.04)' }}
                                                type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" required value={form.password}
                                                onChange={e => setForm({ ...form, password: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 outline-none transition-all duration-200"
                                            />
                                            <button type="button" onClick={() => setShowPass(!showPass)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {form.password && (
                                            <div className="mt-2 space-y-1">
                                                <div className="flex gap-1">
                                                    {[...Array(4)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: i < strength ? '100%' : '100%' }}
                                                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColors[strength - 1] : 'bg-white/10'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-slate-400">{strengthLabels[strength - 1] || 'Too weak'}</p>
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Target Role */}
                                    <motion.div variants={fadeUp}>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Target Role</label>
                                        <select value={form.targetRole}
                                            onChange={e => setForm({ ...form, targetRole: e.target.value })}
                                            className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500/60 outline-none transition-all appearance-none cursor-pointer">
                                            <option value="">Select your target role...</option>
                                            {TARGET_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </motion.div>

                                    {/* Terms */}
                                    <motion.label variants={fadeUp} className="flex items-start gap-3 cursor-pointer">
                                        <input type="checkbox" checked={form.agree}
                                            onChange={e => setForm({ ...form, agree: e.target.checked })}
                                            className="mt-1 w-4 h-4 rounded accent-orange-500" />
                                        <span className="text-sm text-slate-400">
                                            I agree to the <Link to="/terms" className="text-orange-400 hover:underline">Terms</Link> and <Link to="/privacy" className="text-orange-400 hover:underline">Privacy Policy</Link>
                                        </span>
                                    </motion.label>

                                    {/* Submit */}
                                    <motion.div variants={fadeUp}>
                                        <motion.button
                                            type="submit" disabled={loading}
                                            whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? undefined : '0 0 30px rgba(249,115,22,0.45)' }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                        >
                                            {loading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Creating account...</span>
                                                </div>
                                            ) : (
                                                <motion.span animate={{ x: [0, 2, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                                    Get Started Free →
                                                </motion.span>
                                            )}
                                        </motion.button>
                                    </motion.div>
                                </form>

                                <motion.div variants={fadeUp} className="flex items-center gap-3 my-5">
                                    <div className="flex-1 h-px bg-white/10" />
                                    <span className="text-xs text-slate-500">or</span>
                                    <div className="flex-1 h-px bg-white/10" />
                                </motion.div>

                                <motion.button
                                    variants={fadeUp}
                                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 rounded-xl font-medium text-white bg-white/5 border border-white/10 transition-all flex items-center justify-center gap-3"
                                >
                                    <Github className="w-5 h-5" /><span>Continue with GitHub</span>
                                </motion.button>

                                <motion.p variants={fadeUp} className="text-center text-sm text-slate-400 mt-5">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium">Sign in</Link>
                                </motion.p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
