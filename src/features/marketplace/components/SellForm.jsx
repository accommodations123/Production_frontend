import React, { useState, useRef } from "react";
import {
  X,
  Camera,
  Info,
  Loader2,
  ShoppingBag
} from "lucide-react";
import { useCreateBuySellMutation, useUpdateBuySellMutation, useGetHostProfileQuery } from "@/store/api/hostApi";
import { useGetMeQuery } from "@/store/api/authApi";
import { cn } from "@/shared/utils/utils";
import { fetchAddressByPincode } from "@/shared/utils/pincodeUtils";
import { useEffect } from "react";
import { loadLocationData } from '@/shared/utils/lazyLocationData';
import { useNavigate } from "react-router-dom";
import SearchableDropdown from "@/shared/ui/SearchableDropdown";
import { COUNTRIES } from "@/shared/utils/mock-data";
import { CountryCodeSelect } from "@/shared/ui/CountryCodeSelect";
import { useCountry } from "@/context/CountryContext";
import { compressImage } from "@/shared/utils/imageUtils";

const CATEGORY_MAP = {
  Furniture: [
    "Bed",
    "Mattress",
    "Sofa",
    "Chair",
    "Study Table",
    "Dining Table",
    "Wardrobe",
    "TV Stand",
    "Other"
  ],
  Electronics: [
    "TV",
    "Monitor",
    "Gaming Console",
    "Speaker",
    "Headphones",
    "Camera",
    "Printer",
    "Smart Watch",
    "Projector",
    "Other"
  ],
  Vehicles: [
    "Car",
    "Bike",
    "Scooter",
    "Bicycle",
    "Truck",
    "SUV",
    "Electric Vehicle",
    "Other"
  ],
  "Mobile Phones": [
    "iPhone",
    "Samsung",
    "Google Pixel",
    "OnePlus",
    "Motorola",
    "Xiaomi",
    "Oppo",
    "Vivo",
    "Accessories",
    "Other"
  ],
  "Laptops & Computers": [
    "Laptop",
    "Desktop",
    "MacBook",
    "Gaming PC",
    "Monitor",
    "Keyboard",
    "Mouse",
    "Accessories",
    "Other"
  ],
  "Home & Garden": [
    "Home Decor",
    "Plants",
    "Garden Tools",
    "Storage",
    "Cleaning Supplies",
    "Furniture",
    "Other"
  ],
  "Kitchen & Appliances": [
    "Refrigerator",
    "Microwave",
    "Washing Machine",
    "Mixer Grinder",
    "Cookware",
    "Utensils",
    "Water Purifier",
    "Coffee Maker",
    "Other"
  ],
  "Books & Study Materials": [
    "Textbooks",
    "GRE",
    "GMAT",
    "TOEFL",
    "IELTS",
    "Programming",
    "Novels",
    "Academic Notes",
    "Other"
  ],
  "Clothing & Accessories": [
    "Men Clothing",
    "Women Clothing",
    "Kids Clothing",
    "Shoes",
    "Bags",
    "Watches",
    "Jewelry",
    "Accessories",
    "Other"
  ],
  "Sports & Fitness": [
    "Gym Equipment",
    "Dumbbells",
    "Yoga Equipment",
    "Cycling",
    "Sports Gear",
    "Fitness Tracker",
    "Other"
  ],
  "Baby & Kids": [
    "Baby Clothes",
    "Toys",
    "Baby Care",
    "Strollers",
    "Study Materials",
    "Furniture",
    "Other"
  ],
  "Tickets & Events": [
    "Concert Tickets",
    "Movie Tickets",
    "Sports Events",
    "Travel Tickets",
    "College Events",
    "Other"
  ],
  Services: [
    "Tutoring",
    "Cleaning",
    "Repair Services",
    "Moving Services",
    "Freelance Services",
    "Home Services",
    "Other"
  ],
  Other: ["Other"]
};

/* =========================================================
   BASIC UI COMPONENTS (MUST BE ABOVE SellForm)
   ========================================================= */

const Input = ({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}) => (
  <input
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    type={type}
    className={cn(
      "w-full h-9 sm:h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
      "text-black caret-black placeholder:text-[#717171]",
      "focus:outline-none focus:ring-2 focus:ring-indigo-500",
      className
    )}
  />
);

const Textarea = ({
  id,
  value,
  onChange,
  placeholder,
  className = "",
}) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={4}
    className={cn(
      "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
      "text-black caret-black placeholder:text-[#717171]",
      "focus:outline-none focus:ring-2 focus:ring-indigo-500",
      className
    )}
  />
);

const Select = ({ id, value, onChange, children }) => (
  <select
    id={id}
    value={value}
    onChange={onChange}
    className="w-full h-9 sm:h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
  >
    {children}
  </select>
);

const Label = ({ htmlFor, required = true, children }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium text-gray-900">
    {children} {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const Button = ({
  type = "button",
  onClick,
  disabled,
  variant = "primary",
  children,
}) => {
  const base =
    "px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base";
  const style =
    variant === "secondary"
      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
      : "bg-[#C93A30] text-white hover:bg-[#b02e25]";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, style)}
    >
      {children}
    </button>
  );
};

/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

const appendIfExists = (formData, key, value) => {
  if (value !== undefined && value !== null && value !== "") {
    formData.append(key, value);
  }
};

// Helper to split phone number
// Known country codes (most common first)
const KNOWN_CODES = ["+1", "+91", "+44", "+86", "+81", "+49", "+33", "+61", "+55", "+39", "+34", "+7", "+82", "+62", "+52", "+31", "+27", "+966", "+971", "+65", "+60", "+63", "+66", "+84", "+92", "+94", "+880", "+977", "+254", "+233", "+234"];

const splitPhone = (fullPhone) => {
  if (!fullPhone) return { code: "+91", number: "" };

  const phoneStr = fullPhone.toString().trim();

  // Case 1: Starts with + - check against known country codes
  if (phoneStr.startsWith('+')) {
    // Sort by length (longest first) to match +971 before +97, etc.
    const sortedCodes = [...KNOWN_CODES].sort((a, b) => b.length - a.length);
    for (const code of sortedCodes) {
      if (phoneStr.startsWith(code)) {
        return { code: code, number: phoneStr.slice(code.length).trim() };
      }
    }
    // Fallback: if not a known code, try matching 1-4 digits
    const match = phoneStr.match(/^(\+\d{1,4})(.*)$/);
    if (match) {
      return { code: match[1], number: match[2]?.trim() };
    }
  }

  // Case 2: Starts with country code without + (e.g., 918328632931 for India)
  // For Indian numbers: if starts with 91 and has 12 digits total, strip 91
  if (/^91\d{10}$/.test(phoneStr)) {
    return { code: "+91", number: phoneStr.slice(2) };
  }

  // Case 3: Just the number without any code (10 digits for India)
  if (/^\d{10}$/.test(phoneStr)) {
    return { code: "+91", number: phoneStr };
  }

  // Fallback: assume it's just the number
  return { code: "+91", number: phoneStr };
};

export function SellForm({ onPost, initialData, isEditing: externalIsEditing }) {
  const navigate = useNavigate();
  const { activeCountry: globalActiveCountry } = useCountry();
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const { data: userData } = useGetMeQuery();
  const { data: hostProfile, isLoading: isProfileLoading } = useGetHostProfileQuery(undefined, {
    skip: !userData
  });

  const isVerifiedHost = hostProfile?.status === 'approved';

  // State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("+91");
  const [phoneIso, setPhoneIso] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [condition, setCondition] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");

  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [csc, setCsc] = useState(null);
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [citiesFetched, setCitiesFetched] = useState(false);
  const lastSyncedGlobalCountryRef = useRef(null);

  useEffect(() => {
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

  // Mutations
  const [createBuySell, { isLoading: isCreating, isError: isCreateError, error: createError, isSuccess: isCreateSuccess }] = useCreateBuySellMutation();
  const [updateBuySell, { isLoading: isUpdating, isError: isUpdateError, error: updateError, isSuccess: isUpdateSuccess }] = useUpdateBuySellMutation();

  const isLoading = isCreating || isUpdating;
  const isError = isCreateError || isUpdateError;
  const error = createError || updateError;
  const isSuccess = isCreateSuccess || isUpdateSuccess;

  const isEditing = !!initialData || externalIsEditing;

  // Pre-fill user data OR initialData
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setPrice(initialData.price || "");
      setDescription(initialData.description || "");
      setZipCode(initialData.zip_code || "");
      setCity(initialData.city || "");
      setState(initialData.state || "");
      setCountry(initialData.country || "");
      setStreetAddress(initialData.street_address || "");
      setName(initialData.name || "");
      setCategory(initialData.category || "Furniture");
      setSubcategory(initialData.subcategory || "");
      setCondition(initialData.condition || "New");
      setMake(initialData.make || "");
      setModel(initialData.model || "");
      setYear(initialData.year || "");
      setMileage(initialData.mileage || "");
      setFuelType(initialData.fuel_type || "");
      setTransmission(initialData.transmission || "");

      // Phone
      if (initialData.phone) {
        const { code, number } = splitPhone(initialData.phone);
        setPhoneCode(code);
        setPhone(number);
      }

      // Existing images
      if (initialData.images && Array.isArray(initialData.images)) {
        setExistingImages(initialData.images);
      } else if (initialData.image) {
        setExistingImages([initialData.image]);
      }

      // Populate location lists
      // Note: We might need to find the ISO codes to populate states/cities lists correctly
      // For now, we set values directly. Lists will populate if user interacts with dropdowns.
      if (initialData.country && csc) {
        const cObj = countriesList.find(c => c.name === initialData.country);
        if (cObj) {
          setStatesList(csc.State.getStatesOfCountry(cObj.isoCode));
          const sObj = csc.State.getStatesOfCountry(cObj.isoCode).find(s => s.name === initialData.state);
          if (sObj) {
            setCitiesList(csc.City.getCitiesOfState(cObj.isoCode, sObj.isoCode));
            setCitiesFetched(true);
          }
        }
      }

    } else {
      // Pre-fill from User Data (Only for new listings)
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.fullName || user.name) setName(user.fullName || user.name);
          if (user.phone) {
            const { code, number } = splitPhone(user.phone);
            setPhoneCode(code);
            setPhone(number);
          }
        } catch (err) {
          console.warn("Failed to parse user for SellForm pre-fill", err);
        }
      }
    }
  }, [initialData, countriesList, csc]);

  // Pre-fill and sync country & states list from global country context (for new listings)
  useEffect(() => {
    const globalCountryCode = globalActiveCountry?.code || globalActiveCountry?.country;
    if (!isEditing && globalCountryCode && csc) {
      if (lastSyncedGlobalCountryRef.current !== globalCountryCode) {
        const countryName = globalActiveCountry.name === "United States" || globalActiveCountry.name.startsWith("United States")
          ? "United States of America"
          : globalActiveCountry.name;
        
        const matched = countriesList.find(c => c.name === countryName || c.isoCode === globalCountryCode);
        if (matched) {
          setCountry(matched);
          setStatesList(csc.State.getStatesOfCountry(matched.isoCode));
          setState("");
          setCity("");
          setCitiesList([]);
          setCitiesFetched(false);
          lastSyncedGlobalCountryRef.current = globalCountryCode;
        }
      }
    }
  }, [globalActiveCountry, isEditing, countriesList, csc]);

  // Auto-fill address based on Pincode (Only if not editing or if user changes zip explicitly?)
  // Keeping logic simple: triggers on zipCode change.
  useEffect(() => {
    // If editing and zip matches initial, don't auto-fetch to avoid overwriting specific manual edits
    if (initialData && zipCode === initialData.zip_code) return;

    const fetchPincodeDetails = async () => {
      if (zipCode && zipCode.length === 6 && /^\d+$/.test(zipCode) && csc) {
        setIsPincodeLoading(true);
        const addressData = await fetchAddressByPincode(zipCode);
        if (addressData) {
          const matchedCountry = countriesList.find(c => c.name.toLowerCase() === (addressData.country || "India").toLowerCase());
          const countryCode = matchedCountry?.isoCode || "IN";
          const states = csc.State.getStatesOfCountry(countryCode);
          const matchedState = states.find(s => s.name.toLowerCase() === addressData.state?.toLowerCase());

          setCity(addressData.city || city);
          setState(matchedState?.name || addressData.state || state);
          setCountry(matchedCountry || country);

          if (countryCode) setStatesList(states);
          if (countryCode && matchedState?.isoCode) {
            setCitiesList(csc.City.getCitiesOfState(countryCode, matchedState.isoCode));
            setCitiesFetched(true);
          }
        }
        setIsPincodeLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchPincodeDetails, 500);
    return () => clearTimeout(timeoutId);
  }, [zipCode, csc, countriesList]);

  /* ================= IMAGE HANDLERS ================= */

  const addFiles = (files) => {
    const valid = [];
    const oversized = [];
    Array.from(files).forEach((f) => {
      if (f instanceof File) {
        if (f.size > 10 * 1024 * 1024) {
          oversized.push(f.name);
        } else {
          valid.push(f);
        }
      }
    });

    if (oversized.length > 0) {
      setValidationError(`Some files are too large (Max 10MB): ${oversized.join(', ')}`);
    } else {
      setValidationError("");
    }
    
    setImages((prev) => [...prev, ...valid]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imgUrl) => {
    setExistingImages(prev => prev.filter(img => img !== imgUrl));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Client-side validation
    if (!title || !price || !description || !country || !state || !city || !streetAddress || !name || !phone || !category || !subcategory || !condition) {
      setValidationError("Please fill in all required fields (Category, Subcategory, Condition, Address, Name, Phone, etc.)");
      return;
    }

    // Prevent invalid subcategory selection outside the selected category
    const validSubs = CATEGORY_MAP[category] || ["Other"];
    if (!validSubs.includes(subcategory)) {
      setValidationError(`Invalid subcategory selected for category "${category}".`);
      return;
    }

    const formData = new FormData();

    appendIfExists(formData, "title", title);
    if (price !== "" && price !== null && price !== undefined) {
      formData.append("price", Number(price));
    }
    appendIfExists(formData, "description", description);

    appendIfExists(formData, "country", typeof country === 'string' ? country : country?.name);
    appendIfExists(formData, "state", state);
    appendIfExists(formData, "city", city);
    appendIfExists(formData, "zip_code", zipCode);
    appendIfExists(formData, "street_address", streetAddress);

    appendIfExists(formData, "category", category);
    appendIfExists(formData, "subcategory", subcategory);
    appendIfExists(formData, "condition", condition);

    if (category === "Vehicles") {
      appendIfExists(formData, "make", make);
      appendIfExists(formData, "model", model);
      appendIfExists(formData, "year", year);
      appendIfExists(formData, "mileage", mileage);
      appendIfExists(formData, "fuel_type", fuelType);
      appendIfExists(formData, "transmission", transmission);
    }

    appendIfExists(formData, "name", name);
    appendIfExists(formData, "phone", `${phoneCode}${phone}`);

    formData.append("status", "active");
    formData.append("existingImages", JSON.stringify(existingImages));

    // New images
    for (const img of images) {
      try {
        const compressed = await compressImage(img);
        formData.append("galleryImages", compressed);
      } catch (err) {
        console.error("Failed to compress listing image, using original:", err);
        formData.append("galleryImages", img);
      }
    }

    // Existing images to keep (if backend supports re-sending or if we just send deletions)
    // The current backend likely expects 'galleryImages' for NEW uploads.
    // For updating existing images, we might need a separate strategy or the backend might handle 'deleteImages' field.
    // Assuming backend handles replacements or we just add new ones. 
    // If backend replaces all images provided, we need to handle that. 
    // Usually 'update' with FormData appends. 
    // Let's assume for now we append new ones. 
    // And if we deleted existing ones, we check if backend supports a 'delete_images' field. 
    // If not, we might be limited. 
    // But basic NEW image upload works.

    // Pass existing images that were NOT deleted? 
    // Usually backend handling varies. For now let's send new images.

    try {
      let res;
      if (isEditing && initialData?.id) {
        res = await updateBuySell({ id: initialData.id, data: formData }).unwrap();
      } else {
        res = await createBuySell(formData).unwrap();
      }

      if (res?.success && onPost) {
        onPost(res.listing || res.listings?.[0]);
      }
    } catch (err) {
      console.error("Listing operation failed:", err);
    }
  };


  /* ================= RENDER ================= */
  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!isVerifiedHost) {
    const isPending = hostProfile?.status === 'pending';
    return (
      <div className="max-w-3xl mx-auto bg-gray-50 p-8 rounded-xl text-center border border-gray-200 shadow-md">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isPending ? "Account Verification Pending" : "Host Access Required"}
        </h2>
        <p className="text-[#222222] mb-6">
          {isPending
            ? "Your host application is currently under review. You can list items once your account is approved."
            : "You need to be an approved host to list items for sale."
          }
        </p>
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/marketplace")}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm cursor-pointer"
          >
            Back to Marketplace
          </button>
          {!isPending && (
            <button
              type="button"
              onClick={() => navigate("/hosts")}
              className="px-5 py-2 text-sm font-medium text-white bg-[#C93A30] rounded-lg hover:bg-[#b02e25] transition shadow-sm cursor-pointer"
            >
              Become a Host
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-md space-y-6 text-left">
      
      {/* Top Return Header */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-4">
        <button
          type="button"
          onClick={() => navigate("/marketplace")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold text-[#00142E] bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <span>← Back to Marketplace</span>
        </button>
        <span className="text-xs font-bold text-gray-400">Post Buy/Sell Listing</span>
      </div>

      {/* Header with Icon & Clean Subtitle */}
      <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-[#00142E] shrink-0">
          <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#00142E] tracking-tight">
            {isEditing ? "Update Listing" : "List an Item for Sale"}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            {isEditing ? "Update your listing details below." : "Share pre-owned furniture, electronics, and goods with fellow members."}
          </p>
        </div>
      </div>

      {isError && (
        <div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm font-medium">
          {error?.data?.message || "Failed to create listing"}
        </div>
      )}

      {validationError && (
        <div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm font-medium">
          {validationError}
        </div>
      )}

      {isSuccess && (
        <div className="bg-green-100 text-green-700 p-3 rounded-xl text-sm font-medium">
          Listing created successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PHOTOS */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-4 sm:p-6 bg-white text-center",
            dragActive ? "border-indigo-500" : "border-gray-300"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            className="hidden"
            id="images"
            onChange={(e) => addFiles(e.target.files)}
          />
          <label htmlFor="images" className="cursor-pointer">
            <Camera className="mx-auto text-indigo-600 mb-2 h-5 w-5 sm:h-6 sm:w-6" />
            <p className="font-medium text-gray-900 text-sm sm:text-base">
              Click or drag images here
            </p>
          </label>



          {(images.length > 0 || existingImages.length > 0) && (
            <div className="flex gap-2 sm:gap-3 mt-4 overflow-x-auto">
              {/* Existing Images */}
              {existingImages.map((imgUrl, i) => (
                <div
                  key={`existing-${i}`}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 border rounded-lg overflow-hidden shrink-0"
                >
                  <img
                    src={imgUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(imgUrl)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-red-50"
                  >
                    <X size={12} className="text-red-500" />
                  </button>
                </div>
              ))}

              {/* New Images */}
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 border rounded-lg overflow-hidden"
                >
                  <img
                    src={URL.createObjectURL(img)}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ITEM DETAILS */}
        <div className="bg-white p-4 rounded-lg space-y-3">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={category} onChange={(e) => {
                const newCat = e.target.value;
                setCategory(newCat);
                setSubcategory("");
              }}>
                <option value="">Select Category</option>
                {Object.keys(CATEGORY_MAP).map((catName) => (
                  <option key={catName} value={catName}>{catName}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Subcategory</Label>
              <Select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
                <option value="">Select Subcategory</option>
                {category && (CATEGORY_MAP[category] || []).map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Condition</Label>
              <Select value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="">Select Condition</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Used">Used</option>
              </Select>
            </div>
          </div>

          {/* Conditional Vehicle Fields */}
          {category === "Vehicles" && (
            <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/20 space-y-3 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <h4 className="font-semibold text-sm text-indigo-900 flex items-center gap-1.5">
                🚗 Vehicle Specifications
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <Label required={false}>Make</Label>
                  <Input 
                    value={make} 
                    onChange={(e) => setMake(e.target.value)} 
                    placeholder="e.g. Honda" 
                  />
                </div>
                <div>
                  <Label required={false}>Model</Label>
                  <Input 
                    value={model} 
                    onChange={(e) => setModel(e.target.value)} 
                    placeholder="e.g. Civic" 
                  />
                </div>
                <div>
                  <Label required={false}>Year</Label>
                  <Input 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)} 
                    placeholder="e.g. 2022" 
                  />
                </div>
                <div>
                  <Label required={false}>Mileage (mi / km)</Label>
                  <Input 
                    value={mileage} 
                    onChange={(e) => setMileage(e.target.value)} 
                    placeholder="e.g. 45000" 
                  />
                </div>
                <div>
                  <Label required={false}>Fuel Type</Label>
                  <Select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
                    <option value="">Select Fuel Type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="CNG">CNG</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
                <div>
                  <Label required={false}>Transmission</Label>
                  <Select value={transmission} onChange={(e) => setTransmission(e.target.value)}>
                    <option value="">Select Transmission</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <Label>Price</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484848] font-bold text-sm min-w-[1rem] text-center">
              {(() => {
                const cName = country ? (typeof country === 'string' ? country : country.name) : null;
                const normalized = (cName === "United States" || cName === "United States of America") ? "United States of America" : cName;
                let foundCurrency = null;
                
                if (normalized) {
                  // 1. Search in dynamically loaded countriesList if available
                  if (countriesList && countriesList.length > 0) {
                    const matchedCountry = countriesList.find(c => c.name === normalized || c.isoCode === normalized);
                    if (matchedCountry?.currency) {
                      foundCurrency = matchedCountry.currency;
                    }
                  }
                  // 2. Fallback to static COUNTRIES list
                  if (!foundCurrency) {
                    const found = COUNTRIES.find(c => c.name === normalized || c.code === normalized);
                    if (found?.currency) {
                      foundCurrency = found.currency;
                    }
                  }
                }

                // Get global active country currency for fallback
                const globalCountry = (countriesList && countriesList.find(c => c.isoCode === globalActiveCountry?.code || c.name === globalActiveCountry?.name)) ||
                                      COUNTRIES.find(c => c.code === globalActiveCountry?.code);
                const globalCurrency = globalCountry?.currency || globalActiveCountry?.currency;

                const currencyToUse = foundCurrency || globalCurrency || 'USD';
                try {
                  return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currencyToUse,
                  }).formatToParts(0).find(part => part.type === 'currency')?.value || currencyToUse;
                } catch (e) {
                  return currencyToUse;
                }
              })()}
            </div>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="pl-14" // Increased padding for 3-letter codes
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
            <span>💡</span>
            <span>Currency auto-selects based on your country</span>
          </p>
        </div>

        {/* LOCATION & DESCRIPTION */}
        <div className="bg-white p-4 rounded-lg space-y-3">
          {(() => {
            const selectedCountryName = typeof country === 'string' ? country : country?.name;
            const isValidCountry = countriesList.some(c => c.name === selectedCountryName);
            const isValidState = statesList.some(s => s.name === state);
            
            return (
              <>
                <SearchableDropdown
                  label="Country"
                  placeholder="Select Country"
                  options={countriesList}
                  value={typeof country === 'string' ? country : country?.name}
                  onChange={(c) => {
                    setCountry(c);
                    setState("");
                    setCity("");
                    if (csc) {
                      setStatesList(csc.State.getStatesOfCountry(c.isoCode));
                    }
                    setCitiesList([]);
                    setCitiesFetched(false);
                  }}
                />

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <SearchableDropdown
                    label="State"
                    placeholder="Select State"
                    options={statesList}
                    value={state}
                    disabled={!country}
                    isLoading={isValidCountry && !statesList.length && country}
                    onChange={(s) => {
                      setState(s.name);
                      setCity("");
                      const cCode = country?.isoCode || countriesList.find(c => c.name === country)?.isoCode;
                      if (cCode && csc) {
                        setCitiesList(csc.City.getCitiesOfState(cCode, s.isoCode));
                        setCitiesFetched(true);
                      } else {
                        setCitiesFetched(false);
                      }
                    }}
                  />
                  <SearchableDropdown
                    label="City"
                    placeholder="Select City"
                    options={citiesList}
                    value={city}
                    disabled={!state}
                    isLoading={isValidState && !citiesList.length && !citiesFetched && state}
                    onChange={(c) => setCity(c.name)}
                  />
                </div>
              </>
            );
          })()}

          <div className="flex justify-between items-center">
            <Label>Zip Code</Label>
            {isPincodeLoading && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
          </div>
          <Input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="e.g., 10001 or SW1A 1AA"
          />

          <Label>Street Address</Label>
          <Input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />

          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-xs text-[#484848] flex items-center gap-1">
            <Info size={12} /> Clear descriptions increase buyer trust
          </p>
        </div>

        {/* CONTACT */}
        <div className="bg-white p-4 rounded-lg space-y-3">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => {
  let val = e.target.value;
  // allow alphabets, spaces, hyphens, and apostrophes for international names
  val = val.replace(/[^a-zA-Z\s'-]/g, "");
  setName(val);
}} />

          {/* <Label>Email</Label> */}
          {/* <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          /> */}

          <Label>Phone</Label>
          <div className="flex gap-2">
            <CountryCodeSelect
              value={phoneCode || "+91"}
              isoCode={phoneIso}
              onChange={(code, iso) => {
                setPhoneCode(code);
                if (iso) setPhoneIso(iso);
              }}
              className="w-[110px]"
            />
            <Input
              type="tel"
              value={phone}
onChange={(e) => {
  let val = e.target.value;
  // only numbers
  val = val.replace(/[^0-9]/g, "");
  // limit to 15 digits (E.164 standard max length)
  val = val.slice(0, 15);
  setPhone(val);
}}
inputMode="numeric"              className="flex-1"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row">

          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-[#00142E] hover:bg-[#071F3B] text-white font-bold rounded-xl h-11 px-8 cursor-pointer">
            {isLoading ? (isEditing ? "Updating..." : "Posting...") : (isEditing ? "Update Listing" : "Post Listing")}
          </Button>
        </div>
      </form >
    </div >
  );
}
