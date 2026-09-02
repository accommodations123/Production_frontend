import { useState, useEffect } from "react";
import { X, FileText, MapPin, Loader2, Info } from "lucide-react";
import { useCreateStayRequestMutation } from "@/hooks/data/useStayRequestHooks";
import { useAuth } from "@/shared/hooks/useAuth";
import { useCountry } from "@/context/CountryContext";
import { getCurrencyForCountry } from "@/shared/utils/countryUtils";
import { loadLocationData } from "@/shared/utils/lazyLocationData";
import SearchableDropdown from "@/shared/ui/SearchableDropdown";
import { toast } from "sonner";

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

export default function PostStayRequestModal({ onClose, onAdd }) {
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
    email: currentUser?.email || "",
    phone: currentUser?.phone || ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lazy loaded location library
  const [locationMod, setLocationMod] = useState(null);
  useEffect(() => {
    loadLocationData().then(setLocationMod);
  }, []);

  // Derive countries list to avoid setting state in effect
  const countriesList = locationMod
    ? locationMod.Country.getAllCountries().map((c) =>
        c.isoCode === "US" ? { ...c, name: "United States of America" } : c
      )
    : [];

  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [citiesFetched, setCitiesFetched] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

  // Auto-sync country and currency from Navbar active country
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

    if (!selectedCountry) {
      setSelectedCountry(targetCountry);
      setForm((prev) => ({
        ...prev,
        country: targetCountry.name,
        currency: prev.currency || derivedCurrency,
      }));

      if (locationMod && targetCountry?.isoCode) {
        const states = locationMod.State.getStatesOfCountry(targetCountry.isoCode);
        setStatesList(states || []);
        const countryCities = locationMod.City.getCitiesOfCountry(targetCountry.isoCode) || [];
        setCitiesList(countryCities);
      }
    }
  }, [activeCountry, countriesList, locationMod, selectedCountry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (country) => {
    const countryName = typeof country === "object" ? (country?.name || country?.label || "") : String(country || "");
    const selectedCountryObj = (typeof country === "object" && country?.isoCode)
      ? country
      : countriesList.find(
          (c) =>
            c.name?.toLowerCase() === countryName.toLowerCase() ||
            c.isoCode?.toLowerCase() === countryName.toLowerCase()
        );

    const derivedCurrency =
      country?.currency ||
      getCurrencyForCountry(countryName || selectedCountryObj?.isoCode) ||
      "INR";

    setSelectedCountry(selectedCountryObj || { name: countryName, isoCode: countryName });
    setForm((prev) => ({
      ...prev,
      country: countryName,
      currency: derivedCurrency,
      state: "",
      city: ""
    }));
    setSelectedState(null);

    const countryIso = selectedCountryObj?.isoCode;
    if (locationMod && countryIso) {
      setStatesList(locationMod.State.getStatesOfCountry(countryIso) || []);
      setCitiesList(locationMod.City.getCitiesOfCountry(countryIso) || []);
    } else {
      setStatesList([]);
      setCitiesList([]);
    }
    setCitiesFetched(false);
  };

  const handleStateChange = (state) => {
    const stateName = typeof state === "object" ? (state?.name || state?.label || "") : String(state || "");
    const selectedStateObj = (typeof state === "object" && state?.isoCode)
      ? state
      : statesList.find(
          (s) =>
            s.name?.toLowerCase() === stateName.toLowerCase() ||
            s.isoCode?.toLowerCase() === stateName.toLowerCase()
        );

    setSelectedState(selectedStateObj || { name: stateName, isoCode: stateName });
    setForm((prev) => ({ ...prev, state: stateName, city: "" }));

    const countryIso = selectedCountry?.isoCode || (countriesList.find(c => c.name?.toLowerCase() === form.country?.toLowerCase())?.isoCode);
    const stateIso = selectedStateObj?.isoCode;

    if (locationMod && countryIso && stateIso) {
      const stateCities = locationMod.City.getCitiesOfState(countryIso, stateIso);
      setCitiesList(stateCities || []);
      setCitiesFetched(true);
    }
  };

  const handleCityChange = (city) => {
    const cityName = typeof city === "object" ? (city?.name || city?.label || city?.value || "") : String(city || "");
    setForm((prev) => ({ ...prev, city: cityName }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = "Post title is required";
    if (!form.country) errors.country = "Target country is required";
    if (!form.city) errors.city = "Target city is required";
    if (!form.budget || Number(form.budget) <= 0) errors.budget = "Valid monthly budget is required";
    if (!form.description.trim()) errors.description = "Please describe what you are looking for";
    setFormErrors(errors);
    return errors;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
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
        phone: form.phone || currentUser?.phone || ""
      };

      const result = await createStayRequest(payload).unwrap();

      toast.success("Stay request posted successfully!");
      if (onAdd) {
        onAdd(result);
      }
      onClose();
    } catch (error) {
      console.error("Failed to submit stay request:", error);
      toast.error(error?.data?.message || error?.message || "Failed to submit stay request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#00162D]/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col my-8 animate-[scaleUp_0.15s_ease-out] text-left">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#00142E] flex items-center gap-2">
              <FileText className="text-[#CB2A26] w-5 h-5" /> Post Stay Request
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Looking for a stay? Let hosts in your target city find you.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[70vh]">
          
          {/* Info Banner */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex items-start gap-3">
            <Info className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              Potential hosts will see your budget, stay preference, and target location, and can reach out to you with matches. Keep your profile verified for higher trust responses.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Seeking shared apartment or room in Munich for winter semester"
              value={form.title}
              onChange={handleChange}
              className={`w-full rounded-lg border ${formErrors.title ? "border-red-500" : "border-slate-200"} bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-slate-350 transition-all`}
            />
            {formErrors.title && <span className="text-[10px] text-red-500 font-bold mt-1 block">{formErrors.title}</span>}
          </div>

          {/* Target Location */}
          <div className="space-y-4 pt-1">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-slate-50">
              <MapPin size={14} className="text-[#CB2A26]" /> Where do you need a stay?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SearchableDropdown
                label="Country"
                placeholder="Select Target Country"
                options={countriesList}
                value={form.country}
                onChange={handleCountryChange}
                error={formErrors.country}
                required={true}
              />
              <SearchableDropdown
                label="State"
                placeholder="Select State"
                options={statesList}
                value={form.state}
                disabled={!selectedCountry}
                isLoading={!statesList.length && selectedCountry}
                onChange={handleStateChange}
              />
              <SearchableDropdown
                label="City"
                placeholder="Select City"
                options={citiesList}
                value={form.city}
                disabled={!selectedState}
                isLoading={!citiesList.length && !citiesFetched && selectedState}
                onChange={handleCityChange}
                error={formErrors.city}
                required={true}
              />
            </div>
          </div>

          {/* Budget & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Max Monthly Budget <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="budget"
                  placeholder="e.g. 800"
                  value={form.budget}
                  onChange={handleChange}
                  className={`w-2/3 rounded-lg border ${formErrors.budget ? "border-red-500" : "border-slate-200"} bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-slate-350 transition-all`}
                />
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="w-1/3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-slate-350 cursor-pointer"
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
              {formErrors.budget && <span className="text-[10px] text-red-500 font-bold mt-1 block">{formErrors.budget}</span>}
            </div>

            {/* Stay Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Stay Duration Preference
              </label>
              <select
                name="stayType"
                value={form.stayType}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-slate-350 cursor-pointer"
              >
                <option value="Short Term">Short Term (&lt; 6 months)</option>
                <option value="Long Term">Long Term (&gt; 6 months)</option>
                <option value="Flexible">Flexible / No Preference</option>
              </select>
            </div>
          </div>

          {/* Furnishing Preference */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Furnishing Preference
            </label>
            <select
              name="furnishing"
              value={form.furnishing}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-slate-350 cursor-pointer"
            >
              <option value="Furnished">Fully Furnished</option>
              <option value="Semi-Furnished">Semi-Furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              About Me & Stay Details <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Tell hosts about yourself. Who are you? When do you plan to move? What kind of flatmates or rooms are you looking for?"
              value={form.description}
              onChange={handleChange}
              className={`w-full rounded-lg border ${formErrors.description ? "border-red-500" : "border-slate-200"} bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-slate-350 transition-all resize-none`}
            />
            {formErrors.description && <span className="text-[10px] text-red-500 font-bold mt-1 block">{formErrors.description}</span>}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-[#CB2A26] hover:bg-[#A9221F] disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Submitting Request...
              </>
            ) : (
              "Post Stay Request"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
