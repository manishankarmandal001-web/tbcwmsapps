import React, { useState, useEffect, useRef } from 'react';
import { User, Product, Claim, ClaimStatus, ToastNotification } from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CLAIMS,
  STORAGE_KEYS
} from './data/initialData';
import { CustomerApp } from './apps/CustomerApp';
import { AdminApp } from './apps/AdminApp';
import { LightboxModal } from './components/LightboxModal';
import { VercelDeployGuideModal } from './components/VercelDeployGuideModal';
import { Toast } from './components/Toast';
import { OfflineIndicator } from './components/OfflineIndicator';
import { fetchRemoteState, mutateRemoteState } from './api/dataClient';
import type { RemoteOperation } from './api/dataClient';

export default function App() {
  const [customerTab, setCustomerTab] = useState<'offers' | 'my-claims'>('offers');
  const [customerView, setCustomerView] = useState<'customer-portal' | 'customer-login'>('customer-portal');

  // Shared Persistent Products State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      // An empty array is a valid saved catalog state after the admin deletes
      // the last product. Do not fall back to the starter catalog in that case.
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Shared Persistent Claims State
  const [claims, setClaims] = useState<Claim[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLAIMS);
      return saved ? JSON.parse(saved) : INITIAL_CLAIMS;
    } catch {
      return INITIAL_CLAIMS;
    }
  });

  // Sync state in real time across different browser tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PRODUCTS) {
        try {
          // A null value means another tab cleared this key. Keep the
          // customer panel in sync instead of leaving its old catalog visible.
          if (e.newValue === null) {
            setProducts([]);
            return;
          }
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) setProducts(updated);
        } catch {}
      }
      if (e.key === STORAGE_KEYS.CLAIMS) {
        try {
          if (e.newValue === null) {
            setClaims([]);
            return;
          }
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) setClaims(updated);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Prefer the shared Vercel database when it is configured. If the API is
  // unavailable, the local state above remains a safe offline fallback.
  useEffect(() => {
    let cancelled = false;

    fetchRemoteState().then((remoteState) => {
      if (cancelled || !remoteState) return;
      setProducts(remoteState.products);
      setClaims(remoteState.claims);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Save products on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products to localStorage', e);
    }
  }, [products]);

  // Save claims on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));
    } catch (e) {
      console.error('Error saving claims to localStorage', e);
    }
  }, [claims]);

  // Current logged in user (customer or admin)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Save user session
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (e) {
      console.error('Error updating current user in localStorage', e);
    }
  }, [currentUser]);

  // Check if current route is dedicated to Admin App
  const checkIsAdminApp = () => {
    if (typeof window === 'undefined') return false;
    try {
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const isSession = sessionStorage.getItem('wms_admin_session') === 'true';
      return (
        search.includes('admin') ||
        hash.includes('admin') ||
        path.includes('/admin') ||
        isSession
      );
    } catch {
      return false;
    }
  };

  const [activeApp, setActiveApp] = useState<'customer' | 'admin'>(() => {
    return checkIsAdminApp() ? 'admin' : 'customer';
  });

  // Listen for direct URL navigation changes
  useEffect(() => {
    const handleUrlChange = () => {
      const isAdmin = checkIsAdminApp();
      setActiveApp(isAdmin ? 'admin' : 'customer');
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    // Keyboard shortcut for owner: Ctrl+Shift+A opens Admin App
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        switchToAdminApp();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const switchToAdminApp = () => {
    setActiveApp('admin');
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('wms_admin_session', 'true');
        const url = new URL(window.location.href);
        url.hash = 'admin';
        window.history.pushState({}, '', url.toString());
      } catch {}
    }
  };

  const switchToCustomerApp = () => {
    setActiveApp('customer');
    setCustomerView('customer-portal');
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('wms_admin_session');
        const url = new URL(window.location.href);
        url.searchParams.delete('admin');
        url.searchParams.delete('app');
        if (url.hash.includes('admin')) {
          url.hash = '';
        }
        window.history.pushState({}, '', url.toString());
      } catch {}
    }
  };

  // Toast System
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const remoteWarningShown = useRef(false);
  const addToast = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
  };
  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const syncRemoteOperation = (operation: RemoteOperation) => {
    void mutateRemoteState(operation).then((remoteState) => {
      if (remoteState) {
        remoteWarningShown.current = false;
        setProducts(remoteState.products);
        setClaims(remoteState.claims);
        return;
      }

      if (!remoteWarningShown.current) {
        remoteWarningShown.current = true;
        addToast(
          'Cloud Sync Not Connected',
          'This change is saved on this device. Add POSTGRES_URL in Vercel to sync all devices.',
          'error'
        );
      }
    });
  };

  // Modal inspection states
  const [inspectingClaim, setInspectingClaim] = useState<Claim | null>(null);
  const [inspectingType, setInspectingType] = useState<'order' | 'payment' | 'rating'>('order');
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);

  // Handlers for Authentication
  const handleCustomerLogin = (user: User) => {
    setCurrentUser(user);
    setCustomerView('customer-portal');
    addToast('Welcome!', `Logged in successfully as ${user.name}`);
  };

  const handleAdminLogin = (user: User) => {
    setCurrentUser(user);
    addToast('Admin Authenticated', `Welcome to Admin Console, ${user.name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    addToast('Signed Out', 'You have been safely signed out.', 'info');
  };

  // Product Operations
  const handleAddProduct = (newProdData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true
    };
    setProducts((prev) => [newProduct, ...prev]);
    syncRemoteOperation({ operation: 'add-product', product: newProduct });
    addToast('Product Added', `"${newProduct.title}" is now live in Customer App.`, 'success');
  };

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    syncRemoteOperation({ operation: 'update-product', product: updatedProduct });
    addToast('Product Updated', `"${updatedProduct.title}" has been updated.`, 'success');
  };

  const handleToggleProductStatus = (productId: string | number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const updated = !product.isActive;
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isActive: updated } : p))
    );
    syncRemoteOperation({ operation: 'toggle-product', productId });
    addToast(
      updated ? 'Deal Activated' : 'Deal Paused',
      `"${product.title}" is now ${updated ? 'active for customer claims' : 'paused'}.`,
      'info'
    );
  };

  const handleDeleteProduct = (productId: string | number) => {
    const prod = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    syncRemoteOperation({ operation: 'delete-product', productId });
    addToast('Product Deleted', `"${prod?.title || 'Item'}" removed from catalog.`, 'info');
  };

  // Claim Operations
  const handleSubmitClaim = (claimData: Omit<Claim, 'id' | 'submittedAt' | 'status'>) => {
    const newClaim: Claim = {
      ...claimData,
      id: Date.now(),
      submittedAt: new Date().toISOString(),
      status: 'Pending'
    };
    setClaims((prev) => [newClaim, ...prev]);
    syncRemoteOperation({ operation: 'add-claim', claim: newClaim });
    setCustomerTab('my-claims');
    addToast(
      'Claim Submitted!',
      'Your order screenshots & cashback claim have been sent for verification.',
      'success'
    );
  };

  const handleUpdateClaimStatus = (
    claimId: string | number,
    newStatus: ClaimStatus,
    adminNote?: string
  ) => {
    const existingClaim = claims.find((claim) => claim.id === claimId);
    if (!existingClaim) return;

    const updatedClaim = {
      ...existingClaim,
      status: newStatus,
      adminNote: adminNote || existingClaim.adminNote,
      processedAt: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };

    setClaims((prev) =>
      prev.map((claim) => (claim.id === claimId ? updatedClaim : claim))
    );
    syncRemoteOperation({
      operation: 'update-claim-status',
      claimId,
      status: newStatus,
      adminNote
    });

    if (newStatus === 'Approved') {
      addToast('Claim Approved', `Claim #${claimId} approved & cashback released.`, 'success');
    } else {
      addToast('Claim Rejected', `Claim #${claimId} was marked as rejected.`, 'error');
    }
  };

  const handleViewProof = (claim: Claim, type: 'order' | 'payment' | 'rating') => {
    setInspectingClaim(claim);
    setInspectingType(type);
  };

  const handleResetData = () => {
    if (window.confirm('Clear all products and submitted claims records?')) {
      setProducts([]);
      setClaims([]);
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.CLAIMS);
      syncRemoteOperation({ operation: 'reset' });
      addToast('Data Cleared', 'All products and claims records have been cleared.', 'info');
    }
  };

  return (
    <>
      {activeApp === 'admin' ? (
        /* 🛡️ STANDALONE DEDICATED ADMIN APP */
        <AdminApp
          products={products}
          claims={claims}
          currentUser={currentUser}
          onAdminLogin={handleAdminLogin}
          onAdminLogout={handleLogout}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onToggleProductStatus={handleToggleProductStatus}
          onDeleteProduct={handleDeleteProduct}
          onUpdateClaimStatus={handleUpdateClaimStatus}
          onViewProof={handleViewProof}
          onResetData={handleResetData}
          onNotify={addToast}
          onOpenCustomerApp={switchToCustomerApp}
        />
      ) : (
        /* 🛒 STANDALONE DEDICATED CUSTOMER APP */
        <CustomerApp
          products={products}
          claims={claims}
          currentUser={currentUser}
          currentView={customerView}
          onNavigate={(view) => setCustomerView(view)}
          customerTab={customerTab}
          onSetCustomerTab={setCustomerTab}
          onCustomerLogin={handleCustomerLogin}
          onCustomerLogout={handleLogout}
          onSubmitClaim={handleSubmitClaim}
          onViewProof={handleViewProof}
          onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
          onOpenQuickClaim={() => {
            setCustomerView('customer-portal');
            setCustomerTab('offers');
            addToast('Choose an Offer', 'Click "Claim Cashback" on any verified product below.', 'info');
          }}
        />
      )}

      {/* Proof Lightbox Modal */}
      <LightboxModal
        claim={inspectingClaim}
        initialType={inspectingType}
        onClose={() => setInspectingClaim(null)}
      />

      {/* Vercel Deploy Guide Modal */}
      <VercelDeployGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
        onCopyNotice={(msg) => addToast('Copied to Clipboard', msg, 'info')}
      />

      {/* Floating System Notifications */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Connectivity Status Pill */}
      <OfflineIndicator />
    </>
  );
}
