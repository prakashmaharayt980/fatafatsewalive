'use client'

import React, { useState } from 'react'
import {
    Check, ChevronRight, Smartphone, AlertCircle, RefreshCw,
    BadgePercent, HelpCircle, Truck, Wallet, ShieldCheck,
    Info, ChevronDown, CheckCircle2, XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

// --- Mock Data ---
const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Google', 'Oppo', 'Vivo', 'Realme']
const MODELS: Record<string, string[]> = {
    Apple: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone 11', 'iPhone XR', 'iPhone X'],
    Samsung: ['Galaxy S24 Ultra', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23', 'Galaxy Z Fold 5', 'Galaxy A54', 'Galaxy M34'],
    OnePlus: ['OnePlus 12', 'OnePlus 11', 'OnePlus 11R', 'OnePlus Nord 3', 'OnePlus 10 Pro'],
    Xiaomi: ['Xiaomi 14', 'Xiaomi 13 Pro', 'Redmi Note 13 Pro+', 'Redmi Note 12'],
}
const VARIANTS = ['64GB', '128GB', '256GB', '512GB', '1TB']

// --- Types ---
type ConditionState = {
    switchesOn: boolean | null;
    screenDamage: boolean | null;
    bodyDamage: boolean | null;
    cameraIssue: boolean | null;
}

export default function ExchangePage() {
    const [step, setStep] = useState(1)

    // Step 1: Selection
    const [selectedBrand, setSelectedBrand] = useState('')
    const [selectedModel, setSelectedModel] = useState('')
    const [selectedVariant, setSelectedVariant] = useState('')

    // Step 2: Condition
    const [conditions, setConditions] = useState<ConditionState>({
        switchesOn: null,
        screenDamage: null,
        bodyDamage: null,
        cameraIssue: null
    })
    const [imei, setImei] = useState('')

    // Step 3: Result
    const [isVerifying, setIsVerifying] = useState(false)
    const [exchangeValue, setExchangeValue] = useState<number | null>(null)

    const availableModels = selectedBrand ? MODELS[selectedBrand] || [] : []

    // Helper to check if Step 2 is complete
    const isStep2Complete =
        conditions.switchesOn !== null &&
        conditions.screenDamage !== null &&
        conditions.bodyDamage !== null &&
        conditions.cameraIssue !== null &&
        imei.length === 15

    const handleCalculate = () => {
        setIsVerifying(true)
        // Simulate API call and logic
        setTimeout(() => {
            setIsVerifying(false)

            // Basic mock logic for value
            let baseValue = 30000 // Default base
            if (selectedBrand === 'Apple') baseValue = 50000
            if (selectedBrand === 'Samsung') baseValue = 40000

            // Deductions
            if (!conditions.switchesOn) baseValue = 0 // Rejected usually, but let's say 0 for logic
            else {
                if (conditions.screenDamage) baseValue *= 0.6
                if (conditions.bodyDamage) baseValue *= 0.8
                if (conditions.cameraIssue) baseValue *= 0.7
            }

            // Floor value
            setExchangeValue(Math.floor(baseValue))
            setStep(3)
        }, 1500)
    }

    const resetFlow = () => {
        setStep(1)
        setExchangeValue(null)
        setConditions({ switchesOn: null, screenDamage: null, bodyDamage: null, cameraIssue: null })
        setImei('')
    }

    return (
        <div className="min-h-screen bg-[var(--colour-bg4)] font-sans">
            {/* Hero Section */}
            <div className="bg-[var(--colour-fsP2)] text-white py-12 md:py-16">
                <div className="container mx-auto px-4 text-center space-y-4">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Exchange Your Old Device</h1>
                    <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
                        Get the best value for your old smartphone in 3 easy steps.
                        Instant discount on your new purchase.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 mb-16 relative z-10">
                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Info & Trust */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* How It Works Card */}
                        <Card className="bg-white border-none shadow-premium-md overflow-hidden">
                            <CardHeader className="bg-blue-50/50 pb-4">
                                <CardTitle className="text-[var(--colour-fsP2)] flex items-center gap-2">
                                    <RefreshCw className="h-5 w-5" /> How It Works
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 relative">
                                <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-blue-100 z-0"></div>
                                <div className="space-y-8 relative z-10">
                                    <div className="flex gap-4">
                                        <div className="h-14 w-14 rounded-full bg-white border-2 border-[var(--colour-fsP2)] flex items-center justify-center shrink-0 shadow-sm text-[var(--colour-fsP2)]">
                                            <Smartphone className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Check Price</h4>
                                            <p className="text-sm text-gray-600 mt-1">Select your device & condition to see how much it's worth.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-14 w-14 rounded-full bg-white border-2 border-[var(--colour-fsP2)] flex items-center justify-center shrink-0 shadow-sm text-[var(--colour-fsP2)]">
                                            <Truck className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Schedule Pickup</h4>
                                            <p className="text-sm text-gray-600 mt-1">Executive will pick up the device from your doorstep.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-14 w-14 rounded-full bg-white border-2 border-[var(--colour-fsP2)] flex items-center justify-center shrink-0 shadow-sm text-[var(--colour-fsP2)]">
                                            <Wallet className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Get Paid</h4>
                                            <p className="text-sm text-gray-600 mt-1">Instant discount on new phone or cash/bank transfer.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Why Fatafat Sewa? */}
                        <Card className="bg-white border-none shadow-premium-sm">
                            <CardHeader>
                                <CardTitle className="text-gray-900 text-lg">Why Fatafat Exchange?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold block text-sm">Safe & Secure</span>
                                        <span className="text-xs text-gray-500">Data wiped in front of you</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <BadgePercent className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold block text-sm">Best Market Value</span>
                                        <span className="text-xs text-gray-500">AI-driven pricing engine</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Truck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold block text-sm">Free Doorstep Pickup</span>
                                        <span className="text-xs text-gray-500">Available across major cities</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Main Form */}
                    <div className="lg:col-span-8">
                        <Card className="border-none shadow-premium-lg bg-white overflow-hidden min-h-[600px] flex flex-col">
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-100 h-1.5">
                                <div
                                    className="bg-[var(--colour-fsP2)] h-1.5 transition-all duration-500 ease-out"
                                    style={{ width: `${(step / 3) * 100}%` }}
                                ></div>
                            </div>

                            <div className="flex-1 p-6 md:p-8">
                                {/* Step 1: Device Details */}
                                {step === 1 && (
                                    <div className="animate-fade-in space-y-6">
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Select Your Device</h2>
                                            <p className="text-gray-500">Identify the phone you want to exchange.</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-gray-700 font-medium ml-1">Brand</Label>
                                                <Select value={selectedBrand} onValueChange={(val) => { setSelectedBrand(val); setSelectedModel(''); }}>
                                                    <SelectTrigger className="h-12 bg-white border-gray-200 focus:ring-2 focus:ring-[var(--colour-fsP2)] focus:border-transparent rounded-xl shadow-sm hover:border-[var(--colour-fsP2)] transition-colors">
                                                        <SelectValue placeholder="Select Brand" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white/95 backdrop-blur-md border border-gray-100 shadow-premium-lg rounded-xl">
                                                        {BRANDS.map(b => <SelectItem key={b} value={b} className="focus:bg-blue-50 focus:text-[var(--colour-fsP2)] cursor-pointer py-3">{b}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-gray-700 font-medium ml-1">Model</Label>
                                                <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedBrand}>
                                                    <SelectTrigger className="h-12 bg-white border-gray-200 focus:ring-2 focus:ring-[var(--colour-fsP2)] focus:border-transparent rounded-xl shadow-sm hover:border-[var(--colour-fsP2)] transition-colors">
                                                        <SelectValue placeholder={!selectedBrand ? "Select Brand First" : "Select Model"} />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white/95 backdrop-blur-md border border-gray-100 shadow-premium-lg rounded-xl max-h-[300px]">
                                                        {availableModels.map(m => <SelectItem key={m} value={m} className="focus:bg-blue-50 focus:text-[var(--colour-fsP2)] cursor-pointer py-3">{m}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-gray-700 font-medium ml-1">Storage Variant</Label>
                                                <Select value={selectedVariant} onValueChange={setSelectedVariant} disabled={!selectedModel}>
                                                    <SelectTrigger className="h-12 bg-white border-gray-200 focus:ring-2 focus:ring-[var(--colour-fsP2)] focus:border-transparent rounded-xl shadow-sm hover:border-[var(--colour-fsP2)] transition-colors">
                                                        <SelectValue placeholder={!selectedModel ? "Select Model First" : "Select Storage"} />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white/95 backdrop-blur-md border border-gray-100 shadow-premium-lg rounded-xl">
                                                        {VARIANTS.map(v => <SelectItem key={v} value={v} className="focus:bg-blue-50 focus:text-[var(--colour-fsP2)] cursor-pointer py-3">{v}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {selectedBrand && selectedModel && (
                                            <div className="mt-8 p-5 bg-white border border-blue-100 rounded-2xl flex items-center gap-5 animate-slide-up shadow-sm">
                                                <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 p-2">
                                                    <img src="/imgfile/logoimg.png" alt="Fatafat Logo" className="w-full h-full object-contain opacity-80" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[var(--colour-fsP2)] font-bold uppercase tracking-widest mb-1">Exchange Device</p>
                                                    <h3 className="font-bold text-gray-900 text-xl">{selectedBrand} {selectedModel}</h3>
                                                    <p className="text-gray-500 text-sm mt-0.5">{selectedVariant}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 2: Detailed Condition Questionnaire */}
                                {step === 2 && (
                                    <div className="animate-fade-in space-y-6">
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Device Condition</h2>
                                            <p className="text-gray-500">Answer a few questions to get the exact value.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <ConditionQuestion
                                                label="Does the phone switch on and work normally?"
                                                subLabel="Device should not restart loop or hang on logo."
                                                value={conditions.switchesOn}
                                                onChange={(val) => setConditions(prev => ({ ...prev, switchesOn: val }))}
                                            />

                                            {conditions.switchesOn !== false && (
                                                <>
                                                    <ConditionQuestion
                                                        label="Is the screen damage-free?"
                                                        subLabel="No cracks, spots, lines, or dead pixels."
                                                        value={conditions.screenDamage === null ? null : !conditions.screenDamage}
                                                        onChange={(val) => setConditions(prev => ({ ...prev, screenDamage: !val }))}
                                                    />

                                                    <ConditionQuestion
                                                        label="Is the body scratch-less and dent-free?"
                                                        subLabel="No major dents, bent body, or missing buttons."
                                                        value={conditions.bodyDamage === null ? null : !conditions.bodyDamage}
                                                        onChange={(val) => setConditions(prev => ({ ...prev, bodyDamage: !val }))}
                                                    />

                                                    <ConditionQuestion
                                                        label="Is the camera working perfectly?"
                                                        subLabel="No blur, dust inside lens, or focus issues."
                                                        value={conditions.cameraIssue === null ? null : !conditions.cameraIssue}
                                                        onChange={(val) => setConditions(prev => ({ ...prev, cameraIssue: !val }))}
                                                    />
                                                </>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t mt-6">
                                            <Label className="text-base font-semibold mb-2 block">Verify IMEI</Label>
                                            <div className="flex gap-3">
                                                <div className="relative flex-1">
                                                    <Input
                                                        placeholder="Enter 15-digit IMEI Number (e.g. 1234 5678...)"
                                                        value={imei.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')}
                                                        onChange={(e) => {
                                                            const rawValue = e.target.value.replace(/\D/g, '');
                                                            if (rawValue.length <= 15) {
                                                                setImei(rawValue);
                                                            }
                                                        }}
                                                        className={`h-14 pl-5 text-lg font-mono tracking-widest rounded-xl transition-all duration-300 shadow-sm ${imei.length === 15 ?
                                                            'border-[var(--colour-yellow1)] focus-visible:ring-[var(--colour-yellow1)] bg-yellow-50/10' :
                                                            'border-gray-200 focus-visible:ring-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)]'}`}
                                                    />
                                                    {imei.length === 15 ? (
                                                        <div className="absolute right-4 top-4 bg-yellow-50 rounded-full p-1 animate-scale-in">
                                                            <CheckCircle2 className="h-5 w-5 text-[var(--colour-yellow1)]" />
                                                        </div>
                                                    ) : (
                                                        imei.length > 0 && (
                                                            <div className="absolute right-4 top-4.5 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                                                {imei.length}/15
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Valuation Result */}
                                {step === 3 && (
                                    <div className="animate-scale-in text-center py-8">
                                        <div className="inline-flex items-center justify-center p-4 bg-yellow-50 rounded-full mb-6">
                                            <BadgePercent className="h-12 w-12 text-[var(--colour-yellow1)]" />
                                        </div>

                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Exchange Value</h2>
                                        <div className="text-5xl md:text-6xl font-extrabold text-[var(--colour-fsP2)] my-6 font-price drop-shadow-sm">
                                            ₹{exchangeValue?.toLocaleString()}
                                        </div>

                                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                            This amount will be deducted from your new phone purchase.
                                            <br /><span className="text-xs text-gray-400">*Subject to physical verification at pickup</span>
                                        </p>

                                        <div className="bg-white rounded-2xl p-6 max-w-md mx-auto mb-8 border border-gray-100 shadow-premium-md text-left transition-all hover:shadow-premium-lg">
                                            <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 flex justify-between items-center">
                                                Exchange Summary
                                                <CheckCircle2 className="h-4 w-4 text-[var(--colour-yellow1)]" />
                                            </h4>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Device</span>
                                                    <span className="font-medium">{selectedBrand} {selectedModel}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Condition</span>
                                                    <span className="font-medium text-[var(--colour-yellow1)]">Verified</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">IMEI</span>
                                                    <span className="font-mono text-gray-500">{imei}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="bg-gray-50 px-8 py-5 border-t flex items-center justify-between">
                                {step === 1 ? (
                                    <div className="text-xs text-gray-500 hidden md:block">
                                        <span className="font-semibold text-[var(--colour-fsP2)]">Tip:</span> Use correct storage size for accurate value
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            if (step === 3) resetFlow();
                                            else setStep(step - 1);
                                        }}
                                        className="text-gray-600 hover:text-gray-900"
                                    >
                                        {step === 3 ? 'Check Another' : 'Back'}
                                    </Button>
                                )}

                                <div>
                                    {step === 1 && (
                                        <Button
                                            onClick={() => setStep(2)}
                                            disabled={!selectedBrand || !selectedModel || !selectedVariant}
                                            className="bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/90 h-12 px-8 min-w-[140px] text-lg rounded-xl shadow-premium-md hover:shadow-premium-lg transition-all duration-300 hover:scale-[1.02]"
                                        >
                                            Next <ChevronRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    )}
                                    {step === 2 && (
                                        <Button
                                            onClick={handleCalculate}
                                            disabled={!isStep2Complete || isVerifying || conditions.switchesOn === false}
                                            className="bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/90 h-12 px-8 min-w-[170px] text-lg rounded-xl shadow-premium-md hover:shadow-premium-lg transition-all duration-300 hover:scale-[1.02]"
                                        >
                                            {isVerifying ? 'Calculating...' : 'Get Value'}
                                        </Button>
                                    )}
                                    {step === 3 && (
                                        <Button className="bg-[var(--colour-yellow1)] hover:bg-[var(--colour-yellow1)]/90 text-white h-12 px-10 text-lg rounded-xl shadow-premium-md hover:shadow-premium-lg transition-all duration-300 hover:scale-[1.05] font-semibold">
                                            Shop New Phones
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-20 max-w-3xl mx-auto pb-16">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-full mb-3">
                            <HelpCircle className="h-6 w-6 text-[var(--colour-fsP2)]" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                        <p className="text-gray-500 mt-2">Everything you need to know about the exchange process.</p>
                    </div>

                    <Accordion type="single" collapsible className="w-full space-y-4">
                        <AccordionItem value="item-1" className="border border-gray-100 rounded-2xl bg-white shadow-premium-sm px-6 hover:shadow-premium-md transition-shadow">
                            <AccordionTrigger className="hover:no-underline font-semibold text-gray-800 text-lg py-5">
                                How is the exchange value calculated?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-5 leading-relaxed">
                                The value is calculated based on the current market price of your device model, its age, and the condition details you provide (screen, body, camera logic). Better condition yields a higher value.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border border-gray-100 rounded-2xl bg-white shadow-premium-sm px-6 hover:shadow-premium-md transition-shadow">
                            <AccordionTrigger className="hover:no-underline font-semibold text-gray-800 text-lg py-5">
                                When do I hand over my old phone?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-5 leading-relaxed">
                                You need to hand over your old device at the time of delivery of your new product. Our field executive will verify the condition before collection.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="border border-gray-100 rounded-2xl bg-white shadow-premium-sm px-6 hover:shadow-premium-md transition-shadow">
                            <AccordionTrigger className="hover:no-underline font-semibold text-gray-800 text-lg py-5">
                                What if my phone condition is different?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-5 leading-relaxed">
                                If the actual condition differs during pickup verification, the exchange value may assume a re-quote. You can choose to pay the difference or cancel the exchange.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4" className="border border-gray-100 rounded-2xl bg-white shadow-premium-sm px-6 hover:shadow-premium-md transition-shadow">
                            <AccordionTrigger className="hover:no-underline font-semibold text-gray-800 text-lg py-5">
                                Do I need to provide any accessories?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-5 leading-relaxed">
                                While original chargers and boxes can sometimes fetch a better price, they are not mandatory for all exchanges. The phone unit itself is the primary requirement.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    )
}

// Helper Component for Step 2 Questions
function ConditionQuestion({ label, subLabel, value, onChange }: {
    label: string,
    subLabel: string,
    value: boolean | null,
    onChange: (val: boolean) => void
}) {
    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h4 className="font-semibold text-gray-900">{label}</h4>
                <p className="text-xs text-gray-500">{subLabel}</p>
            </div>
            <div className="flex gap-3 shrink-0">
                <button
                    onClick={() => onChange(true)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all",
                        value === true
                            ? "bg-[var(--colour-yellow1)] text-white border-[var(--colour-yellow1)] shadow-md"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    )}
                >
                    <CheckCircle2 className="w-4 h-4" /> Yes
                </button>
                <button
                    onClick={() => onChange(false)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all",
                        value === false
                            ? "bg-red-500 text-white border-red-500 shadow-md"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    )}
                >
                    <XCircle className="w-4 h-4" /> No
                </button>
            </div>
        </div>
    )
}