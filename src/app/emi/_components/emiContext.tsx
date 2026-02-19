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
import { ProductDetails } from "@/app/types/ProductDetailsTypes";
import { calculateEMI, BANK_PROVIDERS } from "./_func_emiCalacutor";


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



  const AvailablebankProvider = useMemo(() => BANK_PROVIDERS, []);

  const emiCalculation = (
    principal: number,
    tenure: number,
    downPayment: number | string,
    bankid: string
  ) => {
    const result = calculateEMI({ principal, tenure, downPayment, bankId: bankid });
    // Keep backward-compatible return shape
    return {
      principal: result.principal,
      tenure: result.tenure,
      downPayment: result.downPayment,
      financeAmount: result.financeAmount,
      paymentpermonth: result.paymentPerMonth,
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
