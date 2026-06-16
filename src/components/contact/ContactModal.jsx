import React, { useState } from 'react';
import { X, ArrowLeft, Phone, MessageSquare, Check, User, Mail, Calendar, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { CountryCodeSelect } from '@/components/ui/CountryCodeSelect';

export function ContactModal({ isOpen, onClose, listing, type = 'call' }) {
    const [step, setStep] = useState('form');
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [phoneCode, setPhoneCode] = useState("+91");
    const [phoneIso, setPhoneIso] = useState("");
    const [message, setMessage] = useState("");
    const [preferredTime, setPreferredTime] = useState("");

    if (!isOpen || !listing) return null;

    const owner = listing.owner || {
        name: "Sarah Johnson",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&q=80&w=150&h=150",
        phone: "+1 (555) 123-4567",
        rating: 4.8,
        responseTime: "2 hours",
        verified: true
    };

    const handleAction = () => {
        if (type === 'call' || type === 'view-number') {
            window.location.href = `tel:${owner.phone}`;
        } else {
            setStep('success');
            setTimeout(() => {
                onClose();
                setStep('form');
            }, 3000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: '100%', scale: 0.95 }}
                        animate={{ y: 0, scale: 1 }}
                        exit={{ y: '100%', scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-gradient-to-b from-slate-900 to-slate-800 w-full md:w-[600px] md:rounded-3xl rounded-t-[40px] overflow-hidden max-h-[90vh] flex flex-col border border-white/10 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="relative p-6 pb-0">
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={onClose}
                                    className="p-3 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-white/70" />
                                </button>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-sm text-emerald-400 font-medium">Owner Online</span>
                                </div>
                                <div className="w-12" />
                            </div>

                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-white mb-2">Connect with Owner</h2>
                                <p className="text-white/60">Get instant response to your inquiry</p>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                            {/* Owner Profile Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-r from-violet-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img
                                            src={owner.image}
                                            alt={owner.name}
                                            className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20"
                                        />
                                        {owner.verified && (
                                            <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full">
                                                <Shield className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white">{owner.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="text-white/80 font-medium">{owner.rating}</span>
                                            </div>
                                            <span className="text-white/40">•</span>
                                            <span className="text-white/60 text-sm">Responds in {owner.responseTime}</span>
                                        </div>
                                        <p className="text-white/60 text-sm mt-1">{owner.phone}</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
                                    <Phone className="w-5 h-5 text-violet-400 mb-2" />
                                    <p className="text-white text-sm font-medium">Call Now</p>
                                </button>
                                <button className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
                                    <MessageSquare className="w-5 h-5 text-cyan-400 mb-2" />
                                    <p className="text-white text-sm font-medium">WhatsApp</p>
                                </button>
                            </div>

                            {/* Contact Form */}
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Your Name *</label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-violet-400 transition-colors" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full h-12 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400 focus:bg-white/10 transition-all"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Email Address *</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full h-12 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Phone Number *</label>
                                    <div className="relative group flex gap-2">
                                        <div className="w-[110px] shrink-0">
                                            <CountryCodeSelect
                                                value={phoneCode}
                                                isoCode={phoneIso}
                                                onChange={(code, iso) => {
                                                    setPhoneCode(code);
                                                    if (iso) setPhoneIso(iso);
                                                }}
                                            />
                                        </div>
                                        <div className="relative flex-1">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full h-12 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all"
                                                placeholder="123-4567"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Preferred Contact Time</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-violet-400 transition-colors" />
                                        <select
                                            value={preferredTime}
                                            onChange={(e) => setPreferredTime(e.target.value)}
                                            className="w-full h-12 pl-10 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-400 focus:bg-white/10 transition-all appearance-none"
                                        >
                                            <option value="" className="bg-slate-800">Select time</option>
                                            <option value="morning" className="bg-slate-800">Morning (9AM - 12PM)</option>
                                            <option value="afternoon" className="bg-slate-800">Afternoon (12PM - 5PM)</option>
                                            <option value="evening" className="bg-slate-800">Evening (5PM - 9PM)</option>
                                        </select>
                                    </div>
                                </div>

                                {type === 'message' && (
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Message</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={4}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all resize-none"
                                            placeholder="Hi, I'm interested in this property..."
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Trust Indicators */}
                            <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-emerald-400" />
                                    <p className="text-sm text-emerald-300">Your information is secure and will not be shared</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 bg-gradient-to-t from-black/50 to-transparent border-t border-white/10">
                            {step === 'success' ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center py-4"
                                >
                                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                                    <p className="text-white/60">The owner will respond within 2 hours</p>
                                </motion.div>
                            ) : (
                                <Button
                                    onClick={handleAction}
                                    className="w-full h-14 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white font-semibold text-lg shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {type === 'call' ? (
                                        <>
                                            <Phone className="w-5 h-5 mr-2" />
                                            Call Owner Now
                                        </>
                                    ) : (
                                        <>
                                            <MessageSquare className="w-5 h-5 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}