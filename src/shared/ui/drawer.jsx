import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

export function Drawer({
  isOpen,
  onClose,
  position = 'bottom',
  title,
  children,
  className
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const variants = {
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
      container: 'fixed inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl border-t'
    },
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
      container: 'fixed inset-y-0 right-0 h-full w-full sm:w-[440px] border-l'
    },
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
      container: 'fixed inset-y-0 left-0 h-full w-full sm:w-[320px] border-r'
    }
  };

  const selected = variants[position] || variants.bottom;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={selected.initial}
            animate={selected.animate}
            exit={selected.exit}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={cn(
              'z-50 bg-white border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden',
              selected.container,
              className
            )}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              {position === 'bottom' && (
                <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto absolute top-2.5 left-1/2 -translate-x-1/2" />
              )}
              <h3 className="text-base font-extrabold text-[#00162D] tracking-tight">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-[#00162D] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Close Drawer</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
