// Lightweight EMI store using Zustand — no provider needed
"use client";

import { create } from 'zustand';
import { EmiContextState } from '../types';

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
}

export const useEmiStore = create<EmiStore>((set) => ({
    emiContextInfo: defaultState,
    setEmiContextInfo: (updater) =>
        set((state) => ({
            emiContextInfo: typeof updater === 'function' ? updater(state.emiContextInfo) : updater,
        })),
    resetEmi: () => set({ emiContextInfo: defaultState }),
}));

// Backward-compatible hook — drop-in replacement for useContextEmi()
export const useContextEmi = () => {
    const emiContextInfo = useEmiStore((s) => s.emiContextInfo);
    const setEmiContextInfo = useEmiStore((s) => s.setEmiContextInfo);
    return { emiContextInfo, setEmiContextInfo };
};

// Dummy provider — does nothing, kept for backward compat so pages don't break
export const EmiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
