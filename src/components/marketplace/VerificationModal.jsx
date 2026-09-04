import React, { useState } from 'react';
import { ShieldCheck, Mail, Phone, FileText, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

export function VerificationModal({ isOpen, onClose, onComplete }) {
    const [step, setStep] = useState(1);

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
        else onComplete();
    };

    const progressValue = step === 1 ? 33 : step === 2 ? 66 : 100;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="p-0 overflow-hidden max-w-md rounded-2xl border-border bg-card">
                {/* Header */}
                <div className="bg-primary p-6 text-primary-foreground text-center">
                    <div className="h-14 w-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                        <ShieldCheck className="h-7 w-7 text-white" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-white text-center">Seller Verification</DialogTitle>
                    <DialogDescription className="text-white/80 text-xs mt-1 text-center">
                        Verify your identity to start selling safely.
                    </DialogDescription>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pt-4">
                    <div className="flex justify-between text-xs text-muted-foreground font-semibold mb-2">
                        <span>Step {step} of 3</span>
                        <span>{step === 1 ? "Email" : step === 2 ? "Phone" : "ID Proof"}</span>
                    </div>
                    <Progress value={progressValue} className="h-1.5" />
                </div>

                {/* Content */}
                <div className="p-6 pt-4 min-h-[220px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                className="space-y-4 flex-1"
                            >
                                <div className="text-center mb-3">
                                    <h4 className="font-bold text-foreground text-sm">Email Verification</h4>
                                    <p className="text-xs text-muted-foreground">We'll send a one-time passcode to your email.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-foreground">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9 h-11" placeholder="you@example.com" type="email" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                className="space-y-4 flex-1"
                            >
                                <div className="text-center mb-3">
                                    <h4 className="font-bold text-foreground text-sm">Phone Verification</h4>
                                    <p className="text-xs text-muted-foreground">Secure your account and buyer inquiries.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-foreground">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9 h-11" placeholder="+1 (555) 000-0000" type="tel" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                className="space-y-4 flex-1"
                            >
                                <div className="text-center mb-3">
                                    <h4 className="font-bold text-foreground text-sm">ID Verification (Optional)</h4>
                                    <p className="text-xs text-muted-foreground">Upload ID to receive the "Verified Seller" badge.</p>
                                </div>
                                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent/40 cursor-pointer transition-colors bg-muted/20">
                                    <FileText className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-xs font-semibold text-foreground">Upload ID / Passport</p>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-emerald-800 text-xs font-medium">
                                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <span>Verified sellers receive significantly higher community trust!</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-6 flex gap-3">
                        <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button onClick={nextStep} variant="accent" className="flex-1 font-semibold">
                            {step === 3 ? 'Finish' : 'Next Step'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}