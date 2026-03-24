"use strict";
"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    CheckCircle,
    ChevronDown,
    Calculator,
    Briefcase,
    Building2,
    Clock,
    ArrowRight,
    ShoppingBag,
    MessageCircle,
    FileText,
    ShieldCheck
} from 'lucide-react';
import { cn } from "@/lib/utils";

const SALARY_OPTIONS = [
    { label: 'NPR 15,000', value: 15000 },
    { label: 'NPR 20,000', value: 20000 },
    { label: 'NPR 25,000', value: 25000 },
    { label: 'NPR 30,000', value: 30000 },
    { label: 'NPR 40,000', value: 40000 },
    { label: 'NPR 50,000', value: 50000 },
    { label: 'NPR 60,000', value: 60000 },
    { label: 'NPR 75,000', value: 75000 },
    { label: 'NPR 1,00,000+', value: 100000 },
];

const JOB_TYPES = ['Salaried', 'Self-Employed', 'Business Owner', 'Freelancer'];
const WORK_TYPES = ['Office', 'Remote', 'Hybrid', 'Field Work'];
const EXPERIENCE_OPTIONS = ['Less than 1 Year', '1-2 Years', '2-5 Years', '5-10 Years', '10+ Years'];

export default function EligibilityClient() {
    const [salary, setSalary] = useState(40000);
    const [jobType, setJobType] = useState('Salaried');
    const [workType, setWorkType] = useState('Office');
    const [experience, setExperience] = useState('2-5 Years');
    const [showResult, setShowResult] = useState(false);

    const eligibility = useMemo(() => {
        const bestTenure = 12; // Standard 12 months for calculation
        const maxEmi = Math.round(salary * 0.5); // 50% salary rule
        const maxEligible = maxEmi * bestTenure;
        return { maxEmi, maxEligible, bestTenure };
    }, [salary]);

    const handleCheck = () => {
        setShowResult(true);
        // smooth scroll to results if needed
        setTimeout(() => {
            const resultElement = document.getElementById('eligibility-result');
            if (resultElement) {
                resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    return (
        <div className="min-h-screen bg-[var(--colour-bg4)] py-8 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--colour-fsP2)] to-[#1565C0] text-white shadow-lg shadow-blue-900/20 mb-2">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--colour-text2)] tracking-tight">
                        Check Your EMI Eligibility
                    </h1>
                    <p className="text-sm sm:text-base text-[var(--colour-text3)] max-w-md mx-auto">
                        Find out your approval limit instantly. No impact on your credit score.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-[var(--shadow-premium-md)] border border-[var(--colour-border3)] overflow-hidden">
                    <div className="p-6 sm:p-8 space-y-6">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Salary Input */}
                            <div className="space-y-2">
                                <label htmlFor="elig-salary" className="text-xs font-bold text-[var(--colour-text3)] uppercase tracking-wide flex items-center gap-1.5">
                                    <Calculator className="w-3.5 h-3.5" /> Gross Monthly Salary
                                </label>
                                <div className="relative">
                                    <select
                                        id="elig-salary"
                                        value={salary}
                                        onChange={(e) => { setSalary(Number(e.target.value)); setShowResult(false); }}
                                        className="w-full appearance-none bg-gray-50 hover:bg-white border-2 border-gray-100 hover:border-[var(--colour-fsP2)]/30 rounded-xl px-4 py-3.5 pr-10 text-sm font-bold text-[var(--colour-text2)] focus:border-[var(--colour-fsP2)] focus:ring-4 focus:ring-[var(--colour-fsP2)]/10 outline-none transition-all cursor-pointer"
                                    >
                                        {SALARY_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Job Type */}
                            <div className="space-y-2">
                                <label htmlFor="elig-job" className="text-xs font-bold text-[var(--colour-text3)] uppercase tracking-wide flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5" /> Job Type
                                </label>
                                <div className="relative">
                                    <select
                                        id="elig-job"
                                        value={jobType}
                                        onChange={(e) => { setJobType(e.target.value); setShowResult(false); }}
                                        className="w-full appearance-none bg-gray-50 hover:bg-white border-2 border-gray-100 hover:border-[var(--colour-fsP2)]/30 rounded-xl px-4 py-3.5 pr-10 text-sm font-bold text-[var(--colour-text2)] focus:border-[var(--colour-fsP2)] focus:ring-4 focus:ring-[var(--colour-fsP2)]/10 outline-none transition-all cursor-pointer"
                                    >
                                        {JOB_TYPES.map((j) => <option key={j} value={j}>{j}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Work Type */}
                            <div className="space-y-2">
                                <label htmlFor="elig-work" className="text-xs font-bold text-[var(--colour-text3)] uppercase tracking-wide flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5" /> Work Type
                                </label>
                                <div className="relative">
                                    <select
                                        id="elig-work"
                                        value={workType}
                                        onChange={(e) => { setWorkType(e.target.value); setShowResult(false); }}
                                        className="w-full appearance-none bg-gray-50 hover:bg-white border-2 border-gray-100 hover:border-[var(--colour-fsP2)]/30 rounded-xl px-4 py-3.5 pr-10 text-sm font-bold text-[var(--colour-text2)] focus:border-[var(--colour-fsP2)] focus:ring-4 focus:ring-[var(--colour-fsP2)]/10 outline-none transition-all cursor-pointer"
                                    >
                                        {WORK_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Experience */}
                            <div className="space-y-2">
                                <label htmlFor="elig-exp" className="text-xs font-bold text-[var(--colour-text3)] uppercase tracking-wide flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> Experience
                                </label>
                                <div className="relative">
                                    <select
                                        id="elig-exp"
                                        value={experience}
                                        onChange={(e) => { setExperience(e.target.value); setShowResult(false); }}
                                        className="w-full appearance-none bg-gray-50 hover:bg-white border-2 border-gray-100 hover:border-[var(--colour-fsP2)]/30 rounded-xl px-4 py-3.5 pr-10 text-sm font-bold text-[var(--colour-text2)] focus:border-[var(--colour-fsP2)] focus:ring-4 focus:ring-[var(--colour-fsP2)]/10 outline-none transition-all cursor-pointer"
                                    >
                                        {EXPERIENCE_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCheck}
                            className="w-full group relative overflow-hidden bg-[var(--colour-fsP2)] hover:bg-[#1565C0] text-white font-bold text-base py-4 rounded-xl shadow-lg shadow-[var(--colour-fsP2)]/25 hover:shadow-xl hover:shadow-[var(--colour-fsP2)]/30 transition-all duration-300 transform active:scale-[0.99]"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Check My Eligibility <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </button>

                    </div>

                    {/* Results Section */}
                    {showResult && (
                        <div id="eligibility-result" className="border-t border-gray-100 bg-gray-50/50 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl p-6 border border-[var(--colour-fsP2)]/20 shadow-sm relative overflow-hidden mb-6">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--colour-fsP2)]/5 rounded-full -translate-y-1/2 translate-x-1/2" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                            <CheckCircle className="w-6 h-6 text-emerald-600" strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-extrabold text-[var(--colour-text2)]">Great News! You are Eligible</h3>
                                            <p className="text-xs text-[var(--colour-text3)]">Based on your provided details</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm text-[var(--colour-text3)] font-medium">You can get approval for products up to</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl sm:text-4xl font-extrabold text-[var(--colour-fsP2)] tracking-tight">
                                                NPR {eligibility.maxEligible.toLocaleString()}
                                            </span>
                                            <span className="text-xs font-bold bg-[var(--colour-fsP2)]/10 text-[var(--colour-fsP2)] px-2 py-1 rounded">No Cost EMI</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Monthly EMI Limit</p>
                                            <p className="text-sm font-bold text-gray-800">NPR {eligibility.maxEmi.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Best Tenure</p>
                                            <p className="text-sm font-bold text-gray-800">{eligibility.bestTenure} Months</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-[var(--colour-text3)] uppercase tracking-wider flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5" /> Required Documents
                                    </h4>
                                    <ul className="space-y-3">
                                        {['Citizenship Certificate', 'Latest 3 Months Bank Statement', 'Salary Slip / Income Proof', 'Passport Size Photo'].map((doc, i) => (
                                            <li key={i} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                <div className="w-5 h-5 bg-[var(--colour-fsP2)]/10 rounded flex items-center justify-center shrink-0 mt-0.5">
                                                    <CheckCircle className="w-3 h-3 text-[var(--colour-fsP2)]" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{doc}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-4 flex flex-col justify-center">
                                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                        <h4 className="text-sm font-bold text-blue-900 mb-2">Ready to apply?</h4>
                                        <p className="text-xs text-blue-700 mb-4 leading-relaxed">
                                            You can start your application online right now. Our team will verify your documents within 24 hours.
                                        </p>
                                        <Link
                                            href="/emi/applyemi"
                                            className="w-full inline-flex items-center justify-center gap-2 bg-[var(--colour-fsP2)] hover:bg-[#1565C0] text-white font-bold text-sm py-3 rounded-lg shadow-md transition-all"
                                        >
                                            Start Application
                                        </Link>
                                    </div>
                                    <Link
                                        href={`/emi/shop?budget=${eligibility.maxEmi}`}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[var(--colour-text2)] font-bold text-sm py-3 rounded-lg border border-gray-200 shadow-sm transition-all"
                                    >
                                        <ShoppingBag className="w-4 h-4" /> View Eligible Products
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-400">
                        * Eligibility criteria are indicative. Final approval is at the sole discretion of our partner banks.
                    </p>
                </div>

            </div>
        </div>
    );
}
