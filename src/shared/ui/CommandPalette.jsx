import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ShoppingBag, Calendar, Plane, Users, PlusCircle, X } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

export function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose?.();
        } else {
          // If parent supports state toggle
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { label: 'Browse Verified Stays & Rooms', icon: MapPin, path: '/search', category: 'Accommodations' },
    { label: 'Find Immigration & Tax Experts', icon: Users, path: '/people', category: 'People Directory' },
    { label: 'Community Buy & Sell Marketplace', icon: ShoppingBag, path: '/marketplace', category: 'Marketplace' },
    { label: 'Cultural Festivals & Meetups', icon: Calendar, path: '/events', category: 'Events' },
    { label: 'Travel Partner Matching', icon: Plane, path: '/travel', category: 'Travel' },
    { label: 'Post a New Property Ad', icon: PlusCircle, path: '/host/property', category: 'Quick Action' }
  ];

  const filteredLinks = query
    ? quickLinks.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : quickLinks;

  const handleSelect = (path) => {
    navigate(path);
    onClose?.();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-50 w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-[#00162D]">
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stays, experts, marketplace items, or type a command... (Cmd+K)"
            className="w-full bg-transparent text-sm font-semibold text-[#00162D] placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#00162D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredLinks.length > 0 ? (
            filteredLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#00162D] group-hover:bg-[#CB2A26] group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#00162D] group-hover:text-[#CB2A26] transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs font-semibold">
              No matching modules or actions found for &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
          <span>Navigate with Keyboard</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
