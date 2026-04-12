"use client";

import React, { useState, useMemo, useRef } from 'react';
import { searchProducts } from '@/app/api/services/product.service';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    CheckCircle, ChevronDown, ChevronUp, Briefcase, Building2, Clock,
    ArrowRight, ShoppingBag, Banknote, Users, Sparkles, Search, X,
    AlertTriangle, Loader2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalcState {
    jobType: string;
    income: string;
    guarantorIncome: string;
    experience: string;
    showResult: boolean;
}

interface EligibilityResult {
    eligible: boolean;
    maxEmi: number;
    maxEligible: number;
    tenure: number;
    reason?: string;
    warnings: string[];
    tips: string[];
}

interface SearchProduct {
    id: number;
    name: string;
    slug: string;
    price: number;
    emi_price?: number;
    thumb?: { url: string; alt_text?: string };
    brand?: { name: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INCOME_PRESETS = [15000, 25000, 40000, 60000, 100000];

export const JOB_TYPE_OPTIONS = [
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

// ─── Eligibility Engine ───────────────────────────────────────────────────────

function computeEligibility(jobType: string, income: number, guarantorIncome: number, experience: string): EligibilityResult {
    const warnings: string[] = [];
    const tips: string[] = [];
    const tenure = 12;

    if (jobType === 'student') {
        if (guarantorIncome < 25000) {
            return {
                eligible: false, maxEmi: 0, maxEligible: 0, tenure,
                reason: `Your guarantor's monthly income (NPR ${guarantorIncome.toLocaleString()}) is below the required NPR 25,000 minimum for student EMI applications.`,
                warnings: ['Guarantor income must be at least NPR 25,000/month.'],
                tips: ['Ask a parent or senior family member with a higher income to co-sign.', 'A down payment can reduce the EMI amount needed.'],
            };
        }
        const maxEmi = Math.round(guarantorIncome * 0.4);
        if (maxEmi < 2000) warnings.push('Your guarantor\'s EMI capacity is low. Consider products under NPR 24,000.');
        tips.push('Apply with your college enrollment certificate and your parent\'s bank statements.');
        return { eligible: true, maxEmi, maxEligible: maxEmi * tenure, tenure, warnings, tips };
    }

    const minRequired = jobType === 'salaried' ? 15000 : 25000;
    if (income < minRequired) {
        return {
            eligible: false, maxEmi: 0, maxEligible: 0, tenure,
            reason: `Your monthly income (NPR ${income.toLocaleString()}) is below the minimum of NPR ${minRequired.toLocaleString()} for ${jobType === 'salaried' ? 'salaried' : 'self-employed/business'} applicants.`,
            warnings: [`Minimum income for this category is NPR ${minRequired.toLocaleString()}/month.`],
            tips: ['Consider applying with a guarantor to supplement your income.', 'Build your income to the minimum threshold and apply again.'],
        };
    }

    const emiRate = jobType === 'salaried' ? 0.5 : 0.4;
    const maxEmi = Math.round(income * emiRate);

    if (experience === 'Less than 1 Year') {
        warnings.push('Less than 1 year of experience may affect approval. Some banks require 6+ months at the current employer.');
        tips.push('An employment verification letter significantly improves approval chances.');
    }
    if (jobType === 'business') {
        tips.push('Provide your last 6 months of business bank statements for a stronger application.');
        tips.push('A PAN/VAT certificate is mandatory. A tax clearance report boosts your limit.');
    }
    if (jobType === 'freelancer') {
        warnings.push('Freelancers must provide consistent bank deposits as income proof.');
        tips.push('Maintain clear bank records showing regular monthly income for 6+ months.');
    }
    if (jobType === 'salaried') {
        tips.push('Government employees get priority approval — mention your employer type in your application.');
    }

    return { eligible: true, maxEmi, maxEligible: maxEmi * tenure, tenure, warnings, tips };
}

// ─── Product Search Modal ─────────────────────────────────────────────────────

const SKELETON_ROWS = 5;

function SkeletonRow() {
    return (
        <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2 min-w-0">
                <div className="h-3.5 bg-gray-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
            </div>
        </div>
    );
}

function ProductSearchModal({ onClose, onSelect }: { onClose: () => void; onSelect: (p: SearchProduct) => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const handleQueryChange = (q: string) => {
        setQuery(q);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        abortRef.current?.abort();

        if (q.length < 3) {
            setResults([]);
            setSearched(q.length > 0);
            setLoading(false);
            return;
        }

        setLoading(true);
        setSearched(true);
        const controller = new AbortController();
        abortRef.current = controller;

        timeoutRef.current = setTimeout(async () => {
            try {
                const res = await searchProducts({ search: q, emi_available: true, per_page: 10 });
                if (controller.signal.aborted) return;
                setResults(res?.data ?? []);
            } catch {
                if (controller.signal.aborted) return;
                setResults([]);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 300);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Modal panel — fixed height so content changes don't bounce */}
            <div className="w-full sm:max-w-xl bg-white sm:rounded-2xl flex flex-col h-[92dvh] sm:h-[72vh]">

                {/* Search header */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 shrink-0">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                        value={query}
                        onChange={e => handleQueryChange(e.target.value)}
                        placeholder="Search EMI-eligible products…"
                        className="flex-1 text-sm font-medium text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                    />
                    {/* Fixed-width slot for spinner so close button never shifts */}
                    <span className="w-5 h-5 flex items-center justify-center shrink-0">
                        {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
                    </span>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Results area — fills remaining space, scrolls internally */}
                <div className="overflow-y-auto flex-1">

                    {/* Empty state — not yet searched */}
                    {!searched && (
                        <div className="flex flex-col items-center justify-center h-full pb-8 text-center px-4">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                                <ShoppingBag className="w-7 h-7 text-gray-300" />
                            </div>
                            <p className="text-sm font-semibold text-gray-500">Search EMI-eligible products</p>
                            <p className="text-xs text-gray-400 mt-1">Phones, laptops, accessories & more</p>
                        </div>
                    )}

                    {/* Loading skeleton — same layout as results, no height jump */}
                    {loading && (
                        <div className="p-2 space-y-0.5">
                            {Array.from({ length: SKELETON_ROWS }, (_, i) => <SkeletonRow key={i} />)}
                        </div>
                    )}

                    {/* No results */}
                    {searched && !loading && results.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full pb-8 text-center px-4">
                            <p className="text-sm font-semibold text-gray-500">No results for &quot;{query}&quot;</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Try a different term or{' '}
                                <Link href="/emi/shop" onClick={onClose} className="text-[var(--colour-fsP2)] underline font-medium">
                                    browse EMI shop
                                </Link>
                            </p>
                        </div>
                    )}

                    {/* Results */}
                    {!loading && results.length > 0 && (
                        <ul className="p-2 space-y-0.5">
                            {results.map(p => {
                                const displayPrice = p.emi_price ?? p.price;
                                const emiPerMonth = displayPrice > 0 ? Math.round(displayPrice / 12) : null;
                                return (
                                    <li key={p.id}>
                                        <button
                                            onClick={() => onSelect(p)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group"
                                        >
                                            {/* Product image — fixed 56×56 matching SearchResults pattern */}
                                            <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-[var(--colour-fsP2)] transition-colors">
                                                {p.thumb ? (
                                                    <Image
                                                        src={p.thumb.url}
                                                        alt={p.thumb.alt_text ?? p.name}
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-contain p-1"
                                                        sizes="48px"
                                                    />
                                                ) : (
                                                    <ShoppingBag className="w-5 h-5 text-gray-300" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate leading-snug">
                                                    {p.name}
                                                </p>
                                                {p.brand?.name && (
                                                    <p className="text-[11px] text-gray-400 mt-0.5">{p.brand.name}</p>
                                                )}
                                                <div className="flex items-baseline gap-2 mt-1">
                                                    <span className="text-xs font-extrabold text-[var(--colour-fsP2)]">
                                                        NPR {displayPrice.toLocaleString()}
                                                    </span>
                                                    {emiPerMonth && (
                                                        <span className="text-[10px] font-semibold text-gray-400 bg-blue-50 px-1.5 py-0.5 rounded">
                                                            ~NPR {emiPerMonth.toLocaleString()}/mo
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--colour-fsP2)] shrink-0 transition-colors" />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100 shrink-0 flex items-center justify-between">
                    <p className="text-xs text-gray-400">Can&apos;t find your product?</p>
                    <Link
                        href="/emi/shop"
                        onClick={onClose}
                        className="text-xs font-bold text-[var(--colour-fsP2)] hover:underline flex items-center gap-1"
                    >
                        Browse EMI Shop <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ─── Main Client Component (Calculator + Nav + Modal only) ────────────────────

interface Props {
    iphoneInitialData?: { products?: any[] };
}

export default function EligibilityCalculator({ iphoneInitialData: _iphoneInitialData }: Props) {
    const router = useRouter();
    const [calc, setCalc] = useState<CalcState>({
        jobType: 'salaried', income: '40000', guarantorIncome: '30000',
        experience: '2–5 Years', showResult: false,
    });
    const [navOpen, setNavOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const updateCalc = (u: Partial<CalcState>) => setCalc(p => ({ ...p, ...u }));

    const income = Math.max(0, parseInt(calc.income.replace(/[^0-9]/g, ''), 10) || 0);
    const guarantorIncome = Math.max(0, parseInt(calc.guarantorIncome.replace(/[^0-9]/g, ''), 10) || 0);

    const result = useMemo(
        () => computeEligibility(calc.jobType, income, guarantorIncome, calc.experience),
        [calc.jobType, income, guarantorIncome, calc.experience],
    );

    const handleCheck = () => {
        updateCalc({ showResult: true });
        setTimeout(() => document.getElementById('eligibility-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleApply = () => setShowModal(true);
    const handleProductSelect = (p: SearchProduct) => { setShowModal(false); router.push(`/emi?slug=${p.slug}`); };

    const isStudent = calc.jobType === 'student';

    return (
        <>
            {/* ── STICKY NAV ── */}
            <nav className="sticky top-0 z-30 bg-white border-b border-gray-100" aria-label="Page sections">
                <div className="hidden sm:block max-w-[1400px] mx-auto px-8">
                    <div className="flex items-center gap-1 overflow-x-auto py-0">
                        {NAV_LINKS.map(n => (
                            <a key={n.href} href={n.href}
                                className="shrink-0 text-xs font-semibold text-gray-500 hover:text-[var(--colour-fsP2)] px-3 py-4 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-[var(--colour-fsP2)]">
                                {n.label}
                            </a>
                        ))}
                        <div className="ml-auto shrink-0">
                            <button onClick={handleApply}
                                className="text-xs font-bold bg-[var(--colour-fsP2)] hover:bg-[#1565C0] text-white px-4 py-2 rounded-lg transition-all">
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
                            <a key={n.href} href={n.href} onClick={() => setNavOpen(false)}
                                className="block w-full text-left text-sm font-medium text-gray-600 hover:text-[var(--colour-fsP2)] py-2.5 border-b border-gray-50 last:border-0">
                                {n.label}
                            </a>
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
                        <div className="lg:w-80 xl:w-96 shrink-0">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Instant Checker</p>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">Check Your Approval Limit</h2>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Enter your details below. The result is personalised based on your profile — salaried, student, or business owner.
                            </p>
                        </div>
                        <div className="flex-1 space-y-6">
                            {/* Job Type */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5" /> I am a…
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {JOB_TYPE_OPTIONS.map(opt => (
                                        <button key={opt.value} id={`jobtype-${opt.value}`}
                                            onClick={() => updateCalc({ jobType: opt.value, showResult: false })}
                                            className={`flex flex-col items-start gap-1 p-3.5 rounded-xl border-2 text-left transition-all duration-150 ${calc.jobType === opt.value ? 'border-[var(--colour-fsP2)] bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                                            <span className="text-xl">{opt.icon}</span>
                                            <span className={`text-xs font-bold ${calc.jobType === opt.value ? 'text-[var(--colour-fsP2)]' : 'text-gray-700'}`}>{opt.label}</span>
                                            <span className="text-[10px] text-gray-400 leading-snug">{opt.sub}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Income */}
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
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {INCOME_PRESETS.map(p => (
                                        <button key={p} onClick={() => updateCalc({ income: String(p), showResult: false })}
                                            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${parseInt(calc.income) === p ? 'bg-[var(--colour-fsP2)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                            {p >= 100000 ? '1 Lakh+' : `${(p / 1000).toFixed(0)}K`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Guarantor income — student only */}
                            {isStudent && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" /> Guarantor&apos;s Gross Monthly Income
                                    </p>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">NPR</span>
                                        <input id="elig-guarantor-income" type="text" inputMode="numeric"
                                            value={calc.guarantorIncome}
                                            onChange={e => updateCalc({ guarantorIncome: e.target.value.replace(/[^0-9]/g, ''), showResult: false })}
                                            placeholder="e.g. 35000"
                                            className="w-full bg-gray-50 rounded-xl pl-14 pr-4 py-3.5 text-sm font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1.5">
                                        Minimum NPR 25,000 required. This is your parent or legal guardian&apos;s income.
                                    </p>
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

                            {/* Result */}
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
                                                    <p className="text-xs text-gray-400">
                                                        Based on your {isStudent ? "guarantor's" : ''} income & profile
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-t border-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Max. Product Value</p>
                                                    <p className="text-3xl font-extrabold text-[var(--colour-fsP2)] tracking-tight">
                                                        NPR {result.maxEligible.toLocaleString()}
                                                    </p>
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
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--colour-fsP2)] shrink-0 mt-1.5" />{t}
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
                                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0 mt-1.5" />{t}
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

            {/* Product Search Modal */}
            {showModal && <ProductSearchModal onClose={() => setShowModal(false)} onSelect={handleProductSelect} />}
        </>
    );
}
