import React from 'react';
import { User, Product, Claim } from '../types';
import { Navbar } from '../components/Navbar';
import { CustomerLogin } from '../components/CustomerLogin';
import { CustomerPortal } from '../components/CustomerPortal';
import { PWAInstallBanner } from '../components/PWAInstallBanner';
import { MobileBottomNav } from '../components/MobileBottomNav';

interface CustomerAppProps {
  products: Product[];
  claims: Claim[];
  currentUser: User | null;
  currentView: 'customer-portal' | 'customer-login';
  onNavigate: (view: 'customer-portal' | 'customer-login') => void;
  customerTab: 'offers' | 'my-claims';
  onSetCustomerTab: (tab: 'offers' | 'my-claims') => void;
  onCustomerLogin: (user: User) => void;
  onCustomerLogout: () => void;
  onSubmitClaim: (claim: Omit<Claim, 'id' | 'submittedAt' | 'status'>) => void;
  onViewProof: (claim: Claim, type: 'order' | 'payment' | 'rating') => void;
  onOpenDeployGuide: () => void;
  onOpenQuickClaim: () => void;
}

export const CustomerApp: React.FC<CustomerAppProps> = ({
  products,
  claims,
  currentUser,
  currentView,
  onNavigate,
  customerTab,
  onSetCustomerTab,
  onCustomerLogin,
  onCustomerLogout,
  onSubmitClaim,
  onViewProof,
  onOpenDeployGuide,
  onOpenQuickClaim
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-indigo-500 selection:text-white font-sans">
      <div className="flex flex-col min-h-screen bg-slate-50">
        {/* PWA Mobile App Install Header Banner */}
        <PWAInstallBanner />

        {/* Navigation Header */}
        <Navbar
          currentUser={currentUser}
          currentView={currentView}
          onNavigate={(view) => {
            if (view === 'customer-portal' || view === 'customer-login') {
              onNavigate(view);
            }
          }}
          onLogout={onCustomerLogout}
          onOpenDeployGuide={onOpenDeployGuide}
        />

        {/* Main Application Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-12">
          {currentView === 'customer-login' ? (
            <CustomerLogin onLogin={onCustomerLogin} />
          ) : (
            <CustomerPortal
              products={products}
              claims={claims}
              onSubmitClaim={onSubmitClaim}
              onViewProof={onViewProof}
              currentUser={currentUser}
              onLogin={onCustomerLogin}
              onLogout={onCustomerLogout}
              externalActiveTab={customerTab}
              onExternalActiveTabChange={onSetCustomerTab}
            />
          )}
        </main>

        {/* App Footer */}
        <footer className="bg-white border-t border-slate-200/80 py-5 text-xs text-slate-500 mb-14 md:mb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                T
              </div>
              <span className="font-bold text-slate-700">TBC WMS App</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                PWA Ready
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <span>Verified Direct Cashback & Rewards</span>
            </div>
          </div>
        </footer>

        {/* Modern Mobile App Bottom Navigation Dock */}
        <MobileBottomNav
          currentView={currentView}
          onNavigate={(view) => {
            if (view === 'customer-portal' || view === 'customer-login') {
              onNavigate(view);
            }
          }}
          currentUser={currentUser}
          customerTab={customerTab}
          onSetCustomerTab={onSetCustomerTab}
          onOpenQuickClaim={onOpenQuickClaim}
          claimsCount={
            currentUser
              ? claims.filter((c) => c.customerMobile === currentUser.mobile).length
              : 0
          }
        />
      </div>
    </div>
  );
};
