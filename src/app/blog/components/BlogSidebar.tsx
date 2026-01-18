import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import CompareWidget from './CompareWidget';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const BlogSidebar = () => {
    // Mock data for "Best Tech Deals" - in real app could be fetched
    const deals = [
        { id: 1, title: "Samsung Galaxy S24 Ultra", price: "Rs. 1,84,999", image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=200&auto=format&fit=crop" },
        { id: 2, title: "MacBook Air M3", price: "Rs. 1,59,000", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?q=80&w=200&auto=format&fit=crop" },
        { id: 3, title: "Sony WH-1000XM5", price: "Rs. 45,000", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=200&auto=format&fit=crop" },
    ];

    return (
        <div className="space-y-6 sticky top-24">

            <CompareWidget />

            {/* Best Tech Deals Widget */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 font-heading flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                    Best Tech Deals
                </h3>
                <div className="space-y-4">
                    {deals.map((deal) => (
                        <Link href="#" key={deal.id} className="flex gap-3 group items-center">
                            <div className="relative w-14 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                <Image
                                    src={deal.image}
                                    alt={deal.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-blue-600 transition-colors mb-1 truncate">
                                    {deal.title}
                                </h4>
                                <div className="text-blue-600 font-bold text-xs">
                                    {deal.price}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                <button className="w-full mt-4 py-2.5 border border-gray-100 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors text-xs">
                    View All Deals
                </button>
            </div>

            {/* Social Widget - Clean Design */}
            <div className="bg-gray-900 rounded-2xl p-6 text-white text-center">
                <h3 className="font-bold text-lg mb-1 font-heading">Stay Updated</h3>
                <p className="text-gray-400 text-xs mb-5">Get the latest reviews & deals</p>
                <div className="flex justify-center gap-2">
                    {[
                        { icon: Facebook, bg: "hover:bg-[#1877F2]" },
                        { icon: Twitter, bg: "hover:bg-[#1DA1F2]" },
                        { icon: Instagram, bg: "hover:bg-gradient-to-tr hover:from-[#fd5949] hover:to-[#d6249f]" }
                    ].map((item, i) => (
                        <div key={i} className={`w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ${item.bg}`}>
                            <item.icon className="w-5 h-5" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogSidebar;
