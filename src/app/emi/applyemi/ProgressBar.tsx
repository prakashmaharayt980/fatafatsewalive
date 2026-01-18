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
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="relative flex items-center justify-between">

        {/* Background Line */}
        <div className="absolute rounded-full left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-100 -z-10" />

        {/* Active Line */}
        <div
          className="absolute rounded-full left-0 top-1/2 -translate-y-1/2 h-1.5 bg-blue-600 transition-all duration-700 ease-in-out -z-0"
          style={{ width: `${(Math.min(currentstep, 3) / 3) * 100}%` }}
        />

        {steps.map((step) => {
          // Logic: Complete if current step is past this step. Active if current step matches.
          const status = currentstep > step.id ? 'complete' : currentstep === step.id ? 'active' : 'pending';

          return (
            <div key={step.id} className="relative group">
              <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 bg-white
                                ${status === 'complete' ? 'border-blue-600 bg-blue-600 text-white scale-100' :
                  status === 'active' ? 'border-blue-600 text-blue-600 scale-110 shadow-lg shadow-blue-200' :
                    'border-gray-200 text-gray-300'}
                            `}>
                {status === 'complete' ? (
                  <CheckCircle2 className="w-5 h-5 animate-in zoom-in spin-in-90 duration-300" />
                ) : (
                  <span className={`font-bold text-sm ${status === 'active' ? 'animate-pulse' : ''}`}>{step.id + 1}</span>
                )}
              </div>

              {/* Label */}
              <div className={`
                                absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold uppercase tracking-wider transition-all duration-300
                                ${status === 'active' ? 'text-blue-600 translate-y-0 opacity-100' :
                  status === 'complete' ? 'text-gray-800 translate-y-0 opacity-100' :
                    'text-gray-400 -translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0'}
                            `}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;