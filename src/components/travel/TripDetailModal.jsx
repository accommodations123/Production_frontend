import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plane, User, Users, MapPin, Clock, Languages, Calendar, Tag, UserPlus } from "lucide-react";

export default function TripDetailModal({ plan, onClose, onMatchRequest }) {
    if (!plan) return null;

    const formatTime12h = (t) => {
        if (!t) return '';
        const [h, m] = t.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return t;
        const period = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
    };


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto"
                style={{ backgroundColor: 'var(--color-background)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Image/Gradient */}
                <div className="h-32 bg-gradient-to-r from-[#00142E] to-[#0A1C30] relative flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all shadow-lg backdrop-blur-md z-10"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Profile Image & Quick Stats */}
                <div className="px-8 pb-8 -mt-12 relative">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
                        <div className="relative">
                            <img
                                src={plan.user.image}
                                alt={plan.user.fullName}
                                className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl object-cover"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 pb-2">
                            <h2 className="text-3xl font-black mb-1" style={{ color: 'var(--color-foreground)' }}>
                                {plan.user.fullName}
                            </h2>
                            <div className="flex flex-wrap gap-3 text-sm font-bold opacity-70">
                                <span className="flex items-center gap-1.5"><User size={16} className="text-blue-500" /> {plan.user.age || 'N/A'} yrs</span>
                                <span className="text-gray-300">•</span>
                                <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] uppercase tracking-wider">{plan.user.gender || 'Not Specified'}</span>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center gap-1.5"><MapPin size={16} className="text-red-500" /> {plan.user.city}, {plan.user.country}</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Trip Summary */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xs font-black uppercase spacing tracking-widest mb-4 opacity-40 flex items-center gap-2">
                                    <Plane size={14} /> Trip Itinerary
                                </h3>
                                <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative overflow-hidden">
                                    <div className="absolute left-9 top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-500 to-red-500 opacity-20"></div>
                                    <div className="flex gap-4 relative z-10">
                                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-blue-500/30">
                                            A
                                        </div>
                                        <div className="flex-1 text-sm bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                            <p className="font-black text-gray-900 leading-none mb-1">{plan.flight.from}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Departure • {formatTime12h(plan.flight.departureTime)}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 relative z-10 pt-4">
                                        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-red-500/30">
                                            B
                                        </div>
                                        <div className="flex-1 text-sm bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                            <p className="font-black text-gray-900 leading-none mb-1">{plan.flight.to}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Arrival • {formatTime12h(plan.flight.arrivalTime)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-black uppercase spacing tracking-widest mb-4 opacity-40 flex items-center gap-2">
                                    <Languages size={14} /> Languages
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {(plan.user.languages && plan.user.languages.length > 0) ? plan.user.languages.map((lang, idx) => (
                                        <span key={idx} className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black border border-blue-100">
                                            {lang}
                                        </span>
                                    )) : (
                                        <span className="text-xs text-gray-400 italic">No languages specified</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Details & Preferences */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xs font-black uppercase spacing tracking-widest mb-4 opacity-40 flex items-center gap-2">
                                    <Tag size={14} /> Travel Bio
                                </h3>
                                <div className="bg-white p-5 rounded-2xl border-2 border-dashed border-gray-100 italic text-sm text-gray-600 leading-relaxed shadow-sm">
                                    <span className="text-2xl text-blue-200 mr-1 opacity-50 font-serif">"</span>
                                    {plan.user.bio || `I'm excited to explore ${plan.destination} and connect with fellow travelers sharing this route!`}
                                    <span className="text-2xl text-blue-200 ml-1 opacity-50 font-serif">"</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100">
                                        <Plane size={16} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Flight</p>
                                        <p className="text-xs font-black text-gray-800">{plan.flight.flightNumber}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100">
                                        <Users size={16} className="text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Travelers</p>
                                        <p className="text-xs font-black text-gray-800">{plan.travelers_count || 1} Person</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3 col-span-2">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100">
                                        <Calendar size={16} className="text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Travel Date</p>
                                        <p className="text-xs font-black text-gray-800">
                                            {new Date(plan.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="mt-12 flex flex-col md:flex-row gap-4 border-t pt-8">
                        <motion.button
                            whileHover={{ scale: plan.matchStatus ? 1 : 1.02, y: plan.matchStatus ? 0 : -2 }}
                            whileTap={{ scale: plan.matchStatus ? 1 : 0.98 }}
                            onClick={() => !plan.matchStatus && onMatchRequest(plan)}
                            disabled={!!plan.matchStatus}
                            className={`flex-1 py-4 text-white rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-2 ${plan.matchStatus
                                ? "bg-gray-400 cursor-not-allowed opacity-80 shadow-none"
                                : "bg-[#CB2A25] shadow-red-500/30 hover:bg-red-600"
                                }`}
                        >
                            {plan.matchStatus === 'pending' ? (
                                <>Requested <UserPlus size={20} /></>
                            ) : plan.matchStatus === 'accepted' ? (
                                <>Connected <UserPlus size={20} /></>
                            ) : (
                                <>Connect <UserPlus size={20} /></>
                            )}
                        </motion.button>
                        <button
                            onClick={onClose}
                            className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all border border-gray-200"
                        >
                            Back to List
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
