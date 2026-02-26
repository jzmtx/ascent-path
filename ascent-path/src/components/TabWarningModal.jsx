import { motion, AnimatePresence } from 'framer-motion'

// The eye image from our generation
const EYE_IMAGE = '/warning-eye.jpg'

// Warning level configs — matches Stitch design: amber first, red final
const CONFIGS = {
    1: {
        imageFilter: 'sepia(0.4) saturate(1.8) hue-rotate(10deg)',
        gradientFrom: 'rgba(251, 146, 60, 0.7)',   // amber
        gradientTo: 'rgba(15, 10, 5, 1)',
        borderColor: '#f97316',
        glowColor: 'rgba(249, 115, 22, 0.25)',
        pulseColor: 'rgba(249, 115, 22, 0.15)',
        filledSegments: 1,
        segmentColor: '#f97316',
        headline: 'We Caught You',
        subtitle: 'Tab switching detected. Your focus is your superpower — use it.',
        buttonText: 'Back to the zone →',
        buttonClass: 'from-amber-500 to-orange-500',
        footerText: 'Next switch = final warning',
        footerColor: 'text-orange-300',
        label: '1 of 3 warnings',
    },
    2: {
        imageFilter: 'sepia(0.6) saturate(2) hue-rotate(300deg)',
        gradientFrom: 'rgba(220, 38, 38, 0.75)',    // crimson
        gradientTo: 'rgba(10, 5, 5, 1)',
        borderColor: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.3)',
        pulseColor: 'rgba(239, 68, 68, 0.15)',
        filledSegments: 2,
        segmentColor: '#ef4444',
        headline: 'Last Chance',
        subtitle: 'One more switch and your assessment auto-submits. Stay in the arena.',
        buttonText: "I'm focused now →",
        buttonClass: 'from-red-600 to-red-700',
        footerText: 'Next switch = auto-submit',
        footerColor: 'text-red-400',
        label: '2 of 3 warnings',
    },
}

export default function TabWarningModal({ level, tabSwitches, onDismiss }) {
    const cfg = CONFIGS[level]
    if (!cfg) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            >
                {/* Radial bg glow */}
                <motion.div
                    animate={{ opacity: [0.4, 0.7, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${cfg.glowColor}, transparent 70%)` }}
                />

                <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    className="relative max-w-[480px] w-full mx-4 rounded-2xl overflow-hidden"
                    style={{ background: '#0c0c14' }}
                >
                    {/* Animated border */}
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: level === 2 ? 1.2 : 2 }}
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                            boxShadow: `0 0 0 1.5px ${cfg.borderColor}, 0 0 30px ${cfg.glowColor}`,
                            zIndex: 0,
                        }}
                    />

                    {/* Eye image */}
                    <div className="relative h-52 overflow-hidden">
                        <img
                            src={EYE_IMAGE}
                            alt=""
                            className="w-full h-full object-cover"
                            style={{ filter: cfg.imageFilter }}
                        />
                        {/* Gradient overlay blending image into card */}
                        <div
                            className="absolute inset-0"
                            style={{ background: `linear-gradient(to bottom, transparent 30%, ${cfg.gradientFrom} 60%, ${cfg.gradientTo} 100%)` }}
                        />
                        {/* Pulse overlay on the image */}
                        <motion.div
                            animate={{ opacity: [0, 0.3, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0"
                            style={{ background: cfg.pulseColor }}
                        />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 px-8 pb-8 -mt-2">
                        {/* Headline */}
                        <motion.h2
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-[28px] font-black text-white mb-2 tracking-tight"
                        >
                            {cfg.headline}
                        </motion.h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-5">{cfg.subtitle}</p>

                        {/* 3-segment warning progress */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-500 font-medium">{cfg.label}</span>
                                <span className="text-xs text-slate-600">{tabSwitches} / 3</span>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3].map(i => (
                                    <motion.div
                                        key={i}
                                        initial={i <= cfg.filledSegments ? { scaleX: 0 } : {}}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: i * 0.08, type: 'spring', stiffness: 400 }}
                                        className="flex-1 h-1.5 rounded-full origin-left"
                                        style={{
                                            background: i <= cfg.filledSegments ? cfg.segmentColor : 'rgba(255,255,255,0.1)',
                                            boxShadow: i <= cfg.filledSegments ? `0 0 8px ${cfg.segmentColor}` : 'none',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* CTA button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onDismiss}
                            className={`w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r ${cfg.buttonClass} transition-all shadow-lg mb-3`}
                            style={{ boxShadow: `0 4px 20px ${cfg.glowColor}` }}
                        >
                            {cfg.buttonText}
                        </motion.button>

                        <p className={`text-center text-xs ${cfg.footerColor}`}>{cfg.footerText}</p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
