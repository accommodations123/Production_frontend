import React, { useEffect, useContext, createContext } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

const DialogContext = createContext({});

export function Dialog({ children, open, onOpenChange }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && open) {
        onOpenChange?.(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogContent({ children, className }) {
  const { open, onOpenChange } = useContext(DialogContext);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200"
    >
      <div
        className="absolute inset-0"
        onClick={() => onOpenChange?.(false)}
      />
      <div
        className={cn(
          'relative z-50 w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xl text-[#00162D] animate-in zoom-in-95 duration-200',
          className
        )}
      >
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#00162D] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00162D] focus:ring-offset-1 cursor-pointer"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-left mb-4', className)}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }) {
  return (
    <h2
      className={cn('text-xl font-bold leading-tight tracking-tight text-[#00162D]', className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }) {
  return (
    <p
      className={cn('text-sm font-normal text-slate-500 leading-relaxed mt-1', className)}
      {...props}
    />
  );
}
