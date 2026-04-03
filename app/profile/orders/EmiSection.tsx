'use client';

import React, { useState, useRef } from 'react';
import { CreditCard, CheckCircle2, Upload, Loader2, Search, MapPin } from 'lucide-react';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    StatusBadge, EmptyState,
    fmt, fmtRs,
    MOCK_EMI_ORDERS,
    type EmiOrder,
} from './shared';

const toNumber = (value: string | number | undefined) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getEmiTypeLabel = (emi: EmiOrder) => {
    if (emi.applicationtype === 'craditcard') return 'Credit Card';
    if (emi.applicationtype === 'with_new_card_Apply') return 'New Card';
    return 'Citizenship';
};

const getEmiProductName = (emi: EmiOrder) => emi.product?.name ?? 'EMI Product';
const getEmiDuration = (emi: EmiOrder) => {
    const total = toNumber(emi.total_installments);
    if (total > 0) return total;
    return toNumber(emi.formdata?.emiCalculation?.duration);
};
const getEmiPaidInstallments = (emi: EmiOrder) => toNumber(emi.paid_installments);
const getEmiFinanceAmount = (emi: EmiOrder) => {
    const financeAmount = toNumber(emi.formdata?.emiCalculation?.financeAmount);
    if (financeAmount > 0) return financeAmount;
    return toNumber(emi.product?.price);
};
const getEmiMonthlyInstallment = (emi: EmiOrder) => {
    const paymentPerMonth = toNumber(emi.formdata?.emiCalculation?.paymentpermonth);
    if (paymentPerMonth > 0) return paymentPerMonth;
    const duration = getEmiDuration(emi);
    const financeAmount = getEmiFinanceAmount(emi);
    return duration > 0 ? Math.round(financeAmount / duration) : financeAmount;
};
const getEmiVariant = (emi: EmiOrder) => emi.product?.varient ?? 'Standard';
const getEmiApplicantName = (emi: EmiOrder) => emi.formdata?.personalInfo?.name ?? 'N/A';
const getEmiApplicantPhone = (emi: EmiOrder) => emi.formdata?.personalInfo?.phone ?? 'N/A';
const getEmiBankName = (emi: EmiOrder) => emi.bank_name ?? emi.formdata?.bankInfo?.bankname ?? 'N/A';
const getEmiDownPayment = (emi: EmiOrder) => toNumber(emi.formdata?.emiCalculation?.downPayment);
const getEmiCardNumber = (emi: EmiOrder) => emi.formdata?.creditCard?.creditCardNumber ?? '';
const getMaskedCardNumber = (emi: EmiOrder) => {
    const digits = getEmiCardNumber(emi).replace(/\s+/g, '');
    if (digits.length < 4) return 'N/A';
    return `**** **** **** ${digits.slice(-4)}`;
};
const getEmiApplicationRows = (emi: EmiOrder) => {
    const financeAmount = getEmiFinanceAmount(emi);
    const downPayment = getEmiDownPayment(emi);
    const rows: Array<{ label: string; value: string }> = [
        { label: 'Applicant', value: getEmiApplicantName(emi) },
        { label: 'Phone', value: getEmiApplicantPhone(emi) },
        { label: 'Bank', value: getEmiBankName(emi) },
        { label: 'Variant', value: getEmiVariant(emi) },
        { label: 'Product Price', value: fmtRs(toNumber(emi.product?.price)) },
        { label: 'Finance Amount', value: fmtRs(financeAmount) },
    ];
    if (downPayment > 0) rows.push({ label: 'Down Payment', value: fmtRs(downPayment) });
    if (emi.applicationtype === 'craditcard') rows.push(
        { label: 'Card Holder', value: emi.formdata?.creditCard?.cardHolderName ?? 'N/A' },
        { label: 'Card Number', value: getMaskedCardNumber(emi) },
        { label: 'Card Limit', value: fmtRs(toNumber(emi.formdata?.creditCard?.cardLimit)) },
    );
    if (emi.applicationtype === 'with_new_card_Apply') rows.push(
        { label: 'Account Number', value: emi.formdata?.bankInfo?.accountNumber ?? 'N/A' },
        { label: 'Branch', value: emi.formdata?.bankInfo?.bankbranch ?? 'N/A' },
        { label: 'Salary', value: fmtRs(toNumber(emi.formdata?.bankInfo?.salaryAmount)) },
    );
    if (emi.applicationtype === 'with_cittizen') rows.push(
        { label: 'Guarantor', value: emi.formdata?.granterInfo?.name ?? 'N/A' },
        { label: 'Guarantor Phone', value: emi.formdata?.granterInfo?.phone ?? 'N/A' },
        { label: 'Guarantor Address', value: emi.formdata?.granterInfo?.address ?? 'N/A' },
    );
    return rows;
};

// ─── EMI Detail Dialog ────────────────────────────────────────────────────────
function EmiDetailDialog({ emi, onClose }: { emi: EmiOrder | null; onClose: () => void }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [showAll, setShowAll] = useState(false);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null;
        setFile(f);
        setPreview(f && f.type.startsWith('image/') ? URL.createObjectURL(f) : null);
    }

    if (!emi) return null;

    const totalInstallments = getEmiDuration(emi);
    const paidInstallments = getEmiPaidInstallments(emi);
    const monthlyInstallment = getEmiMonthlyInstallment(emi);
    const pct = totalInstallments > 0 ? Math.round((paidInstallments / totalInstallments) * 100) : 0;
    const needsDoc = emi.status === 'processing' || emi.status === 'pending';
    const applicationRows = getEmiApplicationRows(emi);
    const schedule = Array.from({ length: totalInstallments }, (_, i) => {
        const d = new Date(emi.created_at);
        d.setMonth(d.getMonth() + i + 1);
        return { month: i + 1, date: fmt(d.toISOString()), amount: monthlyInstallment, paid: i < paidInstallments };
    });
    const nextDue = schedule.find(s => !s.paid);
    const visible = showAll ? schedule : schedule.slice(0, 4);

    function handleUpload() {
        if (!file) return;
        setUploading(true);
        setTimeout(() => { setUploading(false); setUploaded(true); }, 1800);
    }

    return (
        <Dialog open={!!emi} onOpenChange={onClose}>
            <DialogContent className="p-0 bg-white overflow-hidden rounded-xl border border-gray-200 w-full sm:max-w-5xl mx-auto">
                <DialogHeader className="px-5 py-4 border-b border-gray-100">
                    <DialogTitle className="text-sm font-bold text-slate-900">{getEmiProductName(emi)}</DialogTitle>
                    <DialogDescription className="sr-only">EMI details</DialogDescription>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{getEmiTypeLabel(emi)}</span>
                        <StatusBadge status={emi.status} />
                    </div>
                </DialogHeader>

                <div className="px-5 py-4 space-y-5 max-h-[72vh] overflow-y-auto [&::-webkit-scrollbar]:w-0 [scrollbar-width:none]">

                    {/* Key stats row */}
                    <div className="grid grid-cols-3 divide-x divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                        <div className="px-3 py-3 text-center">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Monthly</p>
                            <p className="text-sm font-bold text-(--colour-fsP2)">{fmtRs(monthlyInstallment)}</p>
                        </div>
                        <div className="px-3 py-3 text-center">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Paid</p>
                            <p className="text-sm font-bold text-slate-900">{paidInstallments}/{totalInstallments}</p>
                        </div>
                        <div className="px-3 py-3 text-center">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Next Due</p>
                            <p className="text-sm font-bold text-slate-900">{nextDue ? nextDue.date : '—'}</p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div>
                        <div className="flex justify-between mb-1.5">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Payment Progress</p>
                            <span className="text-[10px] font-semibold text-(--colour-fsP2)">{pct}%</span>
                        </div>
                        <div className="h-[3px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--colour-fsP2)] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                    </div>

                    {/* Application details */}
                    <div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-3">Application Details</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            {applicationRows.map(row => (
                                <div key={row.label}>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{row.label}</p>
                                    <p className="text-xs font-semibold text-slate-900">{row.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status note */}
                    {emi.document_note && (
                        <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                            <p className="text-[10px] font-semibold text-(--colour-fsP2) uppercase tracking-widest mb-1">Status Update</p>
                            <p className="text-xs text-slate-800 leading-relaxed">{emi.document_note}</p>
                        </div>
                    )}

                    {/* Schedule */}
                    <div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-3">Schedule</p>
                        <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                            {visible.map((s, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${s.paid ? 'bg-[var(--colour-fsP2)] text-white' : 'bg-gray-100 text-slate-500'}`}>
                                            {s.paid ? <CheckCircle2 size={12} /> : <span className="text-[10px] font-semibold">{s.month}</span>}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">{fmtRs(s.amount)}</p>
                                            <p className="text-[10px] text-slate-500">{s.date}</p>
                                        </div>
                                    </div>
                                    {s.paid && <span className="text-[10px] font-semibold text-(--colour-fsP2)">Paid</span>}
                                </div>
                            ))}
                        </div>
                        {schedule.length > 4 && (
                            <button onClick={() => setShowAll(!showAll)}
                                className="w-full pt-2 text-xs font-semibold text-slate-500 hover:text-(--colour-fsP2) transition-colors">
                                {showAll ? 'Show less' : `Show all ${schedule.length} months`}
                            </button>
                        )}
                    </div>

                    {/* Document Upload */}
                    {needsDoc && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                <p className="text-xs font-bold text-slate-900">Submit Document</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                    {emi.applicationtype === 'with_cittizen' && 'Upload your citizenship document (front & back)'}
                                    {emi.applicationtype === 'with_new_card_Apply' && 'Upload bank statement or salary slip'}
                                    {emi.applicationtype === 'craditcard' && 'Upload credit card statement or bank letter'}
                                    {emi.applicationtype !== 'with_cittizen' && emi.applicationtype !== 'with_new_card_Apply' && emi.applicationtype !== 'craditcard' && 'Upload required verification document'}
                                </p>
                            </div>
                            <div className="p-4">
                                {uploaded ? (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-(--colour-fsP2)" />
                                        <p className="text-xs font-semibold text-slate-800">Document submitted — under review</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <button onClick={() => fileRef.current?.click()}
                                            className="w-full border border-dashed border-gray-200 rounded-lg bg-gray-50 hover:border-(--colour-fsP2) hover:bg-white transition-colors overflow-hidden">
                                            {preview ? (
                                                <div className="relative w-full aspect-4/3">
                                                    <img src={preview} alt="preview" className="w-full h-full object-contain" />
                                                </div>
                                            ) : (
                                                <div className="py-6 text-center">
                                                    <p className="text-xs font-semibold text-slate-800">{file ? file.name : 'Choose File'}</p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">PDF, JPG, PNG · Max 5MB</p>
                                                </div>
                                            )}
                                            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                                        </button>
                                        {file && (
                                            <button onClick={handleUpload} disabled={uploading}
                                                className="w-full h-9 bg-[var(--colour-fsP2)] text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                                                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                                Upload Now
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── EMI Section ──────────────────────────────────────────────────────────────
export default function EmiSection() {
    const [detail, setDetail] = useState<EmiOrder | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = MOCK_EMI_ORDERS.filter(emi => {
        const product = getEmiProductName(emi).toLowerCase();
        const type = getEmiTypeLabel(emi).toLowerCase();
        const search = searchTerm.toLowerCase();
        return product.includes(search) || type.includes(search);
    });

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <CreditCard className="w-4 h-4 text-(--colour-fsP2)" />
                        <h2 className="text-lg font-bold text-slate-900">EMI Orders</h2>
                    </div>
                    <p className="text-xs text-slate-500">Manage your active financing plans.</p>
                </div>
                <div className="relative w-full sm:w-52">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input type="text" placeholder="Search products..."
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-(--colour-fsP2) focus:bg-white transition-colors"
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState label={searchTerm ? "No plans found" : "No EMI orders"} sub={searchTerm ? "Try another product name." : "Apply for EMI on eligible products."} />
            ) : (
                <div className="space-y-2">
                    {filtered.map(emi => {
                        const totalInstallments = getEmiDuration(emi);
                        const paidInstallments = getEmiPaidInstallments(emi);
                        const monthlyInstallment = getEmiMonthlyInstallment(emi);
                        const pct = totalInstallments > 0 ? Math.round((paidInstallments / totalInstallments) * 100) : 0;
                        return (
                            <div key={emi.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">{getEmiProductName(emi)}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">{getEmiTypeLabel(emi)} · {fmt(emi.created_at)}</p>
                                    </div>
                                    <StatusBadge status={emi.status} />
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 divide-x divide-gray-100 px-0">
                                    <div className="px-4 py-3">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Monthly</p>
                                        <p className="text-sm font-bold text-(--colour-fsP2)">{fmtRs(monthlyInstallment)}</p>
                                    </div>
                                    <div className="px-4 py-3">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Paid</p>
                                        <p className="text-sm font-bold text-slate-900">{paidInstallments}/{totalInstallments}</p>
                                    </div>
                                    <div className="px-4 py-3">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Total</p>
                                        <p className="text-sm font-bold text-slate-900">{fmtRs(getEmiFinanceAmount(emi))}</p>
                                    </div>
                                </div>

                                {/* Progress + action */}
                                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40">
                                    <div className="h-[2px] bg-gray-100 rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-[var(--colour-fsP2)] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] text-slate-500">{pct}% cleared</p>
                                        <button onClick={() => setDetail(emi)}
                                            className="text-xs font-semibold text-(--colour-fsP2) hover:underline">
                                            Manage →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <EmiDetailDialog emi={detail} onClose={() => setDetail(null)} />
        </div>
    );
}
