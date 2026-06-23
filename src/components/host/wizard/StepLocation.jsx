import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { COUNTRIES } from '@/lib/mock-data';
import SearchableDropdown from '@/components/ui/SearchableDropdown';
import { loadLocationData } from '@/lib/lazyLocationData';

// Helper to check if zip code is required for the country
const isZipCodeRequired = (country) => {
    if (!country) return false;
    const code = (typeof country === 'object' ? country.code : '') || '';
    const name = (typeof country === 'object' ? country.name : country) || '';
    const codeUpper = code.toUpperCase().trim();
    const nameLower = name.toLowerCase().trim();
    
    const requiredCodes = ["US", "IN", "GB", "CA", "AU", "DE", "FR"];
    const requiredNames = ["united states", "united states of america", "india", "united kingdom", "great britain", "canada", "australia", "germany", "france"];
    
    return requiredCodes.includes(codeUpper) || requiredNames.includes(nameLower);
};

export function StepLocation({ formData, setFormData }) {
    const countryObj = typeof formData.country === 'object' 
        ? formData.country 
        : (COUNTRIES.find(c => c.name === formData.country) || null);
        
    const zipRequired = isZipCodeRequired(formData.country);

    const [locationMod, setLocationMod] = useState(null);
    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);
    const [selectedState, setSelectedState] = useState(null);
    const [statesLoading, setStatesLoading] = useState(false);
    const [citiesLoading, setCitiesLoading] = useState(false);

    // Load dynamic location module on mount
    useEffect(() => {
        loadLocationData().then(setLocationMod);
    }, []);

    // Load states when country changes or locationMod is loaded
    useEffect(() => {
        if (!locationMod || !countryObj) {
            setStatesList([]);
            setSelectedState(null);
            return;
        }

        const countryIsoCode = countryObj.code || countryObj.isoCode;
        if (!countryIsoCode) {
            setStatesList([]);
            setSelectedState(null);
            return;
        }

        setStatesLoading(true);
        const states = locationMod.State.getStatesOfCountry(countryIsoCode);
        setStatesList(states);
        setStatesLoading(false);

        // Pre-select state object if formData.state is set
        if (formData.state) {
            const matchedState = states.find(s => s.name.toLowerCase() === formData.state.toLowerCase());
            if (matchedState) {
                setSelectedState(matchedState);
            }
        }
    }, [locationMod, countryObj, formData.country]);

    // Load cities when state changes
    useEffect(() => {
        if (!locationMod || !countryObj || !selectedState) {
            setCitiesList([]);
            return;
        }

        const countryIsoCode = countryObj.code || countryObj.isoCode;
        if (!countryIsoCode || !selectedState.isoCode) {
            setCitiesList([]);
            return;
        }

        setCitiesLoading(true);
        const cities = locationMod.City.getCitiesOfState(countryIsoCode, selectedState.isoCode);
        setCitiesList(cities);
        setCitiesLoading(false);
    }, [locationMod, countryObj, selectedState]);

    const handleStateChange = (state) => {
        setSelectedState(state);
        setFormData(prev => ({
            ...prev,
            state: state.name,
            city: ""
        }));
    };

    const handleCityChange = (city) => {
        setFormData(prev => ({
            ...prev,
            city: city.name
        }));
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Where is it located?</h2>

            {/* Location Form Fields */}
            <div className="space-y-4 pt-2">
                {/* Street Address */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Street Address <span className="text-red-500 ml-1">*</span></label>
                    <textarea
                        placeholder="Flat/House No., Building, Street Area"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-accent outline-none min-h-[80px] text-white"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Country - Derived & Read Only */}
                    <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-300">Country (Selected in Header)</label>
                        <div className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 flex items-center gap-3 text-gray-400">
                            {countryObj?.flag ? (
                                <img src={countryObj.flag} alt={countryObj.name} className="h-5 w-7 object-cover rounded" />
                            ) : (
                                <Globe className="h-5 w-5 text-gray-500" />
                            )}
                            <span className="font-semibold text-white">{countryObj?.name || formData.country || 'No Country Selected'}</span>
                        </div>
                    </div>

                    {/* State - Dropdown */}
                    <div className="space-y-2 col-span-2 md:col-span-1">
                        <SearchableDropdown
                            label="State"
                            placeholder="Select State"
                            options={statesList}
                            value={formData.state || ''}
                            disabled={!countryObj}
                            isLoading={statesLoading || (!statesList.length && countryObj)}
                            onChange={handleStateChange}
                            required={true}
                        />
                    </div>

                    {/* City - Dropdown */}
                    <div className="space-y-2 col-span-2 md:col-span-1">
                        <SearchableDropdown
                            label="City"
                            placeholder="Select City"
                            options={citiesList}
                            value={formData.city || ''}
                            disabled={!selectedState}
                            isLoading={citiesLoading || (!citiesList.length && selectedState)}
                            onChange={handleCityChange}
                            required={true}
                        />
                    </div>

                    {/* Zip code (Pincode) - Conditional Mandatory */}
                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-gray-300">
                            Zip Code {zipRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                            type="text"
                            placeholder="Zip / Postal Code"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-accent outline-none text-white"
                            value={formData.pincode || ''}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
