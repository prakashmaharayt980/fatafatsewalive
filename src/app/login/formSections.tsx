import { ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Eye, EyeOff, Facebook, IdCardLanyard, Loader, KeyRound } from 'lucide-react';
import { sectionFields } from './formConfig';
import { GoogleLogin } from "@react-oauth/google";
import FacebookLogin from '@greatsumini/react-facebook-login';

interface FormSectionsProps {
  formData: any;
  errors: any;
  loading: boolean;
  showPassword: any;
  otpVerified: boolean; // NEW
  handleInputChange: (section: string, field: string, value: string) => void;
  toggleShowPassword: (field: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  handleRegister: (e: React.FormEvent) => void;
  handleForgotPassword: (e: React.FormEvent) => void;
  handleVerifyCode: (e: React.FormEvent) => void; // NEW
  handleResetPassword: (e: React.FormEvent) => void; // NEW
  setActiveSection: (section: string) => void;
  setFormData: (data: any) => void;
  handleGoogleSuccess: (credentialResponse: any) => void;
  handleFacebookSuccess: (credentialResponse: any) => void;
}

const inputClassName = (error: boolean) => `
  pl-11 pr-11 h-12 
  bg-gray-50/50 
  hover:bg-gray-50
  border 
  focus:bg-white
  focus:border-[var(--colour-fsP1)] 
  focus:ring-4 
  focus:ring-[var(--colour-fsP1)]/10 
  text-sm font-medium
  text-gray-900
  rounded-xl 
  transition-all 
  duration-200
  placeholder:text-gray-400
  ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'}
`;

const primaryButtonClassName = `
  w-full cursor-pointer h-12 
  bg-gradient-to-r from-[var(--colour-fsP2)] to-[var(--colour-fsP1)]
  hover:from-[var(--colour-fsP1)] hover:to-[var(--colour-fsP2)]
  text-white text-sm font-bold tracking-wide uppercase
  rounded-xl 
  transition-all duration-300 ease-out
  flex items-center justify-center gap-2.5 
  shadow-lg shadow-[var(--colour-fsP2)]/30 
  hover:shadow-2xl hover:shadow-[var(--colour-fsP1)]/40 hover:-translate-y-0.5
  hover:ring-4 hover:ring-[var(--colour-fsP1)]/10
  active:translate-y-0 active:scale-[0.98] active:shadow-md
`;

export const formSections = {
  login: {
    render: (props: FormSectionsProps) => (
      <div className="flex flex-col space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-500">Please enter your details to sign in</p>
        </div>

        <form className="flex flex-col space-y-4" onSubmit={props.handleLogin}>
          {sectionFields.login.map((field) => (
            <div key={field.id} className="relative group">
              <Label
                htmlFor={field.id}
                className="text-gray-700 text-xs font-semibold uppercase tracking-wide mb-1.5 block ml-1"
              >
                {field.label}
              </Label>
              <div className="relative">
                <Input
                  id={field.id}
                  type={field.showPasswordToggle && props.showPassword[field.passwordField!] ? 'text' : field.type}
                  placeholder={field.placeholder}
                  value={props.formData.login[field.id]}
                  onChange={(e) => props.handleInputChange('login', field.id, e.target.value)}
                  required={field.required}
                  disabled={props.loading}
                  className={inputClassName(!!props.errors.login[field.id])}
                />
                {field.icon && (
                  <field.icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--colour-fsP1)] transition-colors" />
                )}
                {field.showPasswordToggle && (
                  <button
                    type="button"
                    onClick={() => props.toggleShowPassword(field.passwordField!)}
                    disabled={props.loading}
                    className="absolute cursor-pointer right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[var(--colour-fsP1)] transition-colors duration-200"
                  >
                    {props.showPassword[field.passwordField!] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                )}
              </div>
              {props.errors.login[field.id] && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 animate-in slide-in-from-left-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {props.errors.login[field.id]}
                </p>
              )}
              {field.id === 'password' && (
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => props.setActiveSection('forgot')}
                    className="text-xs font-semibold text-gray-500 hover:text-[var(--colour-fsP1)] cursor-pointer transition-colors duration-200"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          ))}
          <Button
            type="submit"
            disabled={props.loading}
            className={primaryButtonClassName}
          >
            {props.loading ? <Loader className="w-5 h-5 animate-spin" /> : <IdCardLanyard className="w-5 h-5" />}
            {props.loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="relative flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400 font-medium bg-white px-2">or continue with</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="w-full">
            <GoogleLogin
              onSuccess={(credentialResponse) => props.handleGoogleSuccess(credentialResponse)}
              onError={() => console.log("Google login failed")}
              containerProps={{ style: { width: '100%' } }}
              width="100%"
            />
          </div>

          <FacebookLogin
            appId="1124436536357494"
            onSuccess={(response) => {
              props.handleFacebookSuccess(response);
            }}
            onFail={(error) => {
              console.log('Login Failed!', error);
            }}
            render={({ onClick }) => (
              <Button
                variant="outline"
                disabled={props.loading}
                onClick={onClick}
                className="w-full h-[40px] border border-gray-200 bg-white hover:bg-[#1877F2]/5 text-gray-700 hover:text-[#1877F2] hover:border-[#1877F2]/30 cursor-pointer text-sm font-semibold rounded-[4px] transition-all duration-200 shadow-sm"
              >
                <Facebook className="w-5 h-5 mr-2 text-[#1877F2]" />
                Facebook
              </Button>
            )}
          />
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => props.setActiveSection('register')}
            disabled={props.loading}
            className="text-sm text-gray-600 hover:text-[var(--colour-fsP1)] cursor-pointer transition-colors duration-200"
          >
            Don&apos;t have an account? <span className="font-bold underline decoration-2 decoration-[var(--colour-fsP1)]/30 underline-offset-2">Register</span>
          </button>
        </div>
      </div>
    ),
  },

  register: {
    render: (props: FormSectionsProps) => {
      // Layout: 0,1 (half) | 2 (full) | 3,4 (half) | 5 (full) | 6 (full)
      // Fields: firstName, lastName | email | phone, address | password | confirmPassword
      const getColSpan = (index: number) => {
        if (index === 0 || index === 1) return 'col-span-1'; // firstName, lastName (half)
        if (index === 2) return 'col-span-1 sm:col-span-2';  // email (full)
        if (index === 3 || index === 4) return 'col-span-1'; // phone, address (half)
        return 'col-span-1 sm:col-span-2'; // password, confirmPassword (full)
      };

      return (
        <div className="space-y-6">
          <div className="text-center space-y-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-500">Join us to start shopping today</p>
          </div>

          <form className="space-y-4" onSubmit={props.handleRegister}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sectionFields.register.map((field, index) => (
                <div key={field.id} className={`${getColSpan(index)} relative group`}>
                  <Label
                    htmlFor={field.id}
                    className="text-gray-700 text-xs font-semibold uppercase tracking-wide mb-1.5 block ml-1"
                  >
                    {field.label}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.id}
                      type={field.showPasswordToggle && props.showPassword[field.passwordField!] ? 'text' : field.type}
                      placeholder={field.placeholder}
                      value={props.formData.register[field.id]}
                      onChange={(e) => props.handleInputChange('register', field.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === ' ' && field.id === 'name') {
                          e.stopPropagation(); // Prevent space key from being intercepted
                        }
                      }}
                      required={field.required}
                      disabled={props.loading}
                      maxLength={field.maxLength}
                      className={inputClassName(!!props.errors.register?.[field.id])}
                    />
                    {field.icon && (
                      <field.icon className="absolute left-4 top-1/2 cursor-pointer transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--colour-fsP1)] transition-colors" />
                    )}
                    {field.showPasswordToggle && (
                      <button
                        type="button"
                        onClick={() => props.toggleShowPassword(field.passwordField!)}
                        disabled={props.loading}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-[var(--colour-fsP1)] transition-colors duration-200"
                      >
                        {props.showPassword[field.passwordField!] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                  {props.errors.register && props.errors.register[field.id] && (
                    <div className="mt-1.5 flex items-start gap-1.5 text-red-500 animate-in fade-in slide-in-from-top-1">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span className="text-[11px] leading-tight font-medium">
                        {props.errors.register[field.id]}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="submit"
              disabled={props.loading}
              className={primaryButtonClassName}
            >
              {props.loading ? <Loader className="w-5 h-5 animate-spin" /> : null}
              {props.loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => props.setActiveSection('login')}
              disabled={props.loading}
              className="text-sm text-gray-600 hover:text-[var(--colour-fsP1)] cursor-pointer transition-colors duration-200"
            >
              Already have an account? <span className="font-bold underline decoration-2 decoration-[var(--colour-fsP1)]/30 underline-offset-2">Login</span>
            </button>
          </div>
        </div>
      );
    },
  },

  forgot: {
    render: (props: FormSectionsProps) => (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Reset Your Password</h3>
          <p className="text-sm text-gray-500 mt-1">Enter your email to receive a verification code</p>
        </div>

        <form className="space-y-4" onSubmit={props.handleForgotPassword}>
          {sectionFields.forgot.map((field) => (
            <div key={field.id} className="group">
              <Label
                htmlFor={field.id}
                className="text-gray-700 text-xs font-semibold uppercase tracking-wide mb-1.5 block ml-1"
              >
                {field.label}
              </Label>
              <div className="relative">
                <Input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={props.formData.forgot[field.id]}
                  onChange={(e) => props.handleInputChange('forgot', field.id, e.target.value)}
                  required={field.required}
                  disabled={props.loading}
                  className={inputClassName(!!props.errors.forgot[field.id])}
                />
                {field.icon && (
                  <field.icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--colour-fsP1)] transition-colors" />
                )}
              </div>
              {props.errors.forgot[field.id] && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 animate-in slide-in-from-left-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {props.errors.forgot[field.id]}
                </p>
              )}
              {field.helperText && (
                <p className="mt-2 text-xs text-gray-500">{field.helperText}</p>
              )}
            </div>
          ))}
          <Button
            type="submit"
            disabled={props.loading}
            className={primaryButtonClassName}
          >
            {props.loading ? <Loader className="w-5 h-5 animate-spin" /> : null}
            {props.loading ? 'Sending...' : 'Send Verification Code'}
          </Button>
        </form>

        <div className="flex justify-between text-sm pt-2 px-1">
          <button
            type="button"
            onClick={() => props.setActiveSection('login')}
            disabled={props.loading}
            className="text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200 flex items-center gap-1"
          >
            ← Back to login
          </button>
          <button
            type="button"
            onClick={() => props.setActiveSection('register')}
            disabled={props.loading}
            className="text-[var(--colour-fsP1)] hover:text-[var(--colour-fsP2)] font-semibold hover:underline transition-colors duration-200"
          >
            Register
          </button>
        </div>
      </div>
    ),
  },

  verify: {
    render: (props: FormSectionsProps) => {
      // Split fields: Step 1 = otpCode, Step 2 = newPassword, confirmNewPassword
      const step1Field = sectionFields.verify.find(f => f.id === 'otpCode');
      const step2Fields = sectionFields.verify.filter(f => f.id !== 'otpCode');

      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
              <KeyRound className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {props.otpVerified ? "Set New Password" : "Enter Verification Code"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {props.otpVerified ? "Secure your account with a new password" : "Enter the code sent to your email"}
            </p>
          </div>

          {!props.otpVerified ? (
            // STEP 1: OTP Input
            <form className="space-y-4" onSubmit={props.handleVerifyCode}>
              {step1Field && (
                <div className="group">
                  <Label htmlFor={step1Field.id} className="text-gray-700 text-xs font-semibold uppercase tracking-wide mb-1.5 block ml-1">{step1Field.label}</Label>
                  <div className="relative">
                    <Input
                      id={step1Field.id}
                      type="text"
                      placeholder={step1Field.placeholder}
                      value={props.formData.verify[step1Field.id]}
                      onChange={(e) => props.handleInputChange('verify', step1Field.id, e.target.value)}
                      required={step1Field.required}
                      className={inputClassName(!!props.errors.verify[step1Field.id])}
                      autoFocus
                    />
                    <step1Field.icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {props.errors.verify[step1Field.id] && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> {props.errors.verify[step1Field.id]}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">{step1Field.helperText}</p>
                </div>
              )}
              <Button type="submit" className={primaryButtonClassName}>
                Verify Code
              </Button>
            </form>
          ) : (
            // STEP 2: Password Reset
            <form className="space-y-4" onSubmit={props.handleResetPassword}>
              {/* Show OTP as readonly context */}
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Code Verified</span>
                </div>
                <span className="text-sm font-bold text-gray-900 tracking-widest">{props.formData.verify.otpCode}</span>
              </div>

              {step2Fields.map((field) => (
                <div key={field.id} className="group">
                  <Label htmlFor={field.id} className="text-gray-700 text-xs font-semibold uppercase tracking-wide mb-1.5 block ml-1">{field.label}</Label>
                  <div className="relative">
                    <Input
                      id={field.id}
                      type={props.showPassword[field.passwordField!] ? 'text' : field.type}
                      placeholder={field.placeholder}
                      value={props.formData.verify[field.id]}
                      onChange={(e) => props.handleInputChange('verify', field.id, e.target.value)}
                      required={field.required}
                      className={inputClassName(!!props.errors.verify[field.id])}
                    />
                    <field.icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--colour-fsP1)] transition-colors" />
                    {field.showPasswordToggle && (
                      <button type="button" onClick={() => props.toggleShowPassword(field.passwordField!)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[var(--colour-fsP1)]">
                        {props.showPassword[field.passwordField!] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                  {props.errors.verify[field.id] && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> {props.errors.verify[field.id]}</p>
                  )}
                </div>
              ))}
              <div className="pt-2">
                <Button type="submit" disabled={props.loading} className={primaryButtonClassName}>
                  {props.loading ? <Loader className="w-5 h-5 animate-spin" /> : null}
                  {props.loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          )}

          <div className="flex justify-between text-sm pt-2 px-1">
            <button type="button" onClick={() => props.setActiveSection('forgot')} className="text-gray-500 hover:text-gray-700 font-medium">← Try another email</button>
            {!props.otpVerified && (
              <button type="button" className="text-[var(--colour-fsP1)] font-semibold hover:underline">Resend code</button>
            )}
          </div>
        </div>
      );
    },
  },

  emailSent: {
    render: (props: FormSectionsProps) => (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-teal-50 border border-teal-100">
          <CheckCircle className="h-8 w-8 text-teal-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Check Your Email</h3>
          <p className="mt-2 text-sm text-gray-500">
            We've sent a verification code to
          </p>
          <p className="mt-1 text-sm font-bold text-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/5 py-1 px-3 rounded-full inline-block">
            {props.formData.forgot.email}
          </p>
        </div>
        <Button
          onClick={() => props.setActiveSection('verify')}
          disabled={props.loading}
          className={primaryButtonClassName}
        >
          Enter Verification Code
        </Button>
        <div className="flex justify-between text-sm pt-2 px-1">
          <button
            type="button"
            onClick={() => props.setActiveSection('login')}
            disabled={props.loading}
            className="text-gray-500 hover:text-gray-700 font-medium cursor-pointer transition-colors duration-200 flex items-center gap-1"
          >
            ← Back to login
          </button>
          <button
            type="button"
            disabled={props.loading}
            className="text-[var(--colour-fsP1)] hover:text-[var(--colour-fsP2)] font-semibold hover:underline cursor-pointer transition-colors duration-200"
          >
            Resend code
          </button>
        </div>
      </div>
    ),
  },

  resetSuccess: {
    render: (props: FormSectionsProps) => (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 border border-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Password Reset Successful!</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
            Your password has been changed successfully. You can now login with your new password.
          </p>
        </div>
        <Button
          onClick={() => {
            props.setActiveSection('login');
            props.setFormData((prev: any) => ({
              ...prev,
              forgot: { email: '' },
              verify: { otpCode: '', newPassword: '', confirmNewPassword: '' }
            }));
          }}
          className={primaryButtonClassName}
        >
          Back to Login
        </Button>
      </div>
    ),
  },
};