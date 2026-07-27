/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { hostApi } from "@/store/api/hostApi";
import { COUNTRIES } from "@/shared/utils/mock-data";
import axios from "axios";

const CountryContext = createContext(null);

const DEFAULT_COUNTRY = COUNTRIES.find(c => c.code === "IN") || { name: "India", code: "IN", flag: "🇮🇳", currency: "INR" };

export const CountryProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [activeCountry, setActiveCountry] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("selectedCountry");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.code) return parsed;
        } catch (e) {
          console.error("Error parsing selectedCountry", e);
        }
      }
    }
    return DEFAULT_COUNTRY;
  });

  const [isSelected, setIsSelected] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem("selectedCountry");
    }
    return false;
  });

  const [isGeolocationLoading, setIsGeolocationLoading] = useState(false);

  useEffect(() => {
    if (!isSelected) {
      initializeWithGeolocation();
    }
  }, [isSelected]);

  const initializeWithGeolocation = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      setIsGeolocationLoading(true);

      const response = await axios.get(
        "https://ipapi.co/json/",
        { signal: controller.signal, timeout: 5000 }
      );

      const data = response.data;

      if (data && data.country_code) {
        const country = COUNTRIES.find(
          c => c.code === data.country_code
        );

        if (country) {
          setActiveCountry(country);
          setIsSelected(true);

          localStorage.setItem(
            "selectedCountry",
            JSON.stringify(country)
          );

          dispatch(
            hostApi.util.invalidateTags(["Event", "Job"])
          );

          return;
        }
      }
    } catch (e) {
      // Silently handle AbortError (timeout) and network failures (iOS content blockers)
      if (e.name !== 'AbortError') {
        console.error(
          "Geolocation network request failed:",
          e.message
        );
      }
    } finally {
      clearTimeout(timeoutId);
      setIsGeolocationLoading(false);
      setIsSelected(true);
    }
  };

  const setCountry = useCallback((country) => {
    if (!country?.code) return;

    setActiveCountry(country);
    setIsSelected(true);

    localStorage.setItem(
      "selectedCountry",
      JSON.stringify(country)
    );

    // Refetch event and job queries
    dispatch(
      hostApi.util.invalidateTags(["Event", "Job"])
    );

  }, [dispatch]);

  const formatPrice = useCallback((amount, customCurrency) => {
    if (amount === undefined || amount === null) return "";

    let currency = 'USD';
    if (typeof customCurrency === 'string' && /^[A-Za-z]{3}$/.test(customCurrency)) {
      currency = customCurrency.toUpperCase();
    } else if (activeCountry?.currency && /^[A-Za-z]{3}$/.test(activeCountry.currency)) {
      currency = activeCountry.currency.toUpperCase();
    } else {
      currency = 'INR';
    }

    try {
      const locale = currency === 'INR' ? 'en-IN' : 'en-US';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${currency} ${amount}`;
    }
  }, [activeCountry]);

  return (
    <CountryContext.Provider
      value={{
        activeCountry,
        setCountry,
        isSelected,
        formatPrice,
        isGeolocationLoading
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};


export const useCountry = () => {
  const ctx = useContext(CountryContext);
  if (!ctx) {
    throw new Error("useCountry must be used inside CountryProvider");
  }
  return ctx;
};
