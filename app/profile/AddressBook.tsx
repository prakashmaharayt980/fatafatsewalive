"use client";

import React, { useState, useEffect } from 'react';
import {
    MapPin, ChevronLeft, Loader2, Check, Plus,
    Edit2, Trash2, Home, Building2, Map as MapIcon, Search,
    MapPinned,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ShippingAddress } from '../checkout/checkoutTypes';
import GoogleMapAddress from '../checkout/GoogleMapAddress';
import type { LocationData } from '../checkout/GoogleMapAddress';
import { ShippingAddressList, ShippingAddressUpdate, CreateShippingAddress, ShippingAddressDelete } from '@/app/api/services/address.service';
import { toast } from 'sonner';
import { useAuthStore } from '@/app/context/AuthContext';
import { useShallow } from 'zustand/react/shallow';

export default function AddressBook() {
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [mapLocation, setMapLocation] = useState<LocationData | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        label: 'Home', province: '', district: '', city: '',
        houseNo: '', landmark: '', full_address: '', country: 'Nepal',
        first_name: '', last_name: '', contact_number: '',
    });

    const { user, isLoggedIn } = useAuthStore(useShallow(state => ({
        user: state.user, isLoggedIn: state.isLoggedIn,
    })));

    useEffect(() => {
        if (!isLoggedIn) return;
        setIsLoading(true);
        ShippingAddressList()
            .then(res => setSavedAddresses(Array.isArray(res) ? res : (res.data ?? [])))
            .catch(() => toast.error('Failed to load saved addresses'))
            .finally(() => setIsLoading(false));
    }, [isLoggedIn]);

    const filteredAddresses = savedAddresses.filter(a => {
        const s = searchTerm.toLowerCase();
        return [
            a.address?.label, a.contact_info?.first_name, a.contact_info?.last_name,
            a.address?.city, a.address?.landmark,
        ].some(v => v?.toLowerCase().includes(s));
    });

    const resetForm = () => {
        setFormData({
            label: 'Home', province: '', district: '', city: '',
            houseNo: '', landmark: '', full_address: '', country: 'Nepal',
            first_name: user?.name?.split(' ')[0] ?? '',
            last_name: user?.name?.split(' ').slice(1).join(' ') ?? '',
            contact_number: user?.phone ?? '',
        });
        setMapLocation(null);
        setSelectedAddressId(null);
    };

    const handleAddNew = () => { resetForm(); setViewMode('form'); };

    const handleEdit = (a: ShippingAddress) => {
        setSelectedAddressId(a.id ?? null);
        setFormData({
            label: a.address.label ?? 'Home',
            province: a.address.province ?? a.address.state ?? '',
            district: a.address.district ?? '',
            city: a.address.city ?? '',
            houseNo: a.address.house_no ?? '',
            landmark: a.address.landmark ?? '',
            full_address: a.address.landmark ?? '',
            country: a.address.country ?? 'Nepal',
            first_name: a.contact_info?.first_name ?? '',
            last_name: a.contact_info?.last_name ?? '',
            contact_number: a.contact_info?.contact_number ?? '',
        });
        if (a.geo?.lat && a.geo?.lng) {
            setMapLocation({ lat: a.geo.lat, lng: a.geo.lng, address: a.address.landmark ?? a.address.city ?? '' });
        }
        setViewMode('form');
    };

    const handleMapSelect = (loc: LocationData) => {
        setMapLocation(loc);
        if (loc.addressComponents) {
            setFormData(prev => ({
                ...prev,
                province: loc.addressComponents?.province ?? prev.province,
                district: loc.addressComponents?.district ?? prev.district,
                city: loc.addressComponents?.municipality ?? loc.addressComponents?.city ?? prev.city,
                landmark: loc.addressComponents?.tole ?? loc.addressComponents?.city ?? prev.landmark,
                full_address: loc.address,
                country: 'Nepal',
            }));
        } else {
            setFormData(prev => ({ ...prev, full_address: loc.address, country: 'Nepal' }));
        }
    };

    const handleSave = async () => {
        const hasGeo = !!formData.full_address;
        const hasManual = !!(formData.province && formData.district && formData.city);
        if (!hasGeo && !hasManual) {
            toast.error('Select a location on the map or fill Province, District and City');
            return;
        }
        setIsSaving(true);
        const payload = {
            first_name: formData.first_name || user?.name?.split(' ')[0] || 'Customer',
            last_name: formData.last_name || user?.name?.split(' ').slice(1).join(' ') || 'Customer',
            contact_number: formData.contact_number || user?.phone || '',
            lat: mapLocation?.lat ?? null,
            lng: mapLocation?.lng ?? null,
            label: formData.label,
            landmark: formData.landmark,
            city: formData.city,
            district: formData.district,
            province: formData.province,
            country: formData.country || 'Nepal',
            is_default: savedAddresses.length === 0,
            state: formData.province,
            address: formData.full_address || `${formData.city}, ${formData.district}`,
        };
        try {
            if (selectedAddressId) {
                await ShippingAddressUpdate(selectedAddressId, payload);
                toast.success('Address updated');
            } else {
                await CreateShippingAddress(payload);
                toast.success('Address saved');
            }
            const res = await ShippingAddressList();
            setSavedAddresses(Array.isArray(res) ? res : (res.data ?? []));
            setViewMode('list');
        } catch {
            toast.error('Failed to save address');
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!addressToDelete) return;
        try {
            await ShippingAddressDelete(addressToDelete);
            setSavedAddresses(prev => prev.filter(a => a.id !== addressToDelete));
            toast.success('Address deleted');
        } catch {
            toast.error('Failed to delete address');
        } finally {
            setShowDeleteDialog(false);
            setAddressToDelete(null);
        }
    };

    const field = (label: string, key: keyof typeof formData, placeholder?: string) => (
        <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</Label>
            <input
                value={formData[key]}
                onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:border-(--colour-fsP2) focus:bg-white transition-colors"
            />
        </div>
    );

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <MapPinned className="w-4 h-4 text-(--colour-fsP2)" />
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Address Book</h2>
                        <p className="text-xs text-slate-500">Manage your delivery locations</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {viewMode === 'list' ? (
                        <>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="h-9 pl-9 pr-3 w-44 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-(--colour-fsP2) focus:bg-white transition-colors"
                                />
                            </div>
                            <button
                                onClick={handleAddNew}
                                className="flex items-center gap-1.5 h-9 px-4 bg-(--colour-fsP2) text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add New
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setViewMode('list')}
                            className="flex items-center gap-1.5 h-9 px-4 border border-gray-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" /> Back
                        </button>
                    )}
                </div>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16 gap-2 text-slate-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs font-semibold">Loading addresses…</span>
                        </div>
                    ) : filteredAddresses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-200 rounded-xl text-center">
                            <MapPin className="w-8 h-8 text-gray-200 mb-3" />
                            <p className="text-sm font-bold text-slate-800">
                                {searchTerm ? 'No addresses found' : 'No addresses yet'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 mb-5">
                                {searchTerm ? 'Try a different name or city.' : 'Add an address to speed up checkout.'}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={handleAddNew}
                                    className="h-9 px-5 border border-gray-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-gray-50 transition-colors"
                                >
                                    Add First Address
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredAddresses.map(a => {
                                const lbl = a.address?.label?.toLowerCase() ?? 'home';
                                const Icon = lbl === 'office' ? Building2 : lbl === 'other' ? MapIcon : Home;
                                return (
                                    <div key={a.id} className="relative border border-gray-200 rounded-xl bg-white p-4">
                                        {a.address?.is_default && (
                                            <span className="absolute -top-2 right-4 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-(--colour-fsP2) text-white rounded border-2 border-white">
                                                Primary
                                            </span>
                                        )}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 border border-gray-100 rounded-lg bg-gray-50 text-slate-500">
                                                    <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest leading-none mb-0.5">
                                                        {a.address?.label ?? 'Home'}
                                                    </p>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {a.contact_info?.first_name} {a.contact_info?.last_name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(a)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-slate-500 hover:text-(--colour-fsP2) hover:border-(--colour-fsP2) transition-colors"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => { setAddressToDelete(a.id!); setShowDeleteDialog(true); }}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-slate-500 hover:text-red-500 hover:border-red-200 transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 pl-9">
                                            <p className="text-xs font-semibold text-slate-700">
                                                {[a.address?.landmark, a.address?.city, a.address?.district, a.address?.province]
                                                    .filter(Boolean).join(', ')}
                                            </p>
                                            <p className="text-xs font-bold text-slate-500">{a.contact_info?.contact_number}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Form View */}
            {viewMode === 'form' && (
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                        <p className="text-sm font-bold text-slate-900">
                            {selectedAddressId ? 'Edit Address' : 'New Delivery Address'}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                            {selectedAddressId ? 'Update your saved location' : 'Pin on map or fill in details manually'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        {/* Map */}
                        <div className="lg:col-span-5 relative h-70 lg:h-auto min-h-95 border-b lg:border-b-0 lg:border-r border-gray-100">
                            <GoogleMapAddress
                                onLocationSelect={handleMapSelect}
                                initialPosition={mapLocation ?? undefined}
                            />
                        </div>

                        {/* Fields */}
                        <div className="lg:col-span-7 p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {field('First Name', 'first_name', 'John')}
                                {field('Last Name', 'last_name', 'Doe')}
                            </div>
                            {field('Contact Number', 'contact_number', '+977-XXXXXXXXXX')}
                            <div className="grid grid-cols-2 gap-3">
                                {field('Label', 'label', 'Home, Office…')}
                                {field('City', 'city', 'Kathmandu')}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {field('District', 'district')}
                                {field('Province', 'province')}
                            </div>
                            {field('Landmark / Tole / Building', 'landmark', 'Near XYZ temple, 3rd Floor…')}

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setViewMode('list')}
                                    disabled={isSaving}
                                    className="flex-1 h-10 rounded-lg border border-gray-200 text-xs font-bold text-slate-600 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 h-10 bg-(--colour-fsP2) text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSaving
                                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                                        : <><Check className="w-3.5 h-3.5" /> {selectedAddressId ? 'Update' : 'Save'} Address</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm font-bold text-slate-900">Remove this address?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-slate-500 mt-1">
                            This address will be permanently deleted. You cannot undo this.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="grid grid-cols-2 gap-2 mt-4">
                        <AlertDialogCancel className="h-9 rounded-lg border border-gray-200 text-xs font-bold text-slate-600 m-0">
                            Keep It
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="h-9 rounded-lg bg-red-500 hover:bg-red-600 text-xs font-bold text-white m-0"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
