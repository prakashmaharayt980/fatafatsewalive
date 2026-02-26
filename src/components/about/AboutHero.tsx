import React from 'react';
import Image from 'next/image';

const AboutHero = () => {
    return (
        <section className="relative bg-white py-16 md:py-24 overflow-hidden">
            <div className="container-responsive relative z-10 w-full max-w-[1280px] mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="w-full md:w-1/2 flex flex-col gap-6 animate-fade-in-premium">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#CDECFF] text-[#0474BA] rounded-full text-sm font-medium w-fit">
                            <span className="w-2 h-2 rounded-full bg-[#0474BA]"></span>
                            About Fatafatsewa
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight font-heading">
                            Empowering Nepal's <span style={{ color: 'var(--colour-fsP1)' }}>Digital</span> Shopping Experience
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed font-poppins">
                            Fatafatsewa is Nepal's premier online shopping destination, committed to delivering quality products, exceptional services, and a seamless shopping experience. From electronics to EMI services, we bring the best right to your doorstep.
                        </p>
                    </div>
                    <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-[500px] rounded-2xl overflow-hidden shadow-premium-lg hover-premium bg-slate-100 flex items-center justify-center">
                        <Image
                            src="https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1200&auto=format&fit=crop"
                            alt="Fatafatsewa Team"
                            fill
                            className="object-cover transition-smooth hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                        <div className="absolute inset-0 bg-linear-to-tr from-[#1967b3]/20 to-transparent pointer-events-none"></div>
                    </div>
                </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-[#1967b3]/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-[#f86014]/5 rounded-full blur-3xl -z-10"></div>
        </section>
    );
};

export default AboutHero;
