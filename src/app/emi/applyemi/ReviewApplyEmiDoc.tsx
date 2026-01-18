'use client'

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { useContextEmi } from '../emiContext';

interface RenderReviewProps {
  emiData: any;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, docType: string) => void;
  handleFileDelete: (docType: string, isGranter?: boolean) => void;
  handleBack: () => void;
  onSubmit: () => void;
  previews: { [key: string]: string };
}

// Interface for data structure
interface InfoItemData {
  label: string;
  value: string | number;
}

// Component for rendering
const InfoItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 border-dashed">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="text-sm font-bold text-gray-900 text-right">{value}</dd>
  </div>
);

const RenderReview: React.FC<RenderReviewProps> = ({
  emiData,
  handleFileChange,
  handleFileDelete,
  handleBack,
  onSubmit,
  previews,
}) => {
  const { emiContextInfo, setEmiContextInfo } = useContextEmi();
  const { userInfo, bankinfo, granterPersonalDetails, files, hasCreditCard, emiCalculation } = emiContextInfo;

  // Define personal information fields
  const personalInfoFields: InfoItemData[] = [
    { label: 'Full Name', value: userInfo.name },
    { label: 'Email Address', value: userInfo.email },
    { label: 'Phone Number', value: userInfo.phone },
    { label: 'Date of Birth', value: userInfo.dob },
    { label: 'National ID', value: userInfo.nationalID },
    { label: 'Gender', value: userInfo.gender },
    { label: 'Marriage Status', value: userInfo.marriageStatus },
    { label: 'Salary Amount', value: `Rs. ${bankinfo.salaryAmount}` },
    { label: 'Address', value: userInfo.address },
  ];

  // Define credit card information fields
  const creditCardFields: InfoItemData[] = hasCreditCard === 'yes' ? [
    { label: 'Card Number', value: `**** **** **** ${bankinfo.creditCardNumber?.slice(-4)}` },
    { label: 'Card Holder Name', value: bankinfo.cardHolderName },
    { label: 'Card Provider', value: bankinfo.bankname },
    { label: 'Expiry Date', value: bankinfo.expiryDate },
    { label: 'Credit Limit', value: `Rs. ${bankinfo.cardLimit}` },
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

  // Define document fields
  const documentFields = [
    { docType: 'front', label: 'Citizenship Front', isBankStatement: false },
    { docType: 'back', label: 'Citizenship Back', isBankStatement: false },
    { docType: 'bankStatement', label: 'Bank Statement', isBankStatement: true },
  ];

  // Define guarantor document fields
  const guarantorDocumentFields = hasCreditCard === 'no' ? [
    { docType: 'front', label: 'Guarantor Citizenship Front' },
    { docType: 'back', label: 'Guarantor Citizenship Back' },
  ] : [];

  // Define EMI calculation fields
  const emiFields: InfoItemData[] = [
    { label: 'Down Payment', value: `Rs. ${emiData.downPayment || 0}` },
    { label: 'Duration', value: `${emiData.tenure} months` },
    { label: 'Finance Amount', value: `Rs. ${emiData.financeAmount}` },
    { label: 'Product Amount', value: `Rs. ${emiData.principal}` },
  ];

  const handlesignture = () => {
    setEmiContextInfo((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        userSignature: null
      },
    }));
  };

  // Product Details
  const product = emiContextInfo.product;

  return (
    <div className="bg-gray-50 py-6 min-h-screen h-full">
      <div className="max-w-4xl mx-auto px-4">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Review Your Application</h1>
          <p className="text-gray-500 text-sm mt-1">Please verify all details before submitting.</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">

          {/* Product Info Card */}
          {product && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-800 mb-4">Product Details</h2>
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                  <Image src={product.image?.full || ''} alt={product.name} fill className="object-contain p-1" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-blue-600 font-bold">Rs. {product.price?.toLocaleString()}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>EMI: Rs. {emiData.paymentpermonth?.toLocaleString()}/mo</span>
                    <span>Duration: {emiData.tenure} months</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Personal Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-800 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {personalInfoFields.map((field, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-500 text-sm">{field.label}</span>
                  <span className="text-gray-900 text-sm font-medium">{field.value || '-'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Info Card */}
          {(hasCreditCard === 'yes' || hasCreditCard === 'make') && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-800 mb-4">
                {hasCreditCard === 'yes' ? 'Credit Card Details' : 'Bank Account Details'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {(hasCreditCard === 'yes' ? creditCardFields : bankInfoFields).map((field, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-500 text-sm">{field.label}</span>
                    <span className="text-gray-900 text-sm font-medium">{field.value || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guarantor Info Card */}
          {hasCreditCard === 'no' && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-800 mb-4">Guarantor Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {guarantorFields.map((field, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-500 text-sm">{field.label}</span>
                    <span className="text-gray-900 text-sm font-medium">{field.value || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMI Details Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-800 mb-4">EMI Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Down Payment</p>
                <p className="font-bold text-gray-900">Rs. {emiData.downPayment?.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Loan Amount</p>
                <p className="font-bold text-gray-900">Rs. {emiData.financeAmount?.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Duration</p>
                <p className="font-bold text-gray-900">{emiData.tenure} Months</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 uppercase">Monthly EMI</p>
                <p className="font-bold text-blue-600">Rs. {emiData.paymentpermonth?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Documents Card */}
          {Object.keys(previews).length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-800 mb-4">Uploaded Documents</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(previews).map(([key, url]) => (
                  <div key={key} className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <Image src={url} alt={key} fill className="object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                      <p className="text-[10px] text-white truncate capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature Upload Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-800 mb-2">Signature (Optional)</h2>
            <p className="text-xs text-gray-500 mb-4">Upload your signature to confirm agreement.</p>
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="signature-upload"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'userSignature')}
                className="hidden"
              />
              {previews['userSignature'] ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-40 h-20 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <Image src={previews['userSignature']} alt="Signature" fill className="object-contain p-2" />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleFileDelete('userSignature')}>
                    <Trash className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <label htmlFor="signature-upload" className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
                  Click to upload signature
                </label>
              )}
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <p>I hereby declare that all information provided is true and accurate. I authorize Fatafatsewa to verify these details.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button variant="outline" onClick={handleBack} className="flex-1 sm:flex-none">
              ← Edit Details
            </Button>
            <Button onClick={onSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              Submit Application
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RenderReview;