import React from 'react';
import {
    CreditCard,
    Globe2,
    Truck,
    Wrench,
    RefreshCcw,
    ShieldCheck,
    Zap,
    Headphones,
    BadgeCheck,
    TrendingUp,
    Clock3,
    Wallet,
} from 'lucide-react';

/* ─── Brand colours ─────────────────────────────────────────────────────── */
//  --colour-fsP1 : #f86014  (orange)
//  --colour-fsP2 : #1967b3  (blue)

/* ─── Services data ─────────────────────────────────────────────────────── */
const services = [
    {
        icon: <CreditCard className="w-7 h-7" strokeWidth={1.75} />,
        title: 'EMI Wallet & Purse',
        description:
            'Zero down-payment, paperless approval in minutes. Split any purchase across 3–24 months through 15+ commercial banks.',
        accent: 'text-[#f86014]',
        ring: 'ring-orange-100',
        bg: 'bg-orange-50',
    },
    {
        icon: <Globe2 className="w-7 h-7" strokeWidth={1.75} />,
        title: 'International Payments',
        description:
            'Pay seamlessly with Visa, Mastercard, PayPal and all major international gateways. Your currency, your way.',
        accent: 'text-[#1967b3]',
        ring: 'ring-blue-100',
        bg: 'bg-blue-50',
    },
    {
        icon: <Wallet className="w-7 h-7" strokeWidth={1.75} />,
        title: 'National Payments',
        description:
            'eSewa, Khalti, ConnectIPS, direct bank transfer — every popular Nepali payment method accepted instantly.',
        accent: 'text-emerald-600',
        ring: 'ring-emerald-100',
        bg: 'bg-emerald-50',
    },
    {
        icon: <Truck className="w-7 h-7" strokeWidth={1.75} />,
        title: 'Free Delivery Across Nepal',
        description:
            'Same-day delivery in Kathmandu Valley, 3–5 day nationwide delivery — always free, always tracked.',
        accent: 'text-amber-600',
        ring: 'ring-amber-100',
        bg: 'bg-amber-50',
    },
    {
        icon: <Wrench className="w-7 h-7" strokeWidth={1.75} />,
        title: 'Expert Device Repairs',
        description:
            'Authorised technicians, genuine OEM parts, 30-day service warranty. We restore your device to factory condition.',
        accent: 'text-indigo-600',
        ring: 'ring-indigo-100',
        bg: 'bg-indigo-50',
    },
    {
        icon: <RefreshCcw className="w-7 h-7" strokeWidth={1.75} />,
        title: 'Smart Device Exchange',
        description:
            'Get the best valuation for your old device instantly — applied straight toward your next upgrade.',
        accent: 'text-[#f86014]',
        ring: 'ring-orange-100',
        bg: 'bg-orange-50',
    },
];

/* ─── Why-us value props ────────────────────────────────────────────────── */
const valueProps = [
    {
        icon: <ShieldCheck className="w-5 h-5" strokeWidth={2} />,
        label: '100 % Genuine Products',
        body: 'Every item ships with an official brand warranty — no grey-market, no fakes.',
        colour: 'text-emerald-600',
        bg: 'bg-emerald-50',
    },
    {
        icon: <Zap className="w-5 h-5" strokeWidth={2} />,
        label: 'Instant Affordability',
        body: 'With 0 % EMI plans, premium gadgets are accessible to every pocket.',
        colour: 'text-amber-500',
        bg: 'bg-amber-50',
    },
    {
        icon: <Clock3 className="w-5 h-5" strokeWidth={2} />,
        label: 'Fastest Issue Resolution',
        body: 'Dedicated support team resolves most customer issues within 2 hours.',
        colour: 'text-[#1967b3]',
        bg: 'bg-blue-50',
    },
    {
        icon: <TrendingUp className="w-5 h-5" strokeWidth={2} />,
        label: 'Best-Price Exchange Value',
        body: 'Our AI-powered pricing tool gives you 15 % more on trade-ins vs market average.',
        colour: 'text-[#f86014]',
        bg: 'bg-orange-50',
    },
    {
        icon: <BadgeCheck className="w-5 h-5" strokeWidth={2} />,
        label: 'Certified After-Sale Care',
        body: 'Our relationship doesn\'t end at checkout — post-sale support is baked in.',
        colour: 'text-violet-600',
        bg: 'bg-violet-50',
    },
    {
        icon: <Headphones className="w-5 h-5" strokeWidth={2} />,
        label: '24 / 7 Customer Support',
        body: 'Real Nepali-speaking agents available around the clock on chat, call & email.',
        colour: 'text-sky-600',
        bg: 'bg-sky-50',
    },
];

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function OurServices() {
    return (
        <section className="py-8 md:py-10 bg-slate-50">
            <div className="w-full  mx-auto px-4 md:px-8">

                {/* ── Section header ────────────────────────────────── */}
                <div className="text-center max-w-2xl mx-auto mb-16">

                    <h2 className="text-4xl md:text-[2.75rem] font-extrabold text-slate-900 leading-tight tracking-tight mb-5 font-heading">
                        Everything You Need,{' '}
                        <span
                            className="text-transparent bg-clip-text text-nowrap"
                            style={{ backgroundImage: 'linear-gradient(var(--colour-fsP1), var(--colour-fsP2))' }}
                        >
                            One Platform
                        </span>
                    </h2>

                </div>

                {/* ── Services grid ─────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
                    {services.map((s, i) => (
                        <div
                            key={i}
                            className="group relative flex flex-col gap-4 p-7 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                            {/* subtle top accent line */}
                            <div
                                className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ backgroundImage: 'linear-gradient(90deg, #f86014, #1967b3)' }}
                            />

                            {/* icon */}
                            <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${s.bg} ${s.accent} ring-1 ${s.ring} group-hover:scale-105 transition-transform duration-300 shrink-0`}>
                                {s.icon}
                            </div>

                            {/* text */}
                            <div>
                                <h3 className={`text-[1rem] font-bold mb-2 ${s.accent}`}>{s.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Why Us section ────────────────────────────────── */}
                <div className="rounded-3xl bg-slate-50 border border-slate-100 p-8 md:p-14">

                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* Left headline */}
                        <div className="lg:w-72 shrink-0">
                            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-snug mb-4 font-heading">
                                Why Customers Choose Us
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                We studied the most common pain-points Nepali shoppers face and engineered our
                                entire service model to eliminate them — fast.
                            </p>
                            <div
                                className="w-16 h-1 rounded-full"
                                style={{ backgroundImage: 'linear-gradient(90deg, #f86014, #1967b3)' }}
                            />
                        </div>

                        {/* Right cards */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {valueProps.map((v, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col gap-3 p-5 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300"
                                >
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${v.bg} ${v.colour} shrink-0`}>
                                        {v.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 mb-1">{v.label}</p>
                                        <p className="text-xs text-slate-500 leading-relaxed">{v.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}
