'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X, Search, Home, BookOpen, Wrench, Store, ShoppingCart, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import MobileSidebar from './sidebarMobile';
import SearchResults from './SearchResults';
import { searchProducts } from '../api/services/product.service';
import { trackSearch } from '@/lib/Analytic';
import { useCartStore } from '../context/CartContext';
import { useAuthStore } from '../context/AuthContext';
import { useShallow } from 'zustand/react/shallow';
import { navbarExtradata } from './NavBar';
import { 
    getSearchHistory, 
    saveSearchTerm, 
    clearSearchHistory, 
    SUGGESTION_KEYWORDS 
} from './SearchUtils';

interface MobileNavClientProps {
    initialNavItems: any[];
}

export default function MobileNavClient({ initialNavItems }: MobileNavClientProps) {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
    const [showMobileNav, setShowMobileNav] = useState(true);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const { setIsCartOpen, setIsWishlistOpen } = useCartStore(useShallow(
        state => ({ setIsCartOpen: state.setIsCartOpen, setIsWishlistOpen: state.setIsWishlistOpen })
    ));

    const BOTTOM_NAV_ITEMS = [
        { label: 'Home', icon: Home, path: '/' },
        { label: 'Blog', icon: BookOpen, path: '/blogs' },
        { label: 'Search', icon: Search, path: null },
        { label: 'Repair', icon: Wrench, path: '/repair' },
        { label: 'EMI Shop', icon: Store, path: '/emi/shop' },
    ];

    useEffect(() => {
        setSearchHistory(getSearchHistory());
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            abortRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        let lastScrollY = window.scrollY;
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setShowMobileNav(currentScrollY < lastScrollY || currentScrollY < 50);
            lastScrollY = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearchChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        const filtered = value.trim()
            ? SUGGESTION_KEYWORDS.filter(item => item.toLowerCase().includes(value.toLowerCase().trim())).slice(0, 4)
            : [];
        setSuggestions(filtered);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        abortRef.current?.abort();

        if (value.length > 2) {
            setIsSearching(true);
            const controller = new AbortController();
            abortRef.current = controller;

            timeoutRef.current = setTimeout(async () => {
                try {
                    const fetchPromise = searchProducts({ search: value, per_page: 5, sort: "newest" });
                    const abortPromise = new Promise<never>((_, reject) => {
                        controller.signal.addEventListener('abort', () =>
                            reject(new DOMException('Search aborted', 'AbortError'))
                        );
                    });
                    const res = await Promise.race([fetchPromise, abortPromise]);
                    setSearchResults(res.data || []);
                    setIsSearching(false);
                    trackSearch(value);
                    saveSearchTerm(value);
                    setSearchHistory(getSearchHistory());
                } catch (e) {
                    if (e instanceof DOMException && e.name === 'AbortError') return;
                    setSearchResults([]);
                    setIsSearching(false);
                }
            }, 500);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    }, []);

    const toggleMobileSearch = () => {
        setMobileSearchVisible(!mobileSearchVisible);
        setSearch("");
        setSearchResults([]);
        setSearchHistory(getSearchHistory());
    };

    return (
        <>
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
                className="sm:hidden p-1.5 rounded-full border border-gray-300 text-slate-700 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:bg-blue-50 transition-all"
            >
                {isMobileMenuOpen ? <X className="h-4 w-4" strokeWidth={2.5} /> : <Menu className="h-4 w-4" strokeWidth={2.5} />}
            </button>

            <MobileSidebar
                open={isMobileMenuOpen}
                toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                initialNavItems={initialNavItems}
                openCart={() => setIsCartOpen(true)}
                openWishlist={() => setIsWishlistOpen(true)}
                navbarExtradata={navbarExtradata}
            />

            <Sheet open={mobileSearchVisible} onOpenChange={toggleMobileSearch}>
                <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl p-0 flex flex-col bg-white lg:hidden [&>button]:hidden">
                    <div className="p-4 bg-white border-b border-gray-100 shrink-0">
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 focus-within:ring-2 focus-within:ring-[var(--colour-fsP2)] focus-within:border-[var(--colour-fsP2)] transition-all">
                            <Search className="w-5 h-5 text-gray-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search for products, brands..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full py-3 bg-transparent border-none focus:outline-none text-sm text-gray-800 placeholder:text-gray-400"
                                autoFocus
                            />
                            {search ? (
                                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-4 w-4" />
                                </button>
                            ) : (
                                <button onClick={toggleMobileSearch} className="text-xs font-semibold text-[var(--colour-fsP2)]">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-gray-50">
                        <SearchResults
                            search={search}
                            isFocused={true}
                            searchHistory={searchHistory}
                            suggestions={suggestions}
                            searchResults={searchResults}
                            isSearching={isSearching}
                            onTriggerSearch={(term) => { setSearch(term); handleSearchChange({ target: { value: term } } as any); }}
                            onClearHistory={() => { clearSearchHistory(); setSearchHistory([]); }}
                            onProductClick={() => setMobileSearchVisible(false)}
                            isMobile={true}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            <div
                className={cn(
                    "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--colour-fsP1)] rounded-t-2xl px-2 py-1.5 transition-transform duration-300 ease-in-out",
                    showMobileNav ? "translate-y-0" : "translate-y-full"
                )}
            >
                <nav className="flex justify-between items-center max-w-md mx-auto px-1">
                    {BOTTOM_NAV_ITEMS.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                if (item.label === 'Search') toggleMobileSearch();
                                else if (item.path) router.push(item.path);
                            }}
                            className={cn(
                                "flex flex-col items-center gap-0.5 p-2 text-[#1a1a1a]",
                                item.label === 'EMI Shop' ? "w-16" : "w-14"
                            )}
                        >
                            <item.icon className="w-5 h-5" strokeWidth={2.5} />
                            <span className={cn("text-[10px] font-bold", item.label === 'EMI Shop' && "whitespace-nowrap")}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>
        </>
    );
}
