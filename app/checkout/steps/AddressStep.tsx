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
import type { CheckoutState, ShippingAddress } from '../checkoutTypes';
import GoogleMapAddress from '../GoogleMapAddress';
import type { LocationData } from '../GoogleMapAddress';
import { ShippingAddressList, ShippingAddressUpdate, CreateShippingAddress, ShippingAddressDelete } from '@/app/api/services/address.service';
import { toast } from 'sonner';
import { useAuthStore } from '@/app/context/AuthContext';

import { useCartStore } from '@/app/context/CartContext';
import { useShallow } from 'zustand/react/shallow';

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

    const [mapLocation, setMapLocation] = useState<LocationData | null>(null);

    const [addressEntryMode, setAddressEntryMode] = useState<'gps' | 'manual'>('gps');

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        label: 'Home',
        province: '',
        district: '',
        city: '',
        houseNo: '',
        landmark: '',
        full_address: '', // Full address string
        country: 'Nepal',
        first_name: '',
        last_name: '',
        contact_number: ''
    });

    const { isLoggedIn } = useAuthStore(useShallow(state => ({
        isLoggedIn: state.isLoggedIn
    })));

    const { guestAddresses, addGuestAddress, updateGuestAddress, deleteGuestAddress } = useCartStore(
        useShallow(state => ({
            guestAddresses: state.guestAddresses,
            addGuestAddress: state.addGuestAddress,
            updateGuestAddress: state.updateGuestAddress,
            deleteGuestAddress: state.deleteGuestAddress
        }))
    );

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!isLoggedIn) {
                setSavedAddresses(guestAddresses);
                return;
            }
            setIsLoading(true);
            try {
                const response = await ShippingAddressList();
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
    }, [isLoggedIn, guestAddresses]);

    useEffect(() => {
        if (state.address) {
            setSelectedAddressId(state.address.id || null);
            if (state.address.geo?.lat && state.address.geo?.lng) {
                setMapLocation({
                    lat: state.address.geo.lat,
                    lng: state.address.geo.lng,
                    address: state.address.address.landmark || state.address.address.city || '',
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
            houseNo: '',
            landmark: '',
            full_address: '',
            country: 'Nepal',
            first_name: '',
            last_name: '',
            contact_number: ''
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
            label: address.address.label || 'Home',
            province: address.address.province || address.address.state || '',
            district: address.address.district || '',
            city: address.address.city || '',
            houseNo: address.address.house_no || '',
            landmark: address.address.landmark || '',
            full_address: [
                address.address.landmark,
                address.address.city,
                address.address.district,
                address.address.province,
            ].filter(Boolean).join(', ') || '',
            country: address.address.country || 'Nepal',
            first_name: address.contact_info?.first_name || '',
            last_name: address.contact_info?.last_name || '',
            contact_number: address.contact_info?.contact_number || ''
        });

        if (address.geo?.lat && address.geo?.lng) {
            setMapLocation({
                lat: address.geo.lat,
                lng: address.geo.lng,
                address: address.address.landmark || address.address.city || ''
            });
        }
    };

    const handleMapLocationSelect = (location: LocationData) => {
        setMapLocation(location);

        if (location.addressComponents) {
            setFormData(prev => ({
                ...prev,
                province: location.addressComponents?.province || prev.province,
                district: location.addressComponents?.district || prev.district,
                city: location.addressComponents?.municipality || location.addressComponents?.city || prev.city,
                landmark: location.addressComponents?.tole || location.addressComponents?.city || prev.landmark,
                full_address: location.address,
                country: 'Nepal'
            }));
        } else {
            setFormData(prev => ({ ...prev, full_address: location.address, country: 'Nepal' }));
        }
    };

    const handleSaveAddress = async () => {
        // Unified form: validate map-selected OR manual fields
        const hasGeoAddress = !!formData.full_address;
        const hasManualAddress = !!(formData.province && formData.district && formData.city);
        if (!hasGeoAddress && !hasManualAddress) {
            toast.error("Please select a location on the map OR fill in Province, District and City");
            return;
        }

        setIsSaving(true);
        const fullAddress = formData.full_address || `${formData.city}, ${formData.district}`;

        const addressPayload = {
            first_name: formData.first_name || 'Customer',
            last_name: formData.last_name || 'Customer last',
            contact_number: formData.contact_number || 'Customer number',
            lat: mapLocation?.lat || null,
            lng: mapLocation?.lng || null,
            label: formData.label,
            landmark: formData.landmark,
            city: formData.city,
            district: formData.district,
            province: formData.province,
            country: formData.country || 'Nepal',
            is_default: savedAddresses.length === 0,
            state: formData.province,
            address: fullAddress,

        };

        try {
            // Build a properly-nested ShippingAddress object from form data
            // This ensures the address list ALWAYS gets the correct structure
            // regardless of what shape the API returns
            const fullAddress = formData.full_address || [formData.landmark, formData.city, formData.district, formData.province].filter(Boolean).join(', ');
            const localAddress: ShippingAddress = {
                id: selectedAddressId || -1,
                contact_info: {
                    first_name: addressPayload.first_name,
                    last_name: addressPayload.last_name,
                    contact_number: addressPayload.contact_number,
                },
                geo: {
                    lat: mapLocation?.lat || null,
                    lng: mapLocation?.lng || null,
                },
                address: {
                    label: formData.label,
                    landmark: formData.landmark,
                    city: formData.city,
                    district: formData.district,
                    province: formData.province,
                    country: formData.country || 'Nepal',
                    is_default: savedAddresses.length === 0,
                    state: formData.province,
                }
            };

            if (!isLoggedIn) {
                const guestId = selectedAddressId || Date.now();
                const guestAddress = { ...localAddress, id: guestId };

                if (selectedAddressId) {
                    updateGuestAddress(selectedAddressId, guestAddress);
                    toast.success('Address updated');
                } else {
                    addGuestAddress(guestAddress);
                    toast.success('Address saved');
                }

                onAddressSelect(guestAddress);
                setSelectedAddressId(guestId);
                setViewMode('list');
                return;
            }

            if (selectedAddressId) {
                // API call for persistence — use local nested object for state
                await ShippingAddressUpdate(selectedAddressId, addressPayload);
                const updatedAddress = { ...localAddress, id: selectedAddressId };
                setSavedAddresses(prev => prev.map(a => a.id === selectedAddressId ? updatedAddress : a));
                onAddressSelect(updatedAddress);
                setSelectedAddressId(selectedAddressId);
                toast.success('Address updated');
            } else {
                const apiResult = await CreateShippingAddress(addressPayload);
                const newAddress = { ...localAddress, id: apiResult?.id || Date.now() };
                setSavedAddresses(prev => [...prev, newAddress]);
                onAddressSelect(newAddress);
                setSelectedAddressId(newAddress.id || null);
                toast.success('Address saved');
            }

            setViewMode('list');
        } catch (error) {
            console.error('Failed to save address:', error);
            toast.error('Failed to save address. Please try again.');
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
            if (!isLoggedIn) {
                deleteGuestAddress(addressToDelete);
                if (selectedAddressId === addressToDelete) {
                    setSelectedAddressId(null);
                }
                toast.success("Guest Address deleted");
            } else {
                await ShippingAddressDelete(addressToDelete);
                setSavedAddresses(prev => prev.filter(a => a.id !== addressToDelete));
                if (selectedAddressId === addressToDelete) {
                    setSelectedAddressId(null);
                }
                toast.success("Address deleted");
            }
        } catch (error) {
            console.error('Failed to delete address:', error);
            toast.error("Failed to delete address");
        } finally {
            setShowDeleteDialog(false);
            setAddressToDelete(null);
        }
    };

    const filteredAddresses = savedAddresses.filter(addr => {
        const addrStr = String(addr.address?.landmark || addr.address?.city || '');
        const cityDistStr = String(addr.address?.district || addr.address?.city || addr.address?.province || '');

        return addrStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cityDistStr.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const isComplete = state.address !== null;

    return (
        <div className="">

            {/* ===================== LIST VIEW ===================== */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-2.5 border-b border-gray-100 bg-gradient-to-r from-white to-blue-50/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
                                <MapPin className="w-4.5 h-4.5 text-[var(--colour-fsP2)]" />
                                Delivery Address
                            </h2>
                            {savedAddresses.length < 4 && (
                                <Button
                                    onClick={handleAddNewAddress}
                                    className="bg-[var(--colour-fsP2)] hover:bg-blue-700 text-white shadow-sm rounded-lg transition-all h-8 text-xs px-3"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1" />
                                    Add New
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Address List — 2×2 Grid, max 4 */}
                    <div className="p-1.5 bg-gray-50/30 min-h-[300px]">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredAddresses.slice(0, 4).map((address, index) => {
                                    const isSelected = selectedAddressId === address.id;
                                    const LabelIcon = address.address?.label === 'Office' ? Building2 : address.address?.label === 'Other' ? MapIcon : Home;
                                    const hasGeo = !!(address.geo?.lat && address.geo?.lng);
                                    const fullLine = [
                                        address.address?.landmark,
                                        address.address?.house_no,
                                        address.address?.city,
                                        address.address?.district,
                                        address.address?.province,
                                    ].filter(Boolean).join(', ');
                                    const geoLine = [
                                        address.address?.city,
                                        address.address?.district,
                                        address.address?.province,
                                    ].filter(Boolean).join(' · ');

                                    return (
                                        <div
                                            key={address.id || `addr-${index}`}
                                            onClick={() => handleSelectAddress(address)}
                                            className={`relative flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${isSelected
                                                ? 'border-[var(--colour-fsP2)] bg-blue-50/40 shadow-[0_4px_16px_rgba(25,103,179,0.12)]'
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                        >
                                            {/* Left: radio + icon */}
                                            <div className="flex flex-col items-center gap-2 pt-0.5 shrink-0">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]' : 'border-gray-300'}`}>
                                                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                                </div>

                                            </div>

                                            {/* Middle: address content */}
                                            <div className="flex-1 min-w-0 space-y-1">
                                                {/* Label + Default badge */}
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isSelected ? 'text-[var(--colour-fsP2)]' : 'text-gray-500'}`}>
                                                        {address.address?.label || 'Home'}
                                                    </span>

                                                </div>

                                                {/* Full address */}
                                                <div className="space-y-0.5">
                                                    <p className="text-[12.5px] font-semibold text-gray-800 leading-snug">
                                                        {[
                                                            address.address?.city,
                                                            address.address?.district,
                                                            address.address?.province,
                                                        ].filter(Boolean).join(', ') || 'No address details'}
                                                    </p>
                                                    {address.address?.landmark && (
                                                        <p className="text-[11px] font-medium text-[var(--colour-fsP2)] flex items-center gap-1">
                                                            <span className="opacity-70">Landmark:</span>
                                                            <span className="font-bold uppercase tracking-tight">{address.address.landmark}</span>
                                                        </p>
                                                    )}
                                                </div>



                                                {/* GPS coordinates pill — shown when lat/lng available */}
                                                {hasGeo && (
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <div className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                            <Crosshair className="w-2.5 h-2.5" />
                                                            <span>GPS</span>
                                                            <span className="font-mono text-[9.5px] text-green-600">
                                                                {Number(address.geo!.lat).toFixed(5)}, {Number(address.geo!.lng).toFixed(5)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: edit + delete */}
                                            <div className="flex flex-col gap-1 shrink-0">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEditAddress(address); }}
                                                    className="p-1.5 rounded-lg bg-gray-50 hover:bg-[var(--colour-fsP2)] hover:text-white text-gray-400 transition-colors border border-gray-100"
                                                    aria-label="Edit address"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address.id!); }}
                                                    className="p-1.5 rounded-lg bg-gray-50 hover:bg-red-500 hover:text-white text-gray-400 transition-colors border border-gray-100"
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


            {/* ===================== FORM VIEW ===================== */}
            {viewMode === 'form' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                        <button
                            onClick={() => setViewMode('list')}
                            className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-[var(--colour-fsP2)] hover:text-white transition-all text-gray-500"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <h3 className="text-base font-bold text-gray-900">
                            {selectedAddressId ? 'Edit Address' : 'New Delivery Address'}
                        </h3>
                    </div>

                    {/* Map — always visible */}
                    <div className="relative h-52 sm:h-64 border-b border-gray-100">
                        <GoogleMapAddress
                            onLocationSelect={handleMapLocationSelect}
                            initialPosition={mapLocation || undefined}
                        />
                    </div>

                    {/* Form fields */}
                    <div className="p-4 sm:p-5 space-y-3">

                        {/* Label */}
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Label</Label>
                            <Input
                                value={formData.label}
                                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                                placeholder="e.g., Home, Office..."
                                className="h-9 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium"
                            />
                        </div>

                        {/* Province · District · City */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Province</Label>
                                <Input
                                    value={formData.province}
                                    onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                                    placeholder="Bagmati"
                                    className="h-9 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">District</Label>
                                <Input
                                    value={formData.district}
                                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                                    placeholder="Kathmandu"
                                    className="h-9 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">City</Label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                    placeholder="City"
                                    className="h-9 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium"
                                />
                            </div>
                        </div>

                        {/* Landmark */}
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Landmark <span className="normal-case text-gray-300">(optional)</span></Label>
                            <Input
                                value={formData.landmark}
                                onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                                placeholder="Near temple, school, etc."
                                className="h-9 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium"
                            />
                        </div>

                        {/* GPS hint if map location was selected */}
                        {mapLocation && (
                            <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                                <Navigation className="w-3 h-3 shrink-0" />
                                <span>GPS pinned: {Number(mapLocation.lat).toFixed(5)}, {Number(mapLocation.lng).toFixed(5)}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                            <Button
                                onClick={() => setViewMode('list')}
                                variant="outline"
                                className="flex-1 h-10 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold"
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveAddress}
                                disabled={(!formData.full_address && (!formData.province || !formData.district || !formData.city)) || isSaving}
                                className="flex-1 h-10 rounded-xl bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP1)] text-white text-sm font-bold transition-all active:scale-95"
                            >
                                {isSaving ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                                ) : (
                                    selectedAddressId ? 'Update Address' : 'Save Address'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Continue Button (Only in List View) */}
            {viewMode === 'list' && isComplete && (
                <div className="flex justify-end pt-5 border-t border-gray-100">
                    <Button
                        onClick={onNext}
                        className="w-full sm:w-auto h-12 px-6 sm:px-10 bg-[var(--colour-fsP2)] hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-lg shadow-blue-100/50 transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
                    >
                        <span>Continue to Recipient</span>
                        <ChevronRight className="w-4 h-4" />
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
        </div>
    );
}
