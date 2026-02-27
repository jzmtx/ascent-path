import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, CheckCircle2, Github, Loader2, BadgeCheck } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Netrika's avatar — a professional online avatar placeholder using UI Avatars
const NETRIKA_AVATAR = "https://ui-avatars.com/api/?name=Netrika&background=f97316&color=fff&size=128&font-size=0.4&bold=true&format=png"

function ChatBubble({ msg, isNew }) {
    const isAI = msg.role === 'ai'
    return (
        <motion.div
            initial={isNew ? { opacity: 0, y: 12, scale: 0.97 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
        >
            {isAI && (
                <img src={NETRIKA_AVATAR} alt="Netrika" className="w-8 h-8 rounded-full flex-shrink-0 mt-1 border border-orange-500/30" />
            )}
            <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isAI
                ? 'bg-white/[0.07] border border-white/10 text-slate-200 rounded-tl-none'
                : 'bg-blue-600/25 border border-blue-500/30 text-blue-100 rounded-tr-none'
                }`}>
                {/* Render **bold** text */}
                {msg.content.split('**').map((part, i) =>
                    i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
                )}
                {msg.typing && (
                    <span className="inline-flex gap-1 ml-1">
                        {[0, 0.2, 0.4].map(d => (
                            <motion.span key={d} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: d }}
                                className="w-1 h-1 bg-slate-400 rounded-full inline-block" />
                        ))}
                    </span>
                )}
            </div>
        </motion.div>
    )
}

export default function InterviewModal({ skill, onClose, onVerified }) {
    const [step, setStep] = useState('intro') // intro | loading | chat | result
    const [github, setGithub] = useState(localStorage.getItem('github_url') || '')
    const [sessionId, setSessionId] = useState(null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const [questionNum, setQuestionNum] = useState(1)
    const [result, setResult] = useState(null)
    const [startError, setStartError] = useState('')
    const bottomRef = useRef(null)
    const inputRef = useRef(null)
    const token = localStorage.getItem('access_token')

    // Auto-scroll chat
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const startInterview = async () => {
        if (github) localStorage.setItem('github_url', github)
        setStartError('')
        setStep('loading')
        try {
            const res = await fetch(`${API}/api/interview/start/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ skill, github_url: github }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || `Server error ${res.status}`)
            setSessionId(data.session_id)
            setMessages([{ role: 'ai', content: data.message }])
            setStep('chat')
            setTimeout(() => inputRef.current?.focus(), 100)
        } catch (err) {
            setStep('intro')
            setStartError(err.message)
        }
    }

    const sendAnswer = async () => {
        if (!input.trim() || sending) return
        const userMsg = input.trim()
        setInput('')
        setSending(true)

        // Optimistically add user message
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        // Add typing indicator
        setMessages(prev => [...prev, { role: 'ai', content: '', typing: true }])

        try {
            const res = await fetch(`${API}/api/interview/answer/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ session_id: sessionId, answer: userMsg }),
            })
            const data = await res.json()

            // Replace typing indicator with real message
            setMessages(prev => {
                const without = prev.filter(m => !m.typing)
                return [...without, { role: 'ai', content: data.ai_message, isNew: true }]
            })

            if (data.is_complete) {
                setResult(data)
                setStep('result')
                if (data.passed) onVerified?.(skill)
            } else {
                setQuestionNum(data.question_number)
            }
        } catch {
            setMessages(prev => prev.filter(m => !m.typing))
        } finally {
            setSending(false)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
                onClick={e => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="h-[85vh] max-h-[800px] w-full max-w-[600px] bg-[#0A0A0F] border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
                >
                    {/* ── Header ───────────────────────────────────────────── */}
                    <div className="flex items-center gap-3 p-5 border-b border-white/10 flex-shrink-0">
                        <div className="relative">
                            <img src={NETRIKA_AVATAR} alt="Netrika" className="w-12 h-12 rounded-full border-2 border-orange-500/40" />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0A0A0F] animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <div className="text-white font-bold">Netrika</div>
                            <div className="text-slate-400 text-xs">Senior Engineer · Ascent AI</div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-green-400 text-xs font-medium">Live Interview</span>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all ml-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* ── Skill badge ──────────────────────────────────────── */}
                    <div className="px-5 py-2 border-b border-white/[0.06] flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-semibold">
                            {skill}
                        </span>
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                            <BadgeCheck className="w-3 h-3" /> Verified badge on pass (score &ge; 70%)
                        </span>
                    </div>

                    {/* ── Content ──────────────────────────────────────────── */}

                    {/* INTRO STEP */}
                    {step === 'intro' && (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            className="flex-1 flex flex-col justify-center p-8 gap-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">AI Skill Interview</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Alex will interview you on <strong className="text-white">{skill}</strong> using 7 personalized questions
                                    based on your GitHub projects and resume. Score &ge; 70% to earn a verified badge.
                                </p>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 font-medium mb-2 block">GitHub Profile URL (optional but recommended)</label>
                                <div className="relative">
                                    <Github className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input value={github} onChange={e => setGithub(e.target.value)}
                                        placeholder="https://github.com/yourusername"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 text-sm transition-all" />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Alex will reference your actual repos to make the interview feel real.</p>
                            </div>

                            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 space-y-2">
                                {['7 progressive questions (conversational → technical)', 'Gemini AI scores each answer in real-time', 'Pass = instant verified badge on your profile', 'Your GitHub code may be referenced'].map(item => (
                                    <div key={item} className="flex items-center gap-2 text-xs text-slate-400">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>

                            {startError && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
                                    <strong>Error:</strong> {startError}
                                    <p className="text-xs text-red-400 mt-1">Make sure you're logged in and the backend is running.</p>
                                </div>
                            )}

                            <button onClick={startInterview}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold hover:from-orange-400 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/20">
                                Start Interview with Alex
                            </button>
                        </motion.div>
                    )}

                    {/* LOADING STEP */}
                    {step === 'loading' && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                            <Loader2 className="w-12 h-12 text-orange-400 animate-spin" />
                            <div>
                                <p className="text-white font-semibold mb-1">Alex is preparing your interview...</p>
                                <p className="text-slate-400 text-sm">Reading your GitHub repos and crafting personalized questions</p>
                            </div>
                        </div>
                    )}

                    {/* CHAT STEP */}
                    {step === 'chat' && (
                        <>
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {messages.map((msg, i) => (
                                    <ChatBubble key={i} msg={msg} isNew={msg.isNew} />
                                ))}
                                <div ref={bottomRef} />
                            </div>

                            {/* Progress */}
                            <div className="px-5 py-2 border-t border-white/[0.06]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs text-slate-500">Question {questionNum} of 7</span>
                                    <span className="text-xs text-slate-500">{Math.round((questionNum / 7) * 100)}% complete</span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                                        animate={{ width: `${(questionNum / 7) * 100}%` }} transition={{ duration: 0.5 }} />
                                </div>
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-white/10 flex-shrink-0">
                                <div className="flex gap-3 items-end">
                                    <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAnswer() } }}
                                        placeholder="Your answer... (Enter to send, Shift+Enter for newline)"
                                        rows={2}
                                        className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 text-sm resize-none transition-all" />
                                    <button onClick={sendAnswer} disabled={sending || !input.trim()}
                                        className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500 transition-all disabled:opacity-40 flex-shrink-0">
                                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* RESULT STEP */}
                    {step === 'result' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6">
                            {result?.passed ? (
                                <>
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        className="w-24 h-24 rounded-full bg-green-500/20 border-4 border-green-400 flex items-center justify-center shadow-[0_0_40px_rgba(74,222,128,0.3)]">
                                        <BadgeCheck className="w-12 h-12 text-green-400" />
                                    </motion.div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">Interview Passed!</h2>
                                        <p className="text-slate-400 text-sm mb-3">You've earned a <strong className="text-green-400">Verified</strong> badge for <strong className="text-white">{skill}</strong></p>
                                        <p className="text-xs text-slate-500">Score: {(result.final_score * 10).toFixed(0)}% · Badge added to your profile</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-24 h-24 rounded-full bg-orange-500/10 border-4 border-orange-500/40 flex items-center justify-center">
                                        <span className="text-4xl font-black text-orange-400">{(result?.final_score * 10 || 0).toFixed(0)}%</span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">Good Effort!</h2>
                                        <p className="text-slate-400 text-sm">Score was {(result?.final_score * 10 || 0).toFixed(0)}% — you need 70% to earn the verified badge. Keep practicing!</p>
                                    </div>
                                </>
                            )}
                            <button onClick={onClose}
                                className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition-all">
                                Close Interview
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
