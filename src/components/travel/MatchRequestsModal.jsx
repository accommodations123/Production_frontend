import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, AlertCircle, CheckCircle, UserCheck, UserX, Phone, Mail, Loader2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function MatchRequestsModal({ onClose, matches, plans, myTrips, onAcceptRequest, onRejectRequest }) {
    const [activeTab, setActiveTab] = useState("incoming");
    const [processingIds, setProcessingIds] = useState(new Set());

    const handleAction = async (matchId, tripId, matchedTripId, actionFn) => {
        setProcessingIds(prev => new Set(prev).add(matchId));
        try {
            await actionFn(matchId, tripId, matchedTripId);
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(matchId);
                return next;
            });
        }
    };

    // Process matches data based on backend response format
    // NEW Backend returns: { match_id, status, requester: { full_name, whatsapp, email, ... } }
    const processedIncoming = matches.filter(m => m.status === "pending" || m.status === "accepted").map(match => {
        // New backend format uses 'requester' directly
        if (match.requester) {
            return {
                id: match.match_id,
                status: match.status,
                trip_id: match.trip_id || match.requester_trip?.id,
                matched_trip_id: match.matched_trip_id || match.receiver_trip?.id,
                requesterPlan: {
                    user: {
                        fullName: match.requester.full_name || "Unknown",
                        image: match.requester.profile_image || "https://via.placeholder.com/100",
                        country: match.requester.country,
                        city: match.requester.city,
                        whatsapp: match.requester.whatsapp,
                        email: match.requester.email
                    }
                }
            };
        }
        // Old format fallback (requester_trip with nested host)
        if (match.requester_trip) {
            return {
                id: match.match_id,
                status: match.status,
                trip_id: match.requester_trip?.id,
                matched_trip_id: match.receiver_trip?.id,
                requesterPlan: {
                    id: match.requester_trip?.id,
                    destination: `${match.requester_trip?.to_city}, ${match.requester_trip?.to_country}`,
                    date: match.requester_trip?.travel_date,
                    time: match.requester_trip?.departure_time,
                    user: {
                        fullName: match.requester_trip?.host?.full_name || "Unknown",
                        image: match.requester_trip?.host?.profile_image || "https://via.placeholder.com/100",
                        country: match.requester_trip?.host?.country,
                        city: match.requester_trip?.host?.city,
                        whatsapp: match.requester_trip?.host?.whatsapp,
                        email: match.requester_trip?.host?.email
                    },
                    flight: {
                        from: match.requester_trip?.from_city,
                        to: match.requester_trip?.to_city
                    }
                }
            };
        }
        // Legacy format fallback
        const requesterPlan = plans.find(p => p.id === match.trip_id) || myTrips.find(p => p.id === match.trip_id);
        return { ...match, requesterPlan };
    }).filter(m => m.requesterPlan);

    // Outgoing requests - where user's trip is the requester
    const processedOutgoing = matches.filter(match => {
        // For new format, outgoing would come from a different endpoint
        // For now, check old format
        return myTrips.some(myTrip => myTrip.id === match.trip_id);
    }).map(match => {
        const receiverPlan = plans.find(p => p.id === match.matched_trip_id) || myTrips.find(p => p.id === match.matched_trip_id);
        return { ...match, receiverPlan };
    }).filter(m => m.receiverPlan);

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                    </span>
                );
            case "accepted":
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Accepted
                    </span>
                );
            case "rejected":
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Rejected
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--color-background)' }}
                >
                    <div className="p-6" style={{ backgroundColor: 'var(--color-primary)' }}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Users size={18} /> Travel Match Requests
                            </h2>
                            <motion.button
                                whileHover={{ rotate: 90 }}
                                transition={{ duration: 0.2 }}
                                className="text-white"
                                onClick={onClose}
                                disabled={processingIds.size > 0}
                            >
                                <X className="cursor-pointer" />
                            </motion.button>
                        </div>
                    </div>

                    <div className="border-b">
                        <div className="flex">
                            <button
                                className={`px-6 py-3 font-medium ${activeTab === "incoming" ? "border-b-2" : ""}`}
                                style={{
                                    color: activeTab === "incoming" ? 'var(--color-accent)' : 'var(--color-secondary)',
                                    borderBottomColor: activeTab === "incoming" ? 'var(--color-accent)' : 'transparent'
                                }}
                                onClick={() => setActiveTab("incoming")}
                                disabled={processingIds.size > 0}
                            >
                                Incoming Requests ({processedIncoming.length})
                            </button>
                            <button
                                className={`px-6 py-3 font-medium ${activeTab === "outgoing" ? "border-b-2" : ""}`}
                                style={{
                                    color: activeTab === "outgoing" ? 'var(--color-accent)' : 'var(--color-secondary)',
                                    borderBottomColor: activeTab === "outgoing" ? 'var(--color-accent)' : 'transparent'
                                }}
                                onClick={() => setActiveTab("outgoing")}
                                disabled={processingIds.size > 0}
                            >
                                Outgoing Requests ({processedOutgoing.length})
                            </button>
                        </div>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {activeTab === "incoming" && (
                            <div>
                                {processedIncoming.length === 0 ? (
                                    <div className="text-center py-8">
                                        <AlertCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--color-secondary)' }} />
                                        <p style={{ color: 'var(--color-secondary)' }}>No incoming requests</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {processedIncoming.map((request) => (
                                            <div key={request.id} className="border rounded-lg p-4" style={{ borderColor: 'var(--color-neutral)' }}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={request.requesterPlan?.user?.image || "https://via.placeholder.com/100"}
                                                            className="w-12 h-12 rounded-full object-cover border-2"
                                                            style={{ borderColor: 'var(--color-neutral)' }}
                                                            alt={request.requesterPlan?.user?.fullName || "User"}
                                                            loading="lazy"
                                                        />
                                                        <div>
                                                            <h4 className="font-semibold" style={{ color: 'var(--color-foreground)' }}>
                                                                {request.requesterPlan?.user?.fullName}
                                                            </h4>
                                                            <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                                                                Traveling to {request.requesterPlan?.destination}
                                                            </p>
                                                            <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                                                                {request.requesterPlan?.date} {request.requesterPlan?.time && `at ${request.requesterPlan?.time}`}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {getStatusBadge(request.status)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {request.status === "pending" && (
                                                        <div className="flex gap-3">
                                                            <motion.button
                                                                whileHover={{ scale: processingIds.has(request.id) ? 1 : 1.05 }}
                                                                whileTap={{ scale: processingIds.has(request.id) ? 1 : 0.95 }}
                                                                onClick={() => handleAction(
                                                                    request.id,
                                                                    request.trip_id,
                                                                    request.matched_trip_id,
                                                                    onAcceptRequest
                                                                )}
                                                                className="px-4 py-2 rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                                                                style={{ backgroundColor: 'var(--color-accent)', opacity: processingIds.has(request.id) ? 0.7 : 1 }}
                                                                title="Accept Request"
                                                                disabled={processingIds.has(request.id)}
                                                            >
                                                                {processingIds.has(request.id) ? (
                                                                    <Loader2 size={16} className="animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <UserCheck size={16} />
                                                                        <span>Approve</span>
                                                                    </>
                                                                )}
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: processingIds.has(request.id) ? 1 : 1.05 }}
                                                                whileTap={{ scale: processingIds.has(request.id) ? 1 : 0.95 }}
                                                                onClick={() => handleAction(
                                                                    request.id,
                                                                    request.trip_id,
                                                                    request.matched_trip_id,
                                                                    onRejectRequest
                                                                )}
                                                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:bg-red-500 hover:text-white"
                                                                style={{ opacity: processingIds.has(request.id) ? 0.7 : 1 }}
                                                                title="Reject Request"
                                                                disabled={processingIds.has(request.id)}
                                                            >
                                                                {processingIds.has(request.id) ? (
                                                                    <Loader2 size={16} className="animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <UserX size={16} />
                                                                        <span>Reject</span>
                                                                    </>
                                                                )}
                                                            </motion.button>
                                                        </div>
                                                    )}
                                                    {request.status === "accepted" && (
                                                        <div className="flex items-center gap-3">
                                                            {request.requesterPlan?.user?.whatsapp && (
                                                                <motion.a
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    href={`https://wa.me/${request.requesterPlan.user.whatsapp.replace(/[^0-9]/g, '')}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-4 py-2 rounded-lg bg-green-500 text-white flex items-center gap-2 shadow-md font-medium text-sm"
                                                                    title="Contact on WhatsApp"
                                                                >
                                                                    <FaWhatsapp size={18} />
                                                                    WhatsApp
                                                                </motion.a>
                                                            )}
                                                            {request.requesterPlan?.user?.email && (
                                                                <motion.a
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    href={`mailto:${request.requesterPlan.user.email}`}
                                                                    className="px-4 py-2 rounded-lg bg-blue-500 text-white flex items-center gap-2 shadow-md font-medium text-sm"
                                                                    title="Send Email"
                                                                >
                                                                    <Mail size={18} />
                                                                    Email
                                                                </motion.a>
                                                            )}
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Connected ✓
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "outgoing" && (
                            <div>
                                {processedOutgoing.length === 0 ? (
                                    <div className="text-center py-8">
                                        <AlertCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--color-secondary)' }} />
                                        <p style={{ color: 'var(--color-secondary)' }}>No outgoing requests</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {processedOutgoing.map((request) => (
                                            <div key={request.id} className="border rounded-lg p-4" style={{ borderColor: 'var(--color-neutral)' }}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={request.receiverPlan?.user?.image || "https://via.placeholder.com/100"}
                                                            className="w-12 h-12 rounded-full object-cover border-2"
                                                            style={{ borderColor: 'var(--color-neutral)' }}
                                                            alt={request.receiverPlan?.user?.fullName || "User"}
                                                            loading="lazy"
                                                        />
                                                        <div>
                                                            <h4 className="font-semibold" style={{ color: 'var(--color-foreground)' }}>
                                                                {request.receiverPlan?.user?.fullName}
                                                            </h4>
                                                            <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                                                                Traveling to {request.receiverPlan?.destination}
                                                            </p>
                                                            <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                                                                {request.receiverPlan?.date} {request.receiverPlan?.time && `at ${request.receiverPlan?.time}`}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {getStatusBadge(request.status)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {request.status === "accepted" && (
                                                        <div className="flex items-center gap-2">
                                                            {request.receiverPlan?.user?.whatsapp && (
                                                                <motion.a
                                                                    whileHover={{ scale: 1.2 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    href={`https://wa.me/${request.receiverPlan.user.whatsapp}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-green-600"
                                                                    title="Contact on WhatsApp"
                                                                >
                                                                    <FaWhatsapp size={20} />
                                                                </motion.a>
                                                            )}
                                                            {request.receiverPlan?.user?.phone && (
                                                                <motion.a
                                                                    whileHover={{ scale: 1.2 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    href={`tel:${request.receiverPlan.user.phone}`}
                                                                    className="text-blue-600"
                                                                    title="Call"
                                                                >
                                                                    <Phone size={20} />
                                                                </motion.a>
                                                            )}
                                                            {request.receiverPlan?.user?.email && (
                                                                <motion.a
                                                                    whileHover={{ scale: 1.2 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    href={`mailto:${request.receiverPlan.user.email}`}
                                                                    className="text-red-600"
                                                                    title="Email"
                                                                >
                                                                    <Mail size={20} />
                                                                </motion.a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
