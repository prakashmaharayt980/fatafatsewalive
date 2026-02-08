'use client';

// ========================
// Checkout Step Constants
// ========================

export const CHECKOUT_STEPS = {
    ADDRESS: 0,
    RECIPIENT: 1,
    DELIVERY: 2,
    PAYMENT: 3,
    REVIEW: 4,
} as const;

export type CheckoutStep = (typeof CHECKOUT_STEPS)[keyof typeof CHECKOUT_STEPS];

export const STEP_LABELS: Record<CheckoutStep, string> = {
    [CHECKOUT_STEPS.ADDRESS]: 'Shipping',
    [CHECKOUT_STEPS.RECIPIENT]: 'Recipient',
    [CHECKOUT_STEPS.DELIVERY]: 'Delivery',
    [CHECKOUT_STEPS.PAYMENT]: 'Payment',
    [CHECKOUT_STEPS.REVIEW]: 'Order Review',
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
    message?: string; // Gift message
    recipientPhoto?: string; // URL or base64
    senderPhoto?: string; // URL or base64
}

// ========================
// Delivery Partner Types
// ========================

export interface DeliveryPartner {
    id: number;
    name: string;
    img: string;
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

    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    label?: string;
    lat?: number;
    lng?: number;
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
            if (state.recipient.type === RECIPIENT_TYPES.SELF) return true;
            if (state.recipient.type === RECIPIENT_TYPES.GIFT) {
                return !!state.recipient.name && !!state.recipient.phone;
            }
            return true; // Anonymous is always valid
        case CHECKOUT_STEPS.DELIVERY:
            return state.delivery.partner !== null;
        case CHECKOUT_STEPS.PAYMENT:
            return state.paymentMethod !== '';
        case CHECKOUT_STEPS.REVIEW:
            return true; // Always "complete" once reached
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
