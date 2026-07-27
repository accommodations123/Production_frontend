import { Info, Loader2 } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import SearchableDropdown from '@/shared/ui/SearchableDropdown';
import { CountryCodeSelect } from '@/shared/ui/CountryCodeSelect';

export function SellFormLocationStep({
  loc,
  zipCode, setZipCode, isPincodeLoading,
  streetAddress, setStreetAddress,
  description, setDescription,
  name, setName,
  phone, setPhone,
  phoneCode, setPhoneCode,
  phoneIso, setPhoneIso,
}) {
  return (
    <>
      {/* Location & Description */}
      <div className="bg-white p-4 rounded-lg space-y-3">
        <SearchableDropdown
          label="Country"
          placeholder="Select Country"
          options={loc.countries}
          value={loc.selectedCountry?.name || ''}
          onChange={(c) => loc.setCountry(c)}
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <SearchableDropdown
            label="State"
            placeholder="Select State"
            options={loc.states}
            value={loc.selectedState?.name || ''}
            disabled={!loc.selectedCountry}
            isLoading={!!loc.selectedCountry && !loc.states.length}
            onChange={(s) => loc.setState(s)}
          />
          <SearchableDropdown
            label="City"
            placeholder="Select City"
            options={loc.cities}
            value={loc.selectedCity?.name || ''}
            disabled={!loc.selectedState}
            isLoading={!!loc.selectedState && !loc.cities.length}
            onChange={(c) => loc.setCity(c)}
          />
        </div>

        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-900">
            Zip Code <span className="text-red-500 ml-1">*</span>
          </label>
          {isPincodeLoading && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
        </div>
        <Input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="e.g., 10001 or SW1A 1AA"
        />

        <label className="text-sm font-medium text-gray-900">
          Street Address <span className="text-red-500 ml-1">*</span>
        </label>
        <Input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} placeholder="Street address" />

        <label className="text-sm font-medium text-gray-900">
          Description <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe your item..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-[#00162D] placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00162D]/10"
        />
        <p className="text-xs text-[#484848] flex items-center gap-1">
          <Info size={12} /> Clear descriptions increase buyer trust
        </p>
      </div>

      {/* Contact */}
      <div className="bg-white p-4 rounded-lg space-y-3">
        <label className="text-sm font-medium text-gray-900">
          Name <span className="text-red-500 ml-1">*</span>
        </label>
        <Input
          value={name}
          onChange={(e) => {
            const val = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
            setName(val);
          }}
          placeholder="Your name"
        />

        <label className="text-sm font-medium text-gray-900">
          Phone <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex gap-2">
          <CountryCodeSelect
            value={phoneCode || '+91'}
            isoCode={phoneIso}
            onChange={(code, iso) => {
              setPhoneCode(code);
              if (iso) setPhoneIso(iso);
            }}
            className="w-[110px]"
          />
          <Input
            type="tel"
            value={phone}
            onChange={(e) => {
              let val = e.target.value.replace(/[^0-9]/g, '').slice(0, 15);
              setPhone(val);
            }}
            className="flex-1"
            placeholder="Phone number"
          />
        </div>
      </div>
    </>
  );
}
