import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  MapPin,
  DollarSign,
  Check,
  AlertCircle,
  ShieldCheck,
  Loader2,
  Sparkles,
  User,
  Phone,
  Mail
} from "lucide-react";
import { FaWhatsapp, FaLinkedin } from "react-icons/fa6";
import { useCreateStayRequestMutation } from "@/store/api/stayRequestApi";
import { useAuth } from "@/shared/hooks/useAuth";
import { loadLocationData } from "@/shared/utils/lazyLocationData";
import SearchableDropdown from "@/shared/ui/SearchableDropdown";
import { CountryCodeSelect } from "@/shared/ui/CountryCodeSelect";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";

import { COUNTRIES } from "@/lib/mock-data";
import { useCountry } from "@/context/CountryContext";
import { getCurrencyForCountry } from "@/shared/utils/countryUtils";

const CURRENCY_OPTIONS = [
  { code: "INR", symbol: "₹" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "CAD", symbol: "$" },
  { code: "AUD", symbol: "$" },
  { code: "AED", symbol: "د.إ" },
  { code: "SGD", symbol: "$" },
  { code: "ZAR", symbol: "R" },
  { code: "JPY", symbol: "¥" },
  { code: "CHF", symbol: "CHF" },
  { code: "NZD", symbol: "$" },
  { code: "SAR", symbol: "﷼" },
  { code: "QAR", symbol: "﷼" },
  { code: "KWD", symbol: "KD" },
  { code: "MYR", symbol: "RM" },
  { code: "THB", symbol: "฿" },
  { code: "PHP", symbol: "₱" },
  { code: "IDR", symbol: "Rp" },
  { code: "VND", symbol: "₫" },
  { code: "BRL", symbol: "R$" },
  { code: "MXN", symbol: "$" },
  { code: "TRY", symbol: "₺" },
  { code: "RUB", symbol: "₽" },
  { code: "SEK", symbol: "kr" },
  { code: "NOK", symbol: "kr" },
  { code: "DKK", symbol: "kr" },
  { code: "PLN", symbol: "zł" },
  { code: "EGP", symbol: "E£" },
  { code: "NGN", symbol: "₦" },
  { code: "KES", symbol: "KSh" },
  { code: "BDT", symbol: "৳" },
  { code: "PKR", symbol: "Rs" },
  { code: "LKR", symbol: "Rs" },
  { code: "NPR", symbol: "रू" }
];

const FALLBACK_LOCATION_DATA = {
  "India": {
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
    "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala"],
    "Kerala": ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur"],
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"]
  },
  "United States": {
    "California": ["Los Angeles", "San Francisco", "San Jose", "San Diego", "Sacramento"],
    "New York": ["New York City", "Buffalo", "Rochester", "Albany"],
    "Texas": ["Austin", "Houston", "Dallas", "San Antonio"],
    "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville"],
    "Washington": ["Seattle", "Bellevue", "Redmond", "Tacoma"]
  },
  "United Kingdom": {
    "England": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Bristol"],
    "Scotland": ["Edinburgh", "Glasgow", "Aberdeen"],
    "Wales": ["Cardiff", "Swansea"]
  },
  "Canada": {
    "Ontario": ["Toronto", "Ottawa", "Mississauga", "Hamilton"],
    "British Columbia": ["Vancouver", "Victoria", "Surrey"],
    "Quebec": ["Montreal", "Quebec City"]
  },
  "Australia": {
    "New South Wales": ["Sydney", "Newcastle", "Wollongong"],
    "Victoria": ["Melbourne", "Geelong"],
    "Queensland": ["Brisbane", "Gold Coast"]
  },
  "Germany": {
    "Bavaria": ["Munich", "Nuremberg", "Augsburg"],
    "Berlin": ["Berlin"],
    "Hesse": ["Frankfurt", "Wiesbaden"],
    "North Rhine-Westphalia": ["Cologne", "Düsseldorf", "Dortmund"]
  }
};

export default function PostStayRequestPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { activeCountry } = useCountry();

  // RTK Query Mutation
  const [createStayRequest] = useCreateStayRequestMutation();

  const initialCurrency = activeCountry?.currency || getCurrencyForCountry(activeCountry?.name || activeCountry?.code) || "INR";

  const [form, setForm] = useState({
    title: "",
    country: activeCountry?.name || "",
    state: "",
    city: "",
    budget: "",
    currency: initialCurrency,
    stayType: "Long Term",
    furnishing: "Furnished",
    description: "",
    seekerName: currentUser?.fullName || currentUser?.name || "",
    email: currentUser?.email || "",
    phonePrefix: "+91",
    phoneNumber: currentUser?.phone || "",
    whatsappPrefix: "+91",
    whatsappNumber: currentUser?.phone || "",
    linkedin: "",
    instagram: ""
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lazy loaded location library
  const [locationMod, setLocationMod] = useState(null);
  useEffect(() => {
    loadLocationData().then(setLocationMod);
  }, []);

  const countriesList = useMemo(() => {
    const activeCountryObj = locationMod?.Country || locationMod?.default?.Country;
    if (activeCountryObj) {
      return activeCountryObj.getAllCountries().map((c) =>
        c.isoCode === "US" ? { ...c, name: "United States of America" } : c
      );
    }
    return COUNTRIES.map((c) => ({ name: c.name, isoCode: c.code }));
  }, [locationMod]);

  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

  // Auto-sync Target Destination & Currency from Navbar active country on load/change
  useEffect(() => {
    if (!activeCountry?.name || !countriesList.length) return;

    const normalizedActiveName = activeCountry.name === "United States" ? "United States of America" : activeCountry.name;
    const match = countriesList.find(
      (c) =>
        c.name?.toLowerCase() === normalizedActiveName.toLowerCase() ||
        c.name?.toLowerCase() === activeCountry.name?.toLowerCase() ||
        c.isoCode?.toUpperCase() === activeCountry.code?.toUpperCase()
    );

    const targetCountry = match || {
      name: normalizedActiveName,
      isoCode: activeCountry.code,
    };

    const derivedCurrency =
      activeCountry.currency ||
      getCurrencyForCountry(targetCountry.name || targetCountry.isoCode) ||
      "INR";

    // Set selected country if none is selected yet or matching initial navbar country
    if (!selectedCountry) {
      setSelectedCountry(targetCountry);
      setForm((prev) => ({
        ...prev,
        country: targetCountry.name,
        currency: prev.currency || derivedCurrency,
      }));

      const activeStateObj = locationMod?.State || locationMod?.default?.State;
      if (activeStateObj && targetCountry?.isoCode) {
        const states = activeStateObj.getStatesOfCountry(targetCountry.isoCode);
        setStatesList(states || []);
      } else {
        const fallbackStates = FALLBACK_LOCATION_DATA[targetCountry.name]
          ? Object.keys(FALLBACK_LOCATION_DATA[targetCountry.name]).map((s) => ({
              name: s,
              isoCode: s,
            }))
          : [];
        setStatesList(fallbackStates);
      }
    }
  }, [activeCountry, countriesList, locationMod, selectedCountry]);

  // Section DOM references for scroll navigation
  const sectionRefs = {
    basics: useRef(null),
    location: useRef(null),
    budget: useRef(null),
    contact: useRef(null),
    description: useRef(null),
    review: useRef(null)
  };

  const scrollToSection = (id) => {
    sectionRefs[id].current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (country) => {
    const countryName = country?.name || country;
    const derivedCurrency =
      country?.currency ||
      getCurrencyForCountry(countryName || country?.isoCode) ||
      "INR";

    setSelectedCountry(country);
    setForm((prev) => ({
      ...prev,
      country: countryName,
      currency: derivedCurrency,
      state: "",
      city: ""
    }));
    setSelectedState(null);

    const activeStateObj = locationMod?.State || locationMod?.default?.State;
    if (activeStateObj && country?.isoCode) {
      const states = activeStateObj.getStatesOfCountry(country.isoCode);
      setStatesList(states || []);
    } else {
      const fallbackStates = FALLBACK_LOCATION_DATA[countryName]
        ? Object.keys(FALLBACK_LOCATION_DATA[countryName]).map((s) => ({ name: s, isoCode: s }))
        : [];
      setStatesList(fallbackStates);
    }
    setCitiesList([]);
  };

  const handleStateChange = (state) => {
    const stateName = state?.name || state;
    setSelectedState(state);
    setForm((prev) => ({ ...prev, state: stateName, city: "" }));

    const activeCityObj = locationMod?.City || locationMod?.default?.City;
    if (activeCityObj && selectedCountry?.isoCode && state?.isoCode) {
      const cities = activeCityObj.getCitiesOfState(selectedCountry.isoCode, state.isoCode);
      setCitiesList(cities);
    } else {
      const countryName = selectedCountry?.name || selectedCountry;
      const fallbackCities = (FALLBACK_LOCATION_DATA[countryName] && FALLBACK_LOCATION_DATA[countryName][stateName])
        ? FALLBACK_LOCATION_DATA[countryName][stateName].map((c) => ({ name: c }))
        : [];
      setCitiesList(fallbackCities);
    }
  };

  const handleCityChange = (city) => {
    const cityName = city?.name || city;
    setForm((prev) => ({ ...prev, city: cityName }));
  };

  // Section Validation Checks
  const isBasicsValid = () => {
    return form.title && form.title.trim() !== "";
  };

  const isLocationValid = () => {
    return !!(form.country && form.city);
  };

  const isBudgetValid = () => {
    return form.budget !== "" && Number(form.budget) > 0 && !!form.currency;
  };

  const isContactValid = () => {
    return !!(form.email && form.whatsappNumber);
  };

  const isDescriptionValid = () => {
    return form.description && form.description.trim() !== "";
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!isBasicsValid()) {
      toast.error("Please enter a title for your stay request.");
      scrollToSection("basics");
      return;
    }

    if (!isLocationValid()) {
      toast.error("Please select a target country and city.");
      scrollToSection("location");
      return;
    }

    if (!isBudgetValid()) {
      toast.error("Please enter a valid monthly budget.");
      scrollToSection("budget");
      return;
    }

    if (!isContactValid()) {
      toast.error("Please provide your WhatsApp number and contact email.");
      scrollToSection("contact");
      return;
    }

    if (!isDescriptionValid()) {
      toast.error("Please provide a description of your accommodation requirements.");
      scrollToSection("description");
      return;
    }

    if (!termsAccepted) {
      toast.warning("Please accept the terms to submit your stay request.");
      scrollToSection("review");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullPhone = `${form.phonePrefix}${form.phoneNumber.trim()}`;
      const fullWhatsapp = `${form.whatsappPrefix}${form.whatsappNumber.trim()}`;

      const payload = {
        title: form.title,
        country: form.country,
        state: form.state || "",
        city: form.city,
        budget: Number(form.budget),
        currency: form.currency || "EUR",
        stayType: form.stayType || "Long Term",
        furnishing: form.furnishing || "Furnished",
        description: form.description,
        email: form.email || currentUser?.email || "",
        phone: fullPhone,
        seekerName: form.seekerName || currentUser?.fullName || currentUser?.name || "",
        whatsappNumber: fullWhatsapp,
        linkedin: form.linkedin || "",
        instagram: form.instagram || ""
      };

      await createStayRequest(payload).unwrap();

      toast.success("Stay request posted successfully!");
      navigate("/accommodations?tab=seekers");
    } catch (error) {
      console.error("Failed to submit stay request:", error);
      toast.error(error?.data?.message || error?.message || "Failed to submit stay request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 text-foreground font-sans pb-20 pt-20 lg:pt-24">
      <div className="w-full max-w-[1600px] mx-auto px-4 pt-6 sm:pt-8 sm:px-6 lg:px-8 space-y-6">
        {/* Top Return Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
          <Breadcrumb
            items={[
              { label: "Accommodations", path: "/accommodations" },
              { label: "Post Stay Request" }
            ]}
          />
          <span className="text-xs font-bold text-gray-400">Post Stay Request</span>
        </div>

        {/* Premium Page Header */}
        <div className="mb-6 text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <FileText className="text-[#CB2A26] w-8 h-8 shrink-0" />
            <span>Post a Stay Request</span>
          </h1>
          <p className="text-[#222222] mt-2 text-lg">
            Looking for accommodation? Specify your destination, budget, and direct contact details so verified hosts can reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sticky Progress Sidebar */}
          <div className="lg:col-span-3 sticky top-28 hidden lg:block">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-[#484848] uppercase tracking-widest px-2 mb-3">
                Request Progress
              </h3>

              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => scrollToSection("basics")}
                  className="flex items-center justify-between w-full p-3.5 rounded-xl hover:bg-gray-50 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#717171] group-hover:text-[#CB2A26] transition-colors" />
                    <span className="text-sm font-semibold text-gray-700">Request Title</span>
                  </div>
                  {isBasicsValid() ? (
                    <Check className="h-4.5 w-4.5 text-emerald-500 bg-emerald-50 rounded-full p-0.5 border border-emerald-200" />
                  ) : (
                    <AlertCircle className="h-4.5 w-4.5 text-[#484848]" />
                  )}
                </button>

                <button
                  onClick={() => scrollToSection("location")}
                  className="flex items-center justify-between w-full p-3.5 rounded-xl hover:bg-gray-50 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-[#717171] group-hover:text-[#CB2A26] transition-colors" />
                    <span className="text-sm font-semibold text-gray-700">Target Location</span>
                  </div>
                  {isLocationValid() ? (
                    <Check className="h-4.5 w-4.5 text-emerald-500 bg-emerald-50 rounded-full p-0.5 border border-emerald-200" />
                  ) : (
                    <AlertCircle className="h-4.5 w-4.5 text-[#484848]" />
                  )}
                </button>

                <button
                  onClick={() => scrollToSection("budget")}
                  className="flex items-center justify-between w-full p-3.5 rounded-xl hover:bg-gray-50 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-[#717171] group-hover:text-[#CB2A26] transition-colors" />
                    <span className="text-sm font-semibold text-gray-700">Budget & Preferences</span>
                  </div>
                  {isBudgetValid() ? (
                    <Check className="h-4.5 w-4.5 text-emerald-500 bg-emerald-50 rounded-full p-0.5 border border-emerald-200" />
                  ) : (
                    <AlertCircle className="h-4.5 w-4.5 text-[#484848]" />
                  )}
                </button>

                <button
                  onClick={() => scrollToSection("contact")}
                  className="flex items-center justify-between w-full p-3.5 rounded-xl hover:bg-gray-50 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-[#717171] group-hover:text-[#CB2A26] transition-colors" />
                    <span className="text-sm font-semibold text-gray-700">Contact Channels</span>
                  </div>
                  {isContactValid() ? (
                    <Check className="h-4.5 w-4.5 text-emerald-500 bg-emerald-50 rounded-full p-0.5 border border-emerald-200" />
                  ) : (
                    <AlertCircle className="h-4.5 w-4.5 text-[#484848]" />
                  )}
                </button>

                <button
                  onClick={() => scrollToSection("description")}
                  className="flex items-center justify-between w-full p-3.5 rounded-xl hover:bg-gray-50 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#717171] group-hover:text-[#CB2A26] transition-colors" />
                    <span className="text-sm font-semibold text-gray-700">Description</span>
                  </div>
                  {isDescriptionValid() ? (
                    <Check className="h-4.5 w-4.5 text-emerald-500 bg-emerald-50 rounded-full p-0.5 border border-emerald-200" />
                  ) : (
                    <AlertCircle className="h-4.5 w-4.5 text-[#484848]" />
                  )}
                </button>

                <button
                  onClick={() => scrollToSection("review")}
                  className="flex items-center justify-between w-full p-3.5 rounded-xl hover:bg-gray-50 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#717171] group-hover:text-[#CB2A26] transition-colors" />
                    <span className="text-sm font-semibold text-gray-700">Submit Request</span>
                  </div>
                  {termsAccepted ? (
                    <Check className="h-4.5 w-4.5 text-emerald-500 bg-emerald-50 rounded-full p-0.5 border border-emerald-200" />
                  ) : (
                    <AlertCircle className="h-4.5 w-4.5 text-[#484848]" />
                  )}
                </button>
              </nav>
            </div>
          </div>

          {/* Right Main Form Cards */}
          <div className="lg:col-span-9 space-y-8 text-left">
            {/* Section 1: Request Title */}
            <div ref={sectionRefs.basics} className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="text-[#CB2A26] w-5 h-5" /> Request Headline
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Give your request a clear headline so property owners understand what you are seeking.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Request Headline *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Student looking for 1BR apartment near Munich center"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26]"
                />
              </div>
            </div>

            {/* Section 2: Target Location */}
            <div ref={sectionRefs.location} className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="text-[#CB2A26] w-5 h-5" /> Target Destination
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select the country and city where you are looking for accommodation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Country *
                  </label>
                  <SearchableDropdown
                    options={countriesList}
                    items={countriesList}
                    value={selectedCountry}
                    selectedItem={selectedCountry}
                    onChange={handleCountryChange}
                    onSelect={handleCountryChange}
                    placeholder="Select Country"
                    labelKey="name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    State / Region
                  </label>
                  <SearchableDropdown
                    options={statesList}
                    items={statesList}
                    value={selectedState}
                    selectedItem={selectedState}
                    onChange={handleStateChange}
                    onSelect={handleStateChange}
                    placeholder={selectedCountry ? "Select State" : "Select Country first"}
                    labelKey="name"
                    disabled={!selectedCountry || statesList.length === 0}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    City *
                  </label>
                  <SearchableDropdown
                    options={citiesList}
                    items={citiesList}
                    value={form.city ? { name: form.city } : null}
                    selectedItem={form.city ? { name: form.city } : null}
                    onChange={handleCityChange}
                    onSelect={handleCityChange}
                    placeholder={selectedState || selectedCountry ? "Select City" : "Select Country first"}
                    labelKey="name"
                    disabled={!selectedCountry}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Budget & Preferences */}
            <div ref={sectionRefs.budget} className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="text-[#CB2A26] w-5 h-5" /> Budget & Stay Options
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Set your maximum target monthly budget and stay preferences.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Max Monthly Budget *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="budget"
                      value={form.budget}
                      onChange={handleChange}
                      placeholder="e.g. 750"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26]"
                    />
                    <select
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-800 cursor-pointer focus:outline-none"
                    >
                      {CURRENCY_OPTIONS.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol})
                        </option>
                      ))}
                      {!CURRENCY_OPTIONS.some((c) => c.code === form.currency) && form.currency && (
                        <option value={form.currency}>
                          {form.currency}
                        </option>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Stay Duration Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Long Term", "Short Term"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, stayType: type }))}
                        className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all ${
                          form.stayType === type
                            ? "bg-[#00162D] text-white border-[#00162D]"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Furnishing Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Furnished", "Semi-Furnished", "Unfurnished"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, furnishing: option }))}
                      className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all ${
                        form.furnishing === option
                          ? "bg-[#CB2A26] text-white border-[#CB2A26]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Contact & Identity Verification Channels */}
            <div ref={sectionRefs.contact} className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Phone className="text-[#CB2A26] w-5 h-5" /> Direct Contact & Verification Channels
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Property hosts use these verified channels to reach out directly via WhatsApp, Phone call, or Email.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="seekerName"
                      value={form.seekerName}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <FaWhatsapp className="w-4 h-4 text-emerald-500" /> WhatsApp Number *
                  </label>
                  <div className="flex gap-2">
                    <CountryCodeSelect
                      value={form.whatsappPrefix}
                      onChange={(code) => setForm((prev) => ({ ...prev, whatsappPrefix: code }))}
                    />
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={form.whatsappNumber}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-500" /> Direct Phone Number
                  </label>
                  <div className="flex gap-2">
                    <CountryCodeSelect
                      value={form.phonePrefix}
                      onChange={(code) => setForm((prev) => ({ ...prev, phonePrefix: code }))}
                    />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26]"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Section 5: Detailed Description */}
            <div ref={sectionRefs.description} className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="text-[#CB2A26] w-5 h-5" /> Requirements & Details
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Describe move-in dates, roommates, background, or specific amenities needed.
                </p>
              </div>

              <div>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your situation (e.g. Master's student starting October, quiet, non-smoker, looking for room with desk and private bathroom)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26]"
                />
              </div>
            </div>

            {/* Section 6: Review & Submit */}
            <div ref={sectionRefs.review} className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="text-[#CB2A26] w-5 h-5" /> Review & Submit
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Verify your details and agree to terms to publish your stay request.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-[#CB2A26] focus:ring-[#CB2A26]"
                />
                <label htmlFor="terms" className="text-xs text-slate-700 font-medium leading-relaxed cursor-pointer">
                  I confirm that the information provided is accurate and agree to allow verified property hosts on NextKinLife to contact me regarding relevant accommodation offers.
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/accommodations")}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-[#CB2A26] hover:bg-[#a82220] text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      <span>Posting Request...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Post Stay Request Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}
