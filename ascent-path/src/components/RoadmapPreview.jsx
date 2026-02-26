import { motion } from 'framer-motion'

// Animated roadmap graph for the hero section
const nodes = [
    { id: 1, label: 'HTML', x: 10, y: 50, done: true },
    { id: 2, label: 'CSS', x: 28, y: 25, done: true },
    { id: 3, label: 'JS', x: 50, y: 55, active: true },
    { id: 4, label: 'React', x: 70, y: 20, locked: true },
    { id: 5, label: 'TypeScript', x: 88, y: 55, locked: true },
]

const edges = [
    [1, 2], [2, 3], [3, 4], [4, 5], [1, 3], [3, 5]
]

export default function RoadmapPreview() {
    const W = 400, H = 260

    const getPos = (node) => ({
        cx: (node.x / 100) * W,
        cy: (node.y / 100) * H
    })

    return (
        <div className="glass rounded-3xl p-6 glow-orange relative overflow-hidden">
            <div className="text-xs text-orange-400 font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                Live Roadmap Preview
            </div>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
                {/* Render edges */}
                {edges.map(([fromId, toId]) => {
                    const from = nodes.find(n => n.id === fromId)
                    const to = nodes.find(n => n.id === toId)
                    const fp = getPos(from), tp = getPos(to)
                    const isDone = from.done && to.done
                    const isActive = from.active || to.active
                    return (
                        <motion.line
                            key={`${fromId}-${toId}`}
                            x1={fp.cx} y1={fp.cy} x2={tp.cx} y2={tp.cy}
                            stroke={isDone ? '#2563EB' : isActive ? '#F97316' : '#ffffff15'}
                            strokeWidth={1.5}
                            strokeDasharray={isDone || isActive ? '0' : '4 4'}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.2, delay: 0.3 }}
                        />
                    )
                })}

                {/* Render nodes */}
                {nodes.map((node) => {
                    const { cx, cy } = getPos(node)
                    return (
                        <g key={node.id}>
                            {node.active && (
                                <motion.circle
                                    cx={cx} cy={cy} r={28}
                                    fill="rgba(249,115,22,0.15)"
                                    animate={{ r: [24, 32, 24] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            )}
                            <circle
                                cx={cx} cy={cy} r={18}
                                fill={node.done ? '#1D4ED8' : node.active ? '#F97316' : '#1a1a2e'}
                                stroke={node.done ? '#3B82F6' : node.active ? '#FB923C' : '#ffffff20'}
                                strokeWidth={1.5}
                            />
                            <text
                                x={cx} y={cy + 1}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="white"
                                fontSize={8}
                                fontWeight="bold"
                                fontFamily="Inter, sans-serif"
                            >
                                {node.done ? '✓' : node.active ? '▶' : '🔒'}
                            </text>
                            <text
                                x={cx} y={cy + 28}
                                textAnchor="middle"
                                fill={node.done ? '#93C5FD' : node.active ? '#FED7AA' : '#4B5563'}
                                fontSize={9}
                                fontWeight="600"
                                fontFamily="Inter, sans-serif"
                            >
                                {node.label}
                            </text>
                        </g>
                    )
                })}
            </svg>

            {/* Legend */}
            <div className="flex gap-4 mt-4 text-xs">
                <span className="flex items-center gap-1.5 text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500" />Completed</span>
                <span className="flex items-center gap-1.5 text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-500" />Active</span>
                <span className="flex items-center gap-1.5 text-slate-600"><span className="w-2 h-2 rounded-full bg-slate-700" />Locked</span>
            </div>
        </div>
    )
}
