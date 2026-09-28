import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Claim } from '../types';

interface LightboxModalProps {
  claim: Claim | null;
  initialType?: 'order' | 'payment' | 'rating';
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ claim, initialType = 'order', onClose }) => {
  const [activeTab, setActiveTab] = useState<'order' | 'payment' | 'rating'>(initialType);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!claim) return null;

  const currentImage =
    activeTab === 'order'
      ? claim.orderImgData
      : activeTab === 'payment'
      ? claim.paymentImgData
      : claim.ratingImgData;

  const labels = {
    order: '1. Order Screenshot Proof',
    payment: '2. Payment Receipt Proof',
    rating: '3. Delivery Rating & Review'
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const isCodeMatched = claim.specialCode.trim().toUpperCase() === claim.systemCode.trim().toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Claim #{claim.id}
              </span>
              <h3 className="font-bold text-base text-white">{claim.customerName} - Proof Verification</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Product: <span className="text-slate-200 font-semibold">{claim.productTitle}</span> ({claim.platform}) • UPI: <span className="text-emerald-400 font-mono font-semibold">{claim.upiId}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Alert Bar */}
        <div className="px-5 py-2.5 bg-slate-800/80 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Code Verification:</span>
            {isCodeMatched ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Code Matches System: <span className="font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">{claim.specialCode}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" /> MISMATCH: Input <span className="font-mono bg-rose-950/80 px-2 py-0.5 rounded border border-rose-700/50">{claim.specialCode}</span> vs Expected <span className="font-mono bg-slate-700 px-2 py-0.5 rounded">{claim.systemCode}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotate}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
              title="Rotate 90deg"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="px-2 py-1 text-[11px] rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2">
          {(['order', 'payment', 'rating'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                handleReset();
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition text-center ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {labels[tab]}
            </button>
          ))}
        </div>

        {/* Image Display Area */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-auto min-h-[360px] relative select-none">
          {currentImage ? (
            <div
              className="transition-transform duration-200 origin-center flex items-center justify-center"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`
              }}
            >
              <img
                src={currentImage}
                alt={labels[activeTab]}
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800 pointer-events-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x800/1e293b/ffffff?text=Proof+Image+Preview';
                }}
              />
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12">
              <p className="text-sm font-semibold">No screenshot available for this slot</p>
            </div>
          )}
        </div>

        {/* Footer controls & open in new tab */}
        <div className="bg-slate-900 border-t border-slate-800 px-5 py-3 flex items-center justify-between text-xs text-slate-400">
          <span>Click tabs above to inspect all 3 customer submitted proofs.</span>
          {currentImage && currentImage.startsWith('data:') === false && (
            <a
              href={currentImage}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Open Original <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
