// src/app/layouts/SearchUtils.ts

export const SEARCH_HISTORY_KEY = 'fs_search_history';

export const getSearchHistory = (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]').slice(0, 5);
    } catch { return []; }
};

export const saveSearchTerm = (term: string) => {
    if (typeof window === 'undefined' || !term.trim()) return;
    try {
        const history = getSearchHistory().filter(h => h !== term);
        history.unshift(term);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
    } catch { /* noop */ }
};

export const clearSearchHistory = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SEARCH_HISTORY_KEY);
};

export const TRENDING_SEARCHES = [
    "iPhone 15 Pro Max",
    "Gaming Laptops under 1 Lakh",
    "Samsung S24 Ultra",
    "MacBook Air M2",
    "Wireless Earbuds"
];

export const SUGGESTION_KEYWORDS = [
    "best gaming laptops in nepal",
    "latest iphones 2024",
    "budget smartphones under 20000",
    "4k smart tv 55 inch",
    "noise cancelling headphones",
    "mechanical keyboards for coding",
    "apple watch series 9",
    "samsung top load washing machine"
];
