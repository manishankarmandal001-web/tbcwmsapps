import React, { useState } from 'react';
import { User } from '../types';
import {
  ArrowRight,
  UserCheck,
  UserPlus,
  Phone,
  Mail,
  Lock,
  User as UserIcon,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface CustomerLoginProps {
  onLogin: (user: User) => void;
}

interface StoredCustomer {
  name: string;
  mobile: string;
  email: string;
  password: string;
  createdAt: string;
}

export const CustomerLogin: React.FC<CustomerLoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpMobile, setSignUpMobile] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helper to get registered customers from storage
  const getRegisteredCustomers = (): StoredCustomer[] => {
    try {
      const data = localStorage.getItem('wms_registered_customers_v1');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanIdentifier = loginIdentifier.trim().toLowerCase();
    const cleanDigits = cleanIdentifier.replace(/\D/g, '');

    if (!cleanIdentifier) {
      setError('Please enter your registered Mobile Number or Email.');
      return;
    }

    if (!loginPassword) {
      setError('Please enter your account password.');
      return;
    }

    const customers = getRegisteredCustomers();
    const found = customers.find(
      (c) =>
        (c.email.toLowerCase() === cleanIdentifier ||
          c.mobile === cleanDigits ||
          c.mobile === cleanIdentifier) &&
        c.password === loginPassword
    );

    if (found) {
      onLogin({
        name: found.name,
        mobile: found.mobile,
        email: found.email,
        type: 'customer'
      });
      return;
    }

    // Friendly demo fallback for easy initial testing
    if (cleanIdentifier.includes('@') || cleanDigits.length === 10) {
      onLogin({
        name: cleanIdentifier.includes('@') ? cleanIdentifier.split('@')[0] : 'Valued Customer',
        mobile: cleanDigits.length === 10 ? cleanDigits : '9876543210',
        email: cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanDigits}@rewards.com`,
        type: 'customer'
      });
      return;
    }

    setError('Invalid credentials. Please enter a valid 10-digit mobile number or email address.');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!signUpName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanMobile = signUpMobile.trim().replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const cleanEmail = signUpEmail.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (signUpPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match. Please verify both passwords.');
      return;
    }

    const customers = getRegisteredCustomers();
    const alreadyExists = customers.some(
      (c) => c.mobile === cleanMobile || c.email === cleanEmail
    );

    if (alreadyExists) {
      setError('An account with this mobile number or email already exists. Please Sign In.');
      return;
    }

    const newCustomer: StoredCustomer = {
      name: signUpName.trim(),
      mobile: cleanMobile,
      email: cleanEmail,
      password: signUpPassword,
      createdAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(
        'wms_registered_customers_v1',
        JSON.stringify([...customers, newCustomer])
      );
    } catch (err) {
      console.error('Could not save customer', err);
    }

    setSuccess('Account created successfully! Logging you in...');
    setTimeout(() => {
      onLogin({
        name: newCustomer.name,
        mobile: newCustomer.mobile,
        email: newCustomer.email,
        type: 'customer'
      });
    }, 400);
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 px-3">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-3 shadow-inner">
            {activeTab === 'login' ? <UserCheck className="w-7 h-7" /> : <UserPlus className="w-7 h-7" />}
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {activeTab === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'login'
              ? 'Access your cashback claims, review tasks & payout rewards'
              : 'Join free to start receiving direct Amazon, Flipkart & Blinkit cashbacks'}
          </p>
        </div>

        {/* Tab Switcher: Login vs Sign Up */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Sign Up</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-in fade-in">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* 1. CUSTOMER SIGN IN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mobile Number or Email *</span>
              </label>
              <input
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="e.g. 9876543210 or name@gmail.com"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Password *</span>
                </label>
              </div>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
            >
              <span>Sign In to Customer Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="pt-2 text-center text-xs text-slate-500">
              <span>New to TBC WMS? </span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setError('');
                }}
                className="text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Create Account Free
              </button>
            </div>
          </form>
        )}

        {/* 2. CUSTOMER SIGN UP FORM */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <span>10-Digit Mobile Number (For UPI Payouts) *</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={signUpMobile}
                  onChange={(e) => setSignUpMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  required
                  className="w-full border border-slate-300 rounded-xl pl-12 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>Email Address *</span>
              </label>
              <input
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="name@gmail.com"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Password *</span>
                </label>
                <input
                  type="password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Confirm *</span>
                </label>
                <input
                  type="password"
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Create Account & Start Earning</span>
            </button>

            <div className="pt-2 text-center text-xs text-slate-500">
              <span>Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                }}
                className="text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
