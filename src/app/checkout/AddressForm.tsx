'use client';

import { useMemo, useState } from 'react';
import { Loader2, Check, MapPin, User, Mail, Phone, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { nepalLocations } from './NepalLocations';
import type { ShippingAddressData } from './AddressSectionUi';

const LeafletMapAddress = dynamic(() => import('./LeafletMapAddress'), { ssr: false });

interface AddressFormProps {
  formData: ShippingAddressData;
  setFormData: (data: ShippingAddressData) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isEdit?: boolean;
}

export default function AddressForm({
  formData,
  setFormData,
  onSave,
  onCancel,
  isSaving,
  isEdit,
}: AddressFormProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    { lat: 27.7172, lng: 85.3240 }
  );
  const [showMap, setShowMap] = useState(false);
  const [district, setDistrict] = useState('');

  const districts = useMemo(() => {
    return formData.state ? Object.keys(nepalLocations[formData.state] || {}) : [];
  }, [formData.state]);

  const availableCities = useMemo(() => {
    return (formData.state && district)
      ? nepalLocations[formData.state]?.[district] || []
      : [];
  }, [formData.state, district]);

  const handleLocationSelect = ({ lat, lng, address }: { lat: number; lng: number; address?: string }) => {
    setCoordinates({ lat, lng });
    if (address) {
      setFormData({ ...formData, address });
    }
  };

  const updateField = (field: keyof ShippingAddressData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Label options
  const labelOptions = ['Home', 'Office', 'Other'];

  return (
    <div className="max-h-[72vh] overflow-y-auto pr-1">
      <div className="space-y-6 pb-6">

        {/* Address Label Selector */}
        <div>
          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Address Type</Label>
          <div className="flex gap-2">
            {labelOptions.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => updateField('label', label)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                  formData.label === label
                    ? 'border-[var(--colour-fsP1)] bg-blue-50 text-[var(--colour-fsP1)]'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Navigation className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Pin Your Location</h4>
                <p className="text-xs text-gray-500">Helps us deliver faster</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                showMap
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>

          {showMap && coordinates && (
            <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <LeafletMapAddress
                onLocationSelect={handleLocationSelect}
                initialPosition={coordinates}
              />
            </div>
          )}
        </div>

        {/* Contact Section */}
        <fieldset className="space-y-4">
          <legend className="flex items-center gap-2.5 text-sm font-bold text-gray-900 pb-3 border-b border-gray-100 w-full">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            Contact Details
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Phone <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="98XXXXXXXX"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                  className="h-12 pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl tracking-wider font-semibold"
                />
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="john@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="h-12 pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl"
                />
              </div>
            </div>
          </div>
        </fieldset>

        {/* Location Section */}
        <fieldset className="space-y-4">
          <legend className="flex items-center gap-2.5 text-sm font-bold text-gray-900 pb-3 border-b border-gray-100 w-full">
            <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
            </div>
            Location Details
          </legend>

          {/* Province & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Province <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.state}
                onValueChange={(val) => {
                  setFormData({ ...formData, state: val, city: '' });
                  setDistrict('');
                }}
              >
                <SelectTrigger className="h-12 bg-white border-gray-200 focus:ring-2 focus:ring-blue-100 rounded-xl">
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-100 shadow-xl rounded-xl max-h-[280px]">
                  {Object.keys(nepalLocations).map((prov) => (
                    <SelectItem key={prov} value={prov} className="cursor-pointer rounded-lg my-0.5">
                      {prov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">District</Label>
              <Select
                value={district}
                onValueChange={(val) => {
                  setDistrict(val);
                  setFormData({ ...formData, city: '' });
                }}
                disabled={!formData.state}
              >
                <SelectTrigger className="h-12 bg-white border-gray-200 focus:ring-2 focus:ring-blue-100 rounded-xl disabled:opacity-50">
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-100 shadow-xl rounded-xl max-h-[280px]">
                  {districts.map((dist) => (
                    <SelectItem key={dist} value={dist} className="cursor-pointer rounded-lg my-0.5">
                      {dist}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              City / Municipality <span className="text-red-500">*</span>
            </Label>
            {availableCities.length > 0 ? (
              <Select
                value={formData.city}
                onValueChange={(val) => updateField('city', val)}
                disabled={!district}
              >
                <SelectTrigger className="h-12 bg-white border-gray-200 focus:ring-2 focus:ring-blue-100 rounded-xl disabled:opacity-50">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-100 shadow-xl rounded-xl max-h-[280px]">
                  {availableCities.map((city: string) => (
                    <SelectItem key={city} value={city} className="cursor-pointer rounded-lg my-0.5">
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="e.g. Kathmandu Metro"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl"
              />
            )}
          </div>

          {/* Street + Postal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. New Baneshwor, Marg 1"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Postal Code</Label>
              <Input
                placeholder="e.g. 44600"
                value={formData.postal_code}
                onChange={(e) => updateField('postal_code', e.target.value)}
                className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl"
              />
            </div>
          </div>

          {/* Default Checkbox */}
          <label className="flex items-center gap-3 pt-1 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => updateField('is_default', e.target.checked)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-gray-300 bg-white transition-all checked:border-blue-600 checked:bg-blue-600 hover:border-blue-400"
              />
              <Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-3 h-3 peer-checked:opacity-100 opacity-0" />
            </div>
            <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900">Set as default address</span>
          </label>
        </fieldset>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-12 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex-[2] h-12 bg-[var(--colour-fsP1)] hover:bg-blue-700 text-white shadow-lg shadow-blue-200 font-bold rounded-xl"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              isEdit ? 'Update Address' : 'Save Address'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
