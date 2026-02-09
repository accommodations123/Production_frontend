import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plane, User, MapPin, Clock, Loader2 } from "lucide-react";
import { useCreateTripMutation, useGetHostProfileQuery } from "../../store/api/hostApi";
import { useAuth } from "../../app/events/[id]/hooks/useAuth";
import { useGetMeQuery } from "../../store/api/authApi";
import { Country, State, City } from 'country-state-city';
import SearchableDropdown from "@/components/ui/SearchableDropdown";

export default function PostTripModal({ onClose, onAdd }) {
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

    // Country/State/City lists
    const [countriesList] = useState(Country.getAllCountries().map(c =>
        c.isoCode === 'US' ? { ...c, name: "United States of America" } : c
    ));

    // Origin location lists
    const [fromStatesList, setFromStatesList] = useState([]);
    const [fromCitiesList, setFromCitiesList] = useState([]);
    const [selectedFromCountry, setSelectedFromCountry] = useState(null);
    const [selectedFromState, setSelectedFromState] = useState(null);

    // Destination location lists
    const [toStatesList, setToStatesList] = useState([]);
    const [toCitiesList, setToCitiesList] = useState([]);
    const [selectedToCountry, setSelectedToCountry] = useState(null);
    const [selectedToState, setSelectedToState] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Handle Origin Country Change
    const handleFromCountryChange = (country) => {
        setSelectedFromCountry(country);
        setForm(prev => ({ ...prev, from_country: country.name, from_state: "", from_city: "" }));
        setFromStatesList(State.getStatesOfCountry(country.isoCode));
        setFromCitiesList([]);
        setSelectedFromState(null);
    };

    // Handle Origin State Change
    const handleFromStateChange = (state) => {
        setSelectedFromState(state);
        setForm(prev => ({ ...prev, from_state: state.name, from_city: "" }));
        if (selectedFromCountry) {
            setFromCitiesList(City.getCitiesOfState(selectedFromCountry.isoCode, state.isoCode));
        }
    };

    // Handle Origin City Change
    const handleFromCityChange = (city) => {
        setForm(prev => ({ ...prev, from_city: city.name }));
    };

    // Handle Destination Country Change
    const handleToCountryChange = (country) => {
        setSelectedToCountry(country);
        setForm(prev => ({ ...prev, to_country: country.name, to_state: "", to_city: "" }));
        setToStatesList(State.getStatesOfCountry(country.isoCode));
        setToCitiesList([]);
        setSelectedToState(null);
    };

    // Handle Destination State Change
    const handleToStateChange = (state) => {
        setSelectedToState(state);
        setForm(prev => ({ ...prev, to_state: state.name, to_city: "" }));
        if (selectedToCountry) {
            setToCitiesList(City.getCitiesOfState(selectedToCountry.isoCode, state.isoCode));
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
        if (!form.flight_number) errors.flight_number = "Flight number is required";
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
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
            >
                {/* Access Denied View */}
                {!isProfileLoading && !isVerifiedHost && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden p-6 text-center"
                    >
                        <div className="flex justify-end mb-2">
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plane className="text-yellow-600" size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {hostProfile?.status === 'pending' ? "Account Verification Pending" : "Host Access Required"}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {hostProfile?.status === 'pending'
                                ? "Your host application is currently under review. You can post travel plans once your account is approved."
                                : "You need to be an approved host to post travel plans."
                            }
                        </p>
                    </motion.div>
                )}

                {/* Normal Form View */}
                {(isProfileLoading || isVerifiedHost) && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden"
                        style={{ backgroundColor: 'var(--color-background)' }}
                    >
                        <div className="p-6" style={{ backgroundColor: 'var(--color-primary)' }}>
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Plane size={18} /> Post Travel Plan
                                </h2>
                                <motion.button
                                    whileHover={{ rotate: 90 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-white"
                                    onClick={onClose}
                                >
                                    <X className="cursor-pointer" />
                                </motion.button>
                            </div>
                        </div>

                        <div className="flex border-b">
                            <button
                                className={`px-6 py-3 font-medium ${activeTab === "personal" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                                onClick={() => setActiveTab("personal")}
                                style={{
                                    color: activeTab === "personal" ? 'var(--color-accent)' : 'var(--color-secondary)',
                                    borderBottomColor: activeTab === "personal" ? 'var(--color-accent)' : 'transparent'
                                }}
                            >
                                Personal Details
                            </button>
                            <button
                                className={`px-6 py-3 font-medium ${activeTab === "trip" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                                onClick={() => setActiveTab("trip")}
                                style={{
                                    color: activeTab === "trip" ? 'var(--color-accent)' : 'var(--color-secondary)',
                                    borderBottomColor: activeTab === "trip" ? 'var(--color-accent)' : 'transparent'
                                }}
                            >
                                Trip Details
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {activeTab === "personal" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-5"
                                >
                                    <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2" style={{ color: 'var(--color-foreground)' }}>
                                        <User size={18} /> Personal Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Age</label>
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
                                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Languages (comma separated)</label>
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

                                    <div className="flex justify-end">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setActiveTab("trip")}
                                            className="px-6 py-2 rounded-lg font-medium text-white"
                                            style={{ backgroundColor: 'var(--color-accent)' }}
                                        >
                                            Next: Trip Details
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "trip" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-5"
                                >
                                    <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2" style={{ color: 'var(--color-foreground)' }}>
                                        <Plane size={18} /> Trip Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Airline</label>
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
                                                className={`w-full rounded-lg border ${formErrors.flight_number ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 text-sm outline-none transition-all`}
                                                onChange={handleChange}
                                                value={form.flight_number}
                                                style={{ borderColor: formErrors.flight_number ? '#ef4444' : 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Number of Travelers</label>
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
                                    <div className="space-y-4">
                                        <h4 className="text-md font-medium flex items-center gap-2" style={{ color: 'var(--color-foreground)' }}>
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
                                                isLoading={!fromCitiesList.length && selectedFromState}
                                                onChange={handleFromCityChange}
                                                error={formErrors.from_city}
                                            />
                                        </div>
                                    </div>

                                    {/* Destination Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-md font-medium flex items-center gap-2" style={{ color: 'var(--color-foreground)' }}>
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
                                                isLoading={!toCitiesList.length && selectedToState}
                                                onChange={handleToCityChange}
                                                error={formErrors.to_city}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Departure Date & Time</label>
                                            <div className="flex gap-2">
                                                <input
                                                    name="travel_date"
                                                    type="date"
                                                    className={`w-1/2 rounded-lg border ${formErrors.travel_date ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 text-sm outline-none transition-all`}
                                                    onChange={handleChange}
                                                    value={form.travel_date}
                                                    style={{ borderColor: formErrors.travel_date ? '#ef4444' : 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                                />
                                                <input
                                                    name="departure_time"
                                                    type="time"
                                                    className={`w-1/2 rounded-lg border ${formErrors.departure_time ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 text-sm outline-none transition-all`}
                                                    onChange={handleChange}
                                                    value={form.departure_time}
                                                    style={{ borderColor: formErrors.departure_time ? '#ef4444' : 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Arrival Date & Time (Optional)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    name="arrival_date"
                                                    type="date"
                                                    className="w-1/2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition-all"
                                                    onChange={handleChange}
                                                    value={form.arrival_date}
                                                    style={{ borderColor: 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                                />
                                                <input
                                                    name="arrival_time"
                                                    type="time"
                                                    className="w-1/2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition-all"
                                                    onChange={handleChange}
                                                    value={form.arrival_time}
                                                    style={{ borderColor: 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setActiveTab("personal")}
                                            className="px-6 py-2 rounded-lg font-medium"
                                            style={{ borderColor: 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                        >
                                            Back
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                                            whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="px-6 py-2 rounded-lg font-medium text-white flex items-center gap-2"
                                            style={{ backgroundColor: 'var(--color-accent)', opacity: isSubmitting ? 0.7 : 1 }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                "Submit Plan"
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
