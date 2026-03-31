'use client'

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, User, CreditCard, ArrowLeft, Send, Check } from 'lucide-react';
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
    <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50/80 border-b border-gray-100">
      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white border border-gray-200 shadow-sm">
        <Icon className="h-3.5 w-3.5 text-gray-500" />
      </div>
      <h3 className="text-[13px] font-semibold text-gray-700">{title}</h3>
    </div>
    <div>
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
        >
          <span className="text-xs text-gray-400">{row.label}</span>
          <span className="ml-4 max-w-[55%] text-right text-xs font-medium text-gray-700">
            {row.value || '—'}
          </span>
        </div>
      ))}
    </div>
  </div>
);

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
  onSignatureChange,
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
    ...(selectedVariant ? [{ label: 'Selected color', value: selectedVariant }] : []),
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

  const financialIcon = hasCreditCard === 'no' ? User : CreditCard;

  const docKeys = Object.keys(previews).filter(k => k !== 'userSignature');
  const isSignatureComplete = !!previews['userSignature'];
  const canSubmit = termsAccepted && isSignatureComplete;

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
          <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50/80 border-b border-gray-100">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white border border-gray-200 shadow-sm">
              <FileText className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <h3 className="text-[13px] font-semibold text-gray-700">Uploaded documents</h3>
            <span className="ml-auto text-[11px] text-gray-400 font-medium">{docKeys.length} file{docKeys.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-4">
            {Object.entries(previews)
              .filter(([key]) => key !== 'userSignature')
              .map(([key, url]) => (
                <div
                  key={key}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Image src={url} alt={key} fill className="object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent px-2 py-2">
                    <p className="truncate text-[10px] font-medium text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </div>
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center opacity-90">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Consent & Signature */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50/80 border-b border-gray-100">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white border border-gray-200 shadow-sm">
            <FileText className="h-3.5 w-3.5 text-gray-500" />
          </div>
          <h3 className="text-[13px] font-semibold text-gray-700">Consent & Signature</h3>
        </div>

        <div className="p-4 space-y-5">
          <label
            htmlFor="terms"
            className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors"
          >
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              className="mt-0.5 shrink-0"
            />
            <span className="text-xs leading-relaxed text-gray-600">
              I confirm all information provided is accurate and I agree to the{' '}
              <span className="font-semibold text-(--colour-fsP2) hover:underline">
                Terms & Conditions
              </span>{' '}
              of Fatafatsewa EMI Service.
            </span>
          </label>

          <div className="max-w-md">
            <SignaturePad
              onSignatureChange={onSignatureChange}
              existingSignature={previews['userSignature']}
            />
          </div>

          {!isSignatureComplete && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <p className="text-[11px] font-medium">Provide your signature to continue.</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={handleBack}
          className="h-10 gap-2 rounded-xl border-gray-200 px-5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`h-10 gap-2 rounded-xl px-6 text-[13px] font-semibold text-white transition-all active:scale-[0.98] shadow-sm ${
            canSubmit
              ? 'bg-(--colour-fsP2) hover:bg-(--colour-fsP1)'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          Confirm & Submit
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default RenderReview;
