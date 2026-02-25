import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plane, Clock, Shield, Star, Heart, Navigation, ChevronDown } from "lucide-react";

export default function TripCard({ plan, isSelected, onSelect, onMatchRequest }) {
    const formatTime = (timeString) => {
        if (!timeString) return "";
        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch (e) {
            return timeString;
        }
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
                        <img
                            src={plan.user.image}
                            className="w-12 h-12 rounded-full object-cover border-2"
                            style={{ borderColor: 'var(--color-neutral)' }}
                            alt={plan.user.fullName}
                            loading="lazy"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight" style={{ color: 'var(--color-foreground)' }}>{plan.user.fullName}</h3>
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-secondary)' }}>
                            <span>{plan.user.age} • {plan.user.gender}</span>
                            <span className="flex items-center gap-1">
                                <Shield size={10} className="text-blue-500" /> Verified
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex gap-0.5 text-yellow-400">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                    <span className="text-[10px]" style={{ color: 'var(--color-secondary)' }}>4.9 (12 reviews)</span>
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
                            style={{ borderColor: 'var(--color-neutral)' }}
                        >
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
                    {plan.user.languages.map((lang, idx) => (
                        <span key={idx} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                            {lang}
                        </span>
                    ))}
                    <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">
                        Budget Traveler
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(plan.id)}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-colors"
                        style={{
                            borderColor: 'var(--color-primary)',
                            color: 'var(--color-primary)'
                        }}
                    >
                        {isSelected ? "Hide Details" : "View Details"}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onMatchRequest(plan)}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white shadow-lg transition-all"
                        style={{ backgroundColor: 'var(--color-accent)' }}
                    >
                        Match Now <Heart size={16} fill="currentColor" />
                    </motion.button>
                </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="overflow-hidden bg-gray-50 border-t"
                        style={{ borderColor: 'var(--color-neutral)' }}
                    >
                        <div className="p-6 space-y-6">
                            {/* Detailed Itinerary */}
                            <div>
                                <h4 className="text-xs uppercase font-black tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--color-secondary)' }}>
                                    <Clock size={14} /> Full Itinerary Info
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                            <div className="w-0.5 h-full bg-blue-200"></div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold" style={{ color: 'var(--color-secondary)' }}>DEPARTURE</p>
                                            <p className="font-bold text-sm" style={{ color: 'var(--color-foreground)' }}>{plan.flight.from}</p>
                                            <p className="text-xs" style={{ color: 'var(--color-secondary)' }}>{plan.flight.departureDate} at {formatTime(plan.flight.departureTime)}</p>
                                        </div>
                                    </div>

                                    {plan.flight.stops && plan.flight.stops.map((stop, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                <div className="w-0.5 h-full bg-gray-200"></div>
                                            </div>
                                            <div className="bg-yellow-50 p-2 rounded-lg flex-1">
                                                <p className="text-[10px] font-bold text-yellow-700">LAYOVER • {stop.location}</p>
                                                <p className="text-xs" style={{ color: 'var(--color-secondary)' }}>Arrival: {formatTime(stop.arrivalTime)} | Departure: {formatTime(stop.departureTime)}</p>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full bg-red-600"></div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold" style={{ color: 'var(--color-secondary)' }}>ARRIVAL</p>
                                            <p className="font-bold text-sm" style={{ color: 'var(--color-foreground)' }}>{plan.flight.to}</p>
                                            <p className="text-xs" style={{ color: 'var(--color-secondary)' }}>{plan.flight.arrivalDate} at {formatTime(plan.flight.arrivalTime)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bio / Extra note */}
                            <div className="bg-white p-4 rounded-xl border-l-4" style={{ borderColor: 'var(--color-accent)' }}>
                                <p className="text-xs italic" style={{ color: 'var(--color-secondary)' }}>
                                    "I'm looking for someone who's interested in local food tours and photography. I'm generally quiet on flights but love exploring together once we land!"
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
