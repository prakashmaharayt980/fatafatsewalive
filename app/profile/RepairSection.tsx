'use client';

import React, { useState, useEffect } from 'react';
import {
    Package, Wrench, Truck, ClipboardCheck, Shield, Check,
    MapPin, Phone, Eye, XCircle, Clock, Star, CreditCard, AlertTriangle,
} from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { EmptyState, fmt } from './orders/shared';
import Image from 'next/image';
import { PICKUP_PARTNERS } from '../repair/_components/../repair-helpers';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiagnosisItem {
    part: string;
    issue: string;
    severity: 'high' | 'medium' | 'low' | 'none';
    action: string;
    cost: number;
    status: string;
}

interface RepairRequest {
    id: number;
    ref_number: string;
    device_name: string;
    device_image: string;
    repairs: string[];
    status: 'received' | 'pickup' | 'diagnosis' | 'repairing' | 'complete' | 'cancelled';
    pickup_address: string;
    customer_phone: string;
    submitted_at: string;
    est_cost_min: number;
    est_cost_max: number;
    diagnosis?: DiagnosisItem[];
    cancel_reason?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
    { key: 'received',  label: 'Received',  icon: Package },
    { key: 'pickup',    label: 'Pickup',    icon: Truck },
    { key: 'diagnosis', label: 'Diagnosis', icon: ClipboardCheck },
    { key: 'repairing', label: 'Repair',    icon: Wrench },
    { key: 'complete',  label: 'Complete',  icon: Shield },
] as const;

const STEP_INDEX: Record<string, number> = {
    received: 0, pickup: 1, diagnosis: 2, repairing: 3, complete: 4,
};

const MOCK_DIAGNOSIS: DiagnosisItem[] = [
    { part: 'Display Assembly',   issue: 'Cracked glass with damaged OLED panel',          severity: 'high',   action: 'Full replacement needed',    cost: 8500, status: 'Needs Replacement' },
    { part: 'Battery Health',     issue: '72% maximum capacity — degraded',                severity: 'medium', action: 'Battery swap recommended',   cost: 2500, status: 'Replace' },
    { part: 'Charging Port',      issue: 'Lint and debris causing intermittent connection', severity: 'low',    action: 'Deep clean + test',          cost: 800,  status: 'Clean & Service' },
    { part: 'Internal Components',issue: 'All other components tested and working',         severity: 'none',   action: 'No action needed',           cost: 0,    status: 'OK' },
];

const REPAIR_STATUS: Record<string, { label: string; cls: string }> = {
    received:  { label: 'Received',   cls: 'text-(--colour-fsP2) bg-blue-50 border-blue-200' },
    pickup:    { label: 'Pickup',     cls: 'text-orange-600 bg-orange-50 border-orange-200' },
    diagnosis: { label: 'Diagnosis',  cls: 'text-orange-600 bg-orange-50 border-orange-200' },
    repairing: { label: 'In Repair',  cls: 'text-orange-600 bg-orange-50 border-orange-200' },
    complete:  { label: 'Complete',   cls: 'text-(--colour-fsP2) bg-blue-50 border-blue-200' },
    cancelled: { label: 'Cancelled',  cls: 'text-red-600 bg-red-50 border-red-200' },
};

const SEV_CLS: Record<string, { dot: string; badge: string; icon: string }> = {
    high:   { dot: 'bg-red-500',    badge: 'bg-red-50 text-red-600 border-red-100',     icon: 'text-red-400' },
    medium: { dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-600 border-orange-100', icon: 'text-orange-400' },
    low:    { dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-600 border-blue-100',  icon: 'text-blue-400' },
    none:   { dot: 'bg-emerald-400',badge: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: 'text-emerald-500' },
};

const fmtRs = (n: number) => `Rs ${(n || 0).toLocaleString()}`;
const noBar = '[&::-webkit-scrollbar]:w-0 [scrollbar-width:none]';

const MOCK_REPAIRS: RepairRequest[] = [
    {
        id: 2001, ref_number: 'REP-2001',
        device_name: 'Samsung Galaxy S23 Ultra', device_image: '',
        repairs: ['Screen Repair', 'Battery Replacement'],
        status: 'diagnosis', pickup_address: 'Thamel, Kathmandu',
        customer_phone: '9841000000', submitted_at: '2026-03-28T10:00:00Z',
        est_cost_min: 3500, est_cost_max: 10000,
        diagnosis: MOCK_DIAGNOSIS,
    },
    {
        id: 2002, ref_number: 'REP-2002',
        device_name: 'iPhone 14 Pro', device_image: '',
        repairs: ['Charging Port'],
        status: 'complete', pickup_address: 'Baneshwor, Kathmandu',
        customer_phone: '9841111111', submitted_at: '2026-03-10T09:00:00Z',
        est_cost_min: 800, est_cost_max: 3000,
        diagnosis: MOCK_DIAGNOSIS,
    },
    {
        id: 2003, ref_number: 'REP-2003',
        device_name: 'Dell XPS 15 Laptop', device_image: '',
        repairs: ['Screen Repair', 'Software Fix'],
        status: 'received', pickup_address: 'Pulchowk, Lalitpur',
        customer_phone: '9842000000', submitted_at: '2026-04-01T14:30:00Z',
        est_cost_min: 2500, est_cost_max: 17000,
    },
    {
        id: 2004, ref_number: 'REP-2004',
        device_name: 'OnePlus 12 5G', device_image: '',
        repairs: ['Water Damage', 'Camera Repair'],
        status: 'repairing', pickup_address: 'Lazimpat, Kathmandu',
        customer_phone: '9843000000', submitted_at: '2026-03-20T08:00:00Z',
        est_cost_min: 3500, est_cost_max: 18000,
        diagnosis: MOCK_DIAGNOSIS,
    },
];

// ─── Status badge ─────────────────────────────────────────────────────────────

function RepairStatusBadge({ status }: { status: string }) {
    const s = REPAIR_STATUS[status] ?? { label: status, cls: 'text-slate-600 bg-gray-50 border-gray-200' };
    return (
        <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded border ${s.cls}`}>
            {s.label}
        </span>
    );
}

// ─── Improved Progress Bar ────────────────────────────────────────────────────

function TrackingBar({ status }: { status: string }) {
    const activeStep = STEP_INDEX[status] ?? 0;
    const isDone = status === 'complete';
    const isCancelled = status === 'cancelled';

    return (
        <div className="w-full">
            {/* Dots + connectors row */}
            <div className="flex items-center">
                {STEPS.map((step, i) => {
                    const isLast = i === STEPS.length - 1;
                    const done = isDone || i < activeStep;
                    const active = !isDone && !isCancelled && i === activeStep;
                    const Icon = step.icon;
                    return (
                        <React.Fragment key={i}>
                            <div className="flex flex-col items-center shrink-0">
                                <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                    done       ? 'bg-(--colour-fsP2) border-(--colour-fsP2)' :
                                    active     ? 'bg-(--colour-fsP2) border-(--colour-fsP2) ring-[3px] ring-(--colour-fsP2)/20' :
                                    isCancelled && i === 0 ? 'bg-red-50 border-red-300' :
                                                'bg-white border-gray-200'
                                }`}>
                                    {done
                                        ? <Check className="h-4 w-4 text-white stroke-2" />
                                        : isCancelled && i === 0
                                            ? <XCircle className="h-4 w-4 text-red-400" />
                                            : <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-300'}`} />
                                    }
                                </div>
                            </div>
                            {!isLast && (
                                <div className={`flex-1 h-0.5 transition-all duration-500 mx-1 ${done ? 'bg-(--colour-fsP2)' : 'bg-gray-100'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            {/* Labels row */}
            <div className="flex mt-2">
                {STEPS.map((step, i) => {
                    const isLast = i === STEPS.length - 1;
                    const done = isDone || i <= activeStep;
                    return (
                        <React.Fragment key={i}>
                            <div className="flex justify-center shrink-0 w-9">
                                <span className={`text-[9px] font-bold uppercase tracking-wide whitespace-nowrap ${done && !isCancelled ? 'text-(--colour-fsP2)' : 'text-slate-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {!isLast && <div className="flex-1 mx-1" />}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Diagnosis Report ─────────────────────────────────────────────────────────

function DiagnosisReport({ items }: { items: DiagnosisItem[] }) {
    const total = items.reduce((s, d) => s + d.cost, 0);
    return (
        <div className="space-y-3">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <ClipboardCheck size={13} className="text-(--colour-fsP2)" /> Diagnosis Report
                    </p>
                    <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                        {items.length} components
                    </span>
                </div>
                <div className="divide-y divide-gray-100">
                    {items.map((item, i) => {
                        const sev = SEV_CLS[item.severity];
                        return (
                            <div key={i} className="flex items-start gap-3 px-4 py-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${sev.dot}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-0.5">
                                        <p className="text-xs font-bold text-slate-900">{item.part}</p>
                                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${sev.badge}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mb-1">{item.issue}</p>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[11px] font-semibold flex items-center gap-1 ${sev.icon}`}>
                                            <Wrench size={10} /> {item.action}
                                        </span>
                                        {item.cost > 0 && (
                                            <span className="text-xs font-bold text-(--colour-fsP2)">
                                                {fmtRs(item.cost)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Cost breakdown */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs font-bold text-slate-900">Repair Breakdown</p>
                </div>
                <div className="px-4 py-3 space-y-2">
                    {items.filter(d => d.cost > 0).map((d, i) => (
                        <div key={i} className="flex justify-between text-xs">
                            <span className="text-slate-500">{d.part}</span>
                            <span className="font-semibold text-slate-800">{fmtRs(d.cost)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
                        <span className="text-sm font-bold text-slate-900">Total</span>
                        <span className="text-lg font-bold text-(--colour-fsP2)">{fmtRs(total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────

function RepairDetailDialog({ repair, onClose }: { repair: RepairRequest | null; onClose: () => void }) {
    const [approved, setApproved] = useState(false);

    useEffect(() => { setApproved(false); }, [repair?.id]);

    if (!repair) return null;

    const step = STEP_INDEX[repair.status] ?? 0;
    const isDone = repair.status === 'complete';
    const isCancelled = repair.status === 'cancelled';
    const isRepairing = repair.status === 'repairing';
    const isDiagnosis = repair.status === 'diagnosis';
    const showDiagnosis = !isCancelled && step >= 2 && repair.diagnosis;
    const diagnosisCost = repair.diagnosis?.reduce((s, d) => s + d.cost, 0) ?? 0;

    return (
        <Dialog open={!!repair} onOpenChange={onClose}>
            <DialogContent className={`w-full sm:max-w-2xl max-h-[95dvh] sm:max-h-[90dvh] p-0 flex flex-col gap-0 bg-white border border-gray-200 rounded-t-xl sm:rounded-xl overflow-hidden ${noBar}`}>

                {/* Header */}
                <DialogHeader className="shrink-0 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <DialogTitle className="text-base font-bold text-slate-900">#{repair.ref_number}</DialogTitle>
                            <DialogDescription className="sr-only">Repair request detail</DialogDescription>
                            <p className="text-xs text-slate-500 mt-0.5">{fmt(repair.submitted_at)}</p>
                        </div>
                        <RepairStatusBadge status={repair.status} />
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className={`flex-1 overflow-y-auto ${noBar} divide-y divide-gray-100`}>

                    {/* Progress bar */}
                    <div className="px-6 py-5">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Repair Progress</p>
                        <TrackingBar status={repair.status} />
                    </div>

                    {isCancelled ? (
                        <div className="px-6 py-4">
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                                <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-red-700">Repair Request Cancelled</p>
                                    {repair.cancel_reason && (
                                        <p className="text-xs text-red-400 mt-1 italic">"{repair.cancel_reason}"</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Device */}
                            <div className="px-6 py-4">
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-3">Device</p>
                                <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50">
                                    <div className="w-12 h-12 shrink-0 rounded-lg border border-gray-100 bg-white flex items-center justify-center overflow-hidden">
                                        {repair.device_image
                                            ? <Image src={repair.device_image} alt={repair.device_name} width={48} height={48} className="object-contain p-0.5" />
                                            : <Package size={18} className="text-gray-300" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900">{repair.device_name}</p>
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {repair.repairs.map((r, i) => (
                                                <span key={i} className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-(--colour-fsP2) bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                                                    <Wrench size={9} /> {r}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 0: Received notice */}
                            {step === 0 && (
                                <div className="px-6 py-4">
                                    <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                                        <Clock size={14} className="text-(--colour-fsP2) shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">Request Received</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                We will contact you within 24 hours to schedule pickup. Free diagnosis included — no repair starts without your approval.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 1: Pickup partner */}
                            {step === 1 && (
                                <div className="px-6 py-4">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-3">Pickup Partner</p>
                                    <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50">
                                        <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                                            <Image src={PICKUP_PARTNERS[0].logo as string} alt={PICKUP_PARTNERS[0].name} width={36} height={36} className="object-contain p-1" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900">{PICKUP_PARTNERS[0].name}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-xs text-slate-500 flex items-center gap-0.5">
                                                    <Star size={11} className="text-yellow-400 fill-yellow-400" /> {PICKUP_PARTNERS[0].rating}
                                                </span>
                                                <span className="text-xs text-slate-500 flex items-center gap-0.5">
                                                    <Clock size={11} /> {PICKUP_PARTNERS[0].deliveryTime}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2+: Diagnosis report */}
                            {showDiagnosis && (
                                <div className="px-6 py-4">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-3">Diagnosis</p>
                                    <DiagnosisReport items={repair.diagnosis!} />
                                </div>
                            )}

                            {/* Approval required (only when status === diagnosis) */}
                            {isDiagnosis && !approved && (
                                <div className="px-6 py-4">
                                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-100 bg-slate-50 flex items-start gap-2.5">
                                            <AlertTriangle size={14} className="text-orange-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">Your Approval Required</p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Review the diagnosis report above. Approve to start repairs or decline to cancel.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-4">
                                            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                                <span className="text-sm text-slate-600 font-semibold">Total repair cost</span>
                                                <span className="text-xl font-bold text-(--colour-fsP2)">{fmtRs(diagnosisCost)}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={onClose}
                                                    className="flex-1 h-10 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    Decline
                                                </button>
                                                <button
                                                    onClick={() => setApproved(true)}
                                                    className="flex-[2] h-10 rounded-lg bg-(--colour-fsP2) hover:bg-blue-700 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <Check size={13} className="stroke-2" />
                                                    Approve Repair — {fmtRs(diagnosisCost)}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Approved confirmation */}
                            {isDiagnosis && approved && (
                                <div className="px-6 py-4">
                                    <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-slate-50">
                                        <div className="w-8 h-8 rounded-full bg-(--colour-fsP2) flex items-center justify-center shrink-0">
                                            <Check size={14} className="text-white stroke-2" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Repair Approved</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Our technician will begin repairs shortly. You will be notified on progress.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: In progress */}
                            {isRepairing && (
                                <div className="px-6 py-4">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-3">Repair In Progress</p>
                                    <div className="space-y-2">
                                        {repair.diagnosis?.filter(d => d.cost > 0).map((d, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2.5 border border-gray-100 rounded-lg">
                                                <div className="w-5 h-5 rounded-full bg-(--colour-fsP2)/10 flex items-center justify-center shrink-0">
                                                    <div className="w-2 h-2 rounded-full bg-(--colour-fsP2) animate-pulse" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-900">{d.part}</p>
                                                    <p className="text-[11px] text-slate-500">{d.action}</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded">In Progress</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-slate-50">
                                        <Clock size={13} className="text-(--colour-fsP2) shrink-0" />
                                        <p className="text-xs font-semibold text-slate-700">Estimated completion: 1–2 business days</p>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Complete */}
                            {isDone && (
                                <div className="px-6 py-4">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-slate-50 mb-3">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Repair Complete</p>
                                            <p className="text-xs text-slate-500 mt-0.5">90-day warranty on all repaired parts</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Paid</p>
                                            <p className="text-xl font-bold text-(--colour-fsP2)">{fmtRs(diagnosisCost)}</p>
                                        </div>
                                    </div>
                                    {repair.diagnosis && (
                                        <div className="space-y-1.5">
                                            {repair.diagnosis.filter(d => d.cost > 0).map((d, i) => (
                                                <div key={i} className="flex items-center justify-between px-3 py-2 border border-gray-100 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Check size={12} className="text-(--colour-fsP2)" />
                                                        <span className="text-xs font-semibold text-slate-900">{d.part}</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-(--colour-fsP2)">{fmtRs(d.cost)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Pickup details */}
                            <div className="px-6 py-4">
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-3">Pickup Details</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2.5 text-sm">
                                        <Phone size={13} className="text-(--colour-fsP2) shrink-0" />
                                        <span className="font-semibold text-slate-900">{repair.customer_phone}</span>
                                    </div>
                                    <div className="flex items-start gap-2.5 text-sm">
                                        <MapPin size={13} className="text-(--colour-fsP2) shrink-0 mt-0.5" />
                                        <span className="font-semibold text-slate-900">{repair.pickup_address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cost estimate (pre-diagnosis) */}
                            {step < 2 && (
                                <div className="px-6 py-4">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-3">Cost Estimate</p>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{fmtRs(repair.est_cost_min)} – {fmtRs(repair.est_cost_max)}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Final cost confirmed after free diagnosis</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 flex gap-2 px-6 py-3 border-t border-gray-100 bg-gray-50/40">
                    <button
                        onClick={onClose}
                        className="flex-1 h-9 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                    {!isDone && !isCancelled && !isDiagnosis && (
                        <button className="flex-1 h-9 rounded-lg bg-(--colour-fsP2) hover:bg-blue-700 text-xs font-semibold text-white transition-colors">
                            Contact Support
                        </button>
                    )}
                    {isDiagnosis && approved && (
                        <button className="flex-1 h-9 rounded-lg bg-(--colour-fsP2) hover:bg-blue-700 text-xs font-semibold text-white transition-colors">
                            Contact Support
                        </button>
                    )}
                    {isDone && (
                        <button className="flex-1 h-9 rounded-lg bg-(--colour-fsP2) hover:bg-blue-700 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5">
                            <CreditCard size={12} /> Download Invoice
                        </button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
    { key: 'all',       label: 'All' },
    { key: 'received',  label: 'Received' },
    { key: 'pickup',    label: 'Pickup' },
    { key: 'diagnosis', label: 'Diagnosis' },
    { key: 'repairing', label: 'In Repair' },
    { key: 'complete',  label: 'Complete' },
] as const;

// ─── Main Section ─────────────────────────────────────────────────────────────

interface CardState {
    rejectingId: number | null;
    rejectReason: string;
    approvedIds: Set<number>;
    rejectedIds: Set<number>;
}

export default function RepairSection() {
    const repairs = MOCK_REPAIRS;
    const [filter, setFilter] = useState<string>('all');
    const [detail, setDetail] = useState<RepairRequest | null>(null);
    const [card, setCard] = useState<CardState>({
        rejectingId: null,
        rejectReason: '',
        approvedIds: new Set(),
        rejectedIds: new Set(),
    });

    const updateCard = (u: Partial<CardState>) => setCard(p => ({ ...p, ...u }));

    const handleApprove = (id: number) => {
        updateCard({ approvedIds: new Set([...card.approvedIds, id]) });
    };

    const handleRejectOpen = (id: number) => {
        updateCard({ rejectingId: id, rejectReason: '' });
    };

    const handleRejectConfirm = (id: number) => {
        if (!card.rejectReason.trim()) return;
        updateCard({
            rejectedIds: new Set([...card.rejectedIds, id]),
            rejectingId: null,
            rejectReason: '',
        });
    };

    const counts: Record<string, number> = {
        all:       repairs.length,
        received:  repairs.filter(r => r.status === 'received').length,
        pickup:    repairs.filter(r => r.status === 'pickup').length,
        diagnosis: repairs.filter(r => r.status === 'diagnosis').length,
        repairing: repairs.filter(r => r.status === 'repairing').length,
        complete:  repairs.filter(r => r.status === 'complete').length,
    };

    const filtered = filter === 'all' ? repairs : repairs.filter(r => r.status === filter);

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-gray-100">
                {TABS.map(tab => {
                    const active = filter === tab.key;
                    return (
                        <button key={tab.key} onClick={() => setFilter(tab.key)}
                            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${active ? 'border-(--colour-fsP2) text-(--colour-fsP2)' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                            {tab.label}
                            <span className={`text-[10px] ${active ? 'text-(--colour-fsP2)' : 'text-gray-300'}`}>
                                {counts[tab.key]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* List */}
            <div className="space-y-2">
                {filtered.length === 0 ? (
                    <EmptyState label="No repair requests" sub="Submit a repair request to get started." />
                ) : filtered.map(repair => {
                    const step = STEP_INDEX[repair.status] ?? 0;
                    const pct = (step / (STEPS.length - 1)) * 100;
                    return (
                        <div key={repair.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                <div>
                                    <p className="text-xs font-bold text-slate-900">#{repair.ref_number}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{fmt(repair.submitted_at)}</p>
                                </div>
                                <RepairStatusBadge status={repair.status} />
                            </div>

                            <div className="px-4 pt-3 pb-2">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                                        {repair.device_image
                                            ? <Image src={repair.device_image} alt={repair.device_name} width={40} height={40} className="object-contain" />
                                            : <Wrench size={16} className="text-gray-300" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-slate-900 truncate">{repair.device_name}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{repair.repairs.join(', ')}</p>
                                    </div>
                                </div>

                                {/* Mini progress bar */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-bold uppercase tracking-wide text-(--colour-fsP2)">
                                            {STEPS[step]?.label}
                                        </span>
                                        <span className="text-[9px] text-slate-400">
                                            Step {step + 1} of {STEPS.length}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-(--colour-fsP2) rounded-full transition-all duration-300"
                                            style={{ width: `${repair.status === 'complete' ? 100 : pct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Inline reject reason input */}
                            {card.rejectingId === repair.id && (
                                <div className="px-4 py-3 border-t border-gray-100 space-y-2">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reason for rejection *</p>
                                    <textarea
                                        value={card.rejectReason}
                                        onChange={e => updateCard({ rejectReason: e.target.value })}
                                        placeholder="Tell us why you are declining this repair..."
                                        rows={2}
                                        className="w-full text-xs text-slate-900 placeholder-gray-300 border border-gray-200 rounded-lg p-2.5 resize-none focus:outline-none focus:border-(--colour-fsP2) bg-gray-50 transition-colors"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateCard({ rejectingId: null, rejectReason: '' })}
                                            className="flex-1 h-8 rounded-lg border border-gray-200 text-xs font-semibold text-slate-600 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            disabled={!card.rejectReason.trim()}
                                            onClick={() => handleRejectConfirm(repair.id)}
                                            className="flex-1 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-white transition-colors"
                                        >
                                            Confirm Rejection
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40">
                                {/* Approved state */}
                                {card.approvedIds.has(repair.id) && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-(--colour-fsP2)">
                                            <Check size={13} className="stroke-2" /> Repair Approved
                                        </div>
                                        <button onClick={() => setDetail(repair)} className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                                            <Eye size={11} /> Details
                                        </button>
                                    </div>
                                )}

                                {/* Rejected state */}
                                {card.rejectedIds.has(repair.id) && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-red-500">
                                            <XCircle size={13} /> Repair Declined
                                        </div>
                                        <button onClick={() => setDetail(repair)} className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                                            <Eye size={11} /> Details
                                        </button>
                                    </div>
                                )}

                                {/* Diagnosis: show accept/reject actions */}
                                {repair.status === 'diagnosis' && !card.approvedIds.has(repair.id) && !card.rejectedIds.has(repair.id) && card.rejectingId !== repair.id && (
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Quoted</p>
                                            <p className="text-sm font-bold text-slate-900 mt-0.5">
                                                {fmtRs(repair.diagnosis?.reduce((s, d) => s + d.cost, 0) ?? repair.est_cost_min)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleRejectOpen(repair.id)}
                                                className="h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-slate-700 hover:border-red-200 hover:text-red-500 transition-colors"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleApprove(repair.id)}
                                                className="h-8 px-3 rounded-lg bg-(--colour-fsP2) hover:bg-blue-700 text-xs font-semibold text-white transition-colors flex items-center gap-1"
                                            >
                                                <Check size={11} className="stroke-2" /> Accept
                                            </button>
                                            <button
                                                onClick={() => setDetail(repair)}
                                                className="h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                                            >
                                                <Eye size={12} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* All other statuses */}
                                {repair.status !== 'diagnosis' && !card.approvedIds.has(repair.id) && !card.rejectedIds.has(repair.id) && (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Estimate</p>
                                            <p className="text-sm font-bold text-slate-900 mt-0.5">
                                                {fmtRs(repair.est_cost_min)} – {fmtRs(repair.est_cost_max)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setDetail(repair)}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-(--colour-fsP2) hover:underline transition-colors"
                                        >
                                            <Eye size={12} /> View Details
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <RepairDetailDialog repair={detail} onClose={() => setDetail(null)} />
        </div>
    );
}
