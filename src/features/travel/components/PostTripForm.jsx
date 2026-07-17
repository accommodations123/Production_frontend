import React, { useState, useEffect } from "react";
import { Plane, User, MapPin, Loader2, ArrowLeft } from "lucide-react";
import { useCreateTripMutation, useGetHostProfileQuery } from "@/store/api/hostApi";
import { useGetMeQuery } from "@/store/api/authApi";
import { loadLocationData } from '@/shared/utils/lazyLocationData';
import SearchableDropdown from "@/shared/ui/SearchableDropdown";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export default function PostTripForm({ onCancel, onAdd }) {
    const [createTrip, { isLoading: isSubmitting }] = useCreateTripMutation();
    const [form, setForm] = useState({
        age: "",
        languages: "",
        airline: "",
        flight_number: "",
        flightName: "",
        from_country: "",
        from_state: "",
        from_city: "",
        to_country: "",
        to_state: "",
        to_city: "",
        travelers_count: "1",
        travel_date: "",
        departure_time: "",
        arrival_date: "",
        arrival_time: "",
        stops: [],
    });

    const [formErrors, setFormErrors] = useState({});

    // Lazy-loaded location modules
    const [locationMod, setLocationMod] = useState(null);
    useEffect(() => {
        loadLocationData().then(setLocationMod);
    }, []);

    // Country/State/City lists
    const [countriesList, setCountriesList] = useState([]);
    useEffect(() => {
        if (locationMod) {
            setCountriesList(locationMod.Country.getAllCountries().map(c =>
                c.isoCode === 'US' ? { ...c, name: "United States of America" } : c
            ));
        }
    }, [locationMod]);

    // Origin location lists
    const [fromStatesList, setFromStatesList] = useState([]);
    const [fromCitiesList, setFromCitiesList] = useState([]);
    const [fromCitiesFetched, setFromCitiesFetched] = useState(false);
    const [selectedFromCountry, setSelectedFromCountry] = useState(null);
    const [selectedFromState, setSelectedFromState] = useState(null);

    // Destination location lists
    const [toStatesList, setToStatesList] = useState([]);
    const [toCitiesList, setToCitiesList] = useState([]);
    const [toCitiesFetched, setToCitiesFetched] = useState(false);
    const [selectedToCountry, setSelectedToCountry] = useState(null);
    const [selectedToState, setSelectedToState] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Handle Origin Country Change
    const handleFromCountryChange = (country) => {
        if (!locationMod) return;
        setSelectedFromCountry(country);
        setForm(prev => ({ ...prev, from_country: country.name, from_state: "", from_city: "" }));
        setFromStatesList(locationMod.State.getStatesOfCountry(country.isoCode));
        setFromCitiesList([]);
        setFromCitiesFetched(false);
        setSelectedFromState(null);
    };

    // Handle Origin State Change
    const handleFromStateChange = (state) => {
        if (!locationMod) return;
        setSelectedFromState(state);
        setForm(prev => ({ ...prev, from_state: state.name, from_city: "" }));
        if (selectedFromCountry) {
            setFromCitiesList(locationMod.City.getCitiesOfState(selectedFromCountry.isoCode, state.isoCode));
            setFromCitiesFetched(true);
        }
    };

    // Handle Origin City Change
    const handleFromCityChange = (city) => {
        setForm(prev => ({ ...prev, from_city: city.name }));
    };

    // Handle Destination Country Change
    const handleToCountryChange = (country) => {
        if (!locationMod) return;
        setSelectedToCountry(country);
        setForm(prev => ({ ...prev, to_country: country.name, to_state: "", to_city: "" }));
        setToStatesList(locationMod.State.getStatesOfCountry(country.isoCode));
        setToCitiesList([]);
        setToCitiesFetched(false);
        setSelectedToState(null);
    };

    // Handle Destination State Change
    const handleToStateChange = (state) => {
        if (!locationMod) return;
        setSelectedToState(state);
        setForm(prev => ({ ...prev, to_state: state.name, to_city: "" }));
        if (selectedToCountry) {
            setToCitiesList(locationMod.City.getCitiesOfState(selectedToCountry.isoCode, state.isoCode));
            setToCitiesFetched(true);
        }
    };

    // Handle Destination City Change
    const handleToCityChange = (city) => {
        setForm(prev => ({ ...prev, to_city: city.name }));
    };

    const validateForm = () => {
        const errors = {};

        if (!form.age) errors.age = "Age is required";
        if (!form.languages) errors.languages = "Languages are required";
        if (!form.airline) errors.airline = "Airline is required";
        if (!form.from_country) errors.from_country = "Origin country is required";
        if (!form.from_city) errors.from_city = "Origin city is required";
        if (!form.to_country) errors.to_country = "Destination country is required";
        if (!form.to_city) errors.to_city = "Destination city is required";
        if (!form.travel_date) errors.travel_date = "Travel date is required";
        if (!form.departure_time) errors.departure_time = "Departure time is required";

        setFormErrors(errors);
        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        const isValid = Object.keys(errors).length === 0;

        if (!isValid) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            const payload = {
                from_country: form.from_country,
                from_state: form.from_state,
                from_city: form.from_city,
                to_country: form.to_country,
                to_state: form.to_state,
                to_city: form.to_city,
                travel_date: form.travel_date,
                departure_time: form.departure_time,
                arrival_date: form.arrival_date || undefined,
                arrival_time: form.arrival_time || undefined,
                airline: form.airline,
                flight_number: form.flight_number || undefined,
                travelers_count: Number(form.travelers_count),
                age: Number(form.age),
                languages: form.languages.split(",").map(lang => lang.trim()).filter(Boolean),
            };

            const response = await createTrip(payload).unwrap();
            onAdd?.(response);
        } catch (error) {
            console.error("Failed to post trip:", error);
            alert("Failed to post trip. Please try again.");
        }
    };

    const { data: userData } = useGetMeQuery();
    const { data: hostProfile, isLoading: isProfileLoading } = useGetHostProfileQuery(undefined, {
        skip: !userData
    });

    const isVerifiedHost = hostProfile?.status === 'approved';

    if (isProfileLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isVerifiedHost) {
        return (
            <div className="max-w-md w-full mx-auto bg-background rounded-2xl p-8 text-center border border-border shadow-sm">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plane className="text-yellow-600" size={32} />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                    {hostProfile?.status === 'pending' ? "Account Verification Pending" : "Host Access Required"}
                </h2>
                <p className="text-muted-foreground mb-6">
                    {hostProfile?.status === 'pending'
                        ? "Your host application is currently under review. You can post travel plans once your account is approved."
                        : "You need to be an approved host to post travel plans."
                    }
                </p>
                <button
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-xl font-bold border border-border text-foreground text-xs hover:bg-secondary transition-colors"
                >
                    Back to Travel Partners
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-none space-y-8">
            {/* Header */}
            <div>
                <button
                    onClick={onCancel}
                    className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-accent transition-colors mb-4 cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Travel Partners
                </button>
                <h2 className="text-3xl font-bold text-foreground mb-2">Post Travel Plan</h2>
                <p className="text-muted-foreground">Share your travel details to match with co-travelers.</p>
            </div>

            <div className="space-y-8">
                {/* 1. PERSONAL INFORMATION */}
                <div className="pb-8 border-b border-border space-y-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <User size={18} /> Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <Label required={true}>Age</Label>
                            <Input
                                name="age"
                                type="number"
                                placeholder="Enter your age"
                                state={formErrors.age ? "error" : "default"}
                                onChange={handleChange}
                                value={form.age}
                            />
                        </div>

                        <div>
                            <Label required={true}>Languages (comma separated)</Label>
                            <Input
                                name="languages"
                                placeholder="e.g., English, Hindi, Spanish"
                                state={formErrors.languages ? "error" : "default"}
                                onChange={handleChange}
                                value={form.languages}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. TRIP INFORMATION */}
                <div className="pb-8 border-b border-border space-y-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Plane size={18} /> Trip Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <Label required={true}>Airline</Label>
                            <Input
                                name="airline"
                                placeholder="Enter airline name"
                                state={formErrors.airline ? "error" : "default"}
                                onChange={handleChange}
                                value={form.airline}
                            />
                        </div>
                        <div>
                            <Label>Flight Number</Label>
                            <Input
                                name="flight_number"
                                placeholder="Enter flight number (e.g., AF226)"
                                onChange={handleChange}
                                value={form.flight_number}
                            />
                        </div>
                        <div>
                            <Label required={true}>Number of Travelers</Label>
                            <Input
                                name="travelers_count"
                                type="number"
                                min="1"
                                placeholder="How many are traveling?"
                                onChange={handleChange}
                                value={form.travelers_count}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. FLIGHT PATH */}
                <div className="pb-8 border-b border-border space-y-6">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <MapPin size={18} /> Flight Path
                    </h3>

                    {/* Origin Section */}
                    <div className="space-y-4">
                        <h4 className="text-md font-medium text-foreground">Origin (Flying From)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SearchableDropdown
                                label="Country"
                                placeholder="Select Country"
                                options={countriesList}
                                value={form.from_country}
                                onChange={handleFromCountryChange}
                                error={formErrors.from_country}
                                required={true}
                            />
                            <SearchableDropdown
                                label="State"
                                placeholder="Select State"
                                options={fromStatesList}
                                value={form.from_state}
                                disabled={!selectedFromCountry}
                                isLoading={!fromStatesList.length && selectedFromCountry}
                                onChange={handleFromStateChange}
                            />
                            <SearchableDropdown
                                label="City"
                                placeholder="Select City"
                                options={fromCitiesList}
                                value={form.from_city}
                                disabled={!selectedFromState}
                                isLoading={!fromCitiesList.length && !fromCitiesFetched && selectedFromState}
                                onChange={handleFromCityChange}
                                error={formErrors.from_city}
                                required={true}
                            />
                        </div>
                    </div>

                    {/* Destination Section */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <h4 className="text-md font-medium text-foreground">Destination (Flying To)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SearchableDropdown
                                label="Country"
                                placeholder="Select Country"
                                options={countriesList}
                                value={form.to_country}
                                onChange={handleToCountryChange}
                                error={formErrors.to_country}
                                required={true}
                            />
                            <SearchableDropdown
                                label="State"
                                placeholder="Select State"
                                options={toStatesList}
                                value={form.to_state}
                                disabled={!selectedToCountry}
                                isLoading={!toStatesList.length && selectedToCountry}
                                onChange={handleToStateChange}
                            />
                            <SearchableDropdown
                                label="City"
                                placeholder="Select City"
                                options={toCitiesList}
                                value={form.to_city}
                                disabled={!selectedToState}
                                isLoading={!toCitiesList.length && !toCitiesFetched && selectedToState}
                                onChange={handleToCityChange}
                                error={formErrors.to_city}
                                required={true}
                            />
                        </div>
                    </div>
                </div>

                {/* 4. TRAVEL TIMELINE */}
                <div className="pb-8 border-b border-border space-y-4">
                    <h3 className="text-lg font-bold text-foreground">Travel Timeline</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label required={true}>Departure Date & Time</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    name="travel_date"
                                    type="date"
                                    className="w-1/2"
                                    state={formErrors.travel_date ? "error" : "default"}
                                    onChange={handleChange}
                                    value={form.travel_date}
                                />
                                <Input
                                    name="departure_time"
                                    type="time"
                                    className="w-1/2"
                                    state={formErrors.departure_time ? "error" : "default"}
                                    onChange={handleChange}
                                    value={form.departure_time}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Arrival Date & Time</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    name="arrival_date"
                                    type="date"
                                    className="w-1/2"
                                    onChange={handleChange}
                                    value={form.arrival_date}
                                />
                                <Input
                                    name="arrival_time"
                                    type="time"
                                    className="w-1/2"
                                    onChange={handleChange}
                                    value={form.arrival_time}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
                <button
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-xl font-bold border border-border text-foreground hover:bg-secondary transition-colors text-sm h-11 cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 text-sm bg-accent hover:bg-accent-dark transition-all h-11 min-w-[120px] cursor-pointer"
                    style={{ opacity: isSubmitting ? 0.7 : 1 }}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        "Submit Plan"
                    )}
                </button>
            </div>
        </div>
    );
}
