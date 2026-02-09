'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

const ProgressBar = ({ currentstep }: { currentstep: number }) => {
  const steps: Step[] = [
    { id: 0, label: 'Start' },
    { id: 1, label: 'Details' },
    { id: 2, label: 'Documents' },
    { id: 3, label: 'Review' }
  ];

  return (
    <div className="w-full py-8 px-2 sm:px-0">
      <div className="relative w-full">
        {/* Background Line */}
        <div className="absolute top-[7px] left-0 w-full h-[2px] bg-gray-200 z-0 rounded-full" />

        {/* Active Progress Line */}
        <div
          className="absolute top-[7px] left-0 h-[2px] bg-[var(--colour-fsP2)] z-0 transition-all duration-500 ease-out rounded-full shadow-sm"
          style={{ width: `${(currentstep / (steps.length - 1)) * 100}%` }}
        />

        <div className="relative z-10 flex justify-between w-full">
          {steps.map((step, idx) => {
            const isCompleted = currentstep > step.id;
            const isActive = currentstep === step.id;
            const isPastOrActive = currentstep >= step.id;

            const isFirst = idx === 0;
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.id} className="flex flex-col relative group">
                {/* Dot Indicator */}
                <div
                  className={`
                                        w-4 h-4 rounded-full border-2 transition-all duration-300 bg-white relative z-20 mx-auto
                                        ${isPastOrActive
                      ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)] scale-110 shadow-md shadow-blue-200'
                      : 'border-gray-300'
                    }
                                    `}
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
                    {step.label}
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
};

export default ProgressBar;