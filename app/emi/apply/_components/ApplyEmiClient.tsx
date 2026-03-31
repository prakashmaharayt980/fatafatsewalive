'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import * as Yup from 'yup';
import { toast } from 'sonner';
import NepaliDate from 'nepali-date-converter';

import { EmiService } from '@/app/api/services/emi.service';
import { useAuth } from '@/app/context/AuthContext';
import {
    personalDetailsSchema,
    creditCardSchema,
    bankDetailsSchema,
    emiConditionsSchema,
    emiConditionsCreditSchema,
} from './validationSchemas';
import { useContextEmi } from '../../_components/emiContext';
import { calculateEMI } from '../../_components/_func_emiCalacutor';
import RenderReview from './ReviewApplyEmiDoc'
import ProgressBar from './ProgressBar';
import EmiProductDetails from './EmiProductDetails';
import CreditCardform from './CreditCardform';
import DocumentUpload from './DocumentUpload';
import SignaturePad from './SignaturePad';
import FormField from './FormField';
import EmiFaq from './EmiFaq';
import NepaliDatePicker from '../../../CommonVue/NepaliDatePicker';
import {
    ArrowBigLeft, Loader2, CheckCircle2, ChevronRight,
    CreditCard, Calendar, User, MapPin, Mail, Phone,
    Hash, DollarSign, Building2, Banknote, CreditCardIcon, HandCoins, ShoppingBag,
} from 'lucide-react';
import type { ProductData } from '@/app/types/ProductDetailsTypes';

interface ApplyEmiClientProps {
    initialProduct: ProductData | null;
    selectedcolor?: string;
}

const ApplyEmiClient: React.FC<ApplyEmiClientProps> = ({ initialProduct, selectedcolor }) => {
    const { isLoggedIn, setloginDailogOpen } = useAuth();
    const { emiContextInfo, setEmiContextInfo, banks, fetchBanks } = useContextEmi();

    useEffect(() => {
        fetchBanks();
    }, [fetchBanks]);
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);

    const [currentstep, setcurrentstep] = useState(0);
    const [previews, setPreviews] = useState<{ [key: string]: string }>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPaymentSubOptions, setShowPaymentSubOptions] = useState(false);

    const [localUserInfo, setLocalUserInfo] = useState(emiContextInfo.userInfo);
    const [localBankInfo, setLocalBankInfo] = useState(emiContextInfo.bankinfo);
    const [localGranterInfo, setLocalGranterInfo] = useState(emiContextInfo.granterPersonalDetails);
    const [localFiles, setLocalFiles] = useState(emiContextInfo.files);
    const [localVariant, setLocalVariant] = useState(emiContextInfo.selectedVariant || '');
    const [localEmiCalculation, setLocalEmiCalculation] = useState(emiContextInfo.emiCalculation);
    const [localInterestRate, setLocalInterestRate] = useState(10);

    const [localCreditCardInfo, setLocalCreditCardInfo] = useState({
        cardHolderName: '',
        creditCardNumber: '',
        expiryDate: '',
        cardLimit: ''
    });

    const router = useRouter();
    const searchParams = useSearchParams();

    // Use prop product or fallback to context (though we prefer prop)
    const selectedOption = emiContextInfo.hasCreditCard === 'yes' ? 'creditCard' : emiContextInfo.hasCreditCard === 'make' ? 'makeCard' : 'downPayment';
    const product = initialProduct || emiContextInfo.product;

    useEffect(() => {
        if (initialProduct && initialProduct.id !== emiContextInfo.product?.id) {
            setEmiContextInfo(prev => ({ ...prev, product: initialProduct }));
        }

        const bankParam = searchParams.get('bank');
        const tenureParam = searchParams.get('tenure');
        const downPaymentParam = searchParams.get('downPayment');
        const colorParam = selectedcolor || searchParams.get('color') || searchParams.get('variant') || searchParams.get('selectedcolor');

        if (colorParam) {
            setLocalVariant(colorParam);
        }

        if (bankParam || tenureParam || downPaymentParam) {
            if (bankParam) {
                setLocalBankInfo(prev => ({ ...prev, bankname: bankParam }));
                const bankMatch = banks.find(b => b.name === bankParam);
                if (bankMatch) setLocalInterestRate(bankMatch.rate);
            }
            setLocalEmiCalculation(prev => ({
                ...prev,
                duration: tenureParam ? Number(tenureParam) : prev.duration,
                downPayment: downPaymentParam ? Number(downPaymentParam) : prev.downPayment
            }));
        }
    }, [initialProduct, searchParams, emiContextInfo.product?.id, setEmiContextInfo, selectedcolor, banks]);

    useEffect(() => {
        const newPreviews: { [key: string]: string } = {};
        const files = localFiles;
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
    }, [localFiles]);

    const productPrice = useMemo(() => {
        if (!product) return 0;
        return typeof product.price === 'object'
            ? Number((product.price as any).current || (product.price as any).price || 0)
            : Number(product.price) || 0;
    }, [product]);

    const getValidationSchema = (sectionKey: string, option: string) => {
        if (sectionKey === 'userInfo') return personalDetailsSchema();
        if (sectionKey === 'granterPersonalDetails') return personalDetailsSchema(true);
        if (sectionKey === 'bankinfo' && option === 'creditCard') return creditCardSchema;
        if (sectionKey === 'bankinfo') return bankDetailsSchema;
        if (sectionKey === 'emiCalculation') {
            if (option === 'downPayment') return emiConditionsSchema(productPrice);
            return emiConditionsCreditSchema(productPrice);
        }
        return Yup.object();
    };

    const validateFormSection = async (section: { sectionKey: string }, data: any) => {
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

        const setter = section === 'userInfo' ? setLocalUserInfo :
            section === 'bankinfo' ? setLocalBankInfo :
                section === 'granterPersonalDetails' ? setLocalGranterInfo :
                    section === 'emiCalculation' ? setLocalEmiCalculation : null;

        if (setter) {
            setter((prev: any) => ({ ...prev, [name]: value }));
        }

        // Clear any previous error for this field on typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
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
                if (sectionKey === 'userInfo') {
                    setLocalUserInfo(prev => ({ ...prev, dob: adDateString }));
                } else if (sectionKey === 'granterPersonalDetails') {
                    setLocalGranterInfo(prev => ({ ...prev, dob: adDateString }));
                }
            } catch (err) {
                // Ignore invalid BS date conversion
            }
        }
    };

    const handleADDateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, sectionKey: 'userInfo' | 'granterPersonalDetails') => {
        const value = e.target.value;
        const adDateStr = value; // Expected YYYY-MM-DD

        // Update AD date in state and clear error
        handleInputChange(e, sectionKey);

        if (/^\d{4}-\d{2}-\d{2}$/.test(adDateStr)) {
            try {
                const parts = adDateStr.split('-');
                const adYear = parseInt(parts[0]);
                const adMonth = parseInt(parts[1]) - 1; // JS Date months are 0-11
                const adDay = parseInt(parts[2]);

                const adDateObj = new Date(adYear, adMonth, adDay);
                const nd = new NepaliDate(adDateObj);

                const bsYear = nd.getYear();
                const bsMonth = String(nd.getMonth() + 1).padStart(2, '0');
                const bsDay = String(nd.getDate()).padStart(2, '0');

                const bsDateString = `${bsYear}-${bsMonth}-${bsDay}`;
                if (sectionKey === 'userInfo') {
                    setLocalUserInfo(prev => ({ ...prev, dob_bs: bsDateString }));
                } else if (sectionKey === 'granterPersonalDetails') {
                    setLocalGranterInfo(prev => ({ ...prev, dob_bs: bsDateString }));
                }
            } catch (err) {
                // Ignore invalid AD date conversion
            }
        }
    };

    const handleFileDelete = (docType: string, isGranter = false) => {
        setLocalFiles((prev) => {
            if (docType === 'bankStatement') {
                return { ...prev, bankStatement: null };
            }
            if (docType === 'userSignature') {
                return { ...prev, userSignature: null };
            }
            const fileKey = isGranter ? 'granterDocument' : 'citizenshipFile';
            return {
                ...prev,
                [fileKey]: {
                    ...(prev as any)[fileKey],
                    [docType]: null,
                },
            };
        });
    };

    const handleBankSelect = async (section: string, name: string, value: string) => {
        setLocalBankInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
        setLocalInterestRate(banks.find((b) => b.name === value)?.rate || 10);
        const currentOption = emiContextInfo.hasCreditCard === 'yes' ? 'creditCard' : emiContextInfo.hasCreditCard === 'make' ? 'makeCard' : 'downPayment';
        const schema = getValidationSchema(section, currentOption);
        try {
            await schema.validateAt(name, { [name]: value });
            setErrors((prev) => ({ ...prev, [name]: '' }));
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Validation error';
            setErrors((prev) => ({ ...prev, [name]: errorMessage }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docType: string, isGranter = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 300 * 1024) {
            toast.error(`"${file.name}" exceeds 300KB limit. Please upload a smaller file.`, {
                duration: 4000,
                position: 'top-center'
            });
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error(`"${file.name}" is not an image. Please upload an image file (e.g., JPEG, PNG).`, {
                duration: 4000,
                position: 'top-center'
            });
            return;
        }

        setLocalFiles((prev) => {
            if (docType === 'userSignature') {
                return { ...prev, userSignature: file };
            } else if (docType === 'bankStatement') {
                return { ...prev, bankStatement: file };
            } else {
                const fileKey = isGranter ? 'granterDocument' : 'citizenshipFile';
                return {
                    ...prev,
                    [fileKey]: {
                        ...(prev as any)[fileKey],
                        [docType]: file,
                    },
                };
            }
        });
    };

    const handleContinue = async () => {
        if (currentstep === 0) {
            const hasVariants = product && product.variants && product.variants.length > 0;
            const uniqueColors = hasVariants ? Array.from(new Set(product.variants.map(v => v.attributes?.Color))).filter(Boolean) : [];
            if (uniqueColors.length > 1 && !localVariant) {
                toast.error('Please select a product color/variant before continuing.');
                return;
            }
            if (uniqueColors.length === 1 && !localVariant) {
                setLocalVariant(uniqueColors[0]);
            }
            setcurrentstep(1);
            return;
        }
        const currentSection = formSections[selectedOption as keyof typeof formSections]?.find((section) => section.step === currentstep);
        if (currentSection) {
            let data: any = {};
            if (currentSection.sectionKey === 'emiCalculation') {
                data = {
                    ...localEmiCalculation,
                    downPayment: emiData.downPayment,
                    bankname: localBankInfo.bankname,
                    financeAmount: emiData.financeAmount,
                };
            } else {
                data = (currentSection.sectionKey === 'userInfo' ? localUserInfo :
                    currentSection.sectionKey === 'granterPersonalDetails' ? localGranterInfo :
                        currentSection.sectionKey === 'bankinfo' ? localBankInfo : {}) as any;
            }

            const sectionErrors = await validateFormSection(currentSection, data);
            setErrors(sectionErrors);

            if (Object.keys(sectionErrors).length > 0) {
                return;
            }

            const fileErrors: string[] = [];
            const files = localFiles;

            if (selectedOption === 'creditCard') {
                if (currentstep === 2) {
                    if (!files.citizenshipFile.ppphoto) fileErrors.push("Applicant Photo");
                    if (!files.citizenshipFile.front) fileErrors.push("Citizenship Front");
                    if (!files.citizenshipFile.back) fileErrors.push("Citizenship Back");
                }
            } else if (selectedOption === 'downPayment') {
                if (currentstep === 1) {
                    if (!files.citizenshipFile.ppphoto) fileErrors.push("Applicant Photo");
                    if (!files.citizenshipFile.front) fileErrors.push("Citizenship Front");
                    if (!files.citizenshipFile.back) fileErrors.push("Citizenship Back");
                } else if (currentstep === 2) {
                    if (!files.granterDocument.ppphoto) fileErrors.push("Guarantor Photo");
                    if (!files.granterDocument.front) fileErrors.push("Guarantor Citizenship Front");
                    if (!files.granterDocument.back) fileErrors.push("Guarantor Citizenship Back");
                }
            } else if (selectedOption === 'makeCard') {
                if (currentstep === 1) {
                    if (!files.citizenshipFile.ppphoto) fileErrors.push("Applicant Photo");
                    if (!files.citizenshipFile.front) fileErrors.push("Citizenship Front");
                    if (!files.citizenshipFile.back) fileErrors.push("Citizenship Back");
                } else if (currentstep === 2) {
                    if (!files.bankStatement) fileErrors.push("Bank Statement");
                }
            }

            // All options require signature in Step 3
            if (currentstep === 3 && !files.userSignature) {
                fileErrors.push("Your Digital Signature");
            }

            if (fileErrors.length > 0) {
                toast.error(`Missing Required Documents`, {
                    description: (
                        <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px] font-medium">
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
        if (!isLoggedIn) {
            toast.error("Please login to submit your application.");
            setloginDailogOpen(true);
            return;
        }

        if (!product) {
            toast.error("Product not found. Cannot submit application.");
            return;
        }

        const hasVariants = product.variants && product.variants.length > 0;

        if (hasVariants && !localVariant && product.variants.length > 1) {
            toast.error("Please select a product color/variant option.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // Map application type to API expected strings
            const typeMapping: Record<string, string> = {
                'creditCard': 'craditcard',
                'downPayment': 'with_cittizen',
                'makeCard': 'with_new_card_Apply'
            };

            const apiType = typeMapping[selectedOption] || selectedOption;

            // Common Product Data
            const productData = {
                id: product.id,
                varient: localVariant,
                quntioy: 1, // Kept specific naming as requested
                price: productPrice
            };


            // 3. Append Common Files
            const files = localFiles;

            if (files?.citizenshipFile?.ppphoto) formData.append('citizenship_ppphoto', files.citizenshipFile.ppphoto);
            if (files?.citizenshipFile?.front) formData.append('citizenship_front', files.citizenshipFile.front);
            if (files?.citizenshipFile?.back) formData.append('citizenship_back', files.citizenshipFile.back);

            if (files?.bankStatement) formData.append('bank_statement', files.bankStatement);
            if (files?.userSignature) formData.append('user_signature', files.userSignature);

            // 4. Append Type-Specific Files (Only for downPayment/with_cittizen)
            if (selectedOption === 'downPayment' && files?.granterDocument) {
                if (files.granterDocument.ppphoto) formData.append('granter_ppphoto', files.granterDocument.ppphoto);
                if (files.granterDocument.front) formData.append('granter_front', files.granterDocument.front);
                if (files.granterDocument.back) formData.append('granter_back', files.granterDocument.back);
            }

            // Append JSON parts to FormData
            formData.append('product', JSON.stringify(productData));
            formData.append('applicationtype', apiType);
            formData.append('formdata', JSON.stringify({
                personalInfo: localUserInfo,
                bankInfo: localBankInfo,
                emiCalculation: localEmiCalculation,
                ...(selectedOption === 'creditCard' && { creditCard: localCreditCardInfo }),
                ...(selectedOption === 'downPayment' && { granterInfo: localGranterInfo }),
                // for makeCard, bankInfo is already included above
            }));

            // Execute API Request
            const response = await EmiService.EmiRequest(formData);

            if (response && (response.success || response.id || response.status)) {
                toast.success(response.message || 'Application Submitted Successfully!');
                router.push('/profile/emi-requests');
            } else {
                toast.error(response?.message || 'Failed to submit application.');
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
        const hasVariants = product && product.variants && product.variants.length > 0;
        const uniqueColors = hasVariants ? Array.from(new Set(product.variants.map(v => v.attributes?.Color))).filter(Boolean) : [];
        if (uniqueColors.length > 1 && !localVariant) {
            toast.error('Please select a product color/variant before choosing an EMI option.');
            return;
        }

        const minDownPayment = option === 'downPayment' ? '40%' : 0;
        setLocalEmiCalculation(prev => ({ ...prev, downPayment: minDownPayment }));
        setEmiContextInfo((prev) => ({
            ...prev,
            hasCreditCard: option === 'creditCard' ? 'yes' : option === 'makeCard' ? 'make' : 'no',
        }));
        setErrors({});
        setcurrentstep(1);
        setShowPaymentSubOptions(false);
    };

    const tumerOptions = useMemo(() => {
        const tumer = banks.find((bank) => bank.name === localBankInfo.bankname)?.tenureOptions || [];
        return tumer.map(String);
    }, [localBankInfo.bankname, banks]);

    const emiData = useMemo(() => {
        if (!product) return { downPayment: 0, financeAmount: 0, tenure: 0, principal: 0, paymentpermonth: 0 };
        // Always use resolved numeric price
        const result = calculateEMI({
            principal: productPrice,
            tenure: localEmiCalculation.duration,
            downPayment: localEmiCalculation.downPayment,
            bankId: localBankInfo.bankname
        });
        return {
            principal: result.principal,
            tenure: result.tenure,
            downPayment: result.downPayment,
            financeAmount: result.financeAmount,
            paymentpermonth: result.paymentPerMonth,
        };
    }, [product, productPrice, localEmiCalculation.duration, localEmiCalculation.downPayment, localBankInfo.bankname]);

    const bankOptions = useMemo(() => banks.map((b) => b.name), [banks]);

    // ── Form Field Definitions ────────────────────────────────────────────────
    const personalDetailsInfolist = [
        {
            label: 'User Name',
            name: 'name',
            value: localUserInfo.name,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            placeholder: 'Enter user name',
            maxLength: 50,
            svgicon: <User className="w-5 h-5" />,
            extenduserinfo: '',
        },
        {
            label: 'Email',
            name: 'email',
            value: localUserInfo.email,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            placeholder: 'Enter email',
            svgicon: <Mail className="w-5 h-5" />,
            extenduserinfo: '',
            type: 'email',
        },
        {
            label: 'Gender',
            name: 'gender',
            value: localUserInfo.gender,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            type: 'select',
            options: ['Male', 'Female', 'Other'],
            svgicon: <User className="w-5 h-5" />,
            extenduserinfo: '',
        },
        {
            label: 'Marriage Status',
            name: 'marriageStatus',
            value: localUserInfo.marriageStatus,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            type: 'select',
            options: ['Single', 'Married'],
            svgicon: <User className="w-5 h-5" />,
            extenduserinfo: '',
        },
        {
            label: localUserInfo.gender === 'Male' ? 'Wife Name' : 'Husband Name',
            name: 'userpartnerName',
            value: localUserInfo.userpartnerName,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            extenduserinfo: localUserInfo.marriageStatus === 'Single' ? 'hidden' : '',
            svgicon: <User className="w-5 h-5" />,
        },
        {
            label: 'Phone Number',
            name: 'phone',
            value: localUserInfo.phone,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            placeholder: 'Enter phone number',
            svgicon: <Phone className="w-5 h-5" />,
            extenduserinfo: '',
            type: 'tel',
            maxLength: 10,
        },
        {
            label: 'National ID Number',
            name: 'nationalID',
            value: localUserInfo.nationalID,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'userInfo'),
            placeholder: 'Enter national ID number',
            svgicon: <Hash className="w-5 h-5" />,
            extenduserinfo: '',
        },
        {
            label: 'Date of Birth (BS)',
            name: 'dob_bs',
            value: localUserInfo.dob_bs,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleBSDateChange(e, 'userInfo'),
            placeholder: 'Select BS date',
            svgicon: <Calendar className="w-5 h-5" />,
            extenduserinfo: '',
        },
        {
            label: 'Date of Birth (AD)',
            name: 'dob',
            value: localUserInfo.dob,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleADDateChange(e, 'userInfo'),
            type: 'date',
            svgicon: <Calendar className="w-5 h-5" />,
            extenduserinfo: '',
        },
        {
            label: 'Address',
            name: 'address',
            value: localUserInfo.address,
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
            value: localBankInfo.bankname,
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
                if (errors['cardHolderName']) setErrors(prev => ({ ...prev, cardHolderName: '' }));
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
                if (errors['creditCardNumber']) setErrors(prev => ({ ...prev, creditCardNumber: '' }));
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
                if (errors['expiryDate']) setErrors(prev => ({ ...prev, expiryDate: '' }));
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
                if (errors['cardLimit']) setErrors(prev => ({ ...prev, cardLimit: '' }));
            },
            placeholder: 'Card Limit',
            svgicon: <HandCoins className="w-5 h-5" />,
            extenduserinfo: '',
            type: 'number',
            step: "0.01"
        },
    ];


    const bankdetailsInfo = [
        { label: 'Bank Name', name: 'bankname', value: localBankInfo.bankname, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleBankSelect('bankinfo', 'bankname', e.target.value), type: 'select', options: bankOptions, svgicon: <Building2 className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Account Number', name: 'accountNumber', value: localBankInfo.accountNumber, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'bankinfo'), placeholder: 'Enter account number', svgicon: <Hash className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Bank Branch', name: 'bankbranch', value: localBankInfo.bankbranch, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'bankinfo'), placeholder: 'Enter Bank Branch', svgicon: <Building2 className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Salary Amount', name: 'salaryAmount', value: localBankInfo.salaryAmount, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'bankinfo'), placeholder: 'Enter salary amount', svgicon: <DollarSign className="w-5 h-5" />, extenduserinfo: '', type: 'number' },
    ];

    const granterPersonalDetailsList = [
        { label: 'Guarantors Full Name', name: 'name', value: localGranterInfo.name, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), placeholder: 'Enter Guarantor name', svgicon: <User className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Phone Number', name: 'phone', value: localGranterInfo.phone, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), placeholder: 'Enter Phone Number', svgicon: <Phone className="w-5 h-5" />, extenduserinfo: '', type: 'tel', maxLength: 10 },
        { label: 'Gender', name: 'gender', value: localGranterInfo.gender, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), type: 'select', options: ['Male', 'Female'], svgicon: <User className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Marriage Status', name: 'marriageStatus', value: localGranterInfo.marriageStatus, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), type: 'select', options: ['Single', 'Married'], svgicon: <User className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Wife Name / Husband Name', name: 'userpartnerName', value: localGranterInfo.userpartnerName, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), extenduserinfo: localGranterInfo.marriageStatus === 'Single' ? 'hidden' : '', svgicon: <User className="w-5 h-5" /> },
        { label: 'Citizenship Number', name: 'nationalID', value: localGranterInfo.nationalID, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), placeholder: 'Enter citizenship number', svgicon: <Hash className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Date of Birth (BS)', name: 'dob_bs', value: localGranterInfo.dob_bs, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleBSDateChange(e, 'granterPersonalDetails'), placeholder: 'Select BS date', svgicon: <Calendar className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Date of Birth (AD)', name: 'dob', value: localGranterInfo.dob, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleADDateChange(e, 'granterPersonalDetails'), type: 'date', svgicon: <Calendar className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Address', name: 'address', value: localGranterInfo.address, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'granterPersonalDetails'), placeholder: 'Enter Address', maxLength: 100, svgicon: <MapPin className="w-5 h-5" />, extenduserinfo: 'md:col-span-2' },
    ];

    const EmiConditionFields = [
        {
            label: 'Down Payment (Rs.)',
            name: 'downPayment',
            value: localEmiCalculation.downPayment,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'emiCalculation'),
            svgicon: <DollarSign className="w-5 h-5" />,
            extenduserinfo: '',
            placeholder: 'Min 40% required',
            type: 'number',
            helper: emiData.downPayment > 0
                ? `Min: Rs. ${Math.ceil(productPrice * 0.4).toLocaleString()} — Computed: Rs. ${Math.round(emiData.downPayment).toLocaleString()}`
                : `Minimum 40% = Rs. ${Math.ceil(productPrice * 0.4).toLocaleString()}`,
        },
        { label: 'Bank', name: 'bankname', value: localBankInfo.bankname, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleBankSelect('bankinfo', 'bankname', e.target.value), type: 'select', options: bankOptions, placeholder: 'Select Bank', svgicon: <Building2 className="w-5 h-5" />, extenduserinfo: '' },
        { label: 'Duration (months)', name: 'duration', value: localEmiCalculation.duration, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'emiCalculation'), placeholder: 'Select Duration', type: 'select', options: tumerOptions, svgicon: <Calendar className="w-5 h-5" />, extenduserinfo: '' },
        {
            label: 'Finance Amount (auto)',
            name: 'financeAmount',
            value: emiData.financeAmount > 0 ? `Rs. ${Math.round(emiData.financeAmount).toLocaleString()}` : '',
            onChange: () => { },
            svgicon: <DollarSign className="w-5 h-5" />,
            extenduserinfo: '',
            disabled: true,
            placeholder: 'Calculated automatically',
        },
    ];

    const EmiConditionFieldCredit = [
        {
            label: 'Down Payment (Rs.)',
            name: 'downPayment',
            value: localEmiCalculation.downPayment,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'emiCalculation'),
            svgicon: <DollarSign className="w-5 h-5" />,
            extenduserinfo: '',
            placeholder: 'Enter down payment (0 for full credit card)',
            type: 'number',
            helper: emiData.financeAmount > 0
                ? `Finance Amount: Rs. ${Math.round(emiData.financeAmount).toLocaleString()}`
                : null,
        },
        { label: 'Duration (months)', name: 'duration', value: localEmiCalculation.duration, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(e, 'emiCalculation'), placeholder: 'Select Duration', type: 'select', options: tumerOptions, svgicon: <Calendar className="w-5 h-5" />, extenduserinfo: '' },
        {
            label: 'Finance Amount (auto)',
            name: 'financeAmount',
            value: emiData.financeAmount > 0 ? `Rs. ${Math.round(emiData.financeAmount).toLocaleString()}` : '',
            onChange: () => { },
            svgicon: <DollarSign className="w-5 h-5" />,
            extenduserinfo: '',
            disabled: true,
            placeholder: 'Calculated automatically',
        },
    ];



    const formSections = {
        creditCard: [
            { title: 'Credit Card Details', sectionKey: 'bankinfo', step: 1, fields: creditCardDetailsInfo },
            {
                title: 'Personal Details', sectionKey: 'userInfo', step: 2, fields: personalDetailsInfolist, additionalContent: (
                    <div className="mt-6">
                        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Required Documents</h3>
                        <DocumentUpload docTypes={['ppphoto', 'front', 'back']} isGranter={false} files={localFiles} previews={previews} handleFileChange={handleFileChange} handleFileDelete={handleFileDelete} />
                    </div>
                )
            },
            {
                title: 'EMI Conditions', sectionKey: 'emiCalculation', step: 3, fields: EmiConditionFieldCredit, additionalContent: (
                    <div className="mt-6">
                        <SignaturePad
                            onSignatureChange={(file) => setLocalFiles(prev => ({ ...prev, userSignature: file }))}
                            existingSignature={previews['userSignature']}
                        />
                    </div>
                )
            },
        ],
        downPayment: [
            {
                title: 'Personal Details', sectionKey: 'userInfo', step: 1, fields: personalDetailsInfolist, additionalContent: (
                    <div className="mt-6"><h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Required Documents</h3><DocumentUpload docTypes={['ppphoto', 'front', 'back']} isGranter={false} files={localFiles} previews={previews} handleFileChange={handleFileChange} handleFileDelete={handleFileDelete} /></div>
                )
            },
            {
                title: 'Guarantor Information', sectionKey: 'granterPersonalDetails', step: 2, fields: granterPersonalDetailsList, additionalContent: (
                    <div className="mt-6">
                        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Required Documents</h3>
                        <DocumentUpload docTypes={['ppphoto', 'front', 'back']} isGranter={true} files={localFiles} previews={previews} handleFileChange={handleFileChange} handleFileDelete={handleFileDelete} />
                    </div>
                )
            },
            {
                title: 'EMI Conditions', sectionKey: 'emiCalculation', step: 3, fields: EmiConditionFields, additionalContent: (
                    <div className="mt-6">
                        <SignaturePad
                            onSignatureChange={(file) => setLocalFiles(prev => ({ ...prev, userSignature: file }))}
                            existingSignature={previews['userSignature']}
                        />
                    </div>
                )
            },
        ],
        makeCard: [
            {
                title: 'Personal Details', sectionKey: 'userInfo', step: 1, fields: personalDetailsInfolist, additionalContent: (
                    <div className="mt-6">
                        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Required Documents</h3>
                        <DocumentUpload docTypes={['ppphoto', 'front', 'back']} isGranter={false} files={localFiles} previews={previews} handleFileChange={handleFileChange} handleFileDelete={handleFileDelete} />
                    </div>
                )
            },
            {
                title: 'Bank Details', sectionKey: 'bankinfo', step: 2, fields: bankdetailsInfo, additionalContent: (
                    <div className="mt-6">
                        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Required Documents</h3>
                        <DocumentUpload docTypes={['bankStatement']} isGranter={false} files={localFiles} previews={previews} handleFileChange={handleFileChange} handleFileDelete={handleFileDelete} />
                    </div>
                )
            },
            {
                title: 'EMI Conditions', sectionKey: 'emiCalculation', step: 3, fields: EmiConditionFieldCredit, additionalContent: (
                    <div className="mt-6">
                        <SignaturePad
                            onSignatureChange={(file) => setLocalFiles(prev => ({ ...prev, userSignature: file }))}
                            existingSignature={previews['userSignature']}
                        />
                    </div>
                )
            },
        ]
    };

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
            <Button variant="link" className="p-0 h-auto text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] text-sm font-medium" onClick={() => router.push(`/product-details/${product?.slug}`)}>
                {product?.name?.substring(0, 30)}...
            </Button>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-slate-800 font-semibold text-sm">
                Apply EMI
            </span>
        </nav>
    );

    return (
        <div className="bg-gray-50 min-h-screen py-2 sm:py-4">
            <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-5">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1 text-xs mb-3 overflow-x-auto scrollbar-hide">
                    <Button variant="link" className="p-0 h-auto text-(--colour-fsP2) hover:underline text-xs font-medium" onClick={() => router.push('/')}>
                        Home
                    </Button>
                    <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                    <Button variant="link" className="p-0 h-auto text-(--colour-fsP2) hover:underline text-xs font-medium max-w-[180px] truncate" onClick={() => router.push(`/product-details/${product?.slug}`)}>
                        {product?.name?.substring(0, 30)}{product?.name && product.name.length > 30 ? '...' : ''}
                    </Button>
                    <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="text-gray-700 font-semibold whitespace-nowrap">Apply EMI</span>
                </nav>


                {/* Progress Bar */}
                <div className="mb-3">
                    <ProgressBar currentstep={currentstep} onStepClick={setcurrentstep} />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mt-2">
                    {/* Left Column - Steps */}
                    <div className="lg:col-span-2 space-y-3">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                            {/* Step Header */}
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">
                                    {currentstep === 0 && 'Choose EMI Method'}
                                    {currentstep > 0 && currentstep < 4 && currentFormSection?.title}
                                    {currentstep === 4 && 'Review Application'}
                                </h2>
                                <span className="text-[10px] font-bold text-(--colour-fsP2) bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0">
                                    Step {currentstep + 1} of 5
                                </span>
                            </div>

                            <div className="p-3 sm:p-4">
                                {/* Step 0: Option Selection */}
                                {currentstep === 0 && (
                                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">

                                        {/* Variant Selection if Variants exist */}
                                        {product && product.variants && product.variants.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h2 className="text-base font-bold text-gray-800">Select Color / Variant</h2>
                                                    {localVariant && (
                                                        <span className="text-xs font-semibold text-white bg-[var(--colour-fsP2)] px-3 py-1 rounded-full">
                                                            {localVariant}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    {Array.from(new Set(product.variants.map(v => v.attributes?.Color))).filter(Boolean).map((color: string) => {
                                                        const isSelected = localVariant === color;
                                                        const variantImgRecord = product.images?.find(img => img.color === color || img.custom_properties?.color === color);
                                                        const variantImg = variantImgRecord?.url || variantImgRecord?.thumb || product.thumb?.url || product.images?.[0]?.url;

                                                        return (
                                                            <button
                                                                key={color}
                                                                onClick={() => setLocalVariant(color)}
                                                                className={`
                                                                    relative flex items-center gap-3 pl-2 pr-5 py-2 rounded-xl border-2 transition-all duration-200
                                                                    ${isSelected
                                                                        ? 'border-[var(--colour-fsP2)] bg-blue-50 shadow-md shadow-blue-100 ring-2 ring-blue-100'
                                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                                    }
                                                                `}
                                                            >
                                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                                                                    {variantImg ? <Image src={variantImg} alt={color} fill sizes="40px" className="object-contain p-0.5" /> : <div className="bg-gray-200 w-full h-full" />}
                                                                </div>
                                                                <span className={`text-sm font-bold ${isSelected ? 'text-[var(--colour-fsP2)]' : 'text-gray-700'}`}>
                                                                    {color}
                                                                </span>
                                                                {isSelected && <div className="absolute -top-1 -right-1 bg-[var(--colour-fsP2)] text-white rounded-full p-0.5 shadow-sm"><CheckCircle2 size={14} /></div>}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* EMI Method Selection Cards */}
                                        <div className="space-y-4">
                                            {!showPaymentSubOptions ? (
                                                <>
                                                    <h3 className="text-gray-800 font-bold">Select EMI Method</h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {/* Credit Card */}
                                                        <div
                                                            onClick={() => handleOptionSelect('creditCard')}
                                                            className={`cursor-pointer group relative p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${selectedOption === 'creditCard'
                                                                ? 'border-(--colour-fsP2) bg-blue-50/50 shadow-md shadow-blue-100'
                                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all ${selectedOption === 'creditCard' ? 'bg-(--colour-fsP2) text-white' : 'bg-blue-50 text-(--colour-fsP2) group-hover:bg-blue-100'
                                                                }`}>
                                                                <CreditCard className="w-5 h-5" />
                                                            </div>
                                                            <h3 className="font-bold text-gray-900">Credit Card</h3>
                                                            <p className="text-xs text-gray-600 mt-1">Use your existing bank credit card for instant EMI.</p>
                                                            {selectedOption === 'creditCard' && (
                                                                <div className="absolute top-3 right-3 text-(--colour-fsP2)">
                                                                    <CheckCircle2 size={20} />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* With Citizenship */}
                                                        <div
                                                            onClick={() => setShowPaymentSubOptions(true)}
                                                            className={`cursor-pointer group relative p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${selectedOption === 'downPayment' || selectedOption === 'makeCard'
                                                                ? 'border-orange-400 bg-orange-50 shadow-md shadow-orange-100'
                                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all ${selectedOption === 'downPayment' || selectedOption === 'makeCard' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-500 group-hover:bg-orange-100'
                                                                }`}>
                                                                <User className="w-5 h-5" />
                                                            </div>
                                                            <h3 className="font-bold text-gray-900">With Citizenship</h3>
                                                            <p className="text-xs text-gray-600 mt-1">Apply for EMI using your citizenship documents.</p>
                                                            <div className="mt-3 flex items-center text-xs font-semibold text-orange-500">
                                                                View Options <ChevronRight className="w-3 h-3 ml-1" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="flex items-center gap-3 mb-3 border-b border-gray-100 pb-3">
                                                        <Button variant="ghost" size="icon" onClick={() => setShowPaymentSubOptions(false)} className="h-8 w-8 rounded-full border border-gray-200">
                                                            <ArrowBigLeft className="w-4 h-4 text-gray-600" />
                                                        </Button>
                                                        <div>
                                                            <h3 className="text-gray-900 font-bold">Down Payment Options</h3>
                                                            <p className="text-xs text-gray-600">Select how you want to proceed</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {/* Apply for Credit Card */}
                                                        <div
                                                            onClick={() => handleOptionSelect('makeCard')}
                                                            className={`cursor-pointer group relative p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${selectedOption === 'makeCard'
                                                                ? 'border-orange-400 bg-orange-50 shadow-md shadow-orange-100'
                                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all ${selectedOption === 'makeCard' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-500 group-hover:bg-orange-100'
                                                                }`}>
                                                                <CreditCard className="w-5 h-5" />
                                                            </div>
                                                            <h3 className="font-bold text-gray-900">Apply for Credit Card</h3>
                                                            <p className="text-xs text-gray-600 mt-1">Don't have a credit card? Apply for one now.</p>
                                                            {selectedOption === 'makeCard' && (
                                                                <div className="absolute top-3 right-3 text-orange-500"><CheckCircle2 size={20} /></div>
                                                            )}
                                                        </div>

                                                        {/* 40% Down Payment */}
                                                        <div
                                                            onClick={() => handleOptionSelect('downPayment')}
                                                            className={`cursor-pointer group relative p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${selectedOption === 'downPayment'
                                                                ? 'border-(--colour-fsP2) bg-blue-50/50 shadow-md shadow-blue-100'
                                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all ${selectedOption === 'downPayment' ? 'bg-(--colour-fsP2) text-white' : 'bg-blue-50 text-(--colour-fsP2) group-hover:bg-blue-100'
                                                                }`}>
                                                                <Banknote className="w-5 h-5" />
                                                            </div>
                                                            <h3 className="font-bold text-gray-900">40% Downpayment</h3>
                                                            <p className="text-xs text-gray-600 mt-1">Pay 40% upfront, rest over months.</p>
                                                            {selectedOption === 'downPayment' && (
                                                                <div className="absolute top-3 right-3 text-(--colour-fsP2)"><CheckCircle2 size={20} /></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Form Sections: Steps 1, 2, 3 */}
                                {currentstep > 0 && currentstep < 4 && currentFormSection && (
                                    <div className="animate-in slide-in-from-right-4 duration-300 space-y-4">

                                        {currentFormSection.sectionKey === 'bankinfo' && selectedOption === 'creditCard' ? (
                                            <CreditCardform
                                                cardinfofield={{ fields: currentFormSection.fields }}
                                                errors={errors}
                                            />
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1">
                                                {currentFormSection.fields.map((field, index) => (
                                                    (field.name === 'dob_bs' || field.name === 'dob') ? (
                                                        <NepaliDatePicker
                                                            key={index}
                                                            label={field.label}
                                                            name={field.name}
                                                            value={String(field.value ?? '')}
                                                            onChange={field.onChange}
                                                            error={errors[field.name]}
                                                            mode={field.name === 'dob' ? 'AD' : 'BS'}
                                                        />
                                                    ) : (
                                                        <FormField key={index} field={field} error={errors[field.name]} />
                                                    )
                                                ))}
                                            </div>
                                        )}

                                        {/* Additional Content (e.g. Document Uploads, Signatures) */}
                                        {currentFormSection.additionalContent}

                                        {/* Navigation Buttons */}
                                        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
                                            <Button
                                                variant="ghost"
                                                onClick={handleBack}
                                                disabled={currentstep === 0}
                                                className={`gap-2 rounded-xl h-11 text-gray-600 font-semibold hover:bg-gray-100 hover:text-gray-800 ${currentstep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                                            >
                                                <ArrowBigLeft className="w-4 h-4" />
                                                Back
                                            </Button>

                                            <Button
                                                onClick={currentstep === 4 ? handleSubmit : handleContinue}
                                                disabled={isSubmitting}
                                                className="bg-(--colour-fsP2) hover:bg-(--colour-fsP1) text-white px-8 h-11 rounded-xl font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none min-w-[130px]"
                                            >
                                                {isSubmitting ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</>
                                                ) : (
                                                    <>
                                                        {currentstep === 4 ? 'Submit Application' : 'Continue'}
                                                        {currentstep !== 4 && <ChevronRight className="w-4 h-4 ml-1" />}
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
                                            localCreditCardInfo={localCreditCardInfo}
                                            userInfo={localUserInfo}
                                            bankinfo={localBankInfo}
                                            granterPersonalDetails={localGranterInfo}
                                            hasCreditCard={emiContextInfo.hasCreditCard}
                                            selectedVariant={localVariant}
                                            onSignatureChange={(file: File | null) => {
                                                setLocalFiles(prev => ({ ...prev, userSignature: file }));
                                            }}
                                        />
                                        {isSubmitting && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[50] rounded-3xl">
                                                <div className="flex flex-col items-center">
                                                    <Loader2 className="w-10 h-10 text-[var(--colour-fsP2)] animate-spin mb-4" />
                                                    <h3 className="text-xl font-bold text-gray-900">Submitting Application...</h3>
                                                    <p className="text-sm text-gray-600">Please wait while we process your details.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Product Summary */}
                    <div className="lg:col-span-1">
                        <EmiProductDetails
                            emiData={emiData}
                            product={product}
                            selectedVariant={localVariant}
                        />
                    </div>
                </div>

                {/* FAQ Section */}
                <hr className="border-t border-gray-200 mt-8" />
                <EmiFaq params={useMemo(() => ({ type: 'brand', per_page: 10, page: 1 }), [])} />
            </div>
        </div>
    );
};

export default ApplyEmiClient;
