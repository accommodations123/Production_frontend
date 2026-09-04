import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { FaWhatsapp, FaTelegram } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { axiosClient } from "@/shared/utils/axiosClient";

export function PeopleMessageModal({ isOpen, onClose, person, currentUser }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [senderEmail, setSenderEmail] = useState(currentUser?.email || "");
  const [senderName, setSenderName] = useState(
    currentUser?.name || currentUser?.full_name || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen || !person) return null;

  const expertName = person.name || "Professional";
  const defaultSubject = subject || `Inquiry regarding ${person.headline || person.profession || "services"}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    if (!senderEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const nameParts = (senderName.trim() || "Guest User").split(" ");
      const firstName = nameParts[0] || "Guest";
      const lastName = nameParts.slice(1).join(" ") || "User";

      // Submit to backend contact route
      await axiosClient.post("/contact/submit", {
        firstName,
        lastName,
        email: senderEmail,
        phone: currentUser?.phone || person?.whatsapp || "",
        subject: defaultSubject,
        message: `[Message for Expert: ${expertName} (User ID: ${person.user_id || person.id})]

${message}`
      });

      setIsSent(true);
      toast.success(`Message request sent successfully to ${expertName}!`);
      setTimeout(() => {
        handleResetAndClose();
      }, 1500);
    } catch (err) {
      console.error("Message send error:", err);
      if (person.whatsapp) {
        const cleanNum = person.whatsapp.replace(/[^0-9+]/g, "");
        const waUrl = cleanNum.startsWith("+")
          ? `https://wa.me/${cleanNum.replace("+", "")}?text=${encodeURIComponent(message)}`
          : `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, "_blank");
        setIsSent(true);
        toast.success("Opening WhatsApp chat...");
      } else if (person.user?.email || person.email) {
        const mailToUrl = `mailto:${person.user?.email || person.email}?subject=${encodeURIComponent(defaultSubject)}&body=${encodeURIComponent(message)}`;
        window.location.href = mailToUrl;
        setIsSent(true);
        toast.success("Opening email client...");
      } else {
        toast.error(err?.response?.data?.message || "Failed to send message. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSent(false);
    setMessage("");
    onClose();
  };

  const whatsappNum = person.whatsapp ? person.whatsapp.replace(/[^0-9+]/g, "") : null;
  const whatsappUrl = whatsappNum
    ? (whatsappNum.startsWith("+") ? `https://wa.me/${whatsappNum.replace("+", "")}` : `https://wa.me/${whatsappNum}`)
    : null;
  const telegramUrl = person.telegram
    ? (person.telegram.startsWith("http") ? person.telegram : `https://t.me/${person.telegram.replace("@", "")}`)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleResetAndClose(); }}>
      <DialogContent className="max-w-lg rounded-2xl p-6 sm:p-7 border-border bg-card">
        {isSent ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold text-foreground text-center">Message Request Sent!</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed text-center">
                Your message request has been delivered to <span className="font-semibold text-foreground">{expertName}</span>. They will review your request and get back to you shortly.
              </DialogDescription>
            </div>
            <Button
              onClick={handleResetAndClose}
              variant="default"
              className="font-semibold px-8"
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 border-b border-border pb-4">
              <img
                src={person.avatar || person.user?.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt={expertName}
                className="w-13 h-13 rounded-full object-cover border border-border shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Direct Inquiry</span>
                <DialogTitle className="text-base font-bold text-foreground truncate">
                  Message {expertName}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  {person.headline || person.profession || person.city || "Professional Expert"}
                </DialogDescription>
              </div>
            </div>

            {(whatsappUrl || telegramUrl) && (
              <div className="bg-muted/40 p-3 rounded-xl border border-border/80 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground">Quick Connect:</span>
                <div className="flex items-center gap-2">
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
                    >
                      <FaWhatsapp className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  )}
                  {telegramUrl && (
                    <a
                      href={telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
                    >
                      <FaTelegram className="w-3.5 h-3.5" /> Telegram
                    </a>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block">Your Name</label>
                <Input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Your full name"
                  className="h-10 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block">Your Email</label>
                <Input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="h-10 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block">Subject</label>
                <Input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={defaultSubject}
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block">Message</label>
                <Textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hi ${expertName}, I would like to inquire about your services...`}
                  className="text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetAndClose}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="accent"
                  isLoading={isSubmitting}
                  className="text-xs font-semibold gap-1.5"
                >
                  {!isSubmitting && <Send className="w-3.5 h-3.5" />}
                  <span>{isSubmitting ? "Sending..." : "Send Request"}</span>
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
