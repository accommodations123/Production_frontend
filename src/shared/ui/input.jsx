import * as React from 'react';
import { cn } from '@/shared/utils/utils';

export const Input = React.forwardRef(function Input(
  { className, type = 'text', error, startIcon: StartIcon, endIcon: EndIcon, ...props },
  ref
) {
  return (
    <div className="w-full relative">
      <div className="relative flex items-center w-full">
        {StartIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            <StartIcon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-[#00162D] transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-[#00162D] focus-visible:ring-2 focus-visible:ring-[#00162D]/10 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            StartIcon && 'pl-10',
            EndIcon && 'pr-10',
            error && 'border-red-500 text-red-600 focus-visible:border-red-500 focus-visible:ring-red-500/10',
            className
          )}
          ref={ref}
          {...props}
        />
        {EndIcon && (
          <div className="absolute right-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            <EndIcon className="w-4 h-4" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
