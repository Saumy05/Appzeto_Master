import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '../router';
import { useBooking } from '../context/BookingContext';
import { motion, AnimatePresence } from 'framer-motion';
import { requestUserOtp, verifyUserOtp, completeUserSignup } from '../../../services/api/auth';
import { setUnifiedAuthData } from '../../../shared/utils/moduleAuth';
import { CONSUMER_BRAND_LOGO, logoFallback } from "@/shared/constants/brandLogo";
import AuthLegalLinks from '@/shared/components/auth/AuthLegalLinks';

const readApiError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

export const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpInputRefs = useRef([]);
  // 'phone' → 'otp' → 'name' (name step only for unregistered numbers).
  const [step, setStep] = useState('phone');
  const [needsName, setNeedsName] = useState(false);
  // Proof the phone passed its OTP, exchanged for a session at the name step.
  const [signupToken, setSignupToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, showToast } = useBooking();
  const navigate = useNavigate();

  // The OTP boxes only exist in the DOM once step becomes 'otp', so autoFocus
  // on the first box normally covers it — this is the belt-and-braces fallback
  // for when the card's enter animation delays the box past React's mount.
  useEffect(() => {
    if (step !== 'otp') return;
    const timer = setTimeout(() => otpInputRefs.current[0]?.focus(), 60);
    return () => clearTimeout(timer);
  }, [step]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 4 - index).split('');
      if (digits.length > 0) {
        setOtp((prev) => {
          const next = [...prev];
          digits.forEach((digit, i) => {
            if (index + i < 4) next[index + i] = digit;
          });
          return next;
        });
        otpInputRefs.current[Math.min(3, index + digits.length)]?.focus();
      }
      return;
    }

    if (value && !/^\d$/.test(value)) return;

    setOtp((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    if (value && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      setOtp((prev) => {
        const next = [...prev];
        next[index - 1] = '';
        return next;
      });
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4).split('');
    if (!digits.length) return;
    setOtp((prev) => {
      const next = [...prev];
      digits.forEach((digit, i) => {
        if (i < 4) next[i] = digit;
      });
      return next;
    });
    otpInputRefs.current[Math.min(digits.length, 3)]?.focus();
  };

  const finishLogin = (digits, user, message) => {
    login(digits, user);
    showToast(message);
    navigate('/');
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length !== 10) {
      showToast('Enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestUserOtp(digits);
      const data = res?.data?.data ?? res?.data ?? {};
      // Backend tells us up front whether this number already has an account,
      // so the OTP step can present itself as sign-in vs. registration.
      setNeedsName(data.nextStepIfVerified === 'collect_name');
      setOtp(['', '', '', '']);
      setStep('otp');
      showToast('OTP sent to your phone 📱');
    } catch (err) {
      showToast(readApiError(err, 'Could not send OTP. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const digits = String(phone).replace(/\D/g, '');
    const code = otp.join('');
    if (code.length !== 4) {
      showToast('Please enter the 4-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyUserOtp(digits, code);
      const data = res?.data?.data ?? res?.data ?? {};

      // A number with no account yet has no session to establish — it carries a
      // signup ticket to the name step instead.
      if (data.nextStep === 'collect_name') {
        setSignupToken(data.signupToken || '');
        setNeedsName(true);
        setStep('name');
        return;
      }

      // Establishes BOTH the food and taxi sessions from one login.
      setUnifiedAuthData(data);
      finishLogin(digits, data.user, '✨ Welcome back!');
    } catch (err) {
      showToast(readApiError(err, 'Invalid or expired OTP.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async (e) => {
    if (e) e.preventDefault();
    const digits = String(phone).replace(/\D/g, '');
    const name = fullName.trim();
    if (name.length < 2) {
      showToast('Please enter your full name');
      return;
    }

    setIsLoading(true);
    try {
      const res = await completeUserSignup(signupToken, { name });
      const data = res?.data?.data ?? res?.data ?? {};

      // The account exists now, so this is the first real session.
      setUnifiedAuthData(data);
      finishLogin(digits, data.user, '✨ Account created! Welcome to Appzeto!');
    } catch (err) {
      showToast(readApiError(err, 'Could not save your name. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 'phone') return handleSendOtp(e);
    if (step === 'otp') return handleVerifyOtp(e);
    return handleCompleteRegistration(e);
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative w-full h-dvh min-h-dvh max-h-dvh mx-auto overflow-y-auto hide-scrollbar flex flex-col justify-between select-none p-4 sm:p-6 bg-white"
    >
      {/* Subtle modern ambient background glow on white */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-slate-100/60 blur-2xl" />
      </div>

      {/* Top Header: Appzeto Brand Logo & Tagline */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="pt-4 sm:pt-6 pb-2 text-center relative z-10 flex flex-col items-center px-4"
      >
        <div className="relative mb-2">
          <img
            alt="Appzeto"
            className="h-16 sm:h-20 w-auto max-w-[240px] sm:max-w-[280px] object-contain drop-shadow-xs"
            src={CONSUMER_BRAND_LOGO}
            onError={logoFallback}
          />
        </div>

        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="h-0.5 w-6 rounded-full bg-teal-500" />
          <span className="text-[11px] font-bold tracking-[0.22em] text-teal-700 uppercase font-montserrat">
            Reflect / Technology
          </span>
          <span className="h-0.5 w-6 rounded-full bg-teal-500" />
        </div>

        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-[320px] font-medium leading-relaxed">
          The unified ecosystem for Food, Rides, Stays & Tours
        </p>
      </motion.div>

      {/* Center Login / Sign Up Card */}
      <div className="relative z-10 w-full max-w-[400px] mx-auto pb-4 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-200/90 relative overflow-hidden"
        >
          {/* Top decorative gradient ribbon */}
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400" />

          {/* Card Title & Subtitle */}
          <div className="text-center mb-5 mt-1">
            <h3 className="text-slate-900 font-extrabold tracking-tight text-lg sm:text-xl font-montserrat">
              {step === 'name'
                ? 'Create Your Account'
                : step === 'otp' && needsName
                ? 'Verify Your Number'
                : step === 'otp'
                ? 'Enter Verification Code'
                : 'Sign In to Appzeto'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {step === 'name'
                ? 'Tell us your name to finish setting up your account'
                : step === 'otp'
                ? `Enter the 4-digit code sent to +91 ${phone}`
                : 'Enter your 10-digit mobile number to get started'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Step (for new registrations) */}
            <AnimatePresence mode="wait">
              {step === 'name' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5"
                >
                  <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 font-montserrat">
                    Full Name
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 h-12 transition-all focus-within:border-teal-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500/10">
                    <i className="fa-solid fa-user text-teal-600 text-xs mr-3"></i>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoFocus
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Phone Number Input */}
            {step !== 'name' && (
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 font-montserrat">
                  Mobile Number
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 h-12 transition-all focus-within:border-teal-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500/10">
                  <span className="text-sm font-bold text-slate-700 mr-2 shrink-0 flex items-center gap-1.5">
                    <i className="fa-solid fa-phone text-teal-600 text-xs"></i>
                    +91
                  </span>
                  <div className="w-px h-5 bg-slate-200 mr-3 shrink-0" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    disabled={step === 'otp'}
                    value={phone}
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:outline-none disabled:text-slate-500"
                  />
                  {step === 'otp' && (
                    <button
                      type="button"
                      onClick={() => {
                        setStep('phone');
                        setOtp(['', '', '', '']);
                      }}
                      aria-label="Edit phone number"
                      className="ml-2 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer shrink-0"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* OTP Input — four boxes */}
            {step === 'otp' && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 pt-1"
              >
                <div className="flex items-center justify-center gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      autoFocus={index === 0}
                      value={otp[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="h-13 w-13 sm:h-14 sm:w-14 rounded-2xl border-2 border-slate-200 bg-slate-50/80 text-center text-xl font-bold text-slate-900 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/15"
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center text-xs px-1 pt-1">
                  <span className="text-slate-500">Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-teal-600 hover:text-teal-700 font-bold hover:underline cursor-pointer transition-colors"
                  >
                    Resend OTP
                  </button>
                </div>
              </motion.div>
            )}

            {/* GET OTP / VERIFY / REGISTER Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center h-12 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-[0_8px_20px_rgba(13,148,136,0.25)] transition-all cursor-pointer uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>
                  {step === 'phone'
                    ? 'Get OTP'
                    : step === 'otp'
                    ? 'Verify & Continue'
                    : 'Complete & Explore'}
                </span>
              )}
            </motion.button>
          </form>

          {/* Privacy · Terms · Support Links */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <AuthLegalLinks
              module="platform"
              variant="icons"
              className="flex items-center justify-center gap-7"
              linkClassName="group flex flex-col items-center gap-1 cursor-pointer"
              iconWrapClassName="w-8 h-8 rounded-full border border-slate-200 bg-slate-50/80 flex items-center justify-center text-slate-500 transition-all group-hover:bg-teal-50 group-hover:border-teal-500 group-hover:text-teal-600"
              iconClassName="text-xs"
              labelClassName="text-[9px] font-semibold uppercase tracking-wider text-slate-400 transition-colors group-hover:text-teal-600"
            />
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
};
