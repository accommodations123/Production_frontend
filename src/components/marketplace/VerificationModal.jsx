import React, { useState } from 'react';
import { ShieldCheck, Mail, Phone, FileText, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export function VerificationModal({ isOpen, onClose, onComplete }) {
    const [step, setStep] = useState(1);

    if (!isOpen) return null;

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
        else onComplete();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                {/* Header */}
                <div className="bg-primary p-4 sm:p-6 text-white text-center">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 backdrop-blur-md">
                        <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold">Seller Verification</h2>
                    <p className="text-white/80 text-xs sm:text-sm mt-1">Verify your identity to start selling.</p>
                </div>

                {/* Steps Indicator */}
                <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 w-6 sm:w-8 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-gray-200'}`} />
                    ))}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 min-h-[200px] sm:min-h-[250px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-3 sm:space-y-4 flex-1"
                            >
                                <div className="text-center mb-3 sm:mb-4">
                                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">Email Verification</h3>
                                    <p className="text-xs sm:text-sm text-gray-500">We'll send a code to your email.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs sm:text-sm font-medium text-gray-700">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input className="pl-9 border border-gray-300 text-gray-900 h-9 sm:h-10 text-sm" placeholder="you@example.com" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-3 sm:space-y-4 flex-1"
                            >
                                <div className="text-center mb-3 sm:mb-4">
                                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">Phone Verification</h3>
                                    <p className="text-xs sm:text-sm text-gray-500">Secure your account with 2FA.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs sm:text-sm font-medium text-gray-700">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input className="pl-9 border border-gray-300 text-gray-900 h-9 sm:h-10 text-sm" placeholder="+1 (555) 000-0000" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-3 sm:space-y-4 flex-1"
                            >
                                <div className="text-center mb-3 sm:mb-4">
                                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">ID Verification (Optional)</h3>
                                    <p className="text-xs sm:text-sm text-gray-500">Upload ID to get the "Verified Seller" badge.</p>
                                </div>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 sm:p-6 text-center hover:border-primary/50 cursor-pointer transition-colors">
                                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-xs sm:text-sm font-medium text-gray-900">Upload ID / Passport</p>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700 text-xs">
                                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span>Verified sellers get 40% more views!</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3">
                        <Button variant="outline" onClick={onClose} className="flex-1 text-sm sm:text-base">Cancel</Button>
                        <Button onClick={nextStep} className="flex-1 bg-primary hover:bg-primary/90 text-white text-sm sm:text-base">
                            {step === 3 ? 'Finish' : 'Next Step'}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}