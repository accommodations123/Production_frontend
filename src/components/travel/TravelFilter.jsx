import React from "react";
import { Search, MapPin, Filter, X, ChevronDown, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES } from "@/lib/mock-data";

export default function TravelFilter({
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

    const hasActiveFilters = filters.country || filters.state || filters.city || searchQuery;

    // Get selected country object
    const selectedCountry = COUNTRIES.find(c => c.name === filters.country);

    // Filter countries based on search
    const filteredCountries = COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase())
    );

    // Reset search when dropdown closes or opens
    React.useEffect(() => {
        if (!isCountryOpen) {
            setCountrySearch("");
        } else {
            // Focus input when opened
            setTimeout(() => {
                countryInputRef.current?.focus();
            }, 100);
        }
    }, [isCountryOpen]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (countryRef.current && !countryRef.current.contains(e.target)) {
                setIsCountryOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
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
                            <span className="text-sm font-bold uppercase tracking-wider">Refine Search</span>
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={onReset}
                                className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
                            >
                                <X size={14} /> Clear All
                            </button>
                        )}
                    </div>

                    {/* Filter Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Main Search */}
                        <div className="md:col-span-12 lg:col-span-5 relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-accent transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search traveler name, airline..."
                                className="w-full pl-14 pr-4 h-14 rounded-2xl bg-neutral/5 border border-neutral/10 focus:border-accent/30 focus:bg-white focus:ring-4 focus:ring-accent/5 outline-none transition-all font-medium text-primary placeholder:text-primary/30"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Country Dropdown */}
                        <div className="md:col-span-4 lg:col-span-3 relative" ref={countryRef}>
                            <button
                                type="button"
                                onClick={() => setIsCountryOpen(!isCountryOpen)}
                                className="w-full h-14 px-5 rounded-2xl bg-neutral/5 border border-neutral/10 hover:border-accent/30 focus:border-accent/30 focus:bg-white focus:ring-4 focus:ring-accent/5 outline-none transition-all font-medium text-primary flex items-center justify-between gap-2 cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    {selectedCountry ? (
                                        <>
                                            {(selectedCountry.flag.startsWith('/') || selectedCountry.flag.startsWith('http')) ? (
                                                <img src={selectedCountry.flag} alt={selectedCountry.name} className="w-6 h-4 object-cover rounded" />
                                            ) : (
                                                <span className="text-lg">{selectedCountry.flag}</span>
                                            )}
                                            <span className="truncate">{selectedCountry.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Globe size={18} className="text-primary/40" />
                                            <span className="text-primary/40">Select Country</span>
                                        </>
                                    )}
                                </div>
                                <ChevronDown size={18} className={`text-primary/40 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Country Dropdown Menu */}
                            <AnimatePresence>
                                {isCountryOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                                    >
                                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                            <p className="text-[10px] font-black text-accent uppercase tracking-widest">Select Country</p>
                                            <p className="text-[10px] text-gray-500 mt-0.5">Filter trips by destination country</p>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            <div className="p-3 border-b border-gray-100 bg-white sticky top-0 z-10">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                    <input
                                                        ref={countryInputRef}
                                                        type="text"
                                                        placeholder="Search country..."
                                                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-accent/50 focus:bg-white transition-all"
                                                        value={countrySearch}
                                                        onChange={(e) => setCountrySearch(e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {/* All Countries Option - Only show if no search or matches "All" */}
                                            {(!countrySearch || "all countries".includes(countrySearch.toLowerCase())) && (
                                                <button
                                                    onClick={() => {
                                                        setFilters({ ...filters, country: "" });
                                                        setIsCountryOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${!filters.country
                                                        ? 'bg-accent/10 text-accent font-bold'
                                                        : 'hover:bg-gray-50 text-gray-700'
                                                        }`}
                                                >
                                                    <Globe size={18} className="text-gray-400" />
                                                    <span>All Countries</span>
                                                </button>
                                            )}

                                            {filteredCountries.length > 0 ? (
                                                filteredCountries.map((country) => (
                                                    <button
                                                        key={country.code}
                                                        onClick={() => {
                                                            setFilters({ ...filters, country: country.name });
                                                            setIsCountryOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${filters.country === country.name
                                                            ? 'bg-accent/10 text-accent font-bold'
                                                            : 'hover:bg-gray-50 text-gray-700'
                                                            }`}
                                                    >
                                                        {(country.flag.startsWith('/') || country.flag.startsWith('http')) ? (
                                                            <img src={country.flag} alt={country.name} className="w-6 h-4 object-cover rounded shadow-sm" />
                                                        ) : (
                                                            <span className="text-lg">{country.flag}</span>
                                                        )}
                                                        <span>{country.name}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-sm text-gray-500">
                                                    No countries found
                                                </div>
                                            )}

                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* State Input */}
                        <div className="md:col-span-4 lg:col-span-2 relative group">
                            <input
                                type="text"
                                placeholder="State"
                                className="w-full px-5 h-14 rounded-2xl bg-neutral/5 border border-neutral/10 focus:border-accent/30 focus:bg-white focus:ring-4 focus:ring-accent/5 outline-none transition-all font-medium text-primary placeholder:text-primary/30"
                                value={filters.state}
                                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                            />
                        </div>

                        {/* City Input */}
                        <div className="md:col-span-4 lg:col-span-2 relative group">
                            <input
                                type="text"
                                placeholder="City"
                                className="w-full px-5 h-14 rounded-2xl bg-neutral/5 border border-neutral/10 focus:border-accent/30 focus:bg-white focus:ring-4 focus:ring-accent/5 outline-none transition-all font-medium text-primary placeholder:text-primary/30"
                                value={filters.city}
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Indication Line */}
            <div className={`h-1 w-full bg-gradient-to-r from-transparent via-accent to-transparent transition-opacity duration-500 ${hasActiveFilters ? 'opacity-100' : 'opacity-0'}`}></div>
        </motion.div>
    );
}
