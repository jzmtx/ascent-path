import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Volume2, BookOpen, Plus, Sparkles } from 'lucide-react'

const initialMessages = [
    {
        role: 'user',
        content: 'Explain JavaScript closures with a real-world example',
    },
    {
        role: 'ai',
        content: `A **closure** is a function that retains access to its lexical scope even after the outer function has returned.\n\n**Real-world analogy:** Think of a closure like a backpack 🎒. The inner function "packs" variables from the outer scope into its backpack and carries them wherever it goes.\n\n\`\`\`js\nfunction makeAdder(x) {\n  return function(y) {\n    return x + y; // x is in the closure\n  };\n}\nconst add5 = makeAdder(5);\nadd5(3); // 8\n\`\`\``,
        source: 'MDN Web Docs — Closures',
    },
]

const modes = ['Chat', 'Explain', 'Simplify', 'Example']

export default function AIMentor() {
    const [messages, setMessages] = useState(initialMessages)
    const [input, setInput] = useState('')
    const [activeMode, setActiveMode] = useState('Chat')
    const [typing, setTyping] = useState(false)
    const bottomRef = useRef(null)

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

    const send = () => {
        if (!input.trim()) return
        const userMsg = { role: 'user', content: input }
        setMessages(p => [...p, userMsg])
        setInput('')
        setTyping(true)
        setTimeout(() => {
            setTyping(false)
            setMessages(p => [...p, {
                role: 'ai',
                content: `Great question! Let me look that up in the MDN corpus...\n\nBased on the MDN documentation, here's a grounded explanation specific to your query about "${input}":\n\nThis concept is well-documented in MDN's JavaScript Guide. The key principle is that...`,
                source: 'MDN Web Docs — JavaScript Guide',
            }])
        }, 1800)
    }

    return (
        <div className="pt-16 h-screen flex overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-64 flex flex-col border-r border-white/5 flex-shrink-0">
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                            <Sparkles size={16} className="text-blue-400" />
                        </div>
                        <span className="text-white font-bold text-sm">AI Mentor</span>
                    </div>
                    <button className="w-full bg-orange-500 hover:bg-orange-400 text-black font-bold py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2">
                        <Plus size={14} /> New Conversation
                    </button>
                </div>

                {/* Modes */}
                <div className="p-3 border-b border-white/5">
                    <div className="text-slate-600 text-xs mb-2">Mode</div>
                    <div className="grid grid-cols-2 gap-1">
                        {modes.map(m => (
                            <button
                                key={m}
                                onClick={() => setActiveMode(m)}
                                className={`text-xs py-1.5 rounded-lg font-medium transition-all ${activeMode === m ? 'bg-orange-500 text-black' : 'bg-white/5 text-slate-400 hover:text-white'
                                    }`}
                            >{m}</button>
                        ))}
                    </div>
                </div>

                {/* History */}
                <div className="flex-1 overflow-y-auto p-3">
                    <div className="text-slate-600 text-xs mb-2">History</div>
                    {['JS Closures', 'React Hooks', 'Async/Await', 'DOM APIs', 'Event Loop'].map(h => (
                        <div key={h} className="py-2 px-3 rounded-lg text-xs text-slate-500 hover:text-white hover:bg-white/5 cursor-pointer transition-all truncate">
                            {h}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Badge */}
                <div className="h-12 flex items-center px-6 border-b border-white/5 flex-shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30">
                        <BookOpen size={12} className="text-blue-400" />
                        <span className="text-blue-400 text-xs font-semibold">Grounded to MDN Documentation only — no hallucinations</span>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-2xl ${msg.role === 'user'
                                ? 'bg-orange-500/15 border border-orange-500/30 rounded-2xl rounded-tr-sm px-5 py-3 text-orange-100'
                                : 'bg-white/5 border-l-2 border-blue-500 rounded-2xl rounded-tl-sm px-5 py-4 text-slate-300'
                                }`}>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono">{msg.content}</div>
                                {msg.source && (
                                    <div className="mt-3 pt-2 border-t border-white/10 text-xs text-blue-400 flex items-center gap-1">
                                        <BookOpen size={10} />📚 Source: {msg.source}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {typing && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 border-l-2 border-blue-500 rounded-2xl px-5 py-4">
                                <div className="flex gap-1">
                                    {[0, 1, 2].map(d => (
                                        <motion.div
                                            key={d}
                                            animate={{ y: [0, -6, 0] }}
                                            transition={{ duration: 0.6, delay: d * 0.15, repeat: Infinity }}
                                            className="w-1.5 h-1.5 rounded-full bg-blue-400"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/5 flex-shrink-0">
                    <div className="flex gap-3 items-end">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                            placeholder="Ask anything about web development..."
                            rows={2}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 resize-none text-sm"
                        />
                        <div className="flex gap-2 flex-shrink-0">
                            <button className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-600/30 transition-all">
                                <Mic size={16} />
                            </button>
                            <button onClick={send} className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-black hover:bg-orange-400 transition-all glow-orange">
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                    <p className="text-slate-700 text-xs mt-2 text-center">Grounded responses only — answers derived exclusively from MDN Web Docs</p>
                </div>
            </div>

            {/* Right: MDN Panel */}
            <div className="w-72 flex flex-col border-l border-white/5 flex-shrink-0">
                <div className="p-4 border-b border-white/5">
                    <div className="text-white font-bold text-sm mb-1">MDN Reference</div>
                    <div className="text-slate-500 text-xs">Retrieved for this response</div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="glass rounded-xl p-4 mb-4">
                        <div className="text-xs text-slate-600 mb-2 font-semibold">CLOSURES — MDN WEB DOCS</div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            A <span className="bg-orange-500/30 text-orange-300 px-1 rounded">closure</span> is the combination of a function bundled together (enclosed) with references to its surrounding state (the{' '}
                            <span className="bg-orange-500/30 text-orange-300 px-1 rounded">lexical environment</span>).
                        </p>
                    </div>
                    <div className="text-slate-600 text-xs mb-2">Related Pages</div>
                    {['Scope and Closures', 'Lexical Environment', 'IIFE Pattern'].map(l => (
                        <div key={l} className="flex items-center gap-2 py-2 text-xs text-blue-400 cursor-pointer hover:text-blue-300 transition-colors">
                            <BookOpen size={10} /> {l}
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-white/5">
                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-semibold hover:bg-blue-600/30 transition-all">
                        <Volume2 size={14} /> Read Aloud
                    </button>
                </div>
            </div>
        </div>
    )
}
