import React, { useState, useEffect } from 'react';
import { Mail, User, UserCircle, ArrowRight, CheckCircle, AlertCircle, Loader, Lock } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./navbar.jsx"
import socket from '@/socket.js';
const API = import.meta.env.VITE_API_BASE_URL;

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

// Main Signup Component
export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

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
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSignup = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showAlert('success', 'Account created successfully! Redirecting to sign in...');
        localStorage.setItem('token', data.token);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.fullname);
        socket.connect()
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        showAlert('error', data.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      showAlert('error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
    <Navbar/>
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
            
            {/* Form Fields */}
            <div>
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
              
              <Input
                icon={Lock}
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
              />
              
              <Button loading={loading} onClick={handleSignup}>
                Create Account
              </Button>
            </div>
            
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
    </>
  );
}