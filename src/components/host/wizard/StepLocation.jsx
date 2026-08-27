import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapPin, Loader2, Navigation, Globe } from 'lucide-react';
import { loadLocationData } from '@/shared/utils/lazyLocationData';
import { fetchAddressByPincode } from '@/lib/pincodeUtils';
import SearchableDropdown from '@/shared/ui/SearchableDropdown';
import { COUNTRIES } from '@/lib/mock-data';

const isZipCodeRequired = (country) => {
  if (!country) return false;
  const name = (typeof country === 'object' ? country.name : country) || '';
  const nameLower = name.toLowerCase().trim();
  const required = ["india", "united states", "united states of america", "united kingdom", "canada", "australia"];
  return required.includes(nameLower);
};

export function StepLocation({ formData, setFormData }) {
  const [locationMod, setLocationMod] = useState(null);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [citiesFetched, setCitiesFetched] = useState(false);

  // Lazy load country-state-city library
  useEffect(() => {
    let cancelled = false;
    loadLocationData().then((mod) => {
      if (!cancelled) {
        setLocationMod(mod);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Countries list derived from location module
  const countriesList = useMemo(() => {
    if (!locationMod) {
      return COUNTRIES.map((c) => ({ name: c.name, isoCode: c.code || c.name }));
    }
    return locationMod.Country.getAllCountries().map((c) =>
      c.isoCode === "US" ? { ...c, name: "United States of America" } : c
    );
  }, [locationMod]);

  // Current selected country object
  const currentCountryName = typeof formData.country === 'object'
    ? formData.country?.name
    : (formData.country || 'India');

  const selectedCountryObj = useMemo(() => {
    if (!countriesList.length) return null;
    return countriesList.find(
      (c) => c.name?.toLowerCase() === currentCountryName?.toLowerCase() || c.isoCode === currentCountryName
    ) || { name: currentCountryName, isoCode: 'IN' };
  }, [countriesList, currentCountryName]);

  // Populate states when country or locationMod changes
  useEffect(() => {
    if (!locationMod || !selectedCountryObj?.isoCode) return;
    const states = locationMod.State.getStatesOfCountry(selectedCountryObj.isoCode);
    const finalStates = states.length > 0
      ? states
      : [
          { name: currentCountryName, isoCode: selectedCountryObj.isoCode || "MAIN" },
          { name: "National / Main Region", isoCode: "NATIONAL" }
        ];
    setStatesList(finalStates);

    // If state is already selected, populate cities
    if (formData.state) {
      const stateObj = states.find(
        (s) => s.name?.toLowerCase() === formData.state?.toLowerCase() || s.isoCode === formData.state
      );
      const cities = stateObj
        ? locationMod.City.getCitiesOfState(selectedCountryObj.isoCode, stateObj.isoCode)
        : [];
      const finalCities = cities.length > 0
        ? cities
        : [
            { name: formData.state || currentCountryName, isoCode: "MAIN" },
            { name: "Central / Capital City", isoCode: "CAPITAL" }
          ];
      setCitiesList(finalCities);
      setCitiesFetched(true);
    }
  }, [locationMod, selectedCountryObj?.isoCode, currentCountryName, formData.state]);

  // Pincode auto-lookup for Indian PIN codes
  useEffect(() => {
    const pincode = (formData.pincode || formData.zipCode || '').toString().trim();
    const isIndia = !currentCountryName || currentCountryName.toLowerCase() === 'india';

    if (pincode.length === 6 && /^\d+$/.test(pincode) && isIndia) {
      const timer = setTimeout(async () => {
        setIsPincodeLoading(true);
        try {
          const addressData = await fetchAddressByPincode(pincode);
          if (addressData) {
            setFormData(prev => ({
              ...prev,
              country: addressData.country || prev.country || 'India',
              state: addressData.state || prev.state,
              city: addressData.city || prev.city
            }));

            if (locationMod) {
              const states = locationMod.State.getStatesOfCountry('IN');
              setStatesList(states);
              const matchedState = states.find(s => s.name.toLowerCase() === addressData.state?.toLowerCase());
              if (matchedState) {
                const cities = locationMod.City.getCitiesOfState('IN', matchedState.isoCode);
                setCitiesList(cities.length > 0 ? cities : [{ name: addressData.city, isoCode: "MAIN" }]);
                setCitiesFetched(true);
              }
            }
          }
        } catch (err) {
          console.error("Failed to auto-fetch address by pincode:", err);
        } finally {
          setIsPincodeLoading(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [formData.pincode, formData.zipCode, currentCountryName, locationMod, setFormData]);

  const handleCountryChange = (country) => {
    const countryName = country?.name || country;
    setFormData(prev => ({
      ...prev,
      country: countryName,
      state: '',
      city: ''
    }));

    if (locationMod && country?.isoCode) {
      const states = locationMod.State.getStatesOfCountry(country.isoCode);
      setStatesList(states.length > 0 ? states : [
        { name: countryName, isoCode: country.isoCode || "MAIN" },
        { name: "National / Main Region", isoCode: "NATIONAL" }
      ]);
    } else {
      setStatesList([
        { name: countryName, isoCode: "MAIN" },
        { name: "National / Main Region", isoCode: "NATIONAL" }
      ]);
    }
    setCitiesList([]);
    setCitiesFetched(false);
  };

  const handleStateChange = (state) => {
    const stateName = state?.name || state;
    setFormData(prev => ({
      ...prev,
      state: stateName,
      city: ''
    }));

    if (locationMod && selectedCountryObj?.isoCode && state?.isoCode && state.isoCode !== 'CUSTOM') {
      const cities = locationMod.City.getCitiesOfState(selectedCountryObj.isoCode, state.isoCode);
      setCitiesList(cities.length > 0 ? cities : [
        { name: stateName, isoCode: "MAIN" },
        { name: "Central / Capital City", isoCode: "CAPITAL" }
      ]);
      setCitiesFetched(true);
    } else {
      setCitiesList([
        { name: stateName, isoCode: "MAIN" },
        { name: "Central / Capital City", isoCode: "CAPITAL" }
      ]);
      setCitiesFetched(true);
    }
  };

  const handleCityChange = (city) => {
    const cityName = city?.name || city;
    setFormData(prev => ({
      ...prev,
      city: cityName
    }));
  };

  const zipRequired = isZipCodeRequired(currentCountryName);

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Where is it located?</h2>
        <p className="text-sm text-slate-500">Search and select country, state, and city details for your accommodation.</p>
      </div>

      <div className="space-y-5 pt-4 border-t border-gray-200">
        
        {/* Street Address */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Street Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              placeholder="Flat/House No., Building, Street Area"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26] text-slate-900 placeholder:text-slate-400 font-medium transition-all min-h-[80px]"
              value={formData.address || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
        </div>

        {/* Country Searchable Dropdown */}
        <div className="space-y-2">
          <SearchableDropdown
            label="Country"
            required
            placeholder="Search and select Country"
            options={countriesList}
            value={currentCountryName}
            onChange={handleCountryChange}
          />
        </div>

        {/* State & City Searchable Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* State Searchable Dropdown */}
          <div className="space-y-2">
            <SearchableDropdown
              label="State / Province"
              required
              placeholder={statesList.length > 0 ? "Search and select State" : "Select or type State"}
              options={statesList}
              value={formData.state || ''}
              disabled={!formData.country}
              isLoading={!locationMod}
              onChange={handleStateChange}
            />
          </div>

          {/* City Searchable Dropdown */}
          <div className="space-y-2">
            <SearchableDropdown
              label="City"
              required
              placeholder={citiesList.length > 0 ? "Search and select City" : "Select or type City"}
              options={citiesList}
              value={formData.city || ''}
              disabled={!formData.state}
              isLoading={!locationMod}
              onChange={handleCityChange}
            />
          </div>
        </div>

        {/* Zip code (Pincode) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
            <span>Zip Code {zipRequired && <span className="text-red-500">*</span>}</span>
            {isPincodeLoading && (
              <span className="text-xs font-normal text-[#CB2A26] flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Auto-filling location...
              </span>
            )}
          </label>
          <input
            type="text"
            placeholder="Zip / Postal Code"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26] text-slate-900 font-medium"
            value={formData.pincode || formData.zipCode || formData.zip_code || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
          />
        </div>

      </div>
    </div>
  );
}


