import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Zap, Menu, X, LogOut, User, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const navLinks = [
    { label: 'Roadmaps', path: '/explore' },
    { label: 'AI Mentor', path: '/mentor' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Resume', path: '/resume' },
]

export default function Navbar() {
    const [open, setOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { user, isAuthenticated, logout } = useAuth()

    const handleLogout = () => {
        logout()
        setProfileOpen(false)
        navigate('/')
    }

    // Initials from name or username
    const initials = user
        ? (user.first_name && user.last_name
            ? `${user.first_name[0]}${user.last_name[0]}`
            : (user.username?.[0] || 'U')).toUpperCase()
        : 'U'

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-orange-500/10">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center glow-orange transition-all group-hover:scale-110">
                        <Zap size={18} className="text-black" fill="black" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>Ascent<span className="text-orange-400">Path</span></span>
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] uppercase font-black tracking-widest leading-none mt-1">Beta</span>
                    </span>
                </Link>

                {/* Desktop Nav — only show if logged in */}
                {isAuthenticated && (
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map(({ label, path }) => (
                            <Link key={path} to={path}
                                className={`text-sm font-medium transition-colors ${location.pathname.startsWith(path)
                                    ? 'text-orange-400'
                                    : 'text-slate-400 hover:text-white'
                                    }`}>
                                {label}
                            </Link>
                        ))}
                    </nav>
                )}

                {/* Right side */}
                <div className="hidden md:flex items-center gap-3">
                    {isAuthenticated ? (
                        /* User avatar + dropdown */
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(v => !v)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-orange-500/40 transition-all"
                            >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-xs font-bold text-white">
                                    {initials}
                                </div>
                                <span className="text-white text-sm font-medium max-w-[100px] truncate">
                                    {user?.first_name || user?.username}
                                </span>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {profileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-2 w-52 bg-[#12121e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                                    >
                                        <div className="px-4 py-3 border-b border-white/10">
                                            <p className="text-white text-sm font-semibold truncate">{user?.first_name} {user?.last_name}</p>
                                            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                                        </div>
                                        <Link to="/dashboard" onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm">
                                            <User size={14} /> My Dashboard
                                        </Link>
                                        <button onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors text-sm">
                                            <LogOut size={14} /> Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        /* Guest buttons */
                        <>
                            <Link to="/login"
                                className="text-sm font-medium text-slate-300 hover:text-white border border-white/10 px-4 py-2 rounded-full transition-all hover:border-white/30">
                                Sign In
                            </Link>
                            <Link to="/register"
                                className="text-sm font-bold text-black bg-orange-500 hover:bg-orange-400 px-5 py-2 rounded-full transition-all glow-orange hover:scale-105">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
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
                        {isAuthenticated ? (
                            <>
                                <div className="py-3 border-b border-white/10 mb-2">
                                    <p className="text-white text-sm font-semibold">{user?.first_name} {user?.last_name}</p>
                                    <p className="text-slate-500 text-xs">{user?.email}</p>
                                </div>
                                {navLinks.map(({ label, path }) => (
                                    <Link key={path} to={path}
                                        className="block py-3 text-slate-300 hover:text-orange-400 transition-colors"
                                        onClick={() => setOpen(false)}>
                                        {label}
                                    </Link>
                                ))}
                                <button onClick={handleLogout}
                                    className="mt-2 w-full text-left py-3 text-red-400 hover:text-red-300 transition-colors text-sm">
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                {navLinks.map(({ label, path }) => (
                                    <Link key={path} to={path}
                                        className="block py-3 text-slate-300 hover:text-orange-400 transition-colors"
                                        onClick={() => setOpen(false)}>
                                        {label}
                                    </Link>
                                ))}
                                <Link to="/login" className="block py-3 text-slate-300 hover:text-orange-400 transition-colors" onClick={() => setOpen(false)}>
                                    Sign In
                                </Link>
                                <Link to="/register" className="mt-2 block text-center font-bold text-black bg-orange-500 px-5 py-3 rounded-full" onClick={() => setOpen(false)}>
                                    Get Started Free
                                </Link>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
