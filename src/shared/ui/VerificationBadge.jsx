import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

export function VerificationBadge({ isVerified, className }) {
    if (isVerified) {
        return (
            <div className={cn("flex items-center gap-1 bg-white/95 backdrop-blur-md text-gray-900 text-[10px] uppercase font-bold tracking-wide px-2.5 py-1 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.15)]", className)}>
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Verified</span>
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-1 bg-gray-900/80 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-wide px-2.5 py-1 rounded-full shadow-sm", className)}>
            <ShieldAlert className="w-3 h-3 text-amber-300" />
            <span>Unverified</span>
        </div>
    );
}
