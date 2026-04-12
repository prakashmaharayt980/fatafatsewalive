'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Smartphone, Laptop, ShieldCheck, Activity, PieChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const topStats = [
    { num: 45, prefix: '', suffix: 'K+', label: 'Total Service Sales', desc: 'Across All Origins' },
    { num: 2, prefix: 'Rs. ', suffix: 'B+', label: 'Total Finance Disbursed', desc: 'Via EMI & Credit' },
    { num: 250, prefix: '', suffix: 'K+', label: 'Devices Financed', desc: 'Tech & Appliances' },
    { num: 15, prefix: '', suffix: '+', label: 'Active EMI Partners', desc: 'Commercial Banks' },
];

const bars = [
    { num: 70, label: 'Smartphones', color: 'bg-(--colour-fsP1)', textColor: 'text-(--colour-fsP1)', Icon: Smartphone },
    { num: 20, label: 'Mac & Laptops', color: 'bg-(--colour-fsP2)', textColor: 'text-(--colour-fsP2)', Icon: Laptop },
    { num: 10, label: 'Home Appliances', color: 'bg-amber-500', textColor: 'text-amber-500', Icon: ShieldCheck },
];

const chartData = [
    { year: '2021', finance: 18, orders: 4200 },
    { year: '2022', finance: 35, orders: 8500 },
    { year: '2023', finance: 72, orders: 18600 },
    { year: '2024', finance: 150, orders: 32000 },
];

const CompanyStats = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);
    const [counts, setCounts] = useState(topStats.map(() => 0));
    const [barWidths, setBarWidths] = useState(bars.map(() => 0));

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting || hasAnimated.current) return;
            hasAnimated.current = true;

            const DURATION = 1600;
            const start = performance.now();

            const tick = (now: number) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / DURATION, 1);
                const eased = 1 - Math.pow(1 - progress, 3);

                setCounts(topStats.map(s => Math.round(s.num * eased)));
                setBarWidths(bars.map(b => parseFloat((b.num * eased).toFixed(1))));

                if (progress < 1) requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
            observer.disconnect();
        }, { threshold: 0.2 });

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="py-10 bg-white border-t border-slate-100">
            <div ref={sectionRef} className="container-responsive w-full max-w-7xl mx-auto px-4 md:px-6">

                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-heading mb-4">Our Ecosystem Impact</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto font-poppins text-lg">
                        Leading Nepal's transition into digital finance and tech accessibility through data-driven services.
                    </p>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
                    {topStats.map((stat, i) => (
                        <div key={i} className="bg-white p-5 md:p-6 border border-slate-200 flex flex-col items-center text-center">
                            <h3 className="text-2xl md:text-3xl font-extrabold text-(--colour-fsP1) tracking-tight mb-1 tabular-nums">
                                {stat.prefix}{counts[i]}{stat.suffix}
                            </h3>
                            <p className="text-slate-900 font-semibold mb-1 text-sm md:text-base">{stat.label}</p>
                            <p className="text-slate-500 text-xs font-medium">{stat.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Middle Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

                    {/* Pie Chart */}
                    <div className="bg-white p-6 md:p-8 border border-slate-200 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-50 text-(--colour-fsP2)">
                                <PieChart className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Purchase Distribution</h3>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 flex-1">
                            <div
                                className="w-48 h-48 rounded-full relative flex items-center justify-center shrink-0"
                                style={{ background: 'conic-gradient(var(--colour-fsP1) 0% 60%, var(--colour-fsP2) 60% 85%, #f59e0b 85% 100%)' }}
                            >
                                <div className="w-24 h-24 bg-white rounded-full absolute flex items-center justify-center">
                                    <span className="font-bold text-slate-800 text-xs text-center leading-tight px-1">EMI<br/>Sales</span>
                                </div>
                            </div>

                            <div className="w-full sm:w-auto space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-(--colour-fsP1)" />
                                        <span className="text-sm font-medium text-slate-700">Paperless EMI</span>
                                    </div>
                                    <span className="font-bold text-slate-900">60%</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-(--colour-fsP2)" />
                                        <span className="text-sm font-medium text-slate-700">Credit Card EMI</span>
                                    </div>
                                    <span className="font-bold text-slate-900">25%</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                                        <span className="text-sm font-medium text-slate-700">Direct Purchase</span>
                                    </div>
                                    <span className="font-bold text-slate-900">15%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="bg-white p-6 md:p-8 border border-slate-200 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-orange-50 text-(--colour-fsP1)">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Top Financed Categories</h3>
                        </div>

                        <div className="flex flex-col justify-center space-y-6 flex-1">
                            {bars.map((bar, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex items-center gap-2">
                                            <bar.Icon className="w-4 h-4 text-slate-500" />
                                            <span className="font-semibold text-slate-800">{bar.label}</span>
                                        </div>
                                        <span className={`text-sm font-bold tabular-nums ${bar.textColor}`}>{barWidths[i].toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                                        <div
                                            className={`${bar.color} h-2.5 rounded-full transition-none`}
                                            style={{ width: `${barWidths[i]}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Area Chart */}
                <div className="bg-white p-6 md:p-8 border border-slate-200 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">Annual EMI Finance Disbursed</h3>
                            <p className="text-sm text-slate-500">Total EMI value disbursed year-over-year (Rs. Crore)</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-(--colour-fsP1)" />
                                <span className="text-slate-700">Finance (Rs. Cr)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-(--colour-fsP2)" />
                                <span className="text-slate-700">Orders</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-72 pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorFinance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f86014" stopOpacity={0.5} />
                                        <stop offset="95%" stopColor="#f86014" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1967b3" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#1967b3" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                                    formatter={(value, name) => [
                                        name === 'Finance (Rs. Cr)' ? `Rs. ${value} Cr` : Number(value).toLocaleString(),
                                        name
                                    ]}
                                />
                                <Area type="monotone" dataKey="orders" stroke="#1967b3" fill="url(#colorOrders)" strokeWidth={2} name="Orders" />
                                <Area type="monotone" dataKey="finance" stroke="#f86014" fill="url(#colorFinance)" strokeWidth={2.5} name="Finance (Rs. Cr)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default CompanyStats;
