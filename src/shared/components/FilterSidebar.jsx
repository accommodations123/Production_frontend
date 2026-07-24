import React from 'react';
import { SlidersHorizontal, RotateCcw, ShieldCheck, MessageSquareCode } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/utils/utils';

export function FilterSidebar({
  filters = {},
  onChange,
  onReset,
  totalResultsCount = 0,
  className
}) {
  const accommodationTypes = ['Private Room', 'Shared Flat', 'Studio Apartment', 'Paying Guest (PG)'];
  const stayTypes = ['Short Term (< 6mo)', 'Long Term (> 6mo)', 'Flexible Term'];
  const furnishings = ['Fully Furnished', 'Semi-Furnished', 'Unfurnished'];

  const handleToggleArray = (field, item) => {
    const currentList = filters[field] || [];
    const updated = currentList.includes(item)
      ? currentList.filter((i) => i !== item)
      : [...currentList, item];
    onChange?.({ ...filters, [field]: updated });
  };

  return (
    <aside className={cn('w-full bg-white rounded-2xl border border-slate-200 p-5 space-y-6 text-[#00162D] text-left select-none shadow-2xs', className)}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#CB2A26]" />
          <h3 className="text-base font-extrabold tracking-tight">Search Filters</h3>
          {totalResultsCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {totalResultsCount}
            </Badge>
          )}
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-extrabold text-slate-400 hover:text-[#CB2A26] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Verified & Direct Contact Toggles */}
      <div className="space-y-3 pb-4 border-b border-slate-100">
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#CB2A26]" />
            <span className="text-xs font-extrabold text-[#00162D]">Verified Hosts Only</span>
          </div>
          <input
            type="checkbox"
            checked={!!filters.verifiedOnly}
            onChange={(e) => onChange?.({ ...filters, verifiedOnly: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-[#CB2A26] focus:ring-[#00162D] cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-2">
            <MessageSquareCode className="w-4 h-4 text-[#25D366]" />
            <span className="text-xs font-extrabold text-[#00162D]">Direct WhatsApp Available</span>
          </div>
          <input
            type="checkbox"
            checked={!!filters.directContactOnly}
            onChange={(e) => onChange?.({ ...filters, directContactOnly: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-[#25D366] focus:ring-[#00162D] cursor-pointer"
          />
        </label>
      </div>

      {/* Monthly Rent Range */}
      <div className="space-y-2.5 pb-4 border-b border-slate-100">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
          Monthly Rent Range
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">Min Price</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice || ''}
              onChange={(e) => onChange?.({ ...filters, minPrice: e.target.value })}
              className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs font-bold text-[#00162D] outline-none focus:border-[#00162D]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">Max Price</label>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => onChange?.({ ...filters, maxPrice: e.target.value })}
              className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs font-bold text-[#00162D] outline-none focus:border-[#00162D]"
            />
          </div>
        </div>
      </div>

      {/* Accommodation Type */}
      <div className="space-y-2.5 pb-4 border-b border-slate-100">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
          Property Type
        </span>
        <div className="space-y-2">
          {accommodationTypes.map((type) => {
            const isChecked = (filters.types || []).includes(type);
            return (
              <label key={type} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer hover:text-[#00162D]">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleArray('types', type)}
                  className="w-4 h-4 rounded border-slate-300 text-[#CB2A26] focus:ring-[#00162D] cursor-pointer"
                />
                <span>{type}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Stay Duration */}
      <div className="space-y-2.5 pb-4 border-b border-slate-100">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
          Stay Term
        </span>
        <div className="space-y-2">
          {stayTypes.map((term) => {
            const isChecked = (filters.stayTerms || []).includes(term);
            return (
              <label key={term} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer hover:text-[#00162D]">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleArray('stayTerms', term)}
                  className="w-4 h-4 rounded border-slate-300 text-[#CB2A26] focus:ring-[#00162D] cursor-pointer"
                />
                <span>{term}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Furnishing */}
      <div className="space-y-2.5">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
          Furnishing Status
        </span>
        <div className="space-y-2">
          {furnishings.map((furnish) => {
            const isChecked = (filters.furnishings || []).includes(furnish);
            return (
              <label key={furnish} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer hover:text-[#00162D]">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleArray('furnishings', furnish)}
                  className="w-4 h-4 rounded border-slate-300 text-[#CB2A26] focus:ring-[#00162D] cursor-pointer"
                />
                <span>{furnish}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <Button variant="primary" size="lg" className="w-full rounded-xl text-xs font-extrabold">
        Apply Filters ({totalResultsCount})
      </Button>
    </aside>
  );
}
