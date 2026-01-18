'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import RemoteServices from '../api/remoteservice';
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
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

    // --- API LOGIC ---

    const fetchCart = async () => {

        RemoteServices.CartList().then(res => {
            setCartItems(res.data)
        }).catch(err => {

            fetchCart();
        })
    };

    const fetchWishlist = async () => {
        // TODO: Implement Wishlist API
        // RemoteServices.WishlistList().then(res => {
        //     setWishlistItems(res.data)
        // }).catch(err => {
        //     console.error(err);
        // })
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

        if (wishlistItems.find(i => i.id === id)) return;
        // setWishlistItems((prev) => [...prev, id]);
        // await RemoteServices.AddToWishlist(product.id);
    };

    const removeFromWishlist = async (id: number) => {
        setWishlistItems((prev) => prev.filter((item) => item.id !== id));
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




