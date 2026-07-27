import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, X, ShieldCheck } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { CategoryFilters } from './CategoryFilters';

const TABS = ['accommodations', 'buysell', 'events', 'travel', 'careers'];
const TAB_LABELS = { accommodations: 'Accommodations', buysell: 'Buy/Sell', events: 'Events', travel: 'Travel Partners', careers: 'Careers' };

const INITIAL_FILTERS = {
  accMinPrice: '', accMaxPrice: '', accType: '', accStayType: '', accFurnishing: '',
  bsMinPrice: '', bsMaxPrice: '', bsCategory: '',
  evCategory: '', evDate: '',
  trDestination: '',
  carPositionType: '', carWorkMode: '', carExperience: '',
};

export function SearchModal({ isOpen, onClose, selectedCountry }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('accommodations');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const executeSearch = () => {
    const params = new URLSearchParams();
    if (selectedCountry) {
      params.set('location', selectedCountry);
      params.set('country', selectedCountry);
    }
    if (query) {
      params.set('query', query);
      params.set('search', query);
    }

    if (activeTab === 'accommodations') {
      if (filters.accMinPrice) params.set('minPrice', filters.accMinPrice);
      if (filters.accMaxPrice) params.set('maxPrice', filters.accMaxPrice);
      if (filters.accType) params.append('accommodationType', filters.accType);
      if (filters.accStayType) params.set('stayType', filters.accStayType);
      if (filters.accFurnishing) params.set('furnishing', filters.accFurnishing);
      navigate(`/search?${params.toString()}`);
    } else if (activeTab === 'buysell') {
      if (filters.bsMinPrice) params.set('minPrice', filters.bsMinPrice);
      if (filters.bsMaxPrice) params.set('maxPrice', filters.bsMaxPrice);
      if (filters.bsCategory) params.set('category', filters.bsCategory);
      navigate(`/marketplace?${params.toString()}`);
    } else if (activeTab === 'events') {
      if (filters.evCategory) params.set('category', filters.evCategory);
      if (filters.evDate) params.set('date', filters.evDate);
      navigate(`/events?${params.toString()}`);
    } else if (activeTab === 'travel') {
      if (filters.trDestination) params.set('city', filters.trDestination);
      navigate(`/travel?${params.toString()}`);
    } else if (activeTab === 'careers') {
      if (filters.carPositionType) params.set('positionType', filters.carPositionType);
      if (filters.carWorkMode) params.set('workMode', filters.carWorkMode);
      if (filters.carExperience) params.set('experience', filters.carExperience);
      navigate(`/career?${params.toString()}`);
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-[#00162D]/40 z-[9999] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-[scaleUp_0.15s_ease-out] text-left">
        {/* Header with tabs */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center relative">
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer absolute left-4" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          <div className="w-full flex justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-bold text-slate-400 select-none overflow-x-auto whitespace-nowrap pl-10">
            {TABS.map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className={`pb-3 -mb-4 border-b-2 transition-colors cursor-pointer ${activeTab === tab ? 'text-[#00162D] border-[#00162D]' : 'border-transparent hover:text-[#00162D]'}`}>
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <div className="p-5 bg-slate-50/50 border-b border-slate-100">
          <div className="w-full bg-white border border-slate-200 rounded-xl flex items-center px-4 py-2.5 shadow-sm focus-within:border-slate-350 transition-all duration-150">
            <Search className="h-4.5 w-4.5 text-slate-400 shrink-0 mr-3.5" />
            <input type="text" placeholder="Filter keywords (e.g. rooms, visa, furniture, remote)..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:ring-0 outline-none" autoFocus />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Category filter panels */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <CategoryFilters activeTab={activeTab} filters={filters} onChange={handleChange} />
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
            <ShieldCheck className="h-4 w-4 text-[#CB2A26] stroke-[2.5]" />
            <span>Applying queries directly to NextKin relocation listings.</span>
          </div>
          <Button type="button" onClick={executeSearch} className="w-full sm:w-auto h-10 rounded-full bg-[#CB2A26] hover:bg-[#A9221F] text-white font-bold text-xs px-6 flex items-center justify-center border-0 cursor-pointer shadow-sm shrink-0">
            Search & Apply Filters
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
