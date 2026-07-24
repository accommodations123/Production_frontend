import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/utils';

export function SegmentedTabs({
  tabs = [],
  activeTab,
  onChange,
  className
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 w-full sm:w-auto gap-1 select-none',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00162D] z-10 whitespace-nowrap',
              isActive ? 'text-[#00162D]' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeSegmentedTab"
                className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-200/60 z-0"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {Icon && <Icon className={cn('w-4 h-4', isActive ? 'text-[#CB2A26]' : 'text-slate-400')} />}
              {tab.label}
              {tab.badge !== undefined && (
                <span className={cn('ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-black', isActive ? 'bg-[#CB2A26]/10 text-[#CB2A26]' : 'bg-slate-200 text-slate-600')}>
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
