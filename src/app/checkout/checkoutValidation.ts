'use client';

import * as yup from 'yup';
import { CheckoutState, RECIPIENT_TYPES } from './checkoutTypes';

const shippingAddressSchema = yup.object({
    id: yup.number().nullable().optional(),
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    postal_code: yup.string().nullable().optional(),
    country: yup.string().required(),
    is_default: yup.boolean().required(),
}).nullable().required('Shipping address is required');

const recipientSchema = yup.object({
    type: yup.string().required(),
    name: yup.string().when('type', {
        is: RECIPIENT_TYPES.GIFT,
        then: (schema) => schema.required('Recipient name is required for gifts'),
        otherwise: (schema) => schema.nullable().optional(),
    }),
    phone: yup.string().when('type', {
        is: (type: string) => type === RECIPIENT_TYPES.GIFT || type === RECIPIENT_TYPES.SELF,
        then: (schema) => schema.required('Contact number is required').min(10, 'Phone number must be at least 10 digits'),
        otherwise: (schema) => schema.nullable().optional(),
    }),
    message: yup.string().nullable().optional(),
});

const paymentSchema = yup.string().required('Please select a payment method');

export const checkoutReviewSchema = yup.object({
    address: shippingAddressSchema,
    recipient: recipientSchema,
    paymentMethod: paymentSchema,
});
