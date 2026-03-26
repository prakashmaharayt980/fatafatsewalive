import React from 'react';
import { 
    User, Mail, Phone, Hash, Calendar, MapPin, 
    CreditCard as CreditCardIcon, HandCoins, Building2, DollarSign 
} from 'lucide-react';

export interface FieldConfig {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    maxLength?: number;
    options?: string[];
    icon: React.ReactNode;
    className?: string;
    step?: number;
    disabled?: boolean;
}

export const PERSONAL_DETAILS_FIELDS: FieldConfig[] = [
    { label: 'User Name', name: 'name', icon: <User className="w-5 h-5" />, placeholder: 'Enter user name', maxLength: 50 },
    { label: 'Email', name: 'email', icon: <Mail className="w-5 h-5" />, placeholder: 'Enter email', type: 'email' },
    { label: 'Gender', name: 'gender', icon: <User className="w-5 h-5" />, type: 'select', options: ['Male', 'Female', 'Other'] },
    { label: 'Marriage Status', name: 'marriageStatus', icon: <User className="w-5 h-5" />, type: 'select', options: ['Single', 'Married'] },
    { label: 'Partner Name', name: 'userpartnerName', icon: <User className="w-5 h-5" /> },
    { label: 'Phone Number', name: 'phone', icon: <Phone className="w-5 h-5" />, placeholder: 'Enter phone number', type: 'tel' },
    { label: 'National ID Number', name: 'nationalID', icon: <Hash className="w-5 h-5" />, placeholder: 'Enter national ID number' },
    { label: 'Date of Birth (BS)', name: 'dob_bs', icon: <Calendar className="w-5 h-5" />, placeholder: 'YYYY-MM-DD' },
    { label: 'Date of Birth (AD)', name: 'dob', icon: <Calendar className="w-5 h-5" />, type: 'date' },
    { label: 'Address', name: 'address', icon: <MapPin className="w-5 h-5" />, placeholder: 'Enter full address', maxLength: 100, className: 'md:col-span-2' },
];

export const CREDIT_CARD_FIELDS: FieldConfig[] = [
    { label: 'Bank Name', name: 'bankname', icon: <CreditCardIcon className="w-5 h-5" />, type: 'select' },
    { label: 'Card Holder Name', name: 'cardHolderName', icon: <User className="w-5 h-5" />, placeholder: 'Card Holder Name' },
    { label: 'Card Number', name: 'creditCardNumber', icon: <CreditCardIcon className="w-5 h-5" />, placeholder: 'XXXX XXXX XXXX XXXX', maxLength: 19 },
    { label: 'Expiry Date', name: 'expiryDate', icon: <Calendar className="w-5 h-5" />, placeholder: 'MM/YY', maxLength: 5 },
    { label: 'Card Limit', name: 'cardLimit', icon: <HandCoins className="w-5 h-5" />, placeholder: 'Card Limit', type: 'number' },
];

export const BANK_DETAILS_FIELDS: FieldConfig[] = [
    { label: 'Bank Name', name: 'bankname', icon: <Building2 className="w-5 h-5" />, type: 'select' },
    { label: 'Account Number', name: 'accountNumber', icon: <Hash className="w-5 h-5" />, placeholder: 'Enter account number' },
    { label: 'Bank Branch', name: 'bankbranch', icon: <Building2 className="w-5 h-5" />, placeholder: 'Enter Bank Branch' },
    { label: 'Salary Amount', name: 'salaryAmount', icon: <DollarSign className="w-5 h-5" />, placeholder: 'Enter salary amount', type: 'number' },
];

export const GUARANTOR_FIELDS: FieldConfig[] = [
    { label: 'Guarantors Full Name', name: 'name', icon: <User className="w-5 h-5" />, placeholder: 'Enter Guarantor name' },
    { label: 'Phone Number', name: 'phone', icon: <Phone className="w-5 h-5" />, placeholder: 'Enter Phone Number', type: 'tel' },
    { label: 'Gender', name: 'gender', icon: <User className="w-5 h-5" />, type: 'select', options: ['Male', 'Female'] },
    { label: 'Marriage Status', name: 'marriageStatus', icon: <User className="w-5 h-5" />, type: 'select', options: ['Single', 'Married'] },
    { label: 'Partner Name', name: 'userpartnerName', icon: <User className="w-5 h-5" /> },
    { label: 'Citizenship Number', name: 'nationalID', icon: <Hash className="w-5 h-5" />, placeholder: 'Enter citizenship number' },
    { label: 'Date of Birth (BS)', name: 'dob_bs', icon: <Calendar className="w-5 h-5" />, placeholder: 'YYYY-MM-DD' },
    { label: 'Date of Birth (AD)', name: 'dob', icon: <Calendar className="w-5 h-5" />, type: 'date' },
    { label: 'Address', name: 'address', icon: <MapPin className="w-5 h-5" />, placeholder: 'Enter Address', maxLength: 100, className: 'md:col-span-2' },
];

export const EMI_CONDITION_FIELDS: FieldConfig[] = [
    { label: 'Down Payment Amount', name: 'downPayment', icon: <DollarSign className="w-5 h-5" />, type: 'number', placeholder: 'Enter amount' },
    { label: 'Bank', name: 'bankname', icon: <Building2 className="w-5 h-5" />, type: 'select', placeholder: 'Select Bank' },
    { label: 'Duration (months)', name: 'duration', icon: <Calendar className="w-5 h-5" />, type: 'select', placeholder: 'Select Duration' },
    { label: 'Finance Amount', name: 'financeAmount', icon: <DollarSign className="w-5 h-5" />, disabled: true },
];

export const EMI_CONDITION_CREDIT_FIELDS: FieldConfig[] = [
    { label: 'Down Payment Amount', name: 'downPayment', icon: <DollarSign className="w-5 h-5" />, type: 'text', placeholder: 'Enter amount' },
    { label: 'Duration (months)', name: 'duration', icon: <Calendar className="w-5 h-5" />, type: 'select', placeholder: 'Select Duration' },
    { label: 'Finance Amount', name: 'financeAmount', icon: <DollarSign className="w-5 h-5" />, disabled: true },
];
