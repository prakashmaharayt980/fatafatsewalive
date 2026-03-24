import React from 'react';

const OfficeLocation = () => {
    return (
        <section className="py-16 bg-white">
            <div className="container-responsive w-full max-w-[1280px] mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    <div className="w-full lg:w-1/3">

                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-heading mb-6">Our Headquarters</h2>
                        <p className="text-slate-600 font-poppins text-lg mb-8">
                            We are conveniently located in the heart of Kathmandu. Drop by to check out our physical store or consult with our experts.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl text-[#f86014]">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Address</h4>
                                    <p className="text-slate-600 font-poppins">Sitapaila, Kathmandu<br />Bagmati, Nepal</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl text-[#0474BA]">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Contact</h4>
                                    <p className="text-slate-600 font-poppins">+977-9828711105<br />info@fatafatsewa.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl text-[#0F6600]">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Working Hours</h4>
                                    <p className="text-slate-600 font-poppins">Sunday - Friday<br />10:00 AM - 6:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-2/3 h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-premium-md relative">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14128.423982937082!2d85.27544065!3d27.7140417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb188d3e2646d9%3A0xeab50d8e2003c2ff!2sSitapaila%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Fatafatsewa Office Location"
                            className="absolute inset-0 grayscale-20 hover:grayscale-0 transition-all duration-700"
                        ></iframe>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OfficeLocation;
