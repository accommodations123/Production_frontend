import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, Check, X, ShieldCheck, ChevronRight } from 'lucide-react';

import { Button } from '@/shared/ui/button';

export function HeroSearchCard() {
  const navigate = useNavigate();

  // Primary Console States
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [query, setQuery] = useState('');

  // Modals visibility state
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Active Category Tab in Search Modal
  const [activeCategoryTab, setActiveCategoryTab] = useState('accommodations');

  // Modal Query (common search input in modal header)
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // Category Specific Filter States
  // 1. Accommodations
  const [accMinPrice, setAccMinPrice] = useState('');
  const [accMaxPrice, setAccMaxPrice] = useState('');
  const [accType, setAccType] = useState('');
  const [accStayType, setAccStayType] = useState('');
  const [accFurnishing, setAccFurnishing] = useState('');

  // 2. Buy / Sell
  const [bsMinPrice, setBsMinPrice] = useState('');
  const [bsMaxPrice, setBsMaxPrice] = useState('');
  const [bsCategory, setBsCategory] = useState('');

  // 3. Events
  const [evCategory, setEvCategory] = useState('');
  const [evDate, setEvDate] = useState('');

  // 4. Travel
  const [trDestination, setTrDestination] = useState('');

  // 5. Careers
  const [carPositionType, setCarPositionType] = useState('');
  const [carWorkMode, setCarWorkMode] = useState('');
  const [carExperience, setCarExperience] = useState('');

  const countries = [
    { name: 'India', flag: '🇮🇳' },
    { name: 'United States', flag: '🇺🇸' },
    { name: 'South Africa', flag: '🇿🇦' }
  ];

  // Close modals on Escape key press
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setIsCountryModalOpen(false);
        setIsSearchModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  const handleCountrySelect = (countryName) => {
    setSelectedCountry(countryName);
    setIsCountryModalOpen(false);
  };

  const executeModalSearch = () => {
    const params = new URLSearchParams();
    
    // Add default location context
    if (selectedCountry) {
      params.set('location', selectedCountry);
      // Marketplace uses country param
      params.set('country', selectedCountry);
    }

    // Add generic search text
    if (modalSearchQuery) {
      params.set('query', modalSearchQuery);
      params.set('search', modalSearchQuery);
    }

    if (activeCategoryTab === 'accommodations') {
      if (accMinPrice) params.set('minPrice', accMinPrice);
      if (accMaxPrice) params.set('maxPrice', accMaxPrice);
      if (accType) params.append('accommodationType', accType);
      if (accStayType) params.set('stayType', accStayType);
      if (accFurnishing) params.set('furnishing', accFurnishing);
      
      setQuery(modalSearchQuery || 'Accommodations');
      setIsSearchModalOpen(false);
      navigate(`/search?${params.toString()}`);
    } 
    else if (activeCategoryTab === 'buysell') {
      if (bsMinPrice) params.set('minPrice', bsMinPrice);
      if (bsMaxPrice) params.set('maxPrice', bsMaxPrice);
      if (bsCategory) params.set('category', bsCategory);
      
      setQuery(modalSearchQuery || 'Buy & Sell');
      setIsSearchModalOpen(false);
      navigate(`/marketplace?${params.toString()}`);
    } 
    else if (activeCategoryTab === 'events') {
      if (evCategory) params.set('category', evCategory);
      if (evDate) params.set('date', evDate);
      
      setQuery(modalSearchQuery || 'Events');
      setIsSearchModalOpen(false);
      navigate(`/events?${params.toString()}`);
    } 
    else if (activeCategoryTab === 'travel') {
      if (trDestination) params.set('city', trDestination);
      
      setQuery(modalSearchQuery || 'Travel Partners');
      setIsSearchModalOpen(false);
      navigate(`/travel?${params.toString()}`);
    } 
    else if (activeCategoryTab === 'careers') {
      if (carPositionType) params.set('positionType', carPositionType);
      if (carWorkMode) params.set('workMode', carWorkMode);
      if (carExperience) params.set('experience', carExperience);
      
      setQuery(modalSearchQuery || 'Careers');
      setIsSearchModalOpen(false);
      navigate(`/career?${params.toString()}`);
    }
  };

  const executeConsoleSearch = () => {
    // Quick routing from the closed horizontal console search button
    const isStaySearch =
      query.toLowerCase().includes('stay') ||
      query.toLowerCase().includes('rent') ||
      query.toLowerCase().includes('room') ||
      query.toLowerCase().includes('house') ||
      query.toLowerCase().includes('apartment') ||
      query.toLowerCase().includes('flat') ||
      query.toLowerCase().includes('studio') ||
      query.toLowerCase().includes('housing') ||
      !query;

    const params = new URLSearchParams();
    if (selectedCountry) {
      params.set('location', selectedCountry);
      params.set('country', selectedCountry);
    }
    if (query) {
      params.set('query', query);
      params.set('search', query);
    }

    if (isStaySearch) {
      navigate(`/search?${params.toString()}`);
    } else {
      navigate(`/people?${params.toString()}`);
    }
  };

  const activeCountryObj = countries.find((c) => c.name === selectedCountry) || countries[0];

  return (
    <div className="w-full max-w-3xl mx-auto">
      
      {/* 1. Main Horizontal Console */}
      <div className="w-full bg-white border border-slate-200 shadow-sm rounded-full flex items-center p-1.5 focus-within:border-slate-350 transition-all duration-150 relative">
        
        {/* Destination Click Trigger */}
        <div
          onClick={() => setIsCountryModalOpen(true)}
          className="flex items-center justify-between gap-2 px-5 py-2.5 w-2/5 cursor-pointer hover:bg-slate-50 rounded-full select-none"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base shrink-0">{activeCountryObj.flag}</span>
            <div className="text-left min-w-0">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Destination
              </span>
              <span className="block text-xs sm:text-sm font-extrabold text-[#00162D] truncate">
                {selectedCountry}
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 rotate-90" />
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-8 bg-slate-200 shrink-0" />

        {/* Search Modal Trigger */}
        <div
          onClick={() => {
            setIsSearchModalOpen(true);
            setModalSearchQuery(query);
          }}
          className="flex items-center gap-2 px-5 py-2.5 flex-1 cursor-pointer hover:bg-slate-50 rounded-full text-left"
        >
          <Search className="h-4.5 w-4.5 text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
              What do you need?
            </span>
            <span className="block text-xs sm:text-sm font-semibold text-slate-700 truncate mt-0.5 select-none">
              {query || 'Search accommodation, experts, services...'}
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <Button
          type="button"
          onClick={executeConsoleSearch}
          className="h-10 rounded-full bg-[#CB2A26] hover:bg-[#A9221F] text-white font-bold text-xs px-6 flex items-center justify-center border-0 cursor-pointer shadow-sm shrink-0"
        >
          Search
        </Button>
      </div>

      {/* 2. Destination Country Modal (Airbnb-style overlay modal via React Portal) */}
      {isCountryModalOpen && createPortal(
        <div className="fixed inset-0 bg-[#00162D]/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col animate-[scaleUp_0.15s_ease-out] text-left">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center relative">
              <button
                type="button"
                onClick={() => setIsCountryModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer absolute left-4"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="w-full flex justify-center text-sm font-bold text-[#00162D]">
                Choose Destination
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Suggested Regions
              </span>
              <div className="grid grid-cols-1 gap-2">
                {countries.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleCountrySelect(c.name)}
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
                    {selectedCountry === c.name && (
                      <Check className="h-4 w-4 text-[#CB2A26] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* 3. Search Autocomplete Modal (Airbnb-style overlay modal via React Portal with working filters) */}
      {isSearchModalOpen && createPortal(
        <div className="fixed inset-0 bg-[#00162D]/40 z-[9999] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-[scaleUp_0.15s_ease-out] text-left">
            
            {/* Modal Header containing Route category tabs */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center relative">
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer absolute left-4"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="w-full flex justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-bold text-slate-400 select-none overflow-x-auto whitespace-nowrap pl-10">
                <button
                  type="button"
                  onClick={() => setActiveCategoryTab('accommodations')}
                  className={`pb-3 -mb-4 border-b-2 transition-colors cursor-pointer ${
                    activeCategoryTab === 'accommodations'
                      ? 'text-[#00162D] border-[#00162D]'
                      : 'border-transparent hover:text-[#00162D]'
                  }`}
                >
                  Accommodations
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryTab('buysell')}
                  className={`pb-3 -mb-4 border-b-2 transition-colors cursor-pointer ${
                    activeCategoryTab === 'buysell'
                      ? 'text-[#00162D] border-[#00162D]'
                      : 'border-transparent hover:text-[#00162D]'
                  }`}
                >
                  Buy/Sell
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryTab('events')}
                  className={`pb-3 -mb-4 border-b-2 transition-colors cursor-pointer ${
                    activeCategoryTab === 'events'
                      ? 'text-[#00162D] border-[#00162D]'
                      : 'border-transparent hover:text-[#00162D]'
                  }`}
                >
                  Events
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryTab('travel')}
                  className={`pb-3 -mb-4 border-b-2 transition-colors cursor-pointer ${
                    activeCategoryTab === 'travel'
                      ? 'text-[#00162D] border-[#00162D]'
                      : 'border-transparent hover:text-[#00162D]'
                  }`}
                >
                  Travel Partners
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryTab('careers')}
                  className={`pb-3 -mb-4 border-b-2 transition-colors cursor-pointer ${
                    activeCategoryTab === 'careers'
                      ? 'text-[#00162D] border-[#00162D]'
                      : 'border-transparent hover:text-[#00162D]'
                  }`}
                >
                  Careers
                </button>
              </div>
            </div>

            {/* Modal search text query header */}
            <div className="p-5 bg-slate-50/50 border-b border-slate-100">
              <div className="w-full bg-white border border-slate-200 rounded-xl flex items-center px-4 py-2.5 shadow-sm focus-within:border-slate-350 transition-all duration-150">
                <Search className="h-4.5 w-4.5 text-slate-400 shrink-0 mr-3.5" />
                <input
                  type="text"
                  placeholder="Filter keywords (e.g. rooms, visa, furniture, remote)..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:ring-0 outline-none"
                  autoFocus
                />
                {modalSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setModalSearchQuery('')}
                    className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body containing category-specific filter panels */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Category Tab 1: Accommodations */}
              {activeCategoryTab === 'accommodations' && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-2">
                    Accommodation Settings
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Price Range */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Monthly Rent range
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min price"
                          value={accMinPrice}
                          onChange={(e) => setAccMinPrice(e.target.value)}
                          className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350"
                        />
                        <input
                          type="number"
                          placeholder="Max price"
                          value={accMaxPrice}
                          onChange={(e) => setAccMaxPrice(e.target.value)}
                          className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350"
                        />
                      </div>
                    </div>

                    {/* Accommodation Type */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Accommodation Type
                      </label>
                      <select
                        value={accType}
                        onChange={(e) => setAccType(e.target.value)}
                        className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350 cursor-pointer"
                      >
                        <option value="">Any Type</option>
                        <option value="Room">Private Room</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Studio">Studio Flat</option>
                        <option value="PG">Paying Guest (PG)</option>
                      </select>
                    </div>

                    {/* Stay Type */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Stay Duration
                      </label>
                      <select
                        value={accStayType}
                        onChange={(e) => setAccStayType(e.target.value)}
                        className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350 cursor-pointer"
                      >
                        <option value="">Any Duration</option>
                        <option value="Short Term">Short Term (&lt; 6mo)</option>
                        <option value="Long Term">Long Term (&gt; 6mo)</option>
                        <option value="Flexible">Flexible Term</option>
                      </select>
                    </div>

                    {/* Furnishing */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Furnishing Status
                      </label>
                      <select
                        value={accFurnishing}
                        onChange={(e) => setAccFurnishing(e.target.value)}
                        className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350 cursor-pointer"
                      >
                        <option value="">Any Furnishing</option>
                        <option value="Furnished">Fully Furnished</option>
                        <option value="Semi-Furnished">Semi-Furnished</option>
                        <option value="Unfurnished">Unfurnished</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Tab 2: Buy / Sell */}
              {activeCategoryTab === 'buysell' && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-2">
                    Marketplace Item Settings
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Price Range */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Price Range
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min price"
                          value={bsMinPrice}
                          onChange={(e) => setBsMinPrice(e.target.value)}
                          className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350"
                        />
                        <input
                          type="number"
                          placeholder="Max price"
                          value={bsMaxPrice}
                          onChange={(e) => setBsMaxPrice(e.target.value)}
                          className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350"
                        />
                      </div>
                    </div>

                    {/* Item Category */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Item Category
                      </label>
                      <select
                        value={bsCategory}
                        onChange={(e) => setBsCategory(e.target.value)}
                        className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350 cursor-pointer"
                      >
                        <option value="">Any Category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Books">Books</option>
                        <option value="Clothing">Clothing</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Tab 3: Events */}
              {activeCategoryTab === 'events' && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-2">
                    Event Settings
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Event Type / Category */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Event Category
                      </label>
                      <select
                        value={evCategory}
                        onChange={(e) => setEvCategory(e.target.value)}
                        className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350 cursor-pointer"
                      >
                        <option value="">Any Category</option>
                        <option value="meetup">Meetup / Community</option>
                        <option value="party">Party / Social</option>
                        <option value="festival">Music & Festival</option>
                        <option value="workshop">Class & Workshop</option>
                        <option value="sports">Sports / Wellness</option>
                        <option value="online">Online webinar</option>
                      </select>
                    </div>

                    {/* Event Date */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Date
                      </label>
                      <input
                        type="date"
                        value={evDate}
                        onChange={(e) => setEvDate(e.target.value)}
                        className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Category Tab 4: Travel Partners */}
              {activeCategoryTab === 'travel' && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-2">
                    Travel Plan Settings
                  </span>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Destination City */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Target State or City
                      </label>
                      <input
                        type="text"
                        placeholder="Enter travel destination (e.g. California, Berlin)..."
                        value={trDestination}
                        onChange={(e) => setTrDestination(e.target.value)}
                        className="w-full bg-transparent border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-700 outline-none focus:border-slate-350"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Category Tab 5: Careers */}
              {activeCategoryTab === 'careers' && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-2">
                    Job Position Settings
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Position Type */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Job Type
                      </label>
                      <select
                        value={carPositionType}
                        onChange={(e) => setCarPositionType(e.target.value)}
                        className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350 cursor-pointer"
                      >
                        <option value="">Any Type</option>
                        <option value="Full-time">Full-Time</option>
                        <option value="Part-time">Part-Time</option>
                        <option value="Contract">Contract / Consultant</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>

                    {/* Work Mode */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Work Mode
                      </label>
                      <select
                        value={carWorkMode}
                        onChange={(e) => setCarWorkMode(e.target.value)}
                        className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350 cursor-pointer"
                      >
                        <option value="">Any Mode</option>
                        <option value="Onsite">Onsite / Office</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Experience Level
                      </label>
                      <select
                        value={carExperience}
                        onChange={(e) => setCarExperience(e.target.value)}
                        className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350 cursor-pointer"
                      >
                        <option value="">Any Level</option>
                        <option value="Entry">Entry Level</option>
                        <option value="Mid">Mid-Level</option>
                        <option value="Senior">Senior Level</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Action footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                <ShieldCheck className="h-4 w-4 text-[#CB2A26] stroke-[2.5]" />
                <span>Applying queries directly to NextKin relocation listings.</span>
              </div>
              <Button
                type="button"
                onClick={executeModalSearch}
                className="w-full sm:w-auto h-10 rounded-full bg-[#CB2A26] hover:bg-[#A9221F] text-white font-bold text-xs px-6 flex items-center justify-center border-0 cursor-pointer shadow-sm shrink-0"
              >
                Search & Apply Filters
              </Button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
