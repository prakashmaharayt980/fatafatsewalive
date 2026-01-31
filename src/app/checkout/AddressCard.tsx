'use client';

import { MapPin, Trash2, Phone, Home, Briefcase, Building, User } from 'lucide-react';
import type { ShippingAddressData } from './AddressSectionUi';

interface AddressCardProps {
  address: ShippingAddressData;
  isSelected?: boolean;
  onSelect?: (address: ShippingAddressData) => void;
  onDelete?: (id: number) => void;
  compact?: boolean;
}

const labelIcons: Record<string, typeof Home> = {
  Home,
  Office: Briefcase,
  Work: Building,
};

export default function AddressCard({ address, isSelected, onSelect, onDelete, compact }: AddressCardProps) {
  const LabelIcon = labelIcons[address.label || ''] || MapPin;

  return (
    <div
      onClick={() => onSelect?.(address)}
      className={`relative group rounded-xl border transition-all duration-200 ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        isSelected
          ? 'border-gray-900 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
          : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
      }`}
    >
      <div className={compact ? 'p-4' : 'p-5'}>
        {/* Top Row: Label + Badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${
              isSelected
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 bg-gray-50 text-gray-600'
            }`}>
              <LabelIcon className="w-[18px] h-[18px]" />
            </div>
            <span className={`text-sm font-bold tracking-wide uppercase ${
              isSelected ? 'text-gray-900' : 'text-gray-700'
            }`}>
              {address.label || 'Address'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {address.is_default && (
              <span className="text-[10px] border border-gray-300 text-gray-700 font-bold px-2.5 py-1 rounded uppercase tracking-wider bg-white">
                Default
              </span>
            )}
            {isSelected && (
              <span className="text-[10px] border border-gray-900 text-gray-900 font-bold px-2.5 py-1 rounded uppercase tracking-wider bg-white">
                Selected
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-4" />

        {/* Name */}
        <div className="flex items-center gap-2 mb-2">
          <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <p className="text-sm font-bold text-gray-900">{address.full_name}</p>
        </div>

        {/* Address Lines */}
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {address.address}, {address.city}
            {address.state && `, ${address.state}`}
          </p>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-700">{address.phone}</span>
        </div>
      </div>

      {/* Delete Button */}
      {onDelete && address.id && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(address.id!);
          }}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center border border-gray-200 bg-white text-gray-400 hover:text-red-600 hover:border-red-300 hover:shadow-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
