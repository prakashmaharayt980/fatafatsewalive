'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, CheckCircle, ChevronDown, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ProductEMIUI from './EmiProduct';
import { useContextEmi } from './emiContext';
import { ProductDetails } from '@/app/types/ProductDetailsTypes';
import { BannerItem } from '@/app/types/BannerTypes';

interface ClientEmiPageProps {
    initialProduct: ProductDetails | null;
    emiBanner: BannerItem | null;
}

const ClientEmiPage: React.FC<ClientEmiPageProps> = ({ initialProduct, emiBanner }) => {
    const router = useRouter();
    const { emiCalculation, AvailablebankProvider, emiContextInfo } = useContextEmi();

    // Initialize product
    const [product, setProduct] = useState<ProductDetails | null>(initialProduct);
    const [productPrice, setProductPrice] = useState<number>(initialProduct ? Number(initialProduct.discounted_price || initialProduct.price) : 0);

    const [downPaymentOption, setDownPaymentOption] = useState<number | string>(0)
    const [tenure, setTenure] = useState(12);
    const [selectedBank, setSelectedBank] = useState(AvailablebankProvider[0] || {
        id: 'global',
        name: 'Global IME Bank',
        rate: 12,
        img: '/imgfile/bankingPartners1.png',
        tenureOptions: [12, 24, 36]
    })

    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Sync product state
    useEffect(() => {
        if (emiContextInfo.product) {
            setProduct(emiContextInfo.product);
            setProductPrice(Number(emiContextInfo.product.discounted_price || emiContextInfo.product.price));
        } else if (initialProduct) {
            setProduct(initialProduct);
            setProductPrice(Number(initialProduct.discounted_price || initialProduct.price));
        }
    }, [emiContextInfo.product, initialProduct]);

    // Typewriter effect
    const texts = useMemo(
        () => [
            'Available for Mobile Devices',
            'Enjoy your time',
            'Apply Now to Buy with EMI Services',
            'Check Out Our EMI Terms',
        ],
        []
    )

    const emiData = useMemo(() => emiCalculation(
        productPrice,
        tenure,
        downPaymentOption,
        selectedBank.id
    ), [productPrice, tenure, downPaymentOption, selectedBank.id, emiCalculation])


    useEffect(() => {
        const fullText = texts[currentTextIndex];
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (currentText.length < fullText.length) {
                    setCurrentText(fullText.substring(0, currentText.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            } else {
                if (currentText.length > 0) {
                    setCurrentText(fullText.substring(0, currentText.length - 1));
                } else {
                    setIsDeleting(false);
                    setCurrentTextIndex((prev) => (prev + 1) % texts.length);
                }
            }
        }, isDeleting ? 50 : 120);

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentTextIndex, texts]);


    const chooseProduct = (col: string) => {
        if (!product || !product.variants) return;
        const selectedAttribute = product.variants.filter((item) => item.attributes?.Color === col) || [];
        const price = selectedAttribute.length > 0 ? selectedAttribute[0].price : product.price || 0;
        setProductPrice(Number(price));

        // Update product image to match selected variant
        const colorImage = product.images?.find(img => img.color === col || img.custom_properties?.color === col);
        if (colorImage) {
            setProduct((prev) => prev ? ({
                ...prev,
                image: {
                    full: colorImage.url,
                    thumb: colorImage.thumb,
                    preview: colorImage.preview
                }
            }) : null);
        }
        return selectedAttribute;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-[var(--colour-fsP2)] sm:text-4xl">
                        Calculate Your EMI
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Plan your purchase with our easy EMI calculator. Choose your bank, tenure, and down payment to see your monthly breakdown.
                    </p>
                </div>

                {/* Product Selection Component */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <ProductEMIUI
                        chooseProduct={chooseProduct}
                        setProductPrice={setProductPrice}
                        product={product}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT PANEL: Calculator Controls */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-8 border border-gray-100">

                            {/* Input: Product Price */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Product Price (Rs)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={productPrice}
                                        onChange={(e) => setProductPrice(Number(e.target.value))}
                                        className="w-full px-4 py-3 text-lg font-semibold text-gray-900 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[var(--colour-fsP1)] outline-none transition-all"
                                        placeholder="Enter Amount"
                                        min="0"
                                        disabled={!!product}
                                    />
                                    <div className="absolute inset-y-0 right-4 flex items-center text-gray-400 font-medium">
                                        NPR
                                    </div>
                                </div>
                            </div>

                            {/* Option: Down Payment (Custom Input) */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Down Payment <span className="text-gray-400 normal-case">(Min. Rs 0)</span>
                                </label>
                                <div className="relative">
                                    <div className="flex items-center">
                                        <div className="absolute inset-y-0 left-0 bottom-8 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-500 font-bold">Rs.</span>
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            max={productPrice}
                                            value={downPaymentOption === 0 && typeof downPaymentOption !== 'string' ? '' : downPaymentOption}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                if (val >= 0 && val <= productPrice) {
                                                    setDownPaymentOption(val);
                                                }
                                            }}
                                            placeholder="Enter down payment amount"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--colour-fsP1)] text-gray-900 font-semibold"
                                        />
                                    </div>
                                    {/* Quick helper for 0% and 40% */}
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => setDownPaymentOption(0)}
                                            className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-600 transition-colors"
                                        >
                                            Reset to 0
                                        </button>
                                        <button
                                            onClick={() => setDownPaymentOption(Math.ceil(productPrice * 0.4))}
                                            className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-600 transition-colors"
                                        >
                                            Set to 40%
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Option: Select Bank */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Partner Bank
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {AvailablebankProvider.map((bank) => (
                                        <button
                                            key={bank.id}
                                            onClick={() => {
                                                setSelectedBank(bank);
                                                if (!bank.tenureOptions.includes(tenure)) {
                                                    setTenure(bank.tenureOptions[0]);
                                                }
                                            }}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 group relative",
                                                selectedBank.id === bank.id
                                                    ? "bg-[var(--colour-fsP1)]/10 shadow-inner"
                                                    : "bg-white hover:bg-gray-50 hover:shadow-sm"
                                            )}
                                        >
                                            <div className="relative w-12 h-12 flex-shrink-0 bg-white rounded-lg p-1">
                                                <Image
                                                    src={bank.img}
                                                    alt={bank.name}
                                                    fill
                                                    className="object-contain p-1"
                                                    unoptimized
                                                />
                                            </div>
                                            <div>
                                                <div className={cn("font-bold text-sm", selectedBank.id === bank.id ? "text-[var(--colour-fsP1)]" : "text-gray-900")}>
                                                    {bank.name}
                                                </div>
                                            </div>
                                            {selectedBank.id === bank.id && (
                                                <div className="absolute top-1/2 -translate-y-1/2 right-4">
                                                    <CheckCircle className="w-5 h-5 text-[var(--colour-fsP1)]" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Option: Tenure */}
                            {selectedBank && (
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        Tenure (Months)
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedBank.tenureOptions.map((months) => (
                                            <button
                                                key={months}
                                                onClick={() => setTenure(months)}
                                                className={cn(
                                                    "px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border",
                                                    tenure === months
                                                        ? "bg-[var(--colour-fsP1)] text-white border-[var(--colour-fsP1)] shadow-md transform scale-105"
                                                        : "bg-white text-gray-600 border-gray-200 hover:border-[var(--colour-fsP1)] hover:text-[var(--colour-fsP1)]"
                                                )}
                                            >
                                                {months} Months
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={() => console.log("Calculated:", emiData)}
                                    className="flex-1 bg-[var(--colour-fsP1)] hover:bg-blue-700 text-white rounded-xl py-6 font-bold text-base shadow-lg hover:shadow-xl transition-all"
                                >
                                    <Calculator className="w-5 h-5 mr-2" />
                                    Confirm Calculations
                                </Button>
                                <Button
                                    onClick={() => {
                                        setDownPaymentOption(0);
                                        setTenure(selectedBank.tenureOptions[0] || 12);
                                    }}
                                    variant="outline"
                                    className="flex-none px-6 py-6 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold"
                                >
                                    <RefreshCcw className="w-5 h-5 mr-2" />
                                    Reset
                                </Button>
                            </div>

                        </div>
                    </div>


                    {/* RIGHT PANEL: Results Receipt */}
                    <div className="lg:col-span-5 space-y-6 relative h-full">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

                            {/* Receipt Header */}
                            <div className="bg-blue-300/40 p-6 text-center relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-blue-800 text-sm font-medium uppercase tracking-wider mb-1">Your Monthly EMI</p>
                                    <div className="text-4xl font-bold text-blue-900">
                                        Rs {emiData ? emiData.paymentpermonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                    </div>
                                </div>
                            </div>

                            {/* Receipt Body */}
                            <div className="p-6 space-y-6">
                                {/* Bank Info */}
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center">
                                        <Image
                                            src={selectedBank.img}
                                            alt={selectedBank.name}
                                            width={64}
                                            height={64}
                                            className="object-contain"
                                            unoptimized
                                        />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{selectedBank.name}</div>
                                        <div className="text-sm text-gray-500">{tenure} Months Tenure</div>
                                    </div>
                                </div>

                                {/* Financial Details */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                                        <span className="text-gray-600">Product Price</span>
                                        <span className="font-semibold text-gray-900">Rs {productPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                                        <span className="text-gray-600">Down Payment</span>
                                        <span className="font-semibold flex items-center align-middle gap-2 text-green-600">
                                            - Rs {emiData ? emiData.downPayment.toLocaleString() : '0'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                                        <span className="text-gray-600">Finance Amount</span>
                                        <span className="font-semibold text-[var(--colour-fsP1)]">
                                            Rs {emiData ? emiData.financeAmount.toLocaleString() : '0'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Interest Rate</span>
                                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-sm">
                                            Hidden
                                        </span>
                                    </div>
                                </div>

                                {/* Conditional Message Logic: < 40% vs >= 40% */}
                                {((Number(emiData?.downPayment || 0) / Math.max(productPrice, 1)) >= 0.4) ? (
                                    <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg text-center font-medium border border-green-100">
                                        No Additional Charges Apply
                                    </div>
                                ) : (
                                    <div className="bg-orange-50 text-orange-700 text-sm p-3 rounded-lg text-center font-medium border border-orange-100">
                                        Additional charges will be levied on less than 40% down payment
                                    </div>
                                )}

                                {/* Apply Button */}
                                <Button
                                    onClick={() => {
                                        if (!product) return;
                                        const queryParams = new URLSearchParams({
                                            slug: product.slug,
                                            bank: selectedBank.name,
                                            tenure: tenure.toString(),
                                            downPayment: emiData?.downPayment.toString() || '0'
                                        }).toString();
                                        router.push(`/emi/applyemi?${queryParams}`);
                                    }}
                                    className="w-full py-6 bg-blue-900 hover:bg-blue-800 text-white rounded-xl shadow-lg font-bold text-lg mt-4 group"
                                >
                                    Apply Now
                                    <ChevronDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform" />
                                </Button>

                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-500 animate-pulse">
                                        {currentText}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Eligibility Card */}
                        <div className="bg-green-300/40 rounded-2xl p-6 border border-green-100">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Eligibility Criteria
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-700">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    Age: 21 - 65 years
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    Minimum Income: Rs 25,000/month
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    Employment: 6+ months at current job
                                </li>
                            </ul>
                        </div>

                        {/* Promo Banner - Banner2 Style */}
                        {emiBanner && emiBanner.images && emiBanner.images.length > 0 ? (
                            <Link
                                href={emiBanner.images[0]?.link || '#'}
                                className={cn(
                                    'block relative overflow-hidden rounded-xl group cursor-pointer',
                                    'aspect-[21/9]',
                                    'transition-all duration-300',
                                    'shadow-lg hover:shadow-xl'
                                )}
                            >
                                <Image
                                    src={emiBanner.images[0]?.image?.full || ''}
                                    alt={emiBanner.images[0]?.content || 'EMI Promo Banner'}
                                    fill
                                    className="object-contain transition-transform duration-700 "
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </Link>
                        ) : (
                            <div className={cn(
                                'relative overflow-hidden rounded-2xl',
                                'aspect-[4.9/1.8]',
                                'bg-gradient-to-br from-[var(--colour-fsP2)]/10 to-[var(--colour-fsP1)]/10',
                                'flex items-center justify-center',
                                'shadow-lg'
                            )}>
                                <div className="text-center p-6">
                                    <h3 className="text-lg font-bold text-gray-700 mb-2">Easy EMI Options</h3>
                                    <p className="text-sm text-gray-500">Get your favorite products on affordable EMI plans</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientEmiPage;
