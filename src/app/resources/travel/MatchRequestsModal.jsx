import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, AlertCircle, CheckCircle, UserCheck, UserX, Phone, Mail, Loader2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
export default function MatchRequestsModal({ onClose, matches, plans, myTrips, onAcceptRequest, onRejectRequest }) {
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
    const [activeTab, setActiveTab] = useState("incoming"); // incoming, outgoing
    const [processingIds, setProcessingIds] = useState(new Set());

    const handleAction = async (id, actionFn) => {
        setProcessingIds(prev => new Set(prev).add(id));
        try {
            await actionFn(id);
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    // Get incoming requests (where current user's trip is the target)
    const incomingRequests = matches.filter(match =>
        myTrips.some(myTrip => myTrip.id === match.matched_trip_id)
    ).map(match => {
        // The requester is the OTHER trip
        const requesterPlan = plans.find(plan => plan.id === match.trip_id) || myTrips.find(p => p.id === match.trip_id);
        return { ...match, requesterPlan };
    }).filter(m => m.requesterPlan); // Ensure we found the other plan

    // Get outgoing requests (where current user's trip is the requester)
    const outgoingRequests = matches.filter(match =>
        myTrips.some(myTrip => myTrip.id === match.trip_id)
    ).map(match => {
        // The receiver is the OTHER trip
        const receiverPlan = plans.find(plan => plan.id === match.matched_trip_id) || myTrips.find(p => p.id === match.matched_trip_id);
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
                                Incoming Requests ({incomingRequests.length})
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
                                Outgoing Requests ({outgoingRequests.length})
                            </button>
                        </div>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {activeTab === "incoming" && (
                            <div>
                                {incomingRequests.length === 0 ? (
                                    <div className="text-center py-8">
                                        <AlertCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--color-secondary)' }} />
                                        <p style={{ color: 'var(--color-secondary)' }}>No incoming requests</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {incomingRequests.map((request) => (
                                            <div key={request.id} className="border rounded-lg p-4" style={{ borderColor: 'var(--color-neutral)' }}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={request.requesterPlan.user.image}
                                                            className="w-12 h-12 rounded-full object-cover border-2"
                                                            style={{ borderColor: 'var(--color-neutral)' }}
                                                            alt={request.requesterPlan.user.fullName}
                                                            loading="lazy"
                                                        />
                                                        <div>
                                                            <h4 className="font-semibold" style={{ color: 'var(--color-foreground)' }}>
                                                                {request.requesterPlan.user.fullName}
                                                            </h4>
                                                            <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                                                                Traveling to {request.requesterPlan.destination}
                                                            </p>
                                                            <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                                                                {request.requesterPlan.date} at {formatTime(request.requesterPlan.time)}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {getStatusBadge(request.status)}
                                                                {request.consent_given && (
                                                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                                                        <CheckCircle size={12} /> Consent Given
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {request.status === "pending" && (
                                                        <div className="flex gap-3">
                                                            <motion.button
                                                                whileHover={{ scale: processingIds.has(request.id) ? 1 : 1.05 }}
                                                                whileTap={{ scale: processingIds.has(request.id) ? 1 : 0.95 }}
                                                                onClick={() => handleAction(request.id, onAcceptRequest)}
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
                                                                onClick={() => handleAction(request.id, onRejectRequest)}
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
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "outgoing" && (
                            <div>
                                {outgoingRequests.length === 0 ? (
                                    <div className="text-center py-8">
                                        <AlertCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--color-secondary)' }} />
                                        <p style={{ color: 'var(--color-secondary)' }}>No outgoing requests</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {outgoingRequests.map((request) => (
                                            <div key={request.id} className="border rounded-lg p-4" style={{ borderColor: 'var(--color-neutral)' }}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={request.receiverPlan.user.image}
                                                            className="w-12 h-12 rounded-full object-cover border-2"
                                                            style={{ borderColor: 'var(--color-neutral)' }}
                                                            alt={request.receiverPlan.user.fullName}
                                                            loading="lazy"
                                                        />
                                                        <div>
                                                            <h4 className="font-semibold" style={{ color: 'var(--color-foreground)' }}>
                                                                {request.receiverPlan.user.fullName}
                                                            </h4>
                                                            <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                                                                Traveling to {request.receiverPlan.destination}
                                                            </p>
                                                            <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                                                                {request.receiverPlan.date} at {formatTime(request.receiverPlan.time)}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {getStatusBadge(request.status)}
                                                                {request.consent_given && (
                                                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                                                        <CheckCircle size={12} /> Consent Given
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {request.status === "accepted" && (
                                                        <div className="flex items-center gap-2">
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
                                                            <motion.a
                                                                whileHover={{ scale: 1.2 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                href={`tel:${request.receiverPlan.user.phone}`}
                                                                className="text-blue-600"
                                                                title="Call"
                                                            >
                                                                <Phone size={20} />
                                                            </motion.a>
                                                            <motion.a
                                                                whileHover={{ scale: 1.2 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                href={`mailto:${request.receiverPlan.user.email}`}
                                                                className="text-red-600"
                                                                title="Email"
                                                            >
                                                                <Mail size={20} />
                                                            </motion.a>
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
