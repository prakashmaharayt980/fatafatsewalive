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
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 font-heading flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-600" />
                Popular Brands
            </h3>
            <div className="grid grid-cols-3 gap-3">
                {brands.map((brand: any) => (
                    <Link
                        key={brand.id}
                        href={`/search?q=${brand.name}`} // Or brand page if available
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200 border border-transparent hover:border-blue-100 group"
                    >
                        {/* Assuming brand has image, otherwise fallback */}
                        {brand.image ? (
                            <div className="relative w-8 h-8 mb-1">
                                <Image
                                    src={brand.image}
                                    alt={brand.name}
                                    fill
                                    className="object-contain filter grayscale group-hover:grayscale-0 transition-all"
                                />
                            </div>
                        ) : (
                            <span className="text-xs font-bold text-gray-400 group-hover:text-blue-600 mb-1">
                                {brand.name.substring(0, 2)}
                            </span>
                        )}
                        <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center group-hover:text-gray-900">
                            {brand.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default BrandWidget;
