import React from 'react';

const services = [
    {
        title: '0% EMI Service',
        description: 'Get your dream electronics with our hassle-free 0% EMI financing options connected with major banks in Nepal.',
        icon: 'credit-card',
        color: 'var(--colour-fsP2)'
    },
    {
        title: 'Exchange Offers',
        description: 'Upgrade your old devices seamlessly with our best-in-market exchange valuation and instant discounts.',
        icon: 'refresh-ccw',
        color: 'var(--colour-fsP1)'
    },
    {
        title: 'Express Delivery',
        description: 'We ensure swift, safe, and reliable doorstep delivery across major cities in Nepal.',
        icon: 'truck',
        color: '#0F6600'
    },
    {
        title: 'Gadget Repair',
        description: 'Expert repair services for smartphones, laptops, and more. Trust our certified technicians.',
        icon: 'tool',
        color: '#FF9107'
    },
    {
        title: 'Genuine Products',
        description: 'We guarantee 100% authentic products with official brand warranties.',
        icon: 'shield-check',
        color: '#0474BA'
    },
    {
        title: 'Corporate Sales',
        description: 'Tailored B2B solutions and bulk purchase discounts for offices and institutions.',
        icon: 'building',
        color: '#1e293b'
    }
];

const OurServices = () => {
    return (
        <section className="py-16 bg-white">
            <div className="container-responsive w-full max-w-[1280px] mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-[#f86014] rounded-full text-sm font-medium w-fit mb-4">
                            <span className="w-2 h-2 rounded-full bg-[#f86014]"></span>
                            What We Do
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-heading">Our Key Services</h2>
                    </div>
                    <p className="text-slate-600 md:w-1/3 text-lg font-poppins">
                        We go beyond just selling products. We provide a complete ecosystem to support your digital lifestyle.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, index) => (
                        <div key={index} className="px-6 py-8 rounded-2xl border border-slate-200 hover:border-transparent bg-white hover-premium transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: `${service.color}15`, color: service.color }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {service.icon === 'credit-card' && <><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></>}
                                    {service.icon === 'refresh-ccw' && <><polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></>}
                                    {service.icon === 'truck' && <><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>}
                                    {service.icon === 'tool' && <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></>}
                                    {service.icon === 'shield-check' && <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></>}
                                    {service.icon === 'building' && <><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></>}
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-(--colour-fsP1) transition-colors">{service.title}</h3>
                            <p className="text-slate-600 font-poppins leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default OurServices;
