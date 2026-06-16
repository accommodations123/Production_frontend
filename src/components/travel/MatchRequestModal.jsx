import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Loader2 } from "lucide-react";

export default function MatchRequestModal({ plan, onClose, onSendRequest }) {
    const [message, setMessage] = useState("");
    const [consentGiven, setConsentGiven] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSendRequest(plan.id, message, consentGiven);
            onClose();
        } finally {
            setIsSubmitting(false);
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
                    className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden"
                >



                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
