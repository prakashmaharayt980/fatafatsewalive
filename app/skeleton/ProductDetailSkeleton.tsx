import React from 'react'

export default function ProductDetailSkeleton() {
  return (
      <div className="min-h-screen bg-gray-50 pb-20">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    {/* Breadcrumb skeleton */}
                    <div className="flex gap-2 mb-6">
                        <div className="h-5 w-14 bg-gray-200 rounded animate-pulse" />
                        <div className="h-5 w-3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="h-5 w-3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-5 lg:gap-6">
                        {/* Image skeleton */}
                        <div className="md:col-span-1 lg:col-span-4">
                            <div className="w-full aspect-square max-h-[420px] bg-gray-200 rounded-2xl animate-pulse" />
                            <div className="flex gap-1.5 mt-2">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-14 h-14 bg-gray-200 rounded-lg animate-pulse" />)}
                            </div>
                        </div>
                        {/* BuyBox skeleton */}
                        <div className="md:col-span-1 lg:col-span-5">
                            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-4">
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                <div className="h-7 w-3/4 bg-gray-200 rounded animate-pulse" />
                                <div className="h-10 w-1/3 bg-gray-200 rounded animate-pulse" />
                                <div className="space-y-2">
                                    {[1, 2, 3].map(i => <div key={i} className="h-4 w-full bg-gray-100 rounded animate-pulse" />)}
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <div className="h-11 flex-1 bg-gray-200 rounded-xl animate-pulse" />
                                    <div className="h-11 flex-1 bg-gray-200 rounded-xl animate-pulse" />
                                    <div className="h-11 flex-1 bg-gray-200 rounded-xl animate-pulse" />
                                </div>
                            </div>
                        </div>
                        {/* Sidebar skeleton */}
                        <div className="hidden lg:block lg:col-span-3">
                            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                                <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
                                <div className="w-full aspect-video bg-gray-200 rounded-xl animate-pulse" />
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-16 h-14 bg-gray-200 rounded-lg animate-pulse shrink-0" />
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                                            <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
  )
}
