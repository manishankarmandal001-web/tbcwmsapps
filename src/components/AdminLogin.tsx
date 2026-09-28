import React, { useState } from 'react';
import { User } from '../types';
import {
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Lock,
  KeyRound,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface AdminLoginProps {
  onLogin: (user: User) => void;
  onSwitchToCustomer: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onSwitchToCustomer }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const OWNER_PROFILE: User = {
    name: 'Manishankar Mandal',
    mobile: '1800-WMS-ADM',
    email: 'manishankarmandal001@gmail.com',
    type: 'admin'
  };

  const handlePersonalDirectAccess = () => {
    onLogin(OWNER_PROFILE);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === 'admin123' || password === 'admin' || password === '1234') {
      onLogin(OWNER_PROFILE);
      return;
    }

    setError('Incorrect security password. (Hint: default master password is admin123 or use 1-Click Access)');
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-12 px-3">
      <div className="bg-slate-900 text-white p-7 sm:p-9 rounded-3xl shadow-2xl border border-indigo-500/20 relative overflow-hidden">
        {/* Glow styling */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onSwitchToCustomer}
            className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to App</span>
          </button>
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
            Private Access
          </span>
        </div>

        {/* Personalized Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-950 text-indigo-400 mb-3 border border-indigo-500/30 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Personal Admin Console</h2>
          <p className="text-xs text-slate-400 mt-1">
            Restricted exclusively to application owner
          </p>
          <div className="mt-3 inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-slate-200">
            👤 <span className="text-amber-300 font-bold">Manishankar Mandal</span> (Owner)
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Quick 1-Click Instant Owner Access */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handlePersonalDirectAccess}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>1-Click Enter Admin Console</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
            Or Passcode Verification
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Passcode Form */}
        <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Master Security Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (default: admin123)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Verify & Open Console</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Public admin registration is permanently disabled.
          </p>
        </div>
      </div>
    </div>
  );
};
