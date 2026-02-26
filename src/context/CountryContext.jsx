import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { hostApi } from "@/store/api/hostApi";
import { authApi } from "@/store/api/authApi";
import { COUNTRIES } from "@/lib/mock-data";

const CountryContext = createContext(null);

const DEFAULT_COUNTRY = COUNTRIES.find(c => c.code === "IN") || { name: "India", code: "IN", flag: "🇮🇳", currency: "INR" };

export const CountryProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [activeCountry, setActiveCountry] = useState(DEFAULT_COUNTRY);
  const [isSelected, setIsSelected] = useState(false);
  const [isGeolocationLoading, setIsGeolocationLoading] = useState(false);

  // Load from localStorage on app load
  useEffect(() => {
    const saved = localStorage.getItem("selectedCountry");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.code) {
          setActiveCountry(parsed);
          setIsSelected(true);
          return;
        }
      } catch (e) {
        console.error("Error parsing selectedCountry", e);
      }
    }

    // If not selected, try geolocation
    initializeWithGeolocation();
  }, []);

  const initializeWithGeolocation = async () => {
    try {
      setIsGeolocationLoading(true);
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        if (data && data.country_code) {
          const country = COUNTRIES.find(c => c.code === data.country_code);
          if (country) {
            setActiveCountry(country);
            setIsSelected(true);
            return;
          }
        }
      }
    } catch (e) {
      console.error("Geolocation failed", e);
    } finally {
      setIsGeolocationLoading(false);
      // Fallback: If we couldn't determine the country or API failed, still show DEFAULT_COUNTRY instead of "Select Country"
      if (!isSelected) {
        setIsSelected(true);
      }
    }
  };

  const setCountry = useCallback((country) => {
    setActiveCountry(country);
    setIsSelected(true);
    localStorage.setItem("selectedCountry", JSON.stringify(country));

    // Reset all API states to force refetch with new headers
    dispatch(hostApi.util.resetApiState());
    dispatch(authApi.util.resetApiState());
  }, [dispatch]);

  const formatPrice = useCallback((amount) => {
    if (amount === undefined || amount === null) return "";

    const currency = activeCountry?.currency || 'INR';
    const locale = activeCountry?.code === 'IN' ? 'en-IN' : 'en-US';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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