import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import TabWarningModal from '../../components/TabWarningModal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function InitialAssessment() {
    const navigate = useNavigate();
    const onboarding = JSON.parse(localStorage.getItem('onboarding') || '{}');
    const skill = (onboarding.selectedSkills || ['JavaScript'])[0];
    const level = (onboarding.level || 'Beginner').toLowerCase();
    const token = localStorage.getItem('access_token');

    // ── State ─────────────────────────────────────────────────────────────────
    const [sessionId, setSessionId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState({});
    const [timeLeft, setTimeLeft] = useState(15 * 60);
    const [tabSwitches, setTabSwitches] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [tabWarningLevel, setTabWarningLevel] = useState(0); // 0=none, 1=first, 2=final

    // ── handleSubmit MUST be declared before any useEffect that references it ─
    const handleSubmit = useCallback(async () => {
        if (submitting || submitted || !sessionId) return;
        setSubmitting(true);
        try {
            const answers = Object.entries(selected).map(([qIdx, optIdx]) => ({
                question_id: questions[parseInt(qIdx)].id,
                selected_option: optIdx,
            }));
            // Add skipped questions with -1
            questions.forEach((_, i) => {
                if (!(i in selected)) {
                    answers.push({ question_id: questions[i].id, selected_option: -1 });
                }
            });

            const res = await fetch(`${API}/api/assessment/submit/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ session_id: sessionId, answers, tab_switches: tabSwitches }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Submit failed');
            setResult(data);
            localStorage.setItem('assessment_score', data.score);
        } catch (err) {
            console.error('Submit error:', err);
            setResult({ score: 0, correct: 0, total: questions.length });
        } finally {
            setSubmitted(true);
            setSubmitting(false);
        }
    }, [submitting, submitted, sessionId, selected, questions, tabSwitches, token]);

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
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to generate questions');
                setSessionId(data.session_id);
                setQuestions(data.questions);
            } catch (err) {
                setLoadError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadAssessment();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Timer (auto-submit at 0) ───────────────────────────────────────────────
    useEffect(() => {
        if (submitted || loading) return;
        const t = setInterval(() => {
            setTimeLeft(s => {
                if (s <= 1) { clearInterval(t); handleSubmit(); return 0; }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [submitted, loading, handleSubmit]);

    // ── Tab-switch monitor with progressive warnings ────────────────────────────
    useEffect(() => {
        const onBlur = () => {
            setTabSwitches(prev => {
                const next = prev + 1;
                if (next === 1) setTabWarningLevel(1);
                else if (next === 2) setTabWarningLevel(2);
                else if (next >= 3) {
                    setTabWarningLevel(0);
                    handleSubmit();
                }
                return next;
            });
        };
        window.addEventListener('blur', onBlur);
        return () => window.removeEventListener('blur', onBlur);
    }, [handleSubmit]);

    // ── No-exit guard during active assessment ─────────────────────────────────
    useEffect(() => {
        if (submitted) return;
        const onBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'Your assessment is in progress. Leaving will auto-submit your current answers.';
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [submitted]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    const answered = Object.keys(selected).length;
    const q = questions[current];

    // ── Loading State ─────────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin mb-6" />
            <p className="text-white font-semibold text-lg mb-2">Generating your assessment...</p>
            <p className="text-slate-400 text-sm">AI is crafting <span className="text-orange-400">{skill}</span> questions at <span className="text-blue-400">{level}</span> level</p>
            <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
                <Zap className="w-4 h-4 text-orange-400" />
                <span className="text-orange-300 text-sm">Powered by Groq Llama3-70B</span>
            </div>
        </div>
    );

    if (loadError) return (
        <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Failed to load assessment</h2>
            <p className="text-red-400 text-sm mb-6">{loadError}</p>
            <button onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-xl bg-orange-500 text-black font-bold hover:bg-orange-400 transition-all">
                Try Again
            </button>
        </div>
    );

    // ── Results Screen ─────────────────────────────────────────────────────────
    if (submitted && result) return (
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                <div className="w-28 h-28 rounded-full border-4 border-orange-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(249,115,22,0.35)]">
                    <span className="text-4xl font-black text-orange-400">{Math.round(result.score || 0)}%</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Assessment Complete!</h2>
                <p className="text-slate-400 mb-2">
                    You scored <span className="text-orange-400 font-semibold">{Math.round(result.score || 0)}%</span> on <span className="text-white">{skill}</span>
                </p>
                <p className="text-slate-500 text-sm mb-4">
                    {(result.level_awarded) && <>Skill level awarded: <span className="text-orange-300 font-semibold capitalize">{result.level_awarded}</span></>}
                </p>
                <p className="text-slate-500 text-sm mb-8">
                    {(result.score || 0) >= 80 ? '🌟 Excellent — skill verified!' :
                        (result.score || 0) >= 60 ? '✅ Passed — roadmap calibrated to your level' :
                            '📚 Your roadmap is set to build your foundations'}
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

                {result.details && result.details.length > 0 && (
                    <div className="mb-6 text-left space-y-2 max-h-48 overflow-y-auto">
                        {result.details.slice(0, 5).map((d, i) => (
                            <div key={i} className={`p-3 rounded-xl border text-sm ${d.is_correct ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                                <p className="text-slate-300 mb-1">{d.question}</p>
                                {!d.is_correct && <p className="text-green-400 text-xs">Correct: {d.correct_answer}</p>}
                                {d.explanation && <p className="text-slate-500 text-xs mt-1">{d.explanation}</p>}
                            </div>
                        ))}
                    </div>
                )}

                <button onClick={() => navigate('/dashboard')}
                    className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Go to My Dashboard →
                </button>
            </div>
        </div>
    );

    // ── Assessment Screen ──────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0A0A0F] pt-8 px-4 pb-10 relative overflow-hidden">

            {/* Tab-switch warning modal — Stitch-designed amber/red with eye photo */}
            <TabWarningModal
                level={tabWarningLevel}
                tabSwitches={tabSwitches}
                onDismiss={() => setTabWarningLevel(0)}
            />

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-orange-500/4 blur-[80px] rounded-full pointer-events-none" />
            <div className="w-full max-w-4xl mx-auto relative z-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 bg-white/[0.04] border border-white/10 rounded-2xl px-6 py-4">
                    <div>
                        <h1 className="text-white font-bold text-lg">Skill Verification — {skill}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs capitalize">{level} Level</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs text-red-400">LIVE</span>
                            <span className="text-xs text-slate-500 ml-1">Powered by Groq AI</span>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm
                        ${timeLeft < 120 ? 'border-red-500/40 bg-red-500/10 text-red-400' : 'border-orange-500/40 bg-orange-500/10 text-orange-400'}`}>
                        <Timer className="w-4 h-4" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main question */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8">
                            <div className="text-4xl font-black text-white/10 mb-4">{String(current + 1).padStart(2, '0')} / {questions.length}</div>
                            <p className="text-white text-lg font-semibold mb-5">{q?.question_text}</p>
                            {q?.code_snippet && (
                                <pre className="bg-[#0D0D1A] border border-white/10 rounded-xl p-5 mb-6 text-sm overflow-x-auto font-mono">
                                    <code className="text-slate-200">{q.code_snippet}</code>
                                </pre>
                            )}
                            <div className="space-y-3">
                                {(q?.options || []).map((opt, i) => (
                                    <button key={i} onClick={() => setSelected({ ...selected, [current]: i })}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200
                                            ${selected[current] === i
                                                ? 'border-orange-500/60 bg-orange-500/10 shadow-[0_0_12px_rgba(249,115,22,0.15)]'
                                                : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/5'}`}>
                                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border
                                            ${selected[current] === i ? 'border-orange-500/60 bg-orange-500/20 text-orange-300' : 'border-white/20 text-slate-400'}`}>
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        <span className={`text-sm ${selected[current] === i ? 'text-white' : 'text-slate-300'}`}>{opt}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-400 border border-white/10 hover:border-white/20 hover:text-white transition-all disabled:opacity-30">
                                ← Previous
                            </button>
                            {current < questions.length - 1
                                ? <button onClick={() => setCurrent(c => c + 1)}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 transition-all">
                                    Next Question →
                                </button>
                                : <button onClick={handleSubmit} disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/20 transition-all disabled:opacity-60">
                                    {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                    Submit Assessment ✓
                                </button>
                            }
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                            <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Questions</h3>
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((_, i) => (
                                    <button key={i} onClick={() => setCurrent(i)}
                                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all
                                            ${i === current ? 'bg-orange-500 text-white shadow-[0_0_8px_rgba(249,115,22,0.4)]' :
                                                selected[i] !== undefined ? 'bg-blue-600/30 border border-blue-500/50 text-blue-300' :
                                                    'bg-white/5 border border-white/10 text-slate-400 hover:border-white/25'}`}>
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-3">{answered}/{questions.length} answered</p>
                        </div>

                        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                            <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3 text-orange-400" /> Monitor
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Tab Switches</span>
                                    <span className={tabSwitches >= 3 ? 'text-red-400 font-bold' : tabSwitches > 0 ? 'text-yellow-400' : 'text-green-400'}>{tabSwitches}</span>
                                </div>
                                <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="text-green-400">Active</span></div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Progress</span>
                                    <span className="text-orange-400">{questions.length ? Math.round((answered / questions.length) * 100) : 0}%</span>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSubmit} disabled={submitting}
                            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 transition-all text-sm disabled:opacity-50">
                            Submit Early
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
