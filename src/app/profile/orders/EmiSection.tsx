'use client';

import React, { useState, useRef } from 'react';
import {
    CreditCard, Calendar, FileText, Building2, CheckCircle2, Clock,
    Banknote, Upload, Loader2, AlertTriangle, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    FilterBar, EmptyState, StatusBadge, DRow, DSection,
    fmt, fmtRs,
    MOCK_EMI_ORDERS,
    type EmiOrder,
} from './shared';

// ─── EMI Detail Dialog ────────────────────────────────────────────────────────

function EmiDetailDialog({ emi, onClose }: { emi: EmiOrder | null; onClose: () => void }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [showAll, setShowAll] = useState(false);

    if (!emi) return null;

    const pct = emi.total_installments > 0 ? Math.round((emi.paid_installments / emi.total_installments) * 100) : 0;
    const needsDoc = emi.status === 'processing' || emi.status === 'pending';

    // Build schedule
    const schedule = Array.from({ length: emi.total_installments }, (_, i) => {
        const d = new Date(emi.created_at);
        d.setMonth(d.getMonth() + i + 1);
        return { month: i + 1, date: fmt(d.toISOString()), amount: emi.monthly_installment, paid: i < emi.paid_installments };
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
            <DialogContent className="rounded-xl border border-gray-200 bg-white max-w-lg w-full mx-4 p-0 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <DialogHeader className="px-5 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
                    <div className="flex items-start justify-between gap-2">
                        <DialogTitle className="text-sm font-bold text-gray-900 leading-snug">{emi.product_name}</DialogTitle>
                        <StatusBadge status={emi.status} />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${emi.emi_type === 'credit_card' ? 'text-[var(--colour-fsP2)] bg-blue-50 border-blue-200' : 'text-gray-700 bg-gray-100 border-gray-200'}`}>
                            {emi.emi_type === 'credit_card' ? '💳 Credit Card EMI' : '📄 Citizenship EMI'}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Calendar size={9} /> Applied {fmt(emi.created_at)}
                        </span>
                        {emi.bank_name && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Building2 size={9} /> {emi.bank_name}
                            </span>
                        )}
                    </div>
                </DialogHeader>

                <div className="overflow-y-auto flex-1 p-5 space-y-5">
                    {/* Status note */}
                    {emi.document_note && (
                        <div className={`flex items-start gap-2.5 p-3.5 rounded-lg border ${emi.status === 'pending' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
                            <FileText size={14} className={`shrink-0 mt-0.5 ${emi.status === 'pending' ? 'text-[var(--colour-fsP1)]' : 'text-[var(--colour-fsP2)]'}`} />
                            <p className="text-[11px] text-gray-700 leading-relaxed">{emi.document_note}</p>
                        </div>
                    )}

                    {/* Financial summary */}
                    <div>
                        <DSection>Financial Summary</DSection>
                        <div className="grid grid-cols-3 mt-2 border border-gray-100 rounded-lg overflow-hidden divide-x divide-gray-100 text-center">
                            {[
                                { label: 'Monthly EMI', val: fmtRs(emi.monthly_installment), highlight: true },
                                { label: 'Total Amount', val: fmtRs(emi.total_amount) },
                                { label: 'Paid So Far', val: fmtRs(emi.paid_installments * emi.monthly_installment) },
                            ].map((c, i) => (
                                <div key={i} className={`py-3 ${c.highlight ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                    <p className="text-[10px] text-gray-400">{c.label}</p>
                                    <p className={`text-xs font-black mt-0.5 ${c.highlight ? 'text-[var(--colour-fsP2)]' : 'text-gray-800'}`}>{c.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Next payment due */}
                    {nextDue && emi.status === 'active' && (
                        <div className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-lg bg-gray-50">
                            <Banknote size={16} className="text-[var(--colour-fsP1)] shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-gray-800">Next Payment Due</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">{nextDue.date} — {fmtRs(nextDue.amount)}</p>
                            </div>
                        </div>
                    )}

                    {/* Progress + Schedule */}
                    {emi.total_installments > 0 && (
                        <div>
                            <DSection>Repayment Schedule</DSection>
                            <div className="mt-2 flex justify-between text-[10px] text-gray-400 mb-1.5">
                                <span>{emi.paid_installments} of {emi.total_installments} months paid</span>
                                <span className="font-bold text-[var(--colour-fsP2)]">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                                <div className="h-full bg-[var(--colour-fsP2)] rounded-full" style={{ width: `${pct}%` }} />
                            </div>

                            <div className="space-y-1.5">
                                {visible.map(s => (
                                    <div key={s.month}
                                        className={`flex items-center justify-between px-3 py-2 rounded text-[11px] border ${s.paid ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                                        <span className={`flex items-center gap-1.5 font-medium ${s.paid ? 'text-[var(--colour-fsP2)]' : 'text-gray-500'}`}>
                                            {s.paid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                                            Month {s.month}
                                        </span>
                                        <span className="text-gray-400">{s.date}</span>
                                        <span className={`font-bold ${s.paid ? 'text-[var(--colour-fsP2)]' : 'text-gray-700'}`}>{fmtRs(s.amount)}</span>
                                        {s.paid && <span className="text-[9px] font-bold text-[var(--colour-fsP2)] border border-[var(--colour-fsP2)] px-1.5 py-0.5 rounded">PAID</span>}
                                    </div>
                                ))}
                            </div>
                            {schedule.length > 4 && (
                                <button onClick={() => setShowAll(v => !v)}
                                    className="w-full mt-2 flex items-center justify-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-[var(--colour-fsP2)] transition-colors py-1">
                                    {showAll ? <><ChevronUp size={12} /> Show Less</> : <><ChevronDown size={12} /> Show All {schedule.length} Months</>}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Document upload (processing / pending only) */}
                    {needsDoc && (
                        <div>
                            <DSection>Submit Required Document</DSection>
                            <p className="text-[11px] text-gray-500 mt-1 mb-3">
                                Once you receive the bank approval email, upload the required document below to activate your EMI.
                            </p>

                            {uploaded ? (
                                <div className="flex items-center gap-2 p-3.5 bg-blue-50 border border-blue-200 rounded-lg">
                                    <CheckCircle2 size={16} className="text-[var(--colour-fsP2)] shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-[var(--colour-fsP2)]">Document Submitted</p>
                                        <p className="text-[10px] text-gray-500">Our team will verify and activate your EMI within 1–2 business days.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div onClick={() => fileRef.current?.click()}
                                        className="flex flex-col items-center gap-2 py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 cursor-pointer hover:border-[var(--colour-fsP2)] hover:bg-blue-50 transition-colors">
                                        <Upload size={18} className="text-gray-400" />
                                        <p className="text-xs font-semibold text-gray-600">
                                            {file ? file.name : 'Click to select document'}
                                        </p>
                                        <p className="text-[10px] text-gray-400">PDF, JPG, PNG — Max 5MB</p>
                                    </div>
                                    <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />

                                    {file && (
                                        <button onClick={handleUpload} disabled={uploading}
                                            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-[var(--colour-fsP2)] rounded-lg hover:bg-[var(--colour-fsP2)]/90 transition-colors disabled:opacity-70">
                                            {uploading
                                                ? <><Loader2 size={13} className="animate-spin" /> Uploading…</>
                                                : <><Upload size={13} /> Submit Document</>}
                                        </button>
                                    )}

                                    <div className="flex items-start gap-2 mt-3 p-2.5 bg-orange-50 border border-orange-100 rounded-lg">
                                        <AlertTriangle size={12} className="text-[var(--colour-fsP1)] shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-gray-600">
                                            Only documents received from your bank via email are accepted. Do not upload personal documents without bank confirmation.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── EMI Section ──────────────────────────────────────────────────────────────

export default function EmiSection() {
    const [filter, setFilter] = useState('all');
    const [detail, setDetail] = useState<EmiOrder | null>(null);

    const FILTERS = [
        { key: 'all', label: 'All', cnt: MOCK_EMI_ORDERS.length },
        { key: 'card', label: 'Credit Card', cnt: MOCK_EMI_ORDERS.filter(e => e.emi_type === 'credit_card').length },
        { key: 'citizenship', label: 'Citizenship', cnt: MOCK_EMI_ORDERS.filter(e => e.emi_type === 'citizenship').length },
        { key: 'pending', label: 'Pending', cnt: MOCK_EMI_ORDERS.filter(e => e.status === 'pending').length },
        { key: 'processing', label: 'Doc Review', cnt: MOCK_EMI_ORDERS.filter(e => e.status === 'processing').length },
    ];

    const filtered = filter === 'all' ? MOCK_EMI_ORDERS
        : filter === 'card' ? MOCK_EMI_ORDERS.filter(e => e.emi_type === 'credit_card')
            : filter === 'citizenship' ? MOCK_EMI_ORDERS.filter(e => e.emi_type === 'citizenship')
                : MOCK_EMI_ORDERS.filter(e => e.status === filter);

    return (
        <div className="space-y-4">
            <FilterBar filters={FILTERS} active={filter} onSelect={setFilter} />

            {filtered.length === 0
                ? <EmptyState label="No EMI orders" sub="Apply for EMI on eligible products." />
                : filtered.map(emi => {
                    const pct = emi.total_installments > 0 ? Math.round((emi.paid_installments / emi.total_installments) * 100) : 0;
                    return (
                        <div key={emi.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            {/* Card header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${emi.emi_type === 'credit_card' ? 'text-[var(--colour-fsP2)] bg-blue-50 border-blue-200' : 'text-gray-700 bg-gray-100 border-gray-200'}`}>
                                        {emi.emi_type === 'credit_card' ? '💳 Credit Card' : '📄 Citizenship'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                        <Calendar size={9} /> {fmt(emi.created_at)}
                                    </span>
                                </div>
                                <StatusBadge status={emi.status} />
                            </div>

                            <div className="px-4 py-3">
                                <p className="text-sm font-bold text-gray-800 mb-2">{emi.product_name}</p>

                                {emi.document_note && (
                                    <div className="flex items-start gap-2 mb-3 p-2.5 bg-orange-50 border border-orange-100 rounded-lg">
                                        <FileText size={11} className="text-[var(--colour-fsP1)] shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-gray-700">{emi.document_note}</p>
                                    </div>
                                )}

                                {/* Stats row */}
                                <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
                                    <div>
                                        <p className="text-[10px] text-gray-400">Monthly</p>
                                        <p className="text-xs font-bold text-gray-800">{fmtRs(emi.monthly_installment)}</p>
                                    </div>
                                    <div className="w-px h-5 bg-gray-100" />
                                    <div>
                                        <p className="text-[10px] text-gray-400">Total</p>
                                        <p className="text-xs font-bold text-gray-800">{fmtRs(emi.total_amount)}</p>
                                    </div>
                                    <div className="w-px h-5 bg-gray-100" />
                                    <div>
                                        <p className="text-[10px] text-gray-400">Installments</p>
                                        <p className="text-xs font-bold text-gray-800">{emi.paid_installments}/{emi.total_installments}</p>
                                    </div>
                                    <button onClick={() => setDetail(emi)}
                                        className="ml-auto text-[11px] font-semibold text-[var(--colour-fsP2)] hover:underline">
                                        Details →
                                    </button>
                                </div>

                                {/* Progress bar */}
                                {emi.paid_installments > 0 && (
                                    <div className="mt-3">
                                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                            <span>Repayment</span>
                                            <span className="font-bold text-[var(--colour-fsP2)]">{pct}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[var(--colour-fsP2)] rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            }

            <EmiDetailDialog emi={detail} onClose={() => setDetail(null)} />
        </div>
    );
}
