import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Upload, TrendingUp, ArrowRight, Briefcase, Loader2 } from 'lucide-react'

const API = 'http://localhost:8000'

const DEMAND_COLOR = {
    high: 'text-green-400 bg-green-500/10 border-green-500/30',
    medium: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    low: 'text-slate-400 bg-white/5 border-white/10',
}

export default function ExploreRoadmap() {
    const [tab, setTab] = useState('trending')
    const [query, setQuery] = useState('')
    const [searchResult, setSearchResult] = useState(null)
    const [searching, setSearching] = useState(false)
    const [trending, setTrending] = useState([])
    const [loadingTrending, setLoadingTrending] = useState(true)
    const [dragging, setDragging] = useState(false)
    const [jdText, setJdText] = useState('')
    const [jdLoading, setJdLoading] = useState(false)
    const [jdError, setJdError] = useState('')
    const navigate = useNavigate()

    const handleAnalyzeJD = async () => {
        if (!jdText.trim() || jdLoading) return
        setJdLoading(true)
        setJdError('')
        try {
            const res = await fetch(`${API}/api/roles/analyze-jd/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jd_text: jdText }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Analysis failed')
            // Navigate to the generated role detail page
            navigate(`/role/${data.slug}`, { state: { fromJD: true } })
        } catch (err) {
            setJdError(err.message)
        } finally {
            setJdLoading(false)
        }
    }

    // Fetch real trending roles from RemoteOK on mount
    useEffect(() => {
        fetch(`${API}/api/roles/trending/`)
            .then(r => r.json())
            .then(data => setTrending(data))
            .catch(() => setTrending([]))
            .finally(() => setLoadingTrending(false))
    }, [])

    // Search any role via Gemini
    const handleSearch = async () => {
        if (!query.trim() || searching) return
        setSearching(true)
        setSearchResult(null)
        try {
            const res = await fetch(`${API}/api/roles/search/?q=${encodeURIComponent(query)}`)
            const data = await res.json()
            setSearchResult(data)
        } catch {
            setSearchResult({ error: 'Could not find role. Try again.' })
        } finally {
            setSearching(false)
        }
    }

    const tabs = [
        { id: 'trending', label: 'Trending Careers' },
        { id: 'search', label: 'Search a Role' },
        { id: 'upload', label: 'Upload JD' },
    ]

    return (
        <div className="pt-24 min-h-screen max-w-7xl mx-auto px-6 pb-24">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                <h1 className="text-5xl font-black text-white mb-3">
                    Explore <span className="text-orange-400 underline decoration-orange-500/50 underline-offset-4">Roadmaps</span>
                </h1>
                <p className="text-slate-500 text-lg">Discover your path to employment — sorted by live job openings.</p>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-1 mb-10 bg-white/5 p-1 rounded-2xl w-fit">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'text-black' : 'text-slate-400 hover:text-white'}`}>
                        {tab === t.id && <motion.div layoutId="tab-pill" className="absolute inset-0 bg-orange-500 rounded-xl" />}
                        <span className="relative z-10">{t.label}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ── Trending Tab ──────────────────────────────────────────────────── */}
                {tab === 'trending' && (
                    <motion.div key="trending" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {loadingTrending ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
                                <p className="text-slate-400">Fetching live job counts from RemoteOK...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {trending.map((role, i) => (
                                    <motion.div key={role.slug}
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                        whileHover={{ y: -5 }}
                                        className="bg-white/[0.04] border border-white/10 hover:border-orange-500/40 rounded-2xl p-5 cursor-pointer group transition-all"
                                        onClick={() => navigate(`/role/${role.slug}`)}>
                                        <div className="text-3xl mb-3">{role.icon}</div>
                                        <h3 className="text-white font-bold text-sm mb-1 leading-tight">{role.title}</h3>
                                        <p className="text-slate-500 text-xs mb-3 line-clamp-2">{role.description}</p>

                                        {/* Live job count badge */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                                                <Briefcase className="w-3 h-3" />
                                                <span>{role.live_job_count} live jobs</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500">{role.node_count} topics · {role.estimated_months}mo</span>
                                            <span className="flex items-center gap-1 text-orange-400 text-xs font-bold group-hover:gap-2 transition-all">
                                                Explore <ArrowRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── Search Tab ────────────────────────────────────────────────────── */}
                {tab === 'search' && (
                    <motion.div key="search" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="max-w-2xl mx-auto">
                            <div className="flex gap-3 mb-8">
                                <div className="relative flex-1">
                                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input value={query} onChange={e => setQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                        placeholder="Search any role — e.g. 'Data Scientist', 'React Developer', 'Blockchain Engineer'..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-all" />
                                </div>
                                <button onClick={handleSearch} disabled={searching || !query.trim()}
                                    className="px-6 py-4 rounded-xl bg-orange-500 text-black font-bold hover:bg-orange-400 transition-all disabled:opacity-50 flex items-center gap-2">
                                    {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                </button>
                            </div>

                            {searching && (
                                <div className="text-center py-12">
                                    <Loader2 className="w-10 h-10 text-orange-400 animate-spin mx-auto mb-3" />
                                    <p className="text-slate-400">Gemini AI is analyzing "{query}"...</p>
                                </div>
                            )}

                            {searchResult && !searchResult.error && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/[0.04] border border-orange-500/30 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{searchResult.title}</h2>
                                            <p className="text-slate-400 text-sm mt-1">{searchResult.industry_description}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full text-sm font-semibold">
                                            <Briefcase className="w-4 h-4" />
                                            {searchResult.live_job_count} live jobs
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {searchResult.must_have_skills?.map(s => (
                                            <span key={s} className="px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-medium">{s}</span>
                                        ))}
                                    </div>
                                    <button onClick={() => navigate(`/role/${searchResult.slug}`)}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold hover:from-orange-400 hover:to-orange-500 transition-all flex items-center justify-center gap-2">
                                        View Full Role Analysis <ArrowRight className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}

                            {searchResult?.error && (
                                <p className="text-red-400 text-center">{searchResult.error}</p>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── Upload JD Tab ─────────────────────────────────────────────────── */}
                {tab === 'upload' && (
                    <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="max-w-2xl mx-auto">
                            <div onDragOver={e => { e.preventDefault(); setDragging(true) }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={e => { e.preventDefault(); setDragging(false) }}
                                className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all mb-6
                  ${dragging ? 'border-orange-500 bg-orange-500/10' : 'border-orange-500/30 bg-orange-500/5 hover:border-orange-500/60'}`}>
                                <Upload className="w-10 h-10 text-orange-400 mx-auto mb-4" />
                                <h3 className="text-white font-bold text-xl mb-2">Drop your Job Description here</h3>
                                <p className="text-slate-500 mb-6">Or paste the JD text below — Gemini AI extracts required skills and maps your roadmap</p>
                            </div>

                            <textarea value={jdText} onChange={e => setJdText(e.target.value)} rows={6}
                                placeholder="Or paste job description text here..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-all resize-none mb-4" />

                            {jdError && (
                                <p className="text-red-400 text-sm text-center">{jdError}</p>
                            )}

                            <button onClick={handleAnalyzeJD} disabled={!jdText.trim() || jdLoading}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold hover:from-orange-400 hover:to-orange-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {jdLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                Analyze JD & Generate Roadmap
                            </button>

                            <div className="mt-8">
                                <div className="text-slate-500 text-sm text-center mb-4">How it works</div>
                                <div className="flex items-center justify-between gap-2">
                                    {['Paste JD', 'Gemini Extracts Skills', 'Maps to Roadmap', 'Shows Your Gap'].map((step, i) => (
                                        <div key={step} className="flex items-center gap-2">
                                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                                                <div className="text-orange-400 font-bold text-xs whitespace-nowrap">{step}</div>
                                            </div>
                                            {i < 3 && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.3 }}
                                                className="w-6 h-0.5 bg-blue-500/60 flex-shrink-0 origin-left" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
