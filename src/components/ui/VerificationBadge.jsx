import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VerificationBadge({ isVerified, className }) {
    if (isVerified) {
        return (
            <div className={cn("flex items-center gap-1 bg-blue-500/90 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm border border-blue-400/50", className)}>
                <ShieldCheck className="w-3 h-3 fill-current" />
                <span>Verified</span>
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-1 bg-gray-500/90 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm border border-gray-400/50", className)}>
            <ShieldAlert className="w-3 h-3 text-amber-300" />
            <span className="text-gray-100">Unverified</span>
        </div>
    );
}
