import React, { useState } from "react";
import {
  Upload,
  X,
  MapPin,
  DollarSign,
  Tag,
  Camera,
  Info,
  User,
  Mail,
  Phone,
  Loader2,

} from "lucide-react";
import { useCreateBuySellMutation, useUpdateBuySellMutation, useGetHostProfileQuery } from "@/store/api/hostApi";
import { useGetMeQuery } from "@/store/api/authApi";
import { cn } from "@/lib/utils";
import { fetchAddressByPincode } from "@/lib/pincodeUtils";
import { useEffect } from "react";
import { Country, State, City } from 'country-state-city';
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import { COUNTRIES } from "@/lib/mock-data";
import { CountryCodeSelect } from "@/components/ui/CountryCodeSelect";

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
      "text-black caret-black placeholder:text-gray-400",
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
      "text-black caret-black placeholder:text-gray-400",
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

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium text-gray-900">
    {children}
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
      : "bg-indigo-600 text-white hover:bg-indigo-700";

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
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
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
  const [category, setCategory] = useState("Furniture");
  const [subcategory, setSubcategory] = useState("");

  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [countriesList] = useState(Country.getAllCountries());
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

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
      if (initialData.country) {
        const cObj = countriesList.find(c => c.name === initialData.country);
        if (cObj) {
          setStatesList(State.getStatesOfCountry(cObj.isoCode));
          const sObj = State.getStatesOfCountry(cObj.isoCode).find(s => s.name === initialData.state);
          if (sObj) {
            setCitiesList(City.getCitiesOfState(cObj.isoCode, sObj.isoCode));
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
  }, [initialData, countriesList]);

  // Auto-fill address based on Pincode (Only if not editing or if user changes zip explicitly?)
  // Keeping logic simple: triggers on zipCode change.
  useEffect(() => {
    // If editing and zip matches initial, don't auto-fetch to avoid overwriting specific manual edits
    if (initialData && zipCode === initialData.zip_code) return;

    const fetchPincodeDetails = async () => {
      if (zipCode && zipCode.length === 6 && /^\d+$/.test(zipCode)) {
        setIsPincodeLoading(true);
        const addressData = await fetchAddressByPincode(zipCode);
        if (addressData) {
          const matchedCountry = countriesList.find(c => c.name.toLowerCase() === (addressData.country || "India").toLowerCase());
          const countryCode = matchedCountry?.isoCode || "IN";
          const states = State.getStatesOfCountry(countryCode);
          const matchedState = states.find(s => s.name.toLowerCase() === addressData.state?.toLowerCase());

          setCity(addressData.city || city);
          setState(matchedState?.name || addressData.state || state);
          setCountry(matchedCountry || country);

          if (countryCode) setStatesList(states);
          if (countryCode && matchedState?.isoCode) {
            setCitiesList(City.getCitiesOfState(countryCode, matchedState.isoCode));
          }
        }
        setIsPincodeLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchPincodeDetails, 500);
    return () => clearTimeout(timeoutId);
  }, [zipCode]);

  /* ================= IMAGE HANDLERS ================= */

  const addFiles = (files) => {
    const valid = Array.from(files).filter((f) => f instanceof File);
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
    setImagesToDelete(prev => [...prev, imgUrl]);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Client-side validation
    if (!title || !price || !description || !country || !state || !city || !streetAddress || !name || !phone) {
      setValidationError("Please fill in all required fields (Address, Name, Phone, etc.)");
      return;
    }

    const formData = new FormData();

    appendIfExists(formData, "title", title);
    appendIfExists(formData, "price", Number(price));
    appendIfExists(formData, "description", description);

    appendIfExists(formData, "country", typeof country === 'string' ? country : country?.name);
    appendIfExists(formData, "state", state);
    appendIfExists(formData, "city", city);
    appendIfExists(formData, "zip_code", zipCode);
    appendIfExists(formData, "street_address", streetAddress);

    appendIfExists(formData, "category", category);
    appendIfExists(formData, "subcategory", subcategory || category);

    appendIfExists(formData, "name", name);
    appendIfExists(formData, "phone", `${phoneCode}${phone}`);

    formData.append("status", "active");

    // New images
    images.forEach((img) => {
      formData.append("galleryImages", img);
    });

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
      <div className="max-w-3xl mx-auto bg-gray-50 p-8 rounded-xl text-center border border-gray-200">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isPending ? "Account Verification Pending" : "Host Access Required"}
        </h2>
        <p className="text-gray-600 mb-6">
          {isPending
            ? "Your host application is currently under review. You can list items once your account is approved."
            : "You need to be an approved host to list items for sale."
          }
        </p>

      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-xl">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
        {isEditing ? "Update Listing" : "List an Item for Sale"}
      </h2>
      <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
        {isEditing ? "Update your listing details" : "Share your items with community"}
      </p>

      {isError && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
          {error?.data?.message || "Failed to create listing"}
        </div>
      )}

      {validationError && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
          {validationError}
        </div>
      )}

      {isSuccess && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
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

          <Label>Category</Label>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Furniture</option>
            <option>Electronics</option>
            <option>Home & Garden</option>
            <option>Clothing</option>
            <option>Other</option>
          </Select>

          <Label>Subcategory</Label>
          <Input
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
          />

          <Label>Price</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm min-w-[1rem] text-center">
              {(() => {
                if (!country) return '$';
                const cName = typeof country === 'string' ? country : country.name;
                const found = COUNTRIES.find(c => c.name === cName);
                if (!found || !found.currency) return '$';
                try {
                  return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: found.currency,
                  }).formatToParts(0).find(part => part.type === 'currency')?.value || found.currency;
                } catch (e) {
                  return found.currency;
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
        </div>

        {/* LOCATION & DESCRIPTION */}
        <div className="bg-white p-4 rounded-lg space-y-3">
          <SearchableDropdown
            label="Country"
            placeholder="Select Country"
            options={countriesList}
            value={typeof country === 'string' ? country : country?.name}
            onChange={(c) => {
              setCountry(c);
              setState("");
              setCity("");
              setStatesList(State.getStatesOfCountry(c.isoCode));
              setCitiesList([]);
            }}
          />

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <SearchableDropdown
              label="State"
              placeholder="Select State"
              options={statesList}
              value={state}
              disabled={!country}
              isLoading={!statesList.length && country}
              onChange={(s) => {
                setState(s.name);
                setCity("");
                const cCode = country?.isoCode || countriesList.find(c => c.name === country)?.isoCode;
                if (cCode) {
                  setCitiesList(City.getCitiesOfState(cCode, s.isoCode));
                }
              }}
            />
            <SearchableDropdown
              label="City"
              placeholder="Select City"
              options={citiesList}
              value={city}
              disabled={!state}
              isLoading={!citiesList.length && state}
              onChange={(c) => setCity(c.name)}
            />
          </div>

          <div className="flex justify-between items-center">
            <Label>Zip Code</Label>
            {isPincodeLoading && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
          </div>
          <Input
            type="number"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />

          <Label>Street Address</Label>
          <Input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />

          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Info size={12} /> Clear descriptions increase buyer trust
          </p>
        </div>

        {/* CONTACT */}
        <div className="bg-white p-4 rounded-lg space-y-3">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />

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
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row">

          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (isEditing ? "Updating..." : "Posting...") : (isEditing ? "Update Listing" : "Post Listing")}
          </Button>
        </div>
      </form >
    </div >
  );
}