import React from 'react';

const journey = [
    {
        year: '2024 (Present)',
        title: 'Market Leaders in tech ecommerce',
        description: 'Surpassed 500K active users. Introduced advanced gadget repair ecosystem.',
        type: 'good'
    },
    {
        year: '2023',
        title: '0% EMI Integration Success',
        description: 'Successfully partnered with all major commercial banks to provide seamless 0% EMI online.',
        type: 'good'
    },
    {
        year: '2022',
        title: 'Supply Chain Challenge',
        description: 'Faced significant supply chain disruptions globally, leading us to build a more robust, decentralized warehousing system.',
        type: 'bad'
    },
    {
        year: '2021',
        title: 'Launch of Fatafatsewa Platform',
        description: 'Officially launched the platform, completing 10,000 orders within the first six months.',
        type: 'good'
    },
    {
        year: '2020',
        title: 'The Inception',
        description: 'Fatafatsewa was conceptualized to bridge the gap in trustworthy online electronics shopping in Nepal.',
        type: 'good'
    }
];

const CompanyJourney = () => {
    return (
        <section className="py-16 bg-slate-50">
            <div className="container-responsive max-w-4xl mx-auto w-full px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-heading mb-4">Our Journey</h2>
                    <p className="text-slate-600 font-poppins text-lg">
                        The road to success isn't a straight line. Here are our major milestones, including the hurdles we've overcome.
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
                                <span className={`font-semibold tracking-wide text-sm mb-1 block ${item.type === 'good' ? 'text-[#1967b3]' : 'text-[#f86014]'}`}>{item.year}</span>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-slate-600 font-poppins">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CompanyJourney;
