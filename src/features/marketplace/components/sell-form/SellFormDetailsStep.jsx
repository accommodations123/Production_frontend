import { Input } from '@/shared/ui/input';
import { CATEGORY_MAP, CONDITIONS, FUEL_TYPES, TRANSMISSIONS } from './sellFormConstants';
import { COUNTRIES } from '@/shared/utils/mock-data';
import { useCountry } from '@/context/CountryContext';

export function SellFormDetailsStep({
  title, setTitle,
  category, setCategory, subcategory, setSubcategory,
  condition, setCondition,
  make, setMake, model, setModel, year, setYear,
  mileage, setMileage, fuelType, setFuelType, transmission, setTransmission,
  price, setPrice,
  loc,
}) {
  const { activeCountry: globalActiveCountry } = useCountry();

  const currencySymbol = (() => {
    const countryName = loc.selectedCountry?.name || null;
    let currency = null;

    if (countryName && loc.countries.length) {
      const matched = loc.countries.find((c) => c.name === countryName);
      if (matched?.currency) currency = matched.currency;
    }
    if (!currency) {
      const found = COUNTRIES.find((c) => c.code === globalActiveCountry?.code);
      currency = found?.currency || globalActiveCountry?.currency || 'USD';
    }

    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency })
        .formatToParts(0)
        .find((p) => p.type === 'currency')?.value || currency;
    } catch {
      return currency;
    }
  })();

  return (
    <div className="bg-white p-4 rounded-lg space-y-3">
      <label className="text-sm font-medium text-gray-900">
        Title <span className="text-red-500 ml-1">*</span>
      </label>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Item title" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-900">
            Category <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setSubcategory(''); }}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-[#00162D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00162D]/10"
          >
            <option value="">Select Category</option>
            {Object.keys(CATEGORY_MAP).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-900">
            Subcategory <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-[#00162D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00162D]/10"
          >
            <option value="">Select Subcategory</option>
            {category && (CATEGORY_MAP[category] || []).map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-900">
            Condition <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-[#00162D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00162D]/10"
          >
            <option value="">Select Condition</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {category === 'Vehicles' && (
        <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/20 space-y-3 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <h4 className="font-semibold text-sm text-indigo-900 flex items-center gap-1.5">
            Vehicle Specifications
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-900">Make</label>
              <Input value={make} onChange={(e) => setMake(e.target.value)} placeholder="e.g. Honda" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Model</label>
              <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Civic" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Year</label>
              <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2022" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Mileage (mi / km)</label>
              <Input value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="e.g. 45000" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Fuel Type</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-[#00162D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00162D]/10"
              >
                <option value="">Select Fuel Type</option>
                {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Transmission</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-[#00162D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00162D]/10"
              >
                <option value="">Select Transmission</option>
                {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <label className="text-sm font-medium text-gray-900">
        Price <span className="text-red-500 ml-1">*</span>
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484848] font-bold text-sm min-w-[1rem] text-center">
          {currencySymbol}
        </div>
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="pl-14"
          placeholder="0.00"
        />
      </div>
      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
        <span>Currency auto-selects based on your country</span>
      </p>
    </div>
  );
}
