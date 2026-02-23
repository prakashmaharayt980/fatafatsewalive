import { ProductDetails } from "@/app/types/ProductDetailsTypes";

export interface UserInfo {
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
    dob_bs?: string;
}

export interface DocumentFiles {
    front: File | null;
    back: File | null;
    ppphoto: File | null;
}

export interface EmiFiles {
    citizenshipFile: DocumentFiles;
    creditCardStatement: File | null;
    bankStatement: File | null;
    granterDocument: DocumentFiles;
    userSignature: File | null;
}

export interface BankInfo {
    accountHolderName: string;
    accountNumber: string;
    bankname: string;
    bankbranch: string;
    salaryAmount: number;
}

export interface GranterPersonalDetails extends UserInfo {
    grandfathername: string;
}

export interface EmiCalculationState {
    monthlyEmi: number;
    duration: number;
    downPayment: number | string;
}

export interface EmiContextState {
    userInfo: UserInfo;
    files: EmiFiles;
    product: ProductDetails | null;
    emiCalculation: EmiCalculationState;
    hasCreditCard: string;
    bankinfo: BankInfo;
    granterPersonalDetails: GranterPersonalDetails;
    selectedVariant?: string;
}
