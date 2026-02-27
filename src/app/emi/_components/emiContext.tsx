// src/context/EmiContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { EmiContextState } from "../types";

interface EmiContextType {
  emiContextInfo: EmiContextState;
  setEmiContextInfo: Dispatch<SetStateAction<EmiContextState>>;
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

const EmiContext = createContext<EmiContextType | undefined>(undefined);

export const EmiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emiContextInfo, setEmiContextInfo] = useState<EmiContextState>(defaultState);

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
