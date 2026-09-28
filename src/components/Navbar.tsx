import React, { useState } from 'react';
import { User } from '../types';
import { Shield, Smartphone, Download, ExternalLink, User as UserIcon, LogOut, CheckCircle2, Wifi } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface NavbarProps {
  currentUser?: User | null;
  currentView?: string;
  onNavigate?: (view: 'customer-login' | 'customer-portal' | 'admin-login' | 'admin-dashboard') => void;
  onLogout?: () => void;
  onOpenDeployGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onLogout,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-all pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex h-15 sm:h-16 items-center justify-between gap-2">
          {/* Brand Header */}
          <div
            onClick={() => onNavigate && onNavigate('customer-portal')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="relative">
              <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/20">
                T
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={isOnline ? 'Connected' : 'Offline Mode'}
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                  TBC WMS
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-md">
                  App
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline leading-tight">
                Cashback & Rewards Portal
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* In-App One-Click Install Button */}
            {!isInstalled && isInstallable && (
              <button
                onClick={install}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-2.5 sm:px-3 py-1.5 rounded-xl text-xs shadow-sm transition active:scale-95 cursor-pointer"
                title="Install Progressive Web App on your device"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install App</span>
                <span className="sm:hidden">Install</span>
              </button>
            )}

            {/* View Switcher: Show Customer App only when inside admin views */}
            {currentView?.startsWith('admin') ? (
              <button
                onClick={() => onNavigate && onNavigate('customer-portal')}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Customer App</span>
                <span className="sm:hidden">User</span>
              </button>
            ) : null}

            {/* User Profile / Status */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[70px] truncate hidden sm:inline">{currentUser.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{currentUser.mobile}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded">
                        {currentUser.type}
                      </span>
                    </div>

                    {onLogout && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate && onNavigate('customer-login')}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
