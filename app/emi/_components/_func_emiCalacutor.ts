
export interface BankProvider {
    id: string;
    name: string;
    img: any;
    tenureOptions: number[];
}

export interface EMIInput {
    principal: number;
    tenure: number;
    downPayment: number | string;
    bankId?: string;
}

export interface EMIResult {
    principal: number;
    tenure: number;
    downPayment: number;
    downPaymentPercent: number;
    financeAmount: number;
    paymentPerMonth: number;
    totalPayment: number;
}

export function calculateEMI(input: EMIInput): EMIResult {
    const { principal, tenure, downPayment } = input;

    let resolvedDown = 0;
    if (typeof downPayment === 'string' && downPayment.includes('%')) {
        const pct = parseFloat(downPayment) ?? 0;
        resolvedDown = (pct / 100) * principal;
    } else {
        resolvedDown = Number(downPayment) ?? 0;
    }

    if (resolvedDown < 0) resolvedDown = 0;
    if (resolvedDown > principal) resolvedDown = principal;

    const financeAmount = principal - resolvedDown;

    let paymentPerMonth = 0;
    if (financeAmount > 0 && tenure > 0) {
        paymentPerMonth = financeAmount / tenure;
    }

    const totalPayment = paymentPerMonth * tenure;

    return {
        principal,
        tenure,
        downPayment: resolvedDown,
        downPaymentPercent: principal > 0 ? (resolvedDown / principal) * 100 : 0,
        financeAmount,
        paymentPerMonth,
        totalPayment,
    };
}

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

export function formatRs(amount: number): string {
    return `Rs. ${Math.round(amount).toLocaleString()}`;
}

export function formatEMI(amount: number): string {
    return `Rs. ${Math.round(amount).toLocaleString()}/mo`;
}
