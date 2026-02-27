"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ChevronRight, Loader2, X, Check, Search, Plus, Edit2, Trash2, ChevronLeft, Home, Building2, Map as MapIcon, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckoutState, ShippingAddress } from '../checkoutTypes';
import GoogleMapAddress, { LocationData } from '../GoogleMapAddress';
import { AddressService } from '@/app/api/services/address.service';
import { toast } from 'sonner';

interface AddressStepProps {
    state: CheckoutState;
    onAddressSelect: (address: ShippingAddress) => void;
    onLocationPermissionChange: (granted: boolean) => void;
    onNext: () => void;
}

export default function AddressStep({
    state,
    onAddressSelect,
    onLocationPermissionChange,
    onNext
}: AddressStepProps) {
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Map state
    const [mapLocation, setMapLocation] = useState<LocationData | null>(null);

    // Address entry mode: 'gps' (use map) or 'manual' (no map)
    const [addressEntryMode, setAddressEntryMode] = useState<'gps' | 'manual'>('gps');

    // Delete confirmation dialog state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        label: 'Home',
        province: '',
        district: '',
        city: '',
        ward: '',
        tole: '',
        houseNo: '',
        landmark: '',
        full_address: '', // Full address string
        country: 'Nepal'
    });

    // Fetch existing addresses on mount
    useEffect(() => {
        const fetchAddresses = async () => {
            setIsLoading(true);
            try {
                const response = await AddressService.ShippingAddressList();
                // Handle new response structure { data: [...], pagination: ..., meta: ... }
                // or fallback to array if API hasn't updated yet (defensive)
                const addresses = Array.isArray(response) ? response : (response.data || []);
                setSavedAddresses(addresses);
            } catch (error) {
                console.error('Failed to fetch addresses:', error);
                toast.error('Failed to load saved addresses');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAddresses();
    }, []);

    // Check for existing address selection
    useEffect(() => {
        if (state.address) {
            setSelectedAddressId(state.address.id || null);
            if (state.address.lat && state.address.lng) {
                setMapLocation({
                    lat: state.address.lat,
                    lng: state.address.lng,
                    address: state.address.address,
                });
            }
        }
    }, [state.address]);

    const handleAddNewAddress = () => {
        setViewMode('form');
        setSelectedAddressId(null);
        setFormData({
            label: 'Home',
            province: '',
            district: '',
            city: '',
            ward: '',
            tole: '',
            houseNo: '',
            landmark: '',
            full_address: '',
            country: 'Nepal'
        });
        setMapLocation(null);
    };

    const handleSelectAddress = (address: ShippingAddress) => {
        setSelectedAddressId(address.id || null);
        onAddressSelect(address);
    };

    const handleEditAddress = (address: ShippingAddress) => {
        setViewMode('form');
        setSelectedAddressId(address.id || null);

        setFormData({
            label: address.label || 'Home',
            province: address.province || address.state || '',
            district: address.district || '',
            city: address.city || '',
            ward: address.ward ? String(address.ward) : '',
            tole: address.tole || '',
            houseNo: address.house_no || '',
            landmark: address.landmark || '',
            full_address: address.address || '',
            country: address.country || 'Nepal'
        });

        if (address.lat && address.lng) {
            setMapLocation({ lat: address.lat, lng: address.lng, address: address.address });
        }
    };

    const handleMapLocationSelect = (location: LocationData) => {
        setMapLocation(location);

        // Auto-fill form from Google Maps address components
        if (location.addressComponents) {
            setFormData(prev => ({
                ...prev,
                province: location.addressComponents?.province || prev.province,
                district: location.addressComponents?.district || prev.district,
                city: location.addressComponents?.city || prev.city,
                ward: location.addressComponents?.ward ? String(location.addressComponents.ward) : prev.ward,
                tole: location.addressComponents?.tole || prev.tole,
                full_address: location.address
            }));
        } else {
            setFormData(prev => ({ ...prev, full_address: location.address }));
        }
    };

    const handleSaveAddress = async () => {
        // Different validation for GPS vs Manual mode
        if (addressEntryMode === 'manual') {
            // Manual mode: validate all detailed fields
            if (!formData.province || !formData.district || !formData.city || !formData.ward || !formData.tole) {
                toast.error("Please fill in all required fields (Province, District, City, Ward, Tole)");
                return;
            }
        } else {
            // GPS mode: only validate that we have an address
            if (!formData.full_address) {
                toast.error("Please select a location on the map or enter an address");
                return;
            }
        }

        setIsSaving(true);
        // Construct full address string if not already from map, or update it
        // Ideally 'address' field in backend matches the full string from map or constructed one.
        // User specific requirement: "prefers first location instead manually" for coordinates, but allow manual text override.
        const fullAddress = formData.full_address || `${formData.tole}-${formData.ward}, ${formData.city}, ${formData.district}`;

        const addressPayload = {
            full_address: fullAddress,
            // Generic fields fallback
            city: formData.city || formData.district,
            state: formData.province,
            postal_code: '00000',
            country: formData.country || 'Nepal',

            // Nepal Specific Fields
            province: formData.province,
            district: formData.district,
            ward: parseInt(formData.ward, 10) || 0,
            tole: formData.tole,
            house_no: formData.houseNo,
            landmark: formData.landmark,

            label: formData.label,
            is_default: savedAddresses.length === 0,
            // Optional GPS coordinates
            lat: mapLocation?.lat,
            lng: mapLocation?.lng,
        };

        try {
            let savedAddress: ShippingAddress;

            if (selectedAddressId) {
                // Update existing
                savedAddress = await AddressService.ShippingAddressUpdate(selectedAddressId, addressPayload);
                setSavedAddresses(prev => prev.map(a => a.id === selectedAddressId ? savedAddress : a));
                toast.success("Address updated successfully");
            } else {
                // Create new
                savedAddress = await AddressService.CreateShippingAddress(addressPayload);
                setSavedAddresses(prev => [...prev, savedAddress]);
                toast.success("Address saved successfully");
            }

            // Auto-select the newly saved address
            onAddressSelect(savedAddress);
            setSelectedAddressId(savedAddress.id || null);
            setViewMode('list');
        } catch (error) {
            console.error('Failed to save address:', error);
            toast.error("Failed to save address. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAddress = (id: number) => {
        setAddressToDelete(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!addressToDelete) return;

        try {
            await AddressService.ShippingAddressDelete(addressToDelete);
            setSavedAddresses(prev => prev.filter(a => a.id !== addressToDelete));
            if (selectedAddressId === addressToDelete) {
                setSelectedAddressId(null);
            }
            toast.success("Address deleted");
        } catch (error) {
            console.error('Failed to delete address:', error);
            toast.error("Failed to delete address");
        } finally {
            setShowDeleteDialog(false);
            setAddressToDelete(null);
        }
    };

    const filteredAddresses = savedAddresses.filter(addr =>
        (addr.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (addr.district || addr.city || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isComplete = state.address !== null;

    return (
        <div className="">

            {/* ===================== LIST VIEW ===================== */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-white to-blue-50/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-[var(--colour-fsP2)]" />
                                Select Delivery Address
                            </h2>
                            {savedAddresses.length < 4 && (
                                <Button
                                    onClick={handleAddNewAddress}
                                    className="bg-[var(--colour-fsP2)] hover:bg-blue-700 text-white shadow-lg shadow-blue-200 rounded-xl transition-all"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Add New Address
                                </Button>
                            )}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search your saved locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-[var(--colour-fsP2)]"
                            />
                        </div>
                    </div>

                    {/* Address List — 2×2 Grid, max 4 */}
                    <div className="p-4 sm:p-6 bg-gray-50/30 min-h-[300px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-[var(--colour-fsP2)] animate-spin" />
                            </div>
                        ) : filteredAddresses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex items-center justify-center mb-4">
                                    <MapPin className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900 mb-1">No addresses found</h3>
                                <p className="text-gray-400 text-sm max-w-xs mb-5">
                                    Add a delivery location to proceed with your order.
                                </p>
                                <Button onClick={handleAddNewAddress} variant="outline" className="rounded-xl border-[var(--colour-fsP2)] text-[var(--colour-fsP2)] hover:bg-blue-50">
                                    <Plus className="w-4 h-4 mr-2" /> Add Address
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {filteredAddresses.slice(0, 4).map((address) => {
                                    const isSelected = selectedAddressId === address.id;
                                    const LabelIcon = address.label === 'Office' ? Building2 : address.label === 'Other' ? MapIcon : Home;
                                    return (
                                        <div
                                            key={address.id}
                                            className="relative group"
                                        >
                                            <div
                                                onClick={() => handleSelectAddress(address)}
                                                className={`w-full h-full text-left rounded-2xl border-2 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer ${isSelected
                                                    ? 'border-[var(--colour-fsP2)] shadow-[0_4px_16px_rgba(25,103,179,0.16)]'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
                                                    }`}
                                            >
                                                {/* Top stripe */}
                                                <div className={`flex items-center justify-between px-3 py-2 ${isSelected ? 'bg-[var(--colour-fsP2)]' : 'bg-gray-50 border-b border-gray-100'
                                                    }`}>
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <div className={`p-0.5 rounded ${isSelected ? 'bg-white/20' : 'bg-white border border-gray-200'
                                                            }`}>
                                                            <LabelIcon className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                                                        </div>
                                                        <span className={`text-[10px] font-extrabold uppercase tracking-widest truncate ${isSelected ? 'text-white' : 'text-gray-600'
                                                            }`}>
                                                            {address.label || 'Home'}
                                                        </span>
                                                        {address.is_default && (
                                                            <span className={`shrink-0 text-[8px] font-bold px-1 py-0.5 rounded-full uppercase ${isSelected ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                ★ Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isSelected ? (
                                                        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                                            <Check className="w-2.5 h-2.5 text-[var(--colour-fsP2)]" strokeWidth={3} />
                                                        </div>
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0 group-hover:border-[var(--colour-fsP2)] transition-colors" />
                                                    )}
                                                </div>

                                                {/* Card body */}
                                                <div className={`px-3 py-2.5 flex flex-col gap-1.5 flex-1 ${isSelected ? 'bg-blue-50/30' : 'bg-white'
                                                    }`}>
                                                    <div className="flex items-start justify-between gap-1">
                                                        <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-1">
                                                            {address.label || 'Address'}
                                                        </p>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">
                                                        {address.address}
                                                    </p>
                                                    <p className="text-[10px] font-semibold text-gray-600 flex items-center gap-0.5 mt-auto pt-1.5 border-t border-gray-100">
                                                        <MapPin className="w-2.5 h-2.5 text-[var(--colour-fsP2)] shrink-0" />
                                                        {address.city ? `${address.city}, ` : ''}{address.district || address.state}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Edit + Delete on hover */}
                                            <div className="absolute top-10 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEditAddress(address); }}
                                                    className="p-1 rounded-lg bg-white/90 hover:bg-[var(--colour-fsP2)] hover:text-white text-gray-500 transition-colors shadow-sm border border-gray-100"
                                                    aria-label="Edit address"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address.id!); }}
                                                    className="p-1 rounded-lg bg-white/90 hover:bg-red-500 hover:text-white text-gray-500 transition-colors shadow-sm border border-gray-100"
                                                    aria-label="Delete address"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Max limit notice */}
                        {filteredAddresses.length >= 4 && (
                            <p className="text-center text-xs text-gray-400 font-medium mt-3">
                                Maximum 4 addresses. Delete one to add another.
                            </p>
                        )}
                    </div>
                </div>
            )}


            {/* ===================== FORM VIEW (Redesigned) ===================== */}
            {
                viewMode === 'form' && (
                    <div className="bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                        {/* Header */}
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-blue-50/30 sticky top-0 z-20">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-[var(--colour-fsP2)] hover:text-white transition-all text-gray-600 shadow-sm"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                                    {selectedAddressId ? 'Edit Address' : 'New Address'}
                                </h3>
                            </div>
                        </div>

                        {/* Address Entry Mode Selection */}
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/20">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                    onClick={() => setAddressEntryMode('gps')}
                                    className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${addressEntryMode === 'gps'
                                        ? 'bg-[var(--colour-fsP2)] text-white rounded-xl shadow-blue-200'
                                        : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-[var(--colour-fsP2)]/30 hover:bg-blue-50/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Navigation className="w-4 h-4" />
                                        <span className="hidden sm:inline">Use GPS Location</span>
                                        <span className="sm:hidden">GPS</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setAddressEntryMode('manual')}
                                    className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${addressEntryMode === 'manual'
                                        ? 'bg-[var(--colour-fsP2)] text-white rounded-xl shadow-blue-200'
                                        : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-[var(--colour-fsP2)]/30 hover:bg-blue-50/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Edit2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">Manual Address</span>
                                        <span className="sm:hidden">Manual</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className={addressEntryMode === 'gps' ? 'grid lg:grid-cols-2' : ''}>
                            {/* Map Section - Right Side (GPS Mode Only) */}
                            {addressEntryMode === 'gps' && (
                                <div className="relative h-64 lg:h-auto bg-gradient-to-br from-gray-50 to-blue-50/30 border-l border-gray-100 lg:order-2">
                                    <div className="absolute inset-0">
                                        <GoogleMapAddress
                                            onLocationSelect={handleMapLocationSelect}
                                            initialPosition={mapLocation || undefined}
                                        />
                                    </div>

                                </div>
                            )}

                            {/* Form Section - Left Side */}
                            <div className="p-4 sm:p-6 lg:p-8 space-y-4 lg:order-1 max-h-[85vh] overflow-y-auto custom-scrollbar">

                                {/* Label Input */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Address Label</Label>
                                    <Input
                                        value={formData.label}
                                        onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                                        placeholder="e.g., Home, Office, Apartment..."
                                        className="h-10 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium transition-all"
                                    />
                                </div>

                                {/* Location Details - Only in Manual Mode */}
                                {addressEntryMode === 'manual' && (
                                    <div className="space-y-4">
                                        {/* Administrative Areas - 3 Columns */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Province</Label>
                                                <Input
                                                    value={formData.province}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                                                    placeholder="Bagmati"
                                                    className="h-10 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">District</Label>
                                                <Input
                                                    value={formData.district}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                                                    placeholder="Kathmandu"
                                                    className="h-10 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">City</Label>
                                                <Input
                                                    value={formData.city}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                                    placeholder="City"
                                                    className="h-10 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Ward & Tole - 2 Columns */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Ward No.</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.ward}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                                                    placeholder="4"
                                                    className="h-10 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Tole / Area</Label>
                                                <Input
                                                    value={formData.tole}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, tole: e.target.value }))}
                                                    placeholder="Baluwatar"
                                                    className="h-10 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* House & Landmark - 2 Columns */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">House No. (Opt)</Label>
                                                <Input
                                                    value={formData.houseNo}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, houseNo: e.target.value }))}
                                                    placeholder="123/A"
                                                    className="h-10 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Landmark (Opt)</Label>
                                                <Input
                                                    value={formData.landmark}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                                                    placeholder="Near Temple"
                                                    className="h-10 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium transition-all"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                )}


                                {/* Full Address - GPS Mode Only */}
                                {addressEntryMode !== 'manual' && (
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Full Address / Location</Label>
                                        <div className="relative">
                                            <Input
                                                value={formData.full_address}
                                                onChange={(e) => setFormData(prev => ({ ...prev, full_address: e.target.value }))}
                                                placeholder="Enter full address or use map..."
                                                className="h-10 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium pr-8 transition-all"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                                    <Button
                                        onClick={() => setViewMode('list')}
                                        variant="outline"
                                        className="h-11 px-6 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-bold tracking-wide"
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSaveAddress}
                                        disabled={
                                            addressEntryMode === 'manual'
                                                ? (!formData.province || !formData.district || !formData.city || !formData.ward) || isSaving
                                                : !formData.full_address || isSaving
                                        }
                                        className="h-11 px-8 rounded-xl bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP1)] text-white shadow-lg shadow-blue-200 text-sm font-bold tracking-wide transition-all hover:scale-105 active:scale-95"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                                            </>
                                        ) : (
                                            'Save Check'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Continue Button (Only in List View) */}
            {
                viewMode === 'list' && isComplete && (
                    <div className="flex justify-end pt-6 border-t border-gray-100">
                        <Button
                            onClick={onNext}
                            className="h-11 px-8 bg-[var(--colour-fsP2)] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all hover:shadow-lg active:scale-95"
                        >
                            Continue to Recipient
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                )
            }

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className='bg-white border-none rounded-2xl'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='text-[var(--colour-fsP2)] items-center w-full flex justify-start text-lg gap-3'>
                            <Trash2 className="w-6 h-6" />
                            <span>Delete Address</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription className='text-base text-gray-600'>
                            Are you sure you want to delete this address? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row gap-2 justify-center sm:justify-end">
                        <AlertDialogCancel
                            className='flex-1 sm:flex-none cursor-pointer border-gray-200 hover:bg-gray-100/50 rounded-xl h-10'
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className='flex-1 sm:flex-none cursor-pointer h-10 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl border-none'
                            onClick={confirmDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}
