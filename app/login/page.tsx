'use client'

import { Button } from "@/components/ui/button";
import { Loader } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

import { CompanyLogo, PaymentMethodsOptions } from "../CommonVue/Payment";

import { toast } from "sonner";
import { loginSchema, registerSchema, forgotSchema, verifySchema } from './validationSchema';
import { formSections } from './formSections';
import { useRouter } from 'next/navigation';



import { useAuthStore } from "../context/AuthContext";
import { useShallow } from 'zustand/react/shallow';
import { AuthService } from "../api/services/auth.service";


const GoogleAuthWrapper = dynamic(() => import('./GoogleAuthWrapper'), {
  ssr: false,
});


export default function LoginPage() {
  const { loginDialogOpen, setLoginDialogOpen, login } = useAuthStore(useShallow(state => ({
    loginDialogOpen: state.loginDialogOpen,
    setLoginDialogOpen: state.setLoginDialogOpen,
    login: state.login
  })));

  const router = useRouter();
  const [activeSection, setActiveSection] = useState('login');
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false); // NEW: Track OTP step
  const [socialToken, setSocialToken] = useState('');
  const [socialProvider, setSocialProvider] = useState<'google' | 'facebook'>('google');

  const [formData, setFormData] = useState<Record<string, any>>({
    login: { email: '', password: '' },
    register: { name: '', email: '', password: '', password_confirmation: '', phone: '', address: '' },
    forgot: { email: '' },
    verify: { otpCode: '', newPassword: '', confirmNewPassword: '' },

  });


  const [errors, setErrors] = useState<Record<string, any>>({
    login: {},
    register: {},
    forgot: {},
    verify: {},
    socialComplete: {},
  });

  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({

    loginPassword: false,
    registerPassword: false,
    registerConfirmPassword: false,
    verifyNewPassword: false,
    verifyConfirmNewPassword: false,
    socialPassword: false,
    socialConfirmPassword: false,
  });

  // ... (existing handleInputChange)
  const handleInputChange = (section: string, field: string, value: string) => {
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

  // ... (existing toggleShowPassword, trimFormData, validateForm)
  const toggleShowPassword = (field: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const trimFormData = (section: string) => {
    const trimmed = { ...formData[section] };
    Object.keys(trimmed).forEach(key => {
      if (typeof trimmed[key] === 'string') {
        trimmed[key] = trimmed[key].trim();
      }
    });
    return trimmed;
  };

  const validateForm = async (section: string, data: any) => {
    try {
      const schema = section === 'login' ? loginSchema : section === 'register' ? registerSchema : section === 'forgot' ? forgotSchema : verifySchema;
      await schema.validate(data, { abortEarly: false });
      setErrors((prev) => ({ ...prev, [section]: {} }));
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      if (error.inner) {
        error.inner.forEach((err: any) => {
          newErrors[err.path] = err.message;
        });
      }
      setErrors((prev) => ({ ...prev, [section]: newErrors }));
      return false;
    }
  };

  // ... (handleLogin, handleGoogleLogin, handleFacebookLogin, handleRegister, handleForgotPassword - keep as is)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedData = trimFormData('login');
    const isValid = await validateForm('login', trimmedData);
    if (!isValid) return;

    setLoading(true);
    AuthService.Login(trimmedData)
      .then(res => {
        if (res && res.data) {
          toast.success("Login successful!");
          login(res.data.access_token, res.data.user);
          setLoginDialogOpen(false);
          setFormData(prev => ({ ...prev, login: { email: '', password: '' } }));
        }
      })
      .catch((error: any) => {
        toast.error(error.response?.data?.detail || error.response?.data?.message || "Invalid email or password");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    const id_token = credentialResponse.credential;
    setSocialToken(id_token);
    setSocialProvider('google');

    AuthService.GoogleLogin(id_token)
      .then(res => {
        if (res && res.data) {
          toast.success("Login successful!");
          login(res.data.access_token, res.data.user);
          setLoginDialogOpen(false);
        }
      })
      .catch((error: any) => {
        console.error('Google login err', error);
        toast.error("Network error during Google login");
      });
  };

  const handleFacebookLogin = async (response: any) => {
    const access_token = response.accessToken;
    setSocialToken(access_token);
    setSocialProvider('facebook');

    AuthService.FacebookLogin(access_token)
      .then(res => {
        if (res && res.data) {
          toast.success("Login successful!");
          login(res.data.access_token, res.data.user);
          setLoginDialogOpen(false);
        }
      })
      .catch((error: any) => {
        console.error('Facebook login err', error);
        toast.error("Network error during Facebook login");
      });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedData = trimFormData('register');
    const isValid = await validateForm('register', trimmedData);
    if (!isValid) return;

    setLoading(true);
    AuthService.Register(trimmedData)
      .then(res => {
        if (res && res.data) {
          toast.success("Registration successful!");
          login(res.data.access_token, res.data.user);
          setLoginDialogOpen(false);
          setFormData(prev => ({
            ...prev,
            register: { name: '', email: '', password: '', password_confirmation: '', phone: '', address: '' }
          }));
        }
      })
      .catch((error: any) => {
        if (error.response && error.response.status === 400 && error.response.data.email) {
          toast.error(error.response.data.email[0]);
        } else {
          toast.error(error.response?.data?.message || error.message || "Please check your details and try again");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedData = trimFormData('forgot');
    const isValid = await validateForm('forgot', trimmedData);
    if (!isValid) return;

    setLoading(true);
    AuthService.ForgottenPassword(trimmedData)
      .then(res => {
        toast.success("Verification code sent to your email!");
        setFormData(prev => ({ ...prev, verify: { otpCode: '', newPassword: '', confirmNewPassword: '' } }));
        setActiveSection('verify');
      })
      .catch((error: any) => {
        toast.error(error.response?.data?.message || error.message || "Email not found");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = formData.verify.otpCode?.trim();
    if (!code || !/^\d{6}$/.test(code)) {
      setErrors(prev => ({ ...prev, verify: { ...prev.verify, otpCode: "Enter a valid 6-digit code" } }));
      return;
    }

    setLoading(true);
    AuthService.VerifyOtp({ email: formData.forgot.email, code: code } as any)
      .then(() => {
        setOtpVerified(true);
        toast.success("Code verified successfully");
      })
      .catch((error: any) => {
        console.error("OTP Verification Error:", error);
        const errorMessage = error.response?.data?.message || error.message || "Invalid Verification Code";
        setErrors(prev => ({ ...prev, verify: { ...prev.verify, otpCode: errorMessage } }));
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedData = trimFormData('verify');
    const isValid = await validateForm('verify', trimmedData);
    if (!isValid) {
      toast.error("Please check the form for errors");
      return;
    }

    setLoading(true);
    const payload = {
      email: formData.forgot.email,
      code: trimmedData.otpCode,
      password: trimmedData.newPassword,
      password_confirmation: trimmedData.confirmNewPassword
    };

    AuthService.ResetPassword(payload as any)
      .then(res => {
        toast.success("Password reset successfully!");
        setActiveSection('resetSuccess');
        setOtpVerified(false);
      })
      .catch((error: any) => {
        toast.error(error.response?.data?.message || error.message || "Failed to reset password");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const sectionProps = {
    formData,
    errors,
    loading,
    showPassword,
    otpVerified, // Pass this
    handleInputChange,
    toggleShowPassword,
    handleLogin,
    handleRegister,
    handleForgotPassword,
    handleVerifyCode, // Pass this
    handleResetPassword, // Pass this
    setActiveSection,
    setFormData,
    handleGoogleSuccess: handleGoogleLogin,
    handleFacebookSuccess: handleFacebookLogin,
  };

  if (!loginDialogOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-2 animate-in fade-in duration-200" onClick={() => setLoginDialogOpen(false)}>
      <div
        className={`
          relative 
          bg-white 
          rounded-2xl 
          shadow-xl 
          border border-gray-100 
          overflow-hidden 
          flex flex-col
          transition-all duration-300 ease-in-out
          ${activeSection === 'register' ? 'w-full max-w-3xl min-h-[600px]' : 'w-full max-w-[480px] min-h-[500px]'}
          max-h-[90vh]
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setLoginDialogOpen(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Removed gradient bg-gradient-to-b from-white to-teal-50 */}
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-white p-6 sm:p-8 flex flex-col gap-2">
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
            <GoogleAuthWrapper>
              {(formSections as any)[activeSection]?.render(sectionProps)}
            </GoogleAuthWrapper>
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


