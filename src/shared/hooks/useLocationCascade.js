import { useCallback, useEffect, useMemo, useState } from "react";
import { loadLocationData } from "@/shared/utils/lazyLocationData";

// Manages cascading country > state > city dropdowns.
// Lazy-loads the country-state-city library on mount.
export function useLocationCascade(initialCountryCode = null) {
    const [csc, setCsc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState(null); // { isoCode, name }
    const [selectedState, setSelectedState] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);

    // Load library once on mount
    useEffect(() => {
        let cancelled = false;
        loadLocationData().then((mod) => {
            if (!cancelled) {
                setCsc(mod);
                setIsLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, []);

    const countries = useMemo(() => {
        if (!csc) return [];
        return csc.Country.getAllCountries().map((c) => ({
            name: c.name,
            isoCode: c.isoCode,
            phoneCode: c.phonecode,
            flag: c.flag,
        }));
    }, [csc]);

    const states = useMemo(() => {
        if (!csc || !selectedCountry?.isoCode) return [];
        return csc.State.getStatesOfCountry(selectedCountry.isoCode).map((s) => ({
            name: s.name,
            isoCode: s.isoCode,
        }));
    }, [csc, selectedCountry?.isoCode]);

    const cities = useMemo(() => {
        if (!csc || !selectedCountry?.isoCode || !selectedState?.isoCode) return [];
        return csc.City.getCitiesOfState(
            selectedCountry.isoCode,
            selectedState.isoCode,
        ).map((c) => ({ name: c.name }));
    }, [csc, selectedCountry?.isoCode, selectedState?.isoCode]);

    const setCountry = useCallback((countryObj) => {
        setSelectedCountry(countryObj);
        setSelectedState(null);
        setSelectedCity(null);
    }, []);

    const setState = useCallback((stateObj) => {
        setSelectedState(stateObj);
        setSelectedCity(null);
    }, []);

    const setCity = useCallback((cityObj) => {
        setSelectedCity(cityObj);
    }, []);

    const reset = useCallback(() => {
        setSelectedCountry(null);
        setSelectedState(null);
        setSelectedCity(null);
    }, []);

    // Pre-select initial country once countries are loaded
    useEffect(() => {
        if (initialCountryCode && countries.length > 0 && !selectedCountry) {
            const found = countries.find((c) => c.isoCode === initialCountryCode);
            if (found) setSelectedCountry(found);
        }
    }, [initialCountryCode, countries, selectedCountry]);

    return {
        countries,
        states,
        cities,
        isLoading,
        selectedCountry,
        selectedState,
        selectedCity,
        setCountry,
        setState,
        setCity,
        reset,
    };
}
