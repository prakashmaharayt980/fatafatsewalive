'use client';

import React from 'react';
import Image from 'next/image';

const partnerCategories = [
    {
        title: 'Banking & EMI Partners',
        description: '0% EMI facility available through 20+ commercial banks.',
        color: 'var(--colour-fsP1)',
        partners: [
            { name: 'Global IME', year: '2021', logo: 'https://placehold.co/200x100/ffffff/1967b3?text=Global+IME&font=Montserrat' },
            { name: 'NIC Asia', year: '2022', logo: 'https://placehold.co/200x100/ffffff/e11d48?text=NIC+Asia&font=Montserrat' },
            { name: 'Nabil Bank', year: '2022', logo: 'https://placehold.co/200x100/ffffff/16a34a?text=Nabil+Bank&font=Montserrat' },
            { name: 'Standard Chartered', year: '2023', logo: 'https://placehold.co/200x100/ffffff/0284c7?text=SCB&font=Montserrat' },
        ]
    },
    {
        title: 'International Payments',
        description: 'Seamlessly accepting payments globally.',
        color: '#0474BA',
        partners: [
            { name: 'Visa', year: '2020', logo: 'https://placehold.co/200x100/ffffff/1e3a8a?text=Visa&font=Montserrat' },
            { name: 'Mastercard', year: '2020', logo: 'https://placehold.co/200x100/ffffff/f59e0b?text=Mastercard&font=Montserrat' },
            { name: 'Fonepay', year: '2021', logo: 'https://placehold.co/200x100/ffffff/0f766e?text=Fonepay&font=Montserrat' },
        ]
    },
    {
        title: 'Insurance Partners',
        description: '1-year breakage and extended warranty coverage.',
        color: '#0F6600',
        partners: [
            { name: 'Shikhar', year: '2022', logo: 'https://placehold.co/200x100/ffffff/047857?text=Shikhar+Ins&font=Montserrat' },
            { name: 'Neco', year: '2023', logo: 'https://placehold.co/200x100/ffffff/0369a1?text=Neco+Ins&font=Montserrat' },
        ]
    },
    {
        title: 'Exchange & Repair',
        description: 'Certified technicians and best exchange valuations.',
        color: '#FF9107',
        partners: [
            { name: 'Apple Auth', year: '2021', logo: 'https://placehold.co/200x100/ffffff/334155?text=Apple+Auth&font=Montserrat' },
            { name: 'Samsung Care', year: '2022', logo: 'https://placehold.co/200x100/ffffff/1d4ed8?text=Samsung+Care&font=Montserrat' },
        ]
    },
    {
        title: 'Delivery Teams',
        description: 'Lightning fast delivery across Nepal.',
        color: '#1e293b',
        partners: [
            { name: 'Upaya', year: '2021', logo: 'https://placehold.co/200x100/ffffff/dc2626?text=Upaya&font=Montserrat' },
            { name: 'Pathao', year: '2022', logo: 'https://placehold.co/200x100/ffffff/ea580c?text=Pathao&font=Montserrat' },
        ]
    }
];

const CompanyPartners = () => {
    return (
        <section className="py-20 bg-slate-50 border-t border-slate-200">
            <div className="container-responsive w-full max-w-[1280px] mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 text-slate-800 rounded-full text-sm font-medium w-fit mb-4 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                        Our Ecosystem
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 font-heading mb-4 leading-tight">Our Trusted Partners</h2>
                    <p className="text-slate-600 font-poppins text-lg max-w-2xl mx-auto">
                        We collaborate with industry leaders to ensure you receive top-notch services—from secure payments to quick deliveries.
                    </p>
                </div>

                <div className="space-y-16">
                    {partnerCategories.map((category, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2" style={{ color: category.color }}>
                                {category.title}
                            </h3>
                            <p className="text-slate-500 font-poppins text-sm md:text-base mb-8 max-w-xl">
                                {category.description}
                            </p>

                            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                                {category.partners.map((partner, pIndex) => (
                                    <div
                                        key={pIndex}
                                        className="relative group w-[120px] md:w-[150px] h-20 md:h-24 bg-white rounded-xl border border-slate-100 flex items-center justify-center p-4 hover:shadow-premium-md transition-all hover:-translate-y-1"
                                    >
                                        <div className="absolute -top-2 -right-2 bg-white px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500 shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            Since {partner.year}
                                        </div>
                                        {/* We use standard img to allow unconfigured domains like placehold.co */}
                                        <img
                                            src={partner.logo}
                                            alt={`${partner.name} logo`}
                                            className="w-full h-full object-contain grayscale-20 group-hover:grayscale-0 transition-all duration-300"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CompanyPartners;
