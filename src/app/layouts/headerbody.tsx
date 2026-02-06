'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, User, Heart, Menu, X, ChevronDown, User2Icon, LayoutDashboard, Package, Settings, LogOut } from 'lucide-react';
import Image from 'next/image';
import imglogo from '../assets/logoimg.png';

import RemoteServices from '../api/remoteservice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import NavBar from './NavBar';
import nvaitemlist from './navitem.json';
import { useContextCart } from '../checkout/CartContext1';
import MobileSidebar from './sidebarMobile';
import { deleteCookie, getCookie } from 'cookies-next';
import { ProductDetails } from '../types/ProductDetailsTypes';
import { useAuth } from '../context/AuthContext';





const HeaderComponent = () => {
    const { cartItems, setIsCartOpen, setIsWishlistOpen } = useContextCart()
    const { authState, logout, setloginDailogOpen } = useAuth();
    const [mounted, setMounted] = useState(false);
    const IsUserLogin = mounted && (!!authState.access_token || !!authState.user || !!getCookie('access_token'));

    const router = useRouter();
    const searchRef = useRef(null);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [badgeCount, setBadgeCount] = useState(0); // Initial match server (0)
    const [isBadgeVisible, setIsBadgeVisible] = useState(false); // Initial hidden
    const [nabrItems, setnabrItems] = useState(nvaitemlist)

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
        showSearchDropdown: false,
        isSearching: false,
        isMobileMenuOpen: false,
        showAccountMenu: false,
        showCategoryDrawer: false,
        mobileSearchVisible: false,
        activeTab: 'home' // for mobile navigation
    });

    useEffect(() => {
        if (nabrItems.length === 0) {
            RemoteServices.getNavbarItems().then((data) => {
                setnabrItems(data)
            })
        }
    }, [nabrItems]);

    // Helper function to update state
    const updateState = (updates) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    const handleSearchChange = async (e) => {
        e.stopPropagation();
        const value = e.target.value;
        updateState({ search: value });

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
                } catch (error) {
                    updateState({
                        searchResults: [],
                        isSearching: false
                    });
                }
            }, 2000);

            setSearchTimeout(timeoutId);
        } else {
            updateState({ showSearchDropdown: false, searchResults: [] });
        }
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
            showSearchDropdown: false
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
            "absolute bg-white border w-full sm:min-w-xl border-gray-200 rounded-lg shadow-lg mt-2 max-h-80 overflow-y-auto z-52",

        )}>
            {state.isSearching ? (
                <div className="p-6 text-center w-full sm:min-w-xl text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--colour-fsP2)] mx-auto mb-2"></div>
                    <p>Searching...</p>
                </div>
            ) : state.searchResults.length > 0 ? (
                <div className="divide-y divide-gray-100">
                    {state.searchResults.map((product) => (
                        <div
                            key={product.id}
                            onClick={(e) => handleProductClick(product, e)}
                            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            {product.image && (
                                <div className="w-12 h-12 mr-3 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={product.image.thumb}
                                        alt={product.name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {product.name}
                                </p>
                                {/* <p className="text-xs text-gray-500 truncate">
                                    in {product.categories?.[0]?.category_full_name}
                                </p> */}
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-sm font-semibold text-[var(--colour-fsP2)]">
                                        Rs {product.discounted_price}.
                                    </span>
                                    {product.discounted_price !== product.price && (
                                        <span className="text-xs text-gray-500 line-through">
                                            Rs {product.price}.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-6 text-center text-gray-500">
                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No products found for &lsquo;{state.search}&lsquo;</p>
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
                        <div
                            className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
                            onClick={() => handleroute('/')}
                        >
                            <Image
                                src={imglogo}
                                alt="Fatafatsewa Logo"
                                width={120}
                                height={40}
                                priority
                                className="rounded-lg w-auto h-7 sm:h-8 lg:h-9 transition-transform duration-200 hover:scale-105"
                            />
                        </div>

                        {/* Desktop Search Bar */}
                        <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-6" ref={searchRef}>
                            <div className="relative w-full">
                                <div className="flex rounded-full border border-gray-300 bg-gray-50 hover:bg-white hover:border-[var(--colour-fsP2)] transition-all duration-200 overflow-hidden focus-within:ring-2 focus-within:ring-[var(--colour-fsP2)] focus-within:border-[var(--colour-fsP2)]">
                                    <input
                                        type="text"
                                        placeholder="Search products, brands..."
                                        value={state.search}
                                        onChange={handleSearchChange}
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


                            {IsUserLogin ? (
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
                                                        {authState.user?.name || 'User'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                                        {authState.user?.email || 'email@example.com'}
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
                    IsUserLogin={IsUserLogin}
                    loginNeed={() => setloginDailogOpen(true)}
                    nvaitemlist={nabrItems}
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
                <NavBar navbaritems={nabrItems} />
            </header>
        </>
    );
};

export default HeaderComponent;