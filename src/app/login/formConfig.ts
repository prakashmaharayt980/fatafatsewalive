
import { ReactNode } from 'react';


import { Mail, Lock, User, Phone, KeyRound, Home } from 'lucide-react';
export interface FormField {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  icon: any;
  required?: boolean;
  showPasswordToggle?: boolean;
  passwordField?: string;
  helperText?: string;
  extra?: ReactNode;
  maxLength?: number;
}

// export const sectionFields = {
//   login: [
//     { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', icon: Mail, required: true },
//     {
//       id: 'password',
//       label: 'Password',
//       type: 'password',
//       placeholder: '••••••••',
//       icon: Lock,
//       showPasswordToggle: true,
//       required: true,
//       passwordField: 'loginPassword',
//     },
//   ] as FormField[],
//   register: [
//     { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', icon: User, required: true },
//     { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', icon: Mail, required: true },
//     {
//       id: 'password',
//       label: 'Password',
//       type: 'password',
//       placeholder: '••••••••',
//       icon: Lock,
//       showPasswordToggle: true,
//       required: true,
//       passwordField: 'registerPassword',
//     },
//     {
//       id: 'password_confirmation',
//       label: 'Confirm Password',
//       type: 'password',
//       placeholder: '••••••••',
//       icon: Lock,
//       showPasswordToggle: true,
//       required: true,
//       passwordField: 'registerConfirmPassword',
//     },
//     { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(123) 456-7890', icon: Phone },
//     { id: 'address', label: 'Address', type: 'text', placeholder: '123 Main St, City', icon: Home },
//   ] as FormField[],
//   forgot: [
//     {
//       id: 'email',
//       label: 'Email Address',
//       type: 'email',
//       placeholder: 'you@example.com',
//       icon: Mail,
//       required: true,
//       helperText: "We'll send you a verification code",
//     },
//   ] as FormField[],
//   verify: [
//     {
//       id: 'otpCode',
//       label: 'Verification Code',
//       type: 'text',
//       placeholder: '123456',
//       icon: Key,
//       required: true,
//       helperText: 'Enter the code sent to your email',
//     },
//     {
//       id: 'newPassword',
//       label: 'New Password',
//       type: 'password',
//       placeholder: '••••••••',
//       icon: Lock,
//       showPasswordToggle: true,
//       required: true,
//       passwordField: 'verifyNewPassword',
//     },
//     {
//       id: 'confirmNewPassword',
//       label: 'Confirm New Password',
//       type: 'password',
//       placeholder: '••••••••',
//       icon: Lock,
//       showPasswordToggle: true,
//       required: true,
//       passwordField: 'verifyConfirmNewPassword',
//     },
//   ] as FormField[],
//   socialComplete: [
//     { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(123) 456-7890', icon: Phone, required: true },
//     { id: 'address', label: 'Address', type: 'text', placeholder: '123 Main St, City', icon: Home, required: true },
//     {
//       id: 'password',
//       label: 'Set Password',
//       type: 'password',
//       placeholder: '••••••••',
//       icon: Lock,
//       showPasswordToggle: true,
//       required: true,
//       passwordField: 'socialPassword',
//     },
//     {
//       id: 'confirmPassword',
//       label: 'Confirm Password',
//       type: 'password',
//       placeholder: '••••••••',
//       icon: Lock,
//       showPasswordToggle: true,
//       required: true,
//       passwordField: 'socialConfirmPassword',
//     },
//   ] as FormField[],
// };




export const sectionFields = {
  login: [
    {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'ram.sharma@gmail.com',
      icon: Mail,
      required: true,
      showPasswordToggle: false,
    },
    {
      id: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      icon: Lock,
      required: true,
      showPasswordToggle: true,
      passwordField: 'loginPassword',
    },
  ] as FormField[],
  register: [
    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Jivan shrestha', icon: User, required: true },
    {
      id: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '98XXXXXXXX',
      icon: Phone,
      required: true,
      showPasswordToggle: false,
      maxLength: 10,
    },
    {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'jivan.shrestha@gmail.com',
      icon: Mail,
      required: true,
      showPasswordToggle: false,
    },
    {
      id: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Create a strong password',
      icon: Lock,
      required: true,
      showPasswordToggle: true,
      passwordField: 'registerPassword',
    },
    {
      id: 'password_confirmation',
      label: 'Confirm Password',
      type: 'password',
      placeholder: 'Confirm your password',
      icon: Lock,
      required: true,
      showPasswordToggle: true,
      passwordField: 'confirmPassword',
    },
    { id: 'address', label: 'Address', type: 'text', placeholder: 'sitaplia,kathmandu', icon: Home, required: true },
  ] as FormField[],
  forgot: [
    {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'ram.sharma@gmail.com',
      icon: Mail,
      required: true,
      showPasswordToggle: false,
      helperText: 'We will send a verification code to this email',
    },
  ] as FormField[],
  verify: [
    {
      id: 'otpCode',
      label: 'Verification Code',
      type: 'text',
      placeholder: '6-digit code',
      icon: KeyRound,
      required: true,
      showPasswordToggle: false,
      helperText: 'Enter the 6-digit code sent to your email',
    },
    {
      id: 'newPassword',
      label: 'New Password',
      type: 'password',
      placeholder: 'Enter new password',
      icon: Lock,
      required: true,
      showPasswordToggle: true,
      passwordField: 'newPassword',
    },
    {
      id: 'confirmNewPassword',
      label: 'Confirm New Password',
      type: 'password',
      placeholder: 'Confirm new password',
      icon: Lock,
      required: true,
      showPasswordToggle: true,
      passwordField: 'confirmNewPassword',
    },
  ] as FormField[],
};
