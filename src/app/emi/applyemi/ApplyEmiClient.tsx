'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import * as Yup from 'yup';
import { toast } from 'sonner'; // Assuming sonner or use-toast is available, else fallback to alert
import RemoteServices from '@/app/api/remoteservice';
import {
    personalDetailsSchema,
    creditCardSchema,
    bankDetailsSchema,
    emiConditionsSchema,
    emiConditionsCreditSchema,
} from './validationSchemas';
import creditcardicon from '../../../../public/svgfile/creditcardicon.svg';
import downpaymenticon from '../../../../public/svgfile/payementiconcash.svg';
import addcreditcard from '../../../../public/svgfile/creditcardplus.svg';
import { useContextEmi } from '../emiContext';
// import BuyerPersonalInfo from './BuyerPersonalInfo'; // Seems unused in original, logic was inline
import RenderReview from './ReviewApplyEmiDoc'
import ProgressBar from './ProgressBar';
import EmiProductDetails from './EmiProductDetails';
import DocumentUpload from './DocumentUpload';
import SignaturePad from './SignaturePad';
import { ArrowBigLeft, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { ProductDetails } from '@/app/types/ProductDetailsTypes';
import { useAuth } from '@/app/context/AuthContext';
import LoginAlertDialog from '@/components/auth/LoginAlertDialog';

interface ApplyEmiClientProps {
    initialProduct: ProductDetails | null;
}

interface FieldOption {
    label: string;
    name: string;
    value: string | number | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    placeholder?: string;
    maxLength?: number;
    svgicon?: string | React.ReactNode;
    extenduserinfo?: string;
    type?: string;
    options?: string[];
    step?: string;
    disabled?: boolean;
    helper?: string | null;
    maxvalue?: number;
}

// FormField component moved outside to prevent re-creation on every render
const FormField = React.memo(({ field, error }: { field: FieldOption, error?: string }) => (
    <div className={`space-y-1 ${field.extenduserinfo || ''}`}>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{field.label}</label>
        <div className="relative group">
            <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                {typeof field.svgicon === 'string' && (field.svgicon.endsWith('.svg') || field.svgicon.endsWith('.png')) ? (
                    <Image src={field.svgicon} alt="" width={18} height={18} className="opacity-60" />
                ) : (
                    field.svgicon
                )}
            </div>
            {field.type === 'select' ? (
                <select
                    name={field.name}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    className={`w-full bg-white/50 backdrop-blur-sm border ${error ? 'border-red-400' : 'border-gray-200'} text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent block pl-10 p-2.5 outline-none transition-all shadow-sm`}
                >
                    <option value="" disabled>Select {field.label}</option>
                    {field.options && field.options.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={field.type || 'text'}
                    name={field.name}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    autoComplete="off"
                    className={`w-full bg-white/50 backdrop-blur-sm border ${error ? 'border-red-400' : 'border-gray-200'} text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent block pl-10 p-2.5 outline-none transition-all shadow-sm placeholder:text-gray-400`}
                />
            )}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
));

FormField.displayName = 'FormField';

const ApplyEmiClient: React.FC<ApplyEmiClientProps> = ({ initialProduct }) => {
    const { setShowLoginAlert, authState } = useAuth();
    const user = authState?.user;
    const { emiContextInfo, setEmiContextInfo, AvailablebankProvider, emiCalculation } = useContextEmi();
    const [currentstep, setcurrentstep] = useState(0);
    const [previews, setPreviews] = useState<{ [key: string]: string }>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    // Use prop product or fallback to context (though we prefer prop)
    const product = initialProduct || emiContextInfo.product;
    const emiCalc = emiContextInfo.emiCalculation;

    // Sync prop product to context if needed, or just use it directly
    useEffect(() => {
        if (initialProduct && initialProduct.id !== emiContextInfo.product?.id) {
            // Optionally sync context if other components rely wildly on it
            setEmiContextInfo(prev => ({ ...prev, product: initialProduct }));
        }

        const bankParam = searchParams.get('bank');
        const tenureParam = searchParams.get('tenure');
        const downPaymentParam = searchParams.get('downPayment');
        const colorParam = searchParams.get('color') || searchParams.get('variant');

        if (colorParam) {
            setEmiContextInfo(prev => ({ ...prev, selectedVariant: colorParam }));
        }

        if (bankParam || tenureParam || downPaymentParam) {
            setEmiContextInfo(prev => ({
                ...prev,
                bankinfo: {
                    ...prev.bankinfo,
                    bankname: bankParam || prev.bankinfo.bankname
                },
                emiCalculation: {
                    ...prev.emiCalculation,
                    duration: tenureParam ? Number(tenureParam) : prev.emiCalculation.duration,
                    downPayment: downPaymentParam ? Number(downPaymentParam) : prev.emiCalculation.downPayment
                }
            }));
        }
    }, [initialProduct, searchParams, emiContextInfo.product?.id, setEmiContextInfo]);

    // Handle file previews
    useEffect(() => {
        const newPreviews: { [key: string]: string } = {};
        const files = emiContextInfo.files;
        ['citizenshipFile', 'granterDocument'].forEach((docGroup) => {
            const docFiles = files[docGroup as keyof typeof files];
            if (docFiles && typeof docFiles === 'object') {
                Object.keys(docFiles).forEach((key) => {
                    const file = (docFiles as unknown as Record<string, File | null>)[key];
                    if (file && file instanceof File) {
                        const previewKey = `${docGroup === 'granterDocument' ? 'granter' : 'citizenship'}-${key}`;
                        newPreviews[previewKey] = URL.createObjectURL(file);
                    }
                });
            }
        });
        // Handle standalone files
        if (files.bankStatement instanceof File) {
            newPreviews['bankStatement'] = URL.createObjectURL(files.bankStatement);
        }
        if (files.userSignature instanceof File) {
            newPreviews['userSignature'] = URL.createObjectURL(files.userSignature);
        }
        setPreviews(newPreviews);

        return () => {
            Object.values(newPreviews).forEach(URL.revokeObjectURL);
        };
    }, [emiContextInfo.files]);

    const getValidationSchema = (sectionKey: string, option: string) => {
        if (sectionKey === 'userInfo') return personalDetailsSchema();
        if (sectionKey === 'granterPersonalDetails') return personalDetailsSchema(true);
        if (sectionKey === 'bankinfo' && option === 'creditCard') return creditCardSchema;
        if (sectionKey === 'bankinfo') return bankDetailsSchema;

        // EMI Calculation Scoping
        if (sectionKey === 'emiCalculation') {
            if (option === 'creditCard') return emiConditionsCreditSchema(product?.price || 0);
            return emiConditionsSchema(product?.price || 0);
        }
        return Yup.object();
    };

    const validateFormSection = async (section: { sectionKey: string }, data: Record<string, unknown>) => {
        try {
            const schema = getValidationSchema(section.sectionKey, selectedOption);
            await schema.validate(data, { abortEarly: false });
            return {};
        } catch (validationError: unknown) {
            const errors: { [key: string]: string } = {};
            if (validationError instanceof Yup.ValidationError) {
                validationError.inner.forEach((error: Yup.ValidationError) => {
                    if (error.path) {
                        errors[error.path] = error.message;
                    }
                });
            }
            return errors;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, section: string) => {
        const { name, value } = e.target;
        setEmiContextInfo((prev) => ({
            ...prev,
            [section]: {
                ...(prev as unknown as Record<string, Record<string, unknown>>)[section],
                [name]: value,
            },
        }));
        // Clear any previous error for this field on typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleFileDelete = (docType: string, isGranter = false) => {
        setEmiContextInfo((prev) => {
            // Logic to cleanup previews handled by effect
            const fileKey = docType === 'bankStatement' ? 'bankStatement' : isGranter ? 'granterDocument' : 'citizenshipFile';
            return {
                ...prev,
                files: {
                    ...prev.files,
                    [fileKey]: {
                        ...(prev.files as unknown as Record<string, Record<string, File | null>>)[fileKey],
                        [docType]: null,
                    },
                },
            };
        });
    };

    // Simplified handlers without auto-formatting to prevent cursor jumping
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleInputChange(e, 'bankinfo');
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleInputChange(e, 'bankinfo');
    };



    const handleBankSelect = async (section: string, name: string, value: string) => {
        setEmiContextInfo((prev) => ({
            ...prev,
            [section]: {
                ...(prev as unknown as Record<string, Record<string, unknown>>)[section],
                [name]: value,
            },
            interestRate: AvailablebankProvider.find((b) => b.name === value)?.rate || 10,
        }));
        const currentOption = emiContextInfo.hasCreditCard === 'yes' ? 'creditCard' : emiContextInfo.hasCreditCard === 'make' ? 'makeCard' : 'downPayment';
        const schema = getValidationSchema(section, currentOption);
        try {
            await schema.validateAt(name, { [name]: value });
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Validation error';
            setErrors((prev) => ({ ...prev, [name]: errorMessage }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docType: string, isGranter = false) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (docType === 'userSignature') {
            setEmiContextInfo((prev) => ({
                ...prev,
                files: { ...prev.files, userSignature: file },
            }));
        } else if (docType === 'bankStatement') {
            setEmiContextInfo((prev) => ({
                ...prev,
                files: { ...prev.files, bankStatement: file },
            }));
        } else {
            setEmiContextInfo((prev) => ({
                ...prev,
                files: {
                    ...prev.files,
                    [isGranter ? 'granterDocument' : 'citizenshipFile']: {
                        ...(prev.files as unknown as Record<string, Record<string, File | null>>)[isGranter ? 'granterDocument' : 'citizenshipFile'],
                        [docType]: file,
                    },
                },
            }));
        }
    };

    const handleContinue = async () => {
        if (currentstep === 0) {
            setcurrentstep(1);
            return;
        }
        const currentSection = formSections[selectedOption as keyof typeof formSections]?.find((section) => section.step === currentstep);
        if (currentSection) {
            const data =
                currentSection.sectionKey === 'emiCalculation'
                    ? { ...emiContextInfo.emiCalculation, bankname: emiContextInfo.bankinfo.bankname }
                    : (emiContextInfo as unknown as Record<string, Record<string, unknown>>)[currentSection.sectionKey];

            // 1. Validate Form Fields
            const sectionErrors = await validateFormSection(currentSection, data);
            setErrors(sectionErrors);

            if (Object.keys(sectionErrors).length > 0) {
                // If form errors exist, stop here
                return;
            }

            // 2. Validate Files (if applicable for this step)
            // check based on selectedOption and currentStep
            const fileErrors: string[] = [];
            const files = emiContextInfo.files;

            if (selectedOption === 'downPayment') {
                if (currentstep === 1) { // User Info -> needs ppphoto, front, back
                    if (!files.citizenshipFile.ppphoto) fileErrors.push("Applicant Photo");
                    if (!files.citizenshipFile.front) fileErrors.push("Citizenship Front");
                    if (!files.citizenshipFile.back) fileErrors.push("Citizenship Back");
                } else if (currentstep === 2) { // Granter Info -> needs ppphoto, front, back
                    if (!files.granterDocument.ppphoto) fileErrors.push("Guarantor Photo");
                    if (!files.granterDocument.front) fileErrors.push("Guarantor Citizenship Front");
                    if (!files.granterDocument.back) fileErrors.push("Guarantor Citizenship Back");
                }
            } else if (selectedOption === 'makeCard') {
                if (currentstep === 1) { // User Info -> needs ppphoto, front, back
                    if (!files.citizenshipFile.ppphoto) fileErrors.push("Applicant Photo");
                    if (!files.citizenshipFile.front) fileErrors.push("Citizenship Front");
                    if (!files.citizenshipFile.back) fileErrors.push("Citizenship Back");
                } else if (currentstep === 2) { // Bank Info -> needs bankStatement
                    if (!files.bankStatement) fileErrors.push("Bank Statement");
                }
            }
            // Credit Card option has no file uploads in steps 1-3 usually (unless logic changes), so no check needed.
            // Wait, credit card step 1 is bankinfo, step 2 userinfo, step 3 emi. Original code didn't show uploads for credit card flow.

            if (fileErrors.length > 0) {
                toast.error(`Missing Documents`, {
                    description: (
                        <ul className="list-disc pl-4 mt-2 space-y-1">
                            {fileErrors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    ),
                    duration: 5000,
                });
                return;
            }

            // All good, proceed
            setcurrentstep((prev) => Math.min(prev + 1, 4));
        }
    };

    const handleBack = () => {
        setcurrentstep((prev) => Math.max(prev - 1, 0));
        setErrors({});
    };

    const handleSubmit = async () => {
        if (!product) {
            toast.error("Product not found. Cannot submit application.");
            return;
        }

        // 1. Check Login
        // We'll trust the user property from AuthContext
        // The LoginAlertDialog uses showLoginAlert state, so we just set that.
        // const { authState } = useAuth(); // Already got at top level

        if (!user) {
            setShowLoginAlert(true);
            return;
        }


        // 2. Check Variant Selection if product has variants
        const hasVariants = product.variants && product.variants.length > 0;
        // Logic: If has variants, user must have selected one. 
        // However, the current emiContextInfo doesn't explicitly store 'selectedVariant'. 
        // We need to add that state or derived it.
        // For now, let's assume we need to add a "Variant Selection" step if it's missing.
        // Or we block if not selected. 

        if (hasVariants && !emiContextInfo.selectedVariant && product.variants.length > 1) { // >1 to avoid forcing if only 1 default
            toast.error("Please select a product color/variant option.");
            // Maybe scroll to variant selector or open a drawer?
            return;
        }

        setIsSubmitting(true);
        try {
            // Use FormData to properly send files
            const formData = new FormData();
            const option = selectedOption;

            // Common Data
            formData.append('product_id', String(product.id));
            formData.append('product_price', String(product.price));
            formData.append('application_type', option);
            formData.append('userInfo', JSON.stringify(emiContextInfo.userInfo));
            formData.append('emiCalculation', JSON.stringify({
                ...emiContextInfo.emiCalculation,
                bank: emiContextInfo.bankinfo.bankname
            }));

            // Option specific data
            if (option === 'creditCard') {
                formData.append('bankinfo', JSON.stringify({
                    bankname: emiContextInfo.bankinfo.bankname,
                    creditCardNumber: emiContextInfo.bankinfo.creditCardNumber,
                    cardHolderName: emiContextInfo.bankinfo.cardHolderName,
                    expiryDate: emiContextInfo.bankinfo.expiryDate,
                    cardLimit: emiContextInfo.bankinfo.cardLimit
                }));
            } else if (option === 'makeCard') {
                formData.append('bankinfo', JSON.stringify({
                    bankname: emiContextInfo.bankinfo.bankname,
                    accountNumber: emiContextInfo.bankinfo.accountNumber,
                    bankbranch: emiContextInfo.bankinfo.bankbranch,
                    salaryAmount: emiContextInfo.bankinfo.salaryAmount
                }));
                // Add files
                const files = emiContextInfo.files;
                if (files.citizenshipFile.ppphoto) formData.append('citizenship_ppphoto', files.citizenshipFile.ppphoto);
                if (files.citizenshipFile.front) formData.append('citizenship_front', files.citizenshipFile.front);
                if (files.citizenshipFile.back) formData.append('citizenship_back', files.citizenshipFile.back);
                if (files.bankStatement) formData.append('bank_statement', files.bankStatement);
            } else if (option === 'downPayment') {
                formData.append('granterPersonalDetails', JSON.stringify(emiContextInfo.granterPersonalDetails));
                formData.append('bankinfo', JSON.stringify({
                    bankname: emiContextInfo.bankinfo.bankname
                }));
                // Add files - User documents
                const files = emiContextInfo.files;
                if (files.citizenshipFile.ppphoto) formData.append('citizenship_ppphoto', files.citizenshipFile.ppphoto);
                if (files.citizenshipFile.front) formData.append('citizenship_front', files.citizenshipFile.front);
                if (files.citizenshipFile.back) formData.append('citizenship_back', files.citizenshipFile.back);
                // Guarantor documents
                if (files.granterDocument.ppphoto) formData.append('granter_ppphoto', files.granterDocument.ppphoto);
                if (files.granterDocument.front) formData.append('granter_front', files.granterDocument.front);
                if (files.granterDocument.back) formData.append('granter_back', files.granterDocument.back);
                // Signature
                if (files.userSignature) formData.append('user_signature', files.userSignature);
            }

            const response = await RemoteServices.applyEmi(formData);

            if (response) {
                toast.success('Application Submitted Successfully!');
                router.push('/');
            }
        } catch (error: unknown) {
            console.error("Submission error:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error(`Failed to submit application: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOptionSelect = (option: string) => {
        setEmiContextInfo((prev) => ({
            ...prev,
            hasCreditCard: option === 'creditCard' ? 'yes' : option === 'makeCard' ? 'make' : 'no',
            emiCalculation: {
                ...prev.emiCalculation,
                downPayment: option === 'downPayment' ? 40 : prev.emiCalculation.downPayment,
            },
        }));
        setErrors({}); // Clear validation errors on mode switch
        setcurrentstep(1);
    };

    const tumerOptions = useMemo(() => {
        const tumer = AvailablebankProvider.find((bank) => bank.name === emiContextInfo.bankinfo.bankname)?.tenureOptions || [];
        return tumer;
    }, [emiContextInfo.bankinfo.bankname, AvailablebankProvider]);

    const emiData = useMemo(() => {
        if (!product) return { downPayment: 0, financeAmount: 0, tenure: 0, principal: 0, paymentpermonth: 0 };
        return emiCalculation(product.price || 0, emiCalc.duration, emiCalc.downPayment, emiContextInfo.bankinfo.bankname);
    }, [product, emiCalc.duration, emiCalc.downPayment, emiContextInfo.bankinfo.bankname, emiCalculation]);

    // Field Definitions (Reusing simplified versions for brevity in generation, copying structure)
    // ... (Abbrieviated for tool use, reusing logic from original file)
    // Note: I will paste the field definitions from the original file to ensure functionality.

    const bankOptions = useMemo(() => AvailablebankProvider.map((b) => b.name), [AvailablebankProvider]);

    // -- REUSING FIELDS FROM ORIGINAL FILE --
    const personalDetailsInfolist = [
        {
            label: 'User Name',
            name: 'name',
            value: emiContextInfo.userInfo.name,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            placeholder: 'Enter user name',
            maxLength: 50,
            svgicon: '/svgfile/menperson.svg',
            extenduserinfo: '',
        },
        {
            label: 'Email',
            name: 'email',
            value: emiContextInfo.userInfo.email,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            placeholder: 'Enter email',
            svgicon: '/svgfile/emailsvg.svg',
            extenduserinfo: '',
            type: 'email',
        },
        {
            label: 'Gender',
            name: 'gender',
            value: emiContextInfo.userInfo.gender,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            type: 'select',
            options: ['Male', 'Female', 'Other'],
            svgicon: emiContextInfo.userInfo.gender === 'Male' ? '/svgfile/menperson.svg' : '/svgfile/creditcardicon.svg',
            extenduserinfo: '',
        },
        {
            label: 'Marriage Status',
            name: 'marriageStatus',
            value: emiContextInfo.userInfo.marriageStatus,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            type: 'select',
            options: ['Single', 'Married'],
            svgicon: emiContextInfo.userInfo.gender === 'Male' ? '/svgfile/menperson.svg' : '/svgfile/creditcardicon.svg',
            extenduserinfo: '',
        },
        {
            label: emiContextInfo.userInfo.gender === 'Male' ? 'Wife Name' : 'Husband Name',
            name: 'userpartnerName',
            value: emiContextInfo.userInfo.userpartnerName,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            extenduserinfo: emiContextInfo.userInfo.marriageStatus === 'Single' ? 'hidden' : '',
            svgicon: emiContextInfo.userInfo.gender === 'Male' ? '/svgfile/menperson.svg' : '/svgfile/creditcardicon.svg',
        },
        {
            label: 'Phone Number',
            name: 'phone',
            value: emiContextInfo.userInfo.phone,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            placeholder: 'Enter phone number',
            svgicon: '/svgfile/phoneIcon.png',
            extenduserinfo: '',
            type: 'tel',
        },
        {
            label: 'National ID Number',
            name: 'nationalID',
            value: emiContextInfo.userInfo.nationalID,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            placeholder: 'Enter national ID number',
            svgicon: '/svgfile/idcardicon2.png',
            extenduserinfo: '',
        },
        {
            label: 'Address',
            name: 'address',
            value: emiContextInfo.userInfo.address,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            placeholder: 'Enter address',
            maxLength: 100,
            svgicon: '/svgfile/homeaddressicon.png',
            extenduserinfo: '',
        },
    ];

    const creditCardDetailsInfo = [
        {
            label: 'Bank Name',
            name: 'bankname',
            value: emiContextInfo.bankinfo.bankname,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleBankSelect('bankinfo', 'bankname', e.target.value),
            type: 'select',
            options: bankOptions,
            svgicon: '/svgfile/bank.svg',
            extenduserinfo: '',
        },
        {
            label: 'Card Holder Name',
            name: 'cardHolderName',
            value: emiContextInfo.bankinfo.cardHolderName,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'bankinfo'),
            placeholder: 'Card Holder Name',
            svgicon: '/svgfile/menperson.svg',
            extenduserinfo: '',
        },
        {
            label: 'Card Number',
            name: 'creditCardNumber',
            value: emiContextInfo.bankinfo.creditCardNumber,
            onChange: handleCardNumberChange,
            placeholder: '1234 5678 9012 3456',
            maxLength: 19,
            svgicon: '/svgfile/creditcardicon.svg',
            extenduserinfo: '',
        },
        {
            label: 'Expiry Date',
            name: 'expiryDate',
            value: emiContextInfo.bankinfo.expiryDate,
            onChange: handleExpiryChange,
            placeholder: 'MM/YY',
            maxLength: 5,
            svgicon: '/svgfile/creditcardicon.svg',
            extenduserinfo: '',
        },
        {
            label: 'Card Limit',
            name: 'cardLimit',
            value: emiContextInfo.bankinfo.cardLimit,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'bankinfo'),
            placeholder: 'Card Limit',
            svgicon: '/svgfile/creditcardicon.svg',
            extenduserinfo: '',
            type: 'number',
            step: "0.01"
        },
    ];

    // ... (Other field groups: bankdetailsInfo, granterPersonalDetails, EmiConditionFields, EmiConditionFieldCredit)
    // To save space and ensure correctness I will rely on the user to check/copy or assume standard fields.
    // Actually I must provide them.
    const bankdetailsInfo = [
        { label: 'Bank Name', name: 'bankname', value: emiContextInfo.bankinfo.bankname, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleBankSelect('bankinfo', 'bankname', e.target.value), type: 'select', options: bankOptions, svgicon: '/svgfile/bank.svg', extenduserinfo: '' },
        { label: 'Account Number', name: 'accountNumber', value: emiContextInfo.bankinfo.accountNumber, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'bankinfo'), placeholder: 'Enter account number', svgicon: '/svgfile/idcardicon2.png', extenduserinfo: '' },
        { label: 'Bank Branch', name: 'bankbranch', value: emiContextInfo.bankinfo.bankbranch, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'bankinfo'), placeholder: 'Enter Bank Branch', svgicon: '/svgfile/bank.svg', extenduserinfo: '' },
        { label: 'Salary Amount', name: 'salaryAmount', value: emiContextInfo.bankinfo.salaryAmount, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'bankinfo'), placeholder: 'Enter salary amount', svgicon: '/svgfile/moneycashicon.png', extenduserinfo: '', type: 'number' },
    ];

    const granterPersonalDetails = [
        { label: 'Guarantors Full Name', name: 'name', value: emiContextInfo.granterPersonalDetails.name, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), placeholder: 'Enter Guarantor name', svgicon: '/svgfile/menperson.svg', extenduserinfo: '' },
        { label: 'Phone Number', name: 'phone', value: emiContextInfo.granterPersonalDetails.phone, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), placeholder: 'Enter Phone Number', svgicon: '/svgfile/phoneIcon.png', extenduserinfo: '', type: 'tel' },
        { label: 'Gender', name: 'gender', value: emiContextInfo.granterPersonalDetails.gender, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), type: 'select', options: ['Male', 'Female'], svgicon: emiContextInfo.granterPersonalDetails.gender === 'Male' ? '/svgfile/menperson.svg' : '/svgfile/creditcardicon.svg', extenduserinfo: '' },
        { label: 'Marriage Status', name: 'marriageStatus', value: emiContextInfo.granterPersonalDetails.marriageStatus, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), type: 'select', options: ['Single', 'Married'], svgicon: emiContextInfo.granterPersonalDetails.gender === 'Male' ? '/svgfile/menperson.svg' : '/svgfile/creditcardicon.svg', extenduserinfo: '' },
        { label: emiContextInfo.granterPersonalDetails.gender === 'Male' ? 'Wife Name' : 'Husband Name', name: 'userpartnerName', value: emiContextInfo.granterPersonalDetails.userpartnerName, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), extenduserinfo: emiContextInfo.granterPersonalDetails.marriageStatus === 'Single' ? 'hidden' : '', svgicon: emiContextInfo.granterPersonalDetails.gender === 'Male' ? '/svgfile/menperson.svg' : '/svgfile/creditcardicon.svg' },
        { label: 'Citizenship Number', name: 'nationalID', value: emiContextInfo.granterPersonalDetails.nationalID, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), placeholder: 'Enter citizenship number', svgicon: '/svgfile/idcardicon2.png', extenduserinfo: '' },
        { label: 'Address', name: 'address', value: emiContextInfo.granterPersonalDetails.address, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), placeholder: 'Enter Address', maxLength: 100, svgicon: '/svgfile/homeaddressicon.png', extenduserinfo: '' },
    ];

    const EmiConditionFields = [
        {
            label: 'Down Payment Amount',
            name: 'downPayment',
            value: emiContextInfo.emiCalculation.downPayment,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'emiCalculation'),
            svgicon: '/svgfile/moneycashicon.png',
            extenduserinfo: '',
            placeholder: 'Enter down payment amount (e.g. 40% or 5000)',
            maxvalue: product ? product.price : 0,
            type: 'text',
            helper: typeof emiContextInfo.emiCalculation.downPayment === 'string' && emiContextInfo.emiCalculation.downPayment.includes('%')
                ? `Calculated: Rs. ${emiData.downPayment.toLocaleString()}`
                : null
        },
        { label: 'Bank', name: 'bankname', value: emiContextInfo.bankinfo.bankname, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleBankSelect('bankinfo', 'bankname', e.target.value), type: 'select', options: bankOptions, placeholder: 'Select Bank', svgicon: '/svgfile/monthicon.png', extenduserinfo: '' },
        { label: 'Duration (months)', name: 'duration', value: emiCalc.duration, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'emiCalculation'), placeholder: 'Select Duration', type: 'select', options: tumerOptions, svgicon: '/svgfile/monthicon.png', extenduserinfo: '' },
        { label: 'Finance Amount', name: 'financeAmount', value: emiData.financeAmount, onChange: () => { }, svgicon: '/svgfile/moneycashicon.png', extenduserinfo: '', disabled: true },
    ];

    const EmiConditionFieldCredit = [
        {
            label: 'Down Payment Amount',
            name: 'downPayment',
            value: emiContextInfo.emiCalculation.downPayment,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'emiCalculation'),
            svgicon: '/svgfile/moneycashicon.png',
            extenduserinfo: '',
            placeholder: 'Enter down payment amount',
            maxvalue: product ? product.price : 0,
            type: 'text',
            helper: typeof emiContextInfo.emiCalculation.downPayment === 'string' && emiContextInfo.emiCalculation.downPayment.includes('%')
                ? `Calculated: Rs. ${emiData.downPayment.toLocaleString()}`
                : null
        },
        { label: 'Duration (months)', name: 'duration', value: emiCalc.duration, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'emiCalculation'), placeholder: 'Select Duration', type: 'select', options: tumerOptions, svgicon: '/svgfile/monthicon.png', extenduserinfo: '' },
        { label: 'Finance Amount', name: 'financeAmount', value: emiData.financeAmount, onChange: () => { }, svgicon: '/svgfile/moneycashicon.png', extenduserinfo: '', disabled: true },
    ];

    const formSections = {
        creditCard: [
            { title: 'Credit Card Details', sectionKey: 'bankinfo', step: 1, fields: creditCardDetailsInfo, additionalContent: <></> },
            { title: 'Personal Details', sectionKey: 'userInfo', step: 2, fields: personalDetailsInfolist, additionalContent: <></> },
            { title: 'EMI Conditions', sectionKey: 'emiCalculation', step: 3, fields: EmiConditionFieldCredit, additionalContent: <></> },
        ],
        downPayment: [
            {
                title: 'Personal Details', sectionKey: 'userInfo', step: 1, fields: personalDetailsInfolist, additionalContent: (
                    <div className="mt-6"><h3 className="text-lg font-semibold text-gray-800 mb-4">Required Documents</h3><DocumentUpload docTypes={['ppphoto', 'front', 'back']} isGranter={false} files={emiContextInfo.files} previews={previews} handleFileChange={handleFileChange} handleFileDelete={handleFileDelete} /></div>
                )
            },
            {
                title: 'Guarantor Information', sectionKey: 'granterPersonalDetails', step: 2, fields: granterPersonalDetails, additionalContent: (
                    <div className="mt-6"><h3 className="text-lg font-semibold text-gray-800 mb-4">Required Documents</h3><DocumentUpload docTypes={['ppphoto', 'front', 'back']} isGranter={true} files={emiContextInfo.files} previews={previews} handleFileChange={handleFileChange} handleFileDelete={handleFileDelete} /></div>
                )
            },
            {
                title: 'EMI Conditions', sectionKey: 'emiCalculation', step: 3, fields: EmiConditionFields, additionalContent: (
                    <div className="mt-6">
                        <SignaturePad
                            onSignatureChange={(file) => {
                                setEmiContextInfo(prev => ({
                                    ...prev,
                                    files: { ...prev.files, userSignature: file }
                                }));
                            }}
                            existingSignature={previews['userSignature']}
                        />
                    </div>
                )
            },
        ],
        makeCard: [
            {
                title: 'Personal Details', sectionKey: 'userInfo', step: 1, fields: personalDetailsInfolist, additionalContent: (
                    <div className="mt-6"><h3 className="text-lg font-semibold text-gray-800 mb-4">Required Documents</h3><DocumentUpload docTypes={['ppphoto', 'front', 'back']} isGranter={false} files={emiContextInfo.files} previews={previews} handleFileChange={handleFileChange} handleFileDelete={handleFileDelete} /></div>
                )
            },
            {
                title: 'Bank Details', sectionKey: 'bankinfo', step: 2, fields: bankdetailsInfo, additionalContent: (
                    <div className="mt-6"><h3 className="text-lg font-semibold text-gray-800 mb-4">Required Documents</h3><DocumentUpload docTypes={['bankStatement']} isGranter={false} files={emiContextInfo.files} previews={previews} handleFileChange={handleFileChange} handleFileDelete={handleFileDelete} /></div>
                )
            },
            { title: 'EMI Conditions', sectionKey: 'emiCalculation', step: 3, fields: EmiConditionFieldCredit, additionalContent: <></> },
        ]
    };

    const selectedOption = emiContextInfo.hasCreditCard === 'yes' ? 'creditCard' : emiContextInfo.hasCreditCard === 'make' ? 'makeCard' : 'downPayment';
    const currentFormSection = currentstep > 0 && currentstep < 4 ? formSections[selectedOption as keyof typeof formSections]?.find((section) => section.step === currentstep) : null;

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-500 mb-6">We couldn&apos;t find the product details. Please access this page from a valid product link.</p>
                    <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700 text-white">Return Home</Button>
                </div>
            </div>
        );
    }



    // --- RENDERING ---
    // --- RENDERING ---
    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#f8faff] via-white to-[#f0f4ff]">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="container mx-auto px-4 py-8 relative z-10">

                {/* Header Actions */}
                <div className="flex justify-between items-center mb-8">
                    <Button variant="ghost" onClick={() => router.back()} className="hover:bg-white/50 gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowBigLeft className="w-5 h-5" /> Back
                    </Button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Form Column */}
                    <div className="flex-1">
                        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-6 md:p-8">

                            <div className="mb-8">
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                    Apply for EMI
                                </h1>
                                <p className="text-gray-500 text-sm mt-1">Complete the steps below to get your product.</p>
                            </div>

                            <ProgressBar currentstep={currentstep} />

                            <div className="mt-8 min-h-[400px]">
                                {/* Step 0: Option Selection */}
                                {currentstep === 0 && (
                                    <div className="space-y-6">
                                        <h2 className="text-lg font-bold text-gray-800">Select Payment Method</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div onClick={() => handleOptionSelect('creditCard')} className={`cursor-pointer group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${selectedOption === 'creditCard' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-white'}`}>
                                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4 text-purple-600">
                                                    <Image src={creditcardicon} alt="" width={24} height={24} />
                                                </div>
                                                <h3 className="font-bold text-gray-900">Credit Card</h3>
                                                <p className="text-xs text-gray-500 mt-2">Use your existing credit card.</p>
                                                {selectedOption === 'creditCard' && <div className="absolute top-3 right-3 text-blue-500"><CheckCircle2 size={20} /></div>}
                                            </div>

                                            <div onClick={() => handleOptionSelect('makeCard')} className={`cursor-pointer group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${selectedOption === 'makeCard' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-white'}`}>
                                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
                                                    <Image src={addcreditcard} alt="" width={24} height={24} />
                                                </div>
                                                <h3 className="font-bold text-gray-900">Make New Card</h3>
                                                <p className="text-xs text-gray-500 mt-2">Apply for a new bank card.</p>
                                                {selectedOption === 'makeCard' && <div className="absolute top-3 right-3 text-blue-500"><CheckCircle2 size={20} /></div>}
                                            </div>

                                            <div onClick={() => handleOptionSelect('downPayment')} className={`cursor-pointer group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${selectedOption === 'downPayment' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-white'}`}>
                                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 text-green-600">
                                                    <Image src={downpaymenticon} alt="" width={24} height={24} />
                                                </div>
                                                <h3 className="font-bold text-gray-900">Down Payment</h3>
                                                <p className="text-xs text-gray-500 mt-2">Pay 40% now, rest later.</p>
                                                {selectedOption === 'downPayment' && <div className="absolute top-3 right-3 text-blue-500"><CheckCircle2 size={20} /></div>}
                                            </div>
                                        </div>

                                        {/* Variant Selection (if applicable) */}
                                        {product && product.variants && product.variants.length > 0 && (
                                            <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                                                <h2 className="text-lg font-bold text-gray-800">Select Color / Variant</h2>
                                                <div className="flex flex-wrap gap-4">
                                                    {/* We need distinct colors/variants */}
                                                    {Array.from(new Set(product.variants.map(v => v.attributes?.Color))).filter(Boolean).map((color: string) => {
                                                        const isSelected = emiContextInfo.selectedVariant === color;
                                                        // Find image for this color
                                                        const variantImg = product.images?.find(img => img.color === color || img.custom_properties?.color === color)?.thumb || product.image?.thumb;

                                                        return (
                                                            <button
                                                                key={color}
                                                                onClick={() => setEmiContextInfo(prev => ({ ...prev, selectedVariant: color }))}
                                                                className={`
                                                                relative flex items-center gap-3 pl-2 pr-6 py-2 rounded-full border transition-all duration-300
                                                                ${isSelected
                                                                        ? 'border-[var(--colour-fsP1)] bg-[var(--colour-fsP1)]/5 ring-1 ring-[var(--colour-fsP1)]'
                                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                                    }
                                                            `}
                                                            >
                                                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                                                                    {variantImg ? (
                                                                        <Image src={variantImg} alt={color} fill className="object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-gray-200" />
                                                                    )}
                                                                </div>
                                                                <div className="text-left">
                                                                    <span className={`block text-sm font-semibold ${isSelected ? 'text-[var(--colour-fsP1)]' : 'text-gray-700'}`}>
                                                                        {color}
                                                                        {isSelected && <span className="ml-1 text-[10px] uppercase text-blue-500 bg-blue-50 px-1 rounded">(Selected)</span>}
                                                                    </span>
                                                                </div>
                                                                {isSelected && <div className="absolute top-0 right-0 -mt-1 -mr-1 bg-[var(--colour-fsP1)] text-white rounded-full p-0.5"><CheckCircle2 size={12} /></div>}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}


                                {/* Form Steps */}
                                {currentstep > 0 && currentFormSection && (
                                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            {currentFormSection.title}
                                            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Step {currentstep}/3</span>
                                        </h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                            {currentFormSection.fields.map((field, index) => (
                                                <FormField key={index} field={field} error={errors[field.name]} />
                                            ))}
                                        </div>
                                        {currentFormSection.additionalContent}
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                                {currentstep !== 0 && (
                                    <Button onClick={handleBack} variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50">
                                        Back
                                    </Button>
                                )}
                                <Button
                                    onClick={handleContinue}
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>}
                                </Button>
                            </div>

                        </div>
                    </div>

                    {/* Right Product Column */}
                    <div className="hidden lg:block w-80 flex-shrink-0">
                        <EmiProductDetails emiData={emiData} product={product} selectedVariant={emiContextInfo.selectedVariant} />
                    </div>

                </div>
            </div>
            {/* STEP 4: Review */}
            {
                currentstep === 4 && (
                    <div className="absolute inset-0 bg-white z-[100] animate-in fade-in zoom-in-95 duration-500 overflow-y-auto">
                        <RenderReview
                            emiData={emiData}
                            handleFileChange={handleFileChange}
                            handleFileDelete={handleFileDelete}
                            handleBack={handleBack}
                            onSubmit={handleSubmit}
                            previews={previews}
                        />
                        {isSubmitting && (
                            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[150]">
                                <div className="flex flex-col items-center">
                                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900">Submitting Application...</h3>
                                    <p className="text-sm text-gray-500">Please wait while we process your details.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )
            }
            <LoginAlertDialog />
        </div >
    );
};

export default ApplyEmiClient;
