import React from 'react';

const journey = [
    {
        year: '2020',
        title: 'The Vision Was Born',
        subtitle: 'Service-first Commerce Idea',
        description: [
            'Identified EMI gap in Nepal',
            'Planned service-first model',
            'Built vendor & bank network',
            'Focused on trust, not just sales'
        ],
        type: 'good'
    },
    {
        year: '2021',
        title: 'Launch & Market Entry',
        subtitle: 'From Idea to Launch',
        description: [
            'Platform officially launched',
            'Started with smartphones',
            'Introduced Easy EMI plans',
            'Gained initial customer trust'
        ],
        type: 'good'
    },
    {
        year: '2022',
        title: 'EMI Innovation Year',
        subtitle: 'Affordability Focus',
        description: [
            '0% EMI up to 18 months',
            'Simplified credit EMI process',
            'Partnered with major banks',
            'Improved delivery services'
        ],
        type: 'good'
    },
    {
        year: '2023',
        title: 'Ecosystem Growth',
        subtitle: 'Beyond Products',
        description: [
            'Launched Mobile Exchange',
            'Added Home Appliances',
            'Enhanced customer support',
            'Expanded product range'
        ],
        type: 'good'
    },
    {
        year: '2024',
        title: 'Protection Revolution',
        subtitle: 'Caring Beyond Gadgets',
        description: [
            'Free Mobile Insurance',
            'Theft & Damage Coverage',
            'Accidental & Health Insurance'
        ],
        type: 'good'
    },
    {
        year: '2026',
        title: 'The Growth Vision',
        subtitle: 'Nationwide Expansion',
        description: [
            'Planning Franchises',
            'Advanced Fintech Integration',
            'Nationwide Brand Building',
            'Trusted Retail Ecosystem'
        ],
        type: 'good'
    }
];

const CompanyJourney = () => {
    return (
        <section className="py-16 bg-slate-50">
            <div className="container-responsive max-w-4xl mx-auto w-full px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--colour-fsP2)] font-heading mb-4">Fatafat Sewa Year-by-Year Journey</h2>
                    <p className="text-slate-600 font-poppins text-lg">
                        From Vision to Nepal's Service-Oriented Ecommerce Platform
                    </p>
                </div>

                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                    {journey.map((item, index) => (
                        <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-premium-sm z-10 ${item.type === 'good' ? 'bg-[#1967b3]' : 'bg-[#FF9107]'}`}>
                                {item.type === 'good' ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                )}
                            </div>

                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white border border-slate-100 shadow-premium-sm hover-premium transition-all">
                                <span className={`font-bold tracking-wide text-sm mb-1 block ${item.type === 'good' ? 'text-(--colour-fsP1)' : 'text-[#f86014]'}`}>{item.year}</span>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">{item.title}</h3>
                                {item.subtitle && <p className="text-sm italic text-slate-500 mb-3">{item.subtitle}</p>}
                                <ul className="space-y-1.5 mt-2">
                                    {item.description.map((bullet, idx) => (
                                        <li key={idx} className="text-slate-600 font-poppins text-[15px] flex items-start gap-2">
                                            <span className="text-(--colour-fsP1) text-sm mt-0.5">•</span>
                                            <span>{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CompanyJourney;
