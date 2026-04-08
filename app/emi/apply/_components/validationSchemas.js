import * as Yup from 'yup';

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
    dob_bs: Yup.string()
      .required('Date of Birth (BS) is required')
      .matches(/^\d{4}[-/]\d{2}[-/]\d{2}$/, 'Must be a valid BS date (YYYY-MM-DD)'),

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
    dob: Yup.string()
      .required('Date of Birth (AD) is required')
      .matches(/^\d{4}[-/]\d{2}[-/]\d{2}$/, 'Must be a valid AD date (YYYY-MM-DD)')
      .test('not-future', 'Date of Birth (AD) cannot be in the future', function (value) {
        if (!value) return true;
        const [year, month, day] = value.split(/[-/]/).map(Number);
        const today = new Date();
        const inputDate = new Date(year, month - 1, day);
        return inputDate < today;
      }),
  });

export const creditCardSchema = Yup.object().shape({
  bankname: Yup.string().required('Please select a bank'),
  cardHolderName: Yup.string()
    .min(2, 'Card holder name must be at least 2 characters'),
  creditCardNumber: Yup.string()
    .matches(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, 'Card number must be 16 digits'),
  expiryDate: Yup.string()
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format'),
  cardLimit: Yup.number()
    .positive('Card limit must be a positive number'),
});

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

function resolveDownPayment(value, productPrice) {
  if (typeof value === 'string' && value.includes('%')) {
    return (parseFloat(value) / 100) * productPrice;
  }
  return Number(value) || 0;
}

export const emiConditionsSchema = (productPrice) => {
  const min40 = Math.ceil(productPrice * 0.4);
  return Yup.object().shape({
    downPayment: Yup.number()
      .transform((value, originalValue) => {
        if (originalValue === '' || originalValue === null || originalValue === undefined) return undefined;
        const resolved = resolveDownPayment(originalValue, productPrice);
        return isNaN(resolved) ? undefined : resolved;
      })
      .min(min40, `Down payment must be at least 40% (Rs. ${min40.toLocaleString()})`)
      .max(productPrice, `Down payment cannot exceed product price (Rs. ${Number(productPrice).toLocaleString()})`)
      .required('Down payment is required'),
    bankname: Yup.string().required('Please select a bank'),
    duration: Yup.mixed().required('Please select a duration'),
    financeAmount: Yup.mixed().notRequired(),
  });
};

export const emiConditionsCreditSchema = (productPrice) =>
  Yup.object().shape({
    downPayment: Yup.number()
      .transform((value, originalValue) => {
        if (originalValue === '' || originalValue === null || originalValue === undefined) return undefined;
        const n = Number(originalValue);
        return isNaN(n) ? undefined : n;
      })
      .min(0, 'Down payment must be a non-negative number')
      .max(productPrice, `Down payment cannot exceed product price (Rs. ${Number(productPrice).toLocaleString()})`)
      .required('Down payment is required'),
    duration: Yup.mixed().required('Please select a duration'),
    financeAmount: Yup.mixed().notRequired(),
  });
