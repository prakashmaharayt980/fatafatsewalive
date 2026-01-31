'use client'

import { useState, useEffect, useMemo } from 'react';
import { MapPin, X, Loader2, AlertCircle, Plus, Trash2, Check, Mail } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RemoteServices from '../api/remoteservice';
import { nepalLocations } from './NepalLocations';
import { toast } from 'sonner';

// Import LeafletMapAddress (Dynamic import to avoid SSR)
const LeafletMapAddress = dynamic(() => import('./LeafletMapAddress'), { ssr: false });

export interface ShippingAddressData {
  id?: number;
  full_name: string;
  phone: string;
  email: string;
  address: string; // Street Address
  city: string;
  state: string; // Province
  postal_code: string;
  country: string;
  is_default: boolean;
  label?: string; // Optional UI helper
}

interface AddressSelectionUIProps {
  setsubmittedvaluelist?: any; // Make optional
  mode?: 'selection' | 'management';
}

export default function AddressSelectionUI({ setsubmittedvaluelist, mode = 'selection' }: AddressSelectionUIProps) {
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddressData[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddressData | null>(null);
  const [dialogState, setDialogState] = useState<'closed' | 'addressList' | 'addEditAddress'>('closed');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Form State
  const [formData, setFormData] = useState<ShippingAddressData>({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Nepal',
    is_default: false,
    label: 'Home'
  });

  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Derived state for districts and cities based on selection
  const districts = useMemo(() => {
    // Mapping Province -> Districts from nepalLocations
    return formData.state ? Object.keys(nepalLocations[formData.state] || {}) : [];
  }, [formData.state]);

  const cities = useMemo(() => {
    // We use 'district' logic slightly differently here since API just asks for City/State
    // But the UI has Province -> District -> City.
    // We will store Province in 'state'.
    // We need a place for District. API doesn't have district explicitly.
    // We can append District to address or just ignore if API doesn't support it.
    // For now, let's keep the UI selector but maybe not enforce it if not strictly needed by API,
    // OR we can misuse 'scity' or just assume user enters City.
    // Ideally, we select Province -> District -> City.
    // API has 'city' and 'state'.
    // We can put Province in 'state'. District... maybe just part of address string?
    return (formData.state && formData.address) // Misusing address field for district in UI logic? No.
      // checking nepalLocations
      ? nepalLocations[formData.state]?.[formData.city] || [] // Wait, keys are districts.
      : [];
  }, [formData.state, formData.city]); // This logic is broken if I don't have district in state.

  // Let's add a temporary 'district' state for the UI selector, even if not sent to API separately.
  const [district, setDistrict] = useState('');
  const availableCities = useMemo(() => {
    return (formData.state && district)
      ? nepalLocations[formData.state]?.[district] || []
      : [];
  }, [formData.state, district]);


  const fetchAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const response = await RemoteServices.ShippingAddressList();
      if (response?.data) {
        setSavedAddresses(response.data);
        // Select default if available
        const def = response.data.find((a: ShippingAddressData) => a.is_default);
        if (def && !selectedAddress) {
          setSelectedAddress(def);
        }
      } else if (Array.isArray(response)) {
        setSavedAddresses(response);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      // toast.error("Failed to load addresses");
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddressSelect = (address: ShippingAddressData) => {
    setSelectedAddress(address);
    setDialogState('closed');
  };

  const handleDeleteAddress = async (id?: number) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await RemoteServices.ShippingAddressDelete(id);
      toast.success("Address deleted");
      fetchAddresses();
      if (selectedAddress?.id === id) setSelectedAddress(null);
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  useEffect(() => {
    // Pass selected address to parent only if setter exists
    if (setsubmittedvaluelist) {
      setsubmittedvaluelist((prev: any) => ({ ...prev, address: selectedAddress }));
    }
  }, [selectedAddress, setsubmittedvaluelist]);

  const openDialog = (state: 'addressList' | 'addEditAddress', addressToEdit?: ShippingAddressData) => {
    setDialogState(state);
    setLocationError('');
    if (state === 'addEditAddress') {
      if (addressToEdit) {
        setFormData(addressToEdit);
        setDistrict(''); // Logic to extract district if possible, else reset
      } else {
        // Reset form
        setFormData({
          full_name: '',
          phone: '',
          email: '',
          address: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'Nepal',
          is_default: false,
          label: 'Home'
        });
        setDistrict('');
        setCoordinates({ lat: 27.7172, lng: 85.3240 });
      }
    }
  };


  const closeDialog = () => {
    setDialogState('closed');
    setLocationError('');
  };

  // Callback from LeafletMapAddress
  const handleLocationSelect = ({ lat, lng, address }: { lat: number; lng: number, address?: string }) => {
    setCoordinates({ lat, lng });
    if (address) {
      setFormData(prev => ({
        ...prev,
        address: address, // Set pinpointed address
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.phone || !formData.address || !formData.city || !formData.state) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        // Ensure country is set
        country: formData.country || 'Nepal'
      };

      await RemoteServices.CreateShippingAddress(payload);
      toast.success("Address saved successfully");
      fetchAddresses();
      setDialogState('closed');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save address");
    } finally {
      setIsSaving(false);
    }
  };

  const renderDialogContent = () => {
    switch (dialogState) {
      case 'addressList':
        return (
          <div className="flex flex-col justify-between min-h-[35vh]">
            {isLoadingAddresses ? (
              <div className="flex flex-col items-center justify-center h-40 gap-4">
                <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                <span className="text-gray-600 text-sm font-bold">Loading addresses...</span>
              </div>
            ) : (
              <>
                {/* Address Count Header */}
                {savedAddresses.length > 0 && (
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                      {savedAddresses.length} Saved {savedAddresses.length === 1 ? 'Address' : 'Addresses'}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                  {savedAddresses.map((address) => (
                    <div key={address.id} className="relative group">
                      <button
                        onClick={() => handleAddressSelect(address)}
                        className={`w-full h-full p-5 rounded-xl border text-left transition-all duration-200 flex flex-col gap-4 ${selectedAddress?.id === address.id
                          ? 'border-gray-900 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                          : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                          }`}
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${selectedAddress?.id === address.id
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-gray-200 bg-gray-50 text-gray-600'
                              }`}>
                              <MapPin size={18} />
                            </div>
                            <div>
                              <span className={`block font-bold text-sm leading-none mb-1.5 uppercase tracking-wide ${selectedAddress?.id === address.id ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                {address.label || 'Address'}
                              </span>
                              <span className="text-xs text-gray-500 font-semibold">
                                {address.phone}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {address.is_default && (
                              <span className="text-[10px] border border-gray-300 text-gray-700 font-bold px-2.5 py-1 rounded uppercase tracking-wider bg-white">Default</span>
                            )}
                            {selectedAddress?.id === address.id && (
                              <span className="text-[10px] border border-gray-900 text-gray-900 font-bold px-2.5 py-1 rounded uppercase tracking-wider bg-white">Selected</span>
                            )}
                          </div>
                        </div>

                        <div className="mt-auto pt-3 border-t border-gray-100 w-full">
                          <div className="text-sm font-bold text-gray-900 mb-1">
                            {address.full_name}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                            {address.address}, {address.city}, {address.state}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(address.id);
                        }}
                        className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center border border-gray-200 bg-white text-gray-400 hover:text-red-600 hover:border-red-300 hover:shadow-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Add New Card Button */}
                  <button
                    onClick={() => openDialog('addEditAddress')}
                    className="flex flex-col items-center justify-center gap-3 h-full min-h-[180px] p-5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-all group bg-white"
                  >
                    <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 group-hover:border-gray-900 group-hover:bg-gray-900 group-hover:text-white flex items-center justify-center transition-all">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold">Add New Address</span>
                  </button>
                </div>
              </>
            )}
          </div>
        );

      case 'addEditAddress':
        return (
          <div className="p-1 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-8 px-4 sm:px-0 pb-6">
              {/* 1. Precise Location Section */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={!!coordinates}
                        onChange={(e) => {
                          if (e.target.checked) setCoordinates({ lat: 27.7172, lng: 85.3240 });
                          else setCoordinates(null);
                        }}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-300 bg-white transition-all checked:border-gray-900 checked:bg-gray-900 hover:border-gray-500"
                      />
                      <Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-3 h-3 peer-checked:opacity-100 opacity-0" />
                    </div>
                    <span className="font-bold text-gray-900 group-hover:text-gray-700 transition-colors">Pinpoint Exact Location</span>
                  </label>
                  <span className="inline-flex items-center px-3 py-1 rounded border border-gray-300 text-[11px] font-bold bg-white text-gray-700 uppercase tracking-wider">
                    Recommended
                  </span>
                </div>

                {coordinates && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.1)] animate-in fade-in zoom-in-95 duration-200">
                    <LeafletMapAddress
                      onLocationSelect={handleLocationSelect}
                      initialPosition={coordinates}
                    />
                  </div>
                )}
              </div>

              {/* 2. Contact Details */}
              <div className="space-y-5">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3 uppercase tracking-wider">
                  <span className="w-1 h-4 bg-gray-900 rounded-full"></span>
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g. John Doe"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="h-11 bg-white border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition-all rounded-lg font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Mobile Number <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g. 98XXXXXXXX"
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, phone: val });
                      }}
                      className="h-11 bg-white border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition-all rounded-lg tracking-widest font-bold"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="e.g. john@example.com"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-11 pl-10 bg-white border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition-all rounded-lg font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Address Details */}
              <div className="space-y-5">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3 uppercase tracking-wider">
                  <span className="w-1 h-4 bg-gray-900 rounded-full"></span>
                  Address Details
                </h4>

                {/* Province & District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Province / State <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.state}
                      onValueChange={(val) => {
                        setFormData({ ...formData, state: val, city: '' });
                        setDistrict('');
                      }}
                    >
                      <SelectTrigger className="h-11 bg-white border-gray-300 focus:ring-2 focus:ring-gray-100 focus:border-gray-900 rounded-lg font-medium">
                        <SelectValue placeholder="Select Province" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.12)] rounded-xl max-h-[300px]">
                        {Object.keys(nepalLocations).map((prov) => (
                          <SelectItem key={prov} value={prov} className="cursor-pointer hover:bg-gray-50 focus:bg-gray-100 focus:text-gray-900 rounded-md my-0.5 font-medium">{prov}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">District</Label>
                    <Select
                      value={district}
                      onValueChange={(val) => {
                        setDistrict(val);
                        setFormData({ ...formData, city: '' });
                      }}
                      disabled={!formData.state}
                    >
                      <SelectTrigger className="h-11 bg-white border-gray-300 focus:ring-2 focus:ring-gray-100 focus:border-gray-900 rounded-lg disabled:opacity-40 font-medium">
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.12)] rounded-xl max-h-[300px]">
                        {districts.map((dist) => (
                          <SelectItem key={dist} value={dist} className="cursor-pointer hover:bg-gray-50 focus:bg-gray-100 focus:text-gray-900 rounded-md my-0.5 font-medium">{dist}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">City / Municipality <span className="text-red-500">*</span></Label>
                  {availableCities.length > 0 ? (
                    <Select
                      value={formData.city}
                      onValueChange={(val) => setFormData({ ...formData, city: val })}
                      disabled={!district}
                    >
                      <SelectTrigger className="h-11 bg-white border-gray-300 focus:ring-2 focus:ring-gray-100 focus:border-gray-900 rounded-lg disabled:opacity-40 font-medium">
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.12)] rounded-xl max-h-[300px]">
                        {availableCities.map((city: string) => (
                          <SelectItem key={city} value={city} className="cursor-pointer hover:bg-gray-50 focus:bg-gray-100 focus:text-gray-900 rounded-md my-0.5 font-medium">{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="e.g. Kathmandu Metro"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="h-11 bg-white border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition-all rounded-lg font-medium"
                    />
                  )}
                </div>

                {/* Address & Postal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Street Address <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g. New Baneshwor, Marg 1"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="h-11 bg-white border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition-all rounded-lg font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Postal Code</Label>
                    <Input
                      placeholder="e.g. 44600"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="h-11 bg-white border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition-all rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-3">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-300 bg-white transition-all checked:border-gray-900 checked:bg-gray-900 hover:border-gray-500"
                    />
                    <Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-3 h-3 peer-checked:opacity-100 opacity-0" />
                  </div>
                  <Label htmlFor="isDefault" className="text-sm font-semibold text-gray-700 cursor-pointer">Set as default shipping address</Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setDialogState('addressList')}
                  className="flex-1 h-12 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-lg transition-all hover:shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-[2] h-12 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg transition-all shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Shipping Address"}
                </button>
              </div>
            </div>
          </div >
        );

      default:
        return null;
    }
  };

  if (mode === 'management') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Saved Addresses</h3>
          <button
            onClick={() => openDialog('addEditAddress')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white font-bold text-sm rounded-lg border border-gray-900 shadow-[0_2px_6px_rgba(0,0,0,0.15)] hover:bg-gray-800 hover:shadow-[0_4px_10px_rgba(0,0,0,0.2)] transition-all"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>

        <div className="grid gap-4">
          {savedAddresses.map((address) => (
            <div
              key={address.id}
              className="flex items-start justify-between p-5 rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="font-bold text-gray-900 uppercase tracking-wide text-sm">{address.label || 'Address'}</span>
                    {address.is_default && (
                      <span className="text-[10px] border border-gray-300 text-gray-700 font-bold px-2.5 py-1 rounded uppercase tracking-wider bg-white">Default</span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-800 mb-1">{address.full_name}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {address.address}, {address.city}, {address.state}
                  </p>
                  <p className="text-sm font-semibold text-gray-700 mt-1.5">{address.phone}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteAddress(address.id)}
                className="h-9 w-9 flex items-center justify-center border border-gray-200 bg-white text-gray-400 hover:text-red-600 hover:border-red-300 hover:shadow-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {savedAddresses.length === 0 && (
            <div className="text-center py-12 text-gray-500 font-semibold">
              No saved addresses found.
            </div>
          )}
        </div>

        <Drawer open={dialogState !== 'closed'} onOpenChange={(open) => !open && closeDialog()}>
          <DrawerContent className="max-h-[90vh] bg-white max-w-5xl mx-auto border border-gray-200">
            <div className="max-w-4xl mx-auto w-full py-4 px-4 sm:px-6">
              <DrawerHeader className="px-0 pt-0 flex flex-row items-center justify-between border-b border-gray-200 mb-5 pb-4">
                <DrawerTitle className="text-xl font-bold text-gray-900 p-0 m-0 uppercase tracking-wide">
                  {dialogState === 'addressList' ? 'Address Book' : 'Enter Address Details'}
                </DrawerTitle>
                <DrawerClose className="p-2 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </DrawerClose>
              </DrawerHeader>
              {renderDialogContent()}
              {locationError && (
                <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {locationError}
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selectedAddress ? (
        <div className="relative group border border-gray-900 bg-white rounded-xl p-5 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 w-10 h-10 rounded-lg border border-gray-900 bg-gray-900 text-white flex items-center justify-center shrink-0">
              <MapPin className="w-[18px] h-[18px]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="font-bold text-gray-900 uppercase tracking-wide text-sm">{selectedAddress.label || 'Address'}</span>
                <span className="text-[10px] border border-gray-900 text-gray-900 px-2.5 py-1 rounded font-bold uppercase tracking-wider bg-white">Selected</span>
              </div>

              <div className="border-t border-gray-100 pt-2 mt-1">
                <p className="text-sm font-bold text-gray-900 mb-1">
                  {selectedAddress.full_name}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mb-1">
                  {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state}
                </p>
                <p className="text-sm font-semibold text-gray-700">{selectedAddress.phone}</p>
              </div>
            </div>
            <button
              onClick={() => openDialog('addressList')}
              className="text-sm font-bold text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => openDialog('addressList')}
          className="w-full flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-all duration-200 group bg-white"
        >
          <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 group-hover:border-gray-900 group-hover:bg-gray-900 group-hover:text-white flex items-center justify-center transition-all">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-bold">Add Shipping Address</span>
        </button>
      )}

      <Drawer open={dialogState !== 'closed'} onOpenChange={(open) => !open && closeDialog()}>
        <DrawerContent className="max-h-[90vh] bg-white max-w-5xl mx-auto border border-gray-200">
          <div className="max-w-4xl mx-auto w-full py-4 px-4 sm:px-6">
            <DrawerHeader className="px-0 pt-0 flex flex-row items-center justify-between border-b border-gray-200 mb-5 pb-4">
              <DrawerTitle className="text-xl font-bold text-gray-900 p-0 m-0 uppercase tracking-wide">
                {dialogState === 'addressList' ? 'Address Book' : 'Enter Address Details'}
              </DrawerTitle>
              <DrawerClose className="p-2 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </DrawerClose>
            </DrawerHeader>

            {renderDialogContent()}

            {locationError && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {locationError}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}