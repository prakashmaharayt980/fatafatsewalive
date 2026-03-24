import { logoImg } from '@/app/CommonVue/Image'
import type { StaticImageData } from 'next/image'

// ── Types ────────────────────────────────────────────────────

export interface RepairCategory {
    id: string
    label: string
    icon: string
    description: string
    priceRange: [number, number]
}

export interface RepairFormData {
    brand: string
    productId: string | null
    productName: string
    productImage: string
    selectedRepairs: string[]
    issueDescription: string
    photos: File[]
    photoUrls: string[]
    pickupMethod: 'pickup' | 'dropoff' | ''
    dropoffLocationId: string | null
    fullName: string
    phone: string
    address: string
}

export interface PickupLocation {
    id: string
    name: string
    address: string
    city: string
    phone: string
    hours: string
    lat: number
    lng: number
}

export interface PickupPartner {
    id: string
    name: string
    logo: string | StaticImageData
    rating: number
    deliveryTime: string
}

export interface CrossSellItem {
    title: string
    description: string
    icon: string
    href: string
    color: string
}

export interface RepairServiceType {
    label: string
    icon: string
    description: string
}

// ── Repair Categories ────────────────────────────────────────

export const REPAIR_CATEGORIES: RepairCategory[] = [
    { id: 'screen', label: 'Screen Repair', icon: '📱', description: 'Cracked, scratched, or unresponsive display', priceRange: [2000, 15000] },
    { id: 'battery', label: 'Battery Replacement', icon: '🔋', description: 'Draining fast, swelling, or not charging', priceRange: [1500, 5000] },
    { id: 'charging', label: 'Charging Port', icon: '🔌', description: 'Loose connection, not charging, or slow charge', priceRange: [800, 3000] },
    { id: 'speaker', label: 'Speaker / Mic', icon: '🔊', description: 'No sound, distorted audio, or mic not working', priceRange: [1000, 4000] },
    { id: 'camera', label: 'Camera Repair', icon: '📸', description: 'Blurry photos, black screen, or autofocus issues', priceRange: [1500, 8000] },
    { id: 'water', label: 'Water Damage', icon: '💧', description: 'Liquid spill, submersion, or moisture damage', priceRange: [2000, 10000] },
    { id: 'software', label: 'Software Fix', icon: '⚙️', description: 'Stuck on logo, crashes, OS reinstall, virus removal', priceRange: [500, 2000] },
    { id: 'button', label: 'Button Repair', icon: '🔘', description: 'Power, volume, or home button not responding', priceRange: [800, 3000] },
    { id: 'backpanel', label: 'Back Panel', icon: '🛡️', description: 'Cracked or shattered back glass replacement', priceRange: [1500, 6000] },
    { id: 'other', label: 'Other Issue', icon: '🔧', description: 'Any other hardware or software problem', priceRange: [500, 15000] },
]

// ── Pickup Locations ─────────────────────────────────────────

export const PICKUP_LOCATIONS: PickupLocation[] = [
    {
        id: 'ktm-main',
        name: 'Fatafat Sewa - Main Office',
        address: 'Sitapaila Road-14, Kathmandu',
        city: 'Kathmandu',
        phone: '+977 9828757575',
        hours: 'Sun-Fri: 10 AM - 6 PM',
        lat: 27.7172,
        lng: 85.3240,
    },
    {
        id: 'ktm-naya',
        name: 'Fatafat Sewa - New Baneshwor',
        address: 'New Baneshwor, Kathmandu',
        city: 'Kathmandu',
        phone: '+977 9828757576',
        hours: 'Sun-Fri: 10 AM - 6 PM',
        lat: 27.6915,
        lng: 85.3420,
    },
    {
        id: 'ltp-main',
        name: 'Fatafat Sewa - Lalitpur',
        address: 'Pulchowk, Lalitpur',
        city: 'Lalitpur',
        phone: '+977 9828757577',
        hours: 'Sun-Fri: 10 AM - 5:30 PM',
        lat: 27.6785,
        lng: 85.3188,
    },
    {
        id: 'bkt-main',
        name: 'Fatafat Sewa - Bhaktapur',
        address: 'Suryabinayak, Bhaktapur',
        city: 'Bhaktapur',
        phone: '+977 9828757578',
        hours: 'Sun-Fri: 10 AM - 5 PM',
        lat: 27.6710,
        lng: 85.4298,
    },
]

// ── Pickup Partners ──────────────────────────────────────────

export const PICKUP_PARTNERS: PickupPartner[] = [
    { id: 'fs-direct', name: 'Fatafat Direct Pickup', logo: logoImg, rating: 4.8, deliveryTime: '24-48 hours' },
    { id: 'pathao', name: 'Pathao Courier', logo: logoImg, rating: 4.5, deliveryTime: '1-2 business days' },
]

// ── Repair Service Types ─────────────────────────────────────

export const REPAIR_SERVICES: RepairServiceType[] = [
    { label: 'Smartphones', icon: '📱', description: 'All brands including Apple, Samsung, Xiaomi, OnePlus, and more' },
    { label: 'Laptops', icon: '💻', description: 'MacBook, Dell, HP, Lenovo, ASUS — hardware & software repairs' },
    { label: 'Tablets', icon: '📟', description: 'iPad, Samsung Tab, and other tablets' },
]

// ── Cross-Sell Items ─────────────────────────────────────────

export const CROSS_SELL_ITEMS: CrossSellItem[] = [
    { title: 'Shop on EMI', description: 'Upgrade to a new device with easy monthly installments', icon: '💳', href: '/emi/shop', color: 'blue' },
    { title: 'Exchange Old Phone', description: 'Trade in your old phone and get instant credit', icon: '🔄', href: '/exchangeProducts', color: 'green' },
    { title: 'Device Insurance', description: 'Protect your device from accidental damage', icon: '🛡️', href: '#', color: 'purple' },
]

// ── Helper Functions ─────────────────────────────────────────

export function getRepairEstimate(selectedIds: string[]): { min: number; max: number } {
    let min = 0
    let max = 0
    for (const id of selectedIds) {
        const cat = REPAIR_CATEGORIES.find(c => c.id === id)
        if (cat) {
            min += cat.priceRange[0]
            max += cat.priceRange[1]
        }
    }
    return { min, max }
}

export function getRepairLabels(selectedIds: string[]): string[] {
    return selectedIds
        .map(id => REPAIR_CATEGORIES.find(c => c.id === id)?.label)
        .filter(Boolean) as string[]
}

export const initialRepairForm: RepairFormData = {
    brand: '',
    productId: null,
    productName: '',
    productImage: '',
    selectedRepairs: [],
    issueDescription: '',
    photos: [],
    photoUrls: [],
    pickupMethod: '',
    dropoffLocationId: null,
    fullName: '',
    phone: '',
    address: '',
}
