'use client';

import React from 'react';
import { CHECKOUT_STEPS, type CheckoutStep, STEP_LABELS, type CheckoutState, isStepComplete, canProceedToStep } from '../checkoutTypes';

interface StepProgressProps {
    currentStep: CheckoutStep;
    state: CheckoutState;
    onStepClick: (step: CheckoutStep) => void;
}

export default function StepProgress({ currentStep, state, onStepClick }: StepProgressProps) {
    const steps = Object.values(CHECKOUT_STEPS).filter((v): v is CheckoutStep => typeof v === 'number');
    const progressPercent = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;

    return (
        <div className="w-full border-b border-gray-200 bg-white overflow-hidden">
            {/* Accent stripe — same as PreOrdersSection cards */}
            <div className="h-0.75 w-full bg-(--colour-fsP2)" />

            <div className="px-6 py-4">
                <div className="relative">
                    {/* Track */}
                    <div className="absolute top-3.75 left-0 right-0 h-px bg-gray-200" />
                    <div
                        className="absolute top-3.75 left-0 h-px bg-(--colour-fsP2) transition-all duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />

                    {/* Steps */}
                    <div className="relative flex justify-between">
                        {steps.map((step, idx) => {
                            const isCompleted = isStepComplete(step, state) && step < currentStep;
                            const isActive = step === currentStep;
                            const canClick = canProceedToStep(step, state);
                            const isPastOrActive = step <= currentStep;
                            const isFirst = idx === 0;
                            const isLast = idx === steps.length - 1;

                            return (
                                <div key={step} className={`flex flex-col items-${isFirst ? 'start' : isLast ? 'end' : 'center'} gap-2`}>
                                    {/* Badge — styled like PreOrdersSection status badges */}
                                    <button
                                        onClick={() => canClick && onStepClick(step)}
                                        disabled={!canClick}
                                        className={`
                                            w-7.5 h-7.5 rounded border flex items-center justify-center font-bold text-xs transition-all duration-300
                                            ${isActive
                                                ? 'border-(--colour-fsP2) bg-(--colour-fsP2) text-white shadow-sm'
                                                : isCompleted
                                                    ? 'border-(--colour-fsP2) bg-(--colour-fsP2) text-white'
                                                    : 'border-gray-200 bg-white text-gray-400'
                                            }
                                            ${canClick ? 'cursor-pointer' : 'cursor-default'}
                                        `}
                                        aria-label={`Step ${STEP_LABELS[step]}`}
                                    >
                                        {isCompleted ? (
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <span>{idx + 1}</span>
                                        )}
                                    </button>

                                    {/* Label — same text style as PreOrdersSection meta labels */}
                                    <span className={`
                                        text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-300
                                        ${isActive ? 'text-(--colour-fsP2)' : isPastOrActive ? 'text-(--colour-fsP2) opacity-60' : 'text-gray-400'}
                                    `}>
                                        {STEP_LABELS[step]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
