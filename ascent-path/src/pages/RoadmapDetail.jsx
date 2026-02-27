import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Lock, CheckCircle, Play, MessageCircle, ArrowRight,
    BookOpen, Code, FileText, Loader2, AlertCircle, ExternalLink, Youtube, Info, X, ShieldAlert,
    Settings, Eye, GraduationCap, Mic
} from 'lucide-react'
import Editor from '@monaco-editor/react'
import InterviewModal from '../components/InterviewModal'
import NodeAssessment from '../components/NodeAssessment'

const API = import.meta.env.VITE_API_URL || 'https://ascent-path-api.onrender.com'

const DIFF_COLORS = {
    beginner: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    intermediate: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    advanced: 'text-red-400 border-red-500/30 bg-red-500/10',
}

const TIER_ORDER = ['beginner', 'intermediate', 'advanced']

export default function RoadmapDetail() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const [roadmap, setRoadmap] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedNode, setSelectedNode] = useState(null)
    const [markingDone, setMarkingDone] = useState(false)
    const [showWorkspace, setShowWorkspace] = useState(false)
    const [strikes, setStrikes] = useState(0)
    const [isLocked, setIsLocked] = useState(false)
    const [showStrikeOverlay, setShowStrikeOverlay] = useState(false)
    const [showDocs, setShowDocs] = useState(false)
    const [isAssessmentMode, setIsAssessmentMode] = useState(false)
    const [isProjectMode, setIsProjectMode] = useState(false)
    const [generatingResume, setGeneratingResume] = useState(false)
    const [resumeProfile, setResumeProfile] = useState({
        phone: '', location: '', linkedin_url: '', github_url: '', portfolio_url: '', professional_summary: ''
    })
    const [showResumeSettings, setShowResumeSettings] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [previewUrl, setPreviewUrl] = useState('')
    const [code, setCode] = useState('// Write your code here...')
    const [messages, setMessages] = useState([])
    const [chatInput, setChatInput] = useState('')
    const [isThinking, setIsThinking] = useState(false)
    const [showAssessment, setShowAssessment] = useState(false)
    const [showInterview, setShowInterview] = useState(false)

    const fetchResumeProfile = async () => {
        if (!token) return
        try {
            const res = await fetch(`${API}/api/roles/resume-profile/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setResumeProfile(data)
        } catch (e) {
            console.error('Error fetching resume profile', e)
        }
    }

    const saveResumeProfile = async () => {
        try {
            const res = await fetch(`${API}/api/roles/resume-profile/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(resumeProfile)
            })
            if (res.ok) {
                setShowResumeSettings(false)
            }
        } catch (e) {
            alert('Failed to save profile')
        }
    }

    const handleGenerateResume = async (isPreview = false) => {
        if (!token) return navigate('/login')
        setGeneratingResume(true)
        try {
            const res = await fetch(`${API}/api/roles/generate-resume/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ slug, preview: isPreview })
            })
            const data = await res.json()
            if (data.resume_url) {
                const fullUrl = `${API}${data.resume_url}${data.resume_url.includes('?') ? '&' : '?'}t=${Date.now()}`
                if (isPreview) {
                    setPreviewUrl(fullUrl)
                    setShowPreview(true)
                } else {
                    window.open(fullUrl, '_blank')
                }
            }
            else {
                alert(data.error || 'Failed to generate resume')
            }
        } catch (e) {
            console.error(e)
            alert('Error connecting to Career Engine')
        } finally {
            setGeneratingResume(false)
        }
    }

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isThinking || isAssessmentMode || isProjectMode) return

        const userMsg = { role: 'user', content: chatInput }
        setMessages(prev => [...prev, userMsg])
        setChatInput('')
        setIsThinking(true)

        try {
            const resp = await fetch(`${API}/api/roles/mentor/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    node_id: selectedNode.id,
                    message: chatInput,
                    code: code
                })
            })
            const data = await resp.json()
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my knowledge base right now." }])
        } finally {
            setIsThinking(false)
        }
    }

    useEffect(() => {
        if (showWorkspace && selectedNode) {
            setMessages([])
            if (selectedNode.assessment_data?.starter_code) {
                setCode(selectedNode.assessment_data.starter_code)
            } else {
                setCode('// Write your code here...')
            }
        }
    }, [showWorkspace, selectedNode])

    // Language Detection Utility
    const getLanguage = (node) => {
        if (!node) return 'javascript'
        const text = (node.title + ' ' + node.description).toLowerCase()
        if (text.includes('python')) return 'python'
        if (text.includes('html') || text.includes('css')) return 'html'
        return 'javascript'
    }

    // Proctoring System
    useEffect(() => {
        if (!showWorkspace || isLocked) return

        const handleBlur = () => {
            if (strikes < 3) {
                setStrikes(s => s + 1)
                setShowStrikeOverlay(true)
                setTimeout(() => setShowStrikeOverlay(false), 3000)
            } else {
                setStrikes(3)
                setIsLocked(true)
            }
        }

        const handleSecurityEvents = (e) => {
            if (showWorkspace) {
                e.preventDefault()
            }
        }

        window.addEventListener('blur', handleBlur)
        window.addEventListener('copy', handleSecurityEvents)
        window.addEventListener('paste', handleSecurityEvents)
        window.addEventListener('cut', handleSecurityEvents)
        window.addEventListener('contextmenu', handleSecurityEvents)

        return () => {
            window.removeEventListener('blur', handleBlur)
            window.removeEventListener('copy', handleSecurityEvents)
            window.removeEventListener('paste', handleSecurityEvents)
            window.removeEventListener('cut', handleSecurityEvents)
            window.removeEventListener('contextmenu', handleSecurityEvents)
        }
    }, [showWorkspace, strikes, isLocked])
    const token = localStorage.getItem('access_token')

    useEffect(() => {
        fetchResumeProfile()
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        fetch(`${API}/api/roles/roadmaps/${slug}/`, { headers })
            .then(r => r.json())
            .then(data => {
                if (data.error) throw new Error(data.error)
                setRoadmap(data)
                // Default selection: first uncompleted node
                const nodes = data.nodes || []
                const firstPending = nodes.find(n => !n.is_completed) || nodes[0]
                setSelectedNode(firstPending)
            })
            .catch(e => setError(e.message || 'Failed to load roadmap'))
            .finally(() => setLoading(false))
    }, [slug, token])

    const handleCompleteNode = async (nodeId) => {
        if (!token) return navigate('/login')
        setMarkingDone(true)
        try {
            const res = await fetch(`${API}/api/roles/complete-node/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ node_id: nodeId })
            })
            const data = await res.json()
            if (data.is_completed) {
                // Update local state
                setRoadmap(prev => ({
                    ...prev,
                    nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, is_completed: true } : n)
                }))
                setSelectedNode(prev => ({ ...prev, is_completed: true }))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setMarkingDone(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-orange-400 animate-spin" />
            <p className="text-white font-semibold italic">Mapping your career path...</p>
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center gap-4 text-center px-4">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Roadmap Not Found</h2>
            <p className="text-slate-400 max-w-md">{error}</p>
            <button onClick={() => navigate('/explore')} className="px-6 py-3 rounded-xl bg-orange-500 text-black font-bold">
                Back to Explore
            </button>
        </div>
    )

    // Group nodes by difficulty
    const groupedNodes = TIER_ORDER.reduce((acc, tier) => {
        acc[tier] = roadmap.nodes.filter(n => n.difficulty === tier)
        return acc
    }, {})

    return (
        <div className="pt-20 min-h-screen bg-[#0A0A0F]">
            {/* Visual Roadmap Map Section */}
            <div className="relative px-6 py-12 bg-white/[0.01] overflow-hidden">
                {/* Background Grid/Stars effect */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                <div className="max-w-7xl mx-auto relative">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <button onClick={() => navigate('/explore')} className="text-slate-500 hover:text-white transition-colors flex items-center gap-1 group">
                                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                    <span>Explore</span>
                                </button>
                                <span className="text-white/10">|</span>
                                <button onClick={() => navigate(`/role/${slug}`)} className="text-slate-500 hover:text-white transition-colors flex items-center gap-1 group">
                                    <span>Role Details</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <span className="ml-4 text-xs text-orange-400 font-black tracking-widest uppercase">{roadmap.category}</span>
                            </div>
                            <h1 className="text-5xl font-black text-white flex items-center gap-4">
                                <span className="text-6xl">{roadmap.icon}</span> {roadmap.title}
                            </h1>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <button
                                onClick={() => setShowResumeSettings(true)}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-white/[0.03] border border-white/5 group-hover:bg-slate-500/10 group-hover:border-slate-500/20">
                                    <Settings size={18} className="text-slate-400 group-hover:text-white" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white">Settings</span>
                            </button>

                            <button
                                onClick={() => handleGenerateResume(true)}
                                disabled={generatingResume}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-white/[0.03] border border-white/5 group-hover:bg-purple-500/10 group-hover:border-purple-500/20 ${generatingResume ? 'opacity-50' : ''}`}>
                                    <Eye size={18} className="text-slate-400 group-hover:text-purple-400" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-purple-400">Preview</span>
                            </button>

                            <button
                                onClick={() => handleGenerateResume(false)}
                                disabled={generatingResume}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-white/[0.03] border border-white/5 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 ${generatingResume ? 'opacity-50' : ''}`}>
                                    {generatingResume ? (
                                        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                                    ) : (
                                        <FileText className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
                                    )}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-400">
                                    {generatingResume ? 'Generating...' : 'Download Resume'}
                                </span>
                            </button>

                            <div className="h-10 w-[1px] bg-white/5" />

                            <div className="text-right">
                                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Path Mastery</div>
                                <div className="text-2xl font-black text-white">
                                    {roadmap.nodes.filter(n => n.is_completed).length} / {roadmap.nodes.length}
                                </div>
                            </div>
                            <div className="relative w-16 h-16">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <path className="stroke-white/10" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path className="stroke-orange-500 transition-all duration-1000" strokeWidth="3" strokeDasharray={`${(roadmap.nodes.filter(n => n.is_completed).length / roadmap.nodes.length) * 100}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-orange-400">
                                    {Math.round((roadmap.nodes.filter(n => n.is_completed).length / roadmap.nodes.length) * 100)}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* The Map */}
                    <div className="relative min-h-[600px] flex flex-col items-center py-20">
                        {/* Connecting Path SVG (Static for now, but dots will animate) */}
                        <div className="absolute inset-0 pointer-events-none flex justify-center">
                            <svg width="400" height="100%" viewBox="0 0 400 1000" fill="none" className="opacity-10 stroke-orange-500">
                                <path
                                    d="M200 0 Q 350 150 200 300 T 200 600 T 200 900"
                                    strokeWidth="4"
                                    strokeDasharray="10 10"
                                />
                            </svg>
                        </div>

                        <div className="space-y-24 relative z-10 w-full max-w-4xl">
                            {TIER_ORDER.map((tier) => (
                                groupedNodes[tier]?.length > 0 && (
                                    <div key={tier} className="space-y-12">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10`} />
                                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1 rounded-full border ${tier === 'beginner' ? 'text-blue-400 border-blue-500/30' :
                                                tier === 'intermediate' ? 'text-orange-400 border-orange-500/30' : 'text-red-500 border-red-500/30'
                                                }`}>
                                                {tier} Level
                                            </span>
                                            <div className={`h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10`} />
                                        </div>

                                        <div className="flex flex-col gap-12">
                                            {groupedNodes[tier].map((node, ni) => (
                                                <motion.div
                                                    key={node.id}
                                                    initial={{ opacity: 0, x: ni % 2 === 0 ? -50 : 50 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    className={`flex items-center gap-8 ${ni % 2 === 0 ? 'flex-row' : 'flex-row-reverse text-right'}`}
                                                >
                                                    {/* Node Bubble */}
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, rotate: ni % 2 === 0 ? 5 : -5 }}
                                                        onClick={() => setSelectedNode(node)}
                                                        className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-2xl transition-all
                                                            ${selectedNode?.id === node.id ? 'border-orange-500 bg-orange-500/20 scale-110 ring-4 ring-orange-500/20' :
                                                                node.is_completed ? 'border-green-500/40 bg-green-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'
                                                            }
                                                        `}
                                                    >
                                                        {node.is_completed ? (
                                                            <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-lg">
                                                                <CheckCircle size={16} className="text-white" />
                                                            </div>
                                                        ) : node.id === selectedNode?.id && (
                                                            <div className="absolute -inset-2 rounded-full border-2 border-orange-500 animate-ping opacity-20" />
                                                        )}
                                                        <span className="text-2xl font-black text-white/50">{ni + 1}</span>
                                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/10 to-transparent rounded-full opacity-0 hover:opacity-100 transition-opacity">
                                                            <Play size={20} className="text-white" />
                                                        </div>
                                                    </motion.button>

                                                    {/* Node Info Label */}
                                                    <div className={`flex-1 max-w-sm ${ni % 2 === 0 ? 'text-left' : 'text-right'}`}>
                                                        <div className={`flex items-center gap-3 mb-1 ${ni % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                                            <h3 className={`text-xl font-black transition-colors ${selectedNode?.id === node.id ? 'text-orange-400' : 'text-white'}`}>
                                                                {node.title}
                                                            </h3>
                                                            {node.is_completed && <CheckCircle size={14} className="text-green-500" />}
                                                        </div>
                                                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3">
                                                            {node.description}
                                                        </p>

                                                        {/* Instant Resource Links */}
                                                        <div className={`flex items-center gap-2 ${ni % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                                            {node.video_url && (
                                                                <a href={node.video_url} target="_blank" rel="noreferrer"
                                                                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all tooltip" title="Watch Video">
                                                                    <Youtube size={14} />
                                                                </a>
                                                            )}
                                                            {node.resource_url && (
                                                                <a href={node.resource_url} target="_blank" rel="noreferrer"
                                                                    className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all" title="Read Docs">
                                                                    <BookOpen size={14} />
                                                                </a>
                                                            )}
                                                            <button
                                                                onClick={() => setSelectedNode(node)}
                                                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all uppercase tracking-tighter">
                                                                Details & Project
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Skill Detail Section */}
            {selectedNode && (
                <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-md border ${DIFF_COLORS[selectedNode.difficulty]}`}>
                                    {selectedNode.difficulty}
                                </span>
                                <span className="text-slate-500 text-xs flex items-center gap-1.5 italic">
                                    <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                                    Estimated {selectedNode.estimated_days} days to master
                                </span>
                            </div>
                            <h2 className="text-4xl font-black text-white mb-4 leading-tight">{selectedNode.title}</h2>
                            <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
                                {selectedNode.description}
                            </p>
                        </div>

                        {/* Resource Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {selectedNode.video_url && (
                                <a href={selectedNode.video_url} target="_blank" rel="noreferrer"
                                    className="group bg-red-500/5 border border-red-500/20 rounded-2xl p-5 hover:bg-red-500/10 transition-all">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Youtube className="text-red-500" />
                                        <span className="text-white font-bold text-sm">Video Tutorial</span>
                                    </div>
                                    <p className="text-slate-500 text-xs mb-3">Learn through curated high-quality free video resources on YouTube.</p>
                                    <span className="text-red-400 text-xs font-black flex items-center gap-1 group-hover:underline">
                                        WATCH ON YOUTUBE <ArrowRight className="w-3 h-3" />
                                    </span>
                                </a>
                            )}
                            {selectedNode.resource_url && (
                                <a href={selectedNode.resource_url} target="_blank" rel="noreferrer"
                                    className="group bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 hover:bg-blue-500/10 transition-all">
                                    <div className="flex items-center gap-3 mb-2">
                                        <BookOpen className="text-blue-500 w-5 h-5" />
                                        <span className="text-white font-bold text-sm">MDN Documentation</span>
                                    </div>
                                    <p className="text-slate-500 text-xs mb-3">Deep dive into the official technical documentation and specifications.</p>
                                    <span className="text-blue-400 text-xs font-black flex items-center gap-1 group-hover:underline">
                                        READ DOCS <ArrowRight className="w-3 h-3" />
                                    </span>
                                </a>
                            )}
                            {selectedNode.paid_course_url && (
                                <a href={selectedNode.paid_course_url} target="_blank" rel="noreferrer"
                                    className="group bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 hover:bg-emerald-500/10 transition-all">
                                    <div className="flex items-center gap-3 mb-2">
                                        <GraduationCap className="text-emerald-500 w-5 h-5" />
                                        <span className="text-white font-bold text-sm">Premium Course</span>
                                    </div>
                                    <p className="text-slate-500 text-xs mb-3">Accelerate learning with a top-rated, curated paid course.</p>
                                    <span className="text-emerald-400 text-xs font-black flex items-center gap-1 group-hover:underline">
                                        VIEW COURSE <ArrowRight className="w-3 h-3" />
                                    </span>
                                </a>
                            )}
                        </div>

                        {/* Project / Assessment Section */}
                        {selectedNode.project_description && (
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Code className="w-24 h-24" />
                                </div>
                                <h3 className="text-white font-black text-xl mb-4 flex items-center gap-2">
                                    <Code className="text-orange-500 w-5 h-5" /> Secure Project Workspace
                                </h3>
                                <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-6 mb-6">
                                    <p className="text-slate-300 italic text-sm leading-relaxed font-mono">
                                        "{selectedNode.project_description}"
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={() => {
                                            if (selectedNode.is_completed) return
                                            setShowWorkspace(true)
                                            setIsProjectMode(false)
                                            setIsAssessmentMode(false)
                                            setStrikes(0)
                                            setIsLocked(false)
                                        }}
                                        className="px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-xl"
                                    >
                                        <MessageCircle size={16} /> PRACTICE WITH AI
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (selectedNode.is_completed) return
                                            setShowWorkspace(true)
                                            setIsProjectMode(true)
                                            setIsAssessmentMode(false)
                                            setStrikes(0)
                                            setIsLocked(false)
                                        }}
                                        className="px-6 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-xl"
                                    >
                                        <Code size={16} /> START PROJECT (MDN ONLY)
                                    </button>

                                    {!selectedNode.is_completed ? (
                                        <button
                                            onClick={() => setShowAssessment(true)}
                                            disabled={markingDone}
                                            className="px-8 py-3.5 rounded-xl font-black bg-orange-500 text-black hover:bg-orange-400 hover:scale-[1.02] transition-all flex items-center gap-2 shadow-xl"
                                        >
                                            <ShieldAlert className="w-4 h-4" /> TAKE ASSESSMENT
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setShowInterview(true)}
                                            className="px-8 py-3.5 rounded-xl font-black bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500 hover:scale-[1.02] border border-green-500/30 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                        >
                                            <Mic className="w-4 h-4" /> AI INTERVIEW
                                        </button>
                                    )}
                                </div>
                                <p className="mt-4 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                                    ⚠️ Secure Mode: Copy/Paste disabled | 3-Strike tab switch protection applies
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right: Sidebar Stats */}
                    <div className="space-y-6">
                        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-6 border-b border-white/5 pb-3">Path Progress</h3>
                            <div className="space-y-5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 font-bold uppercase tracking-tighter">Status</span>
                                    <span className={`font-black p-1 px-2 rounded-md ${selectedNode.is_completed ? 'text-green-400 bg-green-500/10' : 'text-slate-400 bg-white/5'}`}>
                                        {selectedNode.is_completed ? 'MASTERED' : 'NOT STARTED'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 font-bold uppercase tracking-tighter">Prerequisites</span>
                                    <span className="text-white font-bold">Passed</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 font-bold uppercase tracking-tighter">Difficulty</span>
                                    <span className="text-white font-bold capitalize">{selectedNode.difficulty}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setShowWorkspace(true)
                                    setIsProjectMode(false)
                                    setIsAssessmentMode(false)
                                    setStrikes(0)
                                    setIsLocked(false)
                                }}
                                className="w-full mt-8 flex items-center justify-center gap-2 py-4 rounded-xl border border-blue-500/30 bg-blue-500/5 text-blue-400 font-black hover:bg-blue-500/10 transition-all flex-col">
                                <MessageCircle className="w-5 h-5" />
                                <span>ASK AI MENTOR IN CONTEXT</span>
                            </button>
                        </div>

                        {/* Career Context */}
                        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-6">
                            <h3 className="text-white font-bold text-sm mb-4">Why learn this?</h3>
                            <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                Mastering <span className="text-white font-bold italic">"{selectedNode.title}"</span> unlocks higher-tier positions in this track and is a key requirement for {roadmap.nodes.filter(n => n.difficulty === 'advanced').length} advanced projects.
                            </p>
                            <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase">
                                <TrendingUp className="w-3 h-3" /> Industry Standard Skill
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Secure Workspace Overlay */}
            {
                showWorkspace && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[100] bg-[#0A0A0F] flex flex-col pt-16"
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        {/* Workspace Header */}
                        <div className="h-14 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-6">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black">
                                    <ShieldAlert size={14} /> SECURE WORKSPACE
                                </div>
                                <h2 className="text-white font-bold text-sm tracking-tight">{selectedNode?.title}</h2>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Strikes */}
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3].map(s => (
                                        <div key={s} className={`w-2.5 h-2.5 rounded-full border transition-all duration-500 ${strikes >= s ? 'bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-white/5 border-white/10'
                                            }`} />
                                    ))}
                                    <span className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Strikes</span>
                                </div>

                                <button
                                    onClick={() => setShowWorkspace(false)}
                                    className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            {/* Editor Area */}
                            <div className="flex-1 relative bg-[#1e1e1e]">
                                {isLocked ? (
                                    <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center text-center px-6">
                                        <ShieldAlert size={64} className="text-red-500 mb-6 animate-pulse" />
                                        <h3 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">Workspace Locked</h3>
                                        <p className="text-slate-400 max-w-md mb-8">
                                            You exceeded the maximum allowed tab switches (3/3). This session has been flagged for review.
                                        </p>
                                        <button
                                            onClick={() => setShowWorkspace(false)}
                                            className="px-8 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all border border-white/10"
                                        >
                                            Return to Roadmap
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Editor
                                            height="100%"
                                            theme="vs-dark"
                                            language={getLanguage(selectedNode)}
                                            value={code}
                                            onChange={(v) => setCode(v)}
                                            onMount={(editor) => {
                                                if (selectedNode?.assessment_data?.starter_code) {
                                                    setCode(selectedNode.assessment_data.starter_code)
                                                }
                                            }}
                                            options={{
                                                fontSize: 14,
                                                minimap: { enabled: false },
                                                contextmenu: false,
                                                renderLineHighlight: 'all',
                                                padding: { top: 20 },
                                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                                            }}
                                        />
                                        {/* Strike Warning Flash */}
                                        {showStrikeOverlay && (
                                            <div className="absolute inset-0 z-40 bg-red-500/10 border-4 border-red-500/50 animate-pulse pointer-events-none flex items-center justify-center">
                                                <div className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-xl shadow-2xl flex items-center gap-3">
                                                    <ShieldAlert size={24} /> STRIKE {strikes}/3 - TAB SWITCH DETECTED
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Node Sidebar */}
                            <div className="w-80 border-l border-white/5 flex flex-col bg-white/[0.01]">
                                <div className="p-6 flex-1 overflow-y-auto space-y-8">
                                    <div>
                                        <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-3">Assessment: {selectedNode?.assessment_type?.toUpperCase()}</h4>
                                        <div className="space-y-4">
                                            <p className="text-slate-300 text-sm leading-relaxed font-bold">
                                                {selectedNode?.assessment_data?.instructions || selectedNode?.project_description}
                                            </p>

                                            {selectedNode?.assessment_data?.solution_hints?.length > 0 && (
                                                <div className="pt-4 border-t border-white/5">
                                                    <h5 className="text-[9px] font-black text-slate-500 uppercase mb-2">Hints</h5>
                                                    <ul className="space-y-2">
                                                        {selectedNode.assessment_data.solution_hints.map((hint, i) => (
                                                            <li key={i} className="text-[11px] text-slate-400 flex gap-2">
                                                                <span className="text-orange-500/50">•</span> {hint}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <BookOpen size={12} /> Resource Context
                                        </h4>
                                        <p className="text-slate-500 text-[11px] leading-relaxed">
                                            Use the "Floating MDN Search" to find syntax tips. Remember: No external documentation is allowed.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-white/5 space-y-4">
                                    <button
                                        onClick={() => {
                                            handleCompleteNode(selectedNode.id)
                                            setShowWorkspace(false)
                                        }}
                                        disabled={markingDone || isLocked}
                                        className="w-full py-4 rounded-xl bg-orange-500 text-black font-black text-sm hover:bg-orange-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50"
                                    >
                                        {markingDone ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle size={16} />}
                                        SUBMIT FOR VERIFICATION
                                    </button>
                                    <p className="text-center text-[9px] font-black text-slate-700 tracking-[0.1em]">
                                        SECURE MODE ACTIVE • INTEGRITY CHECK ENABLED
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Resource Button */}
                        {!isLocked && !isAssessmentMode && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowDocs(!showDocs)}
                                className={`fixed bottom-10 right-10 px-6 h-12 rounded-full text-white font-black text-xs flex items-center justify-center gap-2 shadow-2xl transition-colors z-[110] border ${isProjectMode
                                    ? 'bg-emerald-600 border-emerald-400/30 hover:bg-emerald-500'
                                    : 'bg-blue-600 border-blue-400/30 hover:bg-blue-500'
                                    }`}
                            >
                                <BookOpen size={16} />
                                {showDocs ? 'CLOSE' : (isProjectMode ? 'RESEARCH MDN DOCS' : 'ASK CONVOAI MENTOR')}
                            </motion.button>
                        )}

                        {/* Resource Modal */}
                        {showDocs && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="fixed bottom-24 right-10 w-[400px] h-[550px] bg-[#16161E] border border-white/10 rounded-3xl shadow-2xl z-[120] flex flex-col overflow-hidden"
                            >
                                <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {!isProjectMode && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                            {isProjectMode ? 'MDN Project Resources' : 'ConvoAI Technical Mentor'}
                                        </span>
                                    </div>
                                    <button onClick={() => setShowDocs(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
                                </div>

                                {isProjectMode ? (
                                    <div className="flex-1 flex flex-col select-none" onCopy={(e) => e.preventDefault()}>
                                        <div className="p-4 border-b border-white/5">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    defaultValue={selectedNode?.title}
                                                    placeholder="Search syntax, functions, or patterns..."
                                                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                                <h5 className="text-emerald-400 font-bold text-sm mb-1 uppercase tracking-tighter">Project Mode Active</h5>
                                                <p className="text-slate-500 text-[11px] leading-relaxed italic">
                                                    AI Mentor is disabled. You are allowed to use MDN for technical reference.
                                                    <span className="block mt-2 text-white font-bold tracking-widest uppercase text-[9px]">⚠️ Copying from docs is strictly disabled.</span>
                                                </p>
                                            </div>

                                            {selectedNode?.resource_url && (
                                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                    <h6 className="text-white font-bold text-xs mb-2">Recommended Reading</h6>
                                                    <a href={selectedNode.resource_url} target="_blank" rel="noreferrer" className="text-blue-400 text-[11px] hover:underline flex items-center gap-1">
                                                        Official {selectedNode.title} Documentation <ExternalLink size={10} />
                                                    </a>
                                                </div>
                                            )}

                                            <div className="opacity-20 flex flex-col items-center justify-center py-10 grayscale">
                                                <BookOpen size={48} className="mb-4 text-white" />
                                                <p className="text-[10px] font-black uppercase text-center tracking-[0.3em] text-white">Integrity Research Shield</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Chat Messages */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                                            {messages.length === 0 && (
                                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center py-10">
                                                    <MessageCircle size={32} className="mx-auto text-blue-500/30 mb-4" />
                                                    <h5 className="text-white font-bold text-sm mb-1">How can I help you?</h5>
                                                    <p className="text-slate-500 text-[11px] leading-relaxed italic">
                                                        Ask me about syntax, logic errors, or MDN documentation for {selectedNode?.title}.
                                                    </p>
                                                </div>
                                            )}
                                            {messages.map((m, i) => (
                                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] p-3 rounded-2xl text-[12px] leading-relaxed ${m.role === 'user'
                                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                                        : 'bg-white/5 text-slate-300 border border-white/5 rounded-tl-none'
                                                        }`}>
                                                        {m.content}
                                                    </div>
                                                </div>
                                            ))}
                                            {isThinking && (
                                                <div className="flex justify-start">
                                                    <div className="bg-white/5 p-3 rounded-2xl flex gap-1">
                                                        <div className="w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                        <div className="w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                        <div className="w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-bounce" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Chat Input */}
                                        <div className="p-4 bg-black/40 border-t border-white/5">
                                            <form
                                                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                                className="relative"
                                            >
                                                <input
                                                    type="text"
                                                    value={chatInput}
                                                    onChange={(e) => setChatInput(e.target.value)}
                                                    placeholder="Ask ConvoAI..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!chatInput.trim() || isThinking}
                                                    className="absolute right-2 top-1.5 p-2 text-blue-500 hover:text-blue-400 disabled:opacity-20"
                                                >
                                                    <ArrowRight size={20} />
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )
            }
            {/* Resume Settings Modal */}
            {showResumeSettings && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#12121A] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-white">Resume Settings</h3>
                                <p className="text-slate-500 text-xs">These details will appear on your professional PDF.</p>
                            </div>
                            <button onClick={() => setShowResumeSettings(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Phone Number</label>
                                <input type="text" value={resumeProfile.phone} onChange={e => setResumeProfile({ ...resumeProfile, phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="+1 (555) 000-0000" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Location</label>
                                <input type="text" value={resumeProfile.location} onChange={e => setResumeProfile({ ...resumeProfile, location: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="City, Country" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">LinkedIn URL</label>
                                <input type="text" value={resumeProfile.linkedin_url} onChange={e => setResumeProfile({ ...resumeProfile, linkedin_url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="https://linkedin.com/in/..." />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">GitHub URL</label>
                                <input type="text" value={resumeProfile.github_url} onChange={e => setResumeProfile({ ...resumeProfile, github_url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="https://github.com/..." />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Portfolio URL</label>
                                <input type="text" value={resumeProfile.portfolio_url} onChange={e => setResumeProfile({ ...resumeProfile, portfolio_url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="https://yourportfolio.com" />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Professional Summary</label>
                                <textarea rows={4} value={resumeProfile.professional_summary} onChange={e => setResumeProfile({ ...resumeProfile, professional_summary: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none resize-none" placeholder="A brief overview of your technical background and career goals..." />
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/5 flex gap-4">
                            <button onClick={() => setShowResumeSettings(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors">Cancel</button>
                            <button onClick={saveResumeProfile} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">Save Details</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Resume Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#12121A] border border-white/10 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Eye size={18} /></div>
                                <h3 className="font-bold text-white">Resume Preview</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleGenerateResume(false)} disabled={generatingResume} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 disabled:opacity-50">
                                    {generatingResume ? 'Generating...' : 'Download PDF'}
                                </button>
                                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-[#1A1A24]">
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Assessment Modal */}
            {showAssessment && selectedNode && (
                <NodeAssessment
                    skill={selectedNode.title}
                    level={roadmap?.difficulty || 'beginner'}
                    onClose={() => setShowAssessment(false)}
                    onPassed={() => {
                        setShowAssessment(false)
                        markCompleted()
                    }}
                />
            )}

            {/* Interview Modal */}
            {showInterview && selectedNode && (
                <InterviewModal
                    skill={selectedNode.title}
                    onClose={() => setShowInterview(false)}
                    onVerified={() => {
                        // The backend already marks it verified; this just closes the modal
                        setShowInterview(false)
                    }}
                />
            )}
        </div>
    )
}

function TrendingUp(props) {
    return (
        <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    )
}
