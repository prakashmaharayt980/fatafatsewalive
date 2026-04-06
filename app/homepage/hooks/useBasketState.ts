'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/app/context/AuthContext';
import { useCartStore } from '@/app/context/CartContext';

interface BasketState {
  width: number;
  activeDot: number;
  ready: boolean;
  visibleCount: number;
}

const initialState: BasketState = {
  width: 0,
  activeDot: 0,
  ready: false,
  visibleCount: 5,
};

const loadedSections = new Set<string>();

export function useBasketState(slug: string, hasData: boolean) {
  const [state, setState] = useState<BasketState>(() => ({
    ...initialState,
    ready: hasData || loadedSections.has(slug),
  }));

  const updateState = useCallback((updates: Partial<BasketState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    updateState({ width: window.innerWidth });
    let timeout: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => updateState({ width: window.innerWidth }), 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timeout);
    };
  }, [updateState]);

  useEffect(() => {
    if (!state.ready && hasData) {
      loadedSections.add(slug);
      updateState({ ready: true });
    }
  }, [hasData, state.ready, slug, updateState]);

  return { state, updateState };
}

export function useStoreSelectors() {
  const auth = useAuthStore(useShallow(s => ({
    user: s.user,
    triggerLoginAlert: s.triggerLoginAlert,
  })));

  const cart = useCartStore(useShallow(s => ({
    addToWishlist: s.addToWishlist,
    wishlistItems: s.wishlistItems,
    addToCompare: s.addToCompare,
    removeFromCompare: s.removeFromCompare,
    isInCompare: s.isInCompare,
  })));

  const wishlistSet = useMemo(() => new Set(cart.wishlistItems.map((i: any) => i.id)), [cart.wishlistItems]);

  return { auth, cart, wishlistSet };
}

export function usePagination(productCount: number, width: number, withImage = false) {
  const isMobile = width > 0 && width < 640;
  const itemsPerPage = withImage
    ? (width >= 1024 ? 4 : width >= 768 ? 3 : 2)
    : (isMobile ? 2 : 5);
  const totalPages = Math.ceil(productCount / itemsPerPage) || 1;
  return { isMobile, itemsPerPage, totalPages };
}

export function useScrollObserver(
  containerRef: React.RefObject<HTMLDivElement>,
  sentinelRef: React.RefObject<HTMLDivElement>,
  ready: boolean,
  visibleCount: number,
  productCount: number,
  onLoadMore: () => void
) {
  useEffect(() => {
    if (!ready || visibleCount >= productCount || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { root: containerRef.current, threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [ready, visibleCount, productCount, onLoadMore]);
}
