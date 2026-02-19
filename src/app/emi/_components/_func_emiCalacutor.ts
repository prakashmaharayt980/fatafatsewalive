/**
 * Reusable EMI Calculator — use across the entire project
 *
 * Usage:
 *   import { calculateEMI, BANK_PROVIDERS, getBank } from '@/app/emi/_components/_func_emiCalacutor';
 *
 *   const result = calculateEMI({ principal: 100000, tenure: 12, downPayment: 10000, annualRate: 12 });
 *   // or with bank lookup:
 *   const result = calculateEMI({ principal: 100000, tenure: 12, downPayment: '20%', bankId: 'nabil' });
 */

// ─── Bank Provider Data ───────────────────────────────────────────────

export interface BankProvider {
    id: string;
    name: string;
    rate: number;
    img: string;
    tenureOptions: number[];
}

export const BANK_PROVIDERS: BankProvider[] = [
    { id: 'nabil', name: 'Nabil Bank', rate: 11.5, img: '/imgfile/bankingPartners7.png', tenureOptions: [12, 18, 24, 36] },
    { id: 'global', name: 'Global IME Bank', rate: 12, img: '/imgfile/bankingPartners1.png', tenureOptions: [12, 24, 36] },
    { id: 'nmb', name: 'NMB Bank', rate: 11.75, img: '/imgfile/bankingPartners3.png', tenureOptions: [12, 24, 36] },
    { id: 'siddhartha', name: 'Siddhartha Bank', rate: 12.25, img: '/imgfile/bankingPartners9.png', tenureOptions: [12, 24, 36] },
    { id: 'NicAsia', name: 'Nic Asia Bank', rate: 12.25, img: '/imgfile/bankingPartners11.png', tenureOptions: [12, 24, 36] },
    { id: 'hbl', name: 'Himalayan Bank', rate: 12.25, img: '/imgfile/bankingPartners10.png', tenureOptions: [12, 24, 36] },
    { id: 'sanimabank', name: 'Sanima Bank', rate: 12.25, img: '/imgfile/bankingPartners8.png', tenureOptions: [12, 24, 36] },
    { id: 'kumari', name: 'Kumari Bank', rate: 12.25, img: '/imgfile/bankingPartners6.png', tenureOptions: [12, 24, 36] },
];

/** Look up a bank by ID or name */
export function getBank(bankIdOrName: string): BankProvider | undefined {
    return BANK_PROVIDERS.find(
        (b) => b.id === bankIdOrName || b.name === bankIdOrName
    );
}

// ─── EMI Calculation ──────────────────────────────────────────────────

export interface EMIInput {
    /** Total product price */
    principal: number;
    /** Tenure in months */
    tenure: number;
    /** Down payment — absolute number or percentage string like "20%" */
    downPayment: number | string;
    /** Annual interest rate (%). If provided, used directly. */
    annualRate?: number;
    /** Bank ID or name — rate is looked up from BANK_PROVIDERS. Ignored if annualRate is set. */
    bankId?: string;
}

export interface EMIResult {
    /** Original product price */
    principal: number;
    /** Tenure in months */
    tenure: number;
    /** Computed down payment amount */
    downPayment: number;
    /** Down payment as percentage of principal */
    downPaymentPercent: number;
    /** Amount to be financed (principal - downPayment) */
    financeAmount: number;
    /** Monthly EMI payment */
    paymentPerMonth: number;
    /** Total amount paid over tenure (paymentPerMonth × tenure) */
    totalPayment: number;
    /** Total interest paid (totalPayment - financeAmount) */
    totalInterest: number;
    /** Annual interest rate used */
    annualRate: number;
    /** Monthly interest rate used */
    monthlyRate: number;
    /** Whether it's a 0% interest plan */
    isZeroInterest: boolean;
}

/**
 * Calculate EMI using the standard reducing-balance formula:
 *   EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
 *
 * @param input - EMI calculation parameters
 * @returns Full EMI breakdown
 */
export function calculateEMI(input: EMIInput): EMIResult {
    const { principal, tenure, downPayment } = input;

    // 1. Resolve annual rate
    let annualRate = input.annualRate ?? 0;
    if (annualRate === 0 && input.bankId) {
        const bank = getBank(input.bankId);
        annualRate = bank?.rate ?? 0;
    }

    // 2. Resolve down payment
    let resolvedDown = 0;
    if (typeof downPayment === 'string' && downPayment.includes('%')) {
        const pct = parseFloat(downPayment) || 0;
        resolvedDown = (pct / 100) * principal;
    } else {
        resolvedDown = Number(downPayment) || 0;
    }

    // Clamp
    if (resolvedDown < 0) resolvedDown = 0;
    if (resolvedDown > principal) resolvedDown = principal;

    // 3. Finance amount
    const financeAmount = principal - resolvedDown;

    // 4. Calculate monthly EMI
    let paymentPerMonth = 0;
    const monthlyRate = annualRate / 12 / 100;
    const isZeroInterest = annualRate === 0;

    if (financeAmount > 0 && tenure > 0) {
        if (annualRate > 0) {
            const power = Math.pow(1 + monthlyRate, tenure);
            paymentPerMonth = (financeAmount * monthlyRate * power) / (power - 1);
        } else {
            // 0% interest
            paymentPerMonth = financeAmount / tenure;
        }
    }

    // 5. Totals
    const totalPayment = paymentPerMonth * tenure;
    const totalInterest = totalPayment - financeAmount;

    return {
        principal,
        tenure,
        downPayment: resolvedDown,
        downPaymentPercent: principal > 0 ? (resolvedDown / principal) * 100 : 0,
        financeAmount,
        paymentPerMonth,
        totalPayment,
        totalInterest: Math.max(0, totalInterest),
        annualRate,
        monthlyRate,
        isZeroInterest,
    };
}

// ─── Convenience helpers ──────────────────────────────────────────────

/** Quick EMI estimate — returns monthly payment only */
export function quickEMI(
    price: number,
    tenureMonths: number,
    downPayment: number | string = 0,
    bankId: string = 'nabil'
): number {
    return calculateEMI({
        principal: price,
        tenure: tenureMonths,
        downPayment,
        bankId,
    }).paymentPerMonth;
}

/** Format a number as Rs. X,XXX */
export function formatRs(amount: number): string {
    return `Rs. ${Math.round(amount).toLocaleString()}`;
}

/** Format EMI as "Rs. X,XXX/mo" */
export function formatEMI(amount: number): string {
    return `Rs. ${Math.round(amount).toLocaleString()}/mo`;
}
