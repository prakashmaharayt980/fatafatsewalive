// src/context/EmiContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useMemo,
} from "react";
import { ProductDetails } from "../types/ProductDetailsTypes";


interface UserInfo {
  name: string;
  email: string;
  phone: string;
  occupation: string;
  gender: string;
  dob: string;
  address: string;
  nationalID: number;
  marriageStatus: string;
  userpartnerName: string;

}

interface DocumentFiles {
  front: File | null;
  back: File | null;
  ppphoto: File | null;
}

interface EmiFiles {
  citizenshipFile: DocumentFiles;
  creditCardStatement: File | null;
  bankStatement: File | null;
  granterDocument: DocumentFiles;
  userSignature: File | null
}

interface BankInfo {
  expiryDate: string;
  cardHolderName: string;
  creditCardNumber: string;
  accountHolderName: string;
  accountNumber: string;
  bankname: string;

  bankbranch: string;
  cardLimit: number;
  salaryAmount: number;
}

interface GranterPersonalDetails extends UserInfo {
  grandfathername: string;
}

export interface EmiContextState {
  userInfo: UserInfo;
  isDrawerOpen: boolean;
  files: EmiFiles;
  product: ProductDetails | null;
  emiCalculation: {
    monthlyEmi: number;
    duration: number;
    downPayment: number | string;

  };
  hasCreditCard: string;
  bankinfo: BankInfo;
  granterPersonalDetails: GranterPersonalDetails;
  selectedVariant?: string;

}

interface EmiContextType {
  emiContextInfo: EmiContextState;
  setEmiContextInfo: Dispatch<SetStateAction<EmiContextState>>;
  AvailablebankProvider: Array<{
    id: string;
    name: string;
    rate: number;
    img: string;
    tenureOptions: number[];
  }>
  emiCalculation: (principal: number, tenure: number, downPayment: number | string, bankid: string) => {
    principal: number;
    tenure: number;
    downPayment: number | string;
    financeAmount: number;
    paymentpermonth: number;
  };
  addToCompare: (product: ProductDetails) => void;
}

const STORAGE_KEY = "emiContextInfo";

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


  },
  isDrawerOpen: false,
  files: {
    citizenshipFile: {
      front: null,
      back: null,
      ppphoto: null,
    },
    creditCardStatement: null,
    bankStatement: null,
    granterDocument: {
      front: null,
      back: null,
      ppphoto: null,
    },
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
    expiryDate: "",
    cardHolderName: "",
    creditCardNumber: "",
    accountHolderName: "",
    accountNumber: "",
    bankname: "",

    bankbranch: "",
    cardLimit: 0,
    salaryAmount: 0
  },
  granterPersonalDetails: {
    name: "",
    email: "",
    phone: "",
    occupation: "",
    gender: "Male",
    dob: "",
    address: "",
    grandfathername: "",
    nationalID: 0,
    marriageStatus: 'Single',
    userpartnerName: '',

  },

};



const EmiContext = createContext<EmiContextType | undefined>(undefined);

export const EmiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage (excluding files)
  const [emiContextInfo, setEmiContextInfo] = useState<EmiContextState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setEmiContextInfo({ ...defaultState, ...parsed });
        }
      } catch (err) {
        console.error("Failed to parse EMI context from localStorage:", err);
      }
      setIsHydrated(true);
    }
  }, []);



  const AvailablebankProvider = useMemo(
    () => [
      { id: 'nabil', name: 'Nabil Bank', rate: 11.5, img: '/imgfile/bankingPartners7.png', tenureOptions: [12, 18, 24, 36] },
      { id: 'global', name: 'Global IME Bank', rate: 12, img: '/imgfile/bankingPartners1.png', tenureOptions: [12, 24, 36] },
      { id: 'nmb', name: 'NMB Bank', rate: 11.75, img: '/imgfile/bankingPartners3.png', tenureOptions: [12, 24, 36] },
      { id: 'siddhartha', name: 'Siddhartha Bank', rate: 12.25, img: '/imgfile/bankingPartners9.png', tenureOptions: [12, 24, 36] },
      { id: 'NicAsia', name: 'Nic Asia Bank', rate: 12.25, img: '/imgfile/bankingPartners11.png', tenureOptions: [12, 24, 36] },
      { id: 'hbl', name: 'Himalayan Bank', rate: 12.25, img: '/imgfile/bankingPartners10.png', tenureOptions: [12, 24, 36] },
      { id: 'sanimabank', name: 'Sanima Bank', rate: 12.25, img: '/imgfile/bankingPartners8.png', tenureOptions: [12, 24, 36] },
      { id: 'kumari', name: 'Kumari Bank', rate: 12.25, img: '/imgfile/bankingPartners6.png', tenureOptions: [12, 24, 36] },
    ],
    []
  );


  const emiCalculation = (
    principal: number,
    tenure: number,
    downPayment: number | string,
    bankid: string
  ) => {
    let financeAmount = principal;
    let paymentpermonth = 0;
    let finalDownPayment = 0;

    // 1. Calculate Down Payment & Finance Amount
    if (typeof downPayment === "string" && downPayment.includes("%")) {
      const percentage = parseFloat(downPayment) || 0;
      finalDownPayment = (percentage / 100) * principal;
    } else {
      finalDownPayment = Number(downPayment) || 0;
    }

    // Ensure down payment is valid
    if (finalDownPayment < 0) finalDownPayment = 0;
    if (finalDownPayment > principal) finalDownPayment = principal;

    financeAmount = principal - finalDownPayment;

    // 2. Calculate EMI only if there's a finance amount
    if (financeAmount > 0 && tenure > 0) {
      // Find bank rate
      const bank = AvailablebankProvider.find((b) => b.id === bankid || b.name === bankid); // Fixed: Lookup by ID or Name
      // Fallback rate if no bank selected (e.g. 10% or 0% depending on business logic, using 0 for now to avoid confusion until bank selected)
      const annualRate = bank ? bank.rate : 0;

      if (annualRate > 0) {
        const monthlyRate = annualRate / 12 / 100;
        // Formula: P * r * (1+r)^n / ((1+r)^n - 1)
        const numerator = financeAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure);
        const denominator = Math.pow(1 + monthlyRate, tenure) - 1;
        paymentpermonth = numerator / denominator;
      } else {
        // 0% Interest Case (if applicable)
        paymentpermonth = financeAmount / tenure;
      }
    }

    return {
      principal,
      tenure,
      downPayment: finalDownPayment,
      financeAmount,
      paymentpermonth,
    };
  }

  // Save to localStorage whenever state changes (excluding files)
  useEffect(() => {
    const { files, ...rest } = emiContextInfo; // omit File objects
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  }, [emiContextInfo]);

  const addToCompare = (product: ProductDetails) => {
    // Basic implementation: store in localStorage or state
    // For now, just a placeholder or minimal logic
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("compareList");
      let list: ProductDetails[] = existing ? JSON.parse(existing) : [];
      if (!list.find(p => p.id === product.id)) {
        list.push(product);
        localStorage.setItem("compareList", JSON.stringify(list));
      }
    }
  };

  return (
    <EmiContext.Provider value={{ emiContextInfo, setEmiContextInfo, AvailablebankProvider, emiCalculation, addToCompare }}>
      {children}
    </EmiContext.Provider>
  );
};

export const useContextEmi = (): EmiContextType => {
  const context = useContext(EmiContext);
  if (!context) {
    throw new Error("useContextEmi must be used within an EmiProvider");
  }
  return context;
};
