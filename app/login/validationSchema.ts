import { Dispatch } from 'react';
import * as yup from 'yup';

const emailSchema = yup.string().email('Invalid email address').required('Email is required');
const passwordSchema = yup.string().min(8, 'Password must be at least 8 characters').required('Password is required');
const nameSchema = yup.string().min(2, 'Name must be at least 2 characters').matches(/^[a-zA-Z]+( [a-zA-Z]+)*$/, "Please enter a valid name (e.g., Kamal Mahara)").required('Name is required');
const phoneSchema = yup.string().matches(/^[0-9\-\+\(\)\s]*$/, 'Invalid phone number').max(10, 'Phone number must be at most 10 characters').required('Phone number is required');
const addressSchema = yup.string().min(5, 'Address must be at least 5 characters').required('Address is required');

export const loginSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = yup.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  password_confirmation: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  phone: phoneSchema,
  address: addressSchema,
});

export const forgotSchema = yup.object({
  email: emailSchema,
});

export const verifySchema = yup.object({
  otpCode: yup.string()
    .required('Verification code is required')
    .matches(/^\d{6}$/, 'Verification code must be 6 digits'),
  newPassword: passwordSchema,
  confirmNewPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
  email: yup.string().optional(),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type ForgotFormData = yup.InferType<typeof forgotSchema>;
export type VerifyFormData = yup.InferType<typeof verifySchema>;




export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
}


export interface AuthContextType {

  authState: {
    user: User | null;
    access_token: string | null;
    refresh_token: string | null;
  };
  login: (data: AuthContextType['authState']) => void;
  logout: () => void;
  loginDailogOpen: boolean;
  setloginDailogOpen: Dispatch<React.SetStateAction<AuthContextType['loginDailogOpen']>>;
}
