// Lightweight EMI store using Zustand — no provider needed
"use client";

import { create } from 'zustand';
import type { EmiContextState } from '../types';
import { GetEMiBanks } from '@/app/api/services/payments.service';

export interface FetchedBank {
    id: string;
    name: string;
    rate: number;
    tenureOptions: number[];
    rateByTenure: Record<number, number>;
    img?: any;
}

const defaultState: EmiContextState = {
    userInfo: {
        name: "",
        email: "",
        phone: "",
        occupation: "",
        gender: "Male",
        dob: "",
        address: "",
        nationalID: 0,
        marriageStatus: 'Single',
        userpartnerName: '',
        dob_bs: '',
    },
    files: {
        citizenshipFile: { front: null, back: null, ppphoto: null },
        creditCardStatement: null,
        bankStatement: null,
        granterDocument: { front: null, back: null, ppphoto: null },
        userSignature: null
    },
    product: null,
    emiCalculation: {
        monthlyEmi: 0,
        duration: 12,
        downPayment: 0,
    },
    hasCreditCard: "no",
    bankinfo: {
        accountHolderName: "",
        accountNumber: "",
        bankname: "",
        bankbranch: "",
        salaryAmount: 0
    },
    granterPersonalDetails: {
        name: "", email: "", phone: "", occupation: "", gender: "Male",
        dob: "", dob_bs: "", address: "", grandfathername: "", nationalID: 0,
        marriageStatus: 'Single', userpartnerName: '',
    },
};

interface EmiStore {
    emiContextInfo: EmiContextState;
    setEmiContextInfo: (updater: EmiContextState | ((prev: EmiContextState) => EmiContextState)) => void;
    resetEmi: () => void;
    banks: FetchedBank[];
    isBanksLoading: boolean;
    fetchBanks: () => Promise<void>;
}

export const useEmiStore = create<EmiStore>((set, get) => ({
    emiContextInfo: defaultState,
    setEmiContextInfo: (updater) =>
        set((state) => ({
            emiContextInfo: typeof updater === 'function' ? updater(state.emiContextInfo) : updater,
        })),
    resetEmi: () => set({ emiContextInfo: defaultState }),
    banks: [],
    isBanksLoading: false,
    fetchBanks: async () => {
        if (get().banks.length > 0 || get().isBanksLoading) return;
        set({ isBanksLoading: true });
        try {
            const res = await GetEMiBanks();
            if (res && res.data) {
                const mapped: FetchedBank[] = res.data.map((b: any) => {
                    const rateByTenure: Record<number, number> = {
                        6: parseFloat(b.finance_percentage?.month_6 || "0"),
                        9: parseFloat(b.finance_percentage?.month_9 || "0"),
                        12: parseFloat(b.finance_percentage?.month_12 || "0"),
                        18: parseFloat(b.finance_percentage?.month_18 || "0"),
                        24: parseFloat(b.finance_percentage?.month_24 || "0"),
                        36: parseFloat(b.finance_percentage?.month_36 || "0"),
                    };

                    return {
                        id: String(b.id),
                        name: b.name,
                        rate: rateByTenure[12] || 0,
                        tenureOptions: Object.keys(rateByTenure).map(Number).filter(k => rateByTenure[k] > 0),
                        rateByTenure,
                    
                    };
                });
                set({ banks: mapped });
            }
        } catch (error) {
            console.error("Failed to fetch EMI banks globally:", error);
        } finally {
            set({ isBanksLoading: false });
        }
    }
}));

// Backward-compatible hook — drop-in replacement for useContextEmi()
export const useContextEmi = () => {
    return {
        emiContextInfo: useEmiStore((s) => s.emiContextInfo),
        setEmiContextInfo: useEmiStore((s) => s.setEmiContextInfo),
        banks: useEmiStore((s) => s.banks),
        isBanksLoading: useEmiStore((s) => s.isBanksLoading),
        fetchBanks: useEmiStore((s) => s.fetchBanks),
    };
};

// Dummy provider — does nothing, kept for backward compat so pages don't break
export const EmiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
