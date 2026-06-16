// components/host/wizard/WizardNavigation.jsx
import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const WizardNavigation = ({ 
    currentStep, 
    totalSteps, 
    nextStep, 
    prevStep,
    hideNext = false 
}) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between pt-8 mt-8 border-t border-white/10"
        >
            <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    currentStep === 1
                        ? 'opacity-50 cursor-not-allowed text-[#f7eed7]/30'
                        : 'hover:bg-white/10 text-[#f7eed7]/80 hover:text-white cursor-pointer'
                }`}
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </button>

            {!hideNext && (
                <button
                    onClick={nextStep}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                        currentStep === totalSteps
                            ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                            : 'bg-accent hover:bg-accent/90 text-white cursor-pointer'
                    }`}
                >
                    {currentStep === totalSteps ? 'Submit' : 'Continue'}
                    {currentStep < totalSteps && <ArrowRight className="h-4 w-4" />}
                </button>
            )}
        </motion.div>
    );
};