import React from 'react';
import { X, Phone, Mail, Shield, ExternalLink } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';

export function ContactModal({ isOpen, onClose, listing }) {
    if (!isOpen || !listing) return null;

    const owner = listing.owner || listing.host || {
        name: listing.host_name || listing.title || "Host",
        image: listing.host_avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&q=80&w=150&h=150",
        phone: listing.phone || listing.host_phone || "+1 (555) 019-2831",
        whatsapp: listing.whatsapp || listing.phone || "+1 (555) 019-2831",
        email: listing.email || listing.host_email || "host@nextkinlife.live",
        verified: true
    };

    const whatsappNum = (owner.whatsapp || owner.phone || "").replace(/[^0-9+]/g, "");
    const whatsappUrl = whatsappNum ? (
        whatsappNum.startsWith("+")
            ? `https://wa.me/${whatsappNum.replace("+", "")}`
            : `https://wa.me/${whatsappNum}`
    ) : null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ y: '100%', scale: 0.95 }}
                        animate={{ y: 0, scale: 1 }}
                        exit={{ y: '100%', scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-gradient-to-b from-slate-900 to-slate-800 w-full md:w-[540px] md:rounded-3xl rounded-t-[40px] overflow-hidden max-h-[90vh] flex flex-col border border-white/10 shadow-2xl"
                    >
                        <div className="relative p-6 pb-2">
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={onClose}
                                    className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-xs text-emerald-400 font-bold">Host Available</span>
                                </div>
                            </div>

                            <div className="text-center mb-4">
                                <h2 className="text-2xl font-black text-white">Direct Contact Channels</h2>
                                <p className="text-xs text-white/60 mt-1">Connection accepted! Choose a direct channel to connect with {owner.name}.</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
                            {/* Host Profile Header */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 flex items-center gap-4">
                                <img
                                    src={owner.image}
                                    alt={owner.name}
                                    className="w-14 h-14 rounded-2xl object-cover border border-white/20 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-extrabold text-white truncate">{owner.name}</h3>
                                    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                                        <Shield className="w-3.5 h-3.5 fill-emerald-400/20" /> Verified Host
                                    </p>
                                </div>
                            </div>

                            {/* Unlocked Direct Communication Action Buttons */}
                            <div className="space-y-3 pt-2">
                                <span className="text-[11px] font-extrabold text-white/60 uppercase tracking-wider block">
                                    Unlocked Contact Channels:
                                </span>

                                {whatsappUrl && (
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full h-12 bg-[#25D366] hover:bg-[#20BD5A] text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 text-sm transition-all shadow-md cursor-pointer"
                                    >
                                        <FaWhatsapp className="w-5 h-5 text-white" />
                                        <span>Chat on WhatsApp</span>
                                        <ExternalLink className="w-4 h-4 ml-auto opacity-80" />
                                    </a>
                                )}

                                {owner.phone && (
                                    <a
                                        href={`tel:${owner.phone}`}
                                        className="w-full h-12 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 text-sm border border-white/10 transition-all cursor-pointer"
                                    >
                                        <Phone className="w-4 h-4 text-cyan-400" />
                                        <span>Call Phone ({owner.phone})</span>
                                        <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
                                    </a>
                                )}

                                {owner.email && (
                                    <a
                                        href={`mailto:${owner.email}?subject=${encodeURIComponent(`Inquiry for ${listing.title || 'Accommodation'}`)}`}
                                        className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 text-sm transition-all cursor-pointer"
                                    >
                                        <Mail className="w-4 h-4" />
                                        <span>Send Direct Email</span>
                                        <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900/80 border-t border-white/10 text-center">
                            <button
                                onClick={onClose}
                                className="w-full h-11 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}