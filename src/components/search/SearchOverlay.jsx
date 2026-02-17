import React, { useState, useEffect, useCallback } from 'react';
import { X, MapPin, Clock, ArrowUpRight, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const RECENT_SEARCHES_KEY = 'recentLocationSearches';
const MAX_RECENT_SEARCHES = 5;

// Get recent searches from localStorage
const getRecentSearches = () => {
    try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        return stored ? JSON.parse(stored) : []
    } catch {
        return [];
    }
};

// Save search to localStorage
const saveRecentSearch = (term) => {
    if (!term?.trim()) return;
    try {
        const searches = getRecentSearches();
        const filtered = searches.filter(s => s.toLowerCase() !== term.toLowerCase());
        const updated = [term, ...filtered].slice(0, MAX_RECENT_SEARCHES);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
        // Silently fail
    }
};

export function SearchOverlay({ isOpen, onClose }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const navigate = useNavigate();

    // Load recent searches on mount
    useEffect(() => {
        if (isOpen) {
            setRecentSearches(getRecentSearches());
            setSearchTerm('');
            setSuggestions([]);
        }
    }, [isOpen]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Popular cities based on selected country (could be dynamic)
    const popularCities = [
        "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
        "San Francisco", "Dallas", "Miami", "Seattle", "Boston"
    ];

    // Real-time Search Effect
    useEffect(() => {
        if (searchTerm.length < 2) {
            setSuggestions([]);
            return;
        }

        const controller = new AbortController();

        const fetchSuggestions = async () => {
            setIsLoading(true);
            try {
                const baseUrl = import.meta.env.PROD
                    ? "https://api.nextkinlife.live"
                    : "/api";
                const res = await fetch(
                    `${baseUrl}/listings?location=${encodeURIComponent(searchTerm)}`,
                    { credentials: 'include', signal: controller.signal }
                );

                if (!res.ok) throw new Error('Failed to fetch');

                const response = await res.json();
                const listings = response.data || [];
                const uniqueLocations = [...new Set(
                    listings.map(item => item.location).filter(Boolean)
                )].slice(0, 8);
                setSuggestions(uniqueLocations);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setSuggestions([]);
                }
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => {
            clearTimeout(debounceTimer);
            controller.abort();
        };
    }, [searchTerm]);

    const handleSearch = useCallback((term) => {
        if (!term?.trim()) return;
        saveRecentSearch(term.trim());
        onClose();
        navigate(`/search?location=${encodeURIComponent(term.trim())}`);
    }, [navigate, onClose]);

    const handleUseCurrentLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    // Reverse geocode to get city name
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();
                    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county;

                    if (city) {
                        handleSearch(city);
                    } else {
                        alert('Could not determine your city. Please search manually.');
                    }
                } catch {
                    alert('Failed to get location details. Please search manually.');
                } finally {
                    setIsGettingLocation(false);
                }
            },
            () => {
                alert('Unable to get your location. Please enable location access.');
                setIsGettingLocation(false);
            },
            { timeout: 10000 }
        );
    }, [handleSearch]);

    const clearRecentSearches = () => {
        localStorage.removeItem(RECENT_SEARCHES_KEY);
        setRecentSearches([]);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:w-[600px] md:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
                    >
                        {/* Header Section */}
                        <div className="bg-primary pt-safe pb-4 px-6 md:px-8 md:pt-8 text-white relative">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-2 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                                aria-label="Close search"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>

                            {/* Search Input */}
                            <div className="relative mt-12">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                                    placeholder="Search by city or location..."
                                    autoFocus
                                    className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 outline-none font-medium shadow-lg"
                                />
                                {isLoading && (
                                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                                )}
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-6 md:px-8">

                            {/* Suggestions List (Dynamic) */}
                            {suggestions.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-gray-900 mb-3">Suggestions</h3>
                                    <div className="space-y-1">
                                        {suggestions.map((loc, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSearch(loc)}
                                                className="w-full flex items-center gap-3 py-3 px-3 hover:bg-white rounded-xl transition-all text-left"
                                            >
                                                <MapPin className="w-4 h-4 text-primary" />
                                                <span className="text-gray-700 font-medium">{loc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Current Location */}
                            <button
                                onClick={handleUseCurrentLocation}
                                disabled={isGettingLocation}
                                className="flex items-center gap-3 text-primary font-bold mb-6 hover:opacity-80 transition-opacity disabled:opacity-50"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    {isGettingLocation ? (
                                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                    ) : (
                                        <MapPin className="w-4 h-4 text-primary" />
                                    )}
                                </div>
                                {isGettingLocation ? 'Getting location...' : 'Use my current location'}
                            </button>

                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-bold text-gray-900">Recent Searches</h3>
                                        <button
                                            onClick={clearRecentSearches}
                                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        {recentSearches.map((item, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSearch(item)}
                                                className="w-full flex items-center justify-between py-3 px-3 hover:bg-white rounded-xl transition-all group"
                                            >
                                                <div className="flex items-center gap-3 text-gray-500 group-hover:text-primary transition-colors">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{item}</span>
                                                </div>
                                                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Popular Cities */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3">Popular Cities</h3>
                                <div className="flex flex-wrap gap-2">
                                    {popularCities.map((city) => (
                                        <button
                                            key={city}
                                            onClick={() => handleSearch(city)}
                                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-primary hover:text-primary hover:shadow-sm transition-all"
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
