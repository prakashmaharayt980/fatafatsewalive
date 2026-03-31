'use client';

import React from 'react';

export default function BlogSkeleton() {
    return (
        <div className="min-h-screen max-w-8xl mx-auto bg-gray-50/50 w-full px-3 sm:px-5 lg:px-6 pt-4 pb-16 animate-in fade-in duration-500">
            {/* ─── Hero Banner Skeleton ─── */}
            <div className="w-full aspect-[21/9] sm:aspect-[25/7] lg:aspect-[32/8] bg-gray-200 rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
            </div>

            {/* ─── Category Pills Skeleton ─── */}
            <div className="mt-6 mb-4 flex items-center gap-2 overflow-hidden">
                {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="flex-shrink-0 h-8 w-24 bg-gray-200 rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                    </div>
                ))}
            </div>

            {/* ─── Main Content Layout ─── */}
            <div className="flex flex-col lg:flex-row gap-5">
                {/* ─── Blog Grid (3/4 Width) ─── */}
                <div className="w-full lg:w-3/4 space-y-6">
                    <div className="flex items-center justify-between py-2">
                        <div className="h-6 w-48 bg-gray-200 rounded-lg relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 12 }, (_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden space-y-3 pb-4 shadow-sm">
                                <div className="aspect-[16/10] bg-gray-200 relative overflow-hidden">
                                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                                </div>
                                <div className="px-3 space-y-2">
                                    <div className="h-4 w-5/6 bg-gray-100 rounded relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                                    </div>
                                    <div className="h-4 w-2/3 bg-gray-100 rounded relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <div className="h-3 w-12 bg-gray-100 rounded-full relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── Sidebar (1/4 Width) ─── */}
                <div className="hidden lg:block w-1/4 space-y-6">
                    <div className="h-6 w-32 bg-gray-200 rounded-lg relative overflow-hidden mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                    </div>
                    <div className="space-y-4">
                        {Array.from({ length: 6 }, (_, i) => (
                            <div key={i} className="flex gap-3 items-center">
                                <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-full bg-gray-100 rounded relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                                    </div>
                                    <div className="h-3 w-16 bg-gray-100 rounded relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite linear;
                }
            `}</style>
        </div>
    );
}
