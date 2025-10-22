import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Moon, Sun, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Input = ({ icon: Icon, label, type = "text", value, onChange, error, showPassword, onTogglePassword, ...props }) => {
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
        {type === 'password' && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 
              transition-colors duration-300"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
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

const Button = ({ children, loading, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full py-4 px-6 rounded-2xl font-semibold text-white
        transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
        flex items-center justify-center gap-2 shadow-lg
        bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 
        shadow-indigo-200 dark:shadow-indigo-900/50
        ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <>
          <Loader className="animate-spin" size={20} />
          Signing in...
        </>
      ) : (
        <>
          {children}
          <LogIn size={20} />
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

const Checkbox = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 
          ${checked 
            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-600 dark:border-indigo-500' 
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 group-hover:border-indigo-400'
          }`}>
          {checked && (
            <svg className="w-full h-full text-white p-1 animate-in zoom-in duration-300" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 
        dark:group-hover:text-gray-200 transition-colors duration-300">
        {label}
      </span>
    </label>
  );
};

export default function LoginPage() {
    const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
    
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.fullname);
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        showAlert('success', `Welcome back, ${data.user?.name || 'User'}!`);
        
        setTimeout(() => {
            navigate('/dashboard');
        }, 1500);

      } else {
        showAlert('error', data.message || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      showAlert('error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
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
                <LogIn className="text-white" size={32} />
              </div>
              <h1 className={`text-3xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent
                ${darkMode 
                  ? 'from-indigo-400 to-indigo-600' 
                  : 'from-indigo-600 to-indigo-800'
                }`}>
                Welcome Back
              </h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Sign in to continue to your account
              </p>
            </div>

            <div onKeyPress={handleKeyPress}>
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
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />

              <div className="flex items-center justify-between mb-6">
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  label="Remember me"
                />
                <Link
                    to="/forgot-password"
                    className={`text-sm font-medium transition-colors duration-300
                        ${darkMode 
                        ? 'text-indigo-400 hover:text-indigo-300' 
                        : 'text-indigo-600 hover:text-indigo-800'
                        }`}
                    >
                    Forgot password?
                </Link>
              </div>

              <Button loading={loading} onClick={handleLogin}>
                Sign In
              </Button>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${darkMode ? 'bg-gray-800/60 text-gray-400' : 'bg-white/60 text-gray-500'}`}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button className={`py-3 px-4 rounded-xl font-medium transition-all duration-300
                hover:scale-105 active:scale-95 flex items-center justify-center gap-2
                ${darkMode 
                  ? 'bg-gray-700/50 hover:bg-gray-700 text-white border border-gray-600' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200'
                }`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className={`py-3 px-4 rounded-xl font-medium transition-all duration-300
                hover:scale-105 active:scale-95 flex items-center justify-center gap-2
                ${darkMode 
                  ? 'bg-gray-700/50 hover:bg-gray-700 text-white border border-gray-600' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200'
                }`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Don't have an account?{' '}
            <a href="#" className={`font-semibold transition-colors duration-300 hover:underline
              ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}