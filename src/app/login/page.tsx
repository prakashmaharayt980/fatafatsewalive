'use client'

import { Button } from "@/components/ui/button";
import { Loader } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { CompanyLogo, PaymentMethodsOptions } from "../CommonVue/Payment";
import RemoteServices from "../api/remoteservice";
import { toast } from "sonner";
import { loginSchema, registerSchema, forgotSchema, verifySchema } from './validationSchema';
import { formSections } from './formSections';
import { useRouter } from 'next/navigation';



import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { loginDailogOpen, setloginDailogOpen } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('login');
  const [loading, setLoading] = useState(false);
  const [socialToken, setSocialToken] = useState('');
  const [socialProvider, setSocialProvider] = useState<'google' | 'facebook'>('google');

  const [formData, setFormData] = useState({
    login: { email: '', password: '' },
    register: { name: '', email: '', password: '', password_confirmation: '', phone: '', address: '' },
    forgot: { email: '' },
    verify: { otpCode: '', newPassword: '', confirmNewPassword: '' },
    socialComplete: { phone: '', address: '', password: '', confirmPassword: '' },
  });
  const [errors, setErrors] = useState({
    login: {},
    register: {},
    forgot: {},
    verify: {},
    socialComplete: {},
  });
  const [showPassword, setShowPassword] = useState({
    loginPassword: false,
    registerPassword: false,
    registerConfirmPassword: false,
    verifyNewPassword: false,
    verifyConfirmNewPassword: false,
    socialPassword: false,
    socialConfirmPassword: false,
  });

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    if (errors[section]?.[field]) {
      setErrors((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: '' },
      }));
    }
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const trimFormData = (section) => {
    const trimmed = { ...formData[section] };
    Object.keys(trimmed).forEach(key => {
      if (typeof trimmed[key] === 'string') {
        trimmed[key] = trimmed[key].trim();
      }
    });
    return trimmed;
  };

  const validateForm = async (section, data) => {
    try {
      const schema = section === 'login' ? loginSchema : section === 'register' ? registerSchema : section === 'forgot' ? forgotSchema : verifySchema;
      await schema.validate(data, { abortEarly: false });
      setErrors((prev) => ({ ...prev, [section]: {} }));
      return true;
    } catch (error) {
      const newErrors = {};
      if (error.inner) {
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
      }
      setErrors((prev) => ({ ...prev, [section]: newErrors }));
      return false;
    }
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    const trimmedData = trimFormData('login');
    const isValid = await validateForm('login', trimmedData);
    if (!isValid) return;

    setLoading(true);
    try {
      const res = await RemoteServices.Login(trimmedData);
      if (res) {
        toast.success("Login successful!");
        // Redirect to home or previous page
        router.push('/');
        // Refresh to update auth state
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleLogin = async (credentialResponse) => {

    const id_token = credentialResponse.credential;
    setSocialToken(id_token);
    setSocialProvider('google');
    // Use your actual backend address here
    const address = 'http://127.0.0.1:8000/api/'

    try {
      const response = await fetch(`${address}accounts/social/google/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token }),
      });

      const data = await response.json()

      if (response.ok) {
        toast.success("Login successful!");
        setActiveSection('login');
        router.push('/');
      } else {
        toast.error(data.error || "Google login failed");
      }

    } catch (error) {
      console.log('err', error)
      toast.error("Network error during Google login");
    }
  };

  const handleFacebookLogin = async (response) => {
    const access_token = response.accessToken;
    setSocialToken(access_token);
    setSocialProvider('facebook');
    const address = 'http://127.0.0.1:8000/api/';

    try {
      const apiResponse = await fetch(`${address}accounts/social/facebook/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token }),
      });

      const data = await apiResponse.json();
      console.log('fb data', data);

      if (apiResponse.ok) {
        toast.success("Login successful!");
        setActiveSection('login');
        router.push('/');
      } else {
        toast.error(data.error || "Facebook login failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error during Facebook login");
    }
  };



  const handleRegister = async (e) => {
    e.preventDefault();
    const trimmedData = trimFormData('register');
    const isValid = await validateForm('register', trimmedData);
    if (!isValid) return;

    setLoading(true);
    RemoteServices.Register(trimmedData).then(res => {

      toast.success("Registration successful! Please login.");
      setActiveSection('login');
      setFormData(prev => ({
        ...prev,
        register: { name: '', email: '', password: '', password_confirmation: '', phone: '', address: '' }
      }));
    }).catch((error) => {

      if (error.response && error.response.status === 400 && error.response.data.email) {
        toast.error(error.response.data.email[0]);
      } else {
        toast.error(error.message || "Please check your details and try again");
      }


    }).finally(() => {
      setLoading(false);
    });
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const trimmedData = trimFormData('forgot');
    const isValid = await validateForm('forgot', trimmedData);
    if (!isValid) return;

    setLoading(true);
    RemoteServices.ForgottenPassword(trimmedData).then(res => {
      toast.success("Verification code sent to your email!");
      setActiveSection('emailSent');
    }).catch((error) => {
      toast.error(error.message || "Email not found");
    }).finally(() => {
      setLoading(false);
    });

  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const trimmedData = trimFormData('verify');
    const isValid = await validateForm('verify', trimmedData);
    if (!isValid) return;

    setLoading(true);
    try {
      const res = await RemoteServices.VerifyOtp(trimmedData);
      toast.success("Password reset successfully!");
      setActiveSection('resetSuccess');
    } catch (error) {
      toast.error(error.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const sectionProps = {
    formData,
    errors,
    loading,
    showPassword,
    handleInputChange,
    toggleShowPassword,
    handleLogin,
    handleRegister,
    handleForgotPassword,
    handleVerifyOTP,
    setActiveSection,
    setFormData,
    handleGoogleSuccess: handleGoogleLogin,
    handleFacebookSuccess: handleFacebookLogin,

  };

  if (!loginDailogOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setloginDailogOpen(false)}>
      <div
        className={`
          relative 
          bg-white 
          rounded-2xl 
          shadow-2xl 
          border border-gray-200 
          overflow-hidden 
          flex flex-col
          transition-all duration-300 ease-in-out
          ${activeSection === 'register' ? 'w-full max-w-3xl min-h-[600px]' : 'w-full max-w-[500px] min-h-[550px]'}
          max-h-[90vh]
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setloginDailogOpen(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-teal-50 p-6 sm:p-8 flex flex-col gap-4">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-[var(--colour-fsP1)]/30 border-t-[var(--colour-fsP1)] rounded-full animate-spin"></div>
                <p className="text-[var(--colour-fsP1)] text-sm font-semibold tracking-wide animate-pulse">Processing...</p>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center pb-4">
            <Image
              src={CompanyLogo}
              alt="Fatafatsewa Company Logo"
              width={140}
              height={60}
              className="object-contain w-[140px] drop-shadow-sm"
            />
          </div>

          <div className="flex-1 w-full mx-auto">
            {formSections[activeSection]?.render(sectionProps)}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 mt-auto">
          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">
            Trusted Payment Partners
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {PaymentMethodsOptions.map((Item, index) => (
              <div
                key={index}
                className="
                    relative
                    flex items-center justify-center
                    w-12 h-8
                    bg-white
                    rounded
                    border border-gray-200
                    grayscale opacity-70
                    hover:grayscale-0 hover:opacity-100 hover:scale-110 hover:border-[var(--colour-fsP1)]/30 hover:shadow-md
                    transition-all duration-300 ease-out
                    cursor-help
                  "
                title={Item.name}
              >
                <Image
                  src={Item.img}
                  alt={Item.name || "Payment Method"}
                  fill
                  className="object-contain p-1"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


