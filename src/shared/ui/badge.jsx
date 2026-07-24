import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/shared/utils/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-[#00162D] focus:ring-offset-1 select-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#CB2A26] text-white',
        crimson: 'border-transparent bg-[#CB2A26] text-white',
        navy: 'border-transparent bg-[#00162D] text-white',
        accent: 'bg-[#CB2A26]/10 text-[#CB2A26] border border-[#CB2A26]/20',
        secondary: 'bg-slate-100 text-[#00162D] border border-slate-200/80',
        success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
        outline: 'border-slate-200 bg-white text-slate-700'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

export function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
