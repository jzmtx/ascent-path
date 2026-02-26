import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Send, CheckCircle, XCircle, Timer } from 'lucide-react'

const problem = `## Closures — Implement a Counter Factory

Create a function \`makeCounter\` that:
- Returns a counter object with \`increment\`, \`decrement\`, and \`getCount\` methods
- Each counter instance maintains its own independent count (starts at 0)
- Uses closures to achieve private state

**Example:**
\`\`\`js
const c1 = makeCounter();
c1.increment(); // 1
c1.increment(); // 2
const c2 = makeCounter();
c2.increment(); // 1 (independent)
\`\`\`
**Constraints:** No class syntax. Use closures only.`

const starterCode = `function makeCounter() {
  // Your implementation here
  
}`

const testCases = [
    { id: 1, label: 'Basic increment', status: 'pass' },
    { id: 2, label: 'Independent instances', status: 'pass' },
    { id: 3, label: 'Decrement method', status: 'pending' },
    { id: 4, label: 'Get count returns number', status: 'pending' },
]

export default function Assessment() {
    const [code, setCode] = useState(starterCode)
    const [timeLeft, setTimeLeft] = useState(28 * 60 + 43)
    const [tabSwitches] = useState(0)
    const [pasteAttempts] = useState(0)
    const [focusLoss] = useState(1)

    useEffect(() => {
        const t = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000)
        return () => clearInterval(t)
    }, [])

    const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

    const passedCount = testCases.filter(t => t.status === 'pass').length

    return (
        <div className="pt-16 h-screen flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="glass-blue border-b border-blue-500/15 px-6 h-14 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <h1 className="text-white font-bold">Assessment: JavaScript Closures</h1>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400">Intermediate</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-slate-400">PROCTORED</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/30 node-pulse">
                        <Timer size={14} className="text-orange-400" />
                        <span className="text-orange-300 font-mono font-bold text-sm">{fmt(timeLeft)}</span>
                    </div>
                </div>
            </div>

            {/* Main Split */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Problem + Editor */}
                <div className="flex-1 flex flex-col border-r border-white/5">
                    {/* Problem */}
                    <div className="h-44 overflow-y-auto p-4 border-b border-white/5">
                        <div className="text-slate-300 text-xs leading-relaxed font-mono whitespace-pre-wrap">
                            {problem.replace(/\*\*/g, '').replace(/```js\n/g, '').replace(/\n```/g, '')}
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-1 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-4 gap-4 bg-white/3 border-b border-white/5">
                            <span className="text-xs text-slate-500">solution.js</span>
                        </div>
                        <textarea
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            className="absolute inset-0 top-8 w-full h-[calc(100%-2rem)] resize-none bg-transparent text-orange-200 font-mono text-sm p-4 focus:outline-none leading-relaxed"
                            style={{ caretColor: '#F97316' }}
                            spellCheck={false}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="h-14 flex items-center gap-3 px-4 border-t border-white/5 flex-shrink-0">
                        <button className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-semibold px-5 py-2 rounded-lg text-sm transition-all">
                            <Play size={14} /> Run Tests
                        </button>
                        <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black font-bold px-5 py-2 rounded-lg text-sm transition-all glow-orange">
                            Submit Solution
                        </button>
                        <div className="ml-auto text-xs text-slate-600">
                            {passedCount}/{testCases.length} tests passing
                        </div>
                    </div>
                </div>

                {/* Right: Panels */}
                <div className="w-80 flex flex-col overflow-hidden">
                    {/* Test Cases */}
                    <div className="p-4 border-b border-white/5 flex-shrink-0">
                        <h3 className="text-white text-xs font-bold mb-3">Test Cases</h3>
                        <div className="space-y-2">
                            {testCases.map(tc => (
                                <div key={tc.id} className="flex items-center gap-2 text-xs">
                                    {tc.status === 'pass' ? (
                                        <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                                    ) : (
                                        <XCircle size={14} className="text-slate-600 flex-shrink-0" />
                                    )}
                                    <span className={tc.status === 'pass' ? 'text-slate-400' : 'text-slate-600'}>{tc.label}</span>
                                </div>
                            ))}
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(passedCount / testCases.length) * 100}%` }}
                                className="h-full bg-orange-500 rounded-full"
                            />
                        </div>
                    </div>

                    {/* Behavioral Monitor */}
                    <div className="p-4 border-b border-white/5 flex-shrink-0">
                        <h3 className="text-white text-xs font-bold mb-3">Behavioral Monitor</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Tab Switches', val: tabSwitches, ok: tabSwitches === 0 },
                                { label: 'Paste Attempts', val: pasteAttempts, ok: pasteAttempts === 0 },
                                { label: 'Focus Loss', val: focusLoss, ok: focusLoss <= 1 },
                                { label: 'Speed', val: 'Normal', ok: true },
                            ].map(({ label, val, ok }) => (
                                <div key={label} className="bg-white/5 rounded-lg p-2 text-xs">
                                    <div className="text-slate-500">{label}</div>
                                    <div className={`font-bold mt-0.5 ${ok ? 'text-green-400' : 'text-red-400'}`}>{val}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hints — Locked */}
                    <div className="p-4 flex-shrink-0">
                        <div className="glass rounded-xl p-3 text-center cursor-pointer border border-orange-500/20">
                            <div className="text-xl mb-1">🔒</div>
                            <div className="text-orange-400 text-xs font-bold">Hints Available</div>
                            <div className="text-slate-500 text-xs mt-1">Costs confidence points</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
