'use client';

import React from 'react';

const stats = [
    { label: 'Active Customers', value: '500K+', icon: 'users' },
    { label: 'Products Delivered', value: '1M+', icon: 'package' },
    { label: 'Partner Brands', value: '250+', icon: 'award' },
    { label: 'Team Members', value: '150+', icon: 'briefcase' },
];

const CompanyStats = () => {
    return (
        <section className="py-16 bg-slate-50">
            <div className="container-responsive w-full max-w-[1280px] mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-heading mb-4">Our Scaling Journey</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto font-poppins text-lg">
                        From our humble beginnings to becoming a trusted name in Nepal, our growth story is fueled by your trust.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 md:p-8 rounded-2xl shadow-premium-sm hover-premium text-center border border-slate-100 group">
                            <div className="w-16 h-16 mx-auto bg-[#CDECFF]/50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#1967b3] group-hover:text-white transition-colors duration-300 text-[#1967b3]">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {stat.icon === 'users' && <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>}
                                    {stat.icon === 'package' && <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>}
                                    {stat.icon === 'award' && <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>}
                                    {stat.icon === 'briefcase' && <><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>}
                                </svg>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2" style={{ color: 'var(--colour-fsP1)' }}>{stat.value}</h3>
                            <p className="text-slate-600 font-medium font-poppins">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CompanyStats;
