import React from "react";
import {
    Search,
    Filter,
    X,
    ChevronDown,
    Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES } from "@/lib/mock-data";
import { City } from 'country-state-city';

export default function TravelFilter({
    travels = [],
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    onReset
}) {

    const [isCountryOpen, setIsCountryOpen] = React.useState(false);
    const countryRef = React.useRef(null);

    const [countrySearch, setCountrySearch] = React.useState("");
    const countryInputRef = React.useRef(null);

    const [isCityOpen, setIsCityOpen] = React.useState(false);
    const cityRef = React.useRef(null);

    const [citySearch, setCitySearch] = React.useState("");
    const cityInputRef = React.useRef(null);

    const hasActiveFilters =
        filters.country ||
        filters.state ||
        filters.city ||
        searchQuery;

    // Selected Country
    const selectedCountry = COUNTRIES.find(
        (c) => c.name === filters.country
    );

    // Selected Country code for City list
    const countryIsoCode = selectedCountry?.code;

    // Get cities
    const citiesList = React.useMemo(() => {
        if (!countryIsoCode) return [];
        return City.getCitiesOfCountry(countryIsoCode);
    }, [countryIsoCode]);

    // City search filter
    const filteredCities = React.useMemo(() => {
        if (!citySearch) return citiesList;
        const lowerSearch = citySearch.toLowerCase();
        return citiesList.filter(c => c.name.toLowerCase().includes(lowerSearch));
    }, [citiesList, citySearch]);

    // Country Search Filter
    const filteredCountries = COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase())
    );

    // Reset country search
    React.useEffect(() => {
        if (!isCountryOpen) {
            setCountrySearch("");
        } else {
            setTimeout(() => {
                countryInputRef.current?.focus();
            }, 100);
        }
    }, [isCountryOpen]);

    // Reset city search
    React.useEffect(() => {
        if (!isCityOpen) {
            setCitySearch("");
        } else {
            setTimeout(() => {
                cityInputRef.current?.focus();
            }, 100);
        }
    }, [isCityOpen]);

    // Close dropdown outside click
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                countryRef.current &&
                !countryRef.current.contains(e.target)
            ) {
                setIsCountryOpen(false);
            }
            if (
                cityRef.current &&
                !cityRef.current.contains(e.target)
            ) {
                setIsCityOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, []);

    // =========================
    // FULL FILTER LOGIC
    // =========================

    const filteredTravels = travels.filter((item) => {

        const search = searchQuery.toLowerCase();

        // Main Search
        const matchesSearch =
            !searchQuery ||
            item.travelerName
                ?.toLowerCase()
                .includes(search) ||
            item.flight?.airline
                ?.toLowerCase()
                .includes(search) ||
            item.country
                ?.toLowerCase()
                .includes(search) ||
            item.state
                ?.toLowerCase()
                .includes(search) ||
            item.city
                ?.toLowerCase()
                .includes(search);

        // Country Filter
        const matchesCountry =
            !filters.country ||
            item.country?.toLowerCase() ===
            filters.country.toLowerCase();

        // State Filter
        const matchesState =
            !filters.state ||
            item.state
                ?.toLowerCase()
                .includes(filters.state.toLowerCase());

        // City Filter
        const matchesCity =
            !filters.city ||
            item.city
                ?.toLowerCase()
                .includes(filters.city.toLowerCase());

        return (
            matchesSearch &&
            matchesCountry &&
            matchesState &&
            matchesCity
        );
    });

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl mt-6 mb-12 border border-white/50 relative z-20"
            >
                <div className="p-6 lg:p-8">

                    <div className="flex flex-col gap-6">

                        {/* Header */}
                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-2 text-primary/60 pointer-events-none">
                                <Filter size={18} />
                                <span className="text-sm font-bold uppercase tracking-wider">
                                    Refine Search
                                </span>
                            </div>

                            {hasActiveFilters && (
                                <button
                                    onClick={onReset}
                                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
                                >
                                    <X size={14} />
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                            {/* Search */}
                            <div className="md:col-span-12 lg:col-span-5 relative group">

                                <Search
                                    className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40"
                                    size={20}
                                />

                                <input
                                    type="text"
                                    placeholder="Search traveler name, airline..."
                                    className="w-full pl-14 pr-4 h-14 rounded-2xl bg-neutral/5 border border-neutral/10 focus:border-accent/30 focus:bg-white focus:ring-4 focus:ring-accent/5 outline-none transition-all font-medium text-primary placeholder:text-primary/30"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>

                            {/* Country */}
                            <div
                                className="md:col-span-4 lg:col-span-3 relative"
                                ref={countryRef}
                            >

                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsCountryOpen(!isCountryOpen)
                                    }
                                    className="w-full h-14 px-5 rounded-2xl bg-neutral/5 border border-neutral/10 hover:border-accent/30 focus:border-accent/30 focus:bg-white focus:ring-4 focus:ring-accent/5 outline-none transition-all font-medium text-primary flex items-center justify-between gap-2"
                                >

                                    <div className="flex items-center gap-3">

                                        {selectedCountry ? (
                                            <>
                                                {selectedCountry.flag.startsWith("/") ||
                                                    selectedCountry.flag.startsWith("http") ? (
                                                    <img
                                                        src={selectedCountry.flag}
                                                        alt={selectedCountry.name}
                                                        className="w-6 h-4 object-cover rounded"
                                                    />
                                                ) : (
                                                    <span className="text-lg">
                                                        {selectedCountry.flag}
                                                    </span>
                                                )}

                                                <span className="truncate">
                                                    {selectedCountry.name}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Globe
                                                    size={18}
                                                    className="text-primary/40"
                                                />
                                                <span className="text-primary/40">
                                                    Select Country
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <ChevronDown
                                        size={18}
                                        className={`text-primary/40 transition-transform ${isCountryOpen
                                            ? "rotate-180"
                                            : ""
                                            }`}
                                    />
                                </button>

                                {/* Dropdown */}
                                <AnimatePresence>
                                    {isCountryOpen && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95
                                            }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                                        >

                                            <div className="p-3 border-b border-gray-100">
                                                <div className="relative">

                                                    <Search
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                        size={14}
                                                    />

                                                    <input
                                                        ref={countryInputRef}
                                                        type="text"
                                                        placeholder="Search country..."
                                                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg"
                                                        value={countrySearch}
                                                        onChange={(e) =>
                                                            setCountrySearch(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="max-h-64 overflow-y-auto">

                                                <button
                                                    onClick={() => {
                                                        setFilters({
                                                            ...filters,
                                                            country: ""
                                                        });

                                                        setIsCountryOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50"
                                                >
                                                    All Countries
                                                </button>

                                                {filteredCountries.map(
                                                    (country) => (
                                                        <button
                                                            key={country.code}
                                                            onClick={() => {

                                                                setFilters({
                                                                    ...filters,
                                                                    country:
                                                                        country.name
                                                                });

                                                                setIsCountryOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 ${filters.country ===
                                                                country.name
                                                                ? "bg-accent/10 text-accent font-bold"
                                                                : ""
                                                                }`}
                                                        >

                                                            {country.flag.startsWith("/") ||
                                                                country.flag.startsWith(
                                                                    "http"
                                                                ) ? (
                                                                <img
                                                                    src={
                                                                        country.flag
                                                                    }
                                                                    alt={
                                                                        country.name
                                                                    }
                                                                    className="w-6 h-4 object-cover rounded"
                                                                />
                                                            ) : (
                                                                <span className="text-lg">
                                                                    {
                                                                        country.flag
                                                                    }
                                                                </span>
                                                            )}

                                                            <span>
                                                                {country.name}
                                                            </span>
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* City Dropdown */}
                            <div
                                className="md:col-span-4 lg:col-span-4 relative"
                                ref={cityRef}
                            >
                                <button
                                    type="button"
                                    disabled={!filters.country}
                                    onClick={() =>
                                        setIsCityOpen(!isCityOpen)
                                    }
                                    className={`w-full h-14 px-5 rounded-2xl border transition-all font-medium flex items-center justify-between gap-2 ${
                                        !filters.country
                                            ? "bg-neutral/5 border-neutral/10 opacity-50 cursor-not-allowed text-primary/30"
                                            : "bg-neutral/5 border-neutral/10 hover:border-accent/30 focus:border-accent/30 focus:bg-white focus:ring-4 focus:ring-accent/5 text-primary"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Globe
                                            size={18}
                                            className={filters.city ? "text-accent" : "text-primary/40"}
                                        />
                                        {filters.city ? (
                                            <span className="truncate">{filters.city}</span>
                                        ) : (
                                            <span className="text-primary/40">
                                                {!filters.country ? "Select Country First" : "Select City"}
                                            </span>
                                        )}
                                    </div>

                                    <ChevronDown
                                        size={18}
                                        className={`text-primary/40 transition-transform ${isCityOpen ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {isCityOpen && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95
                                            }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                                        >
                                            <div className="p-3 border-b border-gray-100">
                                                <div className="relative">
                                                    <Search
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                        size={14}
                                                    />
                                                    <input
                                                        ref={cityInputRef}
                                                        type="text"
                                                        placeholder="Search city..."
                                                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-black outline-none focus:border-accent transition-all"
                                                        value={citySearch}
                                                        onChange={(e) => setCitySearch(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="max-h-64 overflow-y-auto">
                                                <button
                                                    onClick={() => {
                                                        setFilters({
                                                            ...filters,
                                                            city: ""
                                                        });
                                                        setIsCityOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-black font-medium"
                                                >
                                                    All Cities
                                                </button>

                                                {filteredCities.length > 0 ? (
                                                    filteredCities.map((city, index) => (
                                                        <button
                                                            key={`${city.name}-${index}`}
                                                            onClick={() => {
                                                                setFilters({
                                                                    ...filters,
                                                                    city: city.name
                                                                });
                                                                setIsCityOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 text-black ${
                                                                filters.city === city.name
                                                                    ? "bg-accent/10 text-accent font-bold"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {city.name}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-sm text-gray-400 italic text-center">
                                                        No cities found
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={`h-1 w-full bg-gradient-to-r from-transparent via-accent to-transparent transition-opacity duration-500 ${hasActiveFilters
                        ? "opacity-100"
                        : "opacity-0"
                        }`}
                />
            </motion.div>

            {/* ========================= */}
            {/* FILTERED DATA */}
            {/* ========================= */}

            <div className="grid gap-6">
                {filteredTravels.length > 0 ? (
                    filteredTravels.map((item) => (
                        <div
                            key={item.id}
                            className="p-5 bg-white rounded-2xl shadow"
                        >
                            <h2 className="font-bold text-lg">
                                {item.travelerName}
                            </h2>

                            <p>{item.airlineName}</p>

                            <p>
                                {item.country} / {item.state} / {item.city}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        No results found
                    </div>
                )}
            </div>
        </>
    );
}