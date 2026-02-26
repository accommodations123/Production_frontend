import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plane, Clock, Shield, Star, UserPlus, Navigation, ChevronDown } from "lucide-react";
import WishlistButton from "@/components/ui/WishlistButton";

export default function TripCard({ plan, isSelected, onSelect, onMatchRequest }) {
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
            layout
            className={`relative rounded-xl overflow-hidden transition-all duration-300 border-2 ${isSelected ? "shadow-2xl" : "hover:shadow-xl"
                }`}
            style={{
                backgroundColor: 'var(--color-background)',
                borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-neutral)'
            }}
        >
            {/* Header Info */}
            <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--color-neutral)' }}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {plan.user.image ? (
                            <img
                                src={plan.user.image}
                                className="w-12 h-12 rounded-full object-cover border-2"
                                style={{ borderColor: 'var(--color-neutral)' }}
                                alt={plan.user.fullName}
                                loading="lazy"
                            />
                        ) : (
                            <div
                                className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg text-primary bg-primary/10"
                                style={{ borderColor: 'var(--color-neutral)' }}
                            >
                                {plan.user.fullName?.[0] || "U"}
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight" style={{ color: 'var(--color-foreground)' }}>{plan.user.fullName || "Community Member"}</h3>
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-secondary)' }}>
                            <span>{plan.user.age} • {plan.user.gender}</span>
                            <span className="flex items-center gap-1">
                                <Shield size={10} className="text-blue-500" /> Verified
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <WishlistButton
                        itemId={plan.id || plan._id}
                        itemType="trip"
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        iconSize={16}
                        outlineColor="text-gray-400"
                    />
                    {plan.user.rating && (
                        <div className="flex flex-col items-end">
                            <div className="flex gap-0.5 text-yellow-400">
                                {[...Array(Math.round(plan.user.rating))].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                            </div>
                            <span className="text-[10px]" style={{ color: 'var(--color-secondary)' }}>{plan.user.rating} ({plan.user.reviews || 0} reviews)</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Trip Info */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></span>
                            <p className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--color-secondary)' }}>Destination</p>
                        </div>
                        <p className="text-xl font-black flex items-center gap-2" style={{ color: 'var(--color-foreground)' }}>
                            <Navigation size={18} className="text-blue-600" /> {plan.destination}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--color-secondary)' }}>Travel Date</p>
                        <p className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-full inline-block" style={{ color: 'var(--color-foreground)' }}>
                            {new Date(plan.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Flight Path Illustration */}
                <div className="relative py-4 mb-6">
                    <div className="absolute left-0 right-0 top-1/2 h-px border-t-2 border-dashed" style={{ borderColor: 'var(--color-neutral)' }}></div>
                    <div className="relative flex justify-between items-center z-10">
                        <div className="bg-white p-2 rounded-full border shadow-sm" style={{ borderColor: 'var(--color-neutral)' }}>
                            <MapPin size={16} className="text-red-500" />
                        </div>
                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="bg-white p-2 rounded-full border shadow-sm mx-auto"
                            style={{ borderColor: 'var(--color-neutral)' }}>
                            <Plane size={18} className="text-blue-600 rotate-45" />
                        </motion.div>
                        <div className="bg-white p-2 rounded-full border shadow-sm" style={{ borderColor: 'var(--color-neutral)' }}>
                            <MapPin size={16} className="text-blue-600" />
                        </div>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-tighter" style={{ color: 'var(--color-secondary)' }}>
                        <span>{plan.flight.from}</span>
                        <span>{plan.flight.airline} {plan.flight.flightNumber}</span>
                        <span>{plan.flight.to}</span>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {plan.user.languages && plan.user.languages.map((lang, idx) => (
                        <span key={idx} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                            {lang}
                        </span>
                    ))}
                    {plan.user.tags ? plan.user.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">
                            {tag}
                        </span>
                    )) : (
                        <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">
                            Community Member
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: 'var(--color-primary)', color: 'white' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onSelect}
                        className="flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all text-xs"
                        style={{ borderColor: 'var(--color-primary)', backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent', color: isSelected ? 'white' : 'var(--color-primary)' }}
                    >
                        {isSelected ? "Hide Details" : "View Details"}
                    </motion.button>

                </div>
            </div>

            {/* Expanded Details Section */}
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="overflow-hidden bg-gray-50/50 border-t"
                        style={{ borderColor: 'var(--color-neutral)' }}
                    >
                        <div className="p-6 space-y-6">
                            {/* Personal Summary */}
                            <div className="flex flex-wrap gap-8 items-start">
                                <div>
                                    <h4 className="text-[10px] uppercase font-black tracking-widest mb-1 text-gray-400">Traveler Name</h4>
                                    <p className="font-bold text-lg text-gray-900 leading-none">{plan.user.fullName}</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] uppercase font-black tracking-widest mb-1 text-gray-400">Age</h4>
                                    <p className="font-bold text-lg text-gray-900 leading-none">{plan.user.age || 'N/A'} yrs</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] uppercase font-black tracking-widest mb-1 text-gray-400">Languages</h4>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {(plan.user.languages && plan.user.languages.length > 0) ? plan.user.languages.map((lang, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">
                                                {lang}
                                            </span>
                                        )) : <span className="text-xs text-gray-400 italic">Not specified</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Trip Path */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-400 to-red-400 opacity-20"></div>
                                <h4 className="text-[10px] uppercase font-black tracking-widest mb-4 text-gray-400 flex items-center gap-2">
                                    <Navigation size={12} /> Trip Route
                                </h4>
                                <div className="space-y-6">
                                    <div className="flex gap-4 relative z-10">
                                        <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm mt-1"></div>
                                        <div>
                                            <p className="font-black text-sm text-gray-900 leading-none">{plan.flight.from}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Departure • {formatTime12h(plan.flight.departureTime)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 relative z-10">
                                        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm mt-1"></div>
                                        <div>
                                            <p className="font-black text-sm text-gray-900 leading-none">{plan.flight.to}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Arrival • {formatTime12h(plan.flight.arrivalTime)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="bg-white p-4 rounded-xl border-l-4 border-accent shadow-sm">
                                <p className="text-xs italic text-gray-600">
                                    "{plan.user.bio || `I'm exciting to explore ${plan.destination}!`}"
                                </p>
                            </div>

                            {/* Connect Button (Inline) */}
                            <motion.button
                                whileHover={{ scale: plan.matchStatus ? 1 : 1.02 }}
                                whileTap={{ scale: plan.matchStatus ? 1 : 0.98 }}
                                onClick={() => !plan.matchStatus && onMatchRequest(plan)}
                                disabled={!!plan.matchStatus}
                                className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 text-white transition-all ${plan.matchStatus
                                    ? "bg-gray-400 cursor-not-allowed opacity-80 shadow-none"
                                    : "bg-[#CB2A25] shadow-red-500/30 hover:bg-red-600"
                                    }`}
                            >
                                {plan.matchStatus === 'pending' ? (
                                    <>Requested <UserPlus size={18} /></>
                                ) : plan.matchStatus === 'accepted' ? (
                                    <>Connected <UserPlus size={18} /></>
                                ) : (
                                    <>Connect <UserPlus size={18} /></>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
