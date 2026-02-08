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
        is: RECIPIENT_TYPES.GIFT,
        then: (schema) => schema.required('Recipient phone is required for gifts'),
        otherwise: (schema) => schema.nullable().optional(),
    }),
    message: yup.string().nullable().optional(),
});

const deliverySchema = yup.object({
    partner: yup.object().shape({ // partner is an object or null
        id: yup.number().required(),
        name: yup.string().required(),
    }).nullable().required('Please select a delivery method'),
});

const paymentSchema = yup.string().required('Please select a payment method');

export const checkoutReviewSchema = yup.object({
    address: shippingAddressSchema,
    recipient: recipientSchema,
    delivery: deliverySchema,
    paymentMethod: paymentSchema,
});
