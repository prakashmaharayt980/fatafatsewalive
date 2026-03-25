'use client';
import React, { useEffect } from 'react';
import { getCookie } from 'cookies-next';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WishlistService } from '../api/services/wishlist';
import type { BasketProduct } from '../types/ProductDetailsTypes';
import { CartService } from '../api/services/cart.service';
import { trackAddToCart } from '@/lib/Analytic';
import type { ShippingAddress } from '../checkout/checkoutTypes';
import { AddressService } from '../api/services/address.service';

interface CartItem {
    id: number;
    cart_id: number;
    product_id: number;
    quantity: number;
    price: number;
    product_attributes: [];
    product: BasketProduct;
    subtotal: number;
    varientcolour?: string;
}

interface CartResponse {
    id: number;
    user_id: number;
    discount_coupon: string | null;
    items: CartItem[];
    cart_total: number;
    created_at: string;
    updated_at: string;
}

interface CartStore {
    // State
    cartItems: CartResponse | undefined;
    wishlistItems: BasketProduct[];
    wishlistMap: Record<number, number>;
    isCartOpen: boolean;
    isWishlistOpen: boolean;
    compareItems: BasketProduct[];
    guestAddresses: ShippingAddress[];

    // Setters
    setIsCartOpen: (open: boolean) => void;
    setIsWishlistOpen: (open: boolean) => void;
    setCompareItems: React.Dispatch<React.SetStateAction<BasketProduct[]>>;

    // Guest Actions
    addGuestAddress: (address: ShippingAddress) => void;
    updateGuestAddress: (id: number, address: ShippingAddress) => void;
    deleteGuestAddress: (id: number) => void;
    clearGuestData: () => void;

    // Cart actions
    fetchCart: () => Promise<void>;
    addToCart: (
        id: number,
        quantity: number,
        authState: { isLoggedIn: boolean },
        triggerLoginAlert: () => void,
        product?: BasketProduct, // New optional parameter for offline mode
        varientcolour?: string
    ) => Promise<void>;
    deleteFromCart: (id: number) => Promise<void>;
    CartUpdateQuantity: (id: number, quantity: number, varientcolour?: string) => Promise<void>;

    // Wishlist actions
    fetchWishlist: () => Promise<void>;
    addToWishlist: (
        id: number,
        user: unknown,
        triggerLoginAlert: () => void,
        product?: BasketProduct // New optional parameter for offline mode
    ) => Promise<void>;
    removeFromWishlist: (id: number) => Promise<void>;

    // Compare actions
    addToCompare: (product: BasketProduct) => void;
    removeFromCompare: (id: number) => void;
    isInCompare: (id: number) => boolean;
    clearCompare: () => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            cartItems: undefined,
            wishlistItems: [],
            wishlistMap: {},
            isCartOpen: false,
            isWishlistOpen: false,
            compareItems: [],
            guestAddresses: [],

            // Guest Address Actions
            addGuestAddress: (address) =>
                set((state) => ({ 
                    guestAddresses: [...state.guestAddresses, { ...address, id: Date.now() + Math.floor(Math.random() * 1000) }] 
                })),
            updateGuestAddress: (id, address) =>
                set((state) => ({ 
                    guestAddresses: state.guestAddresses.map((a) => (a.id === id ? { ...a, ...address } : a)) 
                })),
            deleteGuestAddress: (id) =>
                set((state) => ({ 
                    guestAddresses: state.guestAddresses.filter((a) => a.id !== id) 
                })),
            clearGuestData: () => 
                set({ guestAddresses: [], cartItems: undefined, wishlistItems: [], wishlistMap: {} }),

            setIsCartOpen: (open) => set({ isCartOpen: open }),
            setIsWishlistOpen: (open) => set({ isWishlistOpen: open }),

            setCompareItems: (action) =>
                set((state) => ({
                    compareItems:
                        typeof action === 'function' ? action(state.compareItems) : action,
                })),

            fetchCart: async () => {
                try {
                    const res = await CartService.CartList();
                    set({ cartItems: res.data });
                } catch (err) {
                    console.error('Error fetching cart:', err);
                }
            },

            CartUpdateQuantity: async (id, quantity, varientcolour) => {
                const { cartItems } = get();
                const item = cartItems?.items?.find((i) => i.id === id);
                
                // If it's a completely local fake cart item (cart_id === 0)
                if (item && item.cart_id === 0) {
                    const localItems = cartItems!.items.map(i => {
                        if (i.id === id) {
                            return { 
                                ...i, 
                                quantity, 
                                subtotal: i.price * quantity,
                                varientcolour: varientcolour || i.varientcolour
                            };
                        }
                        return i;
                    });
                    const cart_total = localItems.reduce((acc, i) => acc + i.subtotal, 0);
                    set({ cartItems: { ...cartItems!, items: localItems, cart_total } });
                    return;
                }

                try {
                    const res = await CartService.CartUpdate(id, { quantity, varientcolour });
                    set({ cartItems: res.data });
                } catch (err) {
                    console.error('Error updating cart quantity:', err);
                    await get().fetchCart();
                }
            },

            addToCart: async (id, quantity, authState, triggerLoginAlert, product, varientcolour) => {
                if (!authState.isLoggedIn) {
                    // ─── OFFLINE GUEST CART ───
                    const { cartItems } = get();
                    let localItems = cartItems?.items ? [...cartItems.items] : [];
                    
                    const existingItem = localItems.find((i) => i.product_id === id);
                    
                    if (existingItem) {
                        existingItem.quantity += quantity;
                        existingItem.subtotal = existingItem.price * existingItem.quantity;
                        if (varientcolour) existingItem.varientcolour = varientcolour;
                    } else if (product) {
                        const price = typeof product.price === 'object' ? (product.price as any).current : product.price;
                        const finalPrice = product.discounted_price && product.discounted_price > 0 ? product.discounted_price : price;
                        
                        localItems.push({
                            id: Date.now() + Math.floor(Math.random() * 1000), // Generate unique local id
                            cart_id: 0,
                            product_id: id,
                            quantity,
                            price: finalPrice,
                            product_attributes: [],
                            product: product,
                            subtotal: finalPrice * quantity,
                            varientcolour: varientcolour || (product.attributes?.Color as string) || (product.attributes?.color as string)
                        });
                    }
                    
                    const cart_total = localItems.reduce((acc, item) => acc + item.subtotal, 0);
                    
                    set({ 
                        cartItems: { 
                            ...cartItems, 
                            id: cartItems?.id || 0,
                            user_id: 0,
                            discount_coupon: null,
                            created_at: cartItems?.created_at || new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            items: localItems, 
                            cart_total 
                        } as CartResponse, 
                        isCartOpen: true 
                    });
                    
                    if (product) trackAddToCart(product, quantity);
                    return;
                }

                // ─── API AUTHENTICATED CART ───
                const { cartItems, CartUpdateQuantity, fetchCart } = get();
                const existingItem = cartItems?.items?.find((i) => i.product_id === id);

                if (existingItem) {
                    await CartUpdateQuantity(existingItem.id, existingItem.quantity + quantity, varientcolour);
                    set({ isCartOpen: true });
                    trackAddToCart(existingItem.product, quantity);
                    return;
                }

                try {
                    const res = await CartService.CreateCart({ product_id: id, quantity, varientcolour });
                    set({ cartItems: res.data, isCartOpen: true });

                    const newProduct = res.data?.items?.find(
                        (item: CartItem) => item.product_id === id
                    )?.product;
                    if (newProduct) trackAddToCart(newProduct, quantity);
                } catch (err) {
                    console.error('Error adding to cart:', err);
                    await fetchCart();
                }
            },

            deleteFromCart: async (id) => {
                const { cartItems } = get();
                const item = cartItems?.items?.find(i => i.id === id);
                
                // Offline delete
                if (item && item.cart_id === 0) {
                    const localItems = cartItems!.items.filter(i => i.id !== id);
                    const cart_total = localItems.reduce((acc, i) => acc + i.subtotal, 0);
                    set({ 
                        cartItems: { ...cartItems!, items: localItems, cart_total } 
                    });
                    return;
                }

                try {
                    const res = await CartService.DeleteCart(id);
                    set({ cartItems: res.data, isCartOpen: true });
                } catch (err) {
                    console.error('Error deleting from cart:', err);
                    await get().fetchCart();
                }
            },

            // ─── Wishlist ─────────────────────────────────────────────────────────────
            fetchWishlist: async () => {
                try {
                    const data = await WishlistService.getWishlist();
                    const products: BasketProduct[] = [];
                    const mapping: Record<number, number> = {};

                    const processItem = (item: any) => {
                        if (item.product) {
                            products.push(item.product);
                            mapping[item.product.id] = item.id;
                        } else if (item.name) {
                            products.push(item);
                            mapping[item.id] = item.id;
                        }
                    };

                    if (Array.isArray(data)) {
                        data.forEach(processItem);
                    } else if (Array.isArray(data?.results)) {
                        data.results.forEach(processItem);
                    }

                    set({ wishlistItems: products, wishlistMap: mapping });
                } catch (error) {
                    console.error('Failed to fetch wishlist', error);
                }
            },

            addToWishlist: async (id, user, triggerLoginAlert, product) => {
                if (!user) {
                    // ─── OFFLINE WISHLIST ───
                    const { wishlistItems, wishlistMap } = get();
                    if (wishlistItems.find((i) => i.id === id)) return;
                    
                    if (product) {
                        set({ 
                            wishlistItems: [...wishlistItems, product],
                            wishlistMap: { ...wishlistMap, [id]: Date.now() }, // fake mapping
                            isWishlistOpen: true 
                        });
                    }
                    return;
                }

                const { wishlistItems, fetchWishlist } = get();
                if (wishlistItems.find((i) => i.id === id)) return;

                try {
                    await WishlistService.addToWishlist(id);
                    await fetchWishlist();
                    set({ isWishlistOpen: true });
                } catch (error) {
                    console.error('Failed to add to wishlist', error);
                }
            },

            removeFromWishlist: async (id) => {
                const token = getCookie('access_token');
                if (!token) {
                    // ─── OFFLINE WISHLIST ───
                    const { wishlistItems } = get();
                    set({ wishlistItems: wishlistItems.filter(i => i.id !== id) });
                    return;
                }

                const { wishlistMap, fetchWishlist } = get();
                const wishlistId = wishlistMap[id];
                if (!wishlistId) return;

                try {
                    await WishlistService.removeFromWishlist(wishlistId);
                    set((state) => ({
                        wishlistItems: state.wishlistItems.filter((item) => item.id !== id),
                    }));
                    await fetchWishlist();
                } catch (error) {
                    console.error('Failed to remove from wishlist', error);
                }
            },

            // ─── Compare ──────────────────────────────────────────────────────────────
            addToCompare: (product) =>
                set((state) => {
                    if (state.compareItems.find((i) => i.id === product.id)) return state;
                    if (state.compareItems.length >= 3) return state;
                    return { compareItems: [...state.compareItems, product] };
                }),

            removeFromCompare: (id) =>
                set((state) => ({
                    compareItems: state.compareItems.filter((i) => i.id !== id),
                })),

            clearCompare: () => set({ compareItems: [] }),

            isInCompare: (id) => get().compareItems.some((i) => i.id === id),
        }),
        {
            name: 'fatafat-guest-store',
            partialize: (state) => ({ 
                cartItems: state.cartItems, 
                wishlistItems: state.wishlistItems, 
                wishlistMap: state.wishlistMap,
                compareItems: state.compareItems,
                guestAddresses: state.guestAddresses
            }),
        }
    )
);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const fetchCart = useCartStore((s) => s.fetchCart);
    const fetchWishlist = useCartStore((s) => s.fetchWishlist);

    useEffect(() => {
        const token = getCookie('access_token');
        if (token) {
            
            // Sync guest data
            const syncGuestData = async () => {
                const state = useCartStore.getState();
                
                // 1. Sync guest cart
                const guestCartItems = state.cartItems?.items || [];
                if (guestCartItems.length > 0 && guestCartItems.some(i => i.id > 1000000000000 || !i.id)) {
                    try {
                        for (const item of guestCartItems) {
                            if (!item.id || item.id > 1000000000000) {
                                await CartService.CreateCart({ product_id: item.product.id, quantity: item.quantity || 1 });
                            }
                        }
                    } catch (error) {
                        console.error('Failed to sync guest cart:', error);
                    }
                }

                // 2. Sync guest wishlist
                const guestWishlistItems = state.wishlistItems || [];
                if (guestWishlistItems.length > 0 && guestWishlistItems.some(i => i.id > 1000000000000 || !i.id)) {
                    try {
                        for (const item of guestWishlistItems) {
                            if (!item.id || item.id > 1000000000000) {
                                await WishlistService.addToWishlist(item.id);
                            }
                        }
                    } catch (error) {
                        console.error('Failed to sync guest wishlist:', error);
                    }
                }

                // 3. Sync guest addresses
                if (state.guestAddresses && state.guestAddresses.length > 0) {
                    try {
                        for (const addr of state.guestAddresses) {
                            const { id, ...addressData } = addr; // Omit the local id
                            await AddressService.CreateShippingAddress(addressData);
                        }
                        // Clear guest addresses after sync
                        useCartStore.setState({ guestAddresses: [] });
                    } catch (error) {
                        console.error('Failed to sync guest addresses:', error);
                    }
                }
                
                // 4. Finally, fetch real integrated state from API
                fetchCart();
                fetchWishlist();
            };
            syncGuestData();
        }
    }, [fetchCart, fetchWishlist]);

    return <>{children}</>;
};