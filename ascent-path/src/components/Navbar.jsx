import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Zap, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
    { label: 'Roadmaps', path: '/explore' },
    { label: 'AI Mentor', path: '/mentor' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Resume', path: '/resume' },
]

export default function Navbar() {
    const [open, setOpen] = useState(false)
    const location = useLocation()

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-orange-500/10">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center glow-orange transition-all group-hover:scale-110">
                        <Zap size={18} className="text-black" fill="black" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">
                        Ascent<span className="text-orange-400"> Path</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map(({ label, path }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`text-sm font-medium transition-colors ${location.pathname === path
                                    ? 'text-orange-400'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* CTAs */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        to="/dashboard"
                        className="text-sm font-medium text-slate-300 hover:text-white border border-white/10 px-4 py-2 rounded-full transition-all hover:border-white/30"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/explore"
                        className="text-sm font-bold text-black bg-orange-500 hover:bg-orange-400 px-5 py-2 rounded-full transition-all glow-orange hover:scale-105"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setOpen(!open)}
                >
                    {open ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass border-t border-orange-500/10 px-6 pb-4"
                    >
                        {navLinks.map(({ label, path }) => (
                            <Link
                                key={path}
                                to={path}
                                className="block py-3 text-slate-300 hover:text-orange-400 transition-colors"
                                onClick={() => setOpen(false)}
                            >
                                {label}
                            </Link>
                        ))}
                        <Link
                            to="/explore"
                            className="mt-2 block text-center font-bold text-black bg-orange-500 px-5 py-3 rounded-full"
                            onClick={() => setOpen(false)}
                        >
                            Get Started
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
