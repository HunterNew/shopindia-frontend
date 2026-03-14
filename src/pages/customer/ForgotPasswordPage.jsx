import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowLeft, FiCheck, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../utils/api';

// Steps: 1 = enter email, 2 = enter OTP, 3 = set new password
export default function ForgotPasswordPage() {
  const navigate       = useNavigate();
  const [step,         setStep]         = useState(1);
  const [email,        setEmail]        = useState('');
  const [otp,          setOtp]          = useState(['', '', '', '', '', '']);
  const [newPassword,  setNewPassword]  = useState('');
  const [confirmPass,  setConfirmPass]  = useState('');
  const [loading,      setLoading]      = useState(false);
  const [resendTimer,  setResendTimer]  = useState(0);
  const inputRefs = useRef([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // ── Step 1: Send OTP ─────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email!');
      setStep(2);
      setResendTimer(60); // 60 second cooldown
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────
  const handleOTPChange = (index, value) => {
    // Accept only digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);

    // Auto-focus next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    // On backspace, clear current and move back
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) { toast.error('Please enter all 6 digits'); return; }
    setLoading(true);
    try {
      await API.post('/auth/verify-otp', { email, otp: otpString });
      toast.success('OTP verified!');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
      // Shake the boxes on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      toast.success('New OTP sent!');
      setOtp(['', '', '', '', '', '']);
      setResendTimer(60);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error('Failed to resend OTP');
    } finally { setLoading(false); }
  };

  // ── Step 3: Reset Password ───────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPass) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await API.post('/auth/reset-password', {
        email,
        otp: otp.join(''),
        newPassword
      });
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed');
    } finally { setLoading(false); }
  };

  // ── Step indicator ───────────────────────────────────────────────────────
  const steps = ['Enter Email', 'Verify OTP', 'New Password'];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1">We'll send an OTP to reset your password</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((label, i) => {
            const num     = i + 1;
            const active  = step === num;
            const done    = step > num;
            return (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    done   ? 'bg-green-500 text-white' :
                    active ? 'bg-orange-500 text-white' :
                             'bg-gray-100 text-gray-400'
                  }`}>
                    {done ? <FiCheck size={14} /> : num}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${active ? 'text-orange-500' : done ? 'text-green-500' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${step > num ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Step 1: Email ── */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-9"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Enter the email address you used to register
              </p>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending OTP...</>
                : '📧 Send OTP'
              }
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-gray-500 hover:text-orange-500 flex items-center justify-center gap-1">
                <FiArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* ── Step 2: OTP ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                OTP sent to <span className="font-semibold text-gray-900">{email}</span>
              </p>
              <button type="button" onClick={() => setStep(1)} className="text-xs text-orange-500 hover:underline mt-1">
                Change email
              </button>
            </div>

            {/* 6-box OTP input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-3 text-center">
                Enter 6-digit OTP
              </label>
              <div className="flex justify-center gap-2" onPaste={handleOTPPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOTPChange(i, e.target.value)}
                    onKeyDown={e => handleOTPKeyDown(i, e)}
                    className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all
                      ${digit ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-800'}
                      focus:border-orange-500 focus:bg-orange-50`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">
                You can paste the 6-digit code directly
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
                : '✓ Verify OTP'
              }
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-400">
                  Resend OTP in <span className="font-semibold text-orange-500">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1 mx-auto"
                >
                  <FiRefreshCw size={13} /> Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* ── Step 3: New Password ── */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-sm text-green-700">
              <FiCheck size={16} className="flex-shrink-0" />
              OTP verified! Set your new password below.
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><FiLock size={12} /> New Password</span>
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="input-field"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><FiLock size={12} /> Confirm New Password</span>
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Re-enter new password"
                className="input-field"
              />
              {/* Password match indicator */}
              {confirmPass && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${newPassword === confirmPass ? 'text-green-600' : 'text-red-500'}`}>
                  {newPassword === confirmPass
                    ? <><FiCheck size={11} /> Passwords match</>
                    : '✗ Passwords do not match'
                  }
                </p>
              )}
            </div>

            {/* Password strength */}
            {newPassword && (
              <div>
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                      getStrength(newPassword) >= i
                        ? ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'][getStrength(newPassword)]
                        : 'bg-gray-200'
                    }`} />
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  Strength: {['', 'Weak', 'Fair', 'Good', 'Strong'][getStrength(newPassword)]}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || newPassword !== confirmPass || newPassword.length < 6}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Resetting...</>
                : '🔐 Reset Password'
              }
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

// Password strength helper
function getStrength(password) {
  let score = 0;
  if (password.length >= 6)  score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return score;
}
