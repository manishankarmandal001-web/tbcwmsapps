import React from 'react';
import { X, CheckCircle, Terminal, Globe, CloudUpload, ArrowRight, Copy } from 'lucide-react';

interface VercelDeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyNotice?: (text: string) => void;
}

export const VercelDeployGuideModal: React.FC<VercelDeployGuideModalProps> = ({
  isOpen,
  onClose,
  onCopyNotice
}) => {
  if (!isOpen) return null;

  const copyToClipboard = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    if (onCopyNotice) {
      onCopyNotice(`Copied: "${cmd}"`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-xl border border-white/20 shadow-inner">
              ▲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">Vercel Deployment Guide</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready to Deploy
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Vercel-এ এই সফটওয়্যারটি লাইভ রান করার সহজ পদ্ধতি (Step-by-Step)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step 1 */}
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 border border-indigo-100 text-sm">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-sm">
                ধাপ ১: কোড GitHub-এ পুশ করুন (Push to GitHub)
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                আপনার কম্পিউটারে টার্মিনালে নিচের কমান্ডগুলো চালান অথবা এই প্রজেক্টের ফাইলগুলো গিটহাবে একটি নতুন রিপোজিটরিতে আপলোড করুন:
              </p>
              <div className="mt-2.5 bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-xs flex items-center justify-between gap-2 border border-slate-800">
                <code>git init && git add . && git commit -m "Deploy WMS to Vercel"</code>
                <button
                  onClick={() => copyToClipboard('git init && git add . && git commit -m "Deploy WMS to Vercel"')}
                  className="p-1 hover:text-white text-slate-400"
                  title="Copy command"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 border border-indigo-100 text-sm">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-sm">
                ধাপ ২: Vercel ড্যাশবোর্ডে প্রজেক্ট ইম্পোর্ট করুন (Import in Vercel)
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                1. <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">vercel.com</a>-এ লগইন করুন。<br />
                2. <strong>"Add New..." → "Project"</strong> সিলেক্ট করুন এবং আপনার GitHub রিপোজিটরিটি সিলেক্ট করুন।
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 border border-indigo-100 text-sm">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-sm">
                ধাপ ৩: প্রজেক্ট বিল্ড সেটিংস (Build & Output Settings)
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Vercel স্বয়ংক্রিয়ভাবে Vite শনাক্ত করে নেবে। কনফিগারেশন নিশ্চিত করুন:
              </p>

              <div className="mt-2 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Framework Preset:</span>
                  <span className="font-bold text-slate-800">Vite</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Build Command:</span>
                  <span className="font-mono font-bold text-indigo-600">npm run build</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Output Directory:</span>
                  <span className="font-mono font-bold text-indigo-600">dist</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Install Command:</span>
                  <span className="font-mono font-bold text-slate-700">npm install</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: shared database */}
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center shrink-0 border border-amber-100 text-sm">
              4
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-sm">
                ধাপ ৪: Shared Database connect করুন
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Vercel-এর <strong>Storage / Marketplace → Neon Postgres</strong> থেকে
                database তৈরি করে এই project-এর সঙ্গে connect করুন। এতে admin-এর
                product delete/add এবং customer claim সব device-এ sync হবে।
                Vercel সাধারণত <code>DATABASE_URL</code> নিজে যোগ করে; না হলে
                Project Settings → Environment Variables-এ এটি যোগ করুন।
              </p>
            </div>
          </div>

          {/* Step 5: vercel.json already present */}
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0 border border-emerald-100 text-sm">
              ✓
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>vercel.json কনফিগারেশন অলরেডি তৈরি করা হয়েছে</span>
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                রুট ফোল্ডারে <code>vercel.json</code> ফাইল তৈরি করা আছে যা Vercel-এ পেজ রিফ্রেশ বা রাউটিং কোনো সমস্যা ছাড়াই এক চান্সে রান করাবে।
              </p>
            </div>
          </div>

          {/* CLI Alternative */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <h5 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
              <Terminal className="w-4 h-4 text-indigo-600" /> Vercel CLI দিয়ে ১-ক্লিকে ডেপ্লয় (Optional)
            </h5>
            <p className="text-slate-600 mb-2">আপনি সরাসরি টার্মিনালে নিচের কমান্ড দিয়েও ২ সেকেন্ডে ডেপ্লয় করতে পারেন:</p>
            <div className="bg-slate-900 text-slate-200 p-2.5 rounded-xl font-mono flex items-center justify-between">
              <code>npx vercel --prod</code>
              <button
                onClick={() => copyToClipboard('npx vercel --prod')}
                className="p-1 hover:text-white text-slate-400"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center">
          <span className="text-xs text-slate-500">আপনার প্রজেক্টটি Vercel-এর জন্য শতভাগ প্রস্তুত।</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition"
          >
            বুঝেছি, ধন্যবাদ
          </button>
        </div>
      </div>
    </div>
  );
};
