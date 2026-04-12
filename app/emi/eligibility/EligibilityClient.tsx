"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    CheckCircle,
    ChevronDown,
    Briefcase,
    Building2,
    Clock,
    ArrowRight,
    ShoppingBag,
    FileText,
    ShieldCheck,
    GraduationCap,
    Users,
    TrendingUp,
    CircleAlert,
    BadgeCheck,
    Banknote,
    Phone,
    UserCheck,
    Sparkles,
    Star,
    ChevronUp,
    MessageCircle,
    Search,
    X,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const BasketCard = dynamic(() => import('@/app/homepage/BasketCard'), { ssr: false });

// ─── Constants ────────────────────────────────────────────────────────────────

const INCOME_PRESETS = [15000, 25000, 40000, 60000, 100000];

const JOB_TYPE_OPTIONS = [
    { value: 'salaried', label: 'Salaried Employee', sub: 'Government or Private Job', icon: '🏢' },
    { value: 'student', label: 'Student', sub: 'College / University Enrolled', icon: '🎓' },
    { value: 'business', label: 'Business Owner', sub: 'Self-Employed / Entrepreneur', icon: '📊' },
    { value: 'freelancer', label: 'Freelancer', sub: 'Independent Professional', icon: '💻' },
];

const EXPERIENCE_OPTIONS = ['Less than 1 Year', '1–2 Years', '2–5 Years', '5–10 Years', '10+ Years'];

const NAV_LINKS = [
    { label: 'Calculator', href: '#emi-calculator' },
    { label: 'iPhones on EMI', href: '#emi-phones' },
    { label: 'Salaried', href: '#emi-eligibility-salaried' },
    { label: 'Student', href: '#emi-eligibility-student' },
    { label: 'Business', href: '#emi-eligibility-business' },
    { label: 'Guarantor', href: '#emi-eligibility-guarantor' },
    { label: 'FAQ', href: '#emi-faq' },
];

const FAQS = [
    { q: 'What is the minimum salary required for EMI in Nepal?', a: 'For salaried employees, the minimum required gross monthly income is NPR 15,000. Business owners, freelancers, and guarantors need at least NPR 25,000 per month in verifiable income.' },
    { q: 'Can students apply for EMI at Fatafat Sewa?', a: 'Yes. Students aged 18–30 who are enrolled at a recognised college or university can apply for EMI, provided a parent or legal guardian with a stable income co-signs the application as a guarantor.' },
    { q: 'How long does EMI approval take?', a: 'Our partner banks typically verify all submitted documents and issue an approval decision within 24 hours on working days. Once approved, you can purchase your product immediately.' },
    { q: 'Does checking my EMI eligibility affect my credit score?', a: 'No. Using our eligibility calculator is a soft check only and does not affect your credit score in any way.' },
    { q: 'Can a business owner apply for EMI without a salary slip?', a: 'Yes. Business owners can substitute salary slips with 6 months of business bank statements, a PAN/VAT certificate, and a business registration document. A tax clearance or audit report is optional but highly recommended.' },
    { q: 'Is there any processing fee or hidden charge for EMI?', a: 'Fatafat Sewa does not charge any processing fees. The EMI offered is 0% No-Cost — you pay only for the product, split into equal monthly instalments.' },
    { q: 'What documents does a guarantor need to provide?', a: 'A guarantor must provide their Citizenship Certificate, 3 months of salary slips or income proof, 3 months of bank statements, a passport photo, and a signed Relationship Declaration Form (available at our office).' },
    { q: 'Which banks are partnered with Fatafat Sewa for EMI?', a: 'Fatafat Sewa works with leading Nepali banks and financial institutions. Final approval is at the sole discretion of the partner bank based on your submitted documents.' },
];

// ─── Eligibility Engine ────────────────────────────────────────────────────────

interface EligibilityResult {
    eligible: boolean;
    maxEmi: number;
    maxEligible: number;
    tenure: number;
    reason?: string;
    warnings: string[];
    tips: string[];
}

function computeEligibility(jobType: string, income: number, guarantorIncome: number, experience: string): EligibilityResult {
    const warnings: string[] = [];
    const tips: string[] = [];
    const tenure = 12;

    if (jobType === 'student') {
        if (guarantorIncome < 25000) {
            return {
                eligible: false, maxEmi: 0, maxEligible: 0, tenure,
                reason: `Your guarantor's monthly income (NPR ${guarantorIncome.toLocaleString()}) is below the minimum of NPR 25,000 required for student EMI applications.`,
                warnings: ['Guarantor income must be at least NPR 25,000/month.'],
                tips: ['Ask a parent or senior family member with a higher income to co-sign.', 'Consider saving for a down payment to reduce the EMI amount needed.'],
            };
        }
        const maxEmi = Math.round(guarantorIncome * 0.4);
        if (maxEmi < 2000) warnings.push('Your guarantor\'s EMI capacity is low. Consider products under NPR 24,000.');
        tips.push('Apply with your college enrollment certificate and your parent\'s bank statements.');
        tips.push('A good guarantor income improves your approval speed.');
        return { eligible: true, maxEmi, maxEligible: maxEmi * tenure, tenure, warnings, tips };
    }

    const effectiveIncome = jobType === 'salaried' ? income : income;
    const minRequired = jobType === 'salaried' ? 15000 : 25000;

    if (effectiveIncome < minRequired) {
        return {
            eligible: false, maxEmi: 0, maxEligible: 0, tenure,
            reason: `Your monthly income (NPR ${effectiveIncome.toLocaleString()}) is below the minimum of NPR ${minRequired.toLocaleString()} required for ${jobType === 'salaried' ? 'salaried' : 'self-employed / business'} applicants.`,
            warnings: [`Minimum income for this category is NPR ${minRequired.toLocaleString()}/month.`],
            tips: ['Consider applying with a guarantor to supplement your income.', 'Build your income to the minimum threshold and apply again.'],
        };
    }

    const emiRate = jobType === 'salaried' ? 0.5 : 0.4;
    const maxEmi = Math.round(effectiveIncome * emiRate);

    if (experience === 'Less than 1 Year') {
        warnings.push('Less than 1 year of experience may affect approval. Some banks require 6+ months at the current employer.');
        tips.push('An employment verification letter significantly improves approval chances.');
    }
    if (jobType === 'business') {
        tips.push('Provide your last 6 months of business bank statements for a stronger application.');
        tips.push('A PAN/VAT certificate is mandatory. A tax clearance report boosts your limit.');
    }
    if (jobType === 'freelancer') {
        warnings.push('Freelancers must provide consistent bank deposits as income proof. Irregular income may reduce the approved limit.');
        tips.push('Maintain clear bank records showing regular monthly income for 6+ months.');
    }
    if (jobType === 'salaried') {
        tips.push('Government employees are given priority approval — mention your employer type in your application.');
    }

    return { eligible: true, maxEmi, maxEligible: maxEmi * tenure, tenure, warnings, tips };
}

// ─── CriteriaItem / DocList / EligibilitySection ─────────────────────────────

interface CriteriaItem { icon: React.ReactNode; title: string; detail: string }

function DocList({ items, dotColor }: { items: string[]; dotColor: string }) {
    return (
        <ul className="space-y-2.5">
            {items.map((doc, i) => (
                <li key={i} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${dotColor}`}>
                        <CheckCircle className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-gray-600 leading-relaxed">{doc}</span>
                </li>
            ))}
        </ul>
    );
}

function CriteriaList({ items }: { items: CriteriaItem[] }) {
    return (
        <ul className="space-y-4">
            {items.map((c, i) => (
                <li key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">{c.icon}</div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">{c.title}</p>
                        <p className="text-sm text-gray-500 leading-relaxed mt-0.5">{c.detail}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

function EligibilitySection({ id, icon, label, sublabel, minIncome, accentColor, accentBg, description, criteria, documents, note, dotColor }: {
    id: string; icon: React.ReactNode; label: string; sublabel: string; minIncome: string;
    accentColor: string; accentBg: string; description: string; criteria: CriteriaItem[]; documents: string[]; note: string; dotColor: string;
}) {
    return (
        <section id={id} aria-label={`EMI eligibility: ${label}`} className="py-14 px-4 sm:px-8">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-80 xl:w-96 shrink-0">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 ${accentBg} ${accentColor}`}>{icon}<span>{label}</span></div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">{sublabel}</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Min. Income: <span className="text-gray-600">{minIncome}</span></p>
                        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2"><BadgeCheck className="w-3.5 h-3.5" /> Requirements</h3>
                            <CriteriaList items={criteria} />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Documents Needed</h3>
                            <DocList items={documents} dotColor={dotColor} />
                            {note && (
                                <div className="mt-5 flex items-start gap-2.5">
                                    <CircleAlert className={`w-4 h-4 shrink-0 mt-0.5 ${accentColor}`} />
                                    <p className={`text-xs leading-relaxed ${accentColor}`}>{note}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button onClick={() => setOpen(p => !p)} className="w-full flex items-start justify-between gap-4 py-5 text-left group" aria-expanded={open}>
                <span className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-gray-900 leading-snug">{q}</span>
                <span className="shrink-0 mt-0.5">{open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</span>
            </button>
            {open && <p className="text-sm text-gray-500 leading-relaxed pb-5 animate-in fade-in slide-in-from-top-2 duration-200">{a}</p>}
        </div>
    );
}

// ─── Product Search Modal ─────────────────────────────────────────────────────

interface SearchProduct { id: number; name: string; slug: string; price: number; emi_price?: number; thumbnail?: string; brand?: { name: string } }

function ProductSearchModal({ onClose, onSelect }: { onClose: () => void; onSelect: (p: SearchProduct) => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const doSearch = useCallback(async (q: string) => {
        if (!q.trim()) { setResults([]); setSearched(false); return; }
        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`/api/products/search?search=${encodeURIComponent(q)}&emi_available=true&per_page=12`);
            if (res.ok) {
                const json = await res.json();
                const raw = json?.data?.products ?? json?.data ?? json?.products ?? [];
                setResults(raw);
            }
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => doSearch(query), 400);
        return () => clearTimeout(t);
    }, [query, doSearch]);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full sm:max-w-xl bg-white sm:rounded-2xl flex flex-col max-h-[90dvh] sm:max-h-[80vh] animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-100 shrink-0">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products available on EMI…"
                        className="flex-1 text-sm font-medium text-gray-800 placeholder-gray-400 outline-none bg-transparent" />
                    {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />}
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"><X className="w-4 h-4 text-gray-500" /></button>
                </div>

                {/* Results */}
                <div className="overflow-y-auto flex-1 p-3">
                    {!searched && (
                        <div className="py-10 text-center">
                            <ShoppingBag className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                            <p className="text-sm text-gray-400 font-medium">Type to search EMI-eligible products</p>
                            <p className="text-xs text-gray-300 mt-1">Phones, laptops, accessories & more</p>
                        </div>
                    )}
                    {searched && !loading && results.length === 0 && (
                        <div className="py-10 text-center">
                            <p className="text-sm text-gray-400 font-medium">No products found for &quot;{query}&quot;</p>
                            <p className="text-xs text-gray-300 mt-1">Try a different keyword or browse our <Link href="/emi/shop" onClick={onClose} className="text-[var(--colour-fsP2)] underline">EMI shop</Link></p>
                        </div>
                    )}
                    {results.length > 0 && (
                        <ul className="space-y-1">
                            {results.map(p => (
                                <li key={p.id}>
                                    <button onClick={() => onSelect(p)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                            {p.thumbnail
                                                ? <Image src={p.thumbnail} alt={p.name} width={48} height={48} className="object-contain w-full h-full" />
                                                : <ShoppingBag className="w-5 h-5 text-gray-300" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-gray-900">{p.name}</p>
                                            {p.brand?.name && <p className="text-xs text-gray-400">{p.brand.name}</p>}
                                            <p className="text-xs font-bold text-[var(--colour-fsP2)] mt-0.5">NPR {(p.emi_price ?? p.price).toLocaleString()}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--colour-fsP2)] shrink-0 transition-colors" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 shrink-0 flex items-center justify-between">
                    <p className="text-xs text-gray-400">Can&apos;t find your product?</p>
                    <Link href="/emi/shop" onClick={onClose} className="text-xs font-bold text-[var(--colour-fsP2)] hover:underline flex items-center gap-1">
                        Browse EMI Shop <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props { iphoneInitialData?: { products?: any[] } }

interface CalcState {
    jobType: string;
    income: string;
    guarantorIncome: string;
    experience: string;
    showResult: boolean;
}

export default function EligibilityClient({ iphoneInitialData }: Props) {
    const router = useRouter();
    const [calc, setCalc] = useState<CalcState>({ jobType: 'salaried', income: '40000', guarantorIncome: '30000', experience: '2–5 Years', showResult: false });
    const [navOpen, setNavOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const updateCalc = (u: Partial<CalcState>) => setCalc(p => ({ ...p, ...u }));

    const income = Math.max(0, parseInt(calc.income.replace(/[^0-9]/g, ''), 10) || 0);
    const guarantorIncome = Math.max(0, parseInt(calc.guarantorIncome.replace(/[^0-9]/g, ''), 10) || 0);

    const result = useMemo(() => computeEligibility(calc.jobType, income, guarantorIncome, calc.experience), [calc.jobType, income, guarantorIncome, calc.experience]);

    const handleCheck = () => {
        updateCalc({ showResult: true });
        setTimeout(() => document.getElementById('eligibility-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleApply = () => setShowModal(true);

    const handleProductSelect = (p: SearchProduct) => {
        setShowModal(false);
        router.push(`/emi?slug=${p.slug}`);
    };

    const scrollTo = (href: string) => {
        setNavOpen(false);
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const isStudent = calc.jobType === 'student';

    return (
        <main className="min-h-screen bg-white">

            {/* ── HERO ── */}
            <section className="bg-gradient-to-br from-[var(--colour-fsP2)] via-[#1976D2] to-[#0D47A1] py-16 px-4 sm:px-8">
                <div className="max-w-[1400px] mx-auto">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mb-6">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                            <span className="text-xs font-bold text-white tracking-wide">No Credit Score Impact</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">EMI Eligibility in Nepal<br /><span className="text-blue-200 text-3xl sm:text-4xl">Check Your 0% EMI Approval Limit</span></h1>
                        <p className="text-base text-blue-100 leading-relaxed mb-8 max-w-xl">
                            Fatafat Sewa offers 0% No-Cost EMI on smartphones, laptops, and electronics across Nepal. Use our eligibility checker to instantly calculate how much you can buy on easy monthly instalments.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {['0% Interest', '24-hr Approval', 'Paperless Process', 'Nepal-wide'].map(tag => (
                                <span key={tag} className="bg-white/15 text-white text-xs font-bold px-4 py-1.5 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STICKY NAV ── */}
            <nav className="sticky top-0 z-30 bg-white border-b border-gray-100" aria-label="Page sections">
                <div className="hidden sm:block max-w-[1400px] mx-auto px-8">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0">
                        {NAV_LINKS.map(n => (
                            <button key={n.href} onClick={() => scrollTo(n.href)}
                                className="shrink-0 text-xs font-semibold text-gray-500 hover:text-[var(--colour-fsP2)] px-3 py-4 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-[var(--colour-fsP2)]">
                                {n.label}
                            </button>
                        ))}
                        <div className="ml-auto shrink-0">
                            <button onClick={handleApply} className="text-xs font-bold bg-[var(--colour-fsP2)] hover:bg-[#1565C0] text-white px-4 py-2 rounded-lg transition-all">
                                Apply Now
                            </button>
                        </div>
                    </div>
                </div>
                <div className="sm:hidden flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-bold text-gray-800">EMI Guide</span>
                    <button onClick={() => setNavOpen(p => !p)} className="text-xs font-semibold text-[var(--colour-fsP2)] flex items-center gap-1">
                        Sections {navOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                </div>
                {navOpen && (
                    <div className="sm:hidden border-t border-gray-100 bg-white px-4 pb-3 animate-in slide-in-from-top-2 duration-200">
                        {NAV_LINKS.map(n => (
                            <button key={n.href} onClick={() => scrollTo(n.href)}
                                className="block w-full text-left text-sm font-medium text-gray-600 hover:text-[var(--colour-fsP2)] py-2.5 border-b border-gray-50 last:border-0">
                                {n.label}
                            </button>
                        ))}
                        <button onClick={() => { setNavOpen(false); handleApply(); }}
                            className="block mt-3 w-full text-center text-sm font-bold bg-[var(--colour-fsP2)] text-white py-2.5 rounded-xl">
                            Apply Now
                        </button>
                    </div>
                )}
            </nav>

            {/* ── CALCULATOR ── */}
            <section id="emi-calculator" className="py-14 px-4 sm:px-8 bg-white" aria-label="EMI Eligibility Calculator">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* Left */}
                        <div className="lg:w-80 xl:w-96 shrink-0">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Instant Checker</p>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">Check Your Approval Limit</h2>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Enter your details below. The result is personalised based on your profile — salaried, student, or business owner.
                            </p>
                        </div>

                        {/* Right — form */}
                        <div className="flex-1 space-y-6">

                            {/* Job Type cards */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5" /> I am a…
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {JOB_TYPE_OPTIONS.map(opt => (
                                        <button key={opt.value} id={`jobtype-${opt.value}`} onClick={() => updateCalc({ jobType: opt.value, showResult: false })}
                                            className={`flex flex-col items-start gap-1 p-3.5 rounded-xl border-2 text-left transition-all duration-150 ${calc.jobType === opt.value ? 'border-[var(--colour-fsP2)] bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                                            <span className="text-xl">{opt.icon}</span>
                                            <span className={`text-xs font-bold ${calc.jobType === opt.value ? 'text-[var(--colour-fsP2)]' : 'text-gray-700'}`}>{opt.label}</span>
                                            <span className="text-[10px] text-gray-400 leading-snug">{opt.sub}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Income input */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                    <Banknote className="w-3.5 h-3.5" /> {isStudent ? 'Your Monthly Pocket Money (optional)' : 'Gross Monthly Income'}
                                </p>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">NPR</span>
                                    <input id="elig-income" type="text" inputMode="numeric"
                                        value={calc.income}
                                        onChange={e => updateCalc({ income: e.target.value.replace(/[^0-9]/g, ''), showResult: false })}
                                        placeholder="e.g. 40000"
                                        className="w-full bg-gray-50 rounded-xl pl-14 pr-4 py-3.5 text-sm font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                </div>
                                {/* Quick presets */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {INCOME_PRESETS.map(p => (
                                        <button key={p} onClick={() => updateCalc({ income: String(p), showResult: false })}
                                            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${parseInt(calc.income) === p ? 'bg-[var(--colour-fsP2)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                            {p >= 100000 ? '1 Lakh+' : `${(p / 1000).toFixed(0)}K`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Guarantor income — only for students */}
                            {isStudent && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" /> Guarantor's Gross Monthly Income
                                    </p>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">NPR</span>
                                        <input id="elig-guarantor-income" type="text" inputMode="numeric"
                                            value={calc.guarantorIncome}
                                            onChange={e => updateCalc({ guarantorIncome: e.target.value.replace(/[^0-9]/g, ''), showResult: false })}
                                            placeholder="e.g. 35000"
                                            className="w-full bg-gray-50 rounded-xl pl-14 pr-4 py-3.5 text-sm font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1.5">Minimum NPR 25,000 required. This is your parent or legal guardian&apos;s income.</p>
                                </div>
                            )}

                            {/* Experience */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> {isStudent ? 'Years of Study' : 'Work Experience'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {EXPERIENCE_OPTIONS.map(opt => (
                                        <button key={opt} onClick={() => updateCalc({ experience: opt, showResult: false })}
                                            className={`text-xs font-semibold px-3.5 py-2 rounded-full transition-all ${calc.experience === opt ? 'bg-[var(--colour-fsP2)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button id="check-eligibility-btn" onClick={handleCheck}
                                className="group relative overflow-hidden bg-[var(--colour-fsP2)] hover:bg-[#1565C0] text-white font-bold text-sm py-4 px-8 rounded-xl transition-all duration-300 active:scale-[0.99] flex items-center gap-2">
                                Check My Eligibility
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            </button>

                            {/* ── RESULT ── */}
                            {calc.showResult && (
                                <div id="eligibility-result" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-400 pt-2">
                                    {result.eligible ? (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                                    <CheckCircle className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <p className="text-base font-extrabold text-gray-900">You are Eligible!</p>
                                                    <p className="text-xs text-gray-400">Based on your {isStudent ? 'guarantor\'s' : ''} income & profile</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-t border-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Max. Product Value</p>
                                                    <p className="text-3xl font-extrabold text-[var(--colour-fsP2)] tracking-tight">NPR {result.maxEligible.toLocaleString()}</p>
                                                    <span className="text-[10px] font-bold text-[var(--colour-fsP2)] bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">No Cost EMI</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Monthly EMI Limit</p>
                                                    <p className="text-2xl font-extrabold text-gray-800">NPR {result.maxEmi.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Tenure</p>
                                                    <p className="text-2xl font-extrabold text-gray-800">{result.tenure} Months</p>
                                                </div>
                                            </div>

                                            {result.warnings.length > 0 && (
                                                <div className="flex items-start gap-2.5 bg-amber-50 rounded-xl p-3">
                                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                    <ul className="space-y-1">
                                                        {result.warnings.map((w, i) => <li key={i} className="text-xs text-amber-700">{w}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            {result.tips.length > 0 && (
                                                <div className="space-y-1.5">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tips to improve your approval</p>
                                                    <ul className="space-y-1">
                                                        {result.tips.map((t, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--colour-fsP2)] shrink-0 mt-1.5" />
                                                                {t}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                <button onClick={handleApply}
                                                    className="inline-flex items-center justify-center gap-2 bg-[var(--colour-fsP2)] hover:bg-[#1565C0] text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-all">
                                                    <Search className="w-4 h-4" /> Choose a Product & Apply
                                                </button>
                                                <Link href={`/emi/shop?budget=${result.maxEmi}`}
                                                    className="inline-flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-sm py-3.5 px-6 rounded-xl transition-all">
                                                    <ShoppingBag className="w-4 h-4" /> Browse Eligible Products
                                                </Link>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3 bg-red-50 rounded-xl p-4">
                                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-bold text-red-700 mb-1">Not Eligible Yet</p>
                                                    <p className="text-xs text-red-600 leading-relaxed">{result.reason}</p>
                                                </div>
                                            </div>
                                            {result.tips.length > 0 && (
                                                <div className="space-y-1.5">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">How to become eligible</p>
                                                    <ul className="space-y-1">
                                                        {result.tips.map((t, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0 mt-1.5" />
                                                                {t}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── iPHONES ON EMI ── */}
            <section id="emi-phones" className="py-14 px-4 sm:px-8 bg-gray-50" aria-label="iPhone on EMI in Nepal">
                <div className="max-w-[1400px] mx-auto">
                    <div className="mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">EMI · iPhone</p>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">iPhones Available on EMI</h2>
                        <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                            Browse the latest iPhones you can purchase on 0% No-Cost EMI from Fatafat Sewa. Approved applicants get instant dispatch across Nepal.
                        </p>
                    </div>
                    <BasketCard slug="mobile-price-in-nepal" title="iPhones on EMI" initialData={iphoneInitialData} isFirstSection={false} />
                </div>
            </section>

            {/* ── WHO CAN APPLY overview ── */}
            <section className="py-14 px-4 sm:px-8 bg-white" aria-label="EMI Eligibility Categories Nepal">
                <div className="max-w-[1400px] mx-auto">
                    <div className="max-w-2xl mb-10">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Eligibility</p>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">Who Can Apply for EMI in Nepal?</h2>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Fatafat Sewa EMI is designed to be inclusive. Whether you are a salaried employee, a student, a business owner, or applying with a guarantor — there is a clear path for you.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Salaried', sub: 'Govt & Private Job Holders', icon: <Briefcase className="w-6 h-6" />, color: 'text-blue-600', href: '#emi-eligibility-salaried' },
                            { label: 'Student', sub: 'With a Guarantor Co-Signer', icon: <GraduationCap className="w-6 h-6" />, color: 'text-violet-600', href: '#emi-eligibility-student' },
                            { label: 'Business Owner', sub: 'Self-Employed & Entrepreneurs', icon: <TrendingUp className="w-6 h-6" />, color: 'text-emerald-600', href: '#emi-eligibility-business' },
                            { label: 'Guarantor', sub: 'Co-Sign for Another Applicant', icon: <Users className="w-6 h-6" />, color: 'text-amber-600', href: '#emi-eligibility-guarantor' },
                        ].map(p => (
                            <button key={p.label} onClick={() => scrollTo(p.href)}
                                className="group flex flex-col gap-3 p-5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200 text-left">
                                <span className={p.color}>{p.icon}</span>
                                <div>
                                    <p className="text-sm font-extrabold text-gray-800 group-hover:text-gray-900">{p.label}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{p.sub}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all mt-auto" />
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <div className="h-px bg-gray-100 max-w-[1400px] mx-auto" />

            {/* ── PROFILE SECTIONS ── */}
            <EligibilitySection id="emi-eligibility-salaried"
                icon={<Briefcase className="w-3.5 h-3.5" />} label="Salaried" sublabel="Government & Private Employees"
                minIncome="NPR 15,000 / month" accentColor="text-blue-600" accentBg="bg-blue-50"
                description="Salaried workers — whether employed by the government, a private company, or an NGO — are the most commonly approved EMI applicants in Nepal. Your monthly pay slip is your strongest proof of repayment capacity. Government and permanent staff receive priority processing from our partner banks."
                criteria={[
                    { icon: <Banknote className="w-4 h-4 text-blue-600" />, title: 'Minimum Income', detail: 'Gross monthly salary of at least NPR 15,000' },
                    { icon: <Clock className="w-4 h-4 text-blue-600" />, title: 'Employment Duration', detail: 'Minimum 6 months in current job or organisation' },
                    { icon: <BadgeCheck className="w-4 h-4 text-blue-600" />, title: 'Age Requirement', detail: 'Applicant must be between 18 and 60 years of age' },
                    { icon: <Building2 className="w-4 h-4 text-blue-600" />, title: 'Work Location', detail: 'Must be employed within Nepal (Province 1–7)' },
                ]}
                documents={['Citizenship Certificate (front & back)', 'Latest 3 months Salary Slip', 'Latest 3 months Bank Statement', 'Employment Verification Letter', 'Passport Size Photo (white background)']}
                note="Government employees and permanent staff are given priority approval by our partner banks."
                dotColor="bg-blue-100 text-blue-600"
            />
            <div className="h-px bg-gray-100 max-w-[1400px] mx-auto" />

            <EligibilitySection id="emi-eligibility-student"
                icon={<GraduationCap className="w-3.5 h-3.5" />} label="Student" sublabel="College & University Students"
                minIncome="Guarantor Required" accentColor="text-violet-600" accentBg="bg-violet-50"
                description="Students in Nepal can apply for EMI on electronics without a personal income, as long as a parent or guardian with a stable income co-signs the application. This makes it easy for college students to get the smartphone or laptop they need — without a lump-sum payment upfront."
                criteria={[
                    { icon: <BadgeCheck className="w-4 h-4 text-violet-600" />, title: 'Age Requirement', detail: 'Applicant must be between 18 and 30 years of age' },
                    { icon: <GraduationCap className="w-4 h-4 text-violet-600" />, title: 'Active Enrollment', detail: 'Currently enrolled at a recognised college or university in Nepal' },
                    { icon: <UserCheck className="w-4 h-4 text-violet-600" />, title: 'Guarantor Required', detail: 'A parent or legal guardian with stable income must co-sign the application' },
                    { icon: <Banknote className="w-4 h-4 text-violet-600" />, title: 'Guarantor Income', detail: 'Guarantor gross monthly income must be at least NPR 25,000' },
                ]}
                documents={['Citizenship Certificate (front & back)', 'Valid College / University ID Card', 'Latest Enrollment Certificate', "Guarantor's Citizenship & Income Proof", 'Passport Size Photo (white background)']}
                note="Students without personal income require a qualified guarantor earning at least NPR 25,000/month for approval."
                dotColor="bg-violet-100 text-violet-600"
            />
            <div className="h-px bg-gray-100 max-w-[1400px] mx-auto" />

            <EligibilitySection id="emi-eligibility-business"
                icon={<TrendingUp className="w-3.5 h-3.5" />} label="Business Owner" sublabel="Self-Employed & Entrepreneurs"
                minIncome="NPR 25,000 / month" accentColor="text-emerald-600" accentBg="bg-emerald-50"
                description="Business owners, entrepreneurs, and self-employed professionals in Nepal can access EMI financing for electronics by demonstrating stable business income. Unlike salaried employees, you will need to provide business registration documents and bank statements. A tax clearance significantly strengthens your application."
                criteria={[
                    { icon: <Banknote className="w-4 h-4 text-emerald-600" />, title: 'Minimum Business Income', detail: 'Verifiable monthly net income of at least NPR 25,000' },
                    { icon: <Clock className="w-4 h-4 text-emerald-600" />, title: 'Business Vintage', detail: 'Business must have been operational for at least 1 year' },
                    { icon: <BadgeCheck className="w-4 h-4 text-emerald-600" />, title: 'Age Requirement', detail: 'Proprietor must be between 21 and 65 years of age' },
                    { icon: <Building2 className="w-4 h-4 text-emerald-600" />, title: 'Business Registration', detail: 'Must have a registered business with PAN or VAT certificate issued in Nepal' },
                ]}
                documents={['Citizenship Certificate (front & back)', 'Business Registration Certificate', 'PAN / VAT Certificate', 'Latest 6 months Business Bank Statement', 'Tax Clearance / Audit Report (if available)', 'Passport Size Photo (white background)']}
                note="Audit reports or tax clearance certificates significantly improve approval chances and may unlock higher EMI limits."
                dotColor="bg-emerald-100 text-emerald-600"
            />
            <div className="h-px bg-gray-100 max-w-[1400px] mx-auto" />

            <EligibilitySection id="emi-eligibility-guarantor"
                icon={<Users className="w-3.5 h-3.5" />} label="Guarantor" sublabel="Co-Signing for Another Applicant"
                minIncome="NPR 25,000 / month" accentColor="text-amber-600" accentBg="bg-amber-50"
                description="A guarantor in Nepal co-signs an EMI application and accepts legal responsibility for repayment if the primary applicant defaults. Guarantors are most often required for students or first-time borrowers without a credit history. Being a guarantor for a trusted family member helps them access no-cost EMI financing."
                criteria={[
                    { icon: <BadgeCheck className="w-4 h-4 text-amber-600" />, title: 'Age Requirement', detail: 'Guarantor must be between 21 and 60 years of age' },
                    { icon: <Banknote className="w-4 h-4 text-amber-600" />, title: 'Stable Income', detail: 'Minimum verifiable monthly income of NPR 25,000' },
                    { icon: <UserCheck className="w-4 h-4 text-amber-600" />, title: 'Relationship', detail: 'Must be an immediate family member or close relative of the primary applicant' },
                    { icon: <Phone className="w-4 h-4 text-amber-600" />, title: 'Contactable', detail: 'Must be reachable for phone or in-person verification during the process' },
                ]}
                documents={["Guarantor's Citizenship Certificate (front & back)", 'Latest 3 months Salary Slip or Income Proof', 'Latest 3 months Bank Statement', 'Passport Size Photo (white background)', 'Relationship Declaration Form (provided at office)']}
                note="By co-signing, the guarantor accepts full legal and financial responsibility if the primary applicant fails to repay."
                dotColor="bg-amber-100 text-amber-600"
            />

            {/* ── INCOME TABLE ── */}
            <section className="py-14 px-4 sm:px-8 bg-gray-50" aria-label="EMI buying power by income in Nepal">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12">
                        <div className="lg:w-80 xl:w-96 shrink-0">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Reference</p>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3 flex items-start gap-2">
                                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 shrink-0 mt-1" /> How Much Can You Buy on EMI?
                            </h2>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Your EMI purchase limit is calculated at 50% of gross income for salaried applicants and 40% for business/freelancer applicants.
                            </p>
                        </div>
                        <div className="flex-1">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest pb-3">Monthly Income</th>
                                        <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest pb-3">Salaried EMI</th>
                                        <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest pb-3">Business EMI</th>
                                        <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest pb-3">Max Value (12M)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[
                                        { income: 'NPR 15,000', sal: 'NPR 7,500', biz: '—', value: 'NPR 90,000' },
                                        { income: 'NPR 25,000', sal: 'NPR 12,500', biz: 'NPR 10,000', value: 'NPR 1,50,000' },
                                        { income: 'NPR 40,000', sal: 'NPR 20,000', biz: 'NPR 16,000', value: 'NPR 2,40,000' },
                                        { income: 'NPR 60,000', sal: 'NPR 30,000', biz: 'NPR 24,000', value: 'NPR 3,60,000' },
                                        { income: 'NPR 1,00,000+', sal: 'NPR 50,000', biz: 'NPR 40,000', value: 'NPR 6,00,000' },
                                    ].map((row, i) => (
                                        <tr key={i}>
                                            <td className="py-4 font-semibold text-gray-800">{row.income}</td>
                                            <td className="py-4 text-gray-500">{row.sal}</td>
                                            <td className="py-4 text-gray-500">{row.biz}</td>
                                            <td className="py-4 font-bold text-[var(--colour-fsP2)]">{row.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="text-xs text-gray-400 mt-4">* Salaried: 50% income rule. Business/Freelancer: 40% income rule. Actual approval may vary.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section id="emi-faq" className="py-14 px-4 sm:px-8 bg-white" aria-label="EMI FAQ Nepal">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12">
                        <div className="lg:w-80 xl:w-96 shrink-0">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">FAQ</p>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3 flex items-start gap-2">
                                <MessageCircle className="w-7 h-7 text-[var(--colour-fsP2)] shrink-0 mt-0.5" /> Frequently Asked Questions
                            </h2>
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">Everything you need to know about EMI eligibility, documents, and the approval process.</p>
                            <button onClick={handleApply} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--colour-fsP2)] hover:underline">
                                Ready to apply? Search a product <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1">{FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}</div>
                    </div>
                </div>
            </section>

            {/* ── BOTTOM CTA ── */}
            <section className="py-16 px-4 sm:px-8 bg-gradient-to-br from-[var(--colour-fsP2)] via-[#1976D2] to-[#0D47A1]" aria-label="Apply for EMI">
                <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck className="w-5 h-5 text-blue-200" />
                            <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Ready to Apply</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Start Your EMI Application Today</h2>
                        <p className="text-sm text-blue-100 leading-relaxed max-w-lg">Choose a product, fill your details, and get approval within 24 hours. No hidden charges, no processing fees.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                        <button onClick={handleApply}
                            className="inline-flex items-center justify-center gap-2 bg-white text-[var(--colour-fsP2)] font-bold text-sm py-3.5 px-8 rounded-xl hover:bg-blue-50 transition-all">
                            <Search className="w-4 h-4" /> Choose Product & Apply
                        </button>
                        <Link href="/emi/shop"
                            className="inline-flex items-center justify-center gap-2 bg-white/15 text-white font-bold text-sm py-3.5 px-8 rounded-xl hover:bg-white/25 transition-all">
                            <ShoppingBag className="w-4 h-4" /> Browse EMI Products
                        </Link>
                    </div>
                </div>
            </section>

            <p className="text-center text-xs text-gray-400 py-6 px-4">
                * Eligibility criteria are indicative. Final approval is at the sole discretion of our partner banks. Fatafat Sewa does not charge any processing fees.
            </p>

            {/* ── PRODUCT SELECT MODAL ── */}
            {showModal && <ProductSearchModal onClose={() => setShowModal(false)} onSelect={handleProductSelect} />}

        </main>
    );
}
