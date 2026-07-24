import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

export function VerificationBadge({ isVerified, label = 'Verified Host', className, variant = 'default' }) {
  if (!isVerified) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div
        title="Verified Member • ID & Community Checked"
        className={cn(
          'inline-flex items-center gap-1 bg-[#CB2A26]/10 text-[#CB2A26] border border-[#CB2A26]/20 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider select-none',
          className
        )}
      >
        <ShieldCheck className="w-3 h-3 text-[#CB2A26]" />
        <span>Verified</span>
      </div>
    );
  }

  return (
    <div
      title="Verified Host • Identity & Expat Recommendations Confirmed"
      className={cn(
        'inline-flex items-center gap-1.5 bg-[#00162D] text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-xs select-none',
        className
      )}
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-[#CB2A26]" />
      <span>{label}</span>
    </div>
  );
}
