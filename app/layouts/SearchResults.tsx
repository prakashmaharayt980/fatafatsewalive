// src/app/layouts/SearchResults.tsx
import React from 'react';
import Image from 'next/image';
import { Search, History, Clock, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TRENDING_SEARCHES } from './SearchUtils';
import { useRouter } from 'next/navigation';

interface SearchResultsProps {
    search: string;
    isFocused: boolean;
    searchHistory: string[];
    suggestions: string[];
    searchResults: any[];
    isSearching: boolean;
    onTriggerSearch: (term: string) => void;
    onClearHistory: () => void;
    onProductClick: (product: any, e?: React.MouseEvent) => void;
    isMobile?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
    search,
    isFocused,
    searchHistory,
    suggestions,
    searchResults,
    isSearching,
    onTriggerSearch,
    onClearHistory,
    onProductClick,
    isMobile = false
}) => {

    const router = useRouter();
    const handleProductclick = (slug: string) => {
        router.push(`/product-details/${slug}`);
    }


    return (
        <div className={cn(
            "bg-white flex flex-col",
            isMobile
                ? "relative w-full h-full border-none shadow-none"
                : "absolute w-full sm:min-w-xl border border-gray-200 rounded-lg shadow-lg mt-2 max-h-[80vh] overflow-y-auto z-52"
        )}>
            {!search && isFocused && (
                <div className="flex flex-col">
                    {searchHistory.length > 0 && (
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <div className="flex items-center gap-2">
                                    <History className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Searches</span>
                                </div>
                                <button
                                    onClick={onClearHistory}
                                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                {searchHistory.map((term, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onTriggerSearch(term)}
                                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                                    >
                                        <Clock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900">{term}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* <div className="p-4">
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <TrendingUp className="w-4 h-4 text-[var(--colour-fsP2)]" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trending Searches</span>
                        </div>
                        <div className="flex flex-wrap gap-2 px-1">
                            {TRENDING_SEARCHES.map((term, i) => (
                                <button
                                    key={i}
                                    onClick={() => onTriggerSearch(term)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-[var(--colour-fsP2)] hover:text-white text-gray-700 text-sm rounded-full transition-colors border border-gray-200 hover:border-transparent"
                                >
                                    <Search className="w-3 h-3 opacity-50" />
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div> */}
                </div>
            )}

            {/* {search && suggestions.length > 0 && (
                <div className="border-b border-gray-100 py-1">
                    {suggestions.map((suggestion, i) => (
                        <button
                            key={i}
                            onClick={() => onTriggerSearch(suggestion)}
                            className="w-full flex items-center px-4 py-2.5 hover:bg-gray-50 transition-colors text-left group"
                        >
                            <Search className="w-4 h-4 text-gray-400 mr-3 shrink-0 group-hover:text-[var(--colour-fsP2)]" />
                            <span className="text-sm font-medium text-gray-700">{suggestion}</span>
                        </button>
                    ))}
                </div>
            )} */}

            {search && (
                <div className="flex flex-col">
                    {(searchResults.length > 0 || isSearching) && (
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Products Match</span>
                        </div>
                    )}

                    {isSearching ? (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--colour-fsP2)] mb-3" />
                            <p className="text-sm">Searching the catalog...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {searchResults.slice(0, 6).map((product) => (
                                <div
                                    key={product.id}
                                    onClick={(e) => {
                                        handleProductclick(product.slug);
                                        onProductClick(product, e)
                                    }}
                                    className="flex items-center p-3 px-4 hover:bg-blue-50/50 cursor-pointer transition-colors group"
                                >
                                    {product.thumb && (
                                        <div className="w-12 h-12 mr-3 bg-white border border-gray-100 rounded-lg overflow-hidden shrink-0 group-hover:border-[var(--colour-fsP2)] transition-colors">
                                            <Image
                                                src={product.thumb.url}
                                                alt={product.thumb.alt_text || product.name}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-contain p-1"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[var(--colour-fsP2)] transition-colors">
                                            {product.name}
                                        </p>
                                        <span className="text-sm font-bold text-[var(--colour-fsP2)]">
                                            Rs {product.price?.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !isSearching && search.length > 2 && (
                        <div className="p-8 text-center text-gray-500">
                            <Search className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                            <p className="text-sm">No products found for <br /><span className="font-semibold text-gray-700">"{search}"</span></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default React.memo(SearchResults);
