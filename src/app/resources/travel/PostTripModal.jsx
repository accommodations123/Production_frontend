import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plane, User, MapPin, Clock, Phone } from "lucide-react";
// import { GEOGRAPHIC_DATA, MORE_DESTINATIONS } from "../../app/resources/travel/constants";
import { CountryCodeSelect } from "@/components/ui/CountryCodeSelect";
import { Country, State, City } from 'country-state-city';
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import { useEffect } from "react";

export default function PostTripModal({ onClose, onAdd }) {
    const [form, setForm] = useState({
        fullName: "",
        age: "",
        gender: "",
        country: "",
        state: "",
        city: "",
        zipCode: "",
        languages: "",
        airline: "",
        flightName: "",
        flightNumber: "",
        origin: "",
        destination: "",
        departureDate: "",
        departureTime: "",
        arrivalDate: "",
        arrivalTime: "",
        stops: [],
        phone: "",
        phoneCode: "+91",
    });

    const [countriesList] = useState(Country.getAllCountries().map(c =>
        c.isoCode === 'US' ? { ...c, name: "United States of America" } : c
    ));
    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);

    useEffect(() => {
        if (form.country) {
            const countryObj = countriesList.find(c => c.name === form.country);
            if (countryObj) {
                setStatesList(State.getStatesOfCountry(countryObj.isoCode));
            }
        }
    }, []);

    const [activeTab, setActiveTab] = useState("personal");
    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const validateForm = () => {
        const errors = {};

        if (!form.fullName) errors.fullName = "Full name is required";
        if (!form.age) errors.age = "Age is required";
        if (!form.gender) errors.gender = "Gender is required";
        if (!form.country) errors.country = "Country is required";
        if (!form.state) errors.state = "State is required";
        if (!form.city) errors.city = "City is required";
        if (!form.zipCode) errors.zipCode = "Zip code is required";
        if (!form.languages) errors.languages = "Languages are required";
        if (!form.airline) errors.airline = "Airline is required";
        if (!form.origin) errors.origin = "Origin is required";
        if (!form.destination) errors.destination = "Destination is required";
        if (!form.departureDate) errors.departureDate = "Departure date is required";
        if (!form.departureTime) errors.departureTime = "Departure time is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const addStop = () => {
        setForm({
            ...form,
            stops: [...form.stops, { location: "", arrivalTime: "", departureTime: "" }]
        });
    };

    const updateStop = (index, field, value) => {
        const updatedStops = [...form.stops];
        updatedStops[index][field] = value;
        setForm({ ...form, stops: updatedStops });
    };

    const removeStop = (index) => {
        setForm({
            ...form,
            stops: form.stops.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        onAdd({
            id: Date.now(),
            user: {
                fullName: form.fullName,
                age: Number(form.age),
                gender: form.gender,
                country: form.country,
                state: form.state,
                city: form.city,
                zipCode: form.zipCode,
                languages: form.languages.split(",").map((l) => l.trim()),
                phone: form.phone ? `${form.phoneCode}${form.phone}` : "",
                email: "",
                whatsapp: "",
                image:
                    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80",
            },
            destination: `${form.destination}`,
            date: form.departureDate,
            time: form.departureTime,
            flight: {
                airline: form.airline,
                flightName: form.flightName,
                flightNumber: form.flightNumber,
                from: form.origin,
                to: form.destination,
                stops: form.stops,
                departureDate: form.departureDate,
                departureTime: form.departureTime,
                arrivalDate: form.arrivalDate,
                arrivalTime: form.arrivalTime,
            },
        });
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
            >
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
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Full Name</label>
                                        <input
                                            name="fullName"
                                            placeholder="Enter your full name"
                                            className={`w-full rounded-lg border ${formErrors.fullName ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 text-sm outline-none transition-all`}
                                            onChange={handleChange}
                                            value={form.fullName}
                                            style={{
                                                borderColor: formErrors.fullName ? '#ef4444' : 'var(--color-neutral)',
                                                color: 'var(--color-foreground)'
                                            }}
                                        />
                                    </div>

                                    {/* Phone Number */}
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Phone Number</label>
                                        <div className="flex gap-2">
                                            <div className="w-[100px] shrink-0">
                                                <CountryCodeSelect
                                                    value={form.phoneCode || "+91"}
                                                    onChange={(val) => setForm({ ...form, phoneCode: val })}
                                                    className="w-full"
                                                />
                                            </div>
                                            <input
                                                name="phone"
                                                type="tel"
                                                placeholder="1234567890"
                                                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition-all"
                                                onChange={handleChange}
                                                value={form.phone}
                                                style={{ borderColor: 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Age</label>
                                        <input
                                            name="age"
                                            type="number"
                                            placeholder="Enter your age"
                                            className={`w-full rounded-lg border ${formErrors.age ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 text-sm outline-none transition-all`}
                                            onChange={handleChange}
                                            value={form.age}
                                            style={{
                                                borderColor: formErrors.age ? '#ef4444' : 'var(--color-neutral)',
                                                color: 'var(--color-foreground)'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Gender</label>
                                        <select
                                            name="gender"
                                            className={`w-full rounded-lg border ${formErrors.gender ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 text-sm outline-none transition-all`}
                                            onChange={handleChange}
                                            value={form.gender}
                                            style={{
                                                borderColor: formErrors.gender ? '#ef4444' : 'var(--color-neutral)',
                                                color: 'var(--color-foreground)'
                                            }}
                                        >
                                            <option value="" disabled>Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>

                                    <div>
                                        <SearchableDropdown
                                            label="Country"
                                            placeholder="Select Country"
                                            options={countriesList}
                                            value={form.country}
                                            onChange={(option) => {
                                                setForm(prev => ({
                                                    ...prev,
                                                    country: option.name,
                                                    state: "",
                                                    city: ""
                                                }));
                                                setStatesList(State.getStatesOfCountry(option.isoCode));
                                                setCitiesList([]);
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <SearchableDropdown
                                            label="State"
                                            placeholder="Select State"
                                            options={statesList}
                                            value={form.state}
                                            disabled={!form.country}
                                            isLoading={!statesList.length && form.country}
                                            onChange={(option) => {
                                                setForm(prev => ({
                                                    ...prev,
                                                    state: option.name,
                                                    city: ""
                                                }));
                                                const countryObj = countriesList.find(c => c.name === form.country);
                                                if (countryObj) {
                                                    setCitiesList(City.getCitiesOfState(countryObj.isoCode, option.isoCode));
                                                }
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <SearchableDropdown
                                            label="City"
                                            placeholder="Select City"
                                            options={citiesList}
                                            value={form.city}
                                            disabled={!form.state}
                                            isLoading={!citiesList.length && form.state}
                                            onChange={(option) => {
                                                setForm(prev => ({
                                                    ...prev,
                                                    city: option.name
                                                }));
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Zip Code</label>
                                        <input
                                            name="zipCode"
                                            placeholder="Enter your zip code"
                                            className={`w-full rounded-lg border ${formErrors.zipCode ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 text-sm outline-none transition-all`}
                                            onChange={handleChange}
                                            value={form.zipCode}
                                            style={{
                                                borderColor: formErrors.zipCode ? '#ef4444' : 'var(--color-neutral)',
                                                color: 'var(--color-foreground)'
                                            }}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Languages</label>
                                        <input
                                            name="languages"
                                            placeholder="e.g., English, Hindi, Spanish"
                                            className={`w-full rounded-lg border ${formErrors.languages ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 text-sm outline-none transition-all`}
                                            onChange={handleChange}
                                            value={form.languages}
                                            style={{
                                                borderColor: formErrors.languages ? '#ef4444' : 'var(--color-neutral)',
                                                color: 'var(--color-foreground)'
                                            }}
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
                                            style={{
                                                borderColor: formErrors.airline ? '#ef4444' : 'var(--color-neutral)',
                                                color: 'var(--color-foreground)'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Flight Name</label>
                                        <input
                                            name="flightName"
                                            placeholder="Enter flight name"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition-all"
                                            onChange={handleChange}
                                            value={form.flightName}
                                            style={{ borderColor: 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-md font-medium flex items-center gap-2" style={{ color: 'var(--color-foreground)' }}>
                                        <MapPin size={16} style={{ color: 'var(--color-accent)' }} /> Route
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>From (Origin)</label>
                                            <input
                                                name="origin"
                                                placeholder="e.g., New Delhi (DEL)"
                                                className={`w-full rounded-lg border ${formErrors.origin ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 text-sm outline-none transition-all`}
                                                onChange={handleChange}
                                                value={form.origin}
                                                style={{
                                                    borderColor: formErrors.origin ? '#ef4444' : 'var(--color-neutral)',
                                                    color: 'var(--color-foreground)'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>To (Destination)</label>
                                            <select
                                                name="destination"
                                                className={`w-full rounded-lg border ${formErrors.destination ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 text-sm outline-none transition-all`}
                                                onChange={handleChange}
                                                value={form.destination}
                                                style={{
                                                    borderColor: formErrors.destination ? '#ef4444' : 'var(--color-neutral)',
                                                    color: 'var(--color-foreground)'
                                                }}
                                            >
                                                <option value="" disabled>Select Destination</option>
                                                {MORE_DESTINATIONS.map(destination => (
                                                    <option key={destination} value={destination}>{destination}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Departure Date</label>
                                        <input
                                            name="departureDate"
                                            type="date"
                                            className={`w-full rounded-lg border ${formErrors.departureDate ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 text-sm outline-none transition-all`}
                                            onChange={handleChange}
                                            value={form.departureDate}
                                            style={{ borderColor: 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>Departure Time</label>
                                        <input
                                            name="departureTime"
                                            type="time"
                                            className={`w-full rounded-lg border ${formErrors.departureTime ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 text-sm outline-none transition-all`}
                                            onChange={handleChange}
                                            value={form.departureTime}
                                            style={{ borderColor: 'var(--color-neutral)', color: 'var(--color-foreground)' }}
                                        />
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
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSubmit}
                                        className="px-6 py-2 rounded-lg font-medium text-white"
                                        style={{ backgroundColor: 'var(--color-accent)' }}
                                    >
                                        Submit Plan
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
