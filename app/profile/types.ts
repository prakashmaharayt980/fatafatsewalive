'use client';

export interface ProfileUser {
    id: number;
    name: string;
    email: string;
    contact_number: string;
    email_verified_at: string | null;
    referred_by: string | null;
    referral_code: string | null;
    reward_points: number;
    avatar_image: {
        thumb: string;
        full: string;
    } | null;
    address: string | null;
    date_of_birth: string | null;
    created_at: string;
}

export interface ProfileFormData {
    name: string;
    phone: string;
    address: string;
    date_of_birth: string;
}

// ─── Order Types ──────────────────────────────────────────────────────────────

export interface OrderItem {
    id: number | string;
    product_id?: number;
    quantity: number;
    price: number;
    unit_price?: number;
    product: {
        id: number;
        name: string;
        slug: string;
        sku?: string;
        image?: { thumb: string; full: string };
    };
    name?: string;
    pack?: string;
    qty?: number;
    image?: string;
}

export interface Order {
    id: number | string;
    invoice_number: string;
    status: number | string;
    order_status: string;
    order_total: number;
    shipping_cost: number;
    payment_type: string;
    items: OrderItem[];
    created_at: string;
    notes?: string;
    shipping_address?: ShippingAddress;
    user?: UserInfo;
    processed_at?: string;
    shipped_at?: string;
    delivered_at?: string;
    cancelled_at?: string;
    cancel_reason?: string;
    date?: string;
    total?: number;
    items_count?: number;
    payment_method?: string;
    tax?: number;
}

export interface UserInfo {
    name: string;
    email: string;
    phone: string;
}

export interface PreOrderProduct {
    product_id: number;
    quantity: number;
    is_preorder: boolean;
    product_name?: string;
    product_image?: string;
    selected_color?: string;
    slug?: string;
    category?: string;
    price?: number;
}

export interface PreOrder {
    id: number | string;
    invoice_number?: string;
    full_name?: string;
    products: PreOrderProduct[];
    shipping_address_id?: number;
    shipping_address?: ShippingAddress;
    total_amount: number;
    order_total: number;
    payment_type: string;
    status: 'upcoming' | 'paid' | 'history' | 'processing' | 'cancelled';
    expected_date?: string;
    created_at?: string;
    note?: string;
}

export interface EmiPerson {
    name?: string;
    email?: string;
    gender?: string;
    marriageStatus?: string;
    userpartnerName?: string;
    phone?: string;
    nationalID?: string;
    dob_bs?: string;
    dob?: string;
    address?: string;
}

export interface EmiBankInfo {
    bankname?: string;
    accountNumber?: string;
    bankbranch?: string;
    salaryAmount?: string | number;
}

export interface EmiCalculation {
    duration?: string | number;
    downPayment?: string | number;
    financeAmount?: string | number;
    paymentpermonth?: string | number;
}

export interface EmiCardInfo {
    cardHolderName?: string;
    creditCardNumber?: string;
    expiryDate?: string;
    cardLimit?: string | number;
}

export interface EmiFormData {
    personalInfo?: EmiPerson;
    bankInfo?: EmiBankInfo;
    emiCalculation?: EmiCalculation;
    creditCard?: EmiCardInfo;
    granterInfo?: EmiPerson;
}

export interface EmiProduct {
    id: number;
    varient?: string;
    quntioy: number;
    price: number;
    name?: string;
    image?: string;
    slug?: string;
}

export interface EmiOrder {
    id: number | string;
    applicationtype: 'craditcard' | 'with_cittizen' | 'with_new_card_Apply' | string;
    product: EmiProduct;
    formdata: EmiFormData;
    status: 'pending' | 'processing' | 'approved' | 'rejected' | 'active' | string;
    created_at: string;
    paid_installments?: number;
    total_installments?: number;
    document_note?: string;
    bank_name?: string;
}

export interface ShippingAddress {
    name: string;
    phone: string;
    address: string;
    city: string;
    label?: string;
    district?: string;
    province?: string;
    country?: string;
    is_default?: boolean;
}

export interface KYCData {
    status: 'pending' | 'verified' | 'rejected' | 'none';
    id_type: string;
    id_number: string;
    issued_date: string;
    expiry_date: string;
    files: string[];
}

export interface TrackingData {
    order_id: string;
    status: string;
    updates: {
        date: string;
        status: string;
        description: string;
    }[];
}

export type ProfileTab =
    | 'profile'
    | 'orders'
    | 'addresses'
    | 'kyc'
    | 'tracking'
    | 'pre-orders'
    | 'emi'
    | 'returns'
    | 'exchange'
    | 'repair'
    | 'security'
    | 'notifications';

export interface ProfileState {
    activeTab: ProfileTab;
    isMobileMenuOpen: boolean;
    showLogoutDialog: boolean;
}
