import Link from 'next/link';
import Image from 'next/image';
import LazyLoadSection from '@/components/LazyLoadSection';

import CompareWidget from './CompareWidget';
import CategoryWidget from './widgets/CategoryWidget';
import BrandWidget from './widgets/BrandWidget';
import ProductWidget from './widgets/ProductWidget';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const BlogSidebar = () => {
    // Mock data for "Best Tech Deals" - in real app could be fetched


    return (
        <div className="space-y-6 sticky top-24">

            <LazyLoadSection>
                <CompareWidget />
            </LazyLoadSection>

            <LazyLoadSection delay={100}>
                <ProductWidget />
            </LazyLoadSection>

            <LazyLoadSection delay={200}>
                <CategoryWidget />
            </LazyLoadSection>

            <LazyLoadSection delay={300}>
                <BrandWidget />
            </LazyLoadSection>

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
