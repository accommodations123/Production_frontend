import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

export function Accordion({ items = [], allowMultiple = false, className }) {
  const [openIndexes, setOpenIndexes] = useState([0]);

  const toggleItem = (index) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div className={cn('space-y-3 w-full', className)}>
      {items.map((item, idx) => {
        const isOpen = openIndexes.includes(idx);
        return (
          <div
            key={item.id || idx}
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-colors"
          >
            <button
              type="button"
              onClick={() => toggleItem(idx)}
              aria-expanded={isOpen}
              className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-[#00162D] text-sm sm:text-base hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span>{item.title}</span>
              <ChevronDown
                className={cn('w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-3', isOpen && 'rotate-180 text-[#CB2A26]')}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <div className="px-5 pb-4 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 font-normal">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
