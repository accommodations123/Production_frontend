import { useState } from "react";
import { X, Send, CheckCircle2, Loader2 } from "lucide-react";
import { FaWhatsapp, FaTelegram } from "react-icons/fa6";
import { Button } from "@/shared/ui/button";
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isSent ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Message Request Sent!</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Your message request has been delivered to <span className="font-bold text-slate-800">{expertName}</span>. They will review your request and get back to you shortly.
              </p>
            </div>
            <Button
              onClick={handleResetAndClose}
              className="h-11 px-8 bg-[#00142E] text-white font-bold rounded-xl cursor-pointer"
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <img
                src={person.avatar || person.user?.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt={expertName}
                className="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-[#E1392A] uppercase tracking-wider block">Direct Inquiry</span>
                <h3 className="text-base font-extrabold text-slate-900 truncate">
                  Message {expertName}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {person.headline || person.profession || person.city || "Professional Expert"}
                </p>
              </div>
            </div>

            {(whatsappUrl || telegramUrl) && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700">Quick Connect:</span>
                <div className="flex items-center gap-2">
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <FaWhatsapp className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  )}
                  {telegramUrl && (
                    <a
                      href={telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <FaTelegram className="w-3.5 h-3.5" /> Telegram
                    </a>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Your Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full h-10 px-3.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 text-slate-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Your Email</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full h-10 px-3.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 text-slate-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={defaultSubject}
                  className="w-full h-10 px-3.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Message</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hi ${expertName}, I would like to inquire about your services...`}
                  className="w-full p-3.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 text-slate-900 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetAndClose}
                  className="h-11 px-4 text-xs font-bold text-slate-600 border-slate-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 bg-[#E1392A] hover:bg-[#b0221e] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
