import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Navigation, Loader2 } from 'lucide-react';
import { fetchAddressByPincode } from '@/lib/pincodeUtils';
import { Country, State, City } from 'country-state-city';
import SearchableDropdown from "@/components/ui/SearchableDropdown";

export function StepLocation({ formData, setFormData }) {
    const [isPincodeLoading, setIsPincodeLoading] = useState(false);
    const [countriesList] = useState(Country.getAllCountries().map(c =>
        c.isoCode === 'US' ? { ...c, name: "United States of America" } : c
    ));
    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);

    // Initialize lists if data exists
    useEffect(() => {
        if (formData.country) {
            const countryObj = countriesList.find(c => c.name === (formData.country?.name || formData.country));
            if (countryObj) {
                const states = State.getStatesOfCountry(countryObj.isoCode);
                setStatesList(states);
                if (formData.state) {
                    const stateObj = states.find(s => s.name === formData.state);
                    if (stateObj) {
                        setCitiesList(City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode));
                    }
                }
            }
        }
    }, []);

    // Auto-fill address based on Pincode
    useEffect(() => {
        const fetchPincodeDetails = async () => {
            const pincode = formData.pincode;
            if (pincode && pincode.length === 6 && /^\d+$/.test(pincode)) {
                setIsPincodeLoading(true);
                const addressData = await fetchAddressByPincode(pincode);
                if (addressData) {
                    const matchedCountry = countriesList.find(c => c.name.toLowerCase() === (addressData.country || "India").toLowerCase());
                    const countryCode = matchedCountry?.isoCode || "IN";

                    const states = State.getStatesOfCountry(countryCode);
                    const matchedState = states.find(s => s.name.toLowerCase() === addressData.state?.toLowerCase());

                    setFormData({
                        ...formData,
                        city: addressData.city || formData.city,
                        state: matchedState?.name || addressData.state || formData.state,
                        country: matchedCountry || { name: "India", code: "IN" }
                    });

                    if (countryCode) setStatesList(states);
                    if (countryCode && matchedState?.isoCode) {
                        setCitiesList(City.getCitiesOfState(countryCode, matchedState.isoCode));
                    }
                }
                setIsPincodeLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchPincodeDetails, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [formData.pincode]);

    return (
        <div className="space-y-6 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Where is it located?</h2>

            <div className="bg-black/20 rounded-2xl p-1 border border-white/10 overflow-hidden relative group">
                <div className="aspect-video bg-white/5 flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-accent animate-bounce" />
                </div>
                {/* Map placeholder */}
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

                <div className="grid grid-cols-2 gap-4">
                    <SearchableDropdown
                        label="Country"
                        placeholder="Select Country"
                        className="col-span-2 shadow-none"
                        options={countriesList}
                        value={formData.country?.name || formData.country}
                        onChange={(country) => {
                            setFormData({
                                ...formData,
                                country: country,
                                state: "",
                                city: ""
                            });
                            setStatesList(State.getStatesOfCountry(country.isoCode));
                            setCitiesList([]);
                        }}
                    />

                    <SearchableDropdown
                        label="State"
                        placeholder="Select State"
                        options={statesList}
                        value={formData.state}
                        disabled={!formData.country}
                        isLoading={!statesList.length && formData.country}
                        onChange={(state) => {
                            setFormData({
                                ...formData,
                                state: state.name,
                                city: ""
                            });
                            const cCode = formData.country?.isoCode || countriesList.find(c => c.name === formData.country)?.isoCode;
                            if (cCode) {
                                setCitiesList(City.getCitiesOfState(cCode, state.isoCode));
                            }
                        }}
                    />

                    <SearchableDropdown
                        label="City"
                        placeholder="Select City"
                        options={citiesList}
                        value={formData.city}
                        disabled={!formData.state}
                        isLoading={!citiesList.length && formData.state}
                        onChange={(city) => {
                            setFormData({
                                ...formData,
                                city: city.name
                            });
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
        </div>
    );
}
