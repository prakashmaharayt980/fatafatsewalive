// src/context/EmiContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import {
  EmiContextState,
} from "../types";

interface EmiContextType {
  emiContextInfo: EmiContextState;
  setEmiContextInfo: Dispatch<SetStateAction<EmiContextState>>;
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

const EmiContext = createContext<EmiContextType | undefined>(undefined);

export const EmiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emiContextInfo, setEmiContextInfo] = useState<EmiContextState>(defaultState);

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
    }
  }, []);

  useEffect(() => {
    const { files, ...rest } = emiContextInfo;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  }, [emiContextInfo]);

  return (
    <EmiContext.Provider value={{ emiContextInfo, setEmiContextInfo }}>
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
