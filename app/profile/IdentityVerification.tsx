'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertCircle, ArrowRight, CheckCircle2,
    FileText, Fingerprint, Loader2, ShieldCheck, Upload, User,
} from 'lucide-react';
import { toast } from 'sonner';
import { ProfileService } from '../api/services/profile.service';
import type { ProfileUser } from './interface';

type DocumentId = 'citizenship' | 'national-id' | 'passport' | 'license';

const MAX_FILE_BYTES = 300 * 1024; // 300 KB

interface State {
    step: 1 | 2 | 3 | 4;
    isLoadingProfile: boolean;
    isSubmitting: boolean;
    profile: ProfileUser | null;
    selectedDocument: DocumentId;
    form: { phone: string; fullName: string; documentNumber: string; dateOfBirth: string };
    uploads: { front: File | null; back: File | null };
    frontPreview: string | null;
    backPreview: string | null;
    status: 'draft' | 'pending' | 'accepted';
    error: string | null;
}

const DOCUMENT_TYPES: Array<{
    id: DocumentId; label: string; summary: string; description: string;
    numberLabel: string; frontLabel: string; backLabel: string | null; icon: LucideIcon;
}> = [
    { id: 'citizenship',  label: 'Citizenship',     summary: 'Best for EMI and finance approval',      description: 'Nepal citizenship card — front and back clearly visible.',       numberLabel: 'Citizenship Number', frontLabel: 'Front side',     backLabel: 'Back side',  icon: Fingerprint },
    { id: 'national-id',  label: 'National ID',      summary: 'National identity card issued in Nepal', description: 'National ID card with all printed fields readable.',              numberLabel: 'National ID Number', frontLabel: 'Front side',     backLabel: 'Back side',  icon: ShieldCheck },
    { id: 'passport',     label: 'Passport',         summary: 'For travelers and expatriates',          description: 'Passport identity page with name, number, and date of birth.',   numberLabel: 'Passport Number',    frontLabel: 'Identity page', backLabel: null,         icon: FileText    },
    { id: 'license',      label: 'Driving License',  summary: 'Accepted for identity match',            description: 'License card with both sides fully visible.',                    numberLabel: 'License Number',     frontLabel: 'Front side',     backLabel: 'Back side',  icon: User        },
];

const STEPS = [
    { num: 1 as const, label: 'Document Type'    },
    { num: 2 as const, label: 'Personal Details' },
    { num: 3 as const, label: 'Upload Photos'    },
    { num: 4 as const, label: 'Review & Submit'  },
];

const inputCls = 'w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-(--colour-fsP2) focus:bg-white transition-colors';
const labelCls = 'text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest';

export default function IdentityVerification() {
    const [state, setState] = useState<State>({
        step: 1,
        isLoadingProfile: true,
        isSubmitting: false,
        profile: null,
        selectedDocument: 'citizenship',
        form: { phone: '', fullName: '', documentNumber: '', dateOfBirth: '' },
        uploads: { front: null, back: null },
        frontPreview: null,
        backPreview: null,
        status: 'draft',
        error: null,
    });

    const prevFrontRef = useRef<string | null>(null);
    const prevBackRef  = useRef<string | null>(null);

    const update = (u: Partial<State>) => setState(p => ({ ...p, ...u }));
    const updateForm = (key: keyof State['form'], value: string) =>
        setState(p => ({ ...p, form: { ...p.form, [key]: value }, error: null }));

    const doc = DOCUMENT_TYPES.find(d => d.id === state.selectedDocument) ?? DOCUMENT_TYPES[0];
    const uploadedCount = [state.uploads.front, state.uploads.back].filter(Boolean).length;
    const requiredUploads = doc.backLabel ? 2 : 1;

    useEffect(() => {
        ProfileService.ProfileView()
            .then(res => {
                const p = res.data as ProfileUser;
                setState(prev => ({
                    ...prev, isLoadingProfile: false, profile: p,
                    form: { ...prev.form, phone: p.contact_number ?? '', fullName: p.name ?? '', dateOfBirth: p.date_of_birth ?? '' },
                }));
            })
            .catch(() => update({ isLoadingProfile: false, error: 'Could not load profile. You can still fill the form manually.' }));
    }, []);

    // revoke old object URLs on unmount
    useEffect(() => {
        return () => {
            if (prevFrontRef.current) URL.revokeObjectURL(prevFrontRef.current);
            if (prevBackRef.current)  URL.revokeObjectURL(prevBackRef.current);
        };
    }, []);

    const handleFileChange = (key: 'front' | 'back') => (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        if (file.size > MAX_FILE_BYTES) {
            update({ error: `${key === 'front' ? doc.frontLabel : doc.backLabel} must be under 300 KB. Your file is ${(file.size / 1024).toFixed(0)} KB.` });
            e.target.value = '';
            return;
        }
        const previewUrl = URL.createObjectURL(file);
        if (key === 'front') {
            if (prevFrontRef.current) URL.revokeObjectURL(prevFrontRef.current);
            prevFrontRef.current = previewUrl;
            setState(p => ({ ...p, uploads: { ...p.uploads, front: file }, frontPreview: previewUrl, error: null }));
        } else {
            if (prevBackRef.current) URL.revokeObjectURL(prevBackRef.current);
            prevBackRef.current = previewUrl;
            setState(p => ({ ...p, uploads: { ...p.uploads, back: file }, backPreview: previewUrl, error: null }));
        }
    };

    const validateStep2 = () => {
        if (!state.form.fullName.trim()) return 'Enter your full name.';
        if (state.form.phone.replace(/\D/g, '').length < 10) return 'Enter a valid 10-digit mobile number.';
        if (!state.form.documentNumber.trim()) return `Enter your ${doc.numberLabel.toLowerCase()}.`;
        if (!state.form.dateOfBirth) return 'Select your date of birth.';
        return null;
    };

    const validateStep3 = () => {
        if (!state.uploads.front) return `${doc.frontLabel} is required.`;
        if (doc.backLabel && !state.uploads.back) return `${doc.backLabel} is required.`;
        return null;
    };

    const goNext = () => {
        update({ error: null });
        if (state.step === 2) { const e = validateStep2(); if (e) { update({ error: e }); return; } }
        if (state.step === 3) { const e = validateStep3(); if (e) { update({ error: e }); return; } }
        if (state.step < 4) update({ step: (state.step + 1) as State['step'], error: null });
    };

    const goBack = () => {
        if (state.step > 1) update({ step: (state.step - 1) as State['step'], error: null });
    };

    const handleDocumentSelect = (id: DocumentId) => {
        if (prevFrontRef.current) { URL.revokeObjectURL(prevFrontRef.current); prevFrontRef.current = null; }
        if (prevBackRef.current)  { URL.revokeObjectURL(prevBackRef.current);  prevBackRef.current  = null; }
        setState(p => ({
            ...p, selectedDocument: id,
            form: { ...p.form, documentNumber: '' },
            uploads: { front: null, back: null },
            frontPreview: null, backPreview: null,
            status: 'draft', error: null,
        }));
    };

    const handleSubmit = async () => {
        update({ isSubmitting: true, error: null });
        await new Promise(r => setTimeout(r, 1800));
        update({ isSubmitting: false, status: 'pending' });
        toast.success('Verification submitted! We will review your documents and notify you.');
    };

    // ─── Step indicator ───────────────────────────────────────────────────────
    const StepBar = () => (
        <div className="flex items-center gap-0 mb-6">
            {STEPS.map((s, i) => {
                const done    = state.step > s.num;
                const current = state.step === s.num;
                return (
                    <React.Fragment key={s.num}>
                        <div className="flex items-center gap-2 shrink-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                                ${done || current ? 'bg-(--colour-fsP2) text-white' : 'bg-gray-100 text-slate-500'}`}>
                                {done ? <CheckCircle2 size={14} /> : s.num}
                            </div>
                            <span className={`text-xs font-bold hidden sm:block ${current ? 'text-(--colour-fsP2)' : done ? 'text-slate-900' : 'text-slate-400'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-px mx-3 ${done ? 'bg-(--colour-fsP2)' : 'bg-gray-200'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );

    // ─── Navigation buttons ───────────────────────────────────────────────────
    const NavButtons = ({ onNext, nextLabel = 'Continue', nextDisabled = false }: { onNext?: () => void; nextLabel?: string; nextDisabled?: boolean }) => (
        <div className="flex items-center justify-between pt-2">
            <button onClick={goBack} disabled={state.step === 1}
                className="h-9 px-5 border border-gray-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors">
                Back
            </button>
            <button onClick={onNext ?? goNext} disabled={nextDisabled}
                className="h-9 px-6 bg-(--colour-fsP2) text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-2">
                {nextLabel} <ArrowRight size={13} />
            </button>
        </div>
    );

    // ─── Upload card ──────────────────────────────────────────────────────────
    const UploadCard = ({ side, label, preview, file }: { side: 'front' | 'back'; label: string; preview: string | null; file: File | null }) => (
        <label className={`flex flex-col gap-3 p-4 border border-dashed rounded-xl cursor-pointer transition-colors ${file ? 'border-(--colour-fsP2) bg-blue-50' : 'border-gray-200 hover:border-(--colour-fsP2) bg-gray-50'}`}>
            {preview ? (
                <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-white">
                    <img src={preview} alt={label} className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className={`p-2 rounded-lg w-fit border ${file ? 'border-(--colour-fsP2) bg-white text-(--colour-fsP2)' : 'border-gray-200 bg-white text-slate-400'}`}>
                    <Upload size={14} />
                </div>
            )}
            <div>
                <p className="text-xs font-bold text-slate-900">{label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">JPG or PNG · Max 300 KB</p>
            </div>
            <div className={`h-9 px-3 rounded-lg border flex items-center text-xs font-semibold ${file ? 'border-(--colour-fsP2) bg-white text-(--colour-fsP2)' : 'border-gray-200 bg-white text-slate-500'}`}>
                {file ? `✓ ${file.name}` : 'Choose file'}
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange(side)} />
        </label>
    );

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-(--colour-fsP2)" />
                    <div>
                        <h2 className="text-lg font-bold text-(--colour-fsP2)">Identity Verification</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Verify once — used across EMI, exchange and account security</p>
                    </div>
                </div>
                {state.status === 'pending' && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border text-amber-600 bg-amber-50 border-amber-200 uppercase tracking-widest">
                        Under Review
                    </span>
                )}
                {state.status === 'accepted' && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border text-emerald-600 bg-emerald-50 border-emerald-200 uppercase tracking-widest">
                        <CheckCircle2 size={10} /> Verified
                    </span>
                )}
            </div>

            {/* Pending state — full-page message */}
            {state.status === 'pending' && (
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-6 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto">
                        <ShieldCheck size={18} className="text-amber-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Verification Under Review</p>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">Your documents have been submitted. Our team will review them and notify you once verification is complete.</p>
                </div>
            )}

            {state.status !== 'pending' && (
                <div className="border border-gray-200 rounded-xl bg-white p-5">
                    <StepBar />

                    {state.error && (
                        <div className="flex items-start gap-2.5 p-3 border border-red-200 bg-red-50 rounded-lg mb-4">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs font-semibold text-red-700">{state.error}</p>
                        </div>
                    )}

                    {/* ── Step 1: Choose Document ──────────────────────────────── */}
                    {state.step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-bold text-slate-900 mb-0.5">Which document do you want to use?</p>
                                <p className="text-xs text-slate-500">Your selected document will be used to verify identity across all services.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {DOCUMENT_TYPES.map(d => {
                                    const active = d.id === state.selectedDocument;
                                    const Icon = d.icon;
                                    return (
                                        <button key={d.id} type="button" onClick={() => handleDocumentSelect(d.id)}
                                            className={`text-left p-4 rounded-xl border transition-colors ${active ? 'border-(--colour-fsP2) bg-blue-50' : 'border-gray-200 hover:border-slate-300 bg-white'}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`p-2 rounded-lg border ${active ? 'border-(--colour-fsP2) bg-white text-(--colour-fsP2)' : 'border-gray-200 bg-gray-50 text-slate-500'}`}>
                                                    <Icon size={15} />
                                                </div>
                                                {active && <CheckCircle2 size={15} className="text-(--colour-fsP2)" />}
                                            </div>
                                            <p className={`text-sm font-bold ${active ? 'text-(--colour-fsP2)' : 'text-slate-900'}`}>{d.label}</p>
                                            <p className="text-xs font-semibold text-slate-500 mt-0.5">{d.summary}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{d.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                                <p className={labelCls + ' mb-2'}>This ID works for</p>
                                <div className="flex flex-wrap gap-2">
                                    {['EMI Account Checks', 'Exchange Requests', 'Profile Identity'].map(u => (
                                        <span key={u} className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-slate-700">
                                            <CheckCircle2 size={10} className="text-(--colour-fsP2)" /> {u}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <NavButtons />
                        </div>
                    )}

                    {/* ── Step 2: Personal Details ─────────────────────────────── */}
                    {state.step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-bold text-slate-900 mb-0.5">Fill in your personal details</p>
                                <p className="text-xs text-slate-500">Details must match exactly with your {doc.label}.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2 space-y-1.5">
                                    <label className={labelCls}>Full Name</label>
                                    <input type="text" value={state.form.fullName}
                                        onChange={e => updateForm('fullName', e.target.value)}
                                        placeholder="Full name as on document"
                                        className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Registered Mobile</label>
                                    <input type="tel" value={state.form.phone}
                                        onChange={e => updateForm('phone', e.target.value)}
                                        placeholder="+977 98XXXXXXXX"
                                        className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Date of Birth</label>
                                    <input type="date" value={state.form.dateOfBirth}
                                        onChange={e => updateForm('dateOfBirth', e.target.value)}
                                        className={inputCls} />
                                </div>
                                <div className="sm:col-span-2 space-y-1.5">
                                    <label className={labelCls}>{doc.numberLabel}</label>
                                    <input type="text" value={state.form.documentNumber}
                                        onChange={e => updateForm('documentNumber', e.target.value)}
                                        placeholder={`Enter ${doc.numberLabel.toLowerCase()}`}
                                        className={inputCls} />
                                </div>
                            </div>
                            {state.isLoadingProfile && (
                                <p className="text-xs font-semibold text-slate-500">Loading profile to prefill your details…</p>
                            )}
                            <NavButtons />
                        </div>
                    )}

                    {/* ── Step 3: Upload Photos ────────────────────────────────── */}
                    {state.step === 3 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 mb-0.5">Upload your {doc.label} photos</p>
                                    <p className="text-xs text-slate-500">{doc.backLabel ? 'Upload both sides clearly.' : 'Only one side required.'} Max 300 KB each.</p>
                                </div>
                                <span className="text-[10px] font-bold text-(--colour-fsP2) bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
                                    {uploadedCount}/{requiredUploads} uploaded
                                </span>
                            </div>
                            <div className={`grid gap-4 ${doc.backLabel ? 'sm:grid-cols-2' : 'max-w-sm'}`}>
                                <UploadCard side="front" label={doc.frontLabel} preview={state.frontPreview} file={state.uploads.front} />
                                {doc.backLabel ? (
                                    <UploadCard side="back" label={doc.backLabel} preview={state.backPreview} file={state.uploads.back} />
                                ) : (
                                    <div className="hidden" />
                                )}
                            </div>
                            <NavButtons />
                        </div>
                    )}

                    {/* ── Step 4: Review & Submit ──────────────────────────────── */}
                    {state.step === 4 && (
                        <div className="space-y-5">
                            <div>
                                <p className="text-sm font-bold text-slate-900 mb-0.5">Review and submit</p>
                                <p className="text-xs text-slate-500">Check your details and photos before submitting for review.</p>
                            </div>

                            {/* Details grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Document',      value: doc.label                   },
                                    { label: 'Full Name',     value: state.form.fullName         },
                                    { label: 'Mobile',        value: state.form.phone            },
                                    { label: 'Date of Birth', value: state.form.dateOfBirth      },
                                    { label: doc.numberLabel, value: state.form.documentNumber   },
                                    { label: 'Photos Ready',  value: `${uploadedCount}/${requiredUploads}` },
                                ].map(r => (
                                    <div key={r.label} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                        <p className={labelCls + ' mb-0.5'}>{r.label}</p>
                                        <p className="text-xs font-bold text-slate-900">{r.value || '—'}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Document photo previews */}
                            <div>
                                <p className={labelCls + ' mb-2'}>Uploaded Photos</p>
                                <div className={`grid gap-3 ${doc.backLabel ? 'sm:grid-cols-2' : 'max-w-xs'}`}>
                                    {state.frontPreview && (
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-semibold text-slate-500">{doc.frontLabel}</p>
                                            <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                                                <img src={state.frontPreview} alt={doc.frontLabel} className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    )}
                                    {doc.backLabel && state.backPreview && (
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-semibold text-slate-500">{doc.backLabel}</p>
                                            <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                                                <img src={state.backPreview} alt={doc.backLabel} className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <button onClick={goBack}
                                    className="h-9 px-5 border border-gray-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                    Back
                                </button>
                                <button onClick={handleSubmit} disabled={state.isSubmitting}
                                    className="h-9 px-6 bg-(--colour-fsP2) text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-2">
                                    {state.isSubmitting
                                        ? <><Loader2 size={13} className="animate-spin" /> Submitting…</>
                                        : <> Submit for Review <ArrowRight size={13} /></>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
