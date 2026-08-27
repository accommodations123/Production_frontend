import { useState, useEffect } from "react";
import { X, Link2, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";

/**
 * Auto-format usernames/handles/numbers into standard URLs for backend & redirection
 * Instagram: username or @user -> https://instagram.com/username
 * Facebook:  username        -> https://facebook.com/username
 * WhatsApp:  1234567890      -> https://wa.me/1234567890
 * Telegram:  @user or user   -> https://t.me/username
 * Website:   example.com     -> https://example.com
 */
export function formatProviderUrl(providerId, rawInput) {
  if (!rawInput) return "";
  let trimmed = rawInput.trim();
  if (!trimmed) return "";

  if (providerId === "instagram") {
    if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
    if (trimmed.startsWith("instagram.com/")) return `https://${trimmed}`;
    const cleanUser = trimmed.replace(/^@/, "");
    return `https://instagram.com/${cleanUser}`;
  }

  if (providerId === "facebook") {
    if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
    if (trimmed.startsWith("facebook.com/")) return `https://${trimmed}`;
    const cleanUser = trimmed.replace(/^@/, "");
    return `https://facebook.com/${cleanUser}`;
  }

  if (providerId === "whatsapp") {
    if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
    if (trimmed.startsWith("wa.me/")) return `https://${trimmed}`;
    const cleanDigits = trimmed.replace(/[^0-9]/g, "");
    if (cleanDigits) return `https://wa.me/${cleanDigits}`;
    return trimmed;
  }

  if (providerId === "telegram") {
    if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
    if (trimmed.startsWith("t.me/")) return `https://${trimmed}`;
    const cleanUser = trimmed.replace(/^@/, "");
    return `https://t.me/${cleanUser}`;
  }

  if (providerId === "website") {
    if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
    return `https://${trimmed}`;
  }

  return trimmed;
}

/**
 * ProviderConnectModal — Clean URL / Username Input Dialog
 */
export function ProviderConnectModal({
  isOpen,
  onClose,
  provider,
  currentValue,
  onSave
}) {
  const [urlInput, setUrlInput] = useState(currentValue || "");

  useEffect(() => {
    setUrlInput(currentValue || "");
  }, [currentValue, isOpen]);

  if (!isOpen || !provider) return null;

  const IconComponent = provider.icon;

  const handleManualSave = (e) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) {
      toast.error(`Please enter a valid ${provider.name} username or link.`);
      return;
    }

    const formattedUrl = formatProviderUrl(provider.id, trimmed);
    onSave(provider.id, formattedUrl);
    toast.success(`${provider.name} link saved: ${formattedUrl}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${provider.bgClass}`}
          >
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Add {provider.name} Link</h3>
            <p className="text-xs text-[#717171]">{provider.description}</p>
          </div>
        </div>

        {/* Username / URL Input Form */}
        <form onSubmit={handleManualSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 block flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5 text-slate-400" />
              Enter Username or Full URL
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={provider.placeholder}
              className="w-full h-11 px-4 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 text-slate-900 placeholder:text-slate-400 shadow-2xs"
              autoFocus
            />
            <p className="text-[10px] text-[#717171]">
              Enter username or full URL (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">{provider.placeholder}</code>)
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-4 text-xs font-bold text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 px-5 text-xs font-bold text-white bg-[#E1392A] hover:bg-[#b0221e] cursor-pointer rounded-xl shadow-sm"
            >
              Save Link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
