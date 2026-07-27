export function CategoryFilters({ activeTab, filters, onChange }) {
  if (activeTab === 'accommodations') {
    return (
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-2">Accommodation Settings</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PriceRange label="Monthly Rent range" min={filters.accMinPrice} max={filters.accMaxPrice} onMin={(v) => onChange('accMinPrice', v)} onMax={(v) => onChange('accMaxPrice', v)} />
          <SelectField label="Accommodation Type" value={filters.accType} onChange={(v) => onChange('accType', v)} options={[['', 'Any Type'], ['Room', 'Private Room'], ['Apartment', 'Apartment'], ['Studio', 'Studio Flat'], ['PG', 'Paying Guest (PG)']]} />
          <SelectField label="Stay Duration" value={filters.accStayType} onChange={(v) => onChange('accStayType', v)} options={[['', 'Any Duration'], ['Short Term', 'Short Term (< 6mo)'], ['Long Term', 'Long Term (> 6mo)'], ['Flexible', 'Flexible Term']]} />
          <SelectField label="Furnishing Status" value={filters.accFurnishing} onChange={(v) => onChange('accFurnishing', v)} options={[['', 'Any Furnishing'], ['Furnished', 'Fully Furnished'], ['Semi-Furnished', 'Semi-Furnished'], ['Unfurnished', 'Unfurnished']]} />
        </div>
      </div>
    );
  }

  if (activeTab === 'buysell') {
    return (
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-2">Marketplace Item Settings</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PriceRange label="Price Range" min={filters.bsMinPrice} max={filters.bsMaxPrice} onMin={(v) => onChange('bsMinPrice', v)} onMax={(v) => onChange('bsMaxPrice', v)} />
          <SelectField label="Item Category" value={filters.bsCategory} onChange={(v) => onChange('bsCategory', v)} options={[['', 'Any Category'], ['Electronics', 'Electronics'], ['Furniture', 'Furniture'], ['Books', 'Books'], ['Clothing', 'Clothing']]} />
        </div>
      </div>
    );
  }

  if (activeTab === 'events') {
    return (
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-2">Event Settings</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Event Category" value={filters.evCategory} onChange={(v) => onChange('evCategory', v)} options={[['', 'Any Category'], ['meetup', 'Meetup / Community'], ['party', 'Party / Social'], ['festival', 'Music & Festival'], ['workshop', 'Class & Workshop'], ['sports', 'Sports / Wellness'], ['online', 'Online webinar']]} />
          <DateField label="Date" value={filters.evDate} onChange={(v) => onChange('evDate', v)} />
        </div>
      </div>
    );
  }

  if (activeTab === 'travel') {
    return (
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-2">Travel Plan Settings</span>
        <div className="grid grid-cols-1 gap-4">
          <TextInput label="Target State or City" placeholder="Enter travel destination (e.g. California, Berlin)..." value={filters.trDestination} onChange={(v) => onChange('trDestination', v)} />
        </div>
      </div>
    );
  }

  if (activeTab === 'careers') {
    return (
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-2">Job Position Settings</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField label="Job Type" value={filters.carPositionType} onChange={(v) => onChange('carPositionType', v)} options={[['', 'Any Type'], ['Full-time', 'Full-Time'], ['Part-time', 'Part-Time'], ['Contract', 'Contract / Consultant'], ['Internship', 'Internship']]} />
          <SelectField label="Work Mode" value={filters.carWorkMode} onChange={(v) => onChange('carWorkMode', v)} options={[['', 'Any Mode'], ['Onsite', 'Onsite / Office'], ['Remote', 'Remote'], ['Hybrid', 'Hybrid']]} />
          <SelectField label="Experience Level" value={filters.carExperience} onChange={(v) => onChange('carExperience', v)} options={[['', 'Any Level'], ['Entry', 'Entry Level'], ['Mid', 'Mid-Level'], ['Senior', 'Senior Level']]} />
        </div>
      </div>
    );
  }

  return null;
}

/* ── Small inline helpers ── */

function PriceRange({ label, min, max, onMin, onMax }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        <input type="number" placeholder="Min price" value={min} onChange={(e) => onMin(e.target.value)} className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350" />
        <input type="number" placeholder="Max price" value={max} onChange={(e) => onMax(e.target.value)} className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350" />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350 cursor-pointer">
        {options.map(([val, text]) => <option key={val} value={val}>{text}</option>)}
      </select>
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</label>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-350" />
    </div>
  );
}

function TextInput({ label, placeholder, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</label>
      <input type="text" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-700 outline-none focus:border-slate-350" />
    </div>
  );
}
