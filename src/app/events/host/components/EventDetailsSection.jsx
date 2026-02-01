import React from "react"
import { Calendar, DollarSign, Globe, Phone, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CountryCodeSelect } from "@/components/ui/CountryCodeSelect"
import { Country, State, City } from 'country-state-city';
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import { useState, useEffect } from "react";

export const EventDetailsSection = ({ formData, handleInputChange }) => {
    const [countriesList] = useState(Country.getAllCountries());
    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);

    const getCurrencySymbol = (countryName) => {
        if (!countryName) return '$';
        // Use Country from country-state-city to find currency
        const allCountries = Country.getAllCountries();
        const country = allCountries.find(c => c.name === countryName || c.isoCode === countryName);
        if (!country || !country.currency) return '$';

        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: country.currency,
            }).formatToParts(0).find(part => part.type === 'currency')?.value || country.currency;
        } catch (e) {
            return country.currency;
        }
    };

    const currencySymbol = getCurrencySymbol(formData.country);

    // Initialize lists if data exists
    useEffect(() => {
        if (formData.country) {
            const countryObj = countriesList.find(c => c.name === formData.country);
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
    }, []); // Run once on mount

    return (
        <div className="rounded-xl p-6 border bg-[#f8f9fa] border-[#00162d]">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-[#00162d]">
                <Calendar className="mr-2 h-5 w-5 text-[#00162d]" />
                Event Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <Label className="font-medium text-sm text-[#00162d]">Event Title *</Label>
                    <Input
                        value={formData.title || ""}
                        onChange={e => handleInputChange("title", e.target.value)}
                        className="mt-1 text-gray-900 placeholder-gray-400 border-[#00162d]"
                        placeholder="Give your event a catchy title"
                    />
                </div>

                <div>
                    <Label className="font-medium text-sm text-[#00162d]">Event Type</Label>
                    <select
                        className="w-full mt-1 border border-[#00162d] rounded-md p-2 text-gray-900"
                        value={formData.event_type || "meetup"}
                        onChange={e => handleInputChange("event_type", e.target.value)}
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="meetup">Meetup</option>
                        <option value="festival">Festival</option>
                        <option value="party">Party</option>
                    </select>
                </div>

                <div>
                    <Label className="font-medium text-sm text-[#00162d]">Event Mode</Label>
                    <select
                        className="w-full mt-1 border border-[#00162d] rounded-md p-2 text-gray-900"
                        value={formData.event_mode || "offline"}
                        onChange={e => handleInputChange("event_mode", e.target.value)}
                    >
                        <option value="offline">Offline</option>
                        <option value="online">Online</option>
                        <option value="hybrid">Hybrid</option>
                    </select>
                </div>

                <div>
                    <Label className="font-medium text-sm text-[#00162d]">Start Date *</Label>
                    <Input
                        type="date"
                        value={formData.date || ""}
                        onChange={e => handleInputChange("date", e.target.value)}
                        className="mt-1 text-gray-900 border-[#00162d]"
                    />
                </div>

                <div>
                    <Label className="font-medium text-sm text-[#00162d]">End Date</Label>
                    <Input
                        type="date"
                        value={formData.end_date || ""}
                        onChange={e => handleInputChange("end_date", e.target.value)}
                        className="mt-1 text-gray-900 border-[#00162d]"
                    />
                </div>

                <div>
                    <Label className="font-medium text-sm text-[#00162d]">Start Time *</Label>
                    <Input
                        type="time"
                        value={formData.time || ""}
                        onChange={e => handleInputChange("time", e.target.value)}
                        className="mt-1 text-gray-900 border-[#00162d]"
                    />
                </div>

                <div>
                    <Label className="font-medium text-sm text-[#00162d]">End Time</Label>
                    <Input
                        type="time"
                        value={formData.end_time || ""}
                        onChange={e => handleInputChange("end_time", e.target.value)}
                        className="mt-1 text-gray-900 border-[#00162d]"
                    />
                </div>

                <div>
                    <Label className="font-medium text-sm flex items-center text-[#00162d]">
                        <span className="min-w-[1rem] mr-2 text-[#00162d] font-bold text-center flex items-center justify-center">{currencySymbol}</span>
                        Price
                    </Label>
                    <Input
                        type="number"
                        value={formData.price || ""}
                        onChange={e => handleInputChange("price", e.target.value)}
                        className="mt-1 text-gray-900 placeholder-gray-400 border-[#00162d]"
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <Label className="font-medium text-sm flex items-center text-[#00162d]">
                        <Globe className="h-4 w-4 mr-1 text-[#00162d]" />
                        Event URL
                    </Label>
                    <Input
                        value={formData.event_url || ""}
                        onChange={e => handleInputChange("event_url", e.target.value)}
                        className="mt-1 text-gray-900 placeholder-gray-400 border-[#00162d]"
                        placeholder="https://example.com"
                    />
                </div>

                <div>
                    <Label className="font-medium text-sm flex items-center text-[#00162d]">
                        <Phone className="h-4 w-4 mr-1 text-[#00162d]" />
                        Contact Number
                    </Label>
                    <div className="flex gap-2 mt-1">
                        <div className="w-[120px] shrink-0">
                            <CountryCodeSelect
                                value={formData.phoneCode || "+91"}
                                isoCode={formData.phoneIso}
                                onChange={(val, code) => {
                                    handleInputChange("phoneCode", val);
                                    if (code) handleInputChange("phoneIso", code);
                                }}
                                className="w-full"
                            />
                        </div>
                        <Input
                            type="tel"
                            value={formData.phone || ""}
                            onChange={e => handleInputChange("phone", e.target.value)}
                            className="text-gray-900 placeholder-gray-400 border-[#00162d]"
                            placeholder="Phone number"
                        />
                    </div>
                </div>
            </div>

            <div className="md:col-span-2 space-y-4">
                <Label className="font-medium text-sm flex items-center text-[#00162d]">
                    <MapPin className="h-4 w-4 mr-1 text-[#00162d]" />
                    Location & Region
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SearchableDropdown
                        label="Country"
                        placeholder="Select Country"
                        options={countriesList}
                        value={formData.country}
                        onChange={(option) => {
                            handleInputChange("country", option.name);
                            handleInputChange("state", "");
                            handleInputChange("city", "");
                            setStatesList(State.getStatesOfCountry(option.isoCode));
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
                        onChange={(option) => {
                            handleInputChange("state", option.name);
                            handleInputChange("city", "");
                            const countryObj = countriesList.find(c => c.name === formData.country);
                            if (countryObj) {
                                setCitiesList(City.getCitiesOfState(countryObj.isoCode, option.isoCode));
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
                        onChange={(option) => {
                            handleInputChange("city", option.name);
                        }}
                    />

                    <div>
                        <Label className="font-medium text-sm text-[#00162d] mb-1 block">Zip Code</Label>
                        <Input
                            value={formData.zip_code || ""}
                            onChange={e => handleInputChange("zip_code", e.target.value)}
                            className="mt-1 text-gray-900 placeholder-gray-400 border-[#00162d]"
                            placeholder="Zip Code"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <Label className="font-medium text-sm text-[#00162d]">Event Description</Label>
                <Textarea
                    value={formData.description || ""}
                    onChange={e => handleInputChange("description", e.target.value)}
                    className="mt-1 text-gray-900 placeholder-gray-400 border-[#00162d]"
                    placeholder="Describe your event in detail"
                    rows={4}
                />
            </div>

            {formData.event_mode !== 'offline' && (
                <div className="mt-4">
                    <Label className="font-medium text-sm text-[#00162d]">Online Instructions</Label>
                    <Textarea
                        value={formData.online_instructions || ""}
                        onChange={e => handleInputChange("online_instructions", e.target.value)}
                        className="mt-1 text-gray-900 placeholder-gray-400 border-[#00162d]"
                        placeholder="How to join your online event"
                        rows={3}
                    />
                </div>
            )}
        </div>
    )
}
