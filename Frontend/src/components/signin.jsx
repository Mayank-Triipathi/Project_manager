import React, { useState, useRef, useEffect } from 'react';
import { Mail, User, UserCircle, ArrowRight, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { Lock } from 'lucide-react';

// Reusable Input Component
const Input = ({ icon: Icon, label, type = "text", value, onChange, error, ...props }) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="relative mb-6"> 
      <div className={`relative flex items-center transition-all duration-300 ${
        focused ? 'transform scale-[1.02]' : ''
      }`}>
        <Icon className={`absolute left-4 transition-colors duration-300 ${
          focused ? 'text-indigo-600' : 'text-gray-400'
        }`} size={20} />
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full px-12 py-4 bg-white/70 backdrop-blur-sm border-2 rounded-2xl
            transition-all duration-300 outline-none placeholder-gray-400
            ${focused ? 'border-indigo-500 shadow-lg shadow-indigo-100' : 'border-gray-200'}
            ${error ? 'border-red-400' : ''}`}
          placeholder={label}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-2 ml-4 flex items-center gap-1 animate-in slide-in-from-left duration-300">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

// Reusable Button Component
const Button = ({ children, loading, onClick, variant = "primary" }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full py-4 px-6 rounded-2xl font-semibold text-white
        transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
        flex items-center justify-center gap-2 shadow-lg
        ${variant === 'primary' 
          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-200' 
          : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-gray-200'}
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
          <ArrowRight size={20} />
        </>
      )}
    </button>
  );
};

// Alert Component
const Alert = ({ type, message, onClose }) => {
  const isSuccess = type === 'success';
  
  return (
    <div className={`fixed top-6 right-6 max-w-md p-4 rounded-2xl backdrop-blur-lg shadow-2xl
      animate-in slide-in-from-top duration-500 z-50
      ${isSuccess ? 'bg-green-50/90 border-2 border-green-200' : 'bg-red-50/90 border-2 border-red-200'}`}>
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
        ) : (
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
        )}
        <div className="flex-1">
          <p className={`font-semibold ${isSuccess ? 'text-green-900' : 'text-red-900'}`}>
            {isSuccess ? 'Success!' : 'Error'}
          </p>
          <p className={`text-sm ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`text-gray-500 hover:text-gray-700 transition-colors`}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// OTP Input Component
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
          className="w-14 h-16 text-center text-2xl font-bold bg-white/70 backdrop-blur-sm
            border-2 border-gray-200 rounded-2xl transition-all duration-300
            focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-100 focus:scale-110
            outline-none"
        />
      ))}
    </div>
  );
};



// Main App Component
export default function SignupPage() {
  const [step, setStep] = useState('signup'); // 'signup' or 'otp'
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: ''
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');

  
  useEffect(() => {
    setAnimate(true);
  }, []);
  
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSignup = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    console.log('Submitting formData:', formData);

    
    try {
          const response = await fetch("http://localhost:5000/api/users/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

      
      const data = await response.json();
      
      if (response.ok) {
        showAlert('success', 'OTP sent to your email!');
        setTimeout(() => setStep('otp'), 500);
      } else {
        showAlert('error', data.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      showAlert('error', 'Network error. Please check your connection.',error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      showAlert('error', 'Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/users/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email, otp }),
    });

      
      const data = await response.json();
      
  if (response.ok) {
    setResetToken(data.resetToken); // <- this must exist
    setStep('setPassword');
  }
  else {
          showAlert('error', data.message || 'Invalid OTP. Please try again.');
        }
    } catch (error) {
      showAlert('error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };
  const handleSetPassword = async () => {
    if (!password) {
      showAlert('error', 'Password cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/users/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, resetToken }) // pass the OTP token from verify step
      });

      const data = await response.json();

      if (response.ok) {
        showAlert('success', 'Password set successfully! Redirecting to sign in...');
        setTimeout(() => navigate('/signin'), 1500);
      } else {
        showAlert('error', data.error || 'Failed to set password');
      }
    } catch (err) {
      showAlert('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 
      flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300 rounded-full 
          mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full 
          mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" 
          style={{ animationDelay: '1s' }}></div>
      </div>
      
      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}
      
      <div className={`w-full max-w-md transition-all duration-700 transform
        ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Card Container */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 
          border border-white/20 relative overflow-hidden">
          
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent 
            pointer-events-none"></div>
          
          <div className="relative z-10">
            {step === 'signup' ? (
              <div className={`transition-all duration-500 ${step === 'signup' ? 'animate-in fade-in slide-in-from-left' : ''}`}>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 
                    bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl mb-4
                    shadow-lg shadow-indigo-200 transform hover:rotate-6 transition-transform duration-300">
                    <UserCircle className="text-white" size={32} />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 
                    bg-clip-text text-transparent mb-2">
                    Create Account
                  </h1>
                  <p className="text-gray-600">Join us and get started in seconds</p>
                </div>
                
                {/* Form */}
                <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
                  <Input
                    icon={User}
                    label="Full Name"
                    value={formData.fullname}
                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    error={errors.fullname}
                  />
                  
                  <Input
                    icon={UserCircle}
                    label="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    error={errors.username}
                  />
                  
                  <Input
                    icon={Mail}
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                  />
                  
                  <Button loading={loading}>
                    Continue
                  </Button>
                </form>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right duration-500">
                {/* OTP Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 
                    bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl mb-4
                    shadow-lg shadow-indigo-200">
                    <Mail className="text-white" size={32} />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 
                    bg-clip-text text-transparent mb-2">
                    Verify Email
                  </h1>
                  <p className="text-gray-600">
                    Enter the 6-digit code sent to<br />
                    <span className="font-semibold text-indigo-600">{formData.email}</span>
                  </p>
                </div>
                
                {/* OTP Input */}
                <div className="mb-8">
                  <OTPInput value={otp} onChange={setOtp} />
                </div>
                
                <Button loading={loading} onClick={handleVerifyOTP}>
                  Verify OTP
                </Button>
                
                <button
                  onClick={() => setStep('signup')}
                  className="w-full mt-4 text-sm text-gray-600 hover:text-indigo-600 
                    transition-colors duration-300"
                >
                  ← Back to signup
                </button>
                
                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full mt-2 text-sm text-indigo-600 hover:text-indigo-800 
                    transition-colors duration-300 font-medium"
                >
                  Resend OTP
                </button>
              </div>
            )}
            {step === 'setPassword' && (
              <div className="animate-in fade-in slide-in-from-right duration-500">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 
                    bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl mb-4
                    shadow-lg shadow-indigo-200">
                    <Lock className="text-white" size={32} />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 
                    bg-clip-text text-transparent mb-2">
                    Set Password
                  </h1>
                  <p className="text-gray-600">
                    Choose a strong password for <br />
                    <span className="font-semibold text-indigo-600">{formData.email}</span>
                  </p>
                </div>

                <Input
                  icon={Lock}
                  label="Password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />

                <Button loading={loading} onClick={handleSetPassword}>
                  Set Password
                </Button>
              </div>
            )}

            
            {/* Terms & Privacy */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                By continuing you agree to our{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-800 
                  transition-colors duration-300 hover:underline font-medium">
                  Terms
                </a>
                {' '}and{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-800 
                  transition-colors duration-300 hover:underline font-medium">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
        
        {/* Already have account */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
                  to="/signin"
                  className="text-indigo-600 hover:text-indigo-800 font-semibold
                    transition-colors duration-300 hover:underline">
                  Sign in
            </Link>

          </p>
        </div>
      </div>
    </div>
  );
}