import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import {
    ArrowRight, ShoppingBag, ShieldCheck, Star, Sparkles,
    Briefcase, GraduationCap, TrendingUp, Users, BadgeCheck,
    FileText, CircleAlert, Banknote, Clock, Building2, Phone,
    UserCheck, MessageCircle, CheckCircle,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import EligibilityCalculator from './EligibilityCalculator';
import FaqAccordion from './FaqAccordion';
import { getFilteredBasketProducts } from '@/app/api/utils/productFetchers';
import { getBannerData } from '@/app/api/CachedHelper/getBannerData';
import TopBanner from '@/app/homepage/Bannerfooter';
import OurArticlesSection from '@/components/OurArticlesSection';

const BasketCard = dynamic(() => import('@/app/homepage/BasketCard'));

// ─── Metadata ─────────────────────────────────────────────────────────────────

const PAGE_URL = 'https://fatafatsewa.com/emi/eligibility';
const OG_IMAGE = '/favicon.png';

export const metadata: Metadata = {
    title: 'EMI Eligibility in Nepal — Check Approval Limit Free | Fatafat Sewa',
    description: 'Check your 0% No-Cost EMI eligibility in Nepal instantly. Free calculator for salaried, students, business owners & guarantors. Get approved in 24 hours.',
    keywords: [
        'EMI eligibility Nepal', 'EMI for students Nepal', 'business EMI Nepal',
        'salaried EMI Nepal', 'guarantor EMI Nepal', 'no cost EMI Nepal',
        'buy phone on EMI Nepal', 'EMI approval Nepal', 'EMI calculator Nepal', 'iPhone EMI Nepal',
    ],
    alternates: { canonical: PAGE_URL },
    openGraph: {
        title: 'EMI Eligibility in Nepal — Check Approval Limit Free | Fatafat Sewa',
        description: 'Salaried, student, business owner, or guarantor — check your 0% EMI eligibility in seconds. Smartphones & laptops on easy EMI across Nepal.',
        type: 'website', url: PAGE_URL, siteName: 'Fatafat Sewa', locale: 'en_US',
        images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'EMI Eligibility Checker - Fatafat Sewa Nepal' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'EMI Eligibility in Nepal — Check Yours Free | Fatafat Sewa',
        description: 'Check 0% No-Cost EMI eligibility for salaried, students & business owners in Nepal.',
        images: [OG_IMAGE],
    },
};

// ─── JSON-LD (merged @graph — single <script> tag) ────────────────────────────

const JSONLD = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebPage',
            name: 'EMI Eligibility Checker — Fatafat Sewa Nepal',
            description: 'Check your 0% No-Cost EMI eligibility in Nepal. Free instant calculator for salaried, students, business owners and guarantors.',
            url: PAGE_URL,
            publisher: { '@type': 'Organization', name: 'Fatafat Sewa', url: 'https://fatafatsewa.com' },
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://fatafatsewa.com' },
                { '@type': 'ListItem', position: 2, name: 'EMI Shop', item: 'https://fatafatsewa.com/emi/shop' },
                { '@type': 'ListItem', position: 3, name: 'EMI Eligibility', item: PAGE_URL },
            ],
        },
        {
            '@type': 'FAQPage',
            mainEntity: [
                { '@type': 'Question', name: 'What is the minimum salary required for EMI in Nepal?', acceptedAnswer: { '@type': 'Answer', text: 'For salaried employees, the minimum required gross monthly income is NPR 15,000. Business owners and guarantors need at least NPR 25,000 per month.' } },
                { '@type': 'Question', name: 'Can students apply for EMI at Fatafat Sewa?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Students aged 18–30 enrolled at a recognised college or university can apply for EMI, provided a parent or legal guardian co-signs the application.' } },
                { '@type': 'Question', name: 'How long does EMI approval take in Nepal?', acceptedAnswer: { '@type': 'Answer', text: 'Our partner banks verify all submitted documents and issue an approval decision within 24 hours on working days.' } },
                { '@type': 'Question', name: 'Does checking EMI eligibility affect my credit score?', acceptedAnswer: { '@type': 'Answer', text: 'No. Using our eligibility calculator is a soft check only and does not affect your credit score.' } },
                { '@type': 'Question', name: 'Can a business owner apply for EMI without a salary slip?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Business owners can provide 6 months of business bank statements, a PAN/VAT certificate, and business registration documents instead of salary slips.' } },
                { '@type': 'Question', name: 'Is there any processing fee for EMI at Fatafat Sewa?', acceptedAnswer: { '@type': 'Answer', text: 'No. Fatafat Sewa does not charge any processing fees. The EMI is 0% No-Cost.' } },
                { '@type': 'Question', name: 'What documents does a guarantor need for EMI?', acceptedAnswer: { '@type': 'Answer', text: 'A guarantor needs their Citizenship Certificate, 3 months salary slips, 3 months bank statements, a passport photo, and a Relationship Declaration Form.' } },
                { '@type': 'Question', name: 'How much can I buy on EMI based on my salary?', acceptedAnswer: { '@type': 'Answer', text: 'Your EMI limit is 50% of gross income for salaried (or 40% for business/freelancer) × 12 months tenure. E.g. NPR 40,000 salary → NPR 20,000/month → up to NPR 2,40,000.' } },
            ],
        },
    ],
};

// ─── Static Server Sub-components ─────────────────────────────────────────────

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
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 ${accentBg} ${accentColor}`}>
                            {icon}<span>{label}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">{sublabel}</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Min. Income: <span className="text-gray-600">{minIncome}</span>
                        </p>
                        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                <BadgeCheck className="w-3.5 h-3.5" /> Requirements
                            </h3>
                            <CriteriaList items={criteria} />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5" /> Documents Needed
                            </h3>
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

async function FooterBannerServer() {
    try {
        const data = await getBannerData('home-banner-fourth-test');
        const inner = data?.data ?? data;
        if (!inner?.images?.length) return null;
        return <TopBanner data={inner} />;
    } catch { return null; }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EligibilityPage() {
    const [iphoneData] = await Promise.all([
        getFilteredBasketProducts('mobile-price-in-nepal', {
            brand: 'iphone-price-in-nepal',
            emi_enabled: true,
            count: 5,
        }),
    ]);

    return (
        <>
            {/* Single merged JSON-LD */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />

            <main className="min-h-screen bg-white">

                {/* ── HERO (Server HTML — zero JS) ── */}
                <section className="bg-gradient-to-br from-[var(--colour-fsP2)] via-[#1976D2] to-[#0D47A1] py-16 px-4 sm:px-8">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mb-6">
                                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                <span className="text-xs font-bold text-white tracking-wide">No Credit Score Impact</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                                EMI Eligibility in Nepal
                                <br />
                                <span className="text-blue-200 text-3xl sm:text-4xl">Check Your 0% EMI Approval Limit</span>
                            </h1>
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

                {/* ── CLIENT ISLAND: sticky nav + calculator ── */}
                <EligibilityCalculator iphoneInitialData={iphoneData} />

                {/* ── iPHONES ON EMI (SSR data, lazy client component) ── */}
                <section id="emi-phones" className="py-14 px-4 sm:px-8 bg-gray-50" aria-label="iPhone on EMI in Nepal">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="mb-6">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">EMI · iPhone</p>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">iPhones Available on EMI</h2>
                            <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                                Browse the latest iPhones you can purchase on 0% No-Cost EMI from Fatafat Sewa. Approved applicants get instant dispatch across Nepal.
                            </p>
                        </div>
                        <BasketCard slug="mobile-price-in-nepal" title="iPhones on EMI" initialData={iphoneData} isFirstSection={false} />
                    </div>
                </section>

                {/* ── WHO CAN APPLY overview (pure anchor links — no JS) ── */}
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
                                <a key={p.label} href={p.href}
                                    className="group flex flex-col gap-3 p-5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200">
                                    <span className={p.color}>{p.icon}</span>
                                    <div>
                                        <p className="text-sm font-extrabold text-gray-800 group-hover:text-gray-900">{p.label}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{p.sub}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all mt-auto" />
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="h-px bg-gray-100 max-w-[1400px] mx-auto" />

                {/* ── SALARIED ── */}
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

                {/* ── STUDENT ── */}
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

                <Suspense fallback={<div className="h-24 animate-pulse bg-gray-100" />}>
                    <FooterBannerServer />
                </Suspense>

                <div className="h-px bg-gray-100 max-w-[1400px] mx-auto" />

                {/* ── BUSINESS ── */}
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

                {/* ── GUARANTOR ── */}
                <EligibilitySection id="emi-eligibility-guarantor"
                    icon={<Users className="w-3.5 h-3.5" />} label="Guarantor" sublabel="Co-Signing for Another Applicant"
                    minIncome="NPR 25,000 / month" accentColor="text-amber-600" accentBg="bg-amber-50"
                    description="A guarantor in Nepal co-signs an EMI application and accepts legal responsibility for repayment if the primary applicant defaults. Guarantors are most often required for students or first-time borrowers without a credit history."
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
                                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 shrink-0 mt-1" />
                                    How Much Can You Buy on EMI?
                                </h2>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Your EMI limit is 50% of gross income for salaried applicants and 40% for business/freelancer applicants, multiplied by a 12-month tenure.
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
                                <p className="text-xs text-gray-400 mt-4">* Salaried: 50%. Business/Freelancer: 40%. Actual approval may vary by bank.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FAQ (CLIENT ISLAND — minimal: just accordion state) ── */}
                <section id="emi-faq" className="py-14 px-4 sm:px-8 bg-white" aria-label="EMI FAQ Nepal">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="flex flex-col lg:flex-row gap-12">
                            <div className="lg:w-80 xl:w-96 shrink-0">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">FAQ</p>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3 flex items-start gap-2">
                                    <MessageCircle className="w-7 h-7 text-[var(--colour-fsP2)] shrink-0 mt-0.5" />
                                    Frequently Asked Questions
                                </h2>
                                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                    Everything you need to know about EMI eligibility, documents, and the approval process.
                                </p>
                                <Link href="/emi/apply" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--colour-fsP2)] hover:underline">
                                    Ready to apply? Browse products <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="flex-1">
                                <FaqAccordion />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── BOTTOM CTA (Server HTML) ── */}
                <section className="py-16 px-4 sm:px-8 bg-gradient-to-br from-[var(--colour-fsP2)] via-[#1976D2] to-[#0D47A1]" aria-label="Apply for EMI">
                    <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <ShieldCheck className="w-5 h-5 text-blue-200" />
                                <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Ready to Apply</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Start Your EMI Application Today</h2>
                            <p className="text-sm text-blue-100 leading-relaxed max-w-lg">
                                Choose a product, fill your details, and get approval within 24 hours. No hidden charges, no processing fees.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                            <Link href="/emi/shop"
                                className="inline-flex items-center justify-center gap-2 bg-white text-[var(--colour-fsP2)] font-bold text-sm py-3.5 px-8 rounded-xl hover:bg-blue-50 transition-all">
                                <ShoppingBag className="w-4 h-4" /> Browse EMI Products
                            </Link>
                            <Link href="/emi/shop"
                                className="inline-flex items-center justify-center gap-2 bg-white/15 text-white font-bold text-sm py-3.5 px-8 rounded-xl hover:bg-white/25 transition-all">
                                View All EMI Offers <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                <p className="text-center text-xs text-gray-400 py-6 px-4">
                    * Eligibility criteria are indicative. Final approval is at the sole discretion of our partner banks. Fatafat Sewa does not charge any processing fees.
                </p>

            </main>



            <Suspense fallback={<div className="h-96 animate-pulse bg-gray-50" />}>
                <OurArticlesSection />
            </Suspense>
        </>
    );
}
