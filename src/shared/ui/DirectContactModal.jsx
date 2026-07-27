import { useState } from 'react';
import { FaWhatsapp, FaInstagram, FaLinkedin, FaEnvelope, FaPhone } from 'react-icons/fa6';
import { X, ShieldAlert, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';
import { getSocialUrl } from '@/shared/utils/socialUtils';

export function DirectContactModal({ isOpen, onClose, contact, listingTitle = 'Listing' }) {
  const [copiedField, setCopiedField] = useState('');

  if (!isOpen || !contact) return null;

  const handleCopy = (field, text) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hi! I saw your listing for "${listingTitle}" on NextKinLife and would like to connect.`
  );

  const whatsappUrl = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp.toString().replace(/[^0-9]/g, '')}?text=${whatsappMessage}`
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-50 w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#00162D] animate-in zoom-in-95 duration-200">
        {/* Top Accent Line */}
        <div className="h-1.5 w-full bg-[#CB2A26]" />

        {/* Header */}
        <div className="bg-[#00162D] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#CB2A26]/20 border border-[#CB2A26] flex items-center justify-center text-[#CB2A26]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-300">
                Direct P2P Connect
              </span>
              <h3 className="text-lg font-bold truncate max-w-[280px]">
                Contact {contact.name || 'Host'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Safety Checklist Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#00162D] text-sm">
              <ShieldAlert className="w-4 h-4 text-[#CB2A26] shrink-0" />
              <span>Safety Guidelines for Off-Platform Communication:</span>
            </div>
            <ul className="space-y-1 pl-6 list-disc text-slate-600 font-medium">
              <li>Request a live video walkthrough before issuing deposits.</li>
              <li>Inspect linked LinkedIn or social profiles for identity checks.</li>
              <li>Never send unverified wire transfers or non-refundable cash deposits.</li>
            </ul>
          </div>

          {/* Pre-filled Message Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-1.5 shadow-xs">
            <span className="font-extrabold text-[#00162D] uppercase tracking-wider text-[10px] block">
              Pre-filled Inquiry Preview:
            </span>
            <p className="text-slate-700 italic bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-medium">
              &quot;Hi! I saw your listing for &apos;{listingTitle}&apos; on NextKinLife and would like to connect.&quot;
            </p>
          </div>

          {/* Direct Contact Action Buttons */}
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-[#00162D] uppercase tracking-wider block">
              Available Direct Channels:
            </span>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 bg-[#25D366] hover:bg-[#20BD5A] text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 text-sm transition-all shadow-sm hover:shadow cursor-pointer"
              >
                <FaWhatsapp className="w-5 h-5 text-white" />
                <span>Open WhatsApp Chat</span>
                <ExternalLink className="w-4 h-4 ml-auto opacity-80" />
              </a>
            )}

            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="w-full h-11 bg-[#00162D] hover:bg-[#0A1C30] text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 text-xs transition-all shadow-sm cursor-pointer"
              >
                <FaPhone className="w-4 h-4 text-slate-300" />
                <span>Call Phone ({contact.phone})</span>
              </a>
            )}

            {contact.instagram && (
              <div className="flex items-center gap-2">
                <a
                  href={getSocialUrl('instagram', contact.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-11 bg-slate-900 text-white font-bold rounded-2xl flex items-center gap-2.5 px-4 text-xs shadow-xs hover:bg-black transition-all cursor-pointer"
                >
                  <FaInstagram className="w-4 h-4 text-pink-400" />
                  <span className="truncate">@{contact.instagram}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy('instagram', contact.instagram)}
                  className="h-11 px-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-bold border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy Instagram handle"
                >
                  {copiedField === 'instagram' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            )}

            {contact.linkedin && (
              <a
                href={getSocialUrl('linkedin', contact.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 bg-[#0A66C2] hover:bg-[#08529C] text-white font-bold rounded-2xl flex items-center gap-2.5 px-4 text-xs shadow-xs transition-all cursor-pointer"
              >
                <FaLinkedin className="w-4 h-4 text-white" />
                <span className="truncate">{contact.name || 'LinkedIn Profile'}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
              </a>
            )}

            {contact.email && (
              <a
                href={`mailto:${contact.email}?subject=${encodeURIComponent(`NextKinLife Listing Inquiry: ${listingTitle}`)}`}
                className="w-full h-11 bg-[#CB2A26] hover:bg-[#A9221F] text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 text-xs shadow-xs transition-all cursor-pointer"
              >
                <FaEnvelope className="w-4 h-4" />
                <span>Send Direct Email ({contact.email})</span>
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500">Zero-Fee Direct P2P Network</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#00162D] hover:bg-[#0A1C30] text-white font-bold rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
