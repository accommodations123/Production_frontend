import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Globe, Loader2 } from 'lucide-react';
import { fetchAddressByPincode } from '@/lib/pincodeUtils';
import { Country, State, City } from 'country-state-city';
import SearchableDropdown from "@/components/ui/SearchableDropdown";

const LocationSection = ({ formData, setFormData }) => {
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [countriesList] = useState(Country.getAllCountries());
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const citiesFetched = useRef(false);

  // Initialize lists if data exists
  useEffect(() => {
    if (formData.country) {
      const countryName = typeof formData.country === 'string' ? formData.country : formData.country?.name;
      const countryObj = countriesList.find(c => c.name === countryName);
      if (countryObj) {
        const states = State.getStatesOfCountry(countryObj.isoCode);
        setStatesList(states);
        if (formData.state) {
          const stateObj = states.find(s => s.name === formData.state);
          if (stateObj) {
            setCitiesList(City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode));
            citiesFetched.current = true;
          }
        }
      }
    }
  }, []);

  // Auto-fill address based on Pincode
  useEffect(() => {
    const fetchPincodeDetails = async () => {
      const pincode = formData.pincode;
      const currentCountryName = typeof formData.country === 'object'
        ? formData.country?.name
        : formData.country;
      const isCountryIndiaOrEmpty = !currentCountryName || currentCountryName.toLowerCase() === "india";

      if (pincode && pincode.length === 6 && /^\d+$/.test(pincode) && isCountryIndiaOrEmpty) {
        setIsPincodeLoading(true);
        const addressData = await fetchAddressByPincode(pincode);
        if (addressData) {
          const matchedCountry = countriesList.find(c => c.name.toLowerCase() === (addressData.country || "India").toLowerCase());
          const countryCode = matchedCountry?.isoCode || "IN";

          const states = State.getStatesOfCountry(countryCode);
          const matchedState = states.find(s => s.name.toLowerCase() === addressData.state?.toLowerCase());

          const updatedFields = {};
          const isCountryEmpty = !formData.country || (typeof formData.country === 'object' ? !formData.country.name : !formData.country);
          if (isCountryEmpty) {
            updatedFields.country = matchedCountry || { name: "India", code: "IN" };
          }
          if (!formData.state) {
            updatedFields.state = matchedState?.name || addressData.state;
          }
          if (!formData.city) {
            updatedFields.city = addressData.city;
          }

          if (Object.keys(updatedFields).length > 0) {
            setFormData(prev => ({
              ...prev,
              ...updatedFields
            }));
          }

          if (countryCode) setStatesList(states);
          if (countryCode && matchedState?.isoCode) {
            setCitiesList(City.getCitiesOfState(countryCode, matchedState.isoCode));
            citiesFetched.current = true;
          }
        }
        setIsPincodeLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchPincodeDetails, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [formData.pincode]);

  return (
    <section className="bg-black/20 rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <MapPin className="h-6 w-6 text-accent" />
        Property Location
      </h2>

      <div className="bg-black/20 rounded-2xl p-1 border border-white/10 overflow-hidden relative group mb-6">
        <div className="aspect-video bg-white/5 flex items-center justify-center">
          <MapPin className="h-12 w-12 text-accent animate-bounce" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
          <div>
            <h4 className="font-bold text-xl">Pin Location</h4>
            <p className="text-sm text-gray-400">Drag map to pin exact location</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Street Address</label>
          <div className="relative">
            <Navigation className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            <textarea
              placeholder="Flat/House No., Building, Street Area"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-accent outline-none min-h-[80px]"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SearchableDropdown
            label="Country"
            placeholder="Select Country"
            options={countriesList}
            value={formData.country?.name || formData.country}
            onChange={(country) => {
              setFormData({
                ...formData,
                country: country,
                state: "",
                city: ""
              });
              if (country.isoCode && country.isoCode !== 'CUSTOM') {
                setStatesList(State.getStatesOfCountry(country.isoCode));
              } else {
                setStatesList([]);
              }
              setCitiesList([]);
              citiesFetched.current = false;
            }}
          />

          <SearchableDropdown
            label="State / Province"
            placeholder="Select State"
            options={statesList}
            value={formData.state}
            disabled={!formData.country}
            isLoading={(() => {
              const cObj = typeof formData.country === 'object' ? formData.country : countriesList.find(c => c.name === formData.country);
              return !!(cObj && cObj.isoCode && cObj.isoCode !== 'CUSTOM' && !statesList.length);
            })()}
            onChange={(state) => {
              setFormData({
                ...formData,
                state: state.name,
                city: ""
              });
              const cObj = typeof formData.country === 'object' ? formData.country : countriesList.find(c => c.name === formData.country);
              if (cObj && cObj.isoCode && cObj.isoCode !== 'CUSTOM' && state.isoCode && state.isoCode !== 'CUSTOM') {
                setCitiesList(City.getCitiesOfState(cObj.isoCode, state.isoCode));
                citiesFetched.current = true;
              } else {
                setCitiesList([]);
                citiesFetched.current = false;
              }
            }}
          />

          <SearchableDropdown
            label="City"
            placeholder="Select City"
            options={citiesList}
            value={formData.city}
            disabled={!formData.state}
            isLoading={(() => {
              if (citiesFetched.current) return false;
              const cObj = typeof formData.country === 'object' ? formData.country : countriesList.find(c => c.name === formData.country);
              const hasValidC = cObj && cObj.isoCode && cObj.isoCode !== 'CUSTOM';
              return !!(hasValidC && formData.state && !citiesList.length && statesList.find(s => s.name === formData.state)?.isoCode);
            })()}
            onChange={(city) => {
              setFormData(prev => ({
                ...prev,
                city: city.name
              }));
            }}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex justify-between">
              Pincode
              {isPincodeLoading && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
            </label>
            <input
              type="text"
              placeholder="000000"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-accent outline-none"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
