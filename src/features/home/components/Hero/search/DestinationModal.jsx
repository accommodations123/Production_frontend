import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';

const COUNTRIES = [
  { name: 'India', flag: '\u{1F1EE}\u{1F1F3}' },
  { name: 'United States', flag: '\u{1F1FA}\u{1F1F8}' },
  { name: 'South Africa', flag: '\u{1F1FF}\u{1F1E6}' },
];

export function DestinationModal({ isOpen, onClose, selectedCountry, onSelect }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-[#00162D]/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col animate-[scaleUp_0.15s_ease-out] text-left">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center relative">
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer absolute left-4" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          <div className="w-full flex justify-center text-sm font-bold text-[#00162D]">Choose Destination</div>
        </div>
        <div className="p-6 space-y-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Suggested Regions</span>
          <div className="grid grid-cols-1 gap-2">
            {COUNTRIES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => onSelect(c.name)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all duration-150 border ${
                  selectedCountry === c.name
                    ? 'bg-[#F9EDD3]/20 border-[#D5CBA8] text-[#00162D]'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl leading-none">{c.flag}</span>
                  <span>{c.name}</span>
                </div>
                {selectedCountry === c.name && <Check className="h-4 w-4 text-[#CB2A26] shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
