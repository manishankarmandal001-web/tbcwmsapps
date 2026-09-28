import React, { useState, useEffect } from 'react';
import { User, Product, Claim, ClaimStatus } from '../types';
import { AdminDashboard } from '../components/AdminDashboard';
import { AdminLogin } from '../components/AdminLogin';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  ShieldCheck,
  ExternalLink,
  Download,
  LogOut,
  Wifi,
  Package,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface AdminAppProps {
  products: Product[];
  claims: Claim[];
  currentUser: User | null;
  onAdminLogin: (user: User) => void;
  onAdminLogout: () => void;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onEditProduct: (product: Product) => void;
  onToggleProductStatus: (id: string | number) => void;
  onDeleteProduct: (id: string | number) => void;
  onUpdateClaimStatus: (id: string | number, status: ClaimStatus, rejectionReason?: string) => void;
  onViewProof: (claim: Claim, type: 'order' | 'payment' | 'rating') => void;
  onResetData: () => void;
  onNotify: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  onOpenCustomerApp: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({
  products,
  claims,
  currentUser,
  onAdminLogin,
  onAdminLogout,
  onAddProduct,
  onEditProduct,
  onToggleProductStatus,
  onDeleteProduct,
  onUpdateClaimStatus,
  onViewProof,
  onResetData,
  onNotify,
  onOpenCustomerApp
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  // Calculate live stats for quick header badge
  const pendingClaimsCount = claims.filter((c) => c.status === 'Pending').length;
  const approvedClaimsCount = claims.filter((c) => c.status === 'Approved').length;
  const activeProductsCount = products.filter((p) => p.isActive).length;

  const isAdminAuthenticated = currentUser?.type === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 🛡️ DEDICATED ADMIN APP TOPBAR */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-indigo-500/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Admin Brand */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
                  <ShieldCheck className="w-6 h-6 text-slate-950" />
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  title={isOnline ? 'System Online' : 'Offline Mode'}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                    <span>WMS Admin Pro</span>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      App
                    </span>
                  </h1>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <span>Owner Console</span>
                  <span>•</span>
                  <span className="text-amber-300 font-bold">Manishankar Mandal</span>
                </p>
              </div>
            </div>

            {/* Live Stats Pills (Visible on Tablet & Desktop) */}
            {isAdminAuthenticated && (
              <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold px-2 py-0.5 rounded-lg bg-amber-400/10">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending: {pendingClaimsCount}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded-lg bg-emerald-400/10">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approved: {approvedClaimsCount}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold px-2 py-0.5 rounded-lg bg-indigo-400/10">
                  <Package className="w-3.5 h-3.5" />
                  <span>Offers: {activeProductsCount}</span>
                </div>
              </div>
            )}

            {/* Right Action Controls */}
            <div className="flex items-center gap-2">
              {/* Install Admin App Button */}
              {!isInstalled && isInstallable && (
                <button
                  onClick={install}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                  title="Install Admin App on Home Screen"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install Admin App</span>
                </button>
              )}

              {/* Direct Link to Customer App */}
              <button
                onClick={onOpenCustomerApp}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/30 font-bold text-xs transition cursor-pointer"
                title="Switch to Customer App"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open Customer App</span>
                <span className="sm:hidden">Customer App</span>
              </button>

              {/* Logout Button */}
              {isAdminAuthenticated && (
                <button
                  onClick={onAdminLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition cursor-pointer"
                  title="Logout from Admin App"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 🚀 ADMIN APP MAIN BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {isAdminAuthenticated ? (
          <AdminDashboard
            products={products}
            claims={claims}
            onAddProduct={onAddProduct}
            onEditProduct={onEditProduct}
            onToggleProductStatus={onToggleProductStatus}
            onDeleteProduct={onDeleteProduct}
            onUpdateClaimStatus={onUpdateClaimStatus}
            onViewProof={onViewProof}
            onResetData={onResetData}
            onLogout={onAdminLogout}
            onNotify={onNotify}
            onSwitchToCustomerPortal={onOpenCustomerApp}
          />
        ) : (
          <div className="py-6 sm:py-12">
            <AdminLogin
              onLogin={onAdminLogin}
              onSwitchToCustomer={onOpenCustomerApp}
            />
          </div>
        )}
      </main>

      {/* 🛡️ DEDICATED ADMIN FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">
              A
            </div>
            <span className="font-bold text-white">WMS Admin Pro App</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">
              Owner Console: Manishankar Mandal
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Direct Admin URL:</span>
            <code className="text-[11px] font-mono text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              /#admin
            </code>
          </div>
        </div>
      </footer>
    </div>
  );
};
