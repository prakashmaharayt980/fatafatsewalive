'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    CheckCircle2, FileText, Banknote, ArrowRight, Home, HandCoins,
    Clock, Info,
} from 'lucide-react';
import { useEmiStore } from '../../_components/emiContext';
import { useShallow } from 'zustand/react/shallow';

const labelMap: Record<string, string> = {
    creditCard: 'Credit Card EMI',
    downPayment: 'Guarantor EMI',
    makeCard: 'Bank Card EMI',
};

const nextStepsMap: Record<string, { title: string; steps: string[] }> = {
    creditCard: {
        title: 'What happens next with your Credit Card EMI',
        steps: [
            'Our team will verify your credit card details with the issuing bank.',
            'You will receive a call within 1–2 business days to confirm eligibility.',
            'Once approved, the product will be scheduled for delivery.',
            'Your first EMI will be charged on the next billing cycle of your card.',
        ],
    },
    makeCard: {
        title: 'What happens next with your Bank Card EMI',
        steps: [
            'Our team will review your bank account and salary documents.',
            'A bank card application will be initiated on your behalf.',
            'You will be contacted within 1–2 business days for verification.',
            'After card issuance, your EMI plan will be activated and product dispatched.',
        ],
    },
    downPayment: {
        title: 'What happens next with your Guarantor EMI',
        steps: [
            'Our team will contact your guarantor for identity verification.',
            'Please inform your guarantor to keep citizenship documents ready.',
            'You will receive a confirmation call within 1–2 business days.',
            'Once the guarantor is verified, your EMI will be finalized and product dispatched.',
        ],
    },
};

function Row({ label, value }: { label: string; value: string | number | undefined | null }) {
    if (!value && value !== 0) return null;
    return (
        <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
            <span className="text-xs text-gray-400 shrink-0">{label}</span>
            <span className="text-xs font-medium text-gray-800 text-right">{value}</span>
        </div>
    );
}

export default function EmiSuccessClient() {
    const { lastEmiSubmission } = useEmiStore(useShallow((s) => ({
        lastEmiSubmission: s.lastEmiSubmission,
    })));

    if (!lastEmiSubmission) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
                <div className="border border-gray-200 rounded-2xl p-8 text-center max-w-sm w-full">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-lg font-bold text-gray-900 mb-2">No Application Found</h2>
                    <p className="text-sm text-gray-500 mb-6">We couldn&apos;t retrieve your application details.</p>
                    <Link href="/" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-(--colour-fsP2) text-white font-semibold rounded-xl text-sm w-full">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    const { response, product, userInfo, bankInfo, creditCardInfo, granterInfo, emiData, selectedOption, selectedVariant, submittedAt } = lastEmiSubmission;

    const appId = response?.id ?? response?.data?.id ?? response?.application_id ?? null;
    const formattedDate = new Date(submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const emiTypeLabel = labelMap[selectedOption] ?? selectedOption;
    const productImage = product?.thumb?.url ?? product?.images?.[0]?.url ?? null;
    const productPrice = product?.price?.current ?? 0;
    const nextSteps = nextStepsMap[selectedOption];

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-4">
            <div className="max-w-2xl mx-auto space-y-4">

                {/* Success header */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-5 flex items-start gap-4">
                        <div className="w-11 h-11 rounded-full border-2 border-green-500 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-6 h-6 text-green-500" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base font-bold text-gray-900 leading-tight">
                                Application Submitted Successfully
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Your Emi Plan Request has been received.
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                {appId && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--colour-fsP2) bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                                        <FileText className="w-3 h-3" />
                                        App #{appId}
                                    </span>
                                )}
                                <span className="text-xs text-gray-400">{formattedDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product + EMI summary */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Application Summary</span>
                    </div>

                    {product && (
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                            <div className="w-14 h-14 shrink-0 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                                {productImage ? (
                                    <Image src={productImage} alt={product.name ?? 'Product'} width={56} height={56} className="w-full h-full object-contain p-1" />
                                ) : (
                                    <HandCoins className="w-6 h-6 text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{product.name}</p>
                                {selectedVariant && (
                                    <span className="text-[11px] text-gray-400 font-medium">{selectedVariant}</span>
                                )}
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-[11px] text-gray-400">Price</p>
                                <p className="text-sm font-bold text-(--colour-fsP2)">Rs {Number(productPrice).toLocaleString()}</p>
                            </div>
                        </div>
                    )}

                    {/* EMI numbers */}
                    <div className="px-4 py-3 space-y-0">
                        <Row label="Down Payment" value={`Rs ${Number(emiData.downPayment).toLocaleString()}`} />
                        <Row label="Finance Amount" value={`Rs ${Number(emiData.financeAmount).toLocaleString()}`} />
                        <Row label="Tenure" value={`${emiData.tenure} months`} />
                        <Row label="EMI Method" value={emiTypeLabel} />
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 bg-(--colour-fsP2)/5 border-t border-(--colour-fsP2)/10">
                        <div className="flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-(--colour-fsP2)" />
                            <span className="text-xs font-bold text-gray-700">Monthly Payment</span>
                        </div>
                        <span className="text-lg font-black text-(--colour-fsP2)">
                            Rs {Number(emiData.paymentpermonth).toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Applicant + type-specific details */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Details</span>
                    </div>
                    <div className="px-4 py-3 space-y-0 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-800 mb-2">{userInfo?.name ?? '—'}</p>
                        <Row label="Phone" value={userInfo?.phone} />
                        <Row label="Email" value={userInfo?.email} />
                        <Row label="Address" value={userInfo?.address} />
                    </div>

                    {/* Credit card details */}
                    {selectedOption === 'creditCard' && creditCardInfo && (
                        <div className="px-4 py-3 space-y-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Credit Card Info</p>
                            <Row label="Card Holder" value={creditCardInfo.cardHolderName} />
                            <Row label="Card Number" value={`**** **** **** ${String(creditCardInfo.creditCardNumber ?? '').slice(-4) || 'XXXX'}`} />
                            <Row label="Bank" value={bankInfo?.bankname} />
                            <Row label="Expiry" value={creditCardInfo.expiryDate} />
                            <Row label="Credit Limit" value={creditCardInfo.cardLimit ? `Rs ${Number(creditCardInfo.cardLimit).toLocaleString()}` : null} />
                        </div>
                    )}

                    {/* Bank account details */}
                    {selectedOption === 'makeCard' && bankInfo && (
                        <div className="px-4 py-3 space-y-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bank Account Info</p>
                            <Row label="Bank Name" value={bankInfo.bankname} />
                            <Row label="Branch" value={bankInfo.bankbranch} />
                            <Row label="Account Number" value={bankInfo.accountNumber} />
                            <Row label="Monthly Salary" value={bankInfo.salaryAmount ? `Rs ${Number(bankInfo.salaryAmount).toLocaleString()}` : null} />
                        </div>
                    )}

                    {/* Guarantor details */}
                    {selectedOption === 'downPayment' && granterInfo && (
                        <div className="px-4 py-3 space-y-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Guarantor Info</p>
                            <Row label="Full Name" value={granterInfo.name} />
                            <Row label="Phone" value={granterInfo.phone} />
                            <Row label="Citizenship No." value={granterInfo.nationalID} />
                            <Row label="Gender" value={granterInfo.gender} />
                            <Row label="Address" value={granterInfo.address} />
                        </div>
                    )}
                </div>

                {/* Next steps */}
                {nextSteps && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                            <Clock className="w-4 h-4 text-(--colour-fsP2)" />
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">What Happens Next</span>
                        </div>
                        <div className="px-4 py-3 space-y-3">
                            <p className="text-xs font-semibold text-gray-700">{nextSteps.title}</p>
                            {nextSteps.steps.map((step, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <span className="w-5 h-5 rounded-full bg-(--colour-fsP2)/10 border border-(--colour-fsP2)/20 text-(--colour-fsP2) text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                        {i + 1}
                                    </span>
                                    <p className="text-xs text-gray-600 leading-relaxed">{step}</p>
                                </div>
                            ))}
                            <div className="flex items-start gap-2 pt-1 border-t border-gray-100 mt-1">
                                <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-amber-600">
                                    Keep your phone reachable. Our team will call you on <span className="font-semibold">{userInfo?.phone ?? 'your registered number'}</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                        href="/profile?tab=emi"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-(--colour-fsP2) text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-all"
                    >
                        <FileText className="w-4 h-4" />
                        View My Applications
                        <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </Link>
                    <Link
                        href="/"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-all"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>

            </div>
        </div>
    );
}
