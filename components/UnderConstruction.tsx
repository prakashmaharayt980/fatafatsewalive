'use client';

import React from 'react';
import { Hammer, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface UnderConstructionProps {
    title?: string;
    description?: string;
    showBackButton?: boolean;
}

const UnderConstruction: React.FC<UnderConstructionProps> = ({
    title = "Under Construction",
    description = "We're currently working hard to bring you this feature. Please check back later!",
    showBackButton = true
}) => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-(--colour-fsP1) opacity-20 blur-3xl rounded-full" />
                <div className="relative bg-white p-8 rounded-full shadow-2xl border border-slate-100 flex items-center justify-center">
                    <Hammer className="w-16 h-16 text-(--colour-fsP1) animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-400 p-2 rounded-full shadow-lg border-2 border-white">
                    <AlertCircle className="w-6 h-6 text-white" />
                </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                {title}
            </h2>

            <p className="text-lg text-slate-600 max-w-md mx-auto mb-10 leading-relaxed font-poppins">
                {description}
            </p>

            {showBackButton && (
                <Button
                    onClick={() => router.push('/')}
                    variant="outline"
                    className="flex items-center gap-2 px-8 py-6 text-lg font-bold border-2 hover:bg-slate-50 transition-all rounded-xl"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Homepage
                </Button>
            )}
        </div>
    );
};

export default UnderConstruction;
