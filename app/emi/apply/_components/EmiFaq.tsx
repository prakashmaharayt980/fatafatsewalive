'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { fetchFaqs } from '../actions';

export interface FaqApiItem {
    id: number;
    type: string;
    type_id: number;
    question: string;
    answer: string;
    created_at: string;
    updated_at: string;
}

interface FaqItem {
    q: string;
    a: string;
}

function stripHtml(html: string): string {
    if (typeof window !== 'undefined') {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }
    return html.replace(/<[^>]*>/g, '').trim();
}

function deduplicateFaqs(items: FaqApiItem[]): FaqItem[] {
    const seen = new Set<string>();
    const result: FaqItem[] = [];
    for (const item of items) {
        const key = item.question.trim().toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            result.push({ q: item.question, a: stripHtml(item.answer) });
        }
    }
    return result;
}

export default function EmiFaq({
    className = '',
    params,
    title = 'Frequently Asked Questions',
    subtitle = 'Everything you need to know about EMI at Fatafat Sewa.',
}: {
    className?: string;
    params?: { type?: string; per_page?: number; page?: number };
    title?: string;
    subtitle?: string;
}) {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const paramsKey = JSON.stringify(params || { type: 'brand', per_page: 10, page: 1 });
    useEffect(() => {
        const fetchFaqsData = async () => {
            try {
                setLoading(true);
                setError(null);
                const effectiveParams = params || { type: 'brand', per_page: 10, page: 1 };
                const json = await fetchFaqs(effectiveParams);
                if (!json.success || !Array.isArray(json.data))
                    throw new Error('Unexpected response format');
                setFaqs(deduplicateFaqs(json.data as FaqApiItem[]));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load FAQs');
            } finally {
                setLoading(false);
            }
        };
        fetchFaqsData();
    }, [paramsKey]);

    const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i));

    return (
        <div className={`mt-10 mb-16 w-full ${className}`}>
            <div className="mb-6 border-l-4 border-[var(--colour-fsP2)] pl-4">
                <h2 className="text-xl font-bold text-gray-900">
                    {title}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                    {subtitle}
                </p>
            </div>

            {loading && (
                <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-2 px-5 py-4 animate-pulse bg-white">
                            <div className="h-3.5 bg-gray-100 rounded w-2/3" />
                            <div className="h-3 bg-gray-50 rounded w-1/3" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && error && (
                <p className="text-center py-10 text-sm text-red-400">{error}</p>
            )}

            {!loading && !error && faqs.length > 0 && (
                <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden bg-white">
                    {faqs.map((item, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <div key={i}>
                                <button
                                    type="button"
                                    onClick={() => toggle(i)}
                                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className={`text-sm font-medium leading-snug ${isOpen ? 'text-[var(--colour-fsP2)]' : 'text-gray-800'}`}>
                                        {item.q}
                                    </span>
                                    <ChevronDown
                                        className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--colour-fsP2)]' : ''}`}
                                    />
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
                                >
                                    <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">
                                        {item.a}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && !error && faqs.length === 0 && (
                <p className="text-center py-10 text-sm text-gray-400">
                    No FAQs available at the moment.
                </p>
            )}
        </div>
    );
}
