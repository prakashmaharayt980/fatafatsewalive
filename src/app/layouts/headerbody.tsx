'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, User, Heart, Menu, X, ChevronDown, User2Icon, LayoutDashboard, Package, Settings, LogOut, TrendingUp, Clock, History } from 'lucide-react';
import Image from 'next/image';
import imglogo from '@/app/assets/CompanyLogo.webp';

import RemoteServices from '../api/remoteservice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import NavBar from './NavBar';
import { useContextCart } from '../checkout/CartContext1';
import MobileSidebar from './sidebarMobile';
import { ProductDetails } from '../types/ProductDetailsTypes';
import { useAuth } from '../context/AuthContext';

import { trackSearch } from '@/lib/Analytic'
import { navitems } from '@/app/context/GlobalData';

interface HeaderComponentProps {
    initialNavItems: navitems[]
}

const MOCK_TRENDING_SEARCHES = [
    "iPhone 15 Pro Max",
    "Gaming Laptops under 1 Lakh",
    "Samsung S24 Ultra",
    "MacBook Air M2",
    "Wireless Earbuds"
];

const MOCK_SEMANTIC_SUGGESTIONS = [
    "best gaming laptops in nepal",
    "latest iphones 2024",
    "budget smartphones under 20000",
    "4k smart tv 55 inch",
    "noise cancelling headphones",
    "mechanical keyboards for coding",
    "apple watch series 9",
    "samsung top load washing machine"
];

const HeaderComponent = ({ initialNavItems }: HeaderComponentProps) => {
    const { cartItems, setIsCartOpen, setIsWishlistOpen } = useContextCart()
    const { user, isLoggedIn, logout, setloginDailogOpen, isLoading } = useAuth();
    const [mounted, setMounted] = useState(false);

    const router = useRouter();
    const searchRef = useRef(null);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [badgeCount, setBadgeCount] = useState(0); // Initial match server (0)
    const [isBadgeVisible, setIsBadgeVisible] = useState(false); // Initial hidden



    useEffect(() => {
        setMounted(true);
    }, [])

    useEffect(() => {
        // Update badge after hydration, using live items
        const count = cartItems?.items?.length;
        setBadgeCount(count);
        setIsBadgeVisible(count > 0);
    }, [cartItems]);

    const handleLogout = () => {
        logout();
        updateState({ showAccountMenu: false });
    };

    // Consolidated state object
    const [state, setState] = useState({
        search: "",
        searchResults: [] as ProductDetails[],
        semanticSuggestions: [] as string[],
        isFocused: false,
        showSearchDropdown: false,
        isSearching: false,
        isMobileMenuOpen: false,
        showAccountMenu: false,
        showCategoryDrawer: false,
        mobileSearchVisible: false,
        activeTab: 'home' // for mobile navigation
    });



    // Helper function to update state
    const updateState = (updates) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    const handleSearchChange = async (e) => {
        e.stopPropagation();
        const value = e.target.value;

        // Filter semantic suggestions immediately
        const filteredSemantics = value.trim() ?
            MOCK_SEMANTIC_SUGGESTIONS.filter(item => item.toLowerCase().includes(value.toLowerCase().trim())).slice(0, 4)
            : [];

        updateState({
            search: value,
            semanticSuggestions: filteredSemantics,
            showSearchDropdown: true,
            isFocused: true
        });

        // Clear any existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Check if the value has at least 3 characters (including spaces)
        if (value.length > 2) {
            updateState({ isSearching: true, showSearchDropdown: true });

            // Set new timeout
            const timeoutId = setTimeout(async () => {
                try {
                    // Send the raw value with spaces to the API
                    const res = await RemoteServices.searchProducts({ search: value });
                    updateState({
                        searchResults: res.data || [],
                        isSearching: false
                    });
                    trackSearch(value);
                } catch (error) {
                    updateState({
                        searchResults: [],
                        isSearching: false
                    });
                }
            }, 2000);

            setSearchTimeout(timeoutId);
        } else {
            updateState({ showSearchDropdown: value.length > 0, searchResults: [] });
        }
    };

    const handleSearchFocus = () => {
        updateState({ isFocused: true, showSearchDropdown: true });
    };

    const handleProductClick = (product: ProductDetails, e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();

        router.push(`/products/${product.slug}`);
        updateState({ showSearchDropdown: false, mobileSearchVisible: false });
    };

    const handleEnterKeyCategory = (product: ProductDetails, e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();

        router.push(`/category/${product.categories?.[0].slug}?id=${product.categories?.[0].id}`);
        updateState({ showSearchDropdown: false, mobileSearchVisible: false });
    };

    const handleroute = (path) => {
        router.push(path);
        updateState({ isMobileMenuOpen: false });
    };



    const toggleMobileSearch = () => {
        updateState({
            mobileSearchVisible: !state.mobileSearchVisible,
            search: "",
            searchResults: [],
            semanticSuggestions: [],
            showSearchDropdown: false,
            isFocused: false
        });
    };

    const toggleMobileMenu = () => {
        updateState({ isMobileMenuOpen: !state.isMobileMenuOpen });
    };

    const toggleAccountMenu = () => {
        updateState({ showAccountMenu: !state.showAccountMenu });
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close search dropdown
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                updateState({ showSearchDropdown: false });
            }


        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [state.showCategoryDrawer]);



    // Search Results Component
    const SearchResults = ({ isMobile: _isMobile = false }) => (
        <div className={cn(
            "absolute bg-white border w-full sm:min-w-xl border-gray-200 rounded-lg shadow-lg mt-2 max-h-[80vh] overflow-y-auto z-52 flex flex-col pt-1",
        )}>
            {/* 1. Empty State: Trending Searches */}
            {!state.search && state.isFocused && (
                <div className="p-4 flex-col">
                    <div className="flex items-center gap-2 mb-3 px-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trending Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-2 px-1">
                        {MOCK_TRENDING_SEARCHES.map((term, i) => (
                            <button
                                key={i}
                                onClick={(e) => {
                                    updateState({ search: term, isFocused: true, showSearchDropdown: true });
                                    handleSearchChange({ target: { value: term }, stopPropagation: () => { } });
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-[var(--colour-fsP2)] hover:text-white text-gray-700 hover:border-transparent text-sm rounded-full transition-colors border border-gray-200"
                            >
                                <Search className="w-3 h-3 opacity-50" />
                                {term}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. Typing State: Semantic Suggestions */}
            {state.search && state.semanticSuggestions.length > 0 && (
                <div className="border-b border-gray-100 py-1">
                    {state.semanticSuggestions.map((suggestion, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                updateState({ search: suggestion, isFocused: true, showSearchDropdown: true });
                                handleSearchChange({ target: { value: suggestion }, stopPropagation: () => { } });
                            }}
                            className="w-full flex items-center px-4 py-2 hover:bg-gray-50 transition-colors text-left group"
                        >
                            <Search className="w-4 h-4 text-gray-400 mr-3 shrink-0 group-hover:text-[var(--colour-fsP2)]" />
                            <span className="text-[14px] font-medium text-gray-700">{suggestion}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* 3. Products List */}
            {state.search && (
                <div className="flex flex-col">
                    {(state.searchResults.length > 0 || state.isSearching) && (
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Products Match</span>
                        </div>
                    )}

                    {state.isSearching ? (
                        <div className="p-8 text-center w-full text-gray-500 flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--colour-fsP2)] mb-3"></div>
                            <p className="text-sm">Searching the catalog...</p>
                        </div>
                    ) : state.searchResults.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {state.searchResults.slice(0, 5).map((product) => (
                                <div
                                    key={product.id}
                                    onClick={(e) => handleProductClick(product, e)}
                                    className="flex items-center p-3 sm:px-4 hover:bg-blue-50/50 cursor-pointer transition-colors group"
                                >
                                    {product.image && (
                                        <div className="w-12 h-12 mr-4 bg-white border border-gray-100 rounded-lg overflow-hidden flex-shrink-0 group-hover:border-[var(--colour-fsP2)] transition-colors">
                                            <Image
                                                src={product.image.thumb}
                                                alt={product.name}
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
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-sm font-bold text-[var(--colour-fsP2)]">
                                                Rs {product.discounted_price}.
                                            </span>
                                            {product.discounted_price !== product.price && (
                                                <span className="text-xs text-gray-400 line-through">
                                                    Rs {product.price}.
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !state.isSearching && state.search.length > 2 && (
                        <div className="p-8 text-center text-gray-500">
                            <Search className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                            <p className="text-sm">No exact product matches found for <br /><span className="font-semibold text-gray-700">"{state.search}"</span></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <>
            <header className="sticky top-0 z-40 w-full bg-white shadow-sm ">
                {/* Main Header */}
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
                    <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
                        >
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

                        {/* Desktop Search Bar */}
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

                                        className="bg-[var(--colour-fsP2)] text-white px-4 py-2.5 m-0.5 hover:opacity-90 transition-colors rounded-full duration-200 flex items-center justify-center">
                                        <Search className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Desktop Search Results */}
                                {state.showSearchDropdown && <SearchResults />}
                            </div>
                        </div>

                        {/* Right Icons */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <button
                                onClick={toggleMobileSearch}
                                aria-label="Toggle mobile search"
                                className="lg:hidden p-2 rounded-full border border-gray-200 text-gray-600 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:bg-gray-50 transition-all duration-200"
                            >
                                <Search className="h-4 w-4" />
                            </button>


                            {isLoggedIn ? (
                                <>
                                    <div className="relative account-menu">
                                        <button
                                            onClick={toggleAccountMenu}
                                            aria-label="Account menu"
                                            className="hidden sm:flex items-center space-x-1 p-1.5 rounded-full border border-gray-200 text-gray-600 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:bg-gray-50 transition-all"
                                        >
                                            <User className="h-4 w-4" />
                                            <ChevronDown className="h-3 w-3" />
                                        </button>

                                        {/* Account Dropdown */}
                                        {state.showAccountMenu && (
                                            <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                                        {(user?.name || 'User')}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                                        {(user?.email || 'email@example.com')}
                                                    </p>
                                                </div>
                                                <div className="py-1">
                                                    <Link
                                                        href="/profile?tab=overview"
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4 text-gray-500" />
                                                        Dashboard
                                                    </Link>
                                                    <Link
                                                        href="/profile?tab=orders"
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                                    >
                                                        <Package className="w-4 h-4 text-gray-500" />
                                                        My Orders
                                                    </Link>

                                                    <div className="h-px bg-gray-100 my-1"></div>
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
                                        className="relative p-1.5 rounded-full border border-gray-200 text-gray-600 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:bg-gray-50 transition-all"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        {/* Cart badge */}
                                        <span
                                            className={cn(
                                                "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center",
                                                isBadgeVisible ? "" : "hidden" // Always base classes; visibility via state
                                            )}
                                        >
                                            {badgeCount}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setIsWishlistOpen(true)}
                                        aria-label="Open wishlist"
                                        className="relative p-1.5 rounded-full border border-gray-200 text-gray-600 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:bg-gray-50 transition-all"
                                    >
                                        <Heart className="h-4 w-4" />
                                    </button>
                                </>
                            ) :
                                (
                                    <button
                                        onClick={() => setloginDailogOpen(true)}
                                        className="px-5 py-2 bg-[var(--colour-fsP2)] hover:opacity-90 text-white rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                                    >
                                        <span>Sign In</span>
                                        <div className="bg-white/20 p-1 rounded-full">
                                            <User2Icon className="w-4 h-4 text-white" />
                                        </div>
                                    </button>
                                )
                            }







                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={toggleMobileMenu}
                                aria-label="Toggle mobile menu"
                                className="sm:hidden p-1.5 rounded-full border border-gray-200 text-gray-600 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:bg-gray-50 transition-all"
                            >
                                {state.isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
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
                />

                {/* Mobile Search Bar */}
                {state.mobileSearchVisible && (
                    <div className="lg:hidden border-b w-full border-gray-200 bg-gray-50">
                        <div className="max-w-7xl w-full mx-auto px-2 sm:px-4 py-3">
                            <div className="relative" ref={searchRef}>
                                <div className="flex rounded-lg border border-gray-300 bg-white overflow-hidden shadow-sm">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={state.search}
                                        onChange={handleSearchChange}
                                        onFocus={handleSearchFocus}
                                        className="w-full px-4 py-3 bg-transparent border-none focus:outline-none text-sm"
                                        autoFocus
                                    />
                                    <button
                                        onClick={toggleMobileSearch}
                                        aria-label="Close mobile search"
                                        className="px-4 py-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Mobile Search Results */}
                                {state.showSearchDropdown && <SearchResults isMobile={true} />}
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Bar - Desktop Only */}
                <NavBar navbaritems={initialNavItems} />
            </header>
        </>
    );
};

export default HeaderComponent;