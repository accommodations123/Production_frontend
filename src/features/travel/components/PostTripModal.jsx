import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plane, User, MapPin, Loader2, Calendar, Clock } from "lucide-react";
import { useCreateTripMutation, useGetHostProfileQuery } from "@/store/api/hostApi";
import { useAuth } from "@/features/events/hooks/useAuth";
import { useGetMeQuery } from "@/store/api/authApi";
import { loadLocationData } from '@/shared/utils/lazyLocationData';
import SearchableDropdown from "@/shared/ui/SearchableDropdown";
import { useNavigate } from "react-router-dom";

export default function PostTripModal({ onClose, onAdd }) {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
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

    const [activeTab, setActiveTab] = useState("personal");
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
            // Check which tab has errors
            const personalFields = ["age", "languages"];
            const hasPersonalErrors = Object.keys(errors).some(field => personalFields.includes(field));

            if (hasPersonalErrors) {
                setActiveTab("personal");
            } else {
                setActiveTab("trip");
            }

            alert("Please fill in all required fields marked in red.");
            return;
        }

        try {
            const payload = {
                host_id: currentUser?.id || 1,
                from_country: form.from_country,
                from_state: form.from_state,
                from_city: form.from_city,
                to_country: form.to_country,
                to_city: form.to_city,
                travel_date: form.travel_date,
                departure_time: form.departure_time,
                arrival_date: form.arrival_date,
                arrival_time: form.arrival_time,
                airline: form.airline,
                flight_number: form.flight_number,
                travelers_count: Number(form.travelers_count),
                age: Number(form.age),
                languages: form.languages.split(",").map(lang => lang.trim()).filter(Boolean),
                status: "pending",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const response = await createTrip(payload).unwrap();

            onAdd({
                ...response,
                id: response.id || Date.now(),
                user: {
                    fullName: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}` : "Guest User",
                    age: Number(form.age),
                    languages: form.languages.split(",").map((l) => l.trim()),
                    phone: currentUser?.phone || "",
                    email: currentUser?.email || "",
                    whatsapp: currentUser?.whatsapp || "",
                    image: currentUser?.image || currentUser?.profile_image || "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80",
                },
                destination: `${form.to_city}, ${form.to_country}`,
                date: form.travel_date,
                time: form.departure_time,
                flight: {
                    airline: form.airline,
                    flightName: form.flightName,
                    flightNumber: form.flight_number,
                    from: form.from_city,
                    to: form.to_city,
                    departureDate: form.travel_date,
                    departureTime: form.departure_time,
                    arrivalDate: form.arrival_date,
                    arrivalTime: form.arrival_time,
                },
                travelers_count: form.travelers_count,
            });
            onClose();
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

    return (
        <div className="w-full">
            {/* Access Denied View */}
            {!isProfileLoading && !isVerifiedHost && (
                <div className="bg-white w-full max-w-2xl mx-auto rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden p-8 text-center my-8">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {hostProfile?.status === 'pending' ? "Account Verification Pending" : "Host Access Required"}
                    </h2>
                    <p className="text-[#222222] mb-6">
                        {hostProfile?.status === 'pending'
                            ? "Your host application is currently under review. You can post travel plans once your account is approved."
                            : "You need to be an approved host to post travel plans."
                        }
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm cursor-pointer"
                        >
                            Back to Travel
                        </button>
                        {hostProfile?.status !== 'pending' && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    navigate("/hosts");
                                }}
                                className="px-5 py-2 text-sm font-medium text-white bg-[#C93A30] rounded-lg hover:bg-[#b02e25] transition shadow-sm cursor-pointer"
                            >
                                Become a Host
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Normal Form View */}
            {(isProfileLoading || isVerifiedHost) && (
                <div
                    className="bg-white w-full rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden"
                    style={{ backgroundColor: 'var(--color-background)' }}
                >
                    {/* Modern Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-extrabold text-[#00142E] flex items-center gap-2">
                                <Plane className="text-[#E1392A] w-5 h-5" /> Post Travel Plan
                            </h2>
                            <p className="text-xs text-[#484848] mt-1 font-medium">Share your itinerary to match with fellow travelers</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* 1. Personal Details Section */}
                        <div className="space-y-4">
                            <h3 className="text-base font-bold text-[#00142E] flex items-center gap-2 pb-2 border-b border-gray-50">
                                <User size={18} className="text-[#E1392A]" /> Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Age <span className="text-red-500 ml-1">*</span></label>
                                    <input
                                        name="age"
                                        type="number"
                                        placeholder="Enter your age"
                                        className={`w-full rounded-lg border ${formErrors.age ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 text-sm outline-none transition-all`}
                                        onChange={handleChange}
                                        value={form.age}
                                        style={{ borderColor: formErrors.age ? '#ef4444' : 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Languages (comma separated) <span className="text-red-500 ml-1">*</span></label>
                                    <input
                                        name="languages"
                                        placeholder="e.g., English, Hindi, Spanish"
                                        className={`w-full rounded-lg border ${formErrors.languages ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 text-sm outline-none transition-all`}
                                        onChange={handleChange}
                                        value={form.languages}
                                        style={{ borderColor: formErrors.languages ? '#ef4444' : 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Trip Details Section */}
                        <div className="space-y-6 pt-2">
                            <h3 className="text-base font-bold text-[#00142E] flex items-center gap-2 pb-2 border-b border-gray-50">
                                <Plane size={18} className="text-[#E1392A]" /> Trip Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Airline <span className="text-red-500 ml-1">*</span></label>
                                    <input
                                        name="airline"
                                        placeholder="Enter airline name"
                                        className={`w-full rounded-lg border ${formErrors.airline ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 text-sm outline-none transition-all`}
                                        onChange={handleChange}
                                        value={form.airline}
                                        style={{ borderColor: formErrors.airline ? '#ef4444' : 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Flight Number</label>
                                    <input
                                        name="flight_number"
                                        placeholder="Enter flight number (e.g., AF226)"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition-all"
                                        onChange={handleChange}
                                        value={form.flight_number}
                                        style={{ borderColor: 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Number of Travelers <span className="text-red-500 ml-1">*</span></label>
                                    <input
                                        name="travelers_count"
                                        type="number"
                                        min="1"
                                        placeholder="How many are traveling?"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition-all"
                                        onChange={handleChange}
                                        value={form.travelers_count}
                                        style={{ borderColor: 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                    />
                                </div>
                            </div>

                            {/* Origin Section */}
                            <div className="space-y-4 pt-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-foreground)' }}>
                                    <MapPin size={16} style={{ color: 'var(--color-accent)' }} /> Origin (Flying From)
                                </h4>
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
                            <div className="space-y-4 pt-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-foreground)' }}>
                                    <MapPin size={16} style={{ color: 'var(--color-accent)' }} /> Destination (Flying To)
                                </h4>
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

                            {/* Timing Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Departure Date & Time <span className="text-red-500 ml-1">*</span></label>
                                    <div className="flex gap-2">
                                        <div className="relative w-1/2 flex items-center">
                                            <input
                                                name="travel_date"
                                                type="date"
                                                className={`w-full rounded-lg border ${formErrors.travel_date ? "border-red-500" : "border-gray-300"} bg-white pl-3 pr-10 py-2.5 text-sm outline-none transition-all cursor-pointer`}
                                                onChange={handleChange}
                                                value={form.travel_date}
                                                onClick={(e) => e.target.showPicker?.()}
                                                style={{ borderColor: formErrors.travel_date ? '#ef4444' : 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                            />
                                            <Calendar className="absolute right-3 h-4 w-4 text-slate-400 pointer-events-none" />
                                        </div>
                                        <div className="relative w-1/2 flex items-center">
                                            <input
                                                name="departure_time"
                                                type="time"
                                                className={`w-full rounded-lg border ${formErrors.departure_time ? "border-red-500" : "border-gray-300"} bg-white pl-3 pr-10 py-2.5 text-sm outline-none transition-all cursor-pointer`}
                                                onChange={handleChange}
                                                value={form.departure_time}
                                                onClick={(e) => e.target.showPicker?.()}
                                                style={{ borderColor: formErrors.departure_time ? '#ef4444' : 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                            />
                                            <Clock className="absolute right-3 h-4 w-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Arrival Date & Time</label>
                                    <div className="flex gap-2">
                                        <div className="relative w-1/2 flex items-center">
                                            <input
                                                name="arrival_date"
                                                type="date"
                                                className="w-full rounded-lg border border-gray-300 bg-white pl-3 pr-10 py-2.5 text-sm outline-none transition-all cursor-pointer"
                                                onChange={handleChange}
                                                value={form.arrival_date}
                                                onClick={(e) => e.target.showPicker?.()}
                                                style={{ borderColor: 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                            />
                                            <Calendar className="absolute right-3 h-4 w-4 text-slate-400 pointer-events-none" />
                                        </div>
                                        <div className="relative w-1/2 flex items-center">
                                            <input
                                                name="arrival_time"
                                                type="time"
                                                className="w-full rounded-lg border border-gray-300 bg-white pl-3 pr-10 py-2.5 text-sm outline-none transition-all cursor-pointer"
                                                onChange={handleChange}
                                                value={form.arrival_time}
                                                onClick={(e) => e.target.showPicker?.()}
                                                style={{ borderColor: 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                            />
                                            <Clock className="absolute right-3 h-4 w-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Row */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#E1392A] hover:bg-[#C82E20] hover:shadow-[0_8px_20px_rgba(203,42,37,0.25)] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
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
                </div>
            )}
        </div>
    );
}
