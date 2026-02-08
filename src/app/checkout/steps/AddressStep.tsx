'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ChevronRight, Loader2, X, Check, Search, Plus, Edit2, Trash2, ChevronLeft, Home, Building2, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckoutState, ShippingAddress } from '../checkoutTypes';
import GoogleMapAddress from '../GoogleMapAddress';

interface AddressStepProps {
    state: CheckoutState;
    onAddressSelect: (address: ShippingAddress) => void;
    onLocationPermissionChange: (granted: boolean) => void;
    onNext: () => void;
}

interface LocationData {
    lat: number;
    lng: number;
    address: string;
}

// Mock saved addresses
const mockSavedAddresses: ShippingAddress[] = [
    {
        id: 1,

        address: 'House 45, Street 5, Naxal',
        city: 'Kathmandu',
        state: 'Bagmati',
        postal_code: '44600',
        country: 'Nepal',
        label: 'Home',
        is_default: true,
        lat: 27.7172,
        lng: 85.3240
    },
    {
        id: 2,
        address: 'Office 302, Business Park, Thapathali',
        city: 'Kathmandu',
        state: 'Bagmati',
        postal_code: '44600',
        country: 'Nepal',
        label: 'Office',
        is_default: false,
        lat: 27.6915,
        lng: 85.3197
    }
];

// Nepal Provinces
const PROVINCES = [
    'Koshi',
    'Madhesh',
    'Bagmati',
    'Gandaki',
    'Lumbini',
    'Karnali',
    'Sudurpashchim'
];

export default function AddressStep({
    state,
    onAddressSelect,
    onLocationPermissionChange,
    onNext
}: AddressStepProps) {
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [activeTab, setActiveTab] = useState<'shipping' | 'billing'>('shipping');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>(mockSavedAddresses);

    // Map state
    const [mapLocation, setMapLocation] = useState<LocationData | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        label: 'Home',
        province: '',
        city: '',
        area: '', // Tole/Chowk
        landmark: '',
        houseNo: '',
    });

    // Check for existing address
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
            if (savedAddresses.length === 0 && state.address.id) {
                setSavedAddresses([state.address]);
            }
        }
    }, [state.address]);

    const handleAddNewAddress = () => {
        setViewMode('form');
        setSelectedAddressId(null);
        setFormData({
            label: 'Home',
            province: '',
            city: '',
            area: '',
            landmark: '',
            houseNo: '',
        });
        setMapLocation(null);
        // Removed auto-geolocation to require user permission on interaction only
    };

    const handleSelectAddress = (address: ShippingAddress) => {
        setSelectedAddressId(address.id || null);
        onAddressSelect(address);
    };

    const handleEditAddress = (address: ShippingAddress) => {
        setViewMode('form');
        setSelectedAddressId(address.id || null);
        // Parse address parts if possible, or leave as string
        setFormData({
            label: address.label || 'Home',
            province: address.state,
            city: address.city,
            area: address.address.split(',')[0] || '', // Rough parsing
            landmark: '',
            houseNo: '',
        });
        if (address.lat && address.lng) {
            setMapLocation({ lat: address.lat, lng: address.lng, address: address.address });
        }
    };

    const handleMapLocationSelect = (location: LocationData) => {
        setMapLocation(location);
        // Auto-fill form from Google Maps address components if you had a parser
        // For now, just setting what we can or leaving blank for manual fill
    };

    const handleSaveAddress = () => {
        if (!formData.province || !formData.city || !formData.area) {
            return;
        }

        // Construct full address string
        const fullAddress = `${formData.area}, ${formData.landmark ? formData.landmark + ', ' : ''}${formData.houseNo ? 'House No. ' + formData.houseNo : ''}`;

        const newAddress: ShippingAddress = {
            id: selectedAddressId || Date.now(),

            address: fullAddress,
            city: formData.city,
            state: formData.province,
            postal_code: '',
            country: 'Nepal',
            label: formData.label,
            is_default: savedAddresses.length === 0,
            lat: mapLocation?.lat || 27.7172,
            lng: mapLocation?.lng || 85.3240,
        };

        if (selectedAddressId) {
            setSavedAddresses(prev => prev.map(a => a.id === selectedAddressId ? newAddress : a));
        } else {
            setSavedAddresses(prev => [...prev, newAddress]);
        }

        onAddressSelect(newAddress);
        setViewMode('list');
    };

    const handleDeleteAddress = (id: number) => {
        setSavedAddresses(prev => prev.filter(a => a.id !== id));
        if (selectedAddressId === id) {
            setSelectedAddressId(null);
        }
    };

    const filteredAddresses = savedAddresses.filter(addr =>
        addr.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addr.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isComplete = state.address !== null;

    return (
        <div className="animate-fade-in-premium space-y-6">

            {/* ===================== LIST VIEW ===================== */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-2xl shadow-[var(--shadow-premium-sm)] border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-[var(--colour-fsP2)]" />
                                Select Delivery Address
                            </h2>
                            <Button
                                onClick={handleAddNewAddress}
                                className="bg-[var(--colour-fsP2)] hover:bg-blue-700 text-white shadow-lg shadow-blue-200 rounded-xl transition-all"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add New Address
                            </Button>
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

                    {/* Address List Grid */}
                    <div className="p-6 bg-gray-50/50 min-h-[300px] max-h-[55vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {filteredAddresses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                                    <MapPin className="w-8 h-8 text-[var(--colour-fsP2)]" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No addresses found</h3>
                                <p className="text-gray-500 max-w-xs mb-6">
                                    Add a delivery location to proceed with your order.
                                </p>
                                <Button onClick={handleAddNewAddress} variant="outline" className="rounded-xl border-[var(--colour-fsP2)] text-[var(--colour-fsP2)] hover:bg-blue-50">
                                    <Plus className="w-4 h-4 mr-2" /> Create Address
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {filteredAddresses.map((address) => (
                                    <div
                                        key={address.id}
                                        onClick={() => handleSelectAddress(address)}
                                        className={`relative group p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedAddressId === address.id
                                            ? 'border-[var(--colour-fsP2)] bg-blue-50/40 shadow-sm'
                                            : 'border-gray-100 bg-white hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            {/* Icon - Refined */}
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${selectedAddressId === address.id
                                                ? 'bg-[var(--colour-fsP2)] border-[var(--colour-fsP2)] text-white shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-400'
                                                }`}>
                                                {address.label === 'Office' ? <Building2 className="w-4 h-4" /> :
                                                    address.label === 'Other' ? <MapIcon className="w-4 h-4" /> :
                                                        <Home className="w-4 h-4" />}
                                            </div>

                                            {/* Content - Tighter Spacing */}
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className={`font-bold text-sm ${selectedAddressId === address.id ? 'text-[var(--colour-fsP2)]' : 'text-gray-900'}`}>{address.label || 'Home'}</span>
                                                    {address.is_default && (
                                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">DEFAULT</span>
                                                    )}
                                                </div>
                                                <p className="text-gray-800 font-medium text-xs leading-relaxed mb-0.5">{address.address}</p>
                                                <p className="text-gray-500 text-xs">{address.city}, {address.state}</p>

                                                {/* Actions - Compact & Minimal */}
                                                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-dashed border-gray-200">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEditAddress(address); }}
                                                        className="text-[10px] font-bold text-gray-500 hover:text-[var(--colour-fsP2)] flex items-center gap-1 transition-colors uppercase tracking-wide group/btn"
                                                    >
                                                        <Edit2 className="w-3 h-3 group-hover/btn:scale-110 transition-transform" /> Edit
                                                    </button>
                                                    <div className="w-px h-2.5 bg-gray-300" />
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address.id!); }}
                                                        className="text-[10px] font-bold text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors uppercase tracking-wide group/btn"
                                                    >
                                                        <Trash2 className="w-3 h-3 group-hover/btn:scale-110 transition-transform" /> Delete
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Selection Checkmark - Subtle */}
                                            {selectedAddressId === address.id && (
                                                <div className="absolute top-3 right-3 text-[var(--colour-fsP2)]">
                                                    <div className="w-4 h-4 rounded-full bg-[var(--colour-fsP2)] flex items-center justify-center">
                                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* ===================== FORM VIEW ===================== */}
            {viewMode === 'form' && (
                <div className="bg-white rounded-2xl shadow-[var(--shadow-premium-sm)] border border-gray-100 overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setViewMode('list')}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <h3 className="text-lg font-bold text-gray-900">
                                {selectedAddressId ? 'Edit Location' : 'Add New Location'}
                            </h3>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2">
                        {/* Map Section - Optional */}
                        <div className="relative h-[250px] lg:h-auto bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-100">
                            <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-500 border border-gray-200">
                                OPTIONAL
                            </div>
                            <GoogleMapAddress
                                onLocationSelect={handleMapLocationSelect}
                                initialPosition={mapLocation || undefined}
                                isOptional={true}
                            />
                        </div>

                        {/* Form Section - Simple Inputs */}
                        <div className="p-5 space-y-4">
                            <div className="space-y-3">
                                {/* Label Selection */}
                                <div>
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Address Label</Label>
                                    <div className="flex gap-2">
                                        {['Home', 'Office', 'Other'].map(label => (
                                            <button
                                                key={label}
                                                onClick={() => setFormData(prev => ({ ...prev, label }))}
                                                className={`flex-1 py-1.5 px-3 rounded text-xs font-bold border transition-all ${formData.label === label
                                                    ? 'border-[var(--colour-fsP2)] bg-blue-50 text-[var(--colour-fsP2)]'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Province & City */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase">Province</Label>
                                        <Input
                                            value={formData.province}
                                            onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                                            placeholder="Province / State"
                                            className="h-9 rounded-lg bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase">City</Label>
                                        <Input
                                            value={formData.city}
                                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                            placeholder="City / District"
                                            className="h-9 rounded-lg bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Area */}
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-gray-500 uppercase">Address Line 1</Label>
                                    <Input
                                        value={formData.area}
                                        onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                                        placeholder="Area, Street, Tole"
                                        className="h-9 rounded-lg bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-sm"
                                    />
                                </div>

                                {/* House / Landmark */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase">House No.</Label>
                                        <Input
                                            value={formData.houseNo}
                                            onChange={(e) => setFormData(prev => ({ ...prev, houseNo: e.target.value }))}
                                            placeholder="Optional"
                                            className="h-9 rounded-lg bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase">Landmark</Label>
                                        <Input
                                            value={formData.landmark}
                                            onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                                            placeholder="Optional"
                                            className="h-9 rounded-lg bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end gap-2">
                                <Button
                                    onClick={() => setViewMode('list')}
                                    variant="outline"
                                    className="h-9 px-4 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveAddress}
                                    disabled={!formData.province || !formData.city || !formData.area}
                                    className="h-9 px-6 rounded-lg bg-[var(--colour-fsP2)] hover:bg-blue-700 text-white shadow-md text-xs font-bold transition-all"
                                >
                                    Save Address
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Continue Button (Only in List View) */}
            {viewMode === 'list' && isComplete && (
                <div className="flex justify-end pt-6 border-t border-gray-100">
                    <Button
                        onClick={onNext}
                        className="h-11 px-8 bg-[var(--colour-fsP2)] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all hover:shadow-lg active:scale-95"
                    >
                        Continue to Recipient
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            )}
        </div>
    );
}
