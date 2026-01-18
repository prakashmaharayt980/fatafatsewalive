"use client";

import React, { useEffect, useState, useMemo } from 'react'
import { AvatarFallback, Avatar, AvatarImage } from '@/components/ui/avatar';
import { Mail, MapPin, Phone, Edit2, User, Save, Loader2, Calendar, ShieldCheck, Camera } from 'lucide-react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import RemoteServices from '../api/remoteservice';
import { formatDate } from '../CommonVue/datetime';

interface ProfileResponse {
    id: number;
    name: string;
    email: string;
    contact_number: string;
    email_verified_at: string;
    referred_by: string;
    referral_code: string;
    reward_points: number;
    avatar_image: {
        thumb: string;
        full: string;
    };
    address: string;
    date_of_birth: string;
    created_at: string;
}

interface ProfileFormData {
    name: string;
    phone: string;
    address: string;
    date_of_birth: string;
}

function Profile() {
    const [userDataState, setUserDataState] = useState<ProfileResponse | undefined>();
    const [formData, setFormData] = useState<ProfileFormData>({
        name: '',
        phone: '',
        address: '',
        date_of_birth: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const FetchUserData = async () => {
        try {
            const res = await RemoteServices.ProfileView();
            setUserDataState(res);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
    };

    useEffect(() => {
        FetchUserData();
    }, []);

    const avatarInitials = useMemo(() => {
        if (!userDataState?.name) return "??";
        return userDataState.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }, [userDataState?.name]);

    const handleOpenDialog = () => {
        if (!userDataState) return;
        setFormData({
            name: userDataState.name,
            phone: userDataState.contact_number,
            address: userDataState.address || "",
            date_of_birth: userDataState.date_of_birth || ""
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // await RemoteServices.UpdateProfile(formData);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay

            setUserDataState(prev => prev ? ({
                ...prev,
                name: formData.name,
                contact_number: formData.phone,
                address: formData.address,
                date_of_birth: formData.date_of_birth
            }) : undefined);

            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error saving user data:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!userDataState) {
        return <div className="p-20 text-center flex flex-col items-center justify-center h-full text-gray-400">
            <Loader2 className="animate-spin w-8 h-8 mb-2 text-blue-500" />
            <p>Loading Profile...</p>
        </div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex justify-between items-end border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                    <p className="text-gray-500 mt-1">Manage your personal details and public profile.</p>
                </div>
                <Button
                    onClick={handleOpenDialog}
                    className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5"
                >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                </Button>
            </div>

            {/* Profile Card */}
            <div className="flex flex-col md:flex-row gap-6">

                {/* Left: Avatar Card */}
                <div className="w-full md:w-1/3">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <Avatar className="w-28 h-28 border border-gray-100">
                                <AvatarImage src={userDataState.avatar_image?.full} className="object-cover" />
                                <AvatarFallback className="bg-gray-100 text-2xl font-bold text-gray-500">{avatarInitials}</AvatarFallback>
                            </Avatar>
                            <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-colors shadow-sm">
                                <Camera size={14} />
                            </button>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900">{userDataState.name}</h3>
                        <p className="text-sm text-gray-500 mb-6">{userDataState.email}</p>

                        <div className="w-full border-t border-gray-100 pt-4 mt-auto">
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span className="uppercase tracking-wider font-semibold">Joined</span>
                                <span>{formatDate(userDataState.created_at) || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Details Grid */}
                <div className="w-full md:w-2/3">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
                        <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <User className="w-4 h-4 text-blue-600" />
                            General Information
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Display Name</label>
                                <p className="text-gray-900 font-medium text-sm">{userDataState.name}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date of Birth</label>
                                <div className="flex items-center gap-2 text-gray-900 font-medium text-sm">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                    {userDataState.date_of_birth || "Not set"}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</label>
                                <div className="flex items-center gap-2 text-gray-900 font-medium text-sm">
                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                    {userDataState.contact_number}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</label>
                                <div className="flex items-center gap-2 text-gray-900 font-medium text-sm">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                    {userDataState.address || "Not set"}
                                </div>
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-900 font-medium text-sm">
                                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                                        {userDataState.email}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-green-700 text-xs font-medium bg-green-50 border border-green-100">
                                        <ShieldCheck className="w-3 h-3" /> Verified
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className='border-0 rounded-3xl overflow-hidden bg-white shadow-2xl max-w-lg p-0'>
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className='text-xl text-gray-900 font-bold'>Edit Personal Details</DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all bg-gray-50/50 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Date of Birth</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all bg-gray-50/50 focus:bg-white text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all bg-gray-50/50 focus:bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all bg-gray-50/50 focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-gray-50/50">
                        <DialogClose asChild>
                            <Button variant="outline" className="rounded-xl border-gray-200 text-gray-600 hover:bg-white hover:text-gray-900">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6 min-w-[140px]"
                        >
                            {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Profile;