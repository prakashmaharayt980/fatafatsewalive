import React from 'react';
import Link from 'next/link';

interface SectionHeaderProps {
    title: string;
    /** Accent bar color — use CSS variable like 'var(--colour-fsP1)' */
    accentColor?: string;
    /** Optional link on the right side */
    linkHref?: string;
    linkText?: string;
    /** Optional right-side element (e.g., article count badge) */
    rightElement?: React.ReactNode;
}

export default function SectionHeader({
    title,
    accentColor = 'var(--colour-fsP1)',
    linkHref,
    linkText = 'View All',
    rightElement,
}: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
                <div
                    className="w-1 h-6 rounded-full"
                    style={{ backgroundColor: accentColor }}
                />
                <h2 className="text-base sm:text-lg font-bold text-[var(--colour-text2)]">
                    {title}
                </h2>
            </div>
            {rightElement}
            {linkHref && (
                <Link
                    href={linkHref}
                    className="text-xs font-semibold text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] transition-colors flex items-center gap-1"
                >
                    {linkText} <span className="text-sm">→</span>
                </Link>
            )}
        </div>
    );
}
