import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

export function Avatar({
  src,
  name = 'User',
  size = 'md',
  isVerified = false,
  isOnline = false,
  className
}) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base font-bold'
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  };

  return (
    <div className={cn('relative inline-flex shrink-0 select-none', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center bg-[#00162D] text-white font-extrabold border border-slate-200 shadow-xs',
          sizeClasses[size]
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {/* Online Active Indicator Dot */}
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
      )}

      {/* Verification Checkmark Overlay */}
      {isVerified && !isOnline && (
        <span className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 text-[#CB2A26] shadow-xs ring-1 ring-slate-200">
          <ShieldCheck className={cn('fill-current', iconSizes[size])} />
        </span>
      )}
    </div>
  );
}
