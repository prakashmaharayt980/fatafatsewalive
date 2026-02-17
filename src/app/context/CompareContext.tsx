'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductDetails } from '../types/ProductDetailsTypes';
import { toast } from 'sonner';

interface CompareContextType {
    compareList: ProductDetails[];
    addToCompare: (product: ProductDetails) => void;
    removeFromCompare: (productId: number) => void;
    isInCompare: (productId: number) => boolean;
    clearCompare: () => void;
    setCompareList: (list: ProductDetails[]) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
    const [compareList, setCompareList] = useState<ProductDetails[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('fatafat_compare_list');
        if (saved) {
            try {
                setCompareList(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse compare list", e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('fatafat_compare_list', JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (product: ProductDetails) => {
        if (compareList.length >= 5) {
            toast.error("You can compare up to 5 products only.");
            return;
        }
        if (compareList.some(p => p.id === product.id)) {
            toast.info("Product already in compare list.");
            return;
        }
        setCompareList([...compareList, product]);
        toast.success(`${product.name} added to compare!`);
    };

    const removeFromCompare = (productId: number) => {
        setCompareList(compareList.filter(p => p.id !== productId));
    };

    const isInCompare = (productId: number) => {
        return compareList.some(p => p.id === productId);
    };

    const clearCompare = () => {
        setCompareList([]);
    };

    return (
        <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, isInCompare, clearCompare, setCompareList }}>
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
};
