import React from 'react';

interface VerdictProps {
    verdict: 'Buy' | 'Wait' | 'Skip';
    summary: string;
}

const VerdictBox = ({ verdict, summary }: VerdictProps) => {
    const bgColors = {
        Buy: 'bg-green-50/80 border-green-300',
        Wait: 'bg-amber-50/80 border-amber-300',
        Skip: 'bg-red-50/80 border-red-300',
    };

    const textColors = {
        Buy: 'text-green-700',
        Wait: 'text-amber-700',
        Skip: 'text-red-700',
    };

    const icons = {
        Buy: '✓',
        Wait: '⏳',
        Skip: '✗',
    };

    return (
        <div className={`p-5 rounded-lg border ${bgColors[verdict]} mb-4`}>
            <div className="flex items-center gap-2.5 mb-2">
                <span className="bg-white/70 backdrop-blur px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase text-[var(--colour-text2)] border border-[var(--colour-border3)]">
                    Fatafat Quick Take
                </span>
                <span className={`text-[12px] font-bold uppercase tracking-wider flex items-center gap-1 ${textColors[verdict]}`}>
                    <span>{icons[verdict]}</span> Verdict: {verdict}
                </span>
            </div>
            <p className="text-[var(--colour-text2)] text-[14px] leading-relaxed">
                {summary}
            </p>
        </div>
    );
};

export default VerdictBox;
