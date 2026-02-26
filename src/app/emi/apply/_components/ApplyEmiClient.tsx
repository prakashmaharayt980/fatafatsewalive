'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import * as Yup from 'yup';
import { toast } from 'sonner'; // Assuming sonner or use-toast is available, else fallback to alert
import NepaliDate from 'nepali-date-converter';
import RemoteServices from '@/app/api/remoteservice';
import { EmiService } from '@/app/api/services/emi.service';
import {
    personalDetailsSchema,
    creditCardSchema,
    bankDetailsSchema,
    emiConditionsSchema,
    emiConditionsCreditSchema,
} from './validationSchemas';

import { useContextEmi } from '../../_components/emiContext';
import { BANK_PROVIDERS, calculateEMI } from '../../_components/_func_emiCalacutor';
// import BuyerPersonalInfo from './BuyerPersonalInfo'; // Seems unused in original, logic was inline
import RenderReview from './ReviewApplyEmiDoc'
import ProgressBar from './ProgressBar';
import EmiProductDetails from './EmiProductDetails';
import CreditCardform from './CreditCardform';
import DocumentUpload from './DocumentUpload';
import SignaturePad from './SignaturePad';
import {
    ArrowBigLeft, Loader2, CheckCircle2, ChevronRight, ChevronDown, AlertCircle, Info,
    CreditCard, Calendar, User, MapPin, Mail, Phone, Briefcase, FileText, Hash, DollarSign, Building2, Banknote, FileBadge,
    CreditCardIcon,
    HandCoins
} from 'lucide-react';

import { ProductDetails } from '@/app/types/ProductDetailsTypes';
import { useAuth } from '@/app/context/AuthContext';

interface ApplyEmiClientProps {
    initialProduct: ProductDetails | null;
    selectedcolor?: string;
}

import FormField, { FieldOption } from './FormField';



const ApplyEmiClient: React.FC<ApplyEmiClientProps> = ({ initialProduct, selectedcolor }) => {
    const { setShowLoginAlert, authState } = useAuth();
    const user = authState?.user;
    const { emiContextInfo, setEmiContextInfo } = useContextEmi();
    const [currentstep, setcurrentstep] = useState(0);
    const [previews, setPreviews] = useState<{ [key: string]: string }>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPaymentSubOptions, setShowPaymentSubOptions] = useState(false);

    const [localCreditCardInfo, setLocalCreditCardInfo] = useState({
        cardHolderName: '',
        creditCardNumber: '',
        expiryDate: '',
        cardLimit: ''
    });

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
        const colorParam = selectedcolor || searchParams.get('color') || searchParams.get('variant') || searchParams.get('selectedcolor');

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
    }, [initialProduct, searchParams, emiContextInfo.product?.id, setEmiContextInfo, selectedcolor]);

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

    const handleBSDateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, sectionKey: 'userInfo' | 'granterPersonalDetails') => {
        const value = e.target.value;
        const bsDateStr = value; // Expected YYYY-MM-DD

        // Update BS date in state and clear error
        handleInputChange(e, sectionKey);

        if (/^\d{4}-\d{2}-\d{2}$/.test(bsDateStr)) {
            try {
                const parts = bsDateStr.split('-');
                const bsYear = parseInt(parts[0]);
                const bsMonth = parseInt(parts[1]) - 1; // nepali-date-converter uses 0-11 for months
                const bsDay = parseInt(parts[2]);

                const nd = new NepaliDate(bsYear, bsMonth, bsDay);
                const adDate = nd.getAD();

                const adYear = adDate.year;
                const adMonth = String(adDate.month + 1).padStart(2, '0');
                const adDay = String(adDate.date).padStart(2, '0');

                const adDateString = `${adYear}-${adMonth}-${adDay}`;

                // Set the corresponding AD date
                setEmiContextInfo((prev) => ({
                    ...prev,
                    [sectionKey]: {
                        ...(prev as unknown as Record<string, Record<string, unknown>>)[sectionKey],
                        dob: adDateString,
                    },
                }));
            } catch (err) {
                // Ignore invalid BS date conversion
            }
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


    const handleBankSelect = async (section: string, name: string, value: string) => {
        setEmiContextInfo((prev) => ({
            ...prev,
            [section]: {
                ...(prev as unknown as Record<string, Record<string, unknown>>)[section],
                [name]: value,
            },
            interestRate: BANK_PROVIDERS.find((b) => b.name === value)?.rate || 10,
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
            let data: Record<string, unknown> = {};
            if (currentSection.sectionKey === 'emiCalculation') {
                data = { ...emiContextInfo.emiCalculation, bankname: emiContextInfo.bankinfo.bankname };
            } else if (currentSection.sectionKey === 'bankinfo' && selectedOption === 'creditCard') {
                data = { ...emiContextInfo.bankinfo, ...localCreditCardInfo };
            } else {
                data = (emiContextInfo as unknown as Record<string, Record<string, unknown>>)[currentSection.sectionKey] || {};
            }

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


        if (authState.isLoggedIn === false) {
            setShowLoginAlert(true);
            return;
        }


        // 2. Check Variant Selection if product has variants
        const hasVariants = product.variants && product.variants.length > 0;


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

            let response;

            if (option === 'creditCard') {
                // Execute explicit EMI Service request per user specification
                const payload = {
                    name: emiContextInfo.userInfo.name,
                    email: emiContextInfo.userInfo.email,
                    contact_number: emiContextInfo.userInfo.phone,
                    address: emiContextInfo.userInfo.address,
                    dob_ad: emiContextInfo.userInfo.dob,
                    dob_bs: emiContextInfo.userInfo.dob,
                    gender: emiContextInfo.userInfo.gender,
                    product_id: product.id,
                    finance_amount: emiData?.financeAmount || 0,
                    monthly_income: emiContextInfo.bankinfo.salaryAmount || 0,
                    credit_card: localCreditCardInfo.creditCardNumber

                };

                response = await EmiService.EmiRequest(payload);
            } else if (option === 'makeCard') {
                // Common Data for legacy paths
                formData.append('product_id', String(product.id));
                formData.append('product_price', String(product.price));
                formData.append('application_type', option);
                formData.append('userInfo', JSON.stringify(emiContextInfo.userInfo));
                formData.append('emiCalculation', JSON.stringify({
                    ...emiContextInfo.emiCalculation,
                    bank: emiContextInfo.bankinfo.bankname
                }));
                if (emiContextInfo.selectedVariant) {
                    formData.append('selected_variant', emiContextInfo.selectedVariant);
                }

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
                // Common Data for legacy paths
                formData.append('product_id', String(product.id));
                formData.append('product_price', String(product.price));
                formData.append('application_type', option);
                formData.append('userInfo', JSON.stringify(emiContextInfo.userInfo));
                formData.append('emiCalculation', JSON.stringify({
                    ...emiContextInfo.emiCalculation,
                    bank: emiContextInfo.bankinfo.bankname
                }));
                if (emiContextInfo.selectedVariant) {
                    formData.append('selected_variant', emiContextInfo.selectedVariant);
                }

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

            if (option !== 'creditCard') {
                response = await RemoteServices.applyEmi(formData);
            }

            if (response) {
                toast.success('Application Submitted Successfully!');
                // router.push('/');
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
        setShowPaymentSubOptions(false); // reset for subsequent visits
    };

    const tumerOptions = useMemo(() => {
        const tumer = BANK_PROVIDERS.find((bank) => bank.name === emiContextInfo.bankinfo.bankname)?.tenureOptions || [];
        return tumer;
    }, [emiContextInfo.bankinfo.bankname]);

    const emiData = useMemo(() => {
        if (!product) return { downPayment: 0, financeAmount: 0, tenure: 0, principal: 0, paymentpermonth: 0 };
        const result = calculateEMI({ principal: product.price || 0, tenure: emiCalc.duration, downPayment: emiCalc.downPayment, bankId: emiContextInfo.bankinfo.bankname });
        return {
            principal: result.principal,
            tenure: result.tenure,
            downPayment: result.downPayment,
            financeAmount: result.financeAmount,
            paymentpermonth: result.paymentPerMonth,
        };
    }, [product, emiCalc.duration, emiCalc.downPayment, emiContextInfo.bankinfo.bankname]);



    const bankOptions = useMemo(() => BANK_PROVIDERS.map((b) => b.name), []);

    // -- REUSING FIELDS FROM ORIGINAL FILE --
    const personalDetailsInfolist = [
        {
            label: 'User Name',
            name: 'name',
            value: emiContextInfo.userInfo.name,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            placeholder: 'Enter user name',
            maxLength: 50,
            svgicon: <User className="w-5 h-5" />,
            extenduserinfo: '',
        },
        {
            label: 'Email',
            name: 'email',
            value: emiContextInfo.userInfo.email,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            placeholder: 'Enter email',
            svgicon: <Mail className="w-5 h-5" />,
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
            svgicon: <User className="w-5 h-5" />,
            extenduserinfo: '',
        },
        {
            label: 'Marriage Status',
            name: 'marriageStatus',
            value: emiContextInfo.userInfo.marriageStatus,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            type: 'select',
            options: ['Single', 'Married'],
            svgicon: <User className="w-5 h-5" />,
            extenduserinfo: '',
        },
        {
            label: emiContextInfo.userInfo.gender === 'Male' ? 'Wife Name' : 'Husband Name',
            name: 'userpartnerName',
            value: emiContextInfo.userInfo.userpartnerName,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            extenduserinfo: emiContextInfo.userInfo.marriageStatus === 'Single' ? 'hidden' : '',
            svgicon: <User className="w-5 h-5" />,
        },
        {
            label: 'Phone Number',
            name: 'phone',
            value: emiContextInfo.userInfo.phone,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            placeholder: 'Enter phone number',
            svgicon: <Phone className="w-5 h-5" />,
            extenduserinfo: '',
            type: 'tel',
        },
        {
            label: 'National ID Number',
            name: 'nationalID',
            value: emiContextInfo.userInfo.nationalID,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            placeholder: 'Enter national ID number',
            svgicon: <Hash className="w-5 h-5" />,
            extenduserinfo: '',
        },
        {
            label: 'Date of Birth (BS)',
            name: 'dob_bs',
            value: emiContextInfo.userInfo.dob_bs,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleBSDateChange(e, 'userInfo'),
            placeholder: 'YYYY-MM-DD',
            svgicon: <Calendar className="w-5 h-5" />,
            extenduserinfo: '',
        },
        {
            label: 'Date of Birth (AD)',
            name: 'dob',
            value: emiContextInfo.userInfo.dob,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            type: 'date',
            svgicon: <Calendar className="w-5 h-5" />,
            extenduserinfo: '',
        },
        {
            label: 'Address',
            name: 'address',
            value: emiContextInfo.userInfo.address,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            placeholder: 'Enter full address',
            maxLength: 100,
            svgicon: <MapPin className="w-5 h-5" />,
            extenduserinfo: 'md:col-span-2',
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
            svgicon: <CreditCardIcon className="w-5 h-5" />,
            extenduserinfo: '',
        },
        {
            label: 'Card Holder Name',
            name: 'cardHolderName',
            value: localCreditCardInfo.cardHolderName,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                setLocalCreditCardInfo(prev => ({ ...prev, cardHolderName: e.target.value }));
                if (errors['cardHolderName']) setErrors(prev => ({ ...prev, cardHolderName: undefined }));
            },
            placeholder: 'Card Holder Name',
            svgicon: <User className="w-5 h-5" />,
            extenduserinfo: '',
        },
        {
            label: 'Card Number',
            name: 'creditCardNumber',
            value: localCreditCardInfo.creditCardNumber,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                let val = e.target.value.replace(/\D/g, '');
                val = val.replace(/(.{4})/g, '$1 ').trim();
                setLocalCreditCardInfo(prev => ({ ...prev, creditCardNumber: val.slice(0, 19) }));
                if (errors['creditCardNumber']) setErrors(prev => ({ ...prev, creditCardNumber: undefined }));
            },
            placeholder: 'XXXX XXXX XXXX XXXX',
            maxLength: 19,
            svgicon: <CreditCard className="w-5 h-5" />,
            extenduserinfo: '',
        },
        {
            label: 'Expiry Date',
            name: 'expiryDate',
            value: localCreditCardInfo.expiryDate,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                let val = e.target.value.replace(/\D/g, '');
                if (val.length >= 2) {
                    val = val.slice(0, 2) + '/' + val.slice(2, 4);
                }
                setLocalCreditCardInfo(prev => ({ ...prev, expiryDate: val.slice(0, 5) }));
                if (errors['expiryDate']) setErrors(prev => ({ ...prev, expiryDate: undefined }));
            },
            placeholder: 'MM/YY',
            maxLength: 5,
            svgicon: <Calendar className="w-5 h-5" />,
            extenduserinfo: '',
        },
        {
            label: 'Card Limit',
            name: 'cardLimit',
            value: localCreditCardInfo.cardLimit,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                setLocalCreditCardInfo(prev => ({ ...prev, cardLimit: e.target.value }));
                if (errors['cardLimit']) setErrors(prev => ({ ...prev, cardLimit: undefined }));
            },
            placeholder: 'Card Limit',
            svgicon: <HandCoins className="w-5 h-5" />,
            extenduserinfo: '',
            type: 'number',
            step: "0.01"
        },
    ];


    const bankdetailsInfo = [
        { label: 'Bank Name', name: 'bankname', value: emiContextInfo.bankinfo.bankname, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleBankSelect('bankinfo', 'bankname', e.target.value), type: 'select', options: bankOptions, svgicon: <Building2 className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Account Number', name: 'accountNumber', value: emiContextInfo.bankinfo.accountNumber, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'bankinfo'), placeholder: 'Enter account number', svgicon: <Hash className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Bank Branch', name: 'bankbranch', value: emiContextInfo.bankinfo.bankbranch, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'bankinfo'), placeholder: 'Enter Bank Branch', svgicon: <Building2 className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Salary Amount', name: 'salaryAmount', value: emiContextInfo.bankinfo.salaryAmount, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'bankinfo'), placeholder: 'Enter salary amount', svgicon: <DollarSign className="w-5 h-5" />, extenduserinfo: '', type: 'number' },
    ];

    const granterPersonalDetails = [
        { label: 'Guarantors Full Name', name: 'name', value: emiContextInfo.granterPersonalDetails.name, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), placeholder: 'Enter Guarantor name', svgicon: <User className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Phone Number', name: 'phone', value: emiContextInfo.granterPersonalDetails.phone, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), placeholder: 'Enter Phone Number', svgicon: <Phone className="w-5 h-5" />, extenduserinfo: '', type: 'tel' },
        { label: 'Gender', name: 'gender', value: emiContextInfo.granterPersonalDetails.gender, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), type: 'select', options: ['Male', 'Female'], svgicon: <User className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Marriage Status', name: 'marriageStatus', value: emiContextInfo.granterPersonalDetails.marriageStatus, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), type: 'select', options: ['Single', 'Married'], svgicon: <User className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Wife Name / Husband Name', name: 'userpartnerName', value: emiContextInfo.granterPersonalDetails.userpartnerName, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), extenduserinfo: emiContextInfo.granterPersonalDetails.marriageStatus === 'Single' ? 'hidden' : '', svgicon: <User className="w-5 h-5" /> },
        { label: 'Citizenship Number', name: 'nationalID', value: emiContextInfo.granterPersonalDetails.nationalID, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), placeholder: 'Enter citizenship number', svgicon: <Hash className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Date of Birth (BS)', name: 'dob_bs', value: emiContextInfo.granterPersonalDetails.dob_bs, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleBSDateChange(e, 'granterPersonalDetails'), placeholder: 'YYYY-MM-DD', svgicon: <Calendar className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Date of Birth (AD)', name: 'dob', value: emiContextInfo.granterPersonalDetails.dob, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), type: 'date', svgicon: <Calendar className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Address', name: 'address', value: emiContextInfo.granterPersonalDetails.address, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), placeholder: 'Enter Address', maxLength: 100, svgicon: <MapPin className="w-5 h-5" />, extenduserinfo: 'md:col-span-2' },
    ];

    const EmiConditionFields = [
        {
            label: 'Down Payment Amount',
            name: 'downPayment',
            value: emiContextInfo.emiCalculation.downPayment,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'emiCalculation'),
            svgicon: <DollarSign className="w-5 h-5" />,
            extenduserinfo: '',
            placeholder: 'Enter down payment amount (e.g. 40% or 5000)',
            maxvalue: product ? product.price : 0,
            type: 'text',
            helper: typeof emiContextInfo.emiCalculation.downPayment === 'string' && emiContextInfo.emiCalculation.downPayment.includes('%')
                ? `Calculated: Rs. ${emiData.downPayment.toLocaleString()}`
                : null
        },
        { label: 'Bank', name: 'bankname', value: emiContextInfo.bankinfo.bankname, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleBankSelect('bankinfo', 'bankname', e.target.value), type: 'select', options: bankOptions, placeholder: 'Select Bank', svgicon: <Building2 className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Duration (months)', name: 'duration', value: emiCalc.duration, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'emiCalculation'), placeholder: 'Select Duration', type: 'select', options: tumerOptions, svgicon: <Calendar className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Finance Amount', name: 'financeAmount', value: emiData.financeAmount, onChange: () => { }, svgicon: <DollarSign className="w-5 h-5" />, extenduserinfo: '', disabled: true },
    ];

    const EmiConditionFieldCredit = [
        {
            label: 'Down Payment Amount',
            name: 'downPayment',
            value: emiContextInfo.emiCalculation.downPayment,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'emiCalculation'),
            svgicon: <DollarSign className="w-5 h-5" />,
            extenduserinfo: '',
            placeholder: 'Enter down payment amount',
            maxvalue: product ? product.price : 0,
            type: 'text',
            helper: typeof emiContextInfo.emiCalculation.downPayment === 'string' && emiContextInfo.emiCalculation.downPayment.includes('%')
                ? `Calculated: Rs. ${emiData.downPayment.toLocaleString()}`
                : null
        },
        { label: 'Duration (months)', name: 'duration', value: emiCalc.duration, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'emiCalculation'), placeholder: 'Select Duration', type: 'select', options: tumerOptions, svgicon: <Calendar className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Finance Amount', name: 'financeAmount', value: emiData.financeAmount, onChange: () => { }, svgicon: <DollarSign className="w-5 h-5" />, extenduserinfo: '', disabled: true },
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
    // Breadcrumbs Navigation
    const breadcrumbs = (
        <nav className="flex items-center gap-1.5 text-sm mb-4 overflow-x-auto pb-1 scrollbar-hide">
            <Button variant="link" className="p-0 h-auto text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] text-sm font-medium" onClick={() => router.push('/')}>
                Home
            </Button>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            <Button variant="link" className="p-0 h-auto text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] text-sm font-medium" onClick={() => router.push(`/products/${product?.slug}`)}>
                {product?.name?.substring(0, 30)}...
            </Button>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-slate-800 font-semibold text-sm">
                Apply EMI
            </span>
        </nav>
    );

    return (
        <div className="bg-gray-50 py-4 sm:py-8 min-h-screen">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                {breadcrumbs}

                {/* Progress Bar */}
                <div className="mb-1 sm:mb-2">
                    <ProgressBar currentstep={currentstep} onStepClick={setcurrentstep} />
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Left Column - Steps */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[550px]">

                            {/* Step Header */}
                            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    {currentstep === 0 && 'Select EMI Method'}
                                    {currentstep > 0 && currentstep < 4 && currentFormSection?.title}
                                    {currentstep === 4 && 'Review Application'}
                                </h2>
                                <span className="text-xs font-bold text-[var(--colour-fsP2)] bg-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                                    Step {currentstep === 0 ? '1' : currentstep + 1} of 5
                                </span>
                            </div>

                            <div className="p-6 sm:p-8">
                                {/* Step 0: Option Selection */}
                                {currentstep === 0 && (
                                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">

                                        {/* Variant Selection if Variants exist */}
                                        {product && product.variants && product.variants.length > 0 && (
                                            <div className="space-y-4">
                                                <h2 className="text-lg font-bold text-gray-800">Select Color / Variant</h2>
                                                <div className="flex flex-wrap gap-4">
                                                    {Array.from(new Set(product.variants.map(v => v.attributes?.Color))).filter(Boolean).map((color: string) => {
                                                        const isSelected = emiContextInfo.selectedVariant === color;
                                                        // Find image for this color
                                                        const variantImg = product.images?.find(img => img.color === color || img.custom_properties?.color === color)?.thumb || product.image?.thumb;

                                                        return (
                                                            <button
                                                                key={color}
                                                                onClick={() => setEmiContextInfo(prev => ({ ...prev, selectedVariant: color }))}
                                                                className={`
                                                                    relative flex items-center gap-3 pl-2 pr-6 py-2 rounded-lg border transition-all duration-300
                                                                    ${isSelected
                                                                        ? 'border-[var(--colour-fsP2)] bg-blue-50 shadow-md shadow-blue-100'
                                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                                    }
                                                                `}
                                                            >
                                                                <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 border border-gray-100">
                                                                    {variantImg ? <Image src={variantImg} alt={color} fill className="object-cover" /> : <div className="bg-gray-200 w-full h-full" />}
                                                                </div>
                                                                <span className={`text-sm font-semibold ${isSelected ? 'text-[var(--colour-fsP2)]' : 'text-gray-700'}`}>
                                                                    {color}
                                                                </span>
                                                                {isSelected && <div className="absolute top-0 right-0 -mt-1 -mr-1 bg-[var(--colour-fsP2)] text-white rounded-full p-0.5 shadow-sm"><CheckCircle2 size={12} /></div>}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            {!showPaymentSubOptions ? (
                                                <>
                                                    <h3 className="text-gray-900 font-bold text-lg">Select EMI Method</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div onClick={() => handleOptionSelect('creditCard')} className={`cursor-pointer group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${selectedOption === 'creditCard' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 bg-white'}`}>
                                                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                                <CreditCard className="w-6 h-6" />
                                                            </div>
                                                            <h3 className="font-bold text-gray-900 text-lg">Credit Card</h3>
                                                            <p className="text-sm text-gray-500 mt-2">Use your existing bank credit card.</p>
                                                            {selectedOption === 'creditCard' && <div className="absolute top-3 right-3 text-blue-600"><CheckCircle2 size={24} /></div>}
                                                        </div>

                                                        <div onClick={() => setShowPaymentSubOptions(true)} className={`cursor-pointer group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${selectedOption === 'downPayment' || selectedOption === 'makeCard' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white'}`}>
                                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                                                <Banknote className="w-6 h-6" />
                                                            </div>
                                                            <h3 className="font-bold text-gray-900 text-lg">Down Payment</h3>
                                                            <p className="text-sm text-gray-500 mt-2">Pay upfront or provide collateral documents.</p>
                                                            <div className="mt-4 flex items-center text-sm font-semibold text-orange-500 group-hover:underline">
                                                                View Options <ChevronRight className="w-4 h-4 ml-1" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                                                        <Button variant="ghost" size="icon" onClick={() => setShowPaymentSubOptions(false)} className="h-8 w-8 rounded-full border border-gray-200">
                                                            <ArrowBigLeft className="w-4 h-4 text-gray-600" />
                                                        </Button>
                                                        <div>
                                                            <h3 className="text-gray-900 font-bold text-lg">Down Payment Options</h3>
                                                            <p className="text-xs text-gray-500">Select how you want to proceed with EMI</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div onClick={() => handleOptionSelect('makeCard')} className={`cursor-pointer group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${selectedOption === 'makeCard' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white'}`}>
                                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                                                <FileBadge className="w-6 h-6" />
                                                            </div>
                                                            <h3 className="font-bold text-gray-900 text-lg">With Citizenship Card</h3>
                                                            <p className="text-sm text-gray-500 mt-2">Apply for a new financial card using your citizenship documents.</p>
                                                            {selectedOption === 'makeCard' && <div className="absolute top-3 right-3 text-orange-500"><CheckCircle2 size={24} /></div>}
                                                        </div>

                                                        <div onClick={() => handleOptionSelect('downPayment')} className={`cursor-pointer group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${selectedOption === 'downPayment' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 bg-white'}`}>
                                                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                                <Banknote className="w-6 h-6" />
                                                            </div>
                                                            <h3 className="font-bold text-gray-900 text-lg">40% Downpayment</h3>
                                                            <p className="text-sm text-gray-500 mt-2">Pay 40% immediately and schedule the rest over months.</p>
                                                            {selectedOption === 'downPayment' && <div className="absolute top-3 right-3 text-blue-600"><CheckCircle2 size={24} /></div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Form Sections: Steps 1, 2, 3 */}
                                {currentstep > 0 && currentstep < 4 && currentFormSection && (
                                    <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">

                                        {currentFormSection.sectionKey === 'bankinfo' && selectedOption === 'creditCard' ? (
                                            <CreditCardform
                                                cardinfofield={{ fields: currentFormSection.fields }}
                                                errors={errors}
                                            />
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                                {currentFormSection.fields.map((field, index) => (
                                                    <FormField key={index} field={field} error={errors[field.name]} />
                                                ))}
                                            </div>
                                        )}

                                        {/* Additional Content (e.g. Document Uploads, Signatures) */}
                                        {currentFormSection.additionalContent}

                                        {/* Navigation Buttons */}
                                        <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-100">
                                            <Button
                                                variant="outline"
                                                onClick={handleBack}
                                                disabled={currentstep === 0}
                                                className={`gap-2 rounded-lg border-gray-200 hover:bg-gray-50 text-gray-600 ${currentstep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                                            >
                                                <ArrowBigLeft className="w-5 h-5" />
                                                Back
                                            </Button>

                                            <Button
                                                onClick={currentstep === 4 ? handleSubmit : handleContinue}
                                                disabled={isSubmitting}
                                                className="bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP1)] text-white px-8 py-2.5 h-11 rounded-lg font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none min-w-[140px]"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        {currentstep === 4 ? 'Submit Application' : 'Continue'}
                                                        {currentstep !== 4 && <ChevronRight className="w-5 h-5 ml-1" />}
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Review */}
                                {currentstep === 4 && (
                                    <div className="animate-in slide-in-from-right-4 duration-300">
                                        <RenderReview
                                            emiData={emiData}
                                            handleFileChange={handleFileChange}
                                            handleFileDelete={handleFileDelete}
                                            handleBack={handleBack}
                                            onSubmit={handleSubmit}
                                            previews={previews}
                                        />
                                        {isSubmitting && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[50] rounded-3xl">
                                                <div className="flex flex-col items-center">
                                                    <Loader2 className="w-10 h-10 text-[var(--colour-fsP2)] animate-spin mb-4" />
                                                    <h3 className="text-xl font-bold text-gray-900">Submitting Application...</h3>
                                                    <p className="text-sm text-gray-500">Please wait while we process your details.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sticky Order Summary */}
                    <div className="lg:col-span-1">
                        <EmiProductDetails
                            emiData={emiData}
                            product={product}
                            selectedVariant={emiContextInfo.selectedVariant || selectedcolor}
                        />

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplyEmiClient;
