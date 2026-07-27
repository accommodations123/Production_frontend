import SearchableDropdown from '@/shared/ui/SearchableDropdown';

const LOCATION_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export function AddressSection({ loc, formData, handleChange, pincodeLoading }) {
  return (
    <div className="py-8 border-b border-gray-200 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-accent">{LOCATION_ICON}</div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">Address Details</h3>
            <p className="text-sm text-[#222222]">Where are you located?</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SearchableDropdown
          label="Country"
          placeholder="Select Country"
          options={loc.countries}
          value={loc.selectedCountry?.name || ''}
          onChange={loc.setCountry}
        />
        <SearchableDropdown
          label="State / Province"
          placeholder="Select State"
          options={loc.states}
          value={loc.selectedState?.name || ''}
          disabled={!loc.selectedCountry}
          isLoading={!!loc.selectedCountry && !loc.states.length && !loc.isLoading}
          onChange={loc.setState}
        />
        <SearchableDropdown
          label="City"
          placeholder="Select City"
          options={loc.cities}
          value={loc.selectedCity?.name || ''}
          disabled={!loc.selectedState}
          isLoading={!!loc.selectedState && !loc.cities.length && !loc.isLoading}
          onChange={loc.setCity}
        />
        <div>
          <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
          <input
            id="zip_code" name="zip_code" placeholder="ZIP Code"
            value={formData.zip_code} onChange={handleChange}
            className="block w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-lg shadow-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
          />
          {pincodeLoading && <p className="text-xs text-primary mt-1">Fetching location details...</p>}
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="street_address" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
        <textarea
          id="street_address" name="street_address" required placeholder="Street Address"
          value={formData.street_address} onChange={handleChange} rows={3}
          className="block w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-lg shadow-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
        />
      </div>
    </div>
  );
}
