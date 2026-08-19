import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, CheckCircle } from "lucide-react";
export default function MatchRequestModal({ plan, onClose, onSendRequest }) {
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
    const [message, setMessage] = useState("");
    const [consentGiven, setConsentGiven] = useState(false);

    const handleSubmit = () => {
        onSendRequest(plan.id, message, consentGiven);
        onClose();
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
                    className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--color-background)' }}
                >


                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <img
                                src={plan.user.image}
                                className="w-16 h-16 rounded-full object-cover border-2"
                                style={{ borderColor: 'var(--color-neutral)' }}
                                alt={plan.user.fullName}
                                loading="lazy"
                            />
                            <div>
                                <h3 className="font-bold text-lg" style={{ color: 'var(--color-foreground)' }}>{plan.user.fullName}</h3>
                                <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                                    Traveling to {plan.destination}
                                </p>
                                <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                                    {plan.date} at {formatTime(plan.time)}
                                </p>
                            </div>
                        </div>



                        <div className="mb-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={consentGiven}
                                    onChange={(e) => setConsentGiven(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                                    I consent to share my contact information with this traveler if they accept my request
                                </span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg font-medium"
                                style={{
                                    borderColor: 'var(--color-neutral)',
                                    color: 'var(--color-foreground)'
                                }}
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSubmit}
                                className="px-4 py-2 rounded-lg font-medium text-white"
                                style={{ backgroundColor: 'var(--color-accent)' }}
                            >
                                Send Request
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
