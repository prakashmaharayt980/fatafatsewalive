'use client'

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, User, CreditCard, ArrowLeft, Send, Trash } from 'lucide-react';
import { useContextEmi } from '@/app/emi/_components/emiContext';

import SignaturePad from './SignaturePad';
import { Checkbox } from '@/components/ui/checkbox';

interface EmiData {
  tenure: number;
  downPayment: number;
  financeAmount: number;
  paymentpermonth: number;
}

interface RenderReviewProps {
  emiData: EmiData;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, docType: string) => void;
  handleFileDelete: (docType: string, isGranter?: boolean) => void;
  handleBack: () => void;
  onSubmit: () => void;
  previews: { [key: string]: string };
  localCreditCardInfo?: {
    creditCardNumber: string;
    cardHolderName: string;
    expiryDate: string;
    cardLimit: string | number;
  };
  // New props for state isolation
  userInfo: any;
  bankinfo: any;
  granterPersonalDetails: any;
  hasCreditCard: string;
  selectedVariant?: string;
  onSignatureChange: (file: File | null) => void;
}

interface InfoRow {
  label: string;
  value: string | number;
}

// ─── Info Card ────────────────────────────────────────────────────────────────
const InfoCard = ({
  title,
  icon: Icon,
  rows,
}: {
  title: string;
  icon: React.ElementType;
  rows: InfoRow[];
}) => (
  <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
    <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
      <h3 className="text-[13px] font-medium text-gray-800">{title}</h3>
    </div>
    <div>
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex items-center justify-between border-b border-gray-50 px-4 py-2.5 last:border-0"
        >
          <span className="text-xs text-gray-500">{row.label}</span>
          <span className="ml-4 max-w-[55%] text-right text-xs font-medium text-gray-800">
            {row.value || '—'}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const RenderReview: React.FC<RenderReviewProps> = ({
  emiData,
  handleFileChange,
  handleFileDelete,
  handleBack,
  onSubmit,
  previews,
  localCreditCardInfo,
  userInfo,
  bankinfo,
  granterPersonalDetails,
  hasCreditCard,
  selectedVariant,
  onSignatureChange
}) => {
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  const personalRows: InfoRow[] = [
    { label: 'Full name', value: userInfo.name },
    { label: 'Email', value: userInfo.email },
    { label: 'Phone', value: userInfo.phone },
    { label: 'Date of birth', value: userInfo.dob },
    { label: 'National ID', value: userInfo.nationalID },
    { label: 'Gender', value: userInfo.gender },
    { label: 'Marriage status', value: userInfo.marriageStatus },
    { label: 'Address', value: userInfo.address },
    ...(selectedVariant
      ? [{ label: 'Selected color', value: selectedVariant }]
      : []),
  ];

  const creditCardRows: InfoRow[] =
    hasCreditCard === 'yes' && localCreditCardInfo
      ? [
        { label: 'Card number', value: `**** **** **** ${localCreditCardInfo.creditCardNumber?.slice(-4) || 'XXXX'}` },
        { label: 'Card holder', value: localCreditCardInfo.cardHolderName || '—' },
        { label: 'Card provider', value: bankinfo.bankname || '—' },
        { label: 'Expiry date', value: localCreditCardInfo.expiryDate || '—' },
        { label: 'Credit limit', value: `Rs. ${localCreditCardInfo.cardLimit || '0'}` },
      ]
      : [];

  const bankRows: InfoRow[] =
    hasCreditCard === 'make'
      ? [
        { label: 'Account holder', value: userInfo.name },
        { label: 'Bank name', value: bankinfo.bankname },
        { label: 'Account number', value: bankinfo.accountNumber },
        { label: 'Monthly salary', value: `Rs. ${bankinfo.salaryAmount}` },
      ]
      : [];

  const guarantorRows: InfoRow[] =
    hasCreditCard === 'no'
      ? [
        { label: 'Full name', value: granterPersonalDetails.name },
        { label: 'Phone', value: granterPersonalDetails.phone },
        { label: 'Citizenship no.', value: granterPersonalDetails.nationalID },
        { label: 'Gender', value: granterPersonalDetails.gender },
        { label: 'Marriage status', value: granterPersonalDetails.marriageStatus },
        { label: 'Address', value: granterPersonalDetails.address },
      ]
      : [];

  const financialTitle =
    hasCreditCard === 'yes' ? 'Credit card details' :
      hasCreditCard === 'make' ? 'Bank account details' :
        'Guarantor information';

  const financialRows =
    hasCreditCard === 'yes' ? creditCardRows :
      hasCreditCard === 'make' ? bankRows :
        guarantorRows;

  const financialIcon =
    hasCreditCard === 'yes' ? CreditCard :
      hasCreditCard === 'make' ? CreditCard :
        User;

  const docKeys = Object.keys(previews).filter(k => k !== 'userSignature');
  const isSignatureComplete = !!previews['userSignature'];

  return (
    <div className="space-y-4 pb-6">

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <InfoCard title="Personal information" icon={User} rows={personalRows} />
        {financialRows.length > 0 && (
          <InfoCard title={financialTitle} icon={financialIcon} rows={financialRows} />
        )}
      </div>

      {/* Uploaded documents */}
      {docKeys.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
            <FileText className="h-4 w-4 shrink-0 text-gray-400" />
            <h3 className="text-[13px] font-medium text-gray-800">Uploaded documents</h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-4">
            {Object.entries(previews)
              .filter(([key]) => key !== 'userSignature')
              .map(([key, url]) => (
                <div
                  key={key}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                >
                  <Image src={url} alt={key} fill className="object-cover" />
                  <div className="absolute inset-x-0 bottom-0 border-t border-gray-100 bg-white px-2 py-1.5">
                    <p className="truncate text-[10px] font-medium text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Terms and Conditions & Signature Pad */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
            <FileText className="h-4 w-4 shrink-0 text-gray-400" />
            <h3 className="text-[13px] font-medium text-gray-800">Consent & Signature</h3>
          </div>
          
          <div className="p-4 space-y-6">
            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
               <Checkbox 
                id="terms" 
                checked={termsAccepted} 
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5"
               />
               <label htmlFor="terms" className="text-xs leading-relaxed text-gray-700 cursor-pointer">
                  I confirm that all the information provided is accurate and I agree to the 
                  <span className="mx-1 font-bold text-(--colour-fsP2) hover:underline cursor-pointer">
                    Terms & Conditions
                  </span> 
                  of Fatafatsewa EMI Service.
               </label>
            </div>

            {/* Signature Pad */}
            <div className="max-w-md">
                <SignaturePad 
                    onSignatureChange={onSignatureChange} 
                    existingSignature={previews['userSignature']} 
                />
            </div>

            {!isSignatureComplete && (
               <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 border border-orange-100 text-orange-700">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-[11px] font-medium">Please provide your signature to proceed.</p>
               </div>
            )}
          </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="h-10 gap-2 rounded-lg border-gray-200 px-5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!termsAccepted || !isSignatureComplete}
          className={`h-10 gap-2 rounded-lg px-6 text-[13px] font-medium text-white transition-all active:scale-[0.98] ${
            termsAccepted && isSignatureComplete 
            ? 'bg-(--colour-fsP2) hover:bg-(--colour-fsP1)' 
            : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Confirm & submit
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default RenderReview;