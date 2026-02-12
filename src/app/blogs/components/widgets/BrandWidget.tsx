'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import RemoteServices from '@/app/api/remoteservice';
import { Store } from 'lucide-react';

const BrandWidget = () => {
    const { data: brands, isLoading } = useSWR('blog-sidebar-brands', () =>
        RemoteServices.getAllBrands().then(res => res.data?.slice(0, 9) || [])
    );

    if (isLoading) return <div className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>;
    if (!brands || brands.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-md hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-5 font-heading flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--colour-fsP2)] to-blue-700 flex items-center justify-center">
                    <Store className="w-4 h-4 text-white" />
                </div>
                Popular Brands
            </h3>
            <div className="grid grid-cols-3 gap-2">
                {brands.map((brand: any) => (
                    <Link
                        key={brand.id}
                        href={`/search?q=${brand.name}`}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white hover:bg-gradient-to-br hover:from-[var(--colour-fsP2)]/10 hover:to-blue-50 hover:shadow-lg transition-all duration-300 border-2 border-gray-100 hover:border-[var(--colour-fsP2)] group"
                    >
                        {/* Brand Image or Initials */}
                        {brand.image ? (
                            <div className="relative w-12 h-12 mb-2">
                                <Image
                                    src={brand.image}
                                    alt={brand.name}
                                    fill
                                    className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-110"
                                />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 group-hover:bg-[var(--colour-fsP2)] flex items-center justify-center mb-2 transition-colors">
                                <span className="text-sm font-bold text-gray-600 group-hover:text-white">
                                    {brand.name.substring(0, 2).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <span className="text-[10px] text-gray-600 font-bold truncate w-full text-center group-hover:text-[var(--colour-fsP2)] transition-colors">
                            {brand.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default BrandWidget;
