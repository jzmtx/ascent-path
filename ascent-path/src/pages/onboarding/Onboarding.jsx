import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Plus, X, Upload, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

const STEPS = ['Profile', 'Skills', 'Experience', 'Resume'];

const SKILL_CHIPS = [
    'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
    'Node.js', 'Python', 'Django', 'FastAPI', 'SQL', 'PostgreSQL', 'MongoDB',
    'Git', 'Docker', 'REST APIs', 'GraphQL', 'AWS', 'Linux', 'Redis', 'Figma',
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [profSummary, setProfSummary] = useState('');
    const [currentRole, setCurrentRole] = useState('');
    const [githubUrl, setGithubUrl] = useState('');

    const [selectedSkills, setSelectedSkills] = useState([]);
    const [customSkill, setCustomSkill] = useState('');
    const [level, setLevel] = useState('Beginner');
    const [certs, setCerts] = useState([{ name: '', issuer: '', year: '' }]);
    const [projects, setProjects] = useState([{ title: '', tech: '', url: '' }]);
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const toggleSkill = (skill) => {
        setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
    };

    const addCustomSkill = () => {
        if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
            setSelectedSkills(prev => [...prev, customSkill.trim()]);
            setCustomSkill('');
        }
    };

    const handleFinish = async () => {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        try {
            const payload = {
                full_name: fullName,
                phone: phone,
                location: location,
                linkedin_url: linkedinUrl,
                github_url: githubUrl,
                professional_summary: profSummary,
                skills: selectedSkills.map(name => ({ name })),
                level: level.toLowerCase(),
                certifications: certs.filter(c => c.name.trim()),
                projects: projects.filter(p => p.title.trim()).map(p => ({
                    title: p.title, tech: p.tech, url: p.url,
                })),
            };
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/profile/onboarding/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            localStorage.setItem('onboarding', JSON.stringify({ selectedSkills, level }));
        } catch (err) {
            console.error('Onboarding save failed:', err);
        } finally {
            navigate('/initial-assessment');
        }
    };

    const progress = (step / STEPS.length) * 100;

    return (
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Bg glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-orange-500/4 blur-[120px]" />
            </div>

            <div className="w-full max-w-2xl relative z-10">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-8">
                    <Zap className="w-5 h-5 text-orange-400" />
                    <span className="text-lg font-bold text-white">Ascent<span className="text-orange-400">Path</span></span>
                </div>

                {/* Step indicators */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        {STEPS.map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${i + 1 < step ? 'bg-blue-600 text-white' : i + 1 === step ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]' : 'bg-white/10 text-slate-500'}`}>
                                    {i + 1 < step ? '✓' : i + 1}
                                </div>
                                <span className={`text-sm hidden sm:block ${i + 1 === step ? 'text-orange-400 font-medium' : i + 1 < step ? 'text-blue-400' : 'text-slate-500'}`}>{s}</span>
                                {i < STEPS.length - 1 && <div className="w-8 sm:w-16 h-px bg-white/10 mx-2" />}
                            </div>
                        ))}
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-right">Step {step} of {STEPS.length}</p>
                </div>

                {/* Card */}
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                    {/* STEP 1 — Profile */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Complete your profile</h2>
                            <p className="text-slate-400 text-sm mb-7">Tell us about yourself so we can personalize your experience</p>
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. John Doe"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 890"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 transition-all" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">GitHub URL</label>
                                        <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn URL</label>
                                        <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Professional Summary</label>
                                    <textarea rows={3} value={profSummary} onChange={e => setProfSummary(e.target.value)} placeholder="A short intro about yourself and what you're aiming for..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 transition-all resize-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2 — Skills */}
                    {step === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">What skills do you currently have?</h2>
                            <p className="text-slate-400 text-sm mb-6 flex items-center gap-2">
                                <span className="text-orange-400">⚡</span>
                                Be honest — we'll verify these in your initial assessment
                            </p>
                            <div className="flex flex-wrap gap-2 mb-5">
                                {SKILL_CHIPS.map(skill => (
                                    <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200
                      ${selectedSkills.includes(skill)
                                                ? 'bg-orange-500/20 border-orange-500/60 text-orange-300 shadow-[0_0_8px_rgba(249,115,22,0.2)]'
                                                : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30 hover:text-white'}`}>
                                        {skill}
                                    </button>
                                ))}
                            </div>
                            {/* Custom skill */}
                            <div className="flex gap-2 mb-6">
                                <input value={customSkill} onChange={e => setCustomSkill(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
                                    placeholder="+ Add custom skill..."
                                    className="flex-1 bg-white/5 border border-dashed border-white/20 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all" />
                                <button onClick={addCustomSkill}
                                    className="px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition-all">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            {selectedSkills.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs text-slate-400 mb-2">Selected ({selectedSkills.length}):</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedSkills.map(s => (
                                            <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs">
                                                {s}
                                                <button onClick={() => toggleSkill(s)}><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-3">Rate your overall level:</p>
                                <div className="flex gap-3">
                                    {LEVELS.map(l => (
                                        <button key={l} onClick={() => setLevel(l)}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all
                        ${level === l
                                                    ? 'bg-orange-500/20 border-orange-500/60 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                                                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'}`}>
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 — Experience */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Certifications & Projects</h2>
                            <p className="text-slate-400 text-sm mb-7">These will appear on your verified resume</p>
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-slate-300">Certifications</h3>
                                    <button onClick={() => setCerts([...certs, { name: '', issuer: '', year: '' }])}
                                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                        <Plus className="w-3 h-3" /> Add
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {certs.map((c, i) => (
                                        <div key={i} className="grid grid-cols-3 gap-2">
                                            <input placeholder="Cert name" value={c.name}
                                                onChange={e => { const n = [...certs]; n[i].name = e.target.value; setCerts(n); }}
                                                className="col-span-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 transition-all" />
                                            <input placeholder="Issuer (e.g. Google)" value={c.issuer}
                                                onChange={e => { const n = [...certs]; n[i].issuer = e.target.value; setCerts(n); }}
                                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 transition-all" />
                                            <input placeholder="Year" value={c.year}
                                                onChange={e => { const n = [...certs]; n[i].year = e.target.value; setCerts(n); }}
                                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 transition-all" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-slate-300">Projects</h3>
                                    <button onClick={() => setProjects([...projects, { title: '', tech: '', url: '' }])}
                                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                        <Plus className="w-3 h-3" /> Add
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {projects.map((p, i) => (
                                        <div key={i} className="grid grid-cols-3 gap-2">
                                            <input placeholder="Project title" value={p.title}
                                                onChange={e => { const n = [...projects]; n[i].title = e.target.value; setProjects(n); }}
                                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 transition-all" />
                                            <input placeholder="Tech stack" value={p.tech}
                                                onChange={e => { const n = [...projects]; n[i].tech = e.target.value; setProjects(n); }}
                                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 transition-all" />
                                            <input placeholder="GitHub URL" value={p.url}
                                                onChange={e => { const n = [...projects]; n[i].url = e.target.value; setProjects(n); }}
                                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 transition-all" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4 — Resume */}
                    {step === 4 && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Upload your resume</h2>
                            <p className="text-slate-400 text-sm mb-8">Our AI will extract your skills and experience automatically</p>
                            <label className="block border-2 border-dashed border-white/20 hover:border-orange-500/40 rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 group">
                                <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                                    onChange={e => setResumeFile(e.target.files[0])} />
                                <Upload className="w-10 h-10 text-slate-500 group-hover:text-orange-400 mx-auto mb-4 transition-colors" />
                                {resumeFile
                                    ? <><p className="text-orange-300 font-medium">{resumeFile.name}</p><p className="text-slate-500 text-sm mt-1">Click to change</p></>
                                    : <><p className="text-slate-300 font-medium">Drop your resume here</p><p className="text-slate-500 text-sm mt-1">PDF, DOC, DOCX — up to 5MB</p></>
                                }
                            </label>
                            <p className="text-center text-sm text-slate-500 mt-5">
                                or{' '}
                                <button onClick={handleFinish} className="text-blue-400 hover:text-blue-300 underline">skip this step →</button>
                            </p>
                            <div className="mt-6 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-orange-400" />
                                    <span className="text-sm font-medium text-orange-300">What happens next</span>
                                </div>
                                <p className="text-slate-400 text-sm">
                                    After resuming, you'll take a quick 10-question skill verification assessment based on the skills you selected. This verifies your profile and unlocks your personalized roadmap.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                        <button onClick={() => setStep(s => s - 1)} disabled={step === 1}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all disabled:opacity-30">
                            <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <span className="text-xs text-slate-500">Step {step} of {STEPS.length}</span>
                        {step < STEPS.length
                            ? <button onClick={() => setStep(s => s + 1)}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 shadow-lg shadow-orange-500/20 transition-all">
                                Continue <ChevronRight className="w-4 h-4" />
                            </button>
                            : <button onClick={handleFinish} disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50">
                                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Start Assessment <ChevronRight className="w-4 h-4" /></>}
                            </button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
