'use client';

import { Loader2, Plus } from 'lucide-react';
import AddressCard from './AddressCard';
import type { ShippingAddressData } from './AddressSectionUi';

interface AddressListProps {
  addresses: ShippingAddressData[];
  selectedId?: number;
  isLoading: boolean;
  onSelect: (address: ShippingAddressData) => void;
  onDelete: (id: number) => void;
  onAddNew: () => void;
}

export default function AddressList({
  addresses,
  selectedId,
  isLoading,
  onSelect,
  onDelete,
  onAddNew,
}: AddressListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-12 h-12 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        <span className="text-gray-600 text-sm font-bold">Loading addresses...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[30vh]">
      {/* Address Count Header */}
      {addresses.length > 0 && (
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            {addresses.length} Saved {addresses.length === 1 ? 'Address' : 'Addresses'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto pr-1">
        {addresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            isSelected={selectedId === address.id}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}

        {/* Add New Card */}
        <button
          onClick={onAddNew}
          className="flex flex-col items-center justify-center gap-3 min-h-[180px] p-6 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-all duration-200 group bg-white"
        >
          <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 group-hover:border-gray-900 group-hover:bg-gray-900 group-hover:text-white flex items-center justify-center transition-all">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold">Add New Address</span>
        </button>
      </div>

      {addresses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm font-semibold">No saved addresses yet</p>
        </div>
      )}
    </div>
  );
}
