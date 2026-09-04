import React, { useState } from "react";
import { SlidersHorizontal, ChevronDown, Search, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadLocationData } from '@/lib/lazyLocationData';
import SearchableDropdown from "@/components/ui/SearchableDropdown";

export function FilterPanel({ filters, onChange }) {
  const [open, setOpen] = useState({
    all: false,
    price: false,
    category: false,
    location: false,
  });

  // ✅ UPDATED CATEGORIES
  const categories = [
    { label: "All", value: "" },
    { label: "Furniture", value: "Furniture" },
    { label: "Electronics", value: "Electronics" },
    { label: "Vehicles", value: "Vehicles" },
    { label: "Mobile Phones", value: "Mobile Phones" },
    { label: "Laptops & Computers", value: "Laptops & Computers" },
    { label: "Home & Garden", value: "Home & Garden" },
    { label: "Kitchen & Appliances", value: "Kitchen & Appliances" },
    { label: "Books & Study Materials", value: "Books & Study Materials" },
    { label: "Clothing & Accessories", value: "Clothing & Accessories" },
    { label: "Sports & Fitness", value: "Sports & Fitness" },
    { label: "Baby & Kids", value: "Baby & Kids" },
    { label: "Tickets & Events", value: "Tickets & Events" },
    { label: "Services", value: "Services" },
    { label: "Others", value: "Other" },
  ];

  const [isOpen, setIsOpen] = useState(false);

  const [csc, setCsc] = useState(null);
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  React.useEffect(() => {
    let active = true;
    loadLocationData().then(data => {
      if (!active) return;
      setCsc(data);
      setCountriesList(data.Country.getAllCountries().map(c =>
        c.isoCode === 'US' ? { ...c, name: "United States of America" } : c
      ));
    });
    return () => { active = false; };
  }, []);

  // Check if any filter is active to show/hide the clear button
  const hasActiveFilters =
    filters.search ||
    filters.priceMin ||
    filters.priceMax ||
    filters.category ||
    filters.country ||
    filters.state ||
    filters.city;

  // Keep statesList and citiesList in perfect sync with filters.country and filters.state
  React.useEffect(() => {
    if (filters.country && csc) {
      const countryObj = countriesList.find(
        c => c.name === filters.country || c.isoCode === filters.country
      );
      if (countryObj) {
        const states = csc.State.getStatesOfCountry(countryObj.isoCode);
        setStatesList(states);
        if (filters.state) {
          const stateObj = states.find(
            s => s.name === filters.state || s.isoCode === filters.state
          );
          if (stateObj) {
            setCitiesList(csc.City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode));
          } else {
            setCitiesList([]);
          }
        } else {
          setCitiesList([]);
        }
      } else {
        setStatesList([]);
        setCitiesList([]);
      }
    } else {
      setStatesList([]);
      setCitiesList([]);
    }
  }, [filters.country, filters.state, countriesList, csc]);

  const handleClear = () => {
    onChange({
      priceMin: "",
      priceMax: "",
      category: "",
      country: "",
      state: "All States",
      city: "All Cities",
      search: "",
    });
    setStatesList([]);
    setCitiesList([]);
    setOpen({ all: false, price: false, category: false, location: false });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm">
      {/* TOP ROW */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-start justify-start">
        {/* Search */}
        <div className="relative flex-1 w-full border border-gray-300 rounded-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search for items..."
            value={filters.search || ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-9 h-9 sm:h-10 bg-white border-gray-300 text-gray-900 text-sm"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(o => ({ ...o, all: !o.all }))}
            className="text-xs sm:text-sm"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-[#00152d]" />
            Location & More
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs sm:text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <X className="h-3.5 w-3.5 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* FILTER PANELS */}
      {(open.all || open.price || open.category || open.location) && (
        <div className="mt-4 grid grid-cols-1 text-[#00152d] text-md md:grid-cols-3 gap-6 border-t pt-4">

          {/* LOCATION SECTION */}
          {(open.all || open.location) && (
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
              <SearchableDropdown
                label="State"
                placeholder="All States"
                options={[
                  { name: "All States", isoCode: "ALL_STATES" },
                  ...statesList
                ]}
                value={filters.state}
                disabled={!filters.country}
                onChange={(s) => {
                  onChange({
                    ...filters,
                    state: s.name,
                    city: "All Cities"
                  });
                  const cCode = countriesList.find(c => c.name === filters.country)?.isoCode;
                  if (cCode && s.isoCode && s.isoCode !== "ALL_STATES" && csc) {
                    setCitiesList(csc.City.getCitiesOfState(cCode, s.isoCode));
                  } else {
                    setCitiesList([]);
                  }
                }}
              />
              <SearchableDropdown
                label="City"
                placeholder="All Cities"
                options={[
                  { name: "All Cities" },
                  ...citiesList
                ]}
                value={filters.city}
                disabled={!filters.state || filters.state === "All States"}
                onChange={(c) => {
                  onChange({
                    ...filters,
                    city: c.name
                  });
                }}
              />
            </div>
          )}

          {/* PRICE */}
          {(open.all || open.price) && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Price Range</h4>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      priceMin: e.target.value,
                    })
                  }
                  className="h-9 sm:h-10 text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      priceMax: e.target.value,
                    })
                  }
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
            </div>
          )}

          {/* CATEGORY */}
          {(open.all || open.category) && (
            <div className="relative w-full">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Category</h4>

              {/* BUTTON */}
              <button
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full h-11 border border-[#00142E] bg-white rounded-xl px-4 flex justify-between items-center text-sm font-medium"
              >
                {categories.find(c => c.value === filters.category)?.label || "All"}
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* DROPDOWN */}
              {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {categories.map((item) => (
                    <div
                      key={item.value}
                      onClick={() => {
                        onChange({ ...filters, category: item.value });
                        setIsOpen(false);
                      }}
                      className={`px-4 py-3 text-sm cursor-pointer transition
            ${filters.category === item.value
                          ? "bg-[#00142E] text-white"
                          : "hover:bg-gray-50"}
          `}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}