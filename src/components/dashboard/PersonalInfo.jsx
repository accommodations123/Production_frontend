"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  User, Phone, Mail, Globe, MapPin, Edit2, Share2, 
  ExternalLink, Check, X, ChevronDown, Building2, CheckCircle2, ShieldCheck
} from "lucide-react";
import { useCountry } from "@/context/CountryContext";
import { COUNTRIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Facebook, Instagram, MessageCircle } from "lucide-react";
import { CountryCodeSelect } from "@/components/ui/CountryCodeSelect";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { extractUsername, getSocialUrl } from "@/lib/socialUtils";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import { loadLocationData } from '@/lib/lazyLocationData';

const DetailCard = ({ title, description, children, onEdit, isEditing, icon: Icon, isUpdating, className }) => (
  <div className={cn(
    "relative rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)]",
    className
  )}>
    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none -z-10">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-full blur-3xl"></div>
    </div>

    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>

        <button
          onClick={onEdit}
          disabled={isUpdating}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-all shadow-sm",
            isEditing
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          )}
        >
          {isUpdating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </>
          ) : isEditing ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Save
            </>
          ) : (
            <>
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {children}
      </div>
    </div>
  </div>
);

const InfoField = ({
  label,
  value,
  isEditing,
  onChange,
  name,
  type = "text",
  placeholder,
  action,
  actionIcon: ActionIcon,
  prefix,
  iso,
  onPrefixChange
}) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1 block">
      {label}
    </label>
    {isEditing ? (
      type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder || label}
          rows={4}
          className="w-full bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 transition-all resize-none"
        />
      ) : (
        <div className="flex gap-2">
          {prefix !== undefined && onPrefixChange && (
            <div className="w-[110px] flex-shrink-0">
              <CountryCodeSelect value={prefix} isoCode={iso} onChange={onPrefixChange} />
            </div>
          )}
          <input
            type={type}
            name={name}
            value={value}
            onChange={(e) => {
              let val = e.target.value;
              if (name === "phone" || name === "whatsapp" || name === "zip") {
                val = val.replace(/[^0-9]/g, "");
                if (name === "phone" || name === "whatsapp") {
                  val = val.slice(0, 10);
                }
                if (name === "zip") {
                  val = val.slice(0, 6);
                }
              }
              onChange({ target: { name, value: val } });
            }}
            inputMode={name === "phone" || name === "whatsapp" || name === "zip" ? "numeric" : undefined}
            placeholder={placeholder || label}
            className="w-full h-11 bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 transition-all"
          />
        </div>
      )
    ) : (
      <div className="relative group w-full">
        <div className="px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-100 font-semibold text-gray-800 text-sm flex items-center justify-between min-h-[44px]">
          <span className="truncate">
            {prefix && value ? `${prefix} ${value}` : (value || <span className="text-gray-300 font-normal italic">Not specified</span>)}
          </span>
          {action && value && (
            <button
              onClick={() => action(prefix ? `${prefix}${value}` : value)}
              className="p-1.5 bg-white border border-gray-100 rounded-lg shadow-sm text-blue-600 hover:text-white hover:bg-blue-600 transition-all flex items-center justify-center shrink-0"
              title="Open"
            >
              {ActionIcon ? <ActionIcon size={12} /> : <ExternalLink size={12} />}
            </button>
          )}
        </div>
      </div>
    )}
  </div>
);

export const PersonalInfo = ({ initialData, verificationState, onUpdate, isUpdating, isHost }) => {
  const { activeCountry } = useCountry();
  const navigate = useNavigate();
  const [editStates, setEditStates] = useState({
    personal: false,
    location: false,
    social: false,
  });

  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    country: initialData?.country || "",
    state: initialData?.state || "",
    city: initialData?.city || "",
    address: initialData?.address || "",
    zip: initialData?.zip || "",
    whatsapp: initialData?.whatsapp || "",
    facebook: initialData?.facebook || "",
    instagram: initialData?.instagram || "",
    phoneCode: activeCountry?.phoneCode || "+91",
    phoneIso: activeCountry?.code || "IN",
    whatsappCode: activeCountry?.phoneCode || "+91",
    whatsappIso: activeCountry?.code || "IN"
  });

  const [csc, setCsc] = useState(null);
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const citiesFetched = useRef(false);

  useEffect(() => {
    let active = true;
    loadLocationData().then(data => {
      if (!active) return;
      setCsc(data);
      const countries = data.Country.getAllCountries();
      setCountriesList(countries);

      if (formData.country) {
        const countryObj = countries.find(c => c.name === formData.country);
        if (countryObj) {
          const states = data.State.getStatesOfCountry(countryObj.isoCode);
          setStatesList(states);

          if (formData.state) {
            const stateObj = states.find(s => s.name === formData.state);
            if (stateObj) {
              setCitiesList(data.City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode));
              citiesFetched.current = true;
            }
          }
        }
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (formData.country && csc) {
      const countryObj = countriesList.find(c => c.name === formData.country);
      if (countryObj) {
        const states = csc.State.getStatesOfCountry(countryObj.isoCode);
        setStatesList(states);

        if (formData.state) {
          const stateObj = states.find(s => s.name === formData.state);
          if (stateObj) {
            setCitiesList(csc.City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode));
            citiesFetched.current = true;
          }
        }
      }
    }
  }, [formData.country, formData.state, countriesList, csc]);

  const KNOWN_CODES = ["+1", "+91", "+44", "+86", "+81", "+49", "+33", "+61", "+55", "+39", "+34", "+7", "+82", "+62", "+52", "+31", "+27", "+966", "+971", "+65", "+60", "+63", "+66", "+84", "+92", "+94", "+880", "+977", "+254", "+233", "+234"];

  const splitPhone = (fullPhone, defaultCode = "+91", defaultIso = "IN") => {
    if (!fullPhone) return { code: defaultCode, iso: defaultIso, number: "" };
    const phoneStr = fullPhone.toString().trim();
    if (phoneStr.startsWith('+')) {
      const sortedCodes = [...KNOWN_CODES].sort((a, b) => b.length - a.length);
      for (const code of sortedCodes) {
        if (phoneStr.startsWith(code)) {
          const number = phoneStr.slice(code.length).trim();
          const found = COUNTRIES.find(c => c.phoneCode === code);
          const iso = found ? found.code : defaultIso;
          return { code, iso, number };
        }
      }
    }
    return { code: defaultCode, iso: defaultIso, number: phoneStr };
  };

  useEffect(() => {
    if (initialData) {
      setFormData(prev => {
        const defaultCode = activeCountry?.phoneCode || "+91";
        const defaultIso = activeCountry?.code || "IN";
        const parsedPhone = splitPhone(initialData.phone, defaultCode, defaultIso);
        const parsedWhatsApp = splitPhone(initialData.whatsapp, defaultCode, defaultIso);

        return {
          ...prev,
          full_name: initialData.full_name || initialData.name || prev.full_name || "",
          email: initialData.email || prev.email || "",
          phone: parsedPhone.number || "",
          phoneCode: parsedPhone.code,
          phoneIso: parsedPhone.iso,
          country: initialData.country || prev.country || "",
          state: initialData.state || prev.state || "",
          city: initialData.city || prev.city || "",
          address: initialData.street_address || initialData.address || prev.address || "",
          zip: initialData.zip_code || initialData.zip || prev.zip || "",
          whatsapp: parsedWhatsApp.number || "",
          whatsappCode: parsedWhatsApp.code,
          whatsappIso: parsedWhatsApp.iso,
          facebook: initialData.facebook || prev.facebook || "",
          instagram: initialData.instagram || prev.instagram || "",
        };
      });
    }
  }, [initialData]);

  // Dynamically update prefix if global activeCountry changes
  useEffect(() => {
    if (activeCountry) {
      setFormData(prev => ({
        ...prev,
        phoneCode: activeCountry.phoneCode || "+91",
        phoneIso: activeCountry.code || "IN",
        whatsappCode: activeCountry.phoneCode || "+91",
        whatsappIso: activeCountry.code || "IN"
      }));
    }
  }, [activeCountry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleEdit = async (section) => {
    if (!isHost) {
      toast.error("You're not a host");
      navigate("/hosts");
      return;
    }
    if (editStates[section]) {
      try {
        const cleanFb = extractUsername('facebook', formData.facebook);
        const cleanInsta = extractUsername('instagram', formData.instagram);
        
        setFormData(prev => ({
          ...prev,
          facebook: cleanFb,
          instagram: cleanInsta
        }));

        if (onUpdate) {
          const payload = new FormData();
          Object.keys(formData).forEach(key => {
            if (key !== 'phone' && key !== 'whatsapp' && key !== 'phoneCode' && key !== 'whatsappCode' && key !== 'phoneIso' && key !== 'whatsappIso') {
              let val = formData[key];
              if (key === 'facebook') val = cleanFb;
              if (key === 'instagram') val = cleanInsta;
              payload.append(key, val);
            }
          });

          const finalPhone = formData.phone ? `${formData.phoneCode}${formData.phone}` : "";
          const finalWhatsapp = formData.whatsapp ? `${formData.whatsappCode}${formData.whatsapp}` : "";

          payload.append('phone', finalPhone);
          payload.append('whatsapp', finalWhatsapp);
          payload.append('zip_code', formData.zip);
          payload.append('street_address', formData.address);

          await onUpdate(payload);
        }
        setEditStates(prev => ({ ...prev, [section]: false }));
      } catch (error) {
        console.error("Update failed", error);
        toast.error("Failed to update profile. Please try again.");
      }
    } else {
      setEditStates(prev => ({ ...prev, [section]: true }));
    }
  };

  // Auto-fill address based on Pincode lookup
  useEffect(() => {
    const fetchPincodeDetails = async () => {
      const pincode = formData.zip;
      if (pincode && pincode.length === 6 && /^\d+$/.test(pincode) && editStates.location) {
        try {
          const { fetchAddressByPincode } = await import('@/lib/pincodeUtils');
          const addressData = await fetchAddressByPincode(pincode);
          if (addressData) {
            setFormData(prev => ({
              ...prev,
              city: addressData.city || prev.city,
              state: addressData.state || prev.state,
              country: addressData.country || prev.country
            }));
          }
        } catch (e) { console.error(e); }
      }
    };

    const timeoutId = setTimeout(fetchPincodeDetails, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.zip, editStates.location]);

  const openSocialLink = (platform, value) => {
    const url = getSocialUrl(platform, value);
    if (url) window.open(url, '_blank');
  };

  const isValidCountry = countriesList.some(c => c.name === formData.country);
  const isValidState = statesList.some(s => s.name === formData.state);

  // Profile Completion Meter Calculation
  const completionScore = useMemo(() => {
    let score = 0;
    if (formData.full_name) score += 20;
    if (formData.email) score += 20;
    if (formData.phone) score += 20;
    if (formData.country && formData.city) score += 20;
    if (formData.whatsapp || formData.facebook || formData.instagram) score += 20;
    return score;
  }, [formData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Visual Header Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-full blur-3xl -z-10"></div>
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase block">Identity Profile 🔒</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Personal Information</h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg leading-relaxed">
            Manage your personal verification details, contact numbers, primary locations, and social links.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: detail cards grouped */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Identity details */}
          <DetailCard
            title="Personal Details"
            description="Your primary identity credentials"
            icon={User}
            isEditing={editStates.personal}
            onEdit={() => toggleEdit('personal')}
            isUpdating={isUpdating && editStates.personal}
            className="z-30"
          >
            <div className="md:col-span-2">
              <InfoField label="Full Name" name="full_name" value={formData.full_name} isEditing={editStates.personal} onChange={handleChange} />
            </div>
            <InfoField label="Email Address" name="email" type="email" value={formData.email} isEditing={editStates.personal} onChange={handleChange} />
            <InfoField
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              isEditing={editStates.personal}
              onChange={handleChange}
              prefix={formData.phoneCode}
              iso={formData.phoneIso}
              onPrefixChange={(code, iso) => setFormData(prev => ({ ...prev, phoneCode: code, phoneIso: iso }))}
            />
          </DetailCard>

          {/* Location details */}
          <DetailCard
            title="Location & Address"
            description="Your primary accommodation hosting location"
            icon={MapPin}
            isEditing={editStates.location}
            onEdit={() => toggleEdit('location')}
            isUpdating={isUpdating && editStates.location}
            className="z-20"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1 block">Country</label>
              {editStates.location ? (
                <SearchableDropdown
                  label=""
                  placeholder="Select Country"
                  options={countriesList}
                  value={formData.country}
                  onChange={(option) => {
                    setFormData(prev => ({ ...prev, country: option.name, state: "", city: "" }));
                    if (csc) {
                      setStatesList(csc.State.getStatesOfCountry(option.isoCode));
                    }
                    setCitiesList([]);
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 transition-all font-bold text-sm h-11"
                />
              ) : (
                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 font-semibold text-gray-800 text-sm flex items-center min-h-[44px]">
                  {formData.country || <span className="text-gray-300 font-normal italic">Not specified</span>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1 block">State / Province</label>
              {editStates.location ? (
                <SearchableDropdown
                  label=""
                  placeholder="Select State"
                  options={statesList}
                  value={formData.state}
                  disabled={!formData.country}
                  isLoading={isValidCountry && !statesList.length && formData.country}
                  onChange={(option) => {
                    setFormData(prev => ({ ...prev, state: option.name, city: "" }));
                    const countryObj = countriesList.find(c => c.name === formData.country);
                    if (countryObj && csc) {
                      setCitiesList(csc.City.getCitiesOfState(countryObj.isoCode, option.isoCode));
                      citiesFetched.current = true;
                    } else {
                      citiesFetched.current = false;
                    }
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 transition-all font-bold text-sm h-11"
                />
              ) : (
                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 font-semibold text-gray-800 text-sm flex items-center min-h-[44px]">
                  {formData.state || <span className="text-gray-300 font-normal italic">Not specified</span>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1 block">City</label>
              {editStates.location ? (
                <SearchableDropdown
                  label=""
                  placeholder="Select City"
                  options={citiesList}
                  value={formData.city}
                  disabled={!formData.state}
                  isLoading={isValidState && !citiesList.length && !citiesFetched.current && formData.state}
                  onChange={(option) => {
                    setFormData(prev => ({ ...prev, city: option.name }));
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 transition-all font-bold text-sm h-11"
                />
              ) : (
                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 font-semibold text-gray-800 text-sm flex items-center min-h-[44px]">
                  {formData.city || <span className="text-gray-300 font-normal italic">Not specified</span>}
                </div>
              )}
            </div>

            <InfoField label="Zip / Pin Code" name="zip" value={formData.zip} isEditing={editStates.location} onChange={handleChange} />
            <div className="md:col-span-2">
              <InfoField label="Street Address" name="address" value={formData.address} isEditing={editStates.location} onChange={handleChange} placeholder="House number, street name..." />
            </div>
          </DetailCard>

          {/* Social details */}
          <DetailCard
            title="Social Links & Contacts"
            description="Your external profiles and chats"
            icon={Share2}
            isEditing={editStates.social}
            onEdit={() => toggleEdit('social')}
            isUpdating={isUpdating && editStates.social}
            className="z-10"
          >
            <div className="md:col-span-2">
              <InfoField
                label="WhatsApp Number"
                name="whatsapp"
                value={formData.whatsapp}
                isEditing={editStates.social}
                onChange={handleChange}
                placeholder="1234567890"
                action={(val) => openSocialLink('whatsapp', val)}
                actionIcon={MessageCircle}
                prefix={formData.whatsappCode}
                iso={formData.whatsappIso}
                onPrefixChange={(code, iso) => setFormData(prev => ({ ...prev, whatsappCode: code, whatsappIso: iso }))}
              />
            </div>
            <InfoField
              label="Facebook Profile"
              name="facebook"
              value={formData.facebook}
              isEditing={editStates.social}
              onChange={handleChange}
              placeholder="username"
              action={(val) => openSocialLink('facebook', val)}
              actionIcon={Facebook}
            />
            <InfoField
              label="Instagram Profile"
              name="instagram"
              value={formData.instagram}
              isEditing={editStates.social}
              onChange={handleChange}
              placeholder="username"
              action={(val) => openSocialLink('instagram', val)}
              actionIcon={Instagram}
            />
          </DetailCard>
        </div>

        {/* Right Side: completion meter & Trust badge */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-5">
            <h3 className="font-extrabold text-gray-900 text-base">Profile Strength</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-600">Completeness</span>
                <span className="font-extrabold text-blue-600">{completionScore}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 rounded-full" 
                  style={{ width: `${completionScore}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3">
              <ShieldCheck className="w-9 h-9 text-blue-600 shrink-0" />
              <div>
                <p className="font-extrabold text-gray-900 text-xs">Verified Hosting Profile</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                  Verifying your account details builds absolute credibility for guests matching on your listings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
