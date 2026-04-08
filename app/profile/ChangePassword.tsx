'use client';

import React, { useState } from 'react';
import {
    Eye, EyeOff, Loader2, Shield, Lock,
    ShieldCheck, KeyRound, ShieldAlert, CheckCircle2, AlertCircle
} from 'lucide-react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProfileService } from '../api/services/profile.service';

const FIELDS = [
    { name: 'current_password', label: 'Current Password', icon: Lock },
    { name: 'new_password1', label: 'New Password', icon: KeyRound },
    { name: 'new_password2', label: 'Confirm New Password', icon: ShieldCheck },
] as const;

type FieldName = typeof FIELDS[number]['name'];

const INIT = { current_password: '', new_password1: '', new_password2: '' };
const INIT_ERR = { current_password: '', new_password1: '', new_password2: '', general: '' };

function ChangePassword() {
    const [values, setValues] = useState(INIT);
    const [errors, setErrors] = useState(INIT_ERR);
    const [show, setShow] = useState<Record<FieldName, boolean>>({ current_password: false, new_password1: false, new_password2: false });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setValues(p => ({ ...p, [name]: value }));
        if (errors[name as FieldName]) setErrors(p => ({ ...p, [name]: '', general: '' }));
    };

    const validate = () => {
        const e = { ...INIT_ERR };
        let ok = true;
        if (!values.current_password) { e.current_password = 'Required'; ok = false; }
        if (values.new_password1.length < 8) { e.new_password1 = 'Min 8 characters'; ok = false; }
        if (values.new_password1 !== values.new_password2) { e.new_password2 = 'Does not match'; ok = false; }
        setErrors(e);
        return ok;
    };

    const handleSubmit = () => {
        setSubmitting(true);
        ProfileService.ChangePassword({
            current_password: values.current_password,
            new_password: values.new_password1,
            new_password_confirmation: values.new_password2,
        })
            .then(() => { setValues(INIT); setConfirmOpen(false); })
            .catch((err: any) => setErrors(p => ({ ...p, general: err?.response?.data?.message ?? 'Failed to update. Check your current password.' })))
            .finally(() => setSubmitting(false));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <Shield className="w-4 h-4 text-(--colour-fsP2)" />
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Security</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Manage your password and account access.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
                {/* Form */}
                <div className="lg:col-span-3">
                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); if (validate()) setConfirmOpen(true); }}>
                        {FIELDS.map(field => (
                            <div key={field.name}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">{field.label}</label>
                                    {errors[field.name] && (
                                        <span className="text-[10px] font-semibold text-red-500">{errors[field.name]}</span>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors[field.name] ? 'text-red-400' : 'text-slate-500'}`}>
                                        <field.icon className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={show[field.name] ? 'text' : 'password'}
                                        name={field.name}
                                        value={values[field.name]}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={`w-full h-10 pl-9 pr-10 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:bg-white transition-colors ${errors[field.name] ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-(--colour-fsP2)'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShow(p => ({ ...p, [field.name]: !p[field.name] }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                                    >
                                        {show[field.name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {errors.general && (
                            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600">
                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                {errors.general}
                            </div>
                        )}

                        <div className="pt-1">
                            <button
                                type="submit"
                                className="w-full h-10 bg-(--colour-fsP2) text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tips sidebar */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="p-4 rounded-xl border border-gray-200 bg-white">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Password Tips
                        </p>
                        <ul className="space-y-2">
                            {['Mix letters, numbers & symbols', 'At least 8 characters long', 'Avoid reusing old passwords'].map((tip, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                                    <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

            
                </div>
            </div>

            {/* Confirm Dialog */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent className="rounded-2xl bg-white border border-gray-200 shadow-lg p-0 overflow-hidden max-w-sm mx-auto">
                    <AlertDialogHeader className="px-6 py-5 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-(--colour-fsP2) shrink-0" />
                            <AlertDialogTitle className="text-sm font-bold text-slate-900">Confirm Password Change</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            You will need this new password for all future logins. Make sure it is saved somewhere safe.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row gap-2">
                        <AlertDialogCancel
                            disabled={submitting}
                            className="flex-1 h-9 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
                        >
                            Go Back
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={e => { e.preventDefault(); handleSubmit(); }}
                            disabled={submitting}
                            className="flex-1 h-9 rounded-lg bg-(--colour-fsP2) text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Change'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default ChangePassword;
