import { createContext, useContext, useState, useEffect } from 'react';
import { Lock, Clock, CheckCircle2, XCircle, ShieldAlert, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';

const STORAGE_KEY = 'nextkin_social_access_requests';

const SocialAccessContext = createContext(null);

export function SocialAccessProvider({ children }) {
  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to load social access requests from storage:', error);
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch (error) {
      console.error('Failed to persist social access requests:', error);
    }
  }, [requests]);

  const requestAccess = (entityId, ownerName = 'Owner', message = '') => {
    if (!entityId) return;
    setRequests((prev) => ({
      ...prev,
      [entityId]: {
        entityId,
        ownerName,
        message,
        status: 'pending',
        requestedAt: new Date().toISOString()
      }
    }));
  };

  const acceptAccess = (entityId) => {
    if (!entityId) return;
    setRequests((prev) => ({
      ...prev,
      [entityId]: {
        ...prev[entityId],
        status: 'accepted',
        updatedAt: new Date().toISOString()
      }
    }));
  };

  const declineAccess = (entityId) => {
    if (!entityId) return;
    setRequests((prev) => ({
      ...prev,
      [entityId]: {
        ...prev[entityId],
        status: 'declined',
        updatedAt: new Date().toISOString()
      }
    }));
  };

  const resetAccess = (entityId) => {
    if (!entityId) return;
    setRequests((prev) => {
      const next = { ...prev };
      delete next[entityId];
      return next;
    });
  };

  const getAccessStatus = (entityId) => {
    if (!entityId) return 'none';
    return requests[entityId]?.status || 'none';
  };

  return (
    <SocialAccessContext.Provider
      value={{
        requests,
        requestAccess,
        acceptAccess,
        declineAccess,
        resetAccess,
        getAccessStatus
      }}
    >
      {children}
    </SocialAccessContext.Provider>
  );
}

export function useSocialAccess() {
  const context = useContext(SocialAccessContext);
  if (!context) {
    throw new Error('useSocialAccess must be used within a SocialAccessProvider');
  }
  return context;
}

/**
 * Interactive floating simulator panel for testing owner approval/decline flows live.
 */
export function SocialOwnerSimulator() {
  const { requests, acceptAccess, declineAccess, resetAccess } = useSocialAccess();
  const [isOpen, setIsOpen] = useState(false);

  const requestList = Object.values(requests);
  const pendingCount = requestList.filter((r) => r.status === 'pending').length;

  if (requestList.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none">
      <div className="bg-[#00142E] text-white rounded-2xl shadow-2xl border border-slate-700 overflow-hidden max-w-sm w-80 sm:w-96 transition-all duration-300">
        {/* Header Bar */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-slate-900 hover:bg-slate-800/80 flex items-center justify-between font-bold text-xs cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#E1392A]" />
            <span>Owner Permission Simulator</span>
            {pendingCount > 0 && (
              <span className="bg-[#E1392A] text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </button>

        {/* List Body */}
        {isOpen && (
          <div className="p-3 max-h-72 overflow-y-auto space-y-2 bg-[#00142E]/95 divide-y divide-slate-800 text-xs">
            {requestList.map((req) => (
              <div key={req.entityId} className="pt-2 first:pt-0 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 truncate max-w-[170px]" title={req.ownerName}>
                    {req.ownerName} <span className="text-[10px] font-normal text-slate-400">({req.entityId})</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      req.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : req.status === 'accepted'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                {req.message && (
                  <p className="text-[11px] text-slate-300 italic bg-slate-900/60 p-1.5 rounded border border-slate-800 line-clamp-2">
                    "{req.message}"
                  </p>
                )}

                <div className="flex items-center gap-1.5 justify-end pt-1">
                  {req.status !== 'accepted' && (
                    <button
                      type="button"
                      onClick={() => acceptAccess(req.entityId)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Approve
                    </button>
                  )}
                  {req.status !== 'declined' && (
                    <button
                      type="button"
                      onClick={() => declineAccess(req.entityId)}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <XCircle className="w-3 h-3" /> Decline
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => resetAccess(req.entityId)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                    title="Reset request state"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
