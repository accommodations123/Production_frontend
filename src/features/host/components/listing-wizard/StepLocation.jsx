import { useState, useEffect, useRef } from 'react';
import { MapPin, Globe, Navigation, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { COUNTRIES } from '@/shared/utils/mock-data';

// Helper to check if zip code is required for the country
const isZipCodeRequired = (country) => {
    if (!country) return false;
    const code = (typeof country === 'object' ? country.code : '') || '';
    const name = (typeof country === 'object' ? country.name : country) || '';
    const codeUpper = code.toUpperCase().trim();
    const nameLower = name.toLowerCase().trim();
    
    const requiredCodes = ["US", "IN", "GB", "CA", "AU", "DE", "FR"];
    const requiredNames = ["united states", "united states of america", "india", "united kingdom", "great britain", "canada", "australia", "germany", "france"];
    
    return requiredCodes.includes(codeUpper) || requiredNames.includes(nameLower);
};

// Dynamic loader for Google Maps JavaScript API script
const loadGoogleMapsScript = (callback) => {
    if (window.google && window.google.maps) {
        callback(true);
        return;
    }
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        callback(false);
        return;
    }
    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId);
    if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        script.onload = () => {
            script.dataset.loaded = 'true';
            callback(true);
        };
        script.onerror = () => {
            callback(false);
        };
    } else {
        if (script.dataset.loaded === 'true') {
            callback(true);
        } else {
            const handleLoad = () => {
                script.removeEventListener('load', handleLoad);
                callback(true);
            };
            const handleError = () => {
                script.removeEventListener('error', handleError);
                callback(false);
            };
            script.addEventListener('load', handleLoad);
            script.addEventListener('error', handleError);
        }
    }
};

export function StepLocation({ formData, setFormData }) {
    const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
    const [googleMapsError, setGoogleMapsError] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const autocompleteRef = useRef(null);
    const inputRef = useRef(null);

    const countryObj = typeof formData.country === 'object' 
        ? formData.country 
        : (COUNTRIES.find(c => c.name === formData.country) || null);
        
    const zipRequired = isZipCodeRequired(formData.country);

    // Dynamic Google Maps Script Loading
    useEffect(() => {
        loadGoogleMapsScript((success) => {
            if (success) {
                setIsGoogleMapsLoaded(true);
                setGoogleMapsError(false);
            } else {
                setIsGoogleMapsLoaded(false);
                setGoogleMapsError(true);
            }
        });
    }, []);

    // Places Autocomplete Binding
    useEffect(() => {
        if (!isGoogleMapsLoaded || !inputRef.current) return;

        // Clear search text to prevent mismatched country address inputs
        inputRef.current.value = "";

        // Clear existing listener mappings to prevent memory leaks
        if (autocompleteRef.current) {
            window.google.maps.event.clearInstanceListeners(inputRef.current);
        }

        const countryCode = countryObj?.code || '';
        const options = {
            fields: ['address_components', 'geometry', 'formatted_address'],
            types: ['address'],
        };

        if (countryCode) {
            options.componentRestrictions = { country: countryCode.toLowerCase() };
        }

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, options);
        autocompleteRef.current = autocomplete;

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place || !place.geometry) {
                toast.error("Address details not found. Please select a valid option.");
                return;
            }

            let streetNumber = '';
            let route = '';
            let city = '';
            let state = '';
            let zipCode = '';

            if (place.address_components) {
                for (const component of place.address_components) {
                    const types = component.types;
                    if (types.includes('street_number')) {
                        streetNumber = component.long_name;
                    }
                    if (types.includes('route')) {
                        route = component.long_name;
                    }
                    if (types.includes('locality') || types.includes('sublocality_level_1')) {
                        city = component.long_name;
                    }
                    if (types.includes('administrative_area_level_1')) {
                        state = component.long_name;
                    }
                    if (types.includes('postal_code')) {
                        zipCode = component.long_name;
                    }
                }
            }

            const streetAddress = [streetNumber, route].filter(Boolean).join(' ') || place.formatted_address;
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            setFormData(prev => ({
                ...prev,
                address: streetAddress,
                city: city || prev.city,
                state: state || prev.state,
                pincode: zipCode || prev.pincode,
                latitude: lat,
                longitude: lng
            }));
            toast.success("Address details auto-filled successfully!");
        });
    }, [isGoogleMapsLoaded, countryObj]);

    // geocoding geolocation retrieval
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                if (window.google && window.google.maps) {
                    const geocoder = new window.google.maps.Geocoder();
                    const latlng = { lat, lng };

                    geocoder.geocode({ location: latlng }, (results, status) => {
                        setIsLocating(false);
                        if (status === 'OK' && results[0]) {
                            const place = results[0];

                            let streetNumber = '';
                            let route = '';
                            let city = '';
                            let state = '';
                            let zipCode = '';

                            for (const component of place.address_components) {
                                const types = component.types;
                                if (types.includes('street_number')) {
                                    streetNumber = component.long_name;
                                }
                                if (types.includes('route')) {
                                    route = component.long_name;
                                }
                                if (types.includes('locality') || types.includes('sublocality_level_1')) {
                                    city = component.long_name;
                                }
                                if (types.includes('administrative_area_level_1')) {
                                    state = component.long_name;
                                }
                                if (types.includes('postal_code')) {
                                    zipCode = component.long_name;
                                }
                            }

                            const streetAddress = [streetNumber, route].filter(Boolean).join(' ') || place.formatted_address;

                            setFormData(prev => ({
                                ...prev,
                                address: streetAddress,
                                city: city || prev.city,
                                state: state || prev.state,
                                pincode: zipCode || prev.pincode,
                                latitude: lat,
                                longitude: lng
                            }));
                            toast.success("Current location geocoded successfully!");
                        } else {
                            setFormData(prev => ({
                                ...prev,
                                latitude: lat,
                                longitude: lng
                            }));
                            toast.warning("Location coordinates set, but reverse-geocoding failed.");
                        }
                    });
                } else {
                    setIsLocating(false);
                    setFormData(prev => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng
                    }));
                    toast.success(`Position set: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                }
            },
            (error) => {
                setIsLocating(false);
                toast.error(`Error acquiring position: ${error.message}`);
            }
        );
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Where is it located?</h2>

            {/* Map Placeholder with visual coords display */}
            <div className="bg-black/20 rounded-2xl p-1 border border-white/10 overflow-hidden relative group">
                <div className="aspect-video bg-white/5 flex items-center justify-center relative">
                    <MapPin className="h-12 w-12 text-accent animate-bounce" />
                    {formData.latitude && formData.longitude && (
                        <div className="absolute top-4 right-4 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-gray-300">
                            Location coordinates resolved & stored.
                        </div>
                    )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                    <div>
                        <h4 className="font-bold text-xl">Pin Location</h4>
                        <p className="text-sm text-[#717171]">Google Maps location mapping verified</p>
                    </div>
                </div>
            </div>

            {/* Google Maps Loader Warnings */}
            {googleMapsError && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-4 rounded-xl text-sm leading-relaxed">
                    <strong>Notice:</strong> Google Maps API key is missing or failed to load. Places Autocomplete and Geolocation buttons are disabled. Please enter all location details manually.
                </div>
            )}

            {/* Google Places Autocomplete Lookup Search */}
            {isGoogleMapsLoaded && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex justify-between items-center">
                        <span>Search for Address</span>
                        {isLocating && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#717171]" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Type address (e.g. 700 Lower State Rd)..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-accent outline-none text-white placeholder:text-[#484848]"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            disabled={isLocating}
                            className="bg-accent hover:bg-accent/80 disabled:bg-accent/50 text-white px-4 py-3 rounded-xl transition font-medium flex items-center gap-2"
                        >
                            Use Current Location
                        </button>
                    </div>
                </div>
            )}

            {/* Location Form Fields */}
            <div className="space-y-4 pt-2 border-t border-white/5">
                {/* Street Address */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Street Address <span className="text-red-500 ml-1">*</span></label>
                    <textarea
                        placeholder="Flat/House No., Building, Street Area"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-accent outline-none min-h-[80px] text-white"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Country - Derived & Read Only */}
                    <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-300">Country (Selected in Header)</label>
                        <div className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 flex items-center gap-3 text-[#717171]">
                            {countryObj?.flag ? (
                                <img src={countryObj.flag} alt={countryObj.name} className="h-5 w-7 object-cover rounded" />
                            ) : (
                                <Globe className="h-5 w-5 text-[#484848]" />
                            )}
                            <span className="font-semibold text-white">{countryObj?.name || formData.country || 'No Country Selected'}</span>
                        </div>
                    </div>

                    {/* State - Manual Text Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">State <span className="text-red-500 ml-1">*</span></label>
                        <input
                            type="text"
                            placeholder="State/Region"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-accent outline-none text-white"
                            value={formData.state || ''}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                    </div>

                    {/* City - Manual Text Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">City <span className="text-red-500 ml-1">*</span></label>
                        <input
                            type="text"
                            placeholder="City"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-accent outline-none text-white"
                            value={formData.city || ''}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                    </div>

                    {/* Zip code (Pincode) - Conditional Mandatory */}
                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-gray-300">
                            Zip Code {zipRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                            type="text"
                            placeholder="Zip / Postal Code"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-accent outline-none text-white"
                            value={formData.pincode || ''}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        />
                    </div>

                    {/* Location Privacy Options */}
                    <div className="col-span-2 space-y-2 pt-2">
                        <label className="text-sm font-medium text-gray-300">Location Privacy <span className="text-red-500 ml-1">*</span></label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, locationPrivacy: "exact" }))}
                                className={`p-4 rounded-xl border text-left transition-all ${formData.locationPrivacy === 'exact'
                                    ? 'bg-accent/20 border-accent text-white'
                                    : 'bg-white/5 border-white/10 text-[#717171] hover:bg-white/10'
                                }`}
                            >
                                <span className="font-bold text-sm block">Show Exact Location</span>
                                <span className="text-xs text-[#717171] mt-1 block leading-normal">Guests see exact street coordinates.</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, locationPrivacy: "approximate" }))}
                                className={`p-4 rounded-xl border text-left transition-all ${formData.locationPrivacy === 'approximate'
                                    ? 'bg-accent/20 border-accent text-white'
                                    : 'bg-white/5 border-white/10 text-[#717171] hover:bg-white/10'
                                }`}
                            >
                                <span className="font-bold text-sm block">Show Approximate Location</span>
                                <span className="text-xs text-[#717171] mt-1 block leading-normal">Only show general city/state details.</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
