import * as Yup from 'yup';

// Personal Details Schema (used for userInfo and granterPersonalDetails)
export const personalDetailsSchema = (isGranter = false) =>
  Yup.object().shape({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .required('Name is required'),
    email: isGranter
      ? Yup.string().notRequired()
      : Yup.string()
        .email('Please enter a valid email')
        .required('Email is required'),
    phone: Yup.string()
      .matches(/^9\d{9}$/, 'Phone number must be 10 digits and start with 9')
      .required('Phone number is required'),
    nationalID: Yup.string()
      .min(5, 'National ID must be at least 5 characters')
      .required('National ID is required'),
    address: Yup.string()
      .min(5, 'Address must be at least 5 characters')
      .required('Address is required'),
    gender: Yup.string().required('Please select a gender'),
    marriageStatus: Yup.string().required('Please select marriage status'),
    userpartnerName: Yup.string().when('marriageStatus', {
      is: 'Married',
      then: (schema) =>
        schema
          .min(2, 'Partner name must be at least 2 characters')
          .required('Partner name is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

// Credit Card Details Schema
export const creditCardSchema = Yup.object().shape({
  bankname: Yup.string().required('Please select a bank'),
  cardHolderName: Yup.string()
    .min(2, 'Card holder name must be at least 2 characters')
    .required('Card holder name is required'),
  creditCardNumber: Yup.string()
    .matches(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, 'Card number must be 16 digits')
    .required('Card number is required'),
  expiryDate: Yup.string()
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format')
    .required('Expiry date is required'),
  cardLimit: Yup.number()
    .positive('Card limit must be a positive number')
    .required('Card limit is required'),
});

// Bank Details Schema
export const bankDetailsSchema = Yup.object().shape({
  bankname: Yup.string().required('Please select a bank'),
  accountNumber: Yup.string()
    .min(5, 'Account number must be at least 5 characters')
    .required('Account number is required'),
  bankbranch: Yup.string()
    .min(2, 'Bank branch must be at least 2 characters')
    .required('Bank branch is required'),
  salaryAmount: Yup.number()
    .positive('Salary amount must be a positive number')
    .required('Salary amount is required'),
});

// EMI Conditions Schema
export const emiConditionsSchema = (productPrice) =>
  Yup.object().shape({
    downPayment: Yup.number()
      .transform((value, originalValue) =>
        originalValue === '' ? undefined : value
      )
      .min(0, 'Down payment must be a non-negative number')
      .max(productPrice, `Down payment cannot exceed product price (${productPrice})`)
      .required('Down payment is required'),
    bankname: Yup.string().required('Please select a bank'),
    duration: Yup.string().required('Please select a duration'),
    financeAmount: Yup.number().notRequired(), // Read-only field
  });

// EMI Conditions Schema for Credit Card
export const emiConditionsCreditSchema = (productPrice) =>
  Yup.object().shape({
    downPayment: Yup.number()
      .transform((value, originalValue) =>
        originalValue === '' ? undefined : value
      )
      .min(0, 'Down payment must be a non-negative number')
      .max(productPrice, `Down payment cannot exceed product price (${productPrice})`)
      .required('Down payment is required'),
    duration: Yup.string().required('Please select a duration'),
    financeAmount: Yup.number().notRequired(), // Read-only field
  });