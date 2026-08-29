import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VerificationBadge({ isVerified = true, className }) {
    return (
        <div className={cn("flex items-center gap-1 bg-green-600/90 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm border border-green-400/50", className)}>
            <ShieldCheck className="w-3 h-3 fill-current" />
            <span>Verified</span>
        </div>
    );
}
