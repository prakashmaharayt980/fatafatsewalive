'use client';

// ========================
// Checkout Step Constants
// ========================

export const CHECKOUT_STEPS = {
    ADDRESS: 0,
    RECIPIENT: 1,
    PAYMENT: 2,
} as const;

export type CheckoutStep = (typeof CHECKOUT_STEPS)[keyof typeof CHECKOUT_STEPS];

export const STEP_LABELS: Record<CheckoutStep, string> = {
    [CHECKOUT_STEPS.ADDRESS]: 'Shipping',
    [CHECKOUT_STEPS.RECIPIENT]: 'Recipient',
    [CHECKOUT_STEPS.PAYMENT]: 'Payment',
};

// ========================
// Recipient Types
// ========================

export const RECIPIENT_TYPES = {
    SELF: 'self',
    GIFT: 'gift',
    ANONYMOUS: 'anonymous',
} as const;

export type RecipientType = (typeof RECIPIENT_TYPES)[keyof typeof RECIPIENT_TYPES];

export interface RecipientInfo {
    type: RecipientType;
    name?: string;
    phone?: string;
    message?: string;
    recipientPhoto?: File;
    senderPhoto?: File;
}

// ========================
// Delivery Partner Types
// ========================

export interface DeliveryPartner {
    id: number;
    name: string;
    img: any;
    description: string;
    estimatedDays?: string;
    requiresUserId?: boolean;
}

export interface DeliverySelection {
    partner: DeliveryPartner | null;
    userId?: string; // User ID for partner delivery tracking
    instructions?: string; // Special delivery instructions
}

// ========================
// Address Types (re-export for convenience)
// ========================

export interface ShippingAddress {
    id?: number;
    contact_info?: {
        first_name: string;
        last_name: string;
        contact_number: string;
    };
    geo?: {
        lat: number | null;
        lng: number | null;
    };
    address: {
        label: string | null;
        landmark: string;
        city: string;
        district: string;
        province: string;
        country: string;
        is_default: boolean;
        house_no?: string;
        // Optional helpers for UI
        postal_code?: string;
        state?: string;
    };
}

// ========================
// Complete Checkout State
// ========================

export interface CheckoutState {
    currentStep: CheckoutStep;
    address: ShippingAddress | null;
    recipient: RecipientInfo;
    delivery: DeliverySelection;
    paymentMethod: string;
    deliveryDate: string;
    promoCode: string;
    appliedPromo: { code: string; discount: number } | null;
    locationPermissionGranted: boolean;
}

// ========================
// Initial State
// ========================

export const initialCheckoutState: CheckoutState = {
    currentStep: CHECKOUT_STEPS.ADDRESS,
    address: null,
    recipient: {
        type: RECIPIENT_TYPES.SELF,
    },
    delivery: {
        partner: null,
        userId: '',
    },
    paymentMethod: '',
    deliveryDate: '',
    promoCode: '',
    appliedPromo: null,
    locationPermissionGranted: false,
};

// ========================
// Step Validation Helpers
// ========================

export function isStepComplete(step: CheckoutStep, state: CheckoutState): boolean {
    switch (step) {
        case CHECKOUT_STEPS.ADDRESS:
            return state.address !== null && !!state.address.id;
        case CHECKOUT_STEPS.RECIPIENT:
            if (state.recipient.type === RECIPIENT_TYPES.SELF) {
                return !!state.recipient.phone?.trim() && state.recipient.phone.length >= 10;
            }
            if (state.recipient.type === RECIPIENT_TYPES.GIFT) {
                return !!state.recipient.name && !!state.recipient.phone;
            }
            return true; // Anonymous is always valid

        case CHECKOUT_STEPS.PAYMENT:
            return state.paymentMethod !== '';
        default:
            return false;
    }
}

export function canProceedToStep(targetStep: CheckoutStep, state: CheckoutState): boolean {
    // Can always go back
    if (targetStep < state.currentStep) return true;

    // Check all previous steps are complete
    for (let step = 0; step < targetStep; step++) {
        if (!isStepComplete(step as CheckoutStep, state)) {
            return false;
        }
    }
    return true;
}
