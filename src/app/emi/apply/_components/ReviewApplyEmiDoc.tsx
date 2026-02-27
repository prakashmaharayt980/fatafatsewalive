'use client'

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, CheckCircle2, ArrowLeft, Send, Trash } from 'lucide-react';
import { useContextEmi } from '@/app/emi/_components/emiContext';

interface RenderReviewProps {
  emiData: any;
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
}

interface InfoRow {
  label: string;
  value: string | number;
}

// ─── Info Card ────────────────────────────────────────────────────────────────
const InfoCard = ({ title, rows }: { title: string; rows: InfoRow[] }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/20 flex items-center gap-2">
      <CheckCircle2 className="w-4 h-4 text-(--colour-fsP2) shrink-0" />
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
    </div>
    <div className="divide-y divide-gray-50">
      {rows.map((row, i) => (
        <div key={i} className={`flex justify-between items-center text-xs px-4 py-2.5 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
          <span className="text-gray-500 font-medium">{row.label}</span>
          <span className="text-gray-900 font-bold text-right ml-4">{row.value || '—'}</span>
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
}) => {
  const { emiContextInfo } = useContextEmi();
  const { userInfo, bankinfo, granterPersonalDetails, hasCreditCard } = emiContextInfo;

  const personalRows: InfoRow[] = [
    { label: 'Full Name', value: userInfo.name },
    { label: 'Email', value: userInfo.email },
    { label: 'Phone', value: userInfo.phone },
    { label: 'Date of Birth', value: userInfo.dob },
    { label: 'National ID', value: userInfo.nationalID },
    { label: 'Gender', value: userInfo.gender },
    { label: 'Marriage Status', value: userInfo.marriageStatus },
    { label: 'Address', value: userInfo.address },
    ...(emiContextInfo.selectedVariant ? [{ label: 'Selected Color', value: emiContextInfo.selectedVariant }] : []),
  ];

  const creditCardRows: InfoRow[] = (hasCreditCard === 'yes' && localCreditCardInfo) ? [
    { label: 'Card Number', value: `**** **** **** ${localCreditCardInfo.creditCardNumber?.slice(-4) || 'XXXX'}` },
    { label: 'Card Holder', value: localCreditCardInfo.cardHolderName || '—' },
    { label: 'Card Provider', value: bankinfo.bankname || '—' },
    { label: 'Expiry Date', value: localCreditCardInfo.expiryDate || '—' },
    { label: 'Credit Limit', value: `Rs. ${localCreditCardInfo.cardLimit || '0'}` },
  ] : [];

  const bankRows: InfoRow[] = hasCreditCard === 'make' ? [
    { label: 'Account Holder', value: userInfo.name },
    { label: 'Bank Name', value: bankinfo.bankname },
    { label: 'Account Number', value: bankinfo.accountNumber },
    { label: 'Monthly Salary', value: `Rs. ${bankinfo.salaryAmount}` },
  ] : [];

  const guarantorRows: InfoRow[] = hasCreditCard === 'no' ? [
    { label: 'Full Name', value: granterPersonalDetails.name },
    { label: 'Phone', value: granterPersonalDetails.phone },
    { label: 'Citizenship No.', value: granterPersonalDetails.nationalID },
    { label: 'Gender', value: granterPersonalDetails.gender },
    { label: 'Marriage Status', value: granterPersonalDetails.marriageStatus },
    { label: 'Address', value: granterPersonalDetails.address },
  ] : [];

  const financialTitle =
    hasCreditCard === 'yes' ? 'Credit Card Details' :
      hasCreditCard === 'make' ? 'Bank Account Details' :
        'Guarantor Information';

  const financialRows =
    hasCreditCard === 'yes' ? creditCardRows :
      hasCreditCard === 'make' ? bankRows :
        guarantorRows;

  return (
    <div className="space-y-5 pb-6 animate-in fade-in duration-300">

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <InfoCard title="Personal Information" rows={personalRows} />
        {financialRows.length > 0 && (
          <InfoCard title={financialTitle} rows={financialRows} />
        )}
      </div>

      {/* Uploaded Documents */}
      {Object.keys(previews).filter(k => k !== 'userSignature').length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/20 flex items-center gap-2">
            <FileText className="w-4 h-4 text-(--colour-fsP2) shrink-0" />
            <h3 className="text-sm font-bold text-gray-800">Uploaded Documents</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(previews)
                .filter(([key]) => key !== 'userSignature')
                .map(([key, url]) => (
                  <div key={key} className="group relative aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all">
                    <Image src={url} alt={key} fill className="object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 pt-4">
                      <p className="text-[10px] text-white font-semibold truncate capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Signature Section — only for downPayment/makeCard paths */}
      {hasCreditCard !== 'yes' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/20">
            <h3 className="text-sm font-bold text-gray-800">Signature Verification</h3>
          </div>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {previews['userSignature'] ? (
                <div className="relative group shrink-0">
                  <div className="w-full sm:w-56 aspect-[2/1] bg-white rounded-xl border-2 border-dashed border-(--colour-fsP2) overflow-hidden relative flex items-center justify-center">
                    <Image src={previews['userSignature']} alt="Signature" fill className="object-contain p-3" />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-md p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleFileDelete('userSignature')}
                  >
                    <Trash className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-full sm:w-56 shrink-0">
                  <input type="file" id="sig-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'userSignature')} className="hidden" />
                  <label
                    htmlFor="sig-upload"
                    className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-(--colour-fsP2) hover:bg-blue-50/30 transition-all"
                  >
                    <FileText className="w-5 h-5 text-(--colour-fsP2) mb-1.5" />
                    <p className="text-xs font-bold text-gray-700">Upload Signature</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG up to 5MB</p>
                  </label>
                </div>
              )}

              <div className="flex-1 text-xs text-gray-500 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                  <p>
                    By uploading your signature, you confirm you have read and agreed to the{' '}
                    <span className="text-(--colour-fsP2) font-semibold cursor-pointer hover:underline">Terms and Conditions</span>{' '}
                    of Fatafatsewa EMI service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={handleBack}
          className="gap-2 rounded-xl h-11 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onSubmit}
          className="bg-(--colour-fsP2) hover:bg-(--colour-fsP1) text-white px-7 h-11 rounded-xl font-bold shadow-md shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 gap-2"
        >
          Confirm & Submit
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default RenderReview;