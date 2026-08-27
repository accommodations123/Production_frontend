import React from "react";
import {
    Search,
    X,
    ChevronDown,
    Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES } from "@/lib/mock-data";
import { loadLocationData } from '@/lib/lazyLocationData';

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
    const selectedCountry = COUNTRIES.find((c) => {
        if (!filters.country) return false;
        const lowerFilter = filters.country.toLowerCase().trim();
        const lowerName = c.name.toLowerCase().trim();
        if (lowerName === lowerFilter) return true;
        if (lowerFilter === "united states" || lowerFilter === "usa" || lowerFilter === "us" || lowerFilter === "united states of america") {
            return c.code === "US" || c.name.toLowerCase().includes("united states");
        }
        if (lowerFilter === "united kingdom" || lowerFilter === "uk" || lowerFilter === "gb" || lowerFilter === "great britain") {
            return c.code === "UK" || c.code === "GB" || c.name.toLowerCase().includes("united kingdom");
        }
        return lowerName.includes(lowerFilter) || lowerFilter.includes(lowerName);
    });

    // Selected Country code for City list
    const countryIsoCode = selectedCountry?.code;

    // Lazy-load City data
    const [citiesList, setCitiesList] = React.useState([]);
    React.useEffect(() => {
        if (!countryIsoCode) { setCitiesList([]); return; }
        let cancelled = false;
        loadLocationData().then(({ City }) => {
            if (!cancelled) setCitiesList(City.getCitiesOfCountry(countryIsoCode));
        });
        return () => { cancelled = true; };
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
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/80 relative z-20"
            >
                <div className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                        {/* Search */}
                        <div className="flex-1 min-w-0 relative">
                            <Search
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                                size={16}
                            />
                            <input
                                type="text"
                                placeholder="Search traveler, airline, city..."
                                className="w-full pl-10 pr-4 h-10 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#CB2A25]/30 focus:bg-white focus:ring-4 focus:ring-[#CB2A25]/5 outline-none transition-all font-medium text-sm text-[#00142E] placeholder:text-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Country */}
                        <div className="relative sm:w-48 lg:w-56" ref={countryRef}>
                            <button
                                type="button"
                                onClick={() => setIsCountryOpen(!isCountryOpen)}
                                className="w-full h-10 px-3.5 rounded-xl bg-gray-50 border border-gray-200 hover:border-[#CB2A25]/30 focus:border-[#CB2A25]/30 focus:bg-white focus:ring-4 focus:ring-[#CB2A25]/5 outline-none transition-all font-medium text-sm text-[#00142E] flex items-center justify-between gap-2"
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
                        <div className="relative sm:w-48 lg:w-56" ref={cityRef}>
                            <button
                                type="button"
                                disabled={!filters.country}
                                onClick={() => setIsCityOpen(!isCityOpen)}
                                className={`w-full h-10 px-3.5 rounded-xl border transition-all font-medium text-sm flex items-center justify-between gap-2 ${
                                    !filters.country
                                        ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed text-gray-400"
                                        : "bg-gray-50 border-gray-200 hover:border-[#CB2A25]/30 focus:border-[#CB2A25]/30 focus:bg-white focus:ring-4 focus:ring-[#CB2A25]/5 text-[#00142E]"
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
                        {/* Clear button */}
                        {hasActiveFilters && (
                            <button
                                onClick={onReset}
                                className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors shrink-0 h-10"
                            >
                                <X size={14} />
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
}