import { useState, useEffect } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg rounded-2xl p-6 sm:p-7 border-border bg-card">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 ${provider.bgClass}`}
          >
            <IconComponent className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg font-bold text-foreground">Add {provider.name} Link</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">{provider.description}</DialogDescription>
          </div>
        </div>

        {/* Username / URL Input Form */}
        <form onSubmit={handleManualSave} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
              Enter Username or Full URL
            </label>
            <Input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={provider.placeholder}
              className="h-11 text-xs"
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              Enter username or full URL (e.g. <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">{provider.placeholder}</code>)
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              className="text-xs font-semibold"
            >
              Save Link
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
