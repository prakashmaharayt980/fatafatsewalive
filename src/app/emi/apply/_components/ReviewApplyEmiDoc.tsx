'use client'

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash, FileText, CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';
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

// Interface for data structure
interface InfoItemData {
  label: string;
  value: string | number;
}

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

  // Define personal information fields
  const personalInfoFields: InfoItemData[] = [
    { label: 'Full Name', value: userInfo.name },
    { label: 'Email Address', value: userInfo.email },
    { label: 'Phone Number', value: userInfo.phone },
    { label: 'Date of Birth', value: userInfo.dob },
    { label: 'National ID', value: userInfo.nationalID },
    { label: 'Gender', value: userInfo.gender },
    { label: 'Marriage Status', value: userInfo.marriageStatus },
    { label: 'Address', value: userInfo.address },
  ];

  if (emiContextInfo.selectedVariant) {
    personalInfoFields.push({ label: 'Selected Color', value: emiContextInfo.selectedVariant });
  }

  // Define credit card information fields
  const creditCardFields: InfoItemData[] = (hasCreditCard === 'yes' && localCreditCardInfo) ? [
    { label: 'Card Number', value: `**** **** **** ${localCreditCardInfo.creditCardNumber?.slice(-4) || 'XXXX'}` },
    { label: 'Card Holder Name', value: localCreditCardInfo.cardHolderName || '-' },
    { label: 'Card Provider', value: bankinfo.bankname || '-' },
    { label: 'Expiry Date', value: localCreditCardInfo.expiryDate || '-' },
    { label: 'Credit Limit', value: `Rs. ${localCreditCardInfo.cardLimit || '0'}` },
  ] : [];

  // Define bank information fields
  const bankInfoFields: InfoItemData[] = hasCreditCard === 'make' ? [
    { label: 'Account Holder Name', value: userInfo.name },
    { label: 'Bank Name', value: bankinfo.bankname },
    { label: 'Account Number', value: bankinfo.accountNumber },
    { label: 'Salary Amount', value: `Rs. ${bankinfo.salaryAmount}` },
  ] : [];

  // Define guarantor information fields
  const guarantorFields: InfoItemData[] = hasCreditCard === 'no' ? [
    { label: 'Full Name', value: granterPersonalDetails.name },
    { label: 'Phone Number', value: granterPersonalDetails.phone },
    { label: 'Citizenship Number', value: granterPersonalDetails.nationalID },
    { label: 'Gender', value: granterPersonalDetails.gender },
    { label: 'Marriage Status', value: granterPersonalDetails.marriageStatus },
    { label: 'Address', value: granterPersonalDetails.address },
  ] : [];

  // Product Details
  const product = emiContextInfo.product;

  return (
    <div className="space-y-8 pb-8 animate-in fade-in duration-500  overflow-hidden">




      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
            <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-(--colour-fsP2)" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {personalInfoFields.map((field, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                <span className="text-gray-500 font-medium">{field.label}</span>
                <span className="text-gray-900 font-bold text-right">{field.value || '-'}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Financial / Guarantor Information */}
        {(hasCreditCard === 'yes' || hasCreditCard === 'make' || hasCreditCard === 'no') && (
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
              <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-(--colour-fsP2)" />
                {hasCreditCard === 'yes' ? 'Credit Card Details' : hasCreditCard === 'make' ? 'Bank Account Details' : 'Guarantor Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {(hasCreditCard === 'yes' ? creditCardFields : hasCreditCard === 'make' ? bankInfoFields : guarantorFields).map((field, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                  <span className="text-gray-500 font-medium">{field.label}</span>
                  <span className="text-gray-900 font-bold text-right">{field.value || '-'}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Documents Grid */}
      {Object.keys(previews).length > 0 && (
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
            <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-(--colour-fsP2)" />
              Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(previews).map(([key, url]) => (
                <div key={key} className="group relative aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all cursor-pointer">
                  <Image src={url} alt={key} fill className="object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6">
                    <p className="text-[11px] text-white font-semibold truncate capitalize leading-tight">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signature Section */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
          <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
            Signature Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col xl:flex-row gap-6 items-center">
            {previews['userSignature'] ? (
              <div className="relative group w-full xl:w-auto">
                <div className="w-full xl:w-64 aspect-[2/1] bg-white rounded-xl border-2 border-dashed border-(--colour-fsP2) overflow-hidden relative flex items-center justify-center">
                  <Image src={previews['userSignature']} alt="Signature" fill className="object-contain p-4" />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleFileDelete('userSignature')}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="w-full xl:w-64 shrink-0">
                <input
                  type="file"
                  id="signature-upload"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'userSignature')}
                  className="hidden"
                />
                <label
                  htmlFor="signature-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all bg-gray-50/30 group"
                >
                  <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-(--colour-fsP2)" />
                  </div>
                  <p className="text-sm font-bold text-gray-700">Click to Upload Signature</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </label>
              </div>
            )}
            <div className="flex-1 text-sm text-gray-500 bg-blue-50/50 p-4 rounded-xl border border-blue-50">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p>By uploading your signature, you acknowledge that you have read and agreed to the <span className="text-(--colour-fsP2) font-semibold cursor-pointer hover:underline">Terms and Conditions</span> of Fatafatsewa EMI service.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 mt-4 border-t border-gray-100">
        <Button variant="outline" onClick={handleBack} className="gap-2 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 h-12 px-6 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onSubmit} className="bg-(--colour-fsP2) hover:bg-(--colour-fsP1) text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 gap-2">
          Confirm & Submit Application <Send className="w-4 h-4" />
        </Button>
      </div>

    </div>
  );
};

export default RenderReview;