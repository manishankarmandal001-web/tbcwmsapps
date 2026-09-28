import React, { useState } from 'react';
import { User, Product, Claim, MerchantPlatform } from '../types';
import {
  ShoppingBag,
  ExternalLink,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  AlertTriangle,
  FileCheck,
  CreditCard,
  Image as ImageIcon,
  Check,
  X,
  History,
  ShieldAlert,
  ArrowUpRight,
  UserCheck,
  UserPlus,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  LogOut,
  Search
} from 'lucide-react';

interface CustomerPortalProps {
  currentUser: User | null;
  products: Product[];
  claims: Claim[];
  onSubmitClaim: (claimData: Omit<Claim, 'id' | 'submittedAt' | 'status'>) => void;
  onViewProof: (claim: Claim, type: 'order' | 'payment' | 'rating') => void;
  onLogin: (user: User) => void;
  onLogout?: () => void;
  externalActiveTab?: 'offers' | 'my-claims';
  onExternalActiveTabChange?: (tab: 'offers' | 'my-claims') => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  currentUser,
  products,
  claims,
  onSubmitClaim,
  onViewProof,
  onLogin,
  onLogout,
  externalActiveTab,
  onExternalActiveTabChange
}) => {
  const [activeTabState, setActiveTabState] = useState<'offers' | 'my-claims'>('offers');
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : activeTabState;
  const setActiveTab = (tab: 'offers' | 'my-claims') => {
    setActiveTabState(tab);
    if (onExternalActiveTabChange) onExternalActiveTabChange(tab);
  };
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Auth modal states (shown when guest clicks to order / submit claim)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [pendingProductForClaim, setPendingProductForClaim] = useState<Product | null>(null);

  // Auth form fields
  const [authName, setAuthName] = useState('');
  const [authMobile, setAuthMobile] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Claim modal form states
  const [enteredCode, setEnteredCode] = useState('');
  const [orderImg, setOrderImg] = useState<string | null>(null);
  const [paymentImg, setPaymentImg] = useState<string | null>(null);
  const [ratingImg, setRatingImg] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [formError, setFormError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filter user's claims safely
  const userClaims = currentUser
    ? claims.filter((c) => c.customerMobile === currentUser.mobile)
    : [];

  const totalApprovedEarnings = userClaims
    .filter((c) => c.status === 'Approved')
    .reduce((sum, c) => sum + (c.cashbackAmount || 150), 0);

  // Dynamically extract all unique platforms from the actual product catalog
  const availablePlatforms = Array.from(
    new Set(['All', ...products.map((p) => p.platform).filter(Boolean)])
  );

  // Display ALL products listed by admin (with optional platform filter & search)
  const filteredProducts = products.filter((p) => {
    // If a platform filter is selected, match case-insensitively
    if (platformFilter !== 'All' && p.platform?.toLowerCase() !== platformFilter.toLowerCase()) {
      return false;
    }
    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchCode = p.code?.toLowerCase().includes(q);
      const matchPlatform = p.platform?.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchPlatform) return false;
    }
    return true;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenClaimModal = (product: Product) => {
    // If not logged in, prompt login/signup first as requested!
    if (!currentUser) {
      setPendingProductForClaim(product);
      setAuthError('');
      setShowAuthModal(true);
      return;
    }

    // Strict rule: Customers cannot order or claim the same product twice
    const alreadyClaimed = claims.some(
      (c) =>
        c.customerMobile === currentUser.mobile &&
        (c.productId === product.id ||
          c.productTitle.trim().toLowerCase() === product.title.trim().toLowerCase() ||
          c.specialCode.trim().toUpperCase() === product.code.trim().toUpperCase())
    );

    if (alreadyClaimed) {
      alert(
        'Duplicate Order Blocked: You have already submitted an order for this product link. A customer cannot order the same product a second time.'
      );
      return;
    }

    setSelectedProduct(product);
    setEnteredCode('');
    setOrderImg(null);
    setPaymentImg(null);
    setRatingImg(null);
    setUpiId('');
    setFormError('');
  };

  const handleCloseClaimModal = () => {
    setSelectedProduct(null);
    setFormError('');
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanMobile = authMobile.trim().replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (authMode === 'signup') {
      if (!authName.trim()) {
        setAuthError('Please enter your full name.');
        return;
      }

      if (!authEmail.includes('@') || !authEmail.includes('.')) {
        setAuthError('Please enter a valid email address.');
        return;
      }

      if (authPassword.length < 4) {
        setAuthError('Password must be at least 4 characters.');
        return;
      }

      if (authPassword !== authConfirmPassword) {
        setAuthError('Passwords do not match.');
        return;
      }

      // Check if user has already ordered this product
      if (pendingProductForClaim) {
        const alreadyClaimed = claims.some(
          (c) =>
            c.customerMobile === cleanMobile &&
            (c.productId === pendingProductForClaim.id ||
              c.productTitle.trim().toLowerCase() === pendingProductForClaim.title.trim().toLowerCase() ||
              c.specialCode.trim().toUpperCase() === pendingProductForClaim.code.trim().toUpperCase())
        );

        if (alreadyClaimed) {
          setAuthError(
            'Duplicate Order Blocked: You have already ordered this product link previously. A customer cannot order the same product twice.'
          );
          return;
        }
      }

      const loggedUser: User = {
        name: authName.trim(),
        mobile: cleanMobile,
        email: authEmail.trim().toLowerCase(),
        type: 'customer'
      };

      onLogin(loggedUser);
      setShowAuthModal(false);

      // Instantly open the claim modal for the product they wanted!
      if (pendingProductForClaim) {
        setSelectedProduct(pendingProductForClaim);
        setPendingProductForClaim(null);
        setEnteredCode('');
        setOrderImg(null);
        setPaymentImg(null);
        setRatingImg(null);
        setUpiId('');
        setFormError('');
      }
    } else {
      // Login
      if (!authName.trim()) {
        setAuthError('Please enter your name or mobile number.');
        return;
      }

      if (!authPassword) {
        setAuthError('Please enter your password.');
        return;
      }

      // Check if user has already ordered this product
      if (pendingProductForClaim) {
        const alreadyClaimed = claims.some(
          (c) =>
            c.customerMobile === cleanMobile &&
            (c.productId === pendingProductForClaim.id ||
              c.productTitle.trim().toLowerCase() === pendingProductForClaim.title.trim().toLowerCase() ||
              c.specialCode.trim().toUpperCase() === pendingProductForClaim.code.trim().toUpperCase())
        );

        if (alreadyClaimed) {
          setAuthError(
            'Duplicate Order Blocked: You have already placed an order claim for this product link previously. A customer cannot order the same product twice.'
          );
          return;
        }
      }

      const loggedUser: User = {
        name: authName.trim(),
        mobile: cleanMobile,
        email: authEmail.trim().toLowerCase() || `${cleanMobile}@customer.wms`,
        type: 'customer'
      };

      onLogin(loggedUser);
      setShowAuthModal(false);

      // Instantly open the claim modal for the product they wanted!
      if (pendingProductForClaim) {
        setSelectedProduct(pendingProductForClaim);
        setPendingProductForClaim(null);
        setEnteredCode('');
        setOrderImg(null);
        setPaymentImg(null);
        setRatingImg(null);
        setUpiId('');
        setFormError('');
      }
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setFormError('Image size exceeds 8MB. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setter(reader.result as string);
        setFormError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedProduct) return;

    const trimmedCode = enteredCode.trim().toUpperCase();
    if (trimmedCode !== selectedProduct.code.trim().toUpperCase()) {
      setFormError(
        `Code Mismatch! Entered code (${trimmedCode}) does not match the product code (${selectedProduct.code}).`
      );
      return;
    }

    if (!orderImg || !paymentImg || !ratingImg) {
      setFormError('Please attach all 3 screenshot proof images (Order, Payment, and Rating).');
      return;
    }

    if (!upiId.trim() || !upiId.includes('@')) {
      setFormError('Please enter a valid UPI ID (e.g. mobile@upi, username@okaxis).');
      return;
    }

    const customerMobile = currentUser?.mobile || authMobile.trim();
    const alreadyClaimed = claims.some(
      (c) =>
        c.customerMobile === customerMobile &&
        (c.productId === selectedProduct.id ||
          c.productTitle.trim().toLowerCase() === selectedProduct.title.trim().toLowerCase() ||
          c.specialCode.trim().toUpperCase() === selectedProduct.code.trim().toUpperCase())
    );

    if (alreadyClaimed) {
      setFormError(
        'Duplicate Order Error: You have already submitted a claim for this product link. A customer cannot order or claim the same product twice.'
      );
      return;
    }

    onSubmitClaim({
      productId: selectedProduct.id,
      productTitle: selectedProduct.title,
      platform: selectedProduct.platform,
      systemCode: selectedProduct.code,
      specialCode: trimmedCode,
      customerName: currentUser?.name || authName.trim() || 'Customer',
      customerMobile: currentUser?.mobile || authMobile.trim() || '9876543210',
      customerEmail: currentUser?.email || authEmail.trim() || 'customer@wms.com',
      orderImgData: orderImg,
      paymentImgData: paymentImg,
      ratingImgData: ratingImg,
      upiId: upiId.trim(),
      cashbackAmount: selectedProduct.cashbackAmount || 150
    });

    handleCloseClaimModal();
  };

  const platformBadgeStyle = (platform: string) => {
    switch (platform) {
      case 'Amazon':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Flipkart':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Blinkit':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default:
        return 'bg-purple-100 text-purple-900 border-purple-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Logged in Customer Status Bar (only shown when customer is logged in) */}
      {currentUser && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-5 sm:p-6 rounded-3xl shadow-md flex flex-wrap justify-between items-center gap-4 relative overflow-hidden">
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl text-indigo-200 border border-white/20 shadow-inner">
              <span>{currentUser.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white">{currentUser.name}</h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] px-2 py-0.5 rounded-full font-semibold">
                  ● Active Customer
                </span>
              </div>
              <p className="text-xs text-indigo-200 flex flex-wrap items-center gap-2 mt-0.5 font-medium">
                <span>📱 {currentUser.mobile}</span>
                <span>•</span>
                <span>✉ {currentUser.email}</span>
              </p>
            </div>
          </div>

          {/* User stats summary & Logout */}
          <div className="flex items-center gap-3 z-10 flex-wrap">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-center">
              <span className="text-[10px] text-indigo-200 uppercase tracking-wider block font-bold">
                Claims
              </span>
              <span className="text-base font-black text-white">{userClaims.length}</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-center">
              <span className="text-[10px] text-indigo-200 uppercase tracking-wider block font-bold">
                Cashback Earned
              </span>
              <span className="text-base font-black text-emerald-400">₹{totalApprovedEarnings}</span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3.5 py-2 bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-200 rounded-xl text-xs font-semibold border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex gap-2 bg-slate-200/70 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'offers'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cashback Offer Products</span>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {filteredProducts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('my-claims')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'my-claims'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>My Submitted Claims</span>
            {currentUser && (
              <span className="bg-slate-200 text-slate-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {userClaims.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'offers' && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, codes..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dynamic Platform Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 mr-1">Platform:</span>
              {availablePlatforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    platformFilter.toLowerCase() === p.toLowerCase()
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tab 1: Offers Grid (Shown First to All Customers!) */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <p>
              Select any product, buy directly from the store link, then click <strong>"Submit Order Claim"</strong> to claim your cashback refund.
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-700">No Offer Products Listed Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Products will appear here once added by the administrator with special verification codes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => {
                const existingClaim = currentUser
                  ? claims.find(
                      (c) => c.customerMobile === currentUser.mobile && c.productId === prod.id
                    )
                  : null;

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image & Platform Badge */}
                      <div className="relative h-52 bg-slate-100 overflow-hidden">
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
                          }}
                        />
                        <span
                          className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-xl border shadow-sm ${platformBadgeStyle(
                            prod.platform
                          )}`}
                        >
                          {prod.platform}
                        </span>

                        {prod.cashbackAmount && (
                          <span className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-emerald-400 border border-slate-700 text-xs font-black px-2.5 py-1 rounded-xl">
                            ₹{prod.cashbackAmount} Cashback
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-5">
                        <h4 className="font-bold text-slate-900 text-base leading-snug">
                          {prod.title}
                        </h4>
                        {prod.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {prod.description}
                          </p>
                        )}

                        {/* Special Code Box */}
                        <div className="mt-3 p-2.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                              Special Code (Required)
                            </span>
                            <span className="font-mono font-bold text-sm text-indigo-900 tracking-wider">
                              {prod.code}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopyCode(prod.code)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-lg transition cursor-pointer"
                            title="Copy Code"
                          >
                            {copiedCode === prod.code ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-5 pt-0 space-y-2.5">
                      <a
                        href={prod.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <span>Buy on {prod.platform}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {prod.isActive === false ? (
                        <div className="bg-slate-100 border border-slate-300 rounded-xl p-3 text-center">
                          <span className="text-xs font-bold text-slate-500">Offer Paused / Inactive</span>
                        </div>
                      ) : existingClaim ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {existingClaim.status === 'Approved' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : existingClaim.status === 'Rejected' ? (
                              <XCircle className="w-4 h-4 text-rose-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-600" />
                            )}
                            <span className="text-xs font-bold text-slate-700">Already Claimed</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Status:{' '}
                            <strong
                              className={
                                existingClaim.status === 'Approved'
                                  ? 'text-emerald-600 font-bold'
                                  : existingClaim.status === 'Rejected'
                                  ? 'text-rose-600 font-bold'
                                  : 'text-amber-600 font-bold'
                              }
                            >
                              {existingClaim.status}
                            </strong>
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenClaimModal(prod)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-indigo-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>Submit Order Claim</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Customer Submitted Claims Tracking */}
      {activeTab === 'my-claims' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Your Submitted Claims Tracker</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUser
                  ? `Track the status of your cashback claims submitted from your mobile (${currentUser.mobile})`
                  : 'Log in to track the status of your cashback claims and refund payouts'}
              </p>
            </div>

            {!currentUser ? (
              <div className="text-center py-16 px-4">
                <ShieldAlert className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">Login Required to View Claims</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Please log in or sign up with your mobile number to view all claims submitted by you.
                </p>
                <button
                  onClick={() => {
                    setPendingProductForClaim(null);
                    setAuthError('');
                    setShowAuthModal(true);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer inline-flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Login / Sign Up</span>
                </button>
              </div>
            ) : userClaims.length === 0 ? (
              <div className="text-center py-16 px-4">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700">No claims submitted yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Purchase any product from our offer list, enter the Special Code, and upload
                  proofs to claim cashback.
                </p>
                <button
                  onClick={() => setActiveTab('offers')}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Browse Offer Products
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                      <th className="p-4">Claim ID & Date</th>
                      <th className="p-4">Product</th>
                      <th className="p-4">Special Code</th>
                      <th className="p-4">Your Proofs</th>
                      <th className="p-4">Refund UPI</th>
                      <th className="p-4">Status & Cashback</th>
                      <th className="p-4">Admin Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-slate-50 transition">
                        <td className="p-4">
                          <span className="font-mono font-bold text-indigo-700">#{claim.id}</span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            {claim.submittedAt}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-900 max-w-xs">
                          {claim.productTitle}
                          <span className="block text-[11px] text-slate-400 font-normal">
                            Store: {claim.platform}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-700">
                          {claim.specialCode}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onViewProof(claim, 'order')}
                              className="w-8 h-8 rounded-lg overflow-hidden border border-slate-300 hover:scale-110 transition shadow-sm cursor-pointer"
                              title="Inspect Order Screenshot"
                            >
                              <img
                                src={claim.orderImgData}
                                alt="Order Proof"
                                className="w-full h-full object-cover"
                              />
                            </button>
                            <button
                              onClick={() => onViewProof(claim, 'payment')}
                              className="w-8 h-8 rounded-lg overflow-hidden border border-slate-300 hover:scale-110 transition shadow-sm cursor-pointer"
                              title="Inspect Payment Receipt"
                            >
                              <img
                                src={claim.paymentImgData}
                                alt="Payment Proof"
                                className="w-full h-full object-cover"
                              />
                            </button>
                            <button
                              onClick={() => onViewProof(claim, 'rating')}
                              className="w-8 h-8 rounded-lg overflow-hidden border border-slate-300 hover:scale-110 transition shadow-sm cursor-pointer"
                              title="Inspect Rating Review Proof"
                            >
                              <img
                                src={claim.ratingImgData}
                                alt="Rating Proof"
                                className="w-full h-full object-cover"
                              />
                            </button>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-slate-600 font-semibold">
                          {claim.upiId}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 w-fit ${
                                claim.status === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : claim.status === 'Rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {claim.status === 'Approved' && (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              {claim.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                              {claim.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                              {claim.status}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">
                              ₹{claim.cashbackAmount || 150} Cashback
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500 max-w-xs text-xs">
                          {claim.adminNote || 'Under verification queue.'}
                          {claim.processedAt && (
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              Processed: {claim.processedAt}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔐 Customer Login / Sign Up Modal (Shown when customer clicks to order/claim) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 transform transition-all">
            {/* Modal Top Bar */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base">
                  {authMode === 'login' ? 'Customer Login' : 'Create Customer Account'}
                </h3>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Product Context Banner */}
              {pendingProductForClaim && (
                <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-3.5 mb-5 flex items-center gap-3">
                  <img
                    src={pendingProductForClaim.image}
                    alt={pendingProductForClaim.title}
                    className="w-12 h-12 rounded-xl object-cover border border-indigo-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                      Claiming Cashback For:
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {pendingProductForClaim.title}
                    </h4>
                    <span className="text-xs font-black text-emerald-600">
                      ₹{pendingProductForClaim.cashbackAmount} Cashback on {pendingProductForClaim.platform}
                    </span>
                  </div>
                </div>
              )}

              {/* Login / Sign Up Toggle Tabs */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Log In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {authError}
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-indigo-600" /> Full Name *
                  </label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-600" /> 10-Digit Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={authMobile}
                    onChange={(e) => setAuthMobile(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    required
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-600" /> Email Address *
                    </label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" /> Password *
                  </label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-600" /> Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {authMode === 'login' ? (
                    <>
                      <span>Log In & Continue Claim</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account & Continue Claim</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Claim Submission Modal (Appears directly after authentication or for logged in customers) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 transform transition-all">
            {/* Modal Header */}
            <div className="bg-indigo-600 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base sm:text-lg">
                  Upload Order & Screenshot Proofs
                </h3>
                <p className="text-xs text-indigo-100 mt-0.5">
                  {selectedProduct.title} ({selectedProduct.platform})
                </p>
              </div>
              <button
                onClick={handleCloseClaimModal}
                className="text-indigo-200 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form
              onSubmit={handleFormSubmit}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              {/* Guidelines Alert */}
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-2xl text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Submission Guidelines:
                </p>
                <p>
                  1. Input the exact <strong>Special Product Code</strong> (
                  <span className="font-mono font-bold">{selectedProduct.code}</span>) displayed on
                  the card.
                </p>
                <p>2. Upload direct image screenshot files from your phone or PC.</p>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {formError}
                </div>
              )}

              {/* Special Code Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Special Product Verification Code *
                  </label>
                  <button
                    type="button"
                    onClick={() => setEnteredCode(selectedProduct.code)}
                    className="text-[11px] text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Auto-Fill ({selectedProduct.code})
                  </button>
                </div>
                <input
                  type="text"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                  required
                  placeholder={`e.g. ${selectedProduct.code}`}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono font-bold text-indigo-700"
                />
              </div>

              {/* 3 Screenshot File Uploads */}
              <div className="space-y-4 pt-1">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b pb-1">
                  Upload Image Screenshot Files
                </p>

                {/* 1. Order Screenshot */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>1. Order Screenshot File *</span>
                    {orderImg && <span className="text-emerald-600 font-bold text-[11px]">✓ Attached</span>}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setOrderImg)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {orderImg && (
                    <div className="mt-2.5 flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                      <img
                        src={orderImg}
                        alt="Order Preview"
                        className="w-14 h-14 object-cover rounded-lg border"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-emerald-600 block">
                          ✓ Order Screenshot Attached
                        </span>
                        <span className="text-[10px] text-slate-400">Ready for review</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOrderImg(null)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Payment Screenshot */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>2. Payment Confirmation Screenshot File *</span>
                    {paymentImg && (
                      <span className="text-emerald-600 font-bold text-[11px]">✓ Attached</span>
                    )}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setPaymentImg)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {paymentImg && (
                    <div className="mt-2.5 flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                      <img
                        src={paymentImg}
                        alt="Payment Preview"
                        className="w-14 h-14 object-cover rounded-lg border"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-emerald-600 block">
                          ✓ Payment Screenshot Attached
                        </span>
                        <span className="text-[10px] text-slate-400">Ready for review</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaymentImg(null)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Rating Screenshot */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>3. After Delivery Rating Screenshot File *</span>
                    {ratingImg && (
                      <span className="text-emerald-600 font-bold text-[11px]">✓ Attached</span>
                    )}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setRatingImg)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {ratingImg && (
                    <div className="mt-2.5 flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                      <img
                        src={ratingImg}
                        alt="Rating Preview"
                        className="w-14 h-14 object-cover rounded-lg border"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-emerald-600 block">
                          ✓ Rating Review Attached
                        </span>
                        <span className="text-[10px] text-slate-400">Ready for review</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRatingImg(null)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* UPI ID Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Refund Payment UPI ID *
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required
                  placeholder="e.g. mobile@upi or name@okaxis"
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold font-mono"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCloseClaimModal}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Claim Proofs</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
