'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, ShoppingCart, User, Heart, Menu, X, ChevronDown, User2Icon, LayoutDashboard, Package, LogOut, TrendingUp, Clock, History, Home, BookOpen, Wrench, Store } from 'lucide-react';
import Image from 'next/image';
import imglogo from '@/app/assets/CompanyLogo.webp';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from "@/components/ui/sheet";


import MobileSidebar from './sidebarMobile';
import { useAuthStore } from '../context/AuthContext';


import { trackSearch } from '@/lib/Analytic';
import { NavbarItem } from '@/app/context/GlobalData';
import { ProductService } from '../api/services/product.service';
import { useCartStore } from '../context/CartContext';
import { useShallow } from 'zustand/react/shallow';
import NavBar, { navbarExtradata } from './NavBar';

interface HeaderBodyProps {
    initialNavItems: NavbarItem[]
}

interface HeaderState {
    search: string;
    searchResults: any[];
    suggestions: string[];
    isFocused: boolean;
    showSearchDropdown: boolean;
    isSearching: boolean;
    isMobileMenuOpen: boolean;
    showAccountMenu: boolean;
    mobileSearchVisible: boolean;
    showMobileNav: boolean;
}

const TRENDING_SEARCHES = [
    "iPhone 15 Pro Max",
    "Gaming Laptops under 1 Lakh",
    "Samsung S24 Ultra",
    "MacBook Air M2",
    "Wireless Earbuds"
];

const SUGGESTION_KEYWORDS = [
    "best gaming laptops in nepal",
    "latest iphones 2024",
    "budget smartphones under 20000",
    "4k smart tv 55 inch",
    "noise cancelling headphones",
    "mechanical keyboards for coding",
    "apple watch series 9",
    "samsung top load washing machine"
];

const BOTTOM_NAV_ITEMS = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Blog', icon: BookOpen, path: '/blogs' },
    { label: 'Search', icon: Search, path: null },
    { label: 'Repair', icon: Wrench, path: '/repair' },
    { label: 'EMI Shop', icon: Store, path: '/emi' },
];

const SEARCH_HISTORY_KEY = 'fs_search_history';

const getSearchHistory = (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]').slice(0, 5);
    } catch { return []; }
};

const saveSearchTerm = (term: string) => {
    if (typeof window === 'undefined' || !term.trim()) return;
    try {
        const history = getSearchHistory().filter(h => h !== term);
        history.unshift(term);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
    } catch { /* noop */ }
};

const clearSearchHistory = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SEARCH_HISTORY_KEY);
};

const HeaderBody = ({ initialNavItems }: HeaderBodyProps) => {
    const { cartItems, setIsCartOpen, setIsWishlistOpen } = useCartStore(useShallow(
        state => ({ cartItems: state.cartItems, setIsCartOpen: state.setIsCartOpen, setIsWishlistOpen: state.setIsWishlistOpen })
    ));
    const { user, isLoggedIn, logout, setloginDailogOpen } = useAuthStore(useShallow(state => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        logout: state.logout,
        setloginDailogOpen: state.setloginDailogOpen
    })));

    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [badgeCount, setBadgeCount] = useState(0);
    const [isBadgeVisible, setIsBadgeVisible] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    const [state, setState] = useState<HeaderState>({
        search: "",
        searchResults: [],
        suggestions: [],
        isFocused: false,
        showSearchDropdown: false,
        isSearching: false,
        isMobileMenuOpen: false,
        showAccountMenu: false,
        mobileSearchVisible: false,
        showMobileNav: true,
    });

    const updateState = useCallback((updates: Partial<HeaderState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    useEffect(() => {
        setSearchHistory(getSearchHistory());
    }, []);

    useEffect(() => {
        let lastScrollY = window.scrollY;
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            updateState({
                showMobileNav: currentScrollY < lastScrollY || currentScrollY < 50
            });
            lastScrollY = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [updateState]);

    useEffect(() => {
        const count = cartItems?.items?.length || 0;
        setBadgeCount(count);
        setIsBadgeVisible(count > 0);
    }, [cartItems]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                updateState({ showSearchDropdown: false });
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [updateState]);

    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const value = e.target.value;

        const filtered = value.trim()
            ? SUGGESTION_KEYWORDS.filter(item => item.toLowerCase().includes(value.toLowerCase().trim())).slice(0, 4)
            : [];

        updateState({
            search: value,
            suggestions: filtered,
            showSearchDropdown: true,
            isFocused: true
        });

        if (searchTimeout) clearTimeout(searchTimeout);

        if (value.length > 2) {
            updateState({ isSearching: true, showSearchDropdown: true });
            const timeoutId = setTimeout(async () => {
                try {
                    const res = await ProductService.searchProducts({ search: value, per_page: 5, sort: "newest" });
                    updateState({ searchResults: res.data || [], isSearching: false });
                    trackSearch(value);
                    saveSearchTerm(value);
                    setSearchHistory(getSearchHistory());
                } catch {
                    updateState({ searchResults: [], isSearching: false });
                }
            }, 1000);
            setSearchTimeout(timeoutId);
        } else {
            updateState({ showSearchDropdown: value.length > 0, searchResults: [] });
        }
    };

    const handleSearchFocus = () => {
        updateState({ isFocused: true, showSearchDropdown: true });
    };

    const handleProductClick = (product: any, e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        router.push(`/products/${product.slug}`);
        updateState({ showSearchDropdown: false, mobileSearchVisible: false });
    };

    const toggleMobileSearch = () => {
        updateState({
            mobileSearchVisible: !state.mobileSearchVisible,
            search: "",
            searchResults: [],
            suggestions: [],
            showSearchDropdown: false,
            isFocused: false
        });
        setSearchHistory(getSearchHistory());
    };

    const toggleMobileMenu = () => updateState({ isMobileMenuOpen: !state.isMobileMenuOpen });
    const toggleAccountMenu = () => updateState({ showAccountMenu: !state.showAccountMenu });
    const handleLogout = () => { logout(); updateState({ showAccountMenu: false }); };

    const triggerSearch = (term: string) => {
        updateState({ search: term, isFocused: true, showSearchDropdown: true });
        handleSearchChange({ target: { value: term }, stopPropagation: () => { } } as any);
    };

    const SearchResults = ({ isMobile = false }) => (
        <div className={cn(
            "bg-white flex flex-col",
            isMobile
                ? "relative w-full h-full border-none shadow-none"
                : "absolute w-full sm:min-w-xl border border-gray-200 rounded-lg shadow-lg mt-2 max-h-[80vh] overflow-y-auto z-52"
        )}>
            {!state.search && state.isFocused && (
                <div className="flex flex-col">
                    {searchHistory.length > 0 && (
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <div className="flex items-center gap-2">
                                    <History className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Searches</span>
                                </div>
                                <button
                                    onClick={() => { clearSearchHistory(); setSearchHistory([]); }}
                                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                {searchHistory.map((term, i) => (
                                    <button
                                        key={i}
                                        onClick={() => triggerSearch(term)}
                                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                                    >
                                        <Clock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900">{term}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <TrendingUp className="w-4 h-4 text-[var(--colour-fsP2)]" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trending Searches</span>
                        </div>
                        <div className="flex flex-wrap gap-2 px-1">
                            {TRENDING_SEARCHES.map((term, i) => (
                                <button
                                    key={i}
                                    onClick={() => triggerSearch(term)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-[var(--colour-fsP2)] hover:text-white text-gray-700 text-sm rounded-full transition-colors border border-gray-200 hover:border-transparent"
                                >
                                    <Search className="w-3 h-3 opacity-50" />
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {state.search && state.suggestions.length > 0 && (
                <div className="border-b border-gray-100 py-1">
                    {state.suggestions.map((suggestion, i) => (
                        <button
                            key={i}
                            onClick={() => triggerSearch(suggestion)}
                            className="w-full flex items-center px-4 py-2.5 hover:bg-gray-50 transition-colors text-left group"
                        >
                            <Search className="w-4 h-4 text-gray-400 mr-3 shrink-0 group-hover:text-[var(--colour-fsP2)]" />
                            <span className="text-sm font-medium text-gray-700">{suggestion}</span>
                        </button>
                    ))}
                </div>
            )}

            {state.search && (
                <div className="flex flex-col">
                    {(state.searchResults.length > 0 || state.isSearching) && (
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Products Match</span>
                        </div>
                    )}

                    {state.isSearching ? (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--colour-fsP2)] mb-3" />
                            <p className="text-sm">Searching the catalog...</p>
                        </div>
                    ) : state.searchResults.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {state.searchResults.slice(0, 6).map((product) => (
                                <div
                                    key={product.id}
                                    onClick={(e) => handleProductClick(product, e)}
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
                    ) : !state.isSearching && state.search.length > 2 && (
                        <div className="p-8 text-center text-gray-500">
                            <Search className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                            <p className="text-sm">No products found for <br /><span className="font-semibold text-gray-700">"{state.search}"</span></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <>
            <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
                    <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
                        <Link href="/" className="flex items-center space-x-2 cursor-pointer shrink-0">
                            <Image
                                src={imglogo}
                                alt="Fatafatsewa Logo"
                                width={120}
                                height={30}
                                priority
                                sizes="120px"
                                className="rounded-lg w-auto h-7 sm:h-8 lg:h-9 transition-transform duration-200 hover:scale-105"
                            />
                        </Link>

                        <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-6" ref={searchRef}>
                            <div className="relative w-full">
                                <div className="flex rounded-full border border-gray-300 bg-gray-50 hover:bg-white hover:border-[var(--colour-fsP2)] transition-all duration-200 overflow-hidden focus-within:ring-2 focus-within:ring-[var(--colour-fsP2)] focus-within:border-[var(--colour-fsP2)]">
                                    <input
                                        type="text"
                                        placeholder="Search products, brands..."
                                        value={state.search}
                                        onChange={handleSearchChange}
                                        onFocus={handleSearchFocus}
                                        className="w-full px-4 py-2.5 bg-transparent border-none focus:outline-none text-sm placeholder-gray-500"
                                    />
                                    <button
                                        aria-label="Search"
                                        className="bg-[var(--colour-fsP2)] text-white px-4 py-2.5 m-0.5 hover:opacity-90 transition-colors rounded-full duration-200 flex items-center justify-center"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                </div>
                                {state.showSearchDropdown && <SearchResults />}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-3">
                            {isLoggedIn ? (
                                <>
                                    <div className="relative account-menu">
                                        <button
                                            onClick={toggleAccountMenu}
                                            aria-label="Account menu"
                                            className="hidden sm:flex items-center space-x-1 p-1.5 rounded-full border border-gray-300 text-slate-700 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:bg-blue-50 transition-all"
                                        >
                                            <User className="h-4 w-4" strokeWidth={2.5} />
                                            <ChevronDown className="h-3 w-3" strokeWidth={2.5} />
                                        </button>

                                        {state.showAccountMenu && (
                                            <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || 'email@example.com'}</p>
                                                </div>
                                                <div className="py-1">
                                                    {[
                                                        { href: '/profile?tab=overview', icon: LayoutDashboard, label: 'Dashboard' },
                                                        { href: '/profile?tab=orders', icon: Package, label: 'My Orders' },
                                                    ].map((item) => (
                                                        <Link
                                                            key={item.href}
                                                            href={item.href}
                                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                                        >
                                                            <item.icon className="w-4 h-4 text-gray-500" />
                                                            {item.label}
                                                        </Link>
                                                    ))}
                                                    <div className="h-px bg-gray-100 my-1" />
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Logout
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setIsCartOpen(true)}
                                        aria-label="Open cart"
                                        className="relative p-1.5 rounded-full border border-gray-300 text-slate-700 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:bg-blue-50 transition-all"
                                    >
                                        <ShoppingCart className="h-4 w-4" strokeWidth={2.5} />
                                        <span
                                            className={cn(
                                                "absolute -top-1 -right-1 bg-[var(--colour-fsP1)] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center",
                                                isBadgeVisible ? "" : "hidden"
                                            )}
                                        >
                                            {badgeCount}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setIsWishlistOpen(true)}
                                        aria-label="Open wishlist"
                                        className="relative p-1.5 rounded-full border border-gray-300 text-slate-700 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:bg-blue-50 transition-all"
                                    >
                                        <Heart className="h-4 w-4" strokeWidth={2.5} />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setloginDailogOpen(true)}
                                    className="px-5 py-2 bg-[var(--colour-fsP2)] hover:opacity-90 text-white rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                                >
                                    <span>Sign In</span>
                                    <div className="bg-white/20 p-1 rounded-full">
                                        <User2Icon className="w-4 h-4 text-white" />
                                    </div>
                                </button>
                            )}

                            <button
                                onClick={toggleMobileMenu}
                                aria-label="Toggle mobile menu"
                                className="sm:hidden p-1.5 rounded-full border border-gray-300 text-slate-700 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:bg-blue-50 transition-all"
                            >
                                {state.isMobileMenuOpen ? <X className="h-4 w-4" strokeWidth={2.5} /> : <Menu className="h-4 w-4" strokeWidth={2.5} />}
                            </button>
                        </div>
                    </div>
                </div>

                <MobileSidebar
                    open={state.isMobileMenuOpen}
                    toggleMobileMenu={toggleMobileMenu}
                    initialNavItems={initialNavItems}
                    openCart={() => setIsCartOpen(true)}
                    openWishlist={() => setIsWishlistOpen(true)}
                    navbarExtradata={navbarExtradata}
                />

                <Sheet open={state.mobileSearchVisible} onOpenChange={toggleMobileSearch}>
                    <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl p-0 flex flex-col bg-white lg:hidden [&>button]:hidden">
                        <div className="p-4 bg-white border-b border-gray-100 shrink-0">
                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 focus-within:ring-2 focus-within:ring-[var(--colour-fsP2)] focus-within:border-[var(--colour-fsP2)] transition-all">
                                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search for products, brands..."
                                    value={state.search}
                                    onChange={handleSearchChange}
                                    onFocus={handleSearchFocus}
                                    className="w-full py-3 bg-transparent border-none focus:outline-none text-sm text-gray-800 placeholder:text-gray-400"
                                    autoFocus
                                />
                                {state.search ? (
                                    <button
                                        onClick={() => updateState({ search: "", searchResults: [], suggestions: [] })}
                                        className="text-gray-400 hover:text-gray-600 shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={toggleMobileSearch}
                                        className="text-xs font-semibold text-[var(--colour-fsP2)] shrink-0"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-gray-50">
                            <SearchResults isMobile={true} />
                        </div>
                    </SheetContent>
                </Sheet>

                <NavBar navbaritems={initialNavItems} />
            </header>

            <div
                className={cn(
                    "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--colour-fsP1)] rounded-t-2xl px-2 py-1.5 transition-transform duration-300 ease-in-out",
                    state.showMobileNav ? "translate-y-0" : "translate-y-full"
                )}
            >
                <nav className="flex justify-between items-center max-w-md mx-auto px-1" aria-label="Mobile navigation">
                    {BOTTOM_NAV_ITEMS.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                if (item.label === 'Search') {
                                    toggleMobileSearch();
                                } else if (item.path) {
                                    router.push(item.path);
                                }
                            }}
                            aria-label={`Navigate to ${item.label}`}
                            className={cn(
                                "flex flex-col items-center gap-0.5 p-2 text-[#1a1a1a] hover:text-white active:text-white/80 transition-colors",
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
};

export default HeaderBody;