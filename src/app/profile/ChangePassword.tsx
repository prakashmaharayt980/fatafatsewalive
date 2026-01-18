import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2, Send, ThumbsUp, Trash, Shield, Lock, AlertCircle, ChevronRight, ShieldCheck } from 'lucide-react'
import React, { useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"


import RemoteServices from '../api/remoteservice';

function ChangePassword() {
    const initialFormValues = {
        current_password: '',
        new_password1: '',
        new_password2: '',
    };

    const [formValues, setFormValues] = useState(initialFormValues);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false); // Default hidden

    const [showPasswords, setShowPasswords] = useState({
        current_password: false,
        new_password1: false,
        new_password2: false
    });

    const [errors, setErrors] = useState({
        current_password: '',
        new_password1: '',
        new_password2: '',
        general: ''
    });

    const inputFields = [
        { name: 'current_password', label: 'Current Password', id: 1 },
        { name: 'new_password1', label: 'New Password', id: 2 },
        { name: 'new_password2', label: 'Confirm New Password', id: 3 },
    ];

    const handleTogglePassword = (field: string) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
        // Clear specific error when user types
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: '', general: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = { current_password: '', new_password1: '', new_password2: '', general: '' };
        let isValid = true;

        if (!formValues.current_password) {
            newErrors.current_password = 'Current password is required';
            isValid = false;
        }
        if (formValues.new_password1.length < 6) {
            newErrors.new_password1 = 'Password must be at least 6 characters';
            isValid = false;
        }
        if (formValues.new_password1 !== formValues.new_password2) {
            newErrors.new_password2 = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Prepare payload
            const payload = {
                current_password: formValues.current_password,
                new_password: formValues.new_password1,
                new_password_confirmation: formValues.new_password2

            };

            await RemoteServices.ChangePassword(payload);

            // Success reset
            setFormValues(initialFormValues);
            setIsConfirmOpen(false);
            setIsFormVisible(false); // Hide form again on success
            // Optionally show success toast
            // toast.success("Password updated successfully!"); 
        } catch (error: any) {
            console.error('Error changing password:', error);
            setErrors(prev => ({
                ...prev,
                general: error?.response?.data?.message || 'Failed to change password. Please try again.'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gray-100 pb-6 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Sign-in & Security</h2>
                    <p className="text-gray-500 mt-1">Manage your password and account security settings.</p>
                </div>
            </div>

            <div className="space-y-6">

                {/* Security Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Password</h3>
                            <p className="text-gray-500 text-sm mt-1 max-w-sm">
                                Change your password periodically to keep your account secure. Use a strong password with minimal 6 characters.
                            </p>
                        </div>
                    </div>

                    {!isFormVisible && (
                        <button
                            onClick={() => setIsFormVisible(true)}
                            className="flex-shrink-0 flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all shadow-lg hover:shadow-gray-200"
                        >
                            <Shield className="w-4 h-4" />
                            Change Password
                        </button>
                    )}
                </div>

                {/* Hidden Form */}
                {isFormVisible && (
                    <div className="bg-gray-50/50 rounded-3xl border border-gray-200 p-6 md:p-10 animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className="max-w-md mx-auto">
                            <div className="mb-6 text-center">
                                <h3 className="text-xl font-bold text-gray-900">Update Password</h3>
                                <p className="text-sm text-gray-500">Enter your current password and a new secure password.</p>
                            </div>

                            <form className="space-y-5">
                                {inputFields.map((field) => (
                                    <div key={field.id} className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 block">
                                            {field.label}
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type={showPasswords[field.name as keyof typeof showPasswords] ? 'text' : 'password'}
                                                name={field.name}
                                                value={formValues[field.name as keyof typeof formValues]}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-xl border-2 ${errors[field.name as keyof typeof errors] ? 'border-red-300 focus:border-red-400 bg-red-50/20' : 'border-gray-200 focus:border-blue-500'} focus:outline-none transition-all bg-white shadow-sm`}
                                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleTogglePassword(field.name)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 p-1"
                                            >
                                                {showPasswords[field.name as keyof typeof showPasswords] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors[field.name as keyof typeof errors] && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors[field.name as keyof typeof errors]}
                                            </p>
                                        )}
                                    </div>
                                ))}

                                {errors.general && (
                                    <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center border border-red-100 mb-4">
                                        {errors.general}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsFormVisible(false);
                                            setFormValues(initialFormValues);
                                            setErrors({ current_password: '', new_password1: '', new_password2: '', general: '' });
                                        }}
                                        className="flex-1 rounded-xl h-12 border-gray-200"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => validateForm() && setIsConfirmOpen(true)}
                                        className="flex-1 rounded-xl h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                                    >
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent className="border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-xl max-w-sm">
                    <AlertDialogHeader className="text-center pt-8">
                        <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <AlertDialogTitle className="text-gray-900 text-xl">Confirm Update?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 px-4">
                            Your password will be changed immediately. You'll need to use the new password for next login.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="p-6 flex flex-row gap-3 justify-center">
                        <AlertDialogCancel
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl border-gray-200 hover:bg-gray-50"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default ChangePassword;