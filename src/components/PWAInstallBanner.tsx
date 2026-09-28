import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <>
      {/* Top Floating App Install Banner for Mobile Web Users */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 text-white px-3 py-2 text-xs shadow-md flex items-center justify-between gap-2 border-b border-indigo-500/30 sticky top-0 z-40">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white/20 p-1 flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div className="truncate">
            <div className="font-bold flex items-center gap-1.5 leading-tight">
              <span>Install CashbackPro App</span>
              <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">Fast</span>
            </div>
            <p className="text-[11px] text-indigo-100/90 truncate leading-tight">
              Run like a native app on Android, iOS & PC
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isInstallable ? (
            <button
              onClick={install}
              className="bg-white text-indigo-700 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-indigo-50 transition shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          ) : isIOS ? (
            <button
              onClick={() => setShowIOSModal(true)}
              className="bg-white text-indigo-700 font-bold px-2.5 py-1.5 rounded-lg text-xs hover:bg-indigo-50 transition shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Share2 className="w-3 h-3" />
              <span>Add to Home</span>
            </button>
          ) : (
            <button
              onClick={install}
              className="bg-white text-indigo-700 font-bold px-2.5 py-1.5 rounded-lg text-xs hover:bg-indigo-50 transition shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get App</span>
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Install on iPhone / iPad</h3>
                  <p className="text-[11px] text-slate-500">Run as full-screen native mobile app</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold">1</div>
                <div>
                  <span className="font-semibold text-slate-800">Safari ব্রাউজারে Share বাটনে ট্যাপ করুন:</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    নিচের বারে <Share2 className="w-3 h-3 text-indigo-600" /> Share আইকন রয়েছে।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold">2</div>
                <div>
                  <span className="font-semibold text-slate-800">"Add to Home Screen" সিলেক্ট করুন:</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    মেনু স্ক্রল করে <PlusSquare className="w-3 h-3 text-indigo-600" /> নির্বাচন করুন।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold">3</div>
                <div>
                  <span className="font-semibold text-slate-800">উপরে 'Add' এ ক্লিক করুন:</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    আপনার মোবাইলের হোম স্ক্রিনে সরাসরি অ্যাপের আইকন চলে আসবে!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition"
            >
              বুঝেছি (Got It)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
