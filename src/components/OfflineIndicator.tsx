import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-18 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-slate-900/95 text-amber-300 px-4 py-1.5 text-xs font-semibold shadow-xl border border-amber-500/30 backdrop-blur-md">
      <WifiOff className="w-3.5 h-3.5 animate-pulse text-amber-400" />
      <span>Offline Mode — Cached data active</span>
    </div>
  );
};
