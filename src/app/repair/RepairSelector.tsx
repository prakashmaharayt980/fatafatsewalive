'use client'

import React from 'react'
import { Check, Wrench, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { REPAIR_CATEGORIES, RepairCategory, getRepairEstimate } from './repair-helpers'

interface RepairSelectorProps {
    selectedRepairs: string[]
    onToggle: (id: string) => void
    error?: string
}

const SEVERITY_COLORS: Record<string, string> = {
    screen: 'from-red-500 to-rose-400',
    battery: 'from-green-500 to-emerald-400',
    charging: 'from-yellow-500 to-amber-400',
    speaker: 'from-blue-500 to-indigo-400',
    camera: 'from-purple-500 to-violet-400',
    water: 'from-cyan-500 to-teal-400',
    software: 'from-slate-500 to-gray-400',
    button: 'from-orange-500 to-amber-400',
    backpanel: 'from-pink-500 to-rose-400',
    other: 'from-gray-500 to-zinc-400',
}

function RepairCard({ cat, selected, onToggle, delay }: { cat: RepairCategory; selected: boolean; onToggle: () => void; delay: number }) {
    const gradient = SEVERITY_COLORS[cat.id] || SEVERITY_COLORS.other
    return (
        <button
            onClick={onToggle}
            style={{ cursor: 'pointer', animationDelay: `${delay}ms` }}
            className={cn(
                'group relative flex items-start gap-3 p-3.5 rounded-2xl border-2 transition-all duration-200 text-left animate-in fade-in slide-in-from-bottom-1',
                'hover:shadow-lg hover:-translate-y-0.5',
                selected
                    ? 'border-[var(--colour-fsP1)] bg-gradient-to-br from-orange-50 to-amber-50/60 shadow-md ring-1 ring-[var(--colour-fsP1)]/15'
                    : 'border-[var(--colour-border3)] bg-white hover:border-[var(--colour-fsP1)]/50'
            )}
        >
            {/* Selection indicator */}
            <div className={cn(
                'absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200',
                selected ? 'bg-[var(--colour-fsP1)] scale-100 shadow-sm' : 'bg-gray-200 scale-75 opacity-0 group-hover:opacity-40'
            )}>
                <Check className="h-3 w-3 text-white stroke-[3]" />
            </div>

            {/* Icon with gradient background */}
            <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
                selected ? `bg-gradient-to-br ${gradient} shadow-sm` : 'bg-gray-50 group-hover:bg-gray-100'
            )}>
                <span className={cn('text-lg transition-transform duration-200', selected && 'scale-110')}>{cat.icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={cn(
                    'text-[13px] font-bold leading-tight mb-0.5 transition-colors',
                    selected ? 'text-[var(--colour-fsP1)]' : 'text-[var(--colour-text2)]'
                )}>
                    {cat.label}
                </p>
                <p className="text-[10px] text-gray-500 leading-snug line-clamp-2">{cat.description}</p>
            </div>
        </button>
    )
}

export default function RepairSelector({ selectedRepairs, onToggle, error }: RepairSelectorProps) {
    const estimate = getRepairEstimate(selectedRepairs)
    const count = selectedRepairs.length

    return (
        <div className="mb-10 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-extrabold text-[var(--colour-text2)] flex items-center gap-2.5">
                    <span className="bg-[var(--colour-fsP1)] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-md shadow-[var(--colour-fsP1)]/20">3</span>
                    What Needs Repair?
                </h3>
                {count > 0 && (
                    <span className="text-xs font-bold text-[var(--colour-fsP1)] bg-orange-50 px-2.5 py-1 rounded-full animate-in fade-in duration-200">
                        {count} selected
                    </span>
                )}
            </div>
            <p className="text-xs text-gray-500 mb-5 ml-9">Tap all that apply — you can select multiple issues</p>
            {error && <p className="text-xs text-red-500 mb-2 ml-9 font-medium">{error}</p>}

            {/* Grid — 2 columns on mobile, 2 on tablet, 3 on desktop for horizontal card layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {REPAIR_CATEGORIES.map((cat, idx) => (
                    <RepairCard
                        key={cat.id}
                        cat={cat}
                        selected={selectedRepairs.includes(cat.id)}
                        onToggle={() => onToggle(cat.id)}
                        delay={idx * 35}
                    />
                ))}
            </div>

            {/* Summary Bar */}
            {count > 0 && (
                <div className="mt-4 p-3.5 bg-gradient-to-r from-orange-50 via-amber-50/60 to-orange-50 rounded-2xl border border-orange-200/80 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-[var(--colour-fsP1)] rounded-lg flex items-center justify-center">
                            <Wrench className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-[var(--colour-text2)]">{count} repair{count > 1 ? 's' : ''} selected</span>
                            <p className="text-[10px] text-gray-500">We will diagnose and confirm the final cost soon.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
