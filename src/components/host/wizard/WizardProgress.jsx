import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WizardProgress({ steps, currentStep }) {
    return (
        <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent from-accent to-purple-400 mb-4">
                Become a Host
            </h1>

            <div className="flex items-center justify-between w-full max-w-3xl mx-auto mt-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10 -translate-y-1/2 rounded-full" />
                <div
                    className="absolute top-1/2 left-0 h-1 from-accent to-purple-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isActive = stepNum === currentStep;
                    const isCompleted = stepNum < currentStep;

                    return (
                        <div key={idx} className="relative flex flex-col items-center group">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 z-10",
                                    isActive ? "bg-accent border-accent text-white scale-110 shadow-lg shadow-accent/50" :
                                        isCompleted ? "bg-green-500 border-green-500 text-white" :
                                            "bg-[#00152d] border-white/20 text-gray-500"
                                )}
                            >
                                {isCompleted ? <Check className="h-5 w-5" /> : stepNum}
                            </div>
                            <span className={cn(
                                "absolute top-full mt-2 text-xs font-medium whitespace-nowrap transition-colors duration-300",
                                isActive ? "text-white" : "text-gray-500"
                            )}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
