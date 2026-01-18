'use client'

import { useState, useEffect, useMemo } from 'react';
import { MapPin, X, Loader2, AlertCircle, Edit2, Plus, Trash2, Home, Briefcase, LocateFixed } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInView } from 'react-intersection-observer';
import dynamic from 'next/dynamic';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RemoteServices from '../api/remoteservice';
import { nepalLocations } from './NepalLocations';
import { toast } from 'sonner';

// Import GoogleMapAddress (Dynamic import to avoid SSR)
const GoogleMapAddress = dynamic(() => import('./GoogleMapAddress'), { ssr: false });

interface Address {
  id: number;
  label: string;
  first_name: string;
  last_name: string;
  contact: string;
  province: string;
  district: string;
  city: string;
  street: string;
  state: string;
  landmark: string;
}

interface AddressSelectionUIProps {
  setsubmittedvaluelist?: any; // Make optional
  mode?: 'selection' | 'management';
}

export default function AddressSelectionUI({ setsubmittedvaluelist, mode = 'selection' }: AddressSelectionUIProps) {
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [dialogState, setDialogState] = useState<'closed' | 'addressList' | 'addEditAddress'>('closed');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Enhanced State
  const [newAddress, setNewAddress] = useState({
    first_name: '',
    last_name: '',
    contact: '',
    province: '',
    district: '',
    city: '',
    street: '',
    state: '',
    landmark: '',
  });

  const [addressLabel, setAddressLabel] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Derived state for districts and cities based on selection
  const districts = useMemo(() => {
    return newAddress.province ? Object.keys(nepalLocations[newAddress.province] || {}) : [];
  }, [newAddress.province]);

  const cities = useMemo(() => {
    return (newAddress.province && newAddress.district)
      ? nepalLocations[newAddress.province]?.[newAddress.district] || []
      : [];
  }, [newAddress.province, newAddress.district]);


  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  // LOCAL STATE ONLY (No API Fetch)
  // Dummy data for immediate usability
  useEffect(() => {
    setSavedAddresses([
      {
        id: 101,
        label: 'Home',
        first_name: 'Kali',
        last_name: 'House',
        contact: '9800000000',
        province: 'Bagmati',
        district: 'Kathmandu',
        city: 'Kathmandu',
        street: 'Thamel',
        state: 'Bagmati',
        landmark: 'Near Garden of Dreams'
      }
    ]);
  }, []);

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setDialogState('closed');
  };

  const handleDeleteAddress = (id: number) => {
    const updatedAddresses = savedAddresses.filter((address) => address.id !== id);
    setSavedAddresses(updatedAddresses);
    if (selectedAddress?.id === id) {
      setSelectedAddress(updatedAddresses.length > 0 ? updatedAddresses[0] : null);
    }
    toast.success("Address removed locally");
  };

  useEffect(() => {
    // Pass selected address to parent only if setter exists
    if (setsubmittedvaluelist) {
      if (selectedAddress) {
        setsubmittedvaluelist((prev: any) => ({ ...prev, address: selectedAddress }));
      } else {
        setsubmittedvaluelist((prev: any) => ({ ...prev, address: null }));
      }
    }
  }, [selectedAddress, setsubmittedvaluelist]);

  const openDialog = (state: 'addressList' | 'addEditAddress') => {
    setDialogState(state);
    setLocationError('');
    if (state === 'addEditAddress') {
      // Reset form
      setNewAddress({ first_name: '', last_name: '', contact: '', province: '', district: '', city: '', street: '', state: '', landmark: '' });
      setAddressLabel('');
      setCoordinates({ lat: 27.7172, lng: 85.3240 }); // Default Kathmandu
    }
  };


  const closeDialog = () => {
    setDialogState('closed');
    setLocationError('');
  };

  // Callback from GoogleMapAddress
  const handleLocationSelect = ({ lat, lng, address }: { lat: number; lng: number, address?: string }) => {
    setCoordinates({ lat, lng });
    if (address) {
      setNewAddress(prev => ({
        ...prev,
        street: address,
      }));
    }
  };

  const handleSaveWithLabel = async () => {
    if (!newAddress.first_name || !newAddress.last_name || !newAddress.contact || !newAddress.province || !newAddress.district || !newAddress.city || !newAddress.street) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      id: Date.now(), // Generate local ID
      label: addressLabel || 'Address',
      ...newAddress
    } as Address;

    setSavedAddresses(prev => [...prev, payload]);
    setSelectedAddress(payload);
    setDialogState('closed');
    toast.success("Address saved locally (Not persistent)");
  };

  const renderDialogContent = () => {
    switch (dialogState) {
      case 'addressList':
        return (
          <div className="flex flex-col justify-between min-h-[35vh]">
            {isLoadingAddresses ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--colour-fsP1)]" />
                <span className="text-gray-500 text-sm">Loading addresses...</span>
              </div>
            ) : (
              <>
                {savedAddresses.length > 0 && (
                  <div ref={ref} className="max-h-[45vh] overflow-y-auto scrollbar-thin pr-2">
                    <div className="grid grid-cols-1 gap-2">
                      {savedAddresses.map((address) => (
                        <div key={address.id} className="relative group">
                          <button
                            onClick={() => handleAddressSelect(address)}
                            className={`w-full p-4 rounded-xl border text-left transition-all duration-200 hover:border-blue-400 ${selectedAddress?.id === address.id
                              ? 'border-[var(--colour-fsP1)] bg-blue-50/50 ring-1 ring-[var(--colour-fsP1)]'
                              : 'border-[var(--colour-fsP2)] bg-white hover:bg-gray-50'
                              }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${selectedAddress?.id === address.id ? 'bg-blue-100 text-[var(--colour-fsP1)]' : 'bg-gray-100 text-gray-500'
                                }`}>
                                {address.label && address.label.toLowerCase().includes('home') ? <Home className="w-4 h-4" /> :
                                  address.label && address.label.toLowerCase().includes('work') ? <Briefcase className="w-4 h-4" /> :
                                    <MapPin className="w-4 h-4" />}
                              </div>

                              <div className="flex-1 space-y-1">
                                <span className={`font-semibold text-sm ${selectedAddress?.id === address.id ? 'text-[var(--colour-fsP1)]' : 'text-gray-900'
                                  }`}>
                                  {address.label}
                                </span>
                                <div className="text-sm font-medium text-gray-800">
                                  {address.first_name} &nbsp; {address.last_name}
                                </div>
                                <div className="text-sm text-gray-600 leading-snug">
                                  {address.street}, {address.city}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {address.district}, {address.province}
                                </div>
                              </div>
                            </div>
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address.id);
                            }}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 mt-2">
              <Button
                onClick={() => openDialog('addEditAddress')}
                className="h-12 bg-[var(--colour-fsP1)] hover:opacity-90 text-white shadow-sm w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            </div>
          </div>
        );

      case 'addEditAddress':
        return (
          <div className="p-1 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-8 px-4 sm:px-0 pb-6">
              {/* 1. Precise Location Section */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 shadow-sm">
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
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 bg-white transition-all checked:border-blue-600 checked:bg-blue-600 hover:border-blue-400"
                      />
                      <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Pinpoint Exact Location</span>
                  </label>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
                    Highly Recommended
                  </span>
                </div>

                {coordinates && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 shadow-md animate-in fade-in zoom-in-95 duration-200 ring-4 ring-white">
                    <GoogleMapAddress
                      onLocationSelect={handleLocationSelect}
                      initialPosition={coordinates}
                      isOptional={true}
                    />
                  </div>
                )}
                {!coordinates && (
                  <p className="text-xs text-gray-500 ml-8 mt-1">
                    We recommend enabling this to help our riders deliver to your doorstep accurately.
                  </p>
                )}
              </div>

              {/* 2. Contact Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">First Name <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g. John"
                      value={newAddress.first_name}
                      onChange={(e) => setNewAddress({ ...newAddress, first_name: e.target.value })}
                      className="h-11 bg-gray-50/30 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Name <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g. Doe"
                      value={newAddress.last_name}
                      onChange={(e) => setNewAddress({ ...newAddress, last_name: e.target.value })}
                      className="h-11 bg-gray-50/30 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all rounded-lg"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Mobile Number <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g. 98XXXXXXXX"
                      maxLength={10}
                      value={newAddress.contact}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setNewAddress({ ...newAddress, contact: val });
                      }}
                      className="h-11 bg-gray-50/30 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all rounded-lg tracking-widest font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Address Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                  Address Details
                </h4>

                {/* Province & District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Province <span className="text-red-500">*</span></Label>
                    <Select
                      value={newAddress.province}
                      onValueChange={(val) => setNewAddress({ ...newAddress, province: val, district: '', city: '' })}
                    >
                      <SelectTrigger className="h-11 bg-gray-50/30 border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-lg">
                        <SelectValue placeholder="Select Province" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-100 shadow-xl rounded-xl max-h-[300px]">
                        {Object.keys(nepalLocations).map((prov) => (
                          <SelectItem key={prov} value={prov} className="cursor-pointer hover:bg-gray-50 focus:bg-blue-50 focus:text-blue-600 rounded-md my-0.5">{prov}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">District <span className="text-red-500">*</span></Label>
                    <Select
                      value={newAddress.district}
                      onValueChange={(val) => setNewAddress({ ...newAddress, district: val, city: '' })}
                      disabled={!newAddress.province}
                    >
                      <SelectTrigger className="h-11 bg-gray-50/30 border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-lg disabled:opacity-50">
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-100 shadow-xl rounded-xl max-h-[300px]">
                        {districts.map((dist) => (
                          <SelectItem key={dist} value={dist} className="cursor-pointer hover:bg-gray-50 focus:bg-blue-50 focus:text-blue-600 rounded-md my-0.5">{dist}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">City / Municipality <span className="text-red-500">*</span></Label>
                  {cities.length > 0 ? (
                    <Select
                      value={newAddress.city}
                      onValueChange={(val) => setNewAddress({ ...newAddress, city: val })}
                      disabled={!newAddress.district}
                    >
                      <SelectTrigger className="h-11 bg-gray-50/30 border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-lg disabled:opacity-50">
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-100 shadow-xl rounded-xl max-h-[300px]">
                        {cities.map((city) => (
                          <SelectItem key={city} value={city} className="cursor-pointer hover:bg-gray-50 focus:bg-blue-50 focus:text-blue-600 rounded-md my-0.5">{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="e.g. Kathmandu Metro"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="h-11 bg-gray-50/30 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all rounded-lg"
                    />
                  )}
                </div>

                {/* Street & Landmark */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Street / Tole <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g. New Baneshwor, Marg 1"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="h-11 bg-gray-50/30 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Landmark (Optional)</Label>
                    <Input
                      placeholder="e.g. Near White House"
                      value={newAddress.landmark}
                      onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                      className="h-11 bg-gray-50/30 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Label */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <Label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                    Address Label
                  </Label>
                  <div className="flex gap-2">
                    {['Home', 'Work', 'Other'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setAddressLabel(tag)}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all shadow-sm ${addressLabel === tag
                          ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  placeholder="Custom Label (e.g. My Apartment, Office)"
                  value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                  className="h-11 bg-gray-50/30 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all rounded-lg"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDialogState('addressList')}
                  className="flex-1 h-12 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveWithLabel}
                  className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 font-bold tracking-wide"
                >
                  Save Address Used
                </Button>
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
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Saved Addresses</h3>
          <Button onClick={() => openDialog('addEditAddress')} className="bg-[var(--colour-fsP1)] text-white gap-2">
            <Plus className="w-4 h-4" /> Add New
          </Button>
        </div>

        <div className="grid gap-4">
          {savedAddresses.map((address) => (
            <div
              key={address.id}
              onClick={() => handleAddressSelect(address)}
              className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 rounded-full bg-white border border-gray-200 text-gray-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{address.label}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {address.street}, {address.city}, {address.district}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{address.contact}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {/* Edit Logic would be nice here, but reusable dialog handles add/edit mostly. 
                                  For now just delete support to keep it simple or trigger edit if needed in future 
                              */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteAddress(address.id)}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {savedAddresses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No saved addresses found.
            </div>
          )}
        </div>

        <Drawer open={dialogState !== 'closed'} onOpenChange={(open) => !open && closeDialog()}>
          <DrawerContent className="max-h-[85vh] bg-white max-w-3xl mx-auto">
            <div className="max-w-2xl mx-auto w-full py-2">
              <DrawerHeader className="px-0 pt-0  flex  flex-row items-center justify-between border-b border-gray-100 mb-1">
                <DrawerTitle className="text-xl font-semibold text-gray-900 p-0 m-0">
                  {dialogState === 'addressList' ? 'Address Book' : 'Enter Address Details'}
                </DrawerTitle>
                <DrawerClose className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </DrawerClose>
              </DrawerHeader>
              {renderDialogContent()}
              {locationError && (
                <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
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
        <div className="relative group border border-blue-200 bg-blue-50/30 rounded-xl p-4 transition-all hover:border-blue-300 hover:shadow-sm">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 rounded-full bg-blue-100 text-[var(--colour-fsP1)] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-semibold text-gray-900">{selectedAddress.label}</span>
                <span className="text-[10px] bg-blue-100 text-[var(--colour-fsP1)] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Selected</span>
              </div>

              <div className="mb-2 text-sm text-gray-800 font-medium">
                {selectedAddress.first_name} {selectedAddress.last_name}, {selectedAddress.contact}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedAddress.street}, {selectedAddress.city}<br />
                {selectedAddress.district}, {selectedAddress.province}<br />
                {selectedAddress.landmark && <span className="text-xs text-gray-500 italic">Near {selectedAddress.landmark}</span>}
              </p>
            </div>
            <button
              onClick={() => openDialog('addressList')}
              className="text-sm font-medium text-[var(--colour-fsP1)] hover:underline px-2 py-1"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => openDialog('addressList')}
          className="w-full flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-[var(--colour-fsP2)] text-gray-500 hover:border-[var(--colour-fsP1)] hover:bg-blue-50 hover:text-[var(--colour-fsP1)] transition-all duration-200 group"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-medium">Add Shipping Address</span>
        </button>
      )}

      <Drawer open={dialogState !== 'closed'} onOpenChange={(open) => !open && closeDialog()}>
        <DrawerContent className="max-h-[85vh] bg-white max-w-3xl mx-auto">
          <div className="max-w-2xl mx-auto w-full py-2">
            <DrawerHeader className="px-0 pt-0  flex  flex-row items-center justify-between border-b border-gray-100 mb-1">
              <DrawerTitle className="text-xl font-semibold text-gray-900 p-0 m-0">
                {dialogState === 'addressList' ? 'Address Book' : 'Enter Address Details'}
              </DrawerTitle>
              <DrawerClose className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </DrawerClose>
            </DrawerHeader>

            {renderDialogContent()}

            {locationError && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
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