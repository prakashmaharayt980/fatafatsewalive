'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import RemoteServices from '../api/remoteservice';
import { WishlistService } from '../api/services/wishlist';
import { ProductDetails } from '../types/ProductDetailsTypes';
import { getCookie } from 'cookies-next';
import { useAuth } from '../context/AuthContext';


interface CartResponse {
    id: number;
    user_id: number;
    discount_coupon: string | null;
    items: Array<{
        id: number;
        cart_id: number;
        product_id: number;
        quantity: number;
        price: number;
        product_attributes: [];
        product: ProductDetails;
        subtotal: number;
    }>;
    cart_total: number;
    created_at: string;
    updated_at: string;
}

interface CartContextType {
    // Lists
    cartItems: CartResponse;
    wishlistItems: ProductDetails[];

    // UI State
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;

    isWishlistOpen: boolean;
    setIsWishlistOpen: (open: boolean) => void;

    // // Cart Actions
    // fetchCart: () => Promise<void>;
    addToCart: (id: number, quantity: number) => Promise<void>;
    deleteFromCart: (id: number) => Promise<void>;
    CartUpdateQuantity: (id: number, quantity: number) => Promise<void>;

    // Wishlist Actions
    fetchWishlist: () => Promise<void>;
    addToWishlist: (id: number) => Promise<void>;
    removeFromWishlist: (id: number) => Promise<void>;

    // Compare Actions
    compareItems: ProductDetails[];
    addToCompare: (product: ProductDetails) => Promise<void>;
    removeFromCompare: (id: number) => Promise<void>;
    isInCompare: (id: number) => boolean;
    setCompareItems: React.Dispatch<React.SetStateAction<ProductDetails[]>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider1: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartResponse>();
    const [wishlistItems, setWishlistItems] = useState<ProductDetails[]>([]);
    const [wishlistMap, setWishlistMap] = useState<Record<number, number>>({});
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

    // --- API LOGIC ---

    const fetchCart = async () => {

        RemoteServices.CartList().then(res => {
            setCartItems(res.data)
        }).catch(err => {

            // fetchCart();
        })
    };

    const fetchWishlist = async () => {
        try {
            const data = await WishlistService.getWishlist();
            // Assuming data is an array of objects { id: number, product: ProductDetails }
            // or verify structure. If it's just products, we can't delete by ID easily unless ID matches.
            // Based on user request "delete use ../wishlist/id", we assume wrapper object.

            // Check if data is array
            if (Array.isArray(data)) {
                const products: ProductDetails[] = [];
                const mapping: Record<number, number> = {};

                data.forEach((item: any) => {
                    if (item.product) {
                        products.push(item.product);
                        mapping[item.product.id] = item.id;
                    } else if (item.name) {
                        // Maybe it returned direct products?
                        products.push(item);
                        // If direct product, we assume delete takes product id? Unlikely given instructions.
                        // But we'll map product.id to product.id just in case
                        mapping[item.id] = item.id;
                    }
                });
                setWishlistItems(products);
                setWishlistMap(mapping);
            } else if (data.results && Array.isArray(data.results)) {
                // Handle paginated response
                const products: ProductDetails[] = [];
                const mapping: Record<number, number> = {};
                data.results.forEach((item: any) => {
                    if (item.product) {
                        products.push(item.product);
                        mapping[item.product.id] = item.id;
                    }
                });
                setWishlistItems(products);
                setWishlistMap(mapping);
            }
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        }
    };
    const CartUpdateQuantity = async (id: number, quantity: number) => {

        RemoteServices.CartUpdate(id, {
            quantity: quantity
        }).then(res => {
            setCartItems(res.data)
        }).catch(err => {

            fetchCart();
        })
    };

    const { authState, triggerLoginAlert } = useAuth();

    const addToCart = async (id: number, quantity: number) => {
        if (!authState.user) {
            triggerLoginAlert();
            return;
        }

        const existingItem = cartItems?.items.find(i => i.product_id === id);

        if (existingItem) {
            CartUpdateQuantity(existingItem.id, existingItem.quantity + quantity)
            setIsCartOpen(true)
            return
        } else {

            RemoteServices.CreateCart({
                product_id: id,
                quantity: quantity
            }).then(res => {
                setCartItems(res.data)
                setIsCartOpen(true)
            }).catch(err => {

                fetchCart();
            })
        }

    };

    const deleteFromCart = async (id: number) => {

        RemoteServices.DeleteCart(id).then(res => {
            setCartItems(res.data)
            setIsCartOpen(true)
        }).catch(err => {

            fetchCart();
        })
    };



    // --- WISHLIST LOGIC ---

    const addToWishlist = async (id: number) => {
        if (!authState.user) {
            triggerLoginAlert();
            return;
        }

        // Optimistic check
        if (wishlistItems.find(i => i.id === id)) return;

        try {
            await WishlistService.addToWishlist(id);
            // Refresh wishlist to get new ID mapping
            fetchWishlist();
            setIsWishlistOpen(true);
        } catch (error) {
            console.error("Failed to add to wishlist", error);
        }
    };

    const removeFromWishlist = async (id: number) => {
        // id is product_id here (passed from ProductCard)
        try {
            const wishlistId = wishlistMap[id];
            if (wishlistId) {
                await WishlistService.removeFromWishlist(wishlistId);
                // Optimistic update
                setWishlistItems((prev) => prev.filter((item) => item.id !== id));
                // We should also remove from map, but fetching is cleaner
                fetchWishlist();
            } else {
                console.warn("No wishlist ID found for product", id);
                // Fallback: maybe the ID passed IS the wishlist ID? 
                // But signature is removeFromWishlist(product.id)
            }
        } catch (error) {
            console.error("Failed to remove from wishlist", error);
        }
    };

    // --- COMPARE LOGIC ---
    const [compareItems, setCompareItems] = useState<ProductDetails[]>([]);

    const addToCompare = async (product: ProductDetails) => {
        setCompareItems(prev => {
            if (prev.find(i => i.id === product.id)) return prev;
            if (prev.length >= 4) return prev; // Limit to 4
            return [...prev, product];
        });
    };

    const removeFromCompare = async (id: number) => {
        setCompareItems(prev => prev.filter(i => i.id !== id));
    };

    const isInCompare = (id: number) => compareItems.some(i => i.id === id);

    // Initial Load
    useEffect(() => {
        const token = getCookie('access_token')
        if (token) {
            fetchCart();
            fetchWishlist();
        }
        // Load compare from local storage if needed, skipping for now as per instructions to just "add compare fun"
    }, []);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                wishlistItems,
                isCartOpen,
                setIsCartOpen,
                isWishlistOpen,
                setIsWishlistOpen,
                compareItems,

                addToCart,
                deleteFromCart,
                fetchWishlist,
                addToWishlist,
                removeFromWishlist,
                CartUpdateQuantity,

                addToCompare,
                removeFromCompare,
                isInCompare,
                setCompareItems
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useContextCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useContextCart must be used within CartProvider');
    return context;
};




