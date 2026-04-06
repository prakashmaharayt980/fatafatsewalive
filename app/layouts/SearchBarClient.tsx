'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { searchProducts } from '../api/services/product.service';
import { trackSearch } from '@/lib/Analytic';
import SearchResults from './SearchResults';
import {
    getSearchHistory,
    saveSearchTerm,
    clearSearchHistory,
    SUGGESTION_KEYWORDS
} from './SearchUtils';

export default function SearchBarClient() {
    const searchRef = useRef<HTMLDivElement>(null);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setSearchHistory(getSearchHistory());
    }, []);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        const filtered = value.trim()
            ? SUGGESTION_KEYWORDS.filter(item => item.toLowerCase().includes(value.toLowerCase().trim())).slice(0, 4)
            : [];
        setSuggestions(filtered);
        setShowSearchDropdown(true);
        setIsFocused(true);

        if (searchTimeout) clearTimeout(searchTimeout);

        if (value.length > 2) {
            setIsSearching(true);
            const timeoutId = setTimeout(async () => {
                try {
                    const res = await searchProducts({ search: value, per_page: 5, sort: "newest" });
                    setSearchResults(res.data || []);
                    setIsSearching(false);
                    trackSearch(value);
                    saveSearchTerm(value);
                    setSearchHistory(getSearchHistory());
                } catch {
                    setSearchResults([]);
                    setIsSearching(false);
                }
            }, 1000);
            setSearchTimeout(timeoutId);
        } else {
            setSearchResults([]);
            setShowSearchDropdown(value.length > 0);
        }
    };

    const triggerSearch = (term: string) => {
        setSearch(term);
        handleSearchChange({ target: { value: term } } as any);
    };

    return (
        <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-6" ref={searchRef}>
            <div className="relative w-full">
                <div className="flex rounded-full border border-gray-300 bg-gray-50 hover:bg-white hover:border-[var(--colour-fsP2)] transition-all duration-200 overflow-hidden focus-within:ring-2 focus-within:ring-[var(--colour-fsP2)] focus-within:border-[var(--colour-fsP2)]">
                    <input
                        type="text"
                        placeholder="Search products, brands..."
                        value={search}
                        onChange={handleSearchChange}
                        onFocus={() => { setIsFocused(true); setShowSearchDropdown(true); }}
                        className="w-full px-4 py-2.5 bg-transparent border-none focus:outline-none text-sm placeholder-gray-500"
                    />
                    <button
                        aria-label="Search"
                        className="bg-[var(--colour-fsP2)] text-white px-4 py-2.5 m-0.5 hover:opacity-90 transition-colors rounded-full duration-200 flex items-center justify-center"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </div>
                {showSearchDropdown && (
                    <SearchResults
                        search={search}
                        isFocused={isFocused}
                        searchHistory={searchHistory}
                        suggestions={suggestions}
                        searchResults={searchResults}
                        isSearching={isSearching}
                        onTriggerSearch={triggerSearch}
                        onClearHistory={() => { clearSearchHistory(); setSearchHistory([]); }}
                        onProductClick={() => setShowSearchDropdown(false)}
                        isMobile={false}
                    />
                )}
            </div>
        </div>
    );
}
