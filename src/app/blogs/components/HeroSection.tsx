import React from 'react';
import Image from 'next/image';

interface HeroProps {
    title: string;
    image: string;
    category: string;
    date: string;
    author: string;
    readTime: string;
}

const HeroSection = ({ title, image, category, date, author, readTime }: HeroProps) => {
    return (
        <div className="relative mb-16">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl">
                <div className="flex flex-col items-center text-center mb-8 space-y-6">
                    <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">
                        {category}
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] font-heading max-w-5xl">
                        {title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative">
                                {/* Placeholder for author avatar */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-purple-400"></div>
                            </div>
                            <span className="text-gray-900">{author}</span>
                        </div>
                        <span className="hidden md:inline text-gray-300">•</span>
                        <span>{date}</span>
                        <span className="hidden md:inline text-gray-300">•</span>
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {readTime}
                        </div>
                    </div>
                </div>

                <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
