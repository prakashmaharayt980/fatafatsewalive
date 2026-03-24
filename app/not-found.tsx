'use client';

import Link from 'next/link';
import { Home, MoveLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center bg-[var(--colour-bg4)] relative overflow-hidden font-heading">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--logobluecolur1)]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[var(--colour-yellow)]/10 rounded-full blur-3xl" />
      </div>

      <div className="z-10 text-center px-responsive max-w-2xl mx-auto animate-fade-in">
        <div className="mb-6 relative inline-flex items-center justify-center">
          <h1 className="text-[10rem] md:text-[12rem] leading-none font-black text-slate-900/5 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-6 rounded-full shadow-premium-lg ring-1 ring-slate-100/50 backdrop-blur-sm glass-premium">
              <FileQuestion className="w-16 h-16 text-[var(--logobluecolur1)]" />
            </div>
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-[var(--colour-text2)] mb-4">
          Page Not Found
        </h2>
        <p className="text-[var(--colour-text3)] mb-8 text-lg max-w-md mx-auto leading-relaxed">
          Oops! The page you are looking for seems to have wandered off. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-8 py-3 bg-[var(--colour-btn1)] text-white rounded-xl font-medium hover:bg-[var(--colour-bg2)] transition-premium shadow-premium-md hover-lift"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-8 py-3 bg-white text-[var(--colour-text2)] border border-[var(--colour-border3)] rounded-xl font-medium hover:bg-slate-50 transition-premium shadow-sm hover:border-[var(--colour-btn1)] hover-lift"
          >
            <MoveLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}