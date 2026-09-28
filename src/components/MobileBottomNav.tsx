import React from 'react';
import { Tag, ClipboardList, PlusCircle, User as UserIcon, Download } from 'lucide-react';
import { User } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileBottomNavProps {
  currentView: 'customer-portal' | 'admin-dashboard' | 'customer-login' | 'admin-login';
  onNavigate: (view: 'customer-portal' | 'admin-dashboard' | 'customer-login' | 'admin-login') => void;
  currentUser: User | null;
  customerTab?: 'offers' | 'my-claims';
  onSetCustomerTab?: (tab: 'offers' | 'my-claims') => void;
  onOpenQuickClaim?: () => void;
  claimsCount?: number;
  onOpenInstallModal?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  currentUser,
  customerTab = 'offers',
  onSetCustomerTab,
  onOpenQuickClaim,
  claimsCount = 0,
  onOpenInstallModal
}) => {
  const { isInstallable, install } = usePWAInstall();

  // If in admin mode, hide the mobile customer dock completely so it never displays admin buttons
  if (currentView === 'admin-dashboard' || currentView === 'admin-login') {
    return null;
  }

  const isOffersActive = currentView === 'customer-portal' && customerTab === 'offers';
  const isClaimsActive = currentView === 'customer-portal' && customerTab === 'my-claims';
  const isLoginActive = currentView === 'customer-login';

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)] transition-all">
      <div className="max-w-md mx-auto px-3 py-1.5 flex items-center justify-around">
        {/* Tab 1: Live Deals / Offers */}
        <button
          onClick={() => {
            onNavigate('customer-portal');
            if (onSetCustomerTab) onSetCustomerTab('offers');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer ${
            isOffersActive
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${isOffersActive ? 'bg-indigo-50' : ''}`}>
            <Tag className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">Deals</span>
        </button>

        {/* Tab 2: My Claims */}
        <button
          onClick={() => {
            onNavigate('customer-portal');
            if (onSetCustomerTab) onSetCustomerTab('my-claims');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 relative cursor-pointer ${
            isClaimsActive
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${isClaimsActive ? 'bg-indigo-50' : ''}`}>
            <ClipboardList className="w-5 h-5" />
          </div>
          {claimsCount > 0 && (
            <span className="absolute top-0.5 right-4 w-4 h-4 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
              {claimsCount > 9 ? '9+' : claimsCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">My Claims</span>
        </button>

        {/* Tab 3: Center Action (Claim Now) */}
        <button
          onClick={() => {
            onNavigate('customer-portal');
            if (onOpenQuickClaim) onOpenQuickClaim();
          }}
          className="flex flex-col items-center justify-center -mt-5 flex-1 transition active:scale-90 cursor-pointer"
          title="Claim Cashback"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40 flex items-center justify-center border-4 border-white">
            <PlusCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-bold text-indigo-700 mt-0.5">Claim Now</span>
        </button>

        {/* Tab 4: Install App */}
        <button
          onClick={() => {
            if (isInstallable) {
              install();
            } else if (onOpenInstallModal) {
              onOpenInstallModal();
            }
          }}
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 hover:text-indigo-600 transition active:scale-95 cursor-pointer"
        >
          <div className="p-1 rounded-xl">
            <Download className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-amber-700">App</span>
        </button>

        {/* Tab 5: Account / Customer Login */}
        <button
          onClick={() => {
            if (currentUser) {
              onNavigate('customer-portal');
              if (onSetCustomerTab) onSetCustomerTab('my-claims');
            } else {
              onNavigate('customer-login');
            }
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition active:scale-95 cursor-pointer ${
            isLoginActive
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${isLoginActive ? 'bg-indigo-50' : ''}`}>
            <UserIcon className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 truncate max-w-[55px]">
            {currentUser ? 'Account' : 'Login'}
          </span>
        </button>
      </div>
    </nav>
  );
};
