import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Timer, AlertTriangle, CheckCircle2, Zap, X } from 'lucide-react'
import TabWarningModal from './TabWarningModal'

const API = 'http://localhost:8000'

export default function NodeAssessment({ skill, level = 'beginner', onClose, onPassed }) {
    const token = localStorage.getItem('access_token')

    // ── State ─────────────────────────────────────────────────────────────────
    const [sessionId, setSessionId] = useState(null)
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [current, setCurrent] = useState(0)
    const [selected, setSelected] = useState({})
    const [timeLeft, setTimeLeft] = useState(15 * 60)
    const [tabSwitches, setTabSwitches] = useState(0)
    const [submitted, setSubmitted] = useState(false)
    const [result, setResult] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [tabWarningLevel, setTabWarningLevel] = useState(0)

    // ── handleSubmit MUST be declared before any useEffect that references it ─
    const handleSubmit = useCallback(async () => {
        if (submitting || submitted || !sessionId) return
        setSubmitting(true)
        try {
            const answers = Object.entries(selected).map(([qIdx, optIdx]) => ({
                question_id: questions[parseInt(qIdx)].id,
                selected_option: optIdx,
            }))
            // Add skipped questions with -1
            questions.forEach((_, i) => {
                if (!(i in selected)) {
                    answers.push({ question_id: questions[i].id, selected_option: -1 })
                }
            })

            const res = await fetch(`${API}/api/assessment/submit/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ session_id: sessionId, answers, tab_switches: tabSwitches }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Submit failed')
            setResult(data)

            // Trigger passed callback if score >= 60
            if (data.score >= 60 && onPassed) {
                onPassed()
            }
        } catch (err) {
            console.error('Submit error:', err)
            setResult({ score: 0, correct: 0, total: questions.length })
        } finally {
            setSubmitted(true)
            setSubmitting(false)
        }
    }, [submitting, submitted, sessionId, selected, questions, tabSwitches, token, onPassed])

    // ── Fetch questions on mount ───────────────────────────────────────────────
    useEffect(() => {
        const loadAssessment = async () => {
            try {
                const res = await fetch(`${API}/api/assessment/generate/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ skill, level }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Failed to generate questions')
                setSessionId(data.session_id)
                setQuestions(data.questions)
            } catch (err) {
                setLoadError(err.message)
            } finally {
                setLoading(false)
            }
        }
        loadAssessment()
    }, [skill, level, token])

    // ── Timer (auto-submit at 0) ───────────────────────────────────────────────
    useEffect(() => {
        if (submitted || loading) return
        const t = setInterval(() => {
            setTimeLeft(s => {
                if (s <= 1) { clearInterval(t); handleSubmit(); return 0 }
                return s - 1
            })
        }, 1000)
        return () => clearInterval(t)
    }, [submitted, loading, handleSubmit])

    // ── Tab-switch monitor with progressive warnings ────────────────────────────
    useEffect(() => {
        const onBlur = () => {
            if (submitted) return
            setTabSwitches(prev => {
                const next = prev + 1
                if (next === 1) setTabWarningLevel(1)
                else if (next === 2) setTabWarningLevel(2)
                else if (next >= 3) {
                    setTabWarningLevel(0)
                    handleSubmit()
                }
                return next
            })
        }
        window.addEventListener('blur', onBlur)
        return () => window.removeEventListener('blur', onBlur)
    }, [handleSubmit, submitted])

    // ── Helpers ───────────────────────────────────────────────────────────────
    const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
    const answered = Object.keys(selected).length
    const q = questions[current]

    // ── Loading State ─────────────────────────────────────────────────────────
    if (loading) return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin mb-6" />
                <p className="text-white font-semibold text-lg mb-2">Generating your assessment...</p>
                <p className="text-slate-400 text-sm">AI is crafting <span className="text-orange-400">{skill}</span> questions</p>
            </div>
        </div>
    )

    if (loadError) return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="flex flex-col items-center justify-center text-center px-4 max-w-sm">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Failed to load assessment</h2>
                <p className="text-red-400 text-sm mb-6">{loadError}</p>
                <div className="flex gap-4">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all">Cancel</button>
                    <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl bg-orange-500 text-black font-bold hover:bg-orange-400 transition-all">Try Again</button>
                </div>
            </div>
        </div>
    )

    // ── Results Screen ─────────────────────────────────────────────────────────
    if (submitted && result) return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl px-4 overflow-y-auto">
            <div className="max-w-xl w-full text-center py-10">
                <div className="w-28 h-28 rounded-full border-4 border-orange-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(249,115,22,0.35)]">
                    <span className="text-4xl font-black text-orange-400">{Math.round(result.score || 0)}%</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Assessment Complete!</h2>

                <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                    {(result.score || 0) >= 60 ? (
                        <>Outstanding work! You scored <strong className="text-orange-400">{Math.round(result.score || 0)}%</strong> and have successfully <strong className="text-green-400">mastered</strong> the <strong className="text-white">{skill}</strong> node on your roadmap.</>
                    ) : (
                        <>You scored <strong className="text-orange-400">{Math.round(result.score || 0)}%</strong>. You need at least 60% to master this node. Review the docs and try again!</>
                    )}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Score', value: `${Math.round(result.score || 0)}%`, color: 'text-orange-400' },
                        { label: 'Correct', value: `${result.correct ?? 0}/${result.total ?? questions.length}`, color: 'text-green-400' },
                        { label: 'Tab Switches', value: tabSwitches, color: tabSwitches >= 3 ? 'text-red-400' : 'text-blue-400' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                            <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-4">
                    <button onClick={onClose}
                        className="flex-1 py-4 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition-all border border-white/5">
                        Close Assessment
                    </button>
                    {(result.score || 0) >= 60 && (
                        <button onClick={onClose}
                            className="flex-1 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                            Continue Roadmap →
                        </button>
                    )}
                </div>
            </div>
        </div>
    )

    // ── Assessment Screen ──────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0F] p-6 lg:p-10">
            {/* Tab-switch warning modal */}
            <TabWarningModal
                level={tabWarningLevel}
                tabSwitches={tabSwitches}
                onDismiss={() => setTabWarningLevel(0)}
            />

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="w-full h-full max-w-6xl mx-auto flex flex-col relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 bg-white/[0.04] border border-white/10 rounded-2xl px-6 py-4 flex-shrink-0">
                    <div>
                        <h1 className="text-white font-bold text-lg flex items-center gap-3">
                            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md transition-colors"><X size={18} /></button>
                            Skill Verification — {skill}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs capitalize">{level} Level</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 rounded-md font-medium tracking-wide">PROCTORED</span>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg shadow-inner
                        ${timeLeft < 120 ? 'border-red-500/40 bg-red-500/10 text-red-400' : 'border-orange-500/40 bg-orange-500/10 text-orange-400'}`}>
                        <Timer className="w-5 h-5" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main question */}
                    <div className="lg:col-span-3 flex flex-col min-h-0 relative">
                        <div className="flex-1 overflow-y-auto bg-white/[0.04] border border-white/10 rounded-2xl p-8 scrollbar-hide shadow-lg">
                            <div className="text-5xl font-black text-white/5 mb-6 absolute top-6 right-8 pointer-events-none">{String(current + 1).padStart(2, '0')} / {questions.length}</div>
                            <p className="text-white text-xl font-semibold mb-8 leading-relaxed max-w-3xl relative z-10">{q?.question_text}</p>

                            {q?.code_snippet && (
                                <pre className="bg-[#0D0D1A] border border-white/10 rounded-xl p-5 mb-8 text-sm overflow-x-auto font-mono shadow-inner relative z-10">
                                    <code className="text-orange-200">{q.code_snippet}</code>
                                </pre>
                            )}

                            <div className="space-y-4 relative z-10">
                                {(q?.options || []).map((opt, i) => (
                                    <button key={i} onClick={() => setSelected({ ...selected, [current]: i })}
                                        className={`w-full flex items-center gap-5 p-5 rounded-2xl border text-left transition-all duration-200 group
                                            ${selected[current] === i
                                                ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.15)] scale-[1.01]'
                                                : 'border-white/10 bg-[#0A0A0F] hover:border-orange-500/40 hover:bg-orange-500/5'}`}>
                                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-colors
                                            ${selected[current] === i ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/30' : 'bg-white/5 text-slate-400 group-hover:bg-orange-500/20 group-hover:text-orange-400'}`}>
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        <span className={`text-[15px] leading-relaxed ${selected[current] === i ? 'text-white font-medium' : 'text-slate-300'}`}>{opt}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pagination Footer */}
                        <div className="mt-6 flex items-center justify-between flex-shrink-0 bg-white/[0.02] border border-white/10 p-4 rounded-2xl">
                            <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-400 bg-white/5 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white/5">
                                ← Previous
                            </button>
                            {current < questions.length - 1
                                ? <button onClick={() => setCurrent(c => c + 1)}
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-black bg-white hover:bg-slate-200 transition-all shadow-lg shadow-white/10">
                                    Next Question →
                                </button>
                                : <button onClick={handleSubmit} disabled={submitting}
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/20 transition-all disabled:opacity-60 hover:from-green-400 hover:to-green-500">
                                    {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    Submit
                                </button>
                            }
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 flex flex-col overflow-y-auto pr-2 scrollbar-none">
                        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                            <h3 className="text-xs font-black text-slate-500 mb-4 uppercase tracking-widest">Question Navigator</h3>
                            <div className="grid grid-cols-5 gap-2.5">
                                {questions.map((_, i) => (
                                    <button key={i} onClick={() => setCurrent(i)}
                                        className={`w-full aspect-square rounded-xl text-sm font-bold transition-all flex items-center justify-center border
                                            ${i === current ? 'border-orange-500 bg-orange-500 text-black shadow-lg shadow-orange-500/40 scale-110 z-10' :
                                                selected[i] !== undefined ? 'border-orange-500/30 bg-orange-500/10 text-orange-400' :
                                                    'border-white/10 bg-white/5 text-slate-500 hover:border-white/30 hover:bg-white/10'}`}>
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-6 pt-5 border-t border-white/5">
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-slate-400">Completion</span>
                                    <span className="text-orange-400">{answered}/{questions.length}</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div animate={{ width: `${(answered / questions.length) * 100}%` }} className="h-full bg-orange-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                            <h3 className="text-xs font-black text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-400" /> Proctoring Monitor
                            </h3>
                            <div className="space-y-4 text-sm font-medium">
                                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="text-slate-400">Tab Switches</span>
                                    <span className={`px-2 py-0.5 rounded-md ${tabSwitches >= 3 ? 'bg-red-500/20 text-red-400' : tabSwitches > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>{tabSwitches} / 3</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="text-slate-400">Session ID</span>
                                    <span className="text-slate-500 font-mono text-xs">#{sessionId}</span>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSubmit} disabled={submitting}
                            className="w-full py-4 rounded-xl font-bold text-slate-300 bg-white/[0.02] border border-white/10 hover:bg-white/5 hover:text-white transition-all disabled:opacity-50">
                            Submit Early
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
