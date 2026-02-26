'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calculator, CheckCircle, ChevronDown, RefreshCcw, ShoppingBag, ArrowRight, FileText, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ProductEMIUI from './EmiProduct';
import { useContextEmi } from './emiContext';
import { calculateEMI, BANK_PROVIDERS as AvailablebankProvider } from './_func_emiCalacutor';
import { ProductDetails } from '@/app/types/ProductDetailsTypes';
import { BannerItem } from '@/app/types/BannerTypes';

interface ClientEmiPageProps {
    initialProduct: ProductDetails | null;
    emiBanner: BannerItem | null;
}

const ClientEmiPage: React.FC<ClientEmiPageProps> = ({ initialProduct, emiBanner }) => {
    const router = useRouter();
    const { emiContextInfo } = useContextEmi();

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

    const emiData = useMemo(() => calculateEMI({
        principal: productPrice,
        tenure,
        downPayment: downPaymentOption,
        bankId: selectedBank.id
    }), [productPrice, tenure, downPaymentOption, selectedBank.id])


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
        <div className="min-h-screen bg-[var(--colour-bg4)] font-sans">

            {/* ═══ HERO HEADER ═══ */}
            <section className="relative bg-gradient-to-br from-[#E8F0FE] via-[#F0F6FF] to-[#E0ECFA] pt-10 pb-20 md:pt-12 md:pb-24 overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--colour-fsP2)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-[var(--colour-fsP1)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-[var(--colour-fsP2)]/20 rounded-full px-4 py-1.5 mb-4 shadow-sm">
                        <Calculator className="w-4 h-4 text-[var(--colour-fsP2)]" />
                        <span className="text-xs font-bold text-[var(--colour-fsP2)] uppercase tracking-wider">EMI Calculator</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--colour-fsP2)] mb-3 tracking-tight">
                        Calculate Your EMI
                    </h1>
                    <p className="text-[var(--colour-text3)] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                        Plan your purchase with our easy EMI calculator. Choose your bank, tenure, and down payment to see your monthly breakdown.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                        <Link
                            href="/emi/eligibility"
                            className="inline-flex items-center gap-2 bg-[var(--colour-fsP2)] text-white font-bold text-sm px-6 py-3 rounded-full shadow-lg shadow-[var(--colour-fsP2)]/20 hover:shadow-xl transition-all cursor-pointer"
                            aria-label="Scroll to check EMI eligibility"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Check Eligibility
                        </Link>
                        <Link
                            href="/emi/shop"
                            className="inline-flex items-center gap-2 bg-white text-[var(--colour-fsP2)] font-bold text-sm px-6 py-3 rounded-full border-2 border-[var(--colour-fsP2)]/30 hover:border-[var(--colour-fsP2)] shadow-sm hover:shadow-md transition-all cursor-pointer"
                            aria-label="Go to Shop by EMI page"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Shop by EMI
                        </Link>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 lg:px-8 -mt-10 md:-mt-14 relative z-20 pb-12">

                {/* Product Selection Component */}
                <div className="bg-white rounded-2xl shadow-[var(--shadow-premium-lg)] overflow-hidden border border-[var(--colour-border3)] mb-8">
                    <ProductEMIUI
                        chooseProduct={chooseProduct}
                        setProductPrice={setProductPrice}
                        product={product}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                    {/* LEFT PANEL: Calculator Controls */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-2xl shadow-[var(--shadow-premium-md)] border border-[var(--colour-border3)] overflow-hidden">
                            {/* Panel Header */}
                            <div className="bg-gradient-to-r from-[var(--colour-fsP2)] to-[#1565C0] px-6 py-3.5 flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                    <Calculator className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-white font-bold text-base">Configure EMI Plan</h2>
                            </div>

                            <div className="p-6 sm:p-7 space-y-7">

                                {/* Input: Product Price */}
                                <div className="space-y-2.5">
                                    <label className="text-sm font-bold text-[var(--colour-text2)] flex items-center gap-1.5">
                                        Product Price
                                        <span className="text-[var(--colour-text3)] font-normal text-xs">(NPR)</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={productPrice}
                                            onChange={(e) => setProductPrice(Number(e.target.value))}
                                            className="w-full px-4 py-3.5 text-lg font-bold text-[var(--colour-text2)] bg-[var(--colour-bg4)] border-2 border-[var(--colour-border3)] rounded-xl focus:border-[var(--colour-fsP2)] focus:ring-3 focus:ring-[var(--colour-fsP2)]/10 outline-none transition-all"
                                            placeholder="Enter Amount"
                                            min="0"
                                            disabled={!!product}
                                        />
                                        <div className="absolute inset-y-0 right-4 flex items-center">
                                            <span className="text-xs font-bold text-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/10 px-2.5 py-1 rounded-md">NPR</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Down Payment */}
                                <div className="space-y-2.5">
                                    <label className="text-sm font-bold text-[var(--colour-text2)]">
                                        Down Payment
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                            <span className="text-sm font-bold text-[var(--colour-fsP2)]">Rs.</span>
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
                                            placeholder="Enter down payment"
                                            className="w-full pl-12 pr-4 py-3.5 bg-[var(--colour-bg4)] border-2 border-[var(--colour-border3)] rounded-xl focus:border-[var(--colour-fsP2)] focus:ring-3 focus:ring-[var(--colour-fsP2)]/10 outline-none text-[var(--colour-text2)] font-semibold transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-1.5">
                                        <button onClick={() => setDownPaymentOption(0)}
                                            className="text-xs font-semibold bg-[var(--colour-bg4)] hover:bg-[var(--colour-fsP2)]/10 px-3.5 py-1.5 rounded-full text-[var(--colour-text3)] hover:text-[var(--colour-fsP2)] border border-[var(--colour-border3)] transition-all">
                                            0% downpayment
                                        </button>
                                        <button onClick={() => setDownPaymentOption(Math.ceil(productPrice * 0.4))}
                                            className="text-xs font-semibold bg-[var(--colour-bg4)] hover:bg-[var(--colour-fsP2)]/10 px-3.5 py-1.5 rounded-full text-[var(--colour-text3)] hover:text-[var(--colour-fsP2)] border border-[var(--colour-border3)] transition-all">
                                            40% downpayment
                                        </button>
                                    </div>
                                </div>

                                {/* Select Bank */}
                                <div className="space-y-2.5">
                                    <label className="text-sm font-bold text-[var(--colour-text2)]">
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
                                                    "flex items-center gap-3.5 p-3.5 rounded-xl text-left transition-all duration-200 group relative border-2",
                                                    selectedBank.id === bank.id
                                                        ? "border-[var(--colour-fsP2)] bg-blue-50/60 shadow-sm"
                                                        : "border-[var(--colour-border3)] bg-white hover:border-[var(--colour-fsP2)]/40 hover:shadow-sm"
                                                )}
                                            >
                                                <div className="relative w-11 h-11 flex-shrink-0 bg-white rounded-lg border border-gray-100 overflow-hidden">
                                                    <Image
                                                        src={bank.img}
                                                        alt={bank.name}
                                                        fill
                                                        className="object-contain p-1.5"
                                                        unoptimized
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className={cn("font-bold text-sm truncate", selectedBank.id === bank.id ? "text-[var(--colour-fsP2)]" : "text-[var(--colour-text2)]")}>
                                                        {bank.name}
                                                    </div>
                                                </div>
                                                {selectedBank.id === bank.id && (
                                                    <div className="w-5 h-5 bg-[var(--colour-fsP2)] rounded-full flex items-center justify-center shrink-0">
                                                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tenure */}
                                {selectedBank && (
                                    <div className="space-y-2.5">
                                        <label className="text-sm font-bold text-[var(--colour-text2)] mb-2">
                                            Tenure
                                        </label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedBank.tenureOptions.map((months) => (
                                                <button
                                                    key={months}
                                                    onClick={() => setTenure(months)}
                                                    className={cn(
                                                        "px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border-2",
                                                        tenure === months
                                                            ? "bg-[var(--colour-fsP2)] text-white border-[var(--colour-fsP2)] shadow-md shadow-[var(--colour-fsP2)]/20 scale-105"
                                                            : "bg-white text-[var(--colour-text3)] border-[var(--colour-border3)] hover:border-[var(--colour-fsP2)]/50 hover:text-[var(--colour-fsP2)]"
                                                    )}
                                                >
                                                    {months} Months
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="pt-2 flex gap-2.5">
                                    <Button
                                        onClick={() => console.log("Calculated:", emiData)}
                                        className="flex-1 bg-gradient-to-r from-[var(--colour-fsP2)] to-[#1565C0] hover:from-[#1565C0] hover:to-[var(--colour-fsP2)] text-white rounded-lg py-3 font-bold text-sm shadow-md shadow-[var(--colour-fsP2)]/15 hover:shadow-lg transition-all"
                                    >
                                        <Calculator className="w-4 h-4 mr-1.5" />
                                        Confirm Calculations
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setDownPaymentOption(0);
                                            setTenure(selectedBank.tenureOptions[0] || 12);
                                        }}
                                        variant="outline"
                                        className="px-4 py-3 border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 rounded-lg font-semibold text-sm transition-all"
                                    >
                                        <RefreshCcw className="w-4 h-4 mr-1.5" />
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* RIGHT PANEL: Results Receipt */}
                    <div className="lg:col-span-5 space-y-6 relative h-full">
                        <div className="bg-white rounded-2xl shadow-[var(--shadow-premium-md)] overflow-hidden border border-[var(--colour-border3)]">

                            {/* Receipt Header */}
                            <div className="bg-gradient-to-br from-[var(--colour-fsP2)] to-[#1565C0] p-6 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
                                <div className="relative z-10">
                                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">Your Monthly EMI</p>
                                    <div className="text-4xl lg:text-[2.75rem] font-extrabold text-white tracking-tight">
                                        Rs {emiData ? Math.round(emiData.paymentPerMonth).toLocaleString() : '0'}
                                    </div>
                                    <p className="text-white/60 text-xs mt-1.5 font-medium">per month</p>
                                </div>
                            </div>

                            {/* Receipt Body */}
                            <div className="p-5 sm:p-6 space-y-5">
                                {/* Bank Info */}
                                <div className="flex items-center gap-3.5 p-3.5 bg-[var(--colour-bg4)] rounded-xl border border-[var(--colour-border3)]">
                                    <div className="w-12 h-12 bg-white rounded-lg p-1.5 flex items-center justify-center border border-gray-100 shrink-0">
                                        <Image
                                            src={selectedBank.img}
                                            alt={selectedBank.name}
                                            width={48}
                                            height={48}
                                            className="object-contain"
                                            unoptimized
                                        />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-[var(--colour-text2)]">{selectedBank.name}</div>
                                        <div className="text-xs text-[var(--colour-text3)] font-medium">{tenure} Months Tenure</div>
                                    </div>
                                </div>

                                {/* Financial Details */}
                                <div className="bg-[var(--colour-bg4)] rounded-xl divide-y divide-[var(--colour-border3)] border border-[var(--colour-border3)]">
                                    <div className="flex justify-between items-center px-4 py-3">
                                        <span className="text-sm text-[var(--colour-text3)]">Product Price</span>
                                        <span className="text-sm font-bold text-[var(--colour-text2)]">Rs {productPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-3">
                                        <span className="text-sm text-[var(--colour-text3)]">Down Payment</span>
                                        <span className="text-sm font-bold text-[var(--colour-bg3)]">
                                            - Rs {emiData ? Math.round(Number(emiData.downPayment)).toLocaleString() : '0'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-3">
                                        <span className="text-sm text-[var(--colour-text3)]">Finance Amount</span>
                                        <span className="text-sm font-bold text-[var(--colour-fsP2)]">
                                            Rs {emiData ? Math.round(emiData.financeAmount).toLocaleString() : '0'}
                                        </span>
                                    </div>

                                </div>

                                {/* Conditional Message */}
                                {((Number(emiData?.downPayment || 0) / Math.max(productPrice, 1)) >= 0.4) ? (
                                    <div className="bg-emerald-50 text-emerald-700 text-xs p-2.5 rounded-lg text-center font-semibold border border-emerald-200 flex items-center justify-center gap-1.5">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        No Additional Charges Apply
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 text-amber-700 text-xs p-2.5 rounded-lg text-center font-semibold border border-amber-200">
                                        Additional charges on &lt;40% down payment
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
                                    className="w-full py-3.5 bg-gradient-to-r from-[#166534] to-[#15803d] hover:from-[#14532d] hover:to-[#166534] text-white rounded-lg shadow-md shadow-green-800/15 font-bold text-sm group transition-all"
                                >
                                    Apply Now
                                    <ChevronDown className="ml-1.5 w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                </Button>

                                <p className="text-center text-xs font-medium text-gray-400">
                                    {currentText}<span className="animate-pulse">|</span>
                                </p>
                            </div>
                        </div>



                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientEmiPage;


