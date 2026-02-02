import React from 'react';

interface VerdictProps {
    verdict: 'Buy' | 'Wait' | 'Skip';
    summary: string;
}

const VerdictBox = ({ verdict, summary }: VerdictProps) => {
    const bgColors = {
        Buy: 'bg-green-50 border-green-200',
        Wait: 'bg-yellow-50 border-yellow-200',
        Skip: 'bg-red-50 border-red-200',
    };

    const textColors = {
        Buy: 'text-green-800',
        Wait: 'text-yellow-800',
        Skip: 'text-red-800',
    };

    return (
        <div className={`p-6 rounded-2xl border-2 ${bgColors[verdict]} my-8`}>
            <div className="flex items-center gap-3 mb-3">
                <span className="bg-white/50 backdrop-blur px-3 py-1 rounded-full text-sm font-bold tracking-wide uppercase text-gray-800 border border-black/5">
                    Fatafat Quick Take
                </span>
                <span className={`font-bold uppercase tracking-wider ${textColors[verdict]}`}>
                    Verdict: {verdict}
                </span>
            </div>
            <p className="text-gray-800 text-lg leading-relaxed font-medium">
                {summary}
            </p>
        </div>
    );
};

export default VerdictBox;
