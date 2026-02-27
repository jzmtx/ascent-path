import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, Github, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Animated floating node for background
function FloatingNode({ x, y, delay, size = 6 }) {
    return (
        <motion.div
            className="absolute rounded-full border border-orange-500/30 bg-orange-500/10"
            style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
            animate={{ y: [-10, 10, -10], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
        />
    );
}

// Animated connector line
function ConnectorLine({ x1, y1, x2, y2, delay }) {
    return (
        <motion.div
            className="absolute bg-gradient-to-r from-orange-500/20 to-blue-500/20 h-px"
            style={{ left: `${x1}%`, top: `${y1}%`, width: `${x2 - x1}%`, transform: `rotate(${Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI}deg)`, transformOrigin: '0 50%' }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay, ease: 'easeInOut' }}
        />
    );
}

// Success overlay
function SuccessOverlay({ username }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-[#0A0A0F] flex flex-col items-center justify-center"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500/60 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]"
            >
                <CheckCircle className="w-12 h-12 text-green-400" />
            </motion.div>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-white mb-2"
            >
                Welcome to Ascent Path!
            </motion.h2>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-slate-400"
            >
                Signed in as <span className="text-orange-400">{username}</span> — taking you to your dashboard...
            </motion.p>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: '200px' }}
                transition={{ delay: 0.8, duration: 1.5 }}
                className="h-1 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full mt-8"
            />
        </motion.div>
    );
}

const NODES = [
    { x: 10, y: 20, delay: 0, size: 8 }, { x: 85, y: 15, delay: 1, size: 6 },
    { x: 75, y: 70, delay: 0.5, size: 10 }, { x: 20, y: 75, delay: 1.5, size: 7 },
    { x: 50, y: 10, delay: 0.8, size: 5 }, { x: 90, y: 50, delay: 0.3, size: 9 },
    { x: 5, y: 50, delay: 1.2, size: 6 }, { x: 60, y: 85, delay: 0.7, size: 8 },
];

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SignIn() {
    const [form, setForm] = useState({ email: '', password: '', remember: false });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    // Where to go after login — if PrivateRoute redirected here, go back to that page
    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, password: form.password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || Object.values(data).flat().join(' '));
            // Store in AuthContext (also saves to localStorage internally)
            login(data.tokens.access, data.tokens.refresh, data.user);
            setSuccess(data.user.username || data.user.email);
            setTimeout(() => navigate(from, { replace: true }), 1800);
        } catch (err) {
            setError(err.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>{success && <SuccessOverlay username={success} />}</AnimatePresence>

            <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center relative overflow-hidden px-4">
                {/* Animated background */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Radial glow */}
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.04, 0.08, 0.04] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-orange-500 blur-[120px]"
                    />
                    <div className="absolute top-1/4 right-1/3 w-[300px] h-[300px] rounded-full bg-blue-600/5 blur-[80px]" />
                    {/* Grid */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: 'linear-gradient(rgba(249,115,22,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.5) 1px,transparent 1px)',
                        backgroundSize: '60px 60px',
                    }} />
                    {/* Floating nodes */}
                    {NODES.map((n, i) => <FloatingNode key={i} {...n} />)}
                    <ConnectorLine x1={10} y1={20} x2={50} y2={10} delay={0} />
                    <ConnectorLine x1={50} y1={10} x2={85} y2={15} delay={1} />
                    <ConnectorLine x1={85} y1={15} x2={90} y2={50} delay={0.5} />
                </div>

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="w-full max-w-md relative z-10"
                >
                    {/* Logo */}
                    <motion.div variants={fadeUp} className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 group">
                            <motion.div
                                whileHover={{ rotate: 15, scale: 1.1 }}
                                className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center"
                            >
                                <Zap className="w-5 h-5 text-orange-400" />
                            </motion.div>
                            <span className="text-2xl font-bold text-white">Ascent<span className="text-orange-400">Path</span></span>
                        </Link>
                        <p className="text-slate-400 text-sm mt-2">Your AI-powered dev career engine</p>
                    </motion.div>

                    {/* Card */}
                    <motion.div
                        variants={fadeUp}
                        className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl"
                    >
                        <motion.h1 variants={fadeUp} className="text-3xl font-bold text-white mb-1">Welcome back</motion.h1>
                        <motion.p variants={fadeUp} className="text-slate-400 mb-7">Sign in to continue your journey</motion.p>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.form variants={stagger} onSubmit={handleSubmit} className="space-y-5">
                            <motion.div variants={fadeUp}>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                <motion.input
                                    whileFocus={{ borderColor: 'rgba(249,115,22,0.6)', backgroundColor: 'rgba(249,115,22,0.05)' }}
                                    type="email" placeholder="you@example.com" value={form.email} required
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none transition-all duration-200"
                                />
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                                <div className="relative">
                                    <motion.input
                                        whileFocus={{ borderColor: 'rgba(249,115,22,0.6)', backgroundColor: 'rgba(249,115,22,0.05)' }}
                                        type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} required
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 outline-none transition-all duration-200"
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div variants={fadeUp} className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.remember}
                                        onChange={e => setForm({ ...form, remember: e.target.checked })}
                                        className="w-4 h-4 rounded accent-orange-500" />
                                    <span className="text-sm text-slate-400">Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</Link>
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <motion.button
                                    type="submit" disabled={loading}
                                    whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? undefined : '0 0 30px rgba(249,115,22,0.4)' }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Signing in...</span>
                                        </div>
                                    ) : (
                                        <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                                    )}
                                </motion.button>
                            </motion.div>
                        </motion.form>

                        <motion.div variants={fadeUp} className="flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-xs text-slate-500">or continue with</span>
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

                        <motion.p variants={fadeUp} className="text-center text-sm text-slate-400 mt-6">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">Sign up →</Link>
                        </motion.p>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}
