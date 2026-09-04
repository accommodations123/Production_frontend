import { CheckCircle2, Link2, ExternalLink, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * ProviderConnectCard — Compact Provider Connection Card Component
 */
export function ProviderConnectCard({
  provider,
  value,
  onConnectClick,
  onDisconnectClick
}) {
  const isConnected = Boolean(value && value.trim());
  const IconComponent = provider.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:border-slate-300 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Left: Icon & Provider Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs ${provider.bgClass}`}
        >
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-extrabold text-slate-900 truncate">{provider.name}</h4>
            {isConnected ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                Not connected
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#717171] truncate">
            {isConnected ? value : provider.description}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0 justify-end sm:justify-start">
        {isConnected ? (
          <>
            <button
              type="button"
              onClick={() => onConnectClick(provider)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
            <button
              type="button"
              onClick={() => onDisconnectClick(provider.id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Disconnect
            </button>
          </>
        ) : (
          <Button
            type="button"
            onClick={() => onConnectClick(provider)}
            className="h-8 px-4 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            {provider.actionText || (provider.supportsOAuth ? "Connect" : "Add")}
          </Button>
        )}
      </div>
    </div>
  );
}
