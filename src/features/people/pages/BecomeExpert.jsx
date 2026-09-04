import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TextField, TextareaField, SelectField } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Star,
  MapPin,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  User,
  DollarSign,
  Image as ImageIcon,
  Globe,
  PhoneCall,
  Lock,
  Upload,
  X,
  Award,
  ShieldCheck,
  ExternalLink,
  Send,
  Camera,
  Check,
  FileText,
  Briefcase,
  Layers,
  Users
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp
} from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { getCurrencySymbol, getCurrencyForCountry } from "@/shared/utils/countryUtils";
import { useCountry } from "@/context/CountryContext";
import { PEOPLE_CATEGORIES } from "../data/categories";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import { loadLocationData } from "@/shared/utils/lazyLocationData";
import {
  useCreateProfileMutation,
  useUpdateProfileMutation,
  usePublishProfileMutation,
  useUploadFileMutation,
  useGetMyProfileQuery
} from "@/hooks/data/usePeopleHooks";

import { ProviderConnectCard } from "../components/ProviderConnectCard";
import { ProviderConnectModal } from "../components/ProviderConnectModal";

// Validation schema for essential fields
const expertOnboardingSchema = z.object({
  // Step 1: Basic Info & Location
  name: z.string().min(2, "Full name must be at least 2 characters"),
  headline: z.string().optional(),
  category: z.string().min(1, "Please select an expert category"),
  country: z.string().min(2, "Country name is required"),
  state: z.string().optional(),
  city: z.string().min(2, "City name is required"),

  // Step 2: Professional Details
  profession: z.string().min(3, "Professional title must be at least 3 characters"),
  bio: z
    .string()
    .min(20, "Bio description must be at least 20 characters")
    .max(1000, "Bio description cannot exceed 1000 characters"),
  experience: z.string().optional(),
  languages: z.string().optional(),
  skills: z.string().optional(),
  specializations: z.string().optional(),
  timezone: z.string().optional(),
  hourlyRate: z.coerce
    .number()
    .min(0, "Rate must be $0 or greater")
    .max(10000, "Maximum consultation rate is $10,000"),
  currency: z.string().default("USD"),
  pricingType: z.string().default("hourly"),
  availability: z.string().optional(),
  // Optional Education & Qualifications
  education_degree: z.string().optional(),
  education_school: z.string().optional(),
  education_year: z.string().optional(),

  // Step 3: Social & Contact Links (Instagram, Facebook, Website, WhatsApp, Telegram)
  website: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
  telegram: z.string().optional(),

  // Step 3: Privacy Settings
  allow_website: z.boolean().default(true),
  allow_whatsapp: z.boolean().default(true),
  allow_telegram: z.boolean().default(true),
  allow_email: z.boolean().default(true),
  allow_phone: z.boolean().default(false),
  allow_contact_request: z.boolean().default(true)
});

// Allowed Provider Configurations (Instagram, Facebook, Website, WhatsApp, Telegram)
const PROFESSIONAL_PROVIDERS = [
  {
    id: "instagram",
    name: "Instagram",
    description: "Visual profile & portfolio highlights",
    icon: FaInstagram,
    bgClass: "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600",
    supportsOAuth: false,
    actionText: "Add Instagram",
    placeholder: "username or https://instagram.com/username"
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Public business page or profile",
    icon: FaFacebookF,
    bgClass: "bg-[#1877F2]",
    supportsOAuth: false,
    actionText: "Add Facebook",
    placeholder: "username or https://facebook.com/username"
  },
  {
    id: "website",
    name: "Website / Portfolio",
    description: "Add your professional website or portfolio link",
    icon: Globe,
    bgClass: "bg-emerald-600",
    supportsOAuth: false,
    actionText: "Add Website",
    placeholder: "https://yourwebsite.com"
  }
];

const CONTACT_PROVIDERS = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Direct inquiries & quick client messaging",
    icon: FaWhatsapp,
    bgClass: "bg-[#25D366]",
    supportsOAuth: false,
    actionText: "Add WhatsApp",
    placeholder: "phone number or https://wa.me/1234567890"
  },

];

export default function BecomeExpert() {
  const { activeCountry } = useCountry();
  const navigate = useNavigate();
  const { isAuthenticated, user: currentUser } = useSelector((state) => state.auth || {});

  // Wizard active step state (1 Basic Info -> 2 Professional Details -> 3 Review & Publish)
  const [currentStep, setCurrentStep] = useState(1);

  const [createProfile, { isLoading: isCreating }] = useCreateProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [publishProfile, { isLoading: isPublishing }] = usePublishProfileMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const [success, setSuccess] = useState(false);
  const [publishedProfileId, setPublishedProfileId] = useState(null);
  const [uploadProgressText, setUploadProgressText] = useState("");

  // Profile and Cover Image local state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.profile_image || "");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  // Modal Connection state
  const [activeModalProvider, setActiveModalProvider] = useState(null);

  useEffect(() => {
    if (currentUser?.profile_image && !avatarPreview) {
      setAvatarPreview(currentUser.profile_image);
    }
  }, [currentUser?.profile_image, avatarPreview]);

  const { data: myProfileRes } = useGetMyProfileQuery();
  const existingProfile = myProfileRes?.profile || myProfileRes?.data || (myProfileRes?.id ? myProfileRes : null);
  const isExisting = Boolean(
    existingProfile &&
    (existingProfile.role === 'expert' || existingProfile.profession || existingProfile.headline || (existingProfile.bio && existingProfile.bio.trim().length > 0))
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(expertOnboardingSchema),
    mode: "onTouched",
    defaultValues: {
      name: currentUser?.name || "",
      profession: "",
      headline: "",
      category: "legal-visa",
      bio: "",
      experience: "",
      languages: "English",
      skills: "",
      specializations: "",
      country: "",
      state: "",
      city: "",
      timezone: "UTC",
      hourlyRate: 50,
      currency: "USD",
      pricingType: "hourly",
      availability: "Available",
      accepting_clients: true,
      response_time: "Within 24 hours",
      education_degree: "",
      education_school: "",
      education_year: "",
      website: "",
      facebook: "",
      instagram: "",
      whatsapp: "",
      telegram: "",
      allow_website: true,
      allow_whatsapp: true,
      allow_telegram: true,
      allow_email: true,
      allow_phone: false,
      allow_contact_request: true
    }
  });

  // Cascading location state
  const [locationMod, setLocationMod] = useState(null);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  // Lazy load country-state-city library
  useEffect(() => {
    let cancelled = false;
    loadLocationData().then((mod) => {
      if (!cancelled) {
        setLocationMod(mod);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Countries list derived from location module
  const countriesList = useMemo(() => {
    if (!locationMod) return [];
    return locationMod.Country.getAllCountries().map((c) =>
      c.isoCode === "US" ? { ...c, name: "United States of America" } : c
    );
  }, [locationMod]);

  useEffect(() => {
    if (existingProfile) {
      reset({
        name: typeof existingProfile.name === "string" ? existingProfile.name : currentUser?.name || "",
        profession: typeof existingProfile.profession === "string" ? existingProfile.profession : "",
        headline: typeof existingProfile.headline === "string" ? existingProfile.headline : "",
        category: typeof existingProfile.category === "string" ? existingProfile.category : "legal-visa",
        bio: typeof existingProfile.bio === "string" ? existingProfile.bio : "",
        experience: typeof existingProfile.experience === "string" ? existingProfile.experience : "",
        languages: Array.isArray(existingProfile.languages)
          ? existingProfile.languages.join(", ")
          : typeof existingProfile.languages === "string"
            ? existingProfile.languages
            : "English",
        skills: Array.isArray(existingProfile.skills)
          ? existingProfile.skills.join(", ")
          : typeof existingProfile.skills === "string"
            ? existingProfile.skills
            : "",
        specializations: Array.isArray(existingProfile.specializations)
          ? existingProfile.specializations.join(", ")
          : typeof existingProfile.specializations === "string"
            ? existingProfile.specializations
            : "",
        country: typeof existingProfile.country === "string" ? existingProfile.country : "",
        state: typeof existingProfile.state === "string" ? existingProfile.state : "",
        city: typeof existingProfile.city === "string" ? existingProfile.city : "",
        timezone: typeof existingProfile.timezone === "string" ? existingProfile.timezone : "UTC",
        education_degree: existingProfile.educations?.[0]?.degree || existingProfile.education_degree || "",
        education_school: existingProfile.educations?.[0]?.institution || existingProfile.educations?.[0]?.school || existingProfile.education_school || "",
        education_year: existingProfile.educations?.[0]?.year || existingProfile.education_year || "",
        hourlyRate: (existingProfile.hourlyRate !== null && existingProfile.hourlyRate !== undefined && !isNaN(Number(existingProfile.hourlyRate)))
          ? Number(existingProfile.hourlyRate)
          : (existingProfile.hourly_rate !== null && existingProfile.hourly_rate !== undefined && !isNaN(Number(existingProfile.hourly_rate)))
            ? Number(existingProfile.hourly_rate)
            : (existingProfile.pricing?.consultation ? Number(existingProfile.pricing.consultation) : 500),
        currency: existingProfile.currency || existingProfile.pricing?.currency || (existingProfile.country ? getCurrencyForCountry(existingProfile.country) : (activeCountry?.currency || "USD")),
        pricingType: existingProfile.pricingType || existingProfile.pricing?.type || "hourly",
        availability: typeof existingProfile.availability === "string" ? existingProfile.availability : "Available",
        accepting_clients: existingProfile.accepting_clients ?? true,
        response_time: typeof existingProfile.response_time === "string" ? existingProfile.response_time : "Within 24 hours",
        website: typeof existingProfile.website === "string" ? existingProfile.website : "",
        facebook: typeof existingProfile.facebook === "string" ? existingProfile.facebook : "",
        instagram: typeof existingProfile.instagram === "string" ? existingProfile.instagram : "",
        whatsapp: typeof existingProfile.whatsapp === "string" ? existingProfile.whatsapp : "",
        telegram: typeof existingProfile.telegram === "string" ? existingProfile.telegram : "",
        allow_website: existingProfile.contact_preferences?.allow_website ?? true,
        allow_whatsapp: existingProfile.contact_preferences?.allow_whatsapp ?? true,
        allow_telegram: existingProfile.contact_preferences?.allow_telegram ?? true,
        allow_email: existingProfile.contact_preferences?.allow_email ?? true,
        allow_phone: existingProfile.contact_preferences?.allow_phone ?? false,
        allow_contact_request: existingProfile.contact_preferences?.allow_contact_request ?? true
      });
      if (existingProfile.avatar) setAvatarPreview(existingProfile.avatar);
      if (existingProfile.cover_image || existingProfile.bannerImage) setCoverPreview(existingProfile.cover_image || existingProfile.bannerImage);
    }
  }, [existingProfile, reset, currentUser]);

  const watchName = watch("name");
  const watchProfession = watch("profession");
  const watchHeadline = watch("headline");
  const watchCity = watch("city");
  const watchState = watch("state");
  const watchCountry = watch("country");
  const watchRate = watch("hourlyRate");
  const watchCurrency = watch("currency");
  const watchPricingType = watch("pricingType");
  const watchBio = watch("bio");
  const watchExperience = watch("experience");
  const watchSkills = watch("skills");
  const watchWebsite = watch("website");
  const watchInstagram = watch("instagram");
  const watchFacebook = watch("facebook");
  const watchWhatsapp = watch("whatsapp");
  const watchTelegram = watch("telegram");

  const selectedCountryObj = useMemo(() => {
    if (!countriesList.length || !watchCountry) return null;
    return countriesList.find(
      (c) =>
        c.name?.toLowerCase() === watchCountry?.toLowerCase() ||
        c.isoCode?.toLowerCase() === watchCountry?.toLowerCase()
    );
  }, [countriesList, watchCountry]);

  // Populate states when country changes
  useEffect(() => {
    if (!locationMod || !selectedCountryObj?.isoCode) {
      setStatesList([]);
      return;
    }
    const states = locationMod.State.getStatesOfCountry(selectedCountryObj.isoCode);
    const finalStates =
      states.length > 0
        ? states
        : [
          { name: watchCountry || "Main Region", isoCode: selectedCountryObj.isoCode || "MAIN" }
        ];
    setStatesList(finalStates);
  }, [locationMod, selectedCountryObj?.isoCode, watchCountry]);

  // Sync currency with country selection
  useEffect(() => {
    if (watchCountry) {
      const countryCurr = getCurrencyForCountry(watchCountry);
      if (countryCurr) {
        setValue("currency", countryCurr);
      }
    }
  }, [watchCountry, setValue]);

  // Populate cities when state changes
  useEffect(() => {
    if (!locationMod || !selectedCountryObj?.isoCode || !watchState) {
      setCitiesList([]);
      return;
    }
    const stateObj = statesList.find(
      (s) =>
        s.name?.toLowerCase() === watchState?.toLowerCase() ||
        s.isoCode?.toLowerCase() === watchState?.toLowerCase()
    );
    const cities =
      stateObj && stateObj.isoCode !== "CUSTOM"
        ? locationMod.City.getCitiesOfState(selectedCountryObj.isoCode, stateObj.isoCode)
        : [];
    const finalCities =
      cities.length > 0
        ? cities
        : [{ name: watchState, isoCode: "MAIN" }];
    setCitiesList(finalCities);
  }, [locationMod, selectedCountryObj?.isoCode, watchState, statesList]);

  const handleCountryChange = (countryItem) => {
    const name = countryItem?.name || countryItem || "";
    setValue("country", name, { shouldValidate: true });
    setValue("state", "", { shouldValidate: false });
    setValue("city", "", { shouldValidate: false });
  };

  const handleStateChange = (stateItem) => {
    const name = stateItem?.name || stateItem || "";
    setValue("state", name, { shouldValidate: true });
    setValue("city", "", { shouldValidate: false });
  };

  const handleCityChange = (cityItem) => {
    const name = cityItem?.name || cityItem || "";
    setValue("city", name, { shouldValidate: true });
  };

  // Validation checks for step status
  const isStep1Complete = () => {
    return Boolean(
      watchName &&
      watchName.trim().length >= 2 &&
      watch("category") &&
      watchCountry &&
      watchCountry.trim().length >= 2 &&
      watchCity &&
      watchCity.trim().length >= 2
    );
  };

  const isStep2Complete = () => {
    return Boolean(
      watchProfession &&
      watchProfession.trim().length >= 3 &&
      watchBio &&
      watchBio.trim().length >= 20
    );
  };

  // Step transitions
  const handleContinueToStep2 = async () => {
    const isStep1Valid = await trigger(["name", "category", "country", "city"]);
    if (isStep1Valid) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please complete all required fields in Step 1 (Name, Category, Country, City).");
    }
  };

  const handleContinueToStep3 = async () => {
    const isStep2Valid = await trigger(["profession", "bio"]);
    if (isStep2Valid) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please complete the required details in Step 2.");
    }
  };

  const handleSaveProviderLink = (providerId, value) => {
    setValue(providerId, value, { shouldValidate: true });
    if (providerId === "website") setValue("allow_website", true);
    if (providerId === "whatsapp") setValue("allow_whatsapp", true);
    if (providerId === "telegram") setValue("allow_telegram", true);
  };

  const handleDisconnectProvider = (providerId) => {
    setValue(providerId, "", { shouldValidate: true });
    toast.info("Connection removed.");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Avatar image must be smaller than 10MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmitForm = async (data) => {
    if (!isAuthenticated) {
      toast.error("Please sign in before registering your professional profile.");
      navigate("/signin?redirect=/people/become");
      return;
    }

    try {
      let finalAvatarUrl = (typeof avatarPreview === "string" && !avatarPreview.startsWith("blob:")) ? avatarPreview : "";
      let finalCoverUrl = (typeof coverPreview === "string" && !coverPreview.startsWith("blob:")) ? coverPreview : "";

      if (avatarFile) {
        setUploadProgressText("Uploading profile photo...");
        const fd = new FormData();
        fd.append("images", avatarFile);
        const res = await uploadFile(fd).unwrap();
        if (res?.urls?.[0]) finalAvatarUrl = res.urls[0];
        else if (res?.url) finalAvatarUrl = res.url;
      }

      if (coverFile) {
        setUploadProgressText("Uploading cover image...");
        const fd = new FormData();
        fd.append("images", coverFile);
        const res = await uploadFile(fd).unwrap();
        if (res?.urls?.[0]) finalCoverUrl = res.urls[0];
        else if (res?.url) finalCoverUrl = res.url;
      }

      const isExisting = Boolean(
        existingProfile &&
        (existingProfile.role === 'expert' || existingProfile.profession || existingProfile.headline || (existingProfile.bio && existingProfile.bio.trim().length > 0))
      );

      setUploadProgressText(isExisting ? "Updating and publishing profile..." : "Creating professional profile...");

      const toCleanArray = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val.map(s => String(s || '').trim()).filter(Boolean);
        if (typeof val === "string") return val.split(",").map(s => s.trim()).filter(Boolean);
        return [];
      };

      const safeTrim = (val) => (typeof val === "string" ? val.trim() : undefined);

      const payload = {
        name: data.name || currentUser?.name || "Expert Advisor",
        profession: data.profession || "Advisor",
        headline: safeTrim(data.headline),
        category: data.category,
        bio: data.bio || "",
        experience: safeTrim(data.experience),
        languages: toCleanArray(data.languages),
        skills: toCleanArray(data.skills),
        specializations: toCleanArray(data.specializations),
        country: data.country || "Global",
        state: safeTrim(data.state),
        city: data.city || "",
        timezone: safeTrim(data.timezone),
        avatar: finalAvatarUrl || undefined,
        cover_image: finalCoverUrl || undefined,
        website: safeTrim(data.website),
        facebook: safeTrim(data.facebook),
        instagram: safeTrim(data.instagram),
        whatsapp: safeTrim(data.whatsapp),
        telegram: safeTrim(data.telegram),
        educations: safeTrim(data.education_degree) ? [
          {
            degree: data.education_degree.trim(),
            institution: safeTrim(data.education_school) || "University / Institute",
            year: safeTrim(data.education_year) || ""
          }
        ] : (Array.isArray(existingProfile?.educations) ? existingProfile.educations : []),
        hourlyRate: !isNaN(Number(data.hourlyRate)) ? Number(data.hourlyRate) : null,
        hourly_rate: !isNaN(Number(data.hourlyRate)) ? Number(data.hourlyRate) : null,
        currency: data.currency || existingProfile?.currency || (data.country ? getCurrencyForCountry(data.country) : (activeCountry?.currency || "USD")),
        pricing: {
          consultation: !isNaN(Number(data.hourlyRate)) ? Number(data.hourlyRate) : null,
          currency: data.currency || existingProfile?.currency || (data.country ? getCurrencyForCountry(data.country) : (activeCountry?.currency || "USD")),
          type: data.pricingType || "hourly"
        },
        availability: data.availability || "Available",
        accepting_clients: Boolean(data.accepting_clients),
        response_time: safeTrim(data.response_time),
        status: "pending",
        is_approved: false,
        isApproved: false,
        isPublished: false,
        is_published: false,
        contact_preferences: {
          allow_website: Boolean(safeTrim(data.website)),
          allow_whatsapp: Boolean(safeTrim(data.whatsapp)),
          allow_telegram: Boolean(safeTrim(data.telegram)),
          allow_email: true,
          allow_phone: Boolean(data.allow_phone),
          allow_contact_request: true
        }
      };

      let profileResult;
      let newProfileId = existingProfile?.id || existingProfile?._id;

      if (isExisting) {
        profileResult = await updateProfile(payload).unwrap();
        newProfileId =
          profileResult?.id ||
          profileResult?.profile_id ||
          profileResult?.profile?.id ||
          profileResult?.data?.id ||
          profileResult?.data?.profile_id ||
          profileResult?.data?.profile?.id ||
          newProfileId;
      } else {
        profileResult = await createProfile(payload).unwrap();
        newProfileId =
          profileResult?.id ||
          profileResult?.profile_id ||
          profileResult?.profile?.id ||
          profileResult?.data?.id ||
          profileResult?.data?.profile_id ||
          profileResult?.data?.profile?.id ||
          newProfileId;
      }

      setSuccess(true);
      setPublishedProfileId(newProfileId);
      if (isExisting) {
        toast.success("Profile updated and submitted for admin review! It will appear once approved.");
      } else {
        toast.success("Profile submitted successfully! It is currently pending review and will be visible publicly once approved.");
      }

      setTimeout(() => {
        navigate("/people");
      }, 1200);
    } catch (err) {
      console.error("Save professional profile error:", err);
      toast.error(err?.data?.message || err?.message || "Failed to save and publish professional profile.");
    } finally {
      setUploadProgressText("");
    }
  };

  const onInvalid = (fieldErrors) => {
    console.error("Form validation errors on publish:", fieldErrors);
    const errorKeys = Object.keys(fieldErrors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const errorMessage = fieldErrors[firstKey]?.message || "Please complete all required fields.";
      toast.error(errorMessage);

      // Automatically navigate to the step containing the invalid field
      if (["name", "headline", "category", "country", "state", "city"].includes(firstKey)) {
        setCurrentStep(1);
      } else if (["profession", "bio", "hourlyRate", "currency", "pricingType", "languages", "skills", "specializations"].includes(firstKey)) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isSubmitting = isCreating || isUpdating || isPublishing || isUploading;

  return (
    <div className="bg-[#FAFBFD] min-h-screen flex flex-col justify-between">
      <Navbar />

      {/* Top Banner Header (Matches Host & Sell creation pages) */}
      <div className="bg-[#00142E] text-white pt-24 pb-12 border-b border-slate-800">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <button
            type="button"
            onClick={() => navigate("/people")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                {isExisting ? "Edit Professional Profile" : "Create Professional Profile"}
              </h1>
              <p className="text-slate-400 text-sm max-w-xl font-medium mt-1">
                {isExisting
                  ? "Update your advisor details, rates, and expertise to keep your profile current."
                  : "Build your advisor profile in 3 simple steps to offer relocation, legal, housing, and tax assistance to global expats."}
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl text-xs text-slate-300">
              <Users className="w-5 h-5 text-red-400 shrink-0" />
              <span>NextKinLife Expat Expert Network</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow pb-20 pt-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

          {success ? (
            <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-6 shadow-sm">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {isExisting ? "Profile Updated!" : "Profile Published!"}
                </h2>
                <p className="text-[#484848] text-xs leading-relaxed">
                  {isExisting
                    ? "Your professional advisor profile changes have been successfully saved."
                    : "Your professional advisor profile is now live in the global directory."}
                </p>
              </div>
              <div className="pt-2 flex justify-center">
                {publishedProfileId ? (
                  <Link to={`/people/${publishedProfileId}`}>
                    <Button className="h-11 px-6 bg-[#E1392A] hover:bg-[#b0221e] text-white font-bold rounded-xl active:scale-95 transition-all cursor-pointer">
                      {isExisting ? "View Updated Profile" : "View My Published Profile"}
                    </Button>
                  </Link>
                ) : (
                  <Link to="/people">
                    <Button className="h-11 px-6 bg-[#00142E] text-white font-bold rounded-xl">
                      Browse Directory
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8">

              {/* Clean 3-Step Wizard Navigation Bar (Unified with NextKinLife Creation Standard) */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
                <div className="grid grid-cols-3 gap-2 text-center relative">

                  {/* Step 1 Tab Button */}
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-2xl transition-all cursor-pointer ${currentStep === 1
                      ? "bg-red-50 border border-red-200 text-[#E1392A] font-extrabold"
                      : isStep1Complete()
                        ? "bg-emerald-50 text-emerald-700 font-bold"
                        : "text-slate-500 hover:bg-slate-50"
                      }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${currentStep === 1
                        ? "bg-[#E1392A] text-white"
                        : isStep1Complete()
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-600"
                        }`}
                    >
                      {isStep1Complete() && currentStep !== 1 ? <Check className="w-4 h-4" /> : 1}
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-xs leading-none">Step 1</p>
                      <p className="text-[11px] font-medium opacity-80">Basic Info</p>
                    </div>
                  </button>

                  {/* Step 2 Tab Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      const valid = await trigger(["name", "category", "country", "city"]);
                      if (valid) setCurrentStep(2);
                    }}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-2xl transition-all cursor-pointer ${currentStep === 2
                      ? "bg-red-50 border border-red-200 text-[#E1392A] font-extrabold"
                      : isStep2Complete()
                        ? "bg-emerald-50 text-emerald-700 font-bold"
                        : "text-slate-500 hover:bg-slate-50"
                      }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${currentStep === 2
                        ? "bg-[#E1392A] text-white"
                        : isStep2Complete()
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-600"
                        }`}
                    >
                      {isStep2Complete() && currentStep !== 2 ? <Check className="w-4 h-4" /> : 2}
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-xs leading-none">Step 2</p>
                      <p className="text-[11px] font-medium opacity-80">Details & Rates</p>
                    </div>
                  </button>

                  {/* Step 3 Tab Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      const valid = await trigger(["name", "category", "country", "city", "profession", "bio"]);
                      if (valid) setCurrentStep(3);
                    }}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-2xl transition-all cursor-pointer ${currentStep === 3
                      ? "bg-red-50 border border-red-200 text-[#E1392A] font-extrabold"
                      : "text-slate-500 hover:bg-slate-50"
                      }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${currentStep === 3
                        ? "bg-[#E1392A] text-white"
                        : "bg-slate-200 text-slate-600"
                        }`}
                    >
                      3
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-xs leading-none">Step 3</p>
                      <p className="text-[11px] font-medium opacity-80">Review & Publish</p>
                    </div>
                  </button>

                </div>
              </div>

              {/* Form Content Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-8">

                <form onSubmit={handleSubmit(onSubmitForm, onInvalid)} className="space-y-6">

                  {/* STEP 1: Basic Info & Location */}
                  {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-extrabold text-slate-900">Step 1 — Basic Identity & Location</h2>
                          <p className="text-xs text-slate-500">Tell us who you are and where you are located.</p>
                        </div>
                        <span className="text-xs font-bold text-[#E1392A] bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                          Step 1 of 3
                        </span>
                      </div>

                      {/* Photo Upload Box */}
                      <div className="flex flex-col items-center justify-center space-y-2 py-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <label className="text-xs font-extrabold text-slate-700">Profile Photo (Optional)</label>
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden group hover:border-[#E1392A] transition-all shadow-xs">
                            {avatarPreview ? (
                              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <Camera className="w-8 h-8 text-slate-400 group-hover:text-[#E1392A] transition-colors" />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                            id="step1-avatar-upload"
                          />
                        </div>
                        <label
                          htmlFor="step1-avatar-upload"
                          className="text-xs font-bold text-[#E1392A] hover:underline cursor-pointer flex items-center gap-1 pt-1"
                        >
                          <Upload className="w-3.5 h-3.5" /> {avatarPreview ? "Change Photo" : "Upload Photo"}
                        </label>
                        <p className="text-[10px] text-slate-400">JPG or PNG, max 5MB.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TextField
                          label="Full Name *"
                          placeholder="Enter your full name"
                          error={errors.name}
                          variant="light"
                          {...register("name")}
                        />

                        <SelectField
                          label="Expert Category *"
                          placeholder="Select your category"
                          options={PEOPLE_CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
                          error={errors.category}
                          className="h-11"
                          variant="light"
                          {...register("category")}
                        />
                      </div>

                      <TextField
                        label="Headline / Tagline (Optional)"
                        placeholder="e.g. Full Stack Developer | 5 years."
                        error={errors.headline}
                        variant="light"
                        {...register("headline")}
                      />

                      {/* Location: Country, State, City Cascading Searchable Dropdowns */}
                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-extrabold text-slate-700 block">
                          Location Details *
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <SearchableDropdown
                            label="Country"
                            required
                            placeholder="Select Country..."
                            searchPlaceholder="Type country name..."
                            options={countriesList}
                            value={watchCountry}
                            error={errors.country?.message}
                            isLoading={!locationMod}
                            onChange={handleCountryChange}
                          />

                          <SearchableDropdown
                            label="State / Province"
                            placeholder={watchCountry ? (statesList.length > 0 ? "Select State..." : "Type or select State") : "Select Country first"}
                            searchPlaceholder="Type state name..."
                            options={statesList}
                            value={watchState}
                            disabled={!watchCountry}
                            error={errors.state?.message}
                            isLoading={!locationMod}
                            onChange={handleStateChange}
                          />

                          <SearchableDropdown
                            label="City"
                            required
                            placeholder={watchState ? (citiesList.length > 0 ? "Select City..." : "Type or select City") : "Select State first"}
                            searchPlaceholder="Type city name..."
                            options={citiesList}
                            value={watchCity}
                            disabled={!watchState && !watchCountry}
                            error={errors.city?.message}
                            isLoading={!locationMod}
                            onChange={handleCityChange}
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                        <p className="text-[11px] text-slate-400 font-medium">
                          You can update or skip any step later.
                        </p>
                        <Button
                          type="button"
                          onClick={handleContinueToStep2}
                          className="h-11 px-6 bg-[#E1392A] hover:bg-[#b0221e] text-white font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          Continue <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Professional Details */}
                  {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-extrabold text-slate-900">Step 2 — Professional Details & Rates</h2>
                          <p className="text-xs text-slate-500">Provide bio, rates, and expertise skills.</p>
                        </div>
                        <span className="text-xs font-bold text-[#E1392A] bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                          Step 2 of 3
                        </span>
                      </div>

                      <TextField
                        label="Professional Title *"
                        placeholder="e.g. Senior Immigration Lawyer"
                        error={errors.profession}
                        variant="light"
                        {...register("profession")}
                      />

                      <TextareaField
                        label="Service Description & Bio *"
                        placeholder="Describe how you can help expat newcomers settle in your home city..."
                        error={errors.bio}
                        charCount={watchBio?.length || 0}
                        maxLength={1000}
                        variant="light"
                        {...register("bio")}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <TextField
                          label="Consultation Price *"
                          placeholder="50"
                          type="number"
                          error={errors.hourlyRate}
                          variant="light"
                          {...register("hourlyRate")}
                        />
                        <SelectField
                          label="Currency *"
                          options={[
                            { value: "USD", label: "USD ($)" },
                            { value: "EUR", label: "EUR (€)" },
                            { value: "GBP", label: "GBP (£)" },
                            { value: "INR", label: "INR (₹)" }
                          ]}
                          error={errors.currency}
                          variant="light"
                          {...register("currency")}
                        />
                        <SelectField
                          label="Pricing Type *"
                          options={[
                            { value: "hourly", label: "Hourly Rate" },
                            { value: "fixed", label: "Fixed Package" },
                            { value: "free", label: "Free Consultation" }
                          ]}
                          error={errors.pricingType}
                          variant="light"
                          {...register("pricingType")}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <TextField
                          label="Languages Spoken *"
                          placeholder="e.g. English, German"
                          error={errors.languages}
                          variant="light"
                          {...register("languages")}
                        />
                        <TextField
                          label="Years of Experience (Optional)"
                          placeholder="e.g. 5+ years or 3 years"
                          error={errors.experience}
                          variant="light"
                          {...register("experience")}
                        />
                        <TextField
                          label="Core Skills (comma separated) *"
                          placeholder="e.g. Visa Filings, Tax Audit, Full Stack"
                          error={errors.skills}
                          variant="light"
                          {...register("skills")}
                        />
                      </div>

                      {/* Optional Education Section */}
                      <div className="pt-2 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-extrabold text-slate-700 block">
                            Education & Qualifications (Optional)
                          </label>
                          <span className="text-[11px] text-slate-400 font-medium">Optional</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <TextField
                            label="Degree / Qualification"
                            placeholder="e.g. B.Tech / M.S. in Computer Science"
                            variant="light"
                            {...register("education_degree")}
                          />
                          <TextField
                            label="School / University"
                            placeholder="e.g. Stanford University"
                            variant="light"
                            {...register("education_school")}
                          />
                          <TextField
                            label="Graduation Year"
                            placeholder="e.g. 2021"
                            variant="light"
                            {...register("education_year")}
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-between gap-4 border-t border-slate-100">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(1)}
                          className="h-11 px-5 rounded-xl font-bold border-slate-200"
                        >
                          <ArrowLeft className="w-4 h-4 mr-1" /> Back
                        </Button>
                        <Button
                          type="button"
                          onClick={handleContinueToStep3}
                          className="h-11 px-6 bg-[#E1392A] hover:bg-[#b0221e] text-white font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          Continue <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Review & Publish */}
                  {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-extrabold text-slate-900">
                            Step 3 — Review, Connect & {isExisting ? "Update" : "Publish"}
                          </h2>
                          <p className="text-xs text-slate-500">
                            {isExisting ? "Connect social channels and update your profile." : "Connect social channels and publish live."}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-[#E1392A] bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                          Step 3 of 3
                        </span>
                      </div>

                      {/* Retained Social Channels (Instagram, Facebook, Website, WhatsApp, Telegram) */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                          Professional & Contact Links
                        </h3>
                        <div className="grid grid-cols-1 gap-2.5">
                          {[...PROFESSIONAL_PROVIDERS, ...CONTACT_PROVIDERS].map((provider) => (
                            <ProviderConnectCard
                              key={provider.id}
                              provider={provider}
                              value={watch(provider.id)}
                              onConnectClick={(p) => setActiveModalProvider(p)}
                              onDisconnectClick={(id) => handleDisconnectProvider(id)}
                            />
                          ))}
                        </div>
                      </div>


                      {uploadProgressText && (
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-xs font-bold text-blue-700">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span>{uploadProgressText}</span>
                        </div>
                      )}

                      <div className="pt-4 flex items-center justify-between gap-4 border-t border-slate-100">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(2)}
                          className="h-11 px-5 rounded-xl font-bold border-slate-200"
                        >
                          <ArrowLeft className="w-4 h-4 mr-1" /> Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="h-12 px-8 bg-[#E1392A] hover:bg-[#b0221e] text-white font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> {isExisting ? "Saving Changes..." : "Publishing..."}
                            </>
                          ) : (
                            isExisting ? "Update Profile" : "Publish Profile"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                </form>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Provider Modal */}
        <ProviderConnectModal
          isOpen={Boolean(activeModalProvider)}
          onClose={() => setActiveModalProvider(null)}
          provider={activeModalProvider}
          currentValue={activeModalProvider ? watch(activeModalProvider.id) : ""}
          onSave={handleSaveProviderLink}
        />
      </main>
      <Footer />
    </div>
  );
}
