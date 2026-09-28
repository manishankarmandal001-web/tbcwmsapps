import React, { useState } from 'react';
import { Product, Claim, ClaimStatus, MerchantPlatform } from '../types';
import { AdminAnalyticsSummary } from './AdminAnalyticsSummary';
import { processImageFile } from '../utils/imageUtils';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  PlusCircle,
  ShieldCheck,
  Search,
  Filter,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Download,
  IndianRupee,
  Layers,
  Eye,
  FileSpreadsheet,
  FileText,
  CheckCheck,
  Package,
  Trash2,
  Power,
  ShoppingBag,
  ListFilter,
  Printer,
  LogOut,
  Edit3,
  Upload,
  Image as ImageIcon,
  KeyRound,
  Link2
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  claims: Claim[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onEditProduct?: (product: Product) => void;
  onToggleProductStatus: (productId: string | number) => void;
  onDeleteProduct: (productId: string | number) => void;
  onUpdateClaimStatus: (claimId: string | number, status: ClaimStatus, adminNote?: string) => void;
  onViewProof: (claim: Claim, type: 'order' | 'payment' | 'rating') => void;
  onResetData?: () => void;
  onLogout?: () => void;
  onNotify?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  onSwitchToCustomerPortal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  claims,
  onAddProduct,
  onEditProduct,
  onToggleProductStatus,
  onDeleteProduct,
  onUpdateClaimStatus,
  onViewProof,
  onResetData,
  onLogout,
  onNotify,
  onSwitchToCustomerPortal
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | ClaimStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedAdminLink, setCopiedAdminLink] = useState(false);

  // Dashboard section switcher (All / Products / Claims)
  const [activeSection, setActiveSection] = useState<'all' | 'products' | 'claims'>('all');

  // Product catalogue filters
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Reject modal state
  const [rejectingClaimId, setRejectingClaimId] = useState<string | number | null>(null);
  const [rejectReason, setRejectReason] = useState('Screenshot proof invalid or code mismatch.');

  // Add / Edit Product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState<MerchantPlatform>('Amazon');
  const [newImage, setNewImage] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCashback, setNewCashback] = useState('200');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');

  const adminDirectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?admin=true`
    : '?admin=true';

  const handleCopyAdminLink = () => {
    navigator.clipboard.writeText(adminDirectUrl);
    setCopiedAdminLink(true);
    if (onNotify) {
      onNotify('Admin Link Copied!', 'Direct secret admin link copied to clipboard.', 'success');
    }
    setTimeout(() => setCopiedAdminLink(false), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setNewTitle('');
    setNewPlatform('Amazon');
    setNewImage('');
    setNewLink('');
    setNewCode('');
    setNewCashback('200');
    setImageUploadError('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setNewTitle(prod.title);
    setNewPlatform(prod.platform);
    setNewImage(prod.image);
    setNewLink(prod.link);
    setNewCode(prod.code);
    setNewCashback(String(prod.cashbackAmount || 150));
    setImageUploadError('');
    setShowAddModal(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      setImageUploadError('');
      // Compresses to max 800px and converts to pristine Base64 Data URL
      const compressedDataUrl = await processImageFile(file, 800, 0.85);
      setNewImage(compressedDataUrl);
    } catch (err: any) {
      setImageUploadError(err.message || 'Failed to process image file. Please try another image.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleCopyUpi = (upi: string) => {
    navigator.clipboard.writeText(upi);
    setCopiedUpi(upi);
    setTimeout(() => setCopiedUpi(null), 2000);
  };

  const handleCopyProductCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateOrUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;

    const finalImage =
      newImage.trim() ||
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80';

    if (editingProduct && onEditProduct) {
      onEditProduct({
        ...editingProduct,
        title: newTitle.trim(),
        platform: newPlatform,
        image: finalImage,
        link: newLink.trim() || 'https://amazon.in',
        code: newCode.trim().toUpperCase(),
        cashbackAmount: Number(newCashback) || 150
      });
      if (onNotify) {
        onNotify('Product Updated', `Successfully updated "${newTitle.trim()}".`, 'success');
      }
    } else {
      onAddProduct({
        title: newTitle.trim(),
        platform: newPlatform,
        image: finalImage,
        link: newLink.trim() || 'https://amazon.in',
        code: newCode.trim().toUpperCase(),
        cashbackAmount: Number(newCashback) || 150,
        isActive: true
      });
      if (onNotify) {
        onNotify('Product Added', `Successfully added "${newTitle.trim()}".`, 'success');
      }
    }

    setShowAddModal(false);
    setEditingProduct(null);
  };

  // Filtered Products for Admin
  const activeProductsCount = products.filter((p) => p.isActive !== false).length;
  const inactiveProductsCount = products.filter((p) => p.isActive === false).length;

  const filteredProducts = products.filter((p) => {
    const matchesStatus =
      productStatusFilter === 'all' ||
      (productStatusFilter === 'active' && p.isActive !== false) ||
      (productStatusFilter === 'inactive' && p.isActive === false);
    const matchesSearch =
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.platform.toLowerCase().includes(productSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleConfirmReject = () => {
    if (rejectingClaimId) {
      onUpdateClaimStatus(rejectingClaimId, 'Rejected', rejectReason);
      setRejectingClaimId(null);
    }
  };

  // Filtered claims list
  const filteredClaims = claims.filter((c) => {
    const matchesFilter = activeFilter === 'ALL' || c.status === activeFilter;
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerMobile.includes(searchQuery) ||
      c.specialCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.upiId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Standard RFC-4180 CSV value escaping
  const escapeCSV = (value: string | number | undefined | null) => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Dedicated CSV export handler for auditing and record-keeping
  const exportClaimsToCSV = (dataset: Claim[], reportTitle: string = 'All_Claims') => {
    if (dataset.length === 0) {
      if (onNotify) {
        onNotify('No Records to Export', 'There are no claims in the selected filter to export.', 'error');
      }
      return;
    }

    const headers = [
      'Audit_ID',
      'Submission_Date',
      'Customer_Full_Name',
      'Mobile_Number',
      'Email_Address',
      'Product_Name',
      'Merchant_Platform',
      'Special_Verification_Code',
      'Required_System_Code',
      'Code_Match_Verified',
      'Order_Screenshot_Attached',
      'Payment_Screenshot_Attached',
      'Rating_Screenshot_Attached',
      'Customer_Refund_UPI_ID',
      'Cashback_Amount_INR',
      'Claim_Status',
      'Admin_Audit_Remarks',
      'Processed_Timestamp'
    ];

    const rows = dataset.map((c) => {
      const isMatched = c.specialCode.trim().toUpperCase() === c.systemCode.trim().toUpperCase();
      return [
        escapeCSV(c.id),
        escapeCSV(c.submittedAt),
        escapeCSV(c.customerName),
        escapeCSV(c.customerMobile),
        escapeCSV(c.customerEmail),
        escapeCSV(c.productTitle),
        escapeCSV(c.platform),
        escapeCSV(c.specialCode),
        escapeCSV(c.systemCode),
        escapeCSV(isMatched ? 'VERIFIED_MATCH' : 'MISMATCH_ALERT'),
        escapeCSV(c.orderImgData ? 'YES' : 'NO'),
        escapeCSV(c.paymentImgData ? 'YES' : 'NO'),
        escapeCSV(c.ratingImgData ? 'YES' : 'NO'),
        escapeCSV(c.upiId),
        escapeCSV(c.cashbackAmount || 150),
        escapeCSV(c.status),
        escapeCSV(c.adminNote || 'N/A'),
        escapeCSV(c.processedAt || 'Pending')
      ].join(',');
    });

    // Add UTF-8 BOM (\uFEFF) for Excel compatibility with Unicode characters
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10);
    const timeStamp = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const filename = `WMS_Cashback_Audit_Report_${reportTitle}_${dateStamp}_${timeStamp}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const totalDisbursed = dataset
      .filter((c) => c.status === 'Approved')
      .reduce((sum, c) => sum + (c.cashbackAmount || 150), 0);

    if (onNotify) {
      onNotify(
        'CSV Export Complete!',
        `Exported ${dataset.length} claim audit records (Total Approved: ₹${totalDisbursed}). File: ${filename}`
      );
    }
    setShowExportModal(false);
  };

  // Dedicated PDF export handler for official audit report
  const exportClaimsToPDF = (dataset: Claim[], reportTitle: string = 'All_Claims') => {
    if (dataset.length === 0) {
      if (onNotify) {
        onNotify('No Records to Export', 'There are no claims to export as PDF.', 'error');
      }
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups for this site to generate and print PDF reports.');
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const totalPayouts = dataset
      .filter((c) => c.status === 'Approved')
      .reduce((sum, c) => sum + (c.cashbackAmount || 150), 0);

    const approvedCount = dataset.filter((c) => c.status === 'Approved').length;
    const pendingCount = dataset.filter((c) => c.status === 'Pending').length;
    const rejectedCount = dataset.filter((c) => c.status === 'Rejected').length;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TBC WMS - Audit Report (${reportTitle})</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          * { box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; margin: 0; padding: 15px; font-size: 11px; line-height: 1.4; background: #ffffff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 14px; }
          .title { font-size: 18px; font-weight: 800; color: #1e1b4b; }
          .subtitle { font-size: 11px; color: #64748b; margin-top: 2px; }
          .meta { text-align: right; font-size: 10px; color: #475569; }
          .stats { display: flex; gap: 12px; margin-bottom: 14px; }
          .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; flex: 1; }
          .stat-label { font-size: 9px; text-transform: uppercase; font-weight: 700; color: #64748b; }
          .stat-val { font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; }
          th { background: #f1f5f9; text-align: left; padding: 7px 6px; font-size: 9px; text-transform: uppercase; font-weight: 700; color: #475569; border-bottom: 1px solid #cbd5e1; }
          td { padding: 7px 6px; border-bottom: 1px solid #f1f5f9; font-size: 10px; vertical-align: top; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 9px; }
          .badge-approved { background: #dcfce7; color: #166534; }
          .badge-pending { background: #fef3c7; color: #92400e; }
          .badge-rejected { background: #fee2e2; color: #991b1b; }
          .footer { margin-top: 20px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }
          @media print {
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 12px; background: #e0e7ff; padding: 8px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; color: #3730a3; font-size: 12px;">📄 PDF Export Preview Ready. Use "Print" to save as PDF.</span>
          <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px;">🖨️ Print / Save as PDF</button>
        </div>
        <div class="header">
          <div>
            <div class="title">TBC WMS - Official Audit Report</div>
            <div class="subtitle">Cashback Verification & Disbursement Audit Trail (${reportTitle.replace(/_/g, ' ')})</div>
          </div>
          <div class="meta">
            <div><strong>Generated:</strong> ${formattedDate}</div>
            <div><strong>Total Records:</strong> ${dataset.length} claims</div>
          </div>
        </div>

        <div class="stats">
          <div class="stat-box">
            <div class="stat-label">Total Claims</div>
            <div class="stat-val">${dataset.length}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Approved</div>
            <div class="stat-val" style="color: #16a34a;">${approvedCount}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Pending Review</div>
            <div class="stat-val" style="color: #d97706;">${pendingCount}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Rejected</div>
            <div class="stat-val" style="color: #dc2626;">${rejectedCount}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Total Disbursed</div>
            <div class="stat-val" style="color: #16a34a;">₹${totalPayouts.toLocaleString()}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Submitted</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Product / Store</th>
              <th>Entered Code</th>
              <th>UPI ID</th>
              <th>Cashback</th>
              <th>Status</th>
              <th>Admin Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${dataset.map((c) => `
              <tr>
                <td style="font-family: monospace; font-weight: bold;">#${c.id}</td>
                <td>${c.submittedAt}</td>
                <td style="font-weight: 600;">${c.customerName}</td>
                <td style="font-family: monospace;">${c.customerMobile}</td>
                <td>${c.productTitle} <span style="color:#64748b;">(${c.platform})</span></td>
                <td style="font-family: monospace; font-weight: bold;">${c.specialCode}</td>
                <td style="font-family: monospace;">${c.upiId}</td>
                <td style="font-weight: bold; color: #16a34a;">₹${c.cashbackAmount || 150}</td>
                <td><span class="badge badge-${c.status.toLowerCase()}">${c.status}</span></td>
                <td style="color: #64748b;">${c.adminNote || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <span>TBC WMS System-Generated Audit Document</span>
          <span>Confidential • Authorized Auditors & Admins Only</span>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    if (onNotify) {
      onNotify('Audit PDF Generated', `PDF preview opened for ${dataset.length} records. Save as PDF or print.`, 'success');
    }
    setShowExportModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Executive Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-wrap justify-between items-center gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2 flex-wrap">
                <span>Admin Executive Dashboard</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Owner: Manishankar Mandal
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personal Console • Verify Screenshots, Match Special Codes & Approve UPI Payouts
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {onSwitchToCustomerPortal && (
            <button
              onClick={onSwitchToCustomerPortal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950/40 transition flex items-center gap-1.5 cursor-pointer"
              title="Open Customer Portal View"
            >
              <Eye className="w-4 h-4" />
              <span>View Customer Portal</span>
            </button>
          )}

          {/* Prominent Export CSV / PDF for Auditing & Record-Keeping */}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/40 transition flex items-center gap-2 cursor-pointer group"
            title="Export Claims CSV & PDF Audit Reports"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform" />
            <span>Export Audit Report (CSV / PDF)</span>
            <span className="bg-emerald-800/80 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded-md font-mono">
              {claims.length}
            </span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-rose-600/90 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-950/30 transition flex items-center gap-1.5 cursor-pointer"
              title="Logout from Admin Console"
            >
              <LogOut className="w-4 h-4" />
              <span>Admin Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* 🔐 Admin Direct Secret Link Access Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-400 text-amber-950 font-black text-[10px] uppercase tracking-wider">
              Secret Link
            </span>
            <h4 className="font-bold text-sm text-white">Direct Admin Access URL</h4>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Customer Portal থেকে Admin অপশন সম্পূর্ণ হাইড করে দেওয়া হয়েছে। ভবিষ্যতে সরাসরি এডমিন প্যানেলে লগইন করার জন্য নিচের সিক্রেট লিঙ্কটি আপনি বুকমার্ক বা সেভ করে রাখুন:
          </p>
          <div className="font-mono text-xs text-amber-300 bg-black/50 px-3 py-1.5 rounded-lg border border-white/10 break-all select-all flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{adminDirectUrl}</span>
          </div>
        </div>

        <button
          onClick={handleCopyAdminLink}
          className="shrink-0 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          {copiedAdminLink ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Secret Admin Link</span>
            </>
          )}
        </button>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSection === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Overview & All</span>
          </button>

          <button
            onClick={() => setActiveSection('products')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSection === 'products'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Listed Offer Products ({products.length})</span>
            <span className="bg-emerald-500/20 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              {activeProductsCount} Active
            </span>
            {inactiveProductsCount > 0 && (
              <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                {inactiveProductsCount} Inactive
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('claims')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSection === 'claims'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Customer Claims Queue ({claims.length})</span>
            <span className="bg-amber-500/20 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              {claims.filter((c) => c.status === 'Pending').length} Pending
            </span>
          </button>
        </div>
      </div>

      {/* 📦 Listed Offer Products Management Section (jokhon admin a login korbo listed product guli show koraw) */}
      {(activeSection === 'all' || activeSection === 'products') && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-slate-50 to-white">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Package className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Listed Offer Products Catalogue
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click <strong>Active / Inactive</strong> button to toggle customer visibility for each product.
                  </p>
                </div>
              </div>
            </div>

            {/* Product Toolbar: Search, Status Filter, Add */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Product Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search title, code, platform..."
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-52 bg-white"
                />
                {productSearch && (
                  <button
                    onClick={() => setProductSearch('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status Filter (All / Active / Inactive) */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setProductStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    productStatusFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({products.length})
                </button>
                <button
                  onClick={() => setProductStatusFilter('active')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                    productStatusFilter === 'active'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active ({activeProductsCount})
                </button>
                <button
                  onClick={() => setProductStatusFilter('inactive')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                    productStatusFilter === 'inactive'
                      ? 'bg-slate-700 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Inactive ({inactiveProductsCount})
                </button>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Add Product</span>
              </button>
            </div>
          </div>

          {/* Product Items Table or Empty State */}
          {products.length === 0 ? (
            <div className="p-12 text-center bg-slate-50/50">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-base">No Offer Products Listed Yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Click "+ Add Offer Product" above to create Amazon, Flipkart or Blinkit cashback offers with special codes.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add Your First Offer Product</span>
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No products found matching "{productSearch}" under {productStatusFilter} status.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                    <th className="p-4">Product Details</th>
                    <th className="p-4">Platform</th>
                    <th className="p-4">Special Code</th>
                    <th className="p-4">Cashback</th>
                    <th className="p-4">Date Listed</th>
                    <th className="p-4 text-center">Status Toggle (Active / Inactive)</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredProducts.map((prod) => {
                    const isActive = prod.isActive !== false;
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                        {/* Product Info */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image}
                              alt={prod.title}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&q=80';
                              }}
                            />
                            <div>
                              <p className="font-bold text-slate-900 leading-snug line-clamp-1">
                                {prod.title}
                              </p>
                              <a
                                href={prod.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-0.5"
                              >
                                <span>Visit Store Page</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </td>

                        {/* Platform */}
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border inline-block ${
                              prod.platform === 'Amazon'
                                ? 'bg-amber-50 text-amber-900 border-amber-200'
                                : prod.platform === 'Flipkart'
                                ? 'bg-blue-50 text-blue-900 border-blue-200'
                                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            }`}
                          >
                            {prod.platform}
                          </span>
                        </td>

                        {/* Special Code */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-indigo-950 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-lg">
                              {prod.code}
                            </span>
                            <button
                              onClick={() => handleCopyProductCode(prod.code)}
                              className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                              title="Copy Code"
                            >
                              {copiedCode === prod.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Cashback */}
                        <td className="p-4">
                          <span className="font-black text-emerald-600 font-mono text-sm">
                            ₹{prod.cashbackAmount || 150}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="p-4 text-slate-500 font-mono text-[11px]">
                          {prod.createdAt}
                        </td>

                        {/* Active / Inactive Toggle Button */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => onToggleProductStatus(prod.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer shadow-2xs ${
                              isActive
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 ring-1 ring-emerald-200'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
                            }`}
                            title={isActive ? 'Click to set Inactive (hide from customers)' : 'Click to set Active (show to customers)'}
                          >
                            {isActive ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                <span>Inactive</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(prod)}
                              className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
                              title="Edit product details & image"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteProduct(prod.id)}
                              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                              title="Delete this product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Recharts Analytics Summary Section */}
      {(activeSection === 'all' || activeSection === 'claims') && (
        <AdminAnalyticsSummary claims={claims} />
      )}

      {/* Customer Claim Verification & Approval Panel Table */}
      {(activeSection === 'all' || activeSection === 'claims') && (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Filters & Search Header */}
        <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Customer Claim Verification & Approval Panel
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click screenshot thumbnails to inspect full image files before Approving or Rejecting
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, code..."
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-52 bg-white"
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

            {/* Status Filter Dropdown (Pending, Approved, Rejected) */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 shadow-2xs rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition">
              <Filter className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <label htmlFor="claims-status-filter" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider hidden sm:inline">
                Status:
              </label>
              <select
                id="claims-status-filter"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as 'ALL' | ClaimStatus)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
                aria-label="Filter claims by status"
              >
                <option value="ALL">All Statuses ({claims.length})</option>
                <option value="Pending">⏳ Pending Approvals ({claims.filter((c) => c.status === 'Pending').length})</option>
                <option value="Approved">✅ Approved Claims ({claims.filter((c) => c.status === 'Approved').length})</option>
                <option value="Rejected">❌ Rejected Claims ({claims.filter((c) => c.status === 'Rejected').length})</option>
              </select>
            </div>

            {/* Active Filter Clear Badge */}
            {activeFilter !== 'ALL' && (
              <button
                onClick={() => setActiveFilter('ALL')}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition flex items-center gap-1"
                title="Reset status filter to All"
              >
                <span>Filter: {activeFilter}</span>
                <span className="text-indigo-400 hover:text-indigo-700">✕</span>
              </button>
            )}

            {/* Filter Quick Pills */}
            <div className="hidden lg:flex gap-1 bg-slate-100 p-1 rounded-xl">
              {(['ALL', 'Pending', 'Approved', 'Rejected'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition ${
                    activeFilter === filter
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Table-level CSV Export Shortcut */}
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1.5 cursor-pointer"
              title="Export Claims CSV for Auditing"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <th className="p-4">Customer Details</th>
                <th className="p-4">Product & Platform</th>
                <th className="p-4">Special Code Match</th>
                <th className="p-4">Uploaded Image Proofs</th>
                <th className="p-4">Refund UPI</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-12 text-slate-400 font-semibold">
                    No claims found for selected filter / search.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((c) => {
                  const isCodeMatched =
                    c.specialCode.trim().toUpperCase() === c.systemCode.trim().toUpperCase();

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      {/* Customer Info */}
                      <td className="p-4">
                        <p className="font-bold text-slate-900 text-sm">{c.customerName}</p>
                        <p className="text-slate-600 font-mono text-[11px] mt-0.5">
                          📱 {c.customerMobile}
                        </p>
                        <p className="text-slate-400 text-[10px]">✉️ {c.customerEmail}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Submitted: {c.submittedAt}
                        </span>
                      </td>

                      {/* Product */}
                      <td className="p-4 max-w-xs">
                        <p className="font-bold text-slate-800 leading-snug">{c.productTitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border">
                            {c.platform}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700">
                            ₹{c.cashbackAmount || 150} Cashback
                          </span>
                        </div>
                      </td>

                      {/* Code Match */}
                      <td className="p-4">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isCodeMatched ? 'text-indigo-700' : 'text-rose-600'
                          }`}
                        >
                          {c.specialCode}
                        </span>
                        {isCodeMatched ? (
                          <span className="block text-[10px] text-emerald-600 font-bold mt-0.5">
                            ✓ System Matched
                          </span>
                        ) : (
                          <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                            <span>✕ Mismatch!</span>
                            <span className="block text-slate-400 font-normal">
                              Req: {c.systemCode}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 3 Uploaded Image Proofs (Clickable) */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {/* Order SS */}
                          <div
                            onClick={() => onViewProof(c, 'order')}
                            className="group relative cursor-pointer"
                            title="Inspect 1. Order Screenshot"
                          >
                            <img
                              src={c.orderImgData}
                              alt="Order Proof"
                              className="w-11 h-11 object-cover rounded-lg border border-slate-300 group-hover:scale-105 transition shadow-sm"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                              <Eye className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[9px] text-center block text-slate-400 font-medium mt-0.5">
                              Order
                            </span>
                          </div>

                          {/* Payment SS */}
                          <div
                            onClick={() => onViewProof(c, 'payment')}
                            className="group relative cursor-pointer"
                            title="Inspect 2. Payment Screenshot"
                          >
                            <img
                              src={c.paymentImgData}
                              alt="Payment Proof"
                              className="w-11 h-11 object-cover rounded-lg border border-slate-300 group-hover:scale-105 transition shadow-sm"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                              <Eye className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[9px] text-center block text-slate-400 font-medium mt-0.5">
                              Payment
                            </span>
                          </div>

                          {/* Rating SS */}
                          <div
                            onClick={() => onViewProof(c, 'rating')}
                            className="group relative cursor-pointer"
                            title="Inspect 3. Rating Review Screenshot"
                          >
                            <img
                              src={c.ratingImgData}
                              alt="Rating Proof"
                              className="w-11 h-11 object-cover rounded-lg border border-slate-300 group-hover:scale-105 transition shadow-sm"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                              <Eye className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[9px] text-center block text-slate-400 font-medium mt-0.5">
                              Rating
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] text-indigo-600 block mt-1 font-medium">
                          Click to zoom & inspect
                        </span>
                      </td>

                      {/* UPI ID */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 w-fit">
                          <span>{c.upiId}</span>
                          <button
                            onClick={() => handleCopyUpi(c.upiId)}
                            className="text-slate-400 hover:text-indigo-600"
                            title="Copy UPI"
                          >
                            {copiedUpi === c.upiId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold inline-block ${
                            c.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : c.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {c.status}
                        </span>
                        {c.adminNote && (
                          <span className="block text-[10px] text-slate-500 mt-1 max-w-[140px] truncate" title={c.adminNote}>
                            Note: {c.adminNote}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        {c.status === 'Pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onUpdateClaimStatus(c.id, 'Approved', 'Verified & approved.')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition cursor-pointer"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectingClaimId(c.id);
                                setRejectReason(
                                  !isCodeMatched
                                    ? 'Special verification code does not match.'
                                    : 'Screenshot proof blurry or incomplete.'
                                );
                              }}
                              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition cursor-pointer"
                            >
                              ✕ Reject
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-slate-400 text-xs font-medium">Processed</span>
                            <button
                              onClick={() =>
                                onUpdateClaimStatus(
                                  c.id,
                                  c.status === 'Approved' ? 'Rejected' : 'Approved',
                                  'Status modified by admin'
                                )
                              }
                              className="text-[11px] text-indigo-600 hover:underline"
                            >
                              (Change)
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Add / Edit Offer Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  {editingProduct ? (
                    <>
                      <Edit3 className="w-4 h-4 text-indigo-400" />
                      <span>Edit Cashback Offer Product</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 text-emerald-400" />
                      <span>Add New Cashback Offer Product</span>
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {editingProduct
                    ? 'Modify product photo, special code, store link or payout reward'
                    : 'Configure special code, upload photo and merchant store link'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="e.g. Ergonomic Bluetooth Keyboard"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Merchant Platform *
                  </label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as MerchantPlatform)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Amazon">Amazon</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="Blinkit">Blinkit</option>
                    <option value="Myntra">Myntra</option>
                    <option value="Other">Other Store</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cashback Reward (₹) *
                  </label>
                  <input
                    type="number"
                    value={newCashback}
                    onChange={(e) => setNewCashback(e.target.value)}
                    required
                    placeholder="250"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Special Verification Code (Customer MUST enter this) *
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. AMZ-KEY-88"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-indigo-700 uppercase outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 📸 Real Device Photo Upload with Instant Live Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Product Image *
                  </label>
                  {newImage && (
                    <button
                      type="button"
                      onClick={() => setNewImage('')}
                      className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {/* Instant Live Image Preview Box */}
                {newImage ? (
                  <div className="relative rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 p-3 mb-2 flex items-center gap-3">
                    <img
                      src={newImage}
                      alt="Uploaded Product Preview"
                      className="w-20 h-20 rounded-xl object-cover bg-white border border-indigo-200 shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Image Uploaded & Ready!</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {newImage.startsWith('data:')
                          ? 'Optimized device image (saved directly to catalog)'
                          : newImage}
                      </p>
                      <div className="mt-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs transition">
                          <Upload className="w-3 h-3 text-indigo-600" />
                          <span>Change Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-4 text-center transition bg-slate-50/50 mb-2">
                    <input
                      type="file"
                      id="product-photo-upload"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <label htmlFor="product-photo-upload" className="cursor-pointer block">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                        {isProcessingImage ? (
                          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {isProcessingImage ? 'Optimizing photo...' : 'Click to Upload Product Image from Device'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Choose photo from Phone Gallery, Camera or PC (JPG, PNG, WebP)
                      </p>
                    </label>
                  </div>
                )}

                {imageUploadError && (
                  <p className="text-xs text-rose-600 font-semibold mb-2">{imageUploadError}</p>
                )}

                {/* Optional Fallback Image URL Input */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">Or paste web link:</span>
                  <input
                    type="text"
                    value={newImage.startsWith('data:') ? '' : newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Store Product Link
                </label>
                <input
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="https://amazon.in/dp/..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingImage}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  {editingProduct ? 'Save Changes' : 'Create Offer Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Confirmation Modal */}
      {rejectingClaimId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Reject Claim #{rejectingClaimId}</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Please specify the reason for rejection. This feedback will be displayed to the
              customer.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-rose-500 mb-4"
              placeholder="e.g. Screenshot proof does not match order delivery receipt."
            />

            <div className="flex gap-2">
              <button
                onClick={() => setRejectingClaimId(null)}
                className="flex-1 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Export Audit Modal for Record-Keeping */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Export Audit CSV Records</h3>
                  <p className="text-xs text-slate-300">Compliance & financial record-keeping export</p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Excel & Google Sheets Compatible (UTF-8 BOM)</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Includes all 18 audit data points, code verification flags, UPI refund handles, and admin audit notes.
                  </p>
                </div>
              </div>

              {/* Option 1: Full Audit Trail */}
              <div className="p-4 rounded-2xl border-2 border-indigo-100 hover:border-indigo-400 bg-indigo-50/30 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                      1. Complete Audit Trail (All Claims)
                    </span>
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                      {claims.length} Records
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Exports the entire historical dataset (Pending, Approved, and Rejected) with complete audit details.
                  </p>
                </div>

                <div className="flex gap-2.5 mt-3.5 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => exportClaimsToCSV(claims, 'Full_Audit_Trail')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-md shadow-emerald-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Download CSV (.csv)</span>
                  </button>
                  <button
                    onClick={() => exportClaimsToPDF(claims, 'Full_Audit_Trail')}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-md shadow-indigo-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Download PDF (.pdf)</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Filtered Dataset */}
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      2. Filtered View Export ({activeFilter})
                    </span>
                    <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                      {filteredClaims.length} Records
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Exports only the currently filtered items (Filter: <strong>{activeFilter}</strong>
                    {searchQuery ? `, Search: "${searchQuery}"` : ''}).
                  </p>
                </div>

                <div className="flex gap-2.5 mt-3.5 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => exportClaimsToCSV(filteredClaims, `Filtered_${activeFilter}`)}
                    className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Download Filtered CSV</span>
                  </button>
                  <button
                    onClick={() => exportClaimsToPDF(filteredClaims, `Filtered_${activeFilter}`)}
                    className="flex-1 bg-indigo-900 hover:bg-indigo-950 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-indigo-300" />
                    <span>Download Filtered PDF</span>
                  </button>
                </div>
              </div>

              {/* Audit Fields Summary Checklist */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Audit Columns Included in Export:
                </span>
                <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-600 font-mono">
                  {[
                    'Audit_ID',
                    'Submission_Date',
                    'Customer_Full_Name',
                    'Mobile_Number',
                    'Email_Address',
                    'Product_Name',
                    'Merchant_Platform',
                    'Special_Code',
                    'System_Code',
                    'Code_Match_Verified',
                    'Proof_Screenshots',
                    'Customer_UPI_ID',
                    'Cashback_Amount',
                    'Claim_Status',
                    'Admin_Remarks'
                  ].map((field) => (
                    <span key={field} className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
