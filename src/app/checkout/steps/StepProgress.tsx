'use client';

import React from 'react';
import { CHECKOUT_STEPS, CheckoutStep, STEP_LABELS, CheckoutState, isStepComplete, canProceedToStep } from '../checkoutTypes';

interface StepProgressProps {
    currentStep: CheckoutStep;
    state: CheckoutState;
    onStepClick: (step: CheckoutStep) => void;
}

export default function StepProgress({ currentStep, state, onStepClick }: StepProgressProps) {
    const steps = Object.values(CHECKOUT_STEPS).filter((v): v is CheckoutStep => typeof v === 'number');

    return (
        <div className="w-full py-8 px-2 sm:px-0">
            {/* Minimalist Style Bar - Theme Blue & Full Width */}
            <div className="relative w-full">
                {/* Background Line */}
                <div className="absolute top-[7px] left-0 w-full h-[2px] bg-gray-200 z-0 rounded-full" />

                {/* Active Progress Line */}
                <div
                    className="absolute top-[7px] left-0 h-[2px] bg-[var(--colour-fsP2)] z-0 transition-all duration-500 ease-out rounded-full shadow-sm"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />

                <div className="relative z-10 flex justify-between w-full">
                    {steps.map((step, idx) => {
                        const isCompleted = isStepComplete(step, state) && step < currentStep;
                        const isActive = step === currentStep;
                        const canClick = canProceedToStep(step, state);
                        const isPastOrActive = step <= currentStep;

                        const isFirst = idx === 0;
                        const isLast = idx === steps.length - 1;

                        return (
                            <div key={step} className="flex flex-col relative group">
                                {/* Dot Indicator */}
                                <button
                                    onClick={() => canClick && onStepClick(step)}
                                    disabled={!canClick}
                                    className={`
                                        w-4 h-4 rounded-full border-2 transition-all duration-300 bg-white relative z-20 mx-auto
                                        ${isPastOrActive
                                            ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)] scale-110 shadow-md shadow-blue-200'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }
                                        ${canClick ? 'cursor-pointer' : 'cursor-default'}
                                    `}
                                    aria-label={`Step ${STEP_LABELS[step]}`}
                                />

                                {/* Label Container - Absolute positioned to dot */}
                                <div
                                    className={`
                                        absolute top-8 w-32
                                        ${isFirst ? 'left-0 text-left' : isLast ? 'right-0 text-right' : 'left-1/2 -translate-x-1/2 text-center'}
                                    `}
                                >
                                    <span className={`
                                        text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-300 block leading-tight
                                        ${isActive
                                            ? 'text-[var(--colour-fsP2)] transform scale-105'
                                            : isPastOrActive
                                                ? 'text-[var(--colour-fsP2)] opacity-80'
                                                : 'text-gray-400'
                                        }
                                    `}>
                                        {STEP_LABELS[step]}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile spacing buffer */}
            <div className="h-10 sm:h-8" />
        </div>
    );
}
