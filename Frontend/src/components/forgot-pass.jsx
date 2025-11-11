import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Loader, Moon, Sun, KeyRound } from 'lucide-react';
const API = import.meta.env.VITE_API_BASE_URL;

const Input = ({ icon: Icon, label, type = "text", value, onChange, error, ...props }) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="relative mb-6">
      <div className={`relative flex items-center transition-all duration-300 ${
        focused ? 'transform scale-[1.02]' : ''
      }`}>
        <Icon className={`absolute left-4 transition-colors duration-300 ${
          focused ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
        }`} size={20} />
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full px-12 py-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm 
            border-2 rounded-2xl transition-all duration-300 outline-none 
            placeholder-gray-400 dark:placeholder-gray-500
            text-gray-900 dark:text-white
            ${focused ? 'border-indigo-500 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30' : 'border-gray-200 dark:border-gray-700'}
            ${error ? 'border-red-400 dark:border-red-500' : ''}`}
          placeholder={label}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm mt-2 ml-4 flex items-center gap-1 
          animate-in slide-in-from-left duration-300">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

const Button = ({ children, loading, onClick, variant = "primary", icon: Icon }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full py-4 px-6 rounded-2xl font-semibold text-white
        transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
        flex items-center justify-center gap-2 shadow-lg
        ${variant === 'primary' 
          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-200 dark:shadow-indigo-900/50' 
          : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-gray-200 dark:shadow-gray-900/50'}
        ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <>
          <Loader className="animate-spin" size={20} />
          Processing...
        </>
      ) : (
        <>
          {children}
          {Icon && <Icon size={20} />}
        </>
      )}
    </button>
  );
};

const Alert = ({ type, message, onClose }) => {
  const isSuccess = type === 'success';
  
  return (
    <div className={`fixed top-6 right-6 max-w-md p-4 rounded-2xl backdrop-blur-lg shadow-2xl
      animate-in slide-in-from-top duration-500 z-50
      ${isSuccess 
        ? 'bg-green-50/90 dark:bg-green-900/90 border-2 border-green-200 dark:border-green-700' 
        : 'bg-red-50/90 dark:bg-red-900/90 border-2 border-red-200 dark:border-red-700'}`}>
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
        ) : (
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
        )}
        <div className="flex-1">
          <p className={`font-semibold ${isSuccess ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
            {isSuccess ? 'Success!' : 'Error'}
          </p>
          <p className={`text-sm ${isSuccess ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 
            transition-colors text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const OTPInput = ({ length = 6, value, onChange }) => {
  const inputs = useRef([]);
  
  const handleChange = (index, val) => {
    if (!/^\d*$/.test(val)) return;
    
    const newOtp = value.split('');
    newOtp[index] = val;
    onChange(newOtp.join(''));
    
    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };
  
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (/^\d+$/.test(pastedData)) {
      onChange(pastedData);
      inputs.current[Math.min(pastedData.length, length - 1)]?.focus();
    }
  };
  
  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-14 h-16 text-center text-2xl font-bold bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm
            border-2 border-gray-200 dark:border-gray-700 rounded-2xl transition-all duration-300
            focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-100 dark:focus:shadow-indigo-900/30 focus:scale-110
            outline-none text-gray-900 dark:text-white"
        />
      ))}
    </div>
  );
};

const ProgressIndicator = ({ currentStep, darkMode }) => {
  const steps = [
    { number: 1, label: 'Email' },
    { number: 2, label: 'Verify' },
    { number: 3, label: 'Reset' }
  ];
  
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold
              transition-all duration-500 transform
              ${currentStep >= step.number 
                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white scale-110 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50' 
                : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
              }`}>
              {currentStep > step.number ? (
                <CheckCircle size={20} />
              ) : (
                step.number
              )}
            </div>
            <span className={`text-xs mt-2 font-medium transition-colors duration-300
              ${currentStep >= step.number 
                ? darkMode ? 'text-indigo-400' : 'text-indigo-600' 
                : darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-500
              ${currentStep > step.number 
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700' 
                : darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const PasswordStrengthIndicator = ({ password, darkMode }) => {
  const getStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };
  
  const strength = getStrength();
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500'
  ];
  
  if (!password) return null;
  
  return (
    <div className="mb-4">
      <div className="flex gap-1 mb-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < strength ? colors[strength - 1] : darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Password strength: <span className="font-semibold">{labels[strength - 1] || 'Very Weak'}</span>
      </p>
    </div>
  );
};

export default function ForgotPasswordFlow() {
  const [darkMode, setDarkMode] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    setAnimate(false);
    setTimeout(() => setAnimate(true), 50);
  }, [step]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Invalid email format' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateOTP = () => {
    if (otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validatePassword = () => {
    if (!newPassword) {
      setErrors({ password: 'Password is required' });
      return false;
    }
    if (newPassword.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateEmail()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert('success', 'OTP sent to your email!');
        setTimeout(() => setStep(2), 500);
      } else {
        showAlert('error', data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      showAlert('error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateOTP()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/users/forgot-password/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok && data.resetToken) {
        setResetToken(data.resetToken);
        showAlert('success', 'OTP verified successfully!');
        setTimeout(() => setStep(3), 500);
      } else {
        showAlert('error', data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      showAlert('error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/users/forgot-password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resetToken, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert('success', 'Password reset successfully!');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        showAlert('error', data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      showAlert('error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp('');
    handleSendOTP();
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 
      ${darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950' 
        : 'bg-gradient-to-br from-indigo-50 via-white to-indigo-100'
      } flex items-center justify-center p-4 relative overflow-hidden`}>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full 
          mix-blend-multiply filter blur-3xl opacity-30 animate-pulse
          ${darkMode ? 'bg-indigo-600' : 'bg-indigo-300'}`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full 
          mix-blend-multiply filter blur-3xl opacity-30 animate-pulse
          ${darkMode ? 'bg-purple-600' : 'bg-purple-300'}`}
          style={{ animationDelay: '1s' }}></div>
      </div>

      <button
        onClick={toggleDarkMode}
        className={`fixed top-6 right-6 p-3 rounded-2xl backdrop-blur-lg shadow-lg
          transition-all duration-300 hover:scale-110 z-50
          ${darkMode 
            ? 'bg-gray-800/80 text-yellow-400 hover:bg-gray-700/80' 
            : 'bg-white/80 text-indigo-600 hover:bg-white/90'
          }`}
      >
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}

      <div className={`w-full max-w-md transition-all duration-700 transform
        ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        <div className={`backdrop-blur-xl rounded-3xl shadow-2xl p-8 border relative overflow-hidden
          ${darkMode 
            ? 'bg-gray-800/60 border-gray-700/50' 
            : 'bg-white/60 border-white/20'
          }`}>
          
          <div className={`absolute inset-0 pointer-events-none
            ${darkMode 
              ? 'bg-gradient-to-br from-gray-700/40 to-transparent' 
              : 'bg-gradient-to-br from-white/40 to-transparent'
            }`}></div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 
                bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl mb-4
                shadow-lg transform hover:rotate-6 transition-transform duration-300
                ${darkMode ? 'shadow-indigo-900/50' : 'shadow-indigo-200'}`}>
                <KeyRound className="text-white" size={32} />
              </div>
              <h1 className={`text-3xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent
                ${darkMode 
                  ? 'from-indigo-400 to-indigo-600' 
                  : 'from-indigo-600 to-indigo-800'
                }`}>
                {step === 1 && 'Forgot Password'}
                {step === 2 && 'Verify OTP'}
                {step === 3 && 'Reset Password'}
              </h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {step === 1 && 'Enter your email to receive an OTP'}
                {step === 2 && 'Enter the 6-digit code sent to your email'}
                {step === 3 && 'Create a new strong password'}
              </p>
            </div>

            <ProgressIndicator currentStep={step} darkMode={darkMode} />

            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-left duration-500">
                <Input
                  icon={Mail}
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendOTP()}
                />

                <Button loading={loading} onClick={handleSendOTP} icon={ArrowRight}>
                  Send OTP
                </Button>

                <button
                  onClick={() => window.location.href = '/login'}
                  className={`w-full mt-4 text-sm font-medium transition-colors duration-300
                    ${darkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  ← Back to login
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right duration-500">
                <div className="mb-2">
                  <p className={`text-sm text-center mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Code sent to <span className="font-semibold text-indigo-600 dark:text-indigo-400">{email}</span>
                  </p>
                </div>

                <div className="mb-6">
                  <OTPInput value={otp} onChange={setOtp} />
                  {errors.otp && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-2 text-center flex items-center justify-center gap-1">
                      <AlertCircle size={14} />
                      {errors.otp}
                    </p>
                  )}
                </div>

                <Button loading={loading} onClick={handleVerifyOTP} icon={ArrowRight}>
                  Verify OTP
                </Button>

                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setStep(1)}
                    className={`text-sm font-medium transition-colors duration-300 flex items-center gap-1
                      ${darkMode 
                        ? 'text-gray-400 hover:text-gray-200' 
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <button
                    onClick={handleResendOTP}
                    disabled={loading}
                    className={`text-sm font-medium transition-colors duration-300
                      ${darkMode 
                        ? 'text-indigo-400 hover:text-indigo-300' 
                        : 'text-indigo-600 hover:text-indigo-800'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right duration-500">
                <div className="relative mb-6">
                  <Input
                    icon={Lock}
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    error={errors.password}
                    onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-4 transition-colors duration-300
                      ${darkMode 
                        ? 'text-gray-400 hover:text-indigo-400' 
                        : 'text-gray-400 hover:text-indigo-600'
                      }`}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>

                <PasswordStrengthIndicator password={newPassword} darkMode={darkMode} />

                <Button loading={loading} onClick={handleResetPassword} icon={CheckCircle}>
                  Reset Password
                </Button>

                <button
                  onClick={() => setStep(2)}
                  className={`w-full mt-4 text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-1
                    ${darkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Remember your password?{' '}
            <a href="/login" className={`font-semibold transition-colors duration-300 hover:underline
              ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}