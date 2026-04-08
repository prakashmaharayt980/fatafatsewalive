'use client';

import React, { useEffect, useState } from 'react';
import {
    Calendar, Check, Copy, Edit2, Eye, EyeOff,
    Loader2, Mail, MapPin, Phone, Save, ShieldCheck, User, Clock,
} from 'lucide-react';
import {
    Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '../CommonVue/datetime';
import { ProfileService } from '../api/services/profile.service';
import type { ProfileFormData, ProfileUser } from './interface';

const labelCls = 'text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest';
const inputCls = 'w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-(--colour-fsP2) focus:bg-white transition-colors';

function getInitials(name: string) {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function Profile() {
    const [state, setState] = useState({
        userData:        undefined as ProfileUser | undefined,
        formData:        { name: '', phone: '', address: '', date_of_birth: '' } as ProfileFormData,
        isSaving:        false,
        dialogOpen:      false,
        cardVisible:     false,
        copied:          false,
        revealState:     'idle' as 'idle' | 'active' | 'expired',
        expiresAt:       null as number | null,
        remainingSeconds: 0,
    });

    const update = (u: Partial<typeof state>) => setState(p => ({ ...p, ...u }));

    useEffect(() => {
        ProfileService.ProfileView()
            .then(res => update({ userData: res.data }))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!state.expiresAt || state.revealState !== 'active') return;
        const timer = window.setInterval(() => {
            setState(prev => {
                if (!prev.expiresAt) return prev;
                const s = Math.max(0, Math.ceil((prev.expiresAt - Date.now()) / 1000));
                if (s <= 0) return { ...prev, cardVisible: false, revealState: 'expired', expiresAt: null, remainingSeconds: 0 };
                return { ...prev, remainingSeconds: s };
            });
        }, 1000);
        return () => window.clearInterval(timer);
    }, [state.expiresAt, state.revealState]);

    const handleOpen = () => {
        if (!state.userData) return;
        update({
            formData: {
                name:          state.userData.name,
                phone:         state.userData.contact_number,
                address:       state.userData.address ?? '',
                date_of_birth: state.userData.date_of_birth ?? '',
            },
            dialogOpen: true,
        });
    };

    const handleSave = () => {
        update({ isSaving: true });
        ProfileService.ProfileUpdate({
            name:            state.formData.name,
            contact_number:  state.formData.phone,
            address:         state.formData.address,
            date_of_birth:   state.formData.date_of_birth,
        })
            .then(res  => update({ userData: res.data ?? res, dialogOpen: false }))
            .catch(()  => {})
            .finally(() => update({ isSaving: false }));
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            update({ copied: true });
            window.setTimeout(() => setState(p => ({ ...p, copied: false })), 1800);
        });
    };

    const handleToggleCard = () => {
        if (state.revealState === 'expired') return;
        if (state.revealState === 'idle') {
            update({ cardVisible: true, revealState: 'active', expiresAt: Date.now() + 5 * 60 * 1000, remainingSeconds: 300 });
            return;
        }
        update({ cardVisible: !state.cardVisible });
    };

    if (!state.userData) {
        return (
            <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-gray-200 bg-white">
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-(--colour-fsP2)" />
                    <p className="text-sm font-bold text-slate-900">Loading profile</p>
                    <p className="text-xs text-slate-500">Fetching your account information.</p>
                </div>
            </div>
        );
    }

    const isVerified   = !!state.userData.email_verified_at;
    const refCode      = state.userData.referral_code ?? `FS-${String(state.userData.id).padStart(6, '0')}`;
    const uid          = `UID-${String(state.userData.id).padStart(6, '0')}`;
    const mins         = Math.floor(state.remainingSeconds / 60);
    const secs         = String(state.remainingSeconds % 60).padStart(2, '0');
    const initials     = getInitials(state.userData.name || 'U');

    return (
        <div className="space-y-4">

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                        <span className="text-sm font-black text-(--colour-fsP2)">{initials}</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{state.userData.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{state.userData.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {isVerified && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border text-(--colour-fsP2) bg-blue-50 border-blue-200 uppercase tracking-widest">
                            <ShieldCheck size={10} /> Verified
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={handleOpen}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-(--colour-fsP2) hover:text-(--colour-fsP2) transition-colors"
                    >
                        <Edit2 size={12} /> Edit
                    </button>
                </div>
            </div>

            {/* ── Personal Information ──────────────────────────────────────── */}
            <div className="border border-gray-200 rounded-xl bg-white p-5">
                <p className="text-sm font-bold text-slate-900 mb-0.5">Personal Information</p>
                <p className="text-xs text-slate-500 mb-4">Your account details on file.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { label: 'Full Name',       value: state.userData.name,               icon: User     },
                        { label: 'Email Address',   value: state.userData.email,              icon: Mail     },
                        { label: 'Phone Number',    value: state.userData.contact_number,     icon: Phone    },
                        { label: 'Date of Birth',   value: state.userData.date_of_birth ? formatDate(state.userData.date_of_birth) : null, icon: Calendar },
                        { label: 'Member Since',    value: formatDate(state.userData.created_at), icon: ShieldCheck },
                    ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon size={11} className="text-(--colour-fsP2) shrink-0" />
                                <p className={labelCls}>{label}</p>
                            </div>
                            <p className="text-xs font-bold text-slate-900 pl-[19px]">
                                {value ?? <span className="font-normal text-slate-400">Not provided</span>}
                            </p>
                        </div>
                    ))}
                    <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2 mb-1">
                            <MapPin size={11} className="text-(--colour-fsP2) shrink-0" />
                            <p className={labelCls}>Primary Address</p>
                        </div>
                        <p className="text-xs font-bold text-slate-900 pl-[19px]">
                            {state.userData.address ?? <span className="font-normal text-slate-400">Not provided</span>}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Verified Identity ─────────────────────────────────────────── */}
            {isVerified && (
                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                    {/* Header row */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <div>
                            <p className="text-sm font-bold text-slate-900">Verified Identity</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Hidden by default · revealed for 5 minutes per session only.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleToggleCard}
                            disabled={state.revealState === 'expired'}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-(--colour-fsP2) hover:text-(--colour-fsP2) disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            {state.cardVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                            {state.revealState === 'expired'
                                ? 'Expired'
                                : state.cardVisible
                                    ? 'Hide'
                                    : state.revealState === 'idle'
                                        ? 'Show (5 min)'
                                        : 'Show Again'}
                        </button>
                    </div>

                    {/* Body */}
                    {state.cardVisible ? (
                        <div className="p-5 space-y-3">
                            {/* Identity grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Full Name',       value: state.userData.name },
                                    { label: 'User ID',         value: uid               },
                                    { label: 'Document Status', value: 'Verified'         },
                                    { label: 'Reference Code',  value: refCode            },
                                ].map(r => (
                                    <div key={r.label} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                        <p className={labelCls + ' mb-0.5'}>{r.label}</p>
                                        <p className="text-xs font-bold text-slate-900">{r.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Timer + copy row */}
                            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <Clock size={12} className="text-(--colour-fsP2)" />
                                    <span className="font-bold text-slate-900">{mins}:{secs}</span>
                                    <span className="text-slate-500">remaining</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(`${uid} ${refCode}`)}
                                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors ${
                                        state.copied
                                            ? 'bg-(--colour-fsP2) text-white'
                                            : 'border border-gray-200 bg-white text-slate-700 hover:border-(--colour-fsP2) hover:text-(--colour-fsP2)'
                                    }`}
                                >
                                    {state.copied ? <Check size={12} /> : <Copy size={12} />}
                                    {state.copied ? 'Copied' : 'Copy ID'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="px-5 py-4">
                            <p className="text-xs text-slate-400">
                                {state.revealState === 'expired'
                                    ? 'The secure view has expired after the 5-minute access window.'
                                    : 'Use the button above to reveal your verified identity for one 5-minute session.'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Edit Dialog ───────────────────────────────────────────────── */}
            <Dialog open={state.dialogOpen} onOpenChange={open => update({ dialogOpen: open })}>
                <DialogContent className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white p-0">
                    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
                        <div>
                            <DialogTitle className="text-sm font-bold text-slate-900">Edit Profile</DialogTitle>
                            <p className="text-xs text-slate-500 mt-0.5">Keep your details up to date.</p>
                        </div>
                    </div>

                    <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2 space-y-1.5">
                                <label className={labelCls}>Full Name</label>
                                <input
                                    type="text"
                                    value={state.formData.name}
                                    onChange={e => update({ formData: { ...state.formData, name: e.target.value } })}
                                    placeholder="Full name"
                                    className={inputCls}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Date of Birth</label>
                                <input
                                    type="date"
                                    value={state.formData.date_of_birth}
                                    onChange={e => update({ formData: { ...state.formData, date_of_birth: e.target.value } })}
                                    className={inputCls}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Phone</label>
                                <input
                                    type="tel"
                                    value={state.formData.phone}
                                    onChange={e => update({ formData: { ...state.formData, phone: e.target.value } })}
                                    placeholder="+977-XXXXXXXXXX"
                                    className={inputCls}
                                />
                            </div>
                            <div className="sm:col-span-2 space-y-1.5">
                                <label className={labelCls}>Address</label>
                                <input
                                    type="text"
                                    value={state.formData.address}
                                    onChange={e => update({ formData: { ...state.formData, address: e.target.value } })}
                                    placeholder="Kathmandu, Nepal"
                                    className={inputCls}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="grid grid-cols-2 gap-3 border-t border-gray-100 px-4 sm:px-6 py-4">
                        <DialogClose asChild>
                            <button className="h-9 rounded-lg border border-gray-200 text-xs font-bold text-slate-600 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                        </DialogClose>
                        <button
                            onClick={handleSave}
                            disabled={state.isSaving}
                            className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-(--colour-fsP2) text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {state.isSaving
                                ? <><Loader2 size={12} className="animate-spin" /> Saving…</>
                                : <><Save size={12} /> Save Changes</>}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default Profile;
