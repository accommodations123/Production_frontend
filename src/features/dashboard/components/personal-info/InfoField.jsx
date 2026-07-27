import { ExternalLink } from 'lucide-react';
import { CountryCodeSelect } from '@/shared/ui/CountryCodeSelect';

export function InfoField({ label, value, isEditing, onChange, name, type = 'text', placeholder, action, actionIcon: ActionIcon, prefix, iso, onPrefixChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-wider text-[#717171] ml-1 block">{label}</label>
      {isEditing ? (
        type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder || label}
            rows={4}
            className="w-full bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26] text-gray-900 transition-all resize-none"
          />
        ) : (
          <div className="flex gap-2">
            {prefix !== undefined && onPrefixChange && (
              <div className="w-[110px] flex-shrink-0">
                <CountryCodeSelect value={prefix} isoCode={iso} onChange={onPrefixChange} />
              </div>
            )}
            <input
              type={type}
              name={name}
              value={value}
              onChange={(e) => {
                let val = e.target.value;
                if (name === 'phone' || name === 'whatsapp' || name === 'zip') {
                  val = val.replace(/[^0-9]/g, '');
                  if (name === 'phone' || name === 'whatsapp') val = val.slice(0, 10);
                  if (name === 'zip') val = val.slice(0, 6);
                }
                onChange({ target: { name, value: val } });
              }}
              inputMode={name === 'phone' || name === 'whatsapp' || name === 'zip' ? 'numeric' : undefined}
              placeholder={placeholder || label}
              className="w-full h-11 bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26] text-gray-900 transition-all"
            />
          </div>
        )
      ) : (
        <div className="relative group w-full">
          <div className="px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-100 font-semibold text-gray-800 text-sm flex items-center justify-between min-h-[44px]">
            <span className="truncate">
              {prefix && value ? `${prefix} ${value}` : (value || <span className="text-gray-300 font-normal italic">Not specified</span>)}
            </span>
            {action && value && (
              <button
                type="button"
                onClick={() => action(prefix ? `${prefix}${value}` : value)}
                className="p-1.5 bg-white border border-gray-100 rounded-lg shadow-sm text-blue-600 hover:text-white hover:bg-blue-600 transition-all flex items-center justify-center shrink-0"
                title="Open"
              >
                {ActionIcon ? <ActionIcon size={12} /> : <ExternalLink size={12} />}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
