import React from 'react';

const reviews = [
    {
        name: 'Ramesh Sharma',
        date: '2 months ago',
        rating: 5,
        text: 'Best place to buy phones on EMI in Nepal. The process was super quick and the staff was very helpful. Highly recommended!',
    },
    {
        name: 'Sita Shrestha',
        date: '3 weeks ago',
        rating: 5,
        text: 'Got my laptop delivered within 4 hours in Kathmandu. Authentic products with warranty. Very satisfied with Fatafatsewa.',
    },
    {
        name: 'Bikash Tamang',
        date: '1 week ago',
        rating: 4,
        text: 'Good exchange valuation for my old iPhone. Customer service is responsive and guided me well through the EMI steps.',
    }
];

const GoogleReviews = () => {
    return (
        <section className="py-8 bg-white overflow-hidden">
            <div className="container-responsive w-full max-w-[1280px] mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="font-bold text-slate-800">Review</span>
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-heading mb-4">What Our Customers Say</h2>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold text-slate-900">4.8</span>
                        <div className="flex gap-1 text-[#FF9107]">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                            ))}
                        </div>
                        <span className="text-slate-500 font-poppins text-sm">(2,450+ Reviews)</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((review, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium-sm hover-premium flex flex-col h-full">
                            <div className="flex gap-1 text-[#FF9107] mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                ))}
                            </div>
                            <p className="text-slate-700 font-poppins mb-6 grow italic">"{review.text}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                                    <span className="text-slate-500 text-xs">{review.date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default GoogleReviews;
