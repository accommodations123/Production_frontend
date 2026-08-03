import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TextField, TextareaField, SelectField, CheckboxField } from "@/shared/ui/form-fields";
import { Button } from "@/shared/ui/button";
import {
  Sparkles,
  Star,
  MapPin,
  CheckCircle2,
  Loader2,
  ArrowLeft,
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
  ExternalLink
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PEOPLE_CATEGORIES } from "../data/categories";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import {
  useCreateProfileMutation,
  usePublishProfileMutation,
  useUploadFileMutation
} from "@/store/api/peopleApi";

// Validation schema for all professional fields supported by backend
const expertOnboardingSchema = z.object({
  // Section 1: Basic Information
  name: z.string().min(2, "Full name must be at least 2 characters"),
  profession: z.string().min(3, "Professional title must be at least 3 characters"),
  headline: z.string().optional(),
  category: z.string().min(1, "Please select an expert category"),
  bio: z
    .string()
    .min(20, "Bio description must be at least 20 characters")
    .max(1000, "Bio description cannot exceed 1000 characters"),
  experience: z.string().optional(), // No default value! Optional
  languages: z.string().optional(),
  skills: z.string().optional(),
  specializations: z.string().optional(),

  // Section 2: Location
  country: z.string().min(2, "Country name is required"),
  state: z.string().optional(),
  city: z.string().min(2, "City name is required"),
  timezone: z.string().optional(),

  // Section 3: Pricing & Availability
  hourlyRate: z.coerce
    .number()
    .min(0, "Rate must be $0 or greater")
    .max(10000, "Maximum consultation rate is $10,000"),
  currency: z.string().default("USD"),
  pricingType: z.string().default("hourly"),
  availability: z.string().optional(),
  accepting_clients: z.boolean().default(true),
  response_time: z.string().optional(),

  // Section 5: Professional Links
  website: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  youtube: z.string().optional(),

  // Section 6: Contact & Scheduling
  whatsapp: z.string().optional(),
  telegram: z.string().optional(),
  calendly: z.string().optional(),
  zoom: z.string().optional(),
  google_meet: z.string().optional(),
  microsoft_teams: z.string().optional(),

  // Section 7: Privacy Settings
  allow_website: z.boolean().default(true),
  allow_linkedin: z.boolean().default(true),
  allow_whatsapp: z.boolean().default(true),
  allow_telegram: z.boolean().default(true),
  allow_email: z.boolean().default(true),
  allow_phone: z.boolean().default(false),
  allow_contact_request: z.boolean().default(true)
});

export default function BecomeExpert() {
  const navigate = useNavigate();
  const { isAuthenticated, user: currentUser } = useSelector((state) => state.auth || {});

  const [createProfile, { isLoading: isCreating }] = useCreateProfileMutation();
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

  // If user profile image becomes available, prefill avatar
  useEffect(() => {
    if (currentUser?.profile_image && !avatarPreview) {
      setAvatarPreview(currentUser.profile_image);
    }
  }, [currentUser?.profile_image, avatarPreview]);

  // Set up React Hook Form bindings
  const {
    register,
    handleSubmit,
    watch,
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
      experience: "", // Optional, no default value
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
      website: "",
      linkedin: "",
      github: "",
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
      whatsapp: "",
      telegram: "",
      calendly: "",
      zoom: "",
      google_meet: "",
      microsoft_teams: "",
      allow_website: true,
      allow_linkedin: true,
      allow_whatsapp: true,
      allow_telegram: true,
      allow_email: true,
      allow_phone: false,
      allow_contact_request: true
    }
  });

  // Watch form fields real-time for live preview
  const watchName = watch("name");
  const watchProfession = watch("profession");
  const watchHeadline = watch("headline");
  const watchCity = watch("city");
  const watchCountry = watch("country");
  const watchRate = watch("hourlyRate");
  const watchCurrency = watch("currency");
  const watchPricingType = watch("pricingType");
  const watchBio = watch("bio");
  const watchExperience = watch("experience");
  const watchSkills = watch("skills");
  const watchLinkedin = watch("linkedin");
  const watchWebsite = watch("website");
  const watchGithub = watch("github");
  const watchTwitter = watch("twitter");

  // Handle avatar file selection
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

  // Handle cover photo file selection
  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Cover image must be smaller than 10MB");
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Handle Form Submission
  const onSubmitForm = async (data) => {
    if (!isAuthenticated) {
      toast.error("Please sign in before registering your professional profile.");
      navigate("/login");
      return;
    }

    try {
      let finalAvatarUrl = avatarPreview.startsWith("blob:") ? "" : avatarPreview;
      let finalCoverUrl = coverPreview.startsWith("blob:") ? "" : coverPreview;

      // Step 1: Upload Avatar if new file selected
      if (avatarFile) {
        setUploadProgressText("Uploading profile photo...");
        const fd = new FormData();
        fd.append("images", avatarFile);
        const res = await uploadFile(fd).unwrap();
        if (res?.urls?.[0]) {
          finalAvatarUrl = res.urls[0];
        } else if (res?.url) {
          finalAvatarUrl = res.url;
        }
      }

      // Step 2: Upload Cover Photo if new file selected
      if (coverFile) {
        setUploadProgressText("Uploading cover image...");
        const fd = new FormData();
        fd.append("images", coverFile);
        const res = await uploadFile(fd).unwrap();
        if (res?.urls?.[0]) {
          finalCoverUrl = res.urls[0];
        } else if (res?.url) {
          finalCoverUrl = res.url;
        }
      }

      setUploadProgressText("Creating professional profile...");

      // Clean experience: pass null if empty/whitespace
      const cleanedExperience = data.experience && data.experience.trim() ? data.experience.trim() : undefined;

      // Construct backend payload
      const payload = {
        name: data.name,
        profession: data.profession,
        headline: data.headline?.trim() || undefined,
        category: data.category,
        bio: data.bio,
        experience: cleanedExperience,
        languages: data.languages ? data.languages.split(",").map((l) => l.trim()).filter(Boolean) : [],
        skills: data.skills ? data.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        specializations: data.specializations ? data.specializations.split(",").map((s) => s.trim()).filter(Boolean) : [],
        country: data.country,
        state: data.state?.trim() || undefined,
        city: data.city,
        timezone: data.timezone?.trim() || undefined,
        avatar: finalAvatarUrl || undefined,
        cover_image: finalCoverUrl || undefined,
        website: data.website?.trim() || undefined,
        linkedin: data.linkedin?.trim() || undefined,
        github: data.github?.trim() || undefined,
        facebook: data.facebook?.trim() || undefined,
        instagram: data.instagram?.trim() || undefined,
        twitter: data.twitter?.trim() || undefined,
        youtube: data.youtube?.trim() || undefined,
        whatsapp: data.whatsapp?.trim() || undefined,
        telegram: data.telegram?.trim() || undefined,
        calendly: data.calendly?.trim() || undefined,
        zoom: data.zoom?.trim() || undefined,
        google_meet: data.google_meet?.trim() || undefined,
        microsoft_teams: data.microsoft_teams?.trim() || undefined,
        pricing: {
          consultation: Number(data.hourlyRate),
          currency: data.currency || "USD",
          type: data.pricingType || "hourly"
        },
        availability: data.availability || "Available",
        accepting_clients: Boolean(data.accepting_clients),
        response_time: data.response_time?.trim() || undefined,
        contact_preferences: {
          allow_website: Boolean(data.allow_website),
          allow_linkedin: Boolean(data.allow_linkedin),
          allow_whatsapp: Boolean(data.allow_whatsapp),
          allow_telegram: Boolean(data.allow_telegram),
          allow_email: Boolean(data.allow_email),
          allow_phone: Boolean(data.allow_phone),
          allow_contact_request: Boolean(data.allow_contact_request)
        }
      };

      const createRes = await createProfile(payload).unwrap();
      const newProfileId = createRes?.profile_id || createRes?.profile?.id;

      setUploadProgressText("Publishing profile live...");
      await publishProfile().unwrap();

      setSuccess(true);
      setPublishedProfileId(newProfileId);
      toast.success("Congratulations! Your professional profile is live.");

      if (newProfileId) {
        setTimeout(() => {
          navigate(`/people/${newProfileId}`);
        }, 1500);
      }
    } catch (err) {
      console.error("Create professional profile error:", err);
      toast.error(err?.data?.message || "Failed to create professional profile.");
    } finally {
      setUploadProgressText("");
    }
  };

  const isSubmitting = isCreating || isPublishing || isUploading;

  return (
    <div className="bg-[#FAFBFD] min-h-screen flex flex-col justify-between">
      <main className="flex-grow pb-20">
        {/* Banner Section */}
        <div className="bg-[#00142E] text-white py-10 border-b border-slate-800">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
            <Link
              to="/people"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#717171] hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Directory
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white pt-1">
                  Become a Verified Professional
                </h1>
                <p className="text-[#717171] text-sm max-w-2xl font-medium mt-1">
                  Create your comprehensive advisor profile. Connect with global expats needing relocation, legal, housing, and tax assistance in your city.
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-xs text-slate-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Single-page verified onboarding</span>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {success ? (
            <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-6 shadow-sm">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900">Profile Published Successfully!</h2>
                <p className="text-[#484848] text-sm leading-relaxed max-w-sm mx-auto">
                  Your professional advisor profile is now live in the global directory. Expats can discover and book consultations with you.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                {publishedProfileId ? (
                  <Link to={`/people/${publishedProfileId}`}>
                    <Button className="w-full sm:w-auto h-11 px-6 bg-[#E1392A] hover:bg-[#b0221e] text-white font-bold rounded-xl active:scale-95 transition-all cursor-pointer">
                      View My Published Profile
                    </Button>
                  </Link>
                ) : (
                  <Link to="/people">
                    <Button className="w-full sm:w-auto h-11 px-6 bg-[#00142E] hover:bg-slate-800 text-white font-bold rounded-xl active:scale-95 transition-all cursor-pointer">
                      Browse Directory
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column Form — 8 cols */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-10">
                
                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-10">
                  
                  {/* SECTION 1: Basic Information */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#00142E] flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900">Section 1 — Basic Information</h2>
                        <p className="text-xs text-[#717171]">Core details about your expertise and professional background.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextField
                        label="Full Name *"
                        placeholder="e.g. Aditi Rao"
                        error={errors.name}
                        variant="light"
                        {...register("name")}
                      />
                      <TextField
                        label="Professional Title *"
                        placeholder="e.g. Senior Immigration Lawyer"
                        error={errors.profession}
                        variant="light"
                        {...register("profession")}
                      />
                    </div>

                    <TextField
                      label="Tagline / Headline (Optional)"
                      placeholder="e.g. Helping tech expats relocate smoothly to Munich"
                      error={errors.headline}
                      variant="light"
                      {...register("headline")}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SelectField
                        label="Expert Category *"
                        placeholder="Select category"
                        options={PEOPLE_CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
                        error={errors.category}
                        className="h-11"
                        variant="light"
                        {...register("category")}
                      />
                      <TextField
                        label="Years of Experience (Optional)"
                        placeholder="e.g. 8 years, 5+ yrs (Leave blank if preferred)"
                        error={errors.experience}
                        variant="light"
                        {...register("experience")}
                      />
                    </div>

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
                        label="Languages Spoken *"
                        placeholder="e.g. English, German"
                        error={errors.languages}
                        variant="light"
                        {...register("languages")}
                      />
                      <TextField
                        label="Core Skills (comma separated) *"
                        placeholder="e.g. Visa Filings, Tax Audit"
                        error={errors.skills}
                        variant="light"
                        {...register("skills")}
                      />
                      <TextField
                        label="Specializations (Optional)"
                        placeholder="e.g. EU Blue Card, Tech Visas"
                        error={errors.specializations}
                        variant="light"
                        {...register("specializations")}
                      />
                    </div>
                  </div>

                  {/* SECTION 2: Location */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#00142E] flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900">Section 2 — Location</h2>
                        <p className="text-xs text-[#717171]">Where you provide local or remote consultation services.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextField
                        label="Country *"
                        placeholder="e.g. Germany"
                        error={errors.country}
                        variant="light"
                        {...register("country")}
                      />
                      <TextField
                        label="State / Region (Optional)"
                        placeholder="e.g. Bavaria"
                        error={errors.state}
                        variant="light"
                        {...register("state")}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextField
                        label="City *"
                        placeholder="e.g. Munich"
                        error={errors.city}
                        variant="light"
                        {...register("city")}
                      />
                      <TextField
                        label="Timezone (Optional)"
                        placeholder="e.g. Central European Time (CET)"
                        error={errors.timezone}
                        variant="light"
                        {...register("timezone")}
                      />
                    </div>
                  </div>

                  {/* SECTION 3: Pricing & Availability */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#00142E] flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900">Section 3 — Pricing & Availability</h2>
                        <p className="text-xs text-[#717171]">Set your consultation rates and current availability status.</p>
                      </div>
                    </div>

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
                          { value: "CAD", label: "CAD ($)" },
                          { value: "AUD", label: "AUD ($)" },
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
                          { value: "free", label: "Free Consultation" },
                          { value: "negotiable", label: "Negotiable" }
                        ]}
                        error={errors.pricingType}
                        variant="light"
                        {...register("pricingType")}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SelectField
                        label="Current Availability"
                        options={[
                          { value: "Available", label: "Available Now" },
                          { value: "Next Week", label: "Available Next Week" },
                          { value: "Limited Slots", label: "Limited Slots Only" },
                          { value: "Busy", label: "Currently Busy" }
                        ]}
                        error={errors.availability}
                        variant="light"
                        {...register("availability")}
                      />
                      <TextField
                        label="Expected Response Time"
                        placeholder="e.g. Within 1 hour, Within 24 hours"
                        error={errors.response_time}
                        variant="light"
                        {...register("response_time")}
                      />
                    </div>

                    <div className="pt-1">
                      <CheckboxField
                        label="Accepting New Clients Right Now"
                        variant="light"
                        {...register("accepting_clients")}
                      />
                    </div>
                  </div>

                  {/* SECTION 4: Profile Images */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#00142E] flex items-center justify-center">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900">Section 4 — Profile & Cover Images</h2>
                        <p className="text-xs text-[#717171]">Upload your headshot and header background for higher trust.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Avatar Upload Box */}
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold text-slate-700 block">Profile Photo (Headshot)</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-slate-300 transition-all bg-slate-50/50 space-y-3">
                          {avatarPreview ? (
                            <div className="relative w-20 h-20 mx-auto">
                              <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setAvatarFile(null);
                                  setAvatarPreview("");
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-slate-200/60 text-slate-400 flex items-center justify-center mx-auto">
                              <User className="w-8 h-8" />
                            </div>
                          )}

                          <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                            <Upload className="w-3.5 h-3.5 text-[#E1392A]" />
                            {avatarPreview ? "Replace Photo" : "Upload Headshot"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarChange}
                            />
                          </label>
                          <p className="text-[10px] text-[#717171]">Recommended 400x400 JPG or PNG.</p>
                        </div>
                      </div>

                      {/* Cover Image Upload Box */}
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold text-slate-700 block">Cover Banner Photo</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-slate-300 transition-all bg-slate-50/50 space-y-3">
                          {coverPreview ? (
                            <div className="relative h-20 w-full">
                              <img
                                src={coverPreview}
                                alt="Cover preview"
                                className="h-20 w-full rounded-xl object-cover border border-slate-200 shadow-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setCoverFile(null);
                                  setCoverPreview("");
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="h-20 w-full rounded-xl bg-slate-200/60 text-slate-400 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                          )}

                          <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                            <Upload className="w-3.5 h-3.5 text-[#E1392A]" />
                            {coverPreview ? "Replace Banner" : "Upload Banner"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleCoverChange}
                            />
                          </label>
                          <p className="text-[10px] text-[#717171]">Recommended 1200x400 JPG or PNG.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 5: Professional Links */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#00142E] flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900">Section 5 — Professional & Social Links</h2>
                        <p className="text-xs text-[#717171]">Link your professional handles to build instant credibility.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextField
                        label="Website / Portfolio URL"
                        placeholder="https://yourwebsite.com"
                        error={errors.website}
                        variant="light"
                        {...register("website")}
                      />
                      <TextField
                        label="LinkedIn Profile"
                        placeholder="https://linkedin.com/in/yourprofile"
                        error={errors.linkedin}
                        variant="light"
                        {...register("linkedin")}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextField
                        label="GitHub Profile"
                        placeholder="https://github.com/username"
                        error={errors.github}
                        variant="light"
                        {...register("github")}
                      />
                      <TextField
                        label="X (Twitter) Profile"
                        placeholder="https://x.com/username"
                        error={errors.twitter}
                        variant="light"
                        {...register("twitter")}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <TextField
                        label="Facebook"
                        placeholder="https://facebook.com/page"
                        error={errors.facebook}
                        variant="light"
                        {...register("facebook")}
                      />
                      <TextField
                        label="Instagram"
                        placeholder="https://instagram.com/handle"
                        error={errors.instagram}
                        variant="light"
                        {...register("instagram")}
                      />
                      <TextField
                        label="YouTube Channel"
                        placeholder="https://youtube.com/@channel"
                        error={errors.youtube}
                        variant="light"
                        {...register("youtube")}
                      />
                    </div>
                  </div>

                  {/* SECTION 6: Contact & Scheduling */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#00142E] flex items-center justify-center">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900">Section 6 — Direct Contact & Scheduling</h2>
                        <p className="text-xs text-[#717171]">Provide direct channels or booking links for client meetings.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextField
                        label="WhatsApp Number / Link"
                        placeholder="+49 151 12345678"
                        error={errors.whatsapp}
                        variant="light"
                        {...register("whatsapp")}
                      />
                      <TextField
                        label="Telegram Handle"
                        placeholder="@username"
                        error={errors.telegram}
                        variant="light"
                        {...register("telegram")}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextField
                        label="Calendly Scheduling Link"
                        placeholder="https://calendly.com/yourname/30min"
                        error={errors.calendly}
                        variant="light"
                        {...register("calendly")}
                      />
                      <TextField
                        label="Zoom Personal Room"
                        placeholder="https://zoom.us/j/123456789"
                        error={errors.zoom}
                        variant="light"
                        {...register("zoom")}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextField
                        label="Google Meet URL"
                        placeholder="https://meet.google.com/abc-defg-hij"
                        error={errors.google_meet}
                        variant="light"
                        {...register("google_meet")}
                      />
                      <TextField
                        label="Microsoft Teams Meeting Link"
                        placeholder="https://teams.microsoft.com/l/meetup-join/..."
                        error={errors.microsoft_teams}
                        variant="light"
                        {...register("microsoft_teams")}
                      />
                    </div>
                  </div>

                  {/* SECTION 7: Privacy & Visibility Settings */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#00142E] flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900">Section 7 — Privacy & Visibility Settings</h2>
                        <p className="text-xs text-[#717171]">Control which contact channels are displayed on your public profile.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <CheckboxField
                        label="Show Website Link on Public Profile"
                        variant="light"
                        {...register("allow_website")}
                      />
                      <CheckboxField
                        label="Show LinkedIn Profile Link"
                        variant="light"
                        {...register("allow_linkedin")}
                      />
                      <CheckboxField
                        label="Show Direct WhatsApp Button"
                        variant="light"
                        {...register("allow_whatsapp")}
                      />
                      <CheckboxField
                        label="Show Telegram Handle"
                        variant="light"
                        {...register("allow_telegram")}
                      />
                      <CheckboxField
                        label="Allow Direct Email Inquiries"
                        variant="light"
                        {...register("allow_email")}
                      />
                      <CheckboxField
                        label="Show Phone Number to Verified Users"
                        variant="light"
                        {...register("allow_phone")}
                      />
                      <CheckboxField
                        label="Allow Direct Consultation Requests"
                        variant="light"
                        {...register("allow_contact_request")}
                      />
                    </div>
                  </div>

                  {/* Upload Progress Status Indicator */}
                  {uploadProgressText && (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-xs font-bold text-blue-700">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>{uploadProgressText}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto h-12 px-8 bg-[#E1392A] hover:bg-[#b0221e] text-white font-bold rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Submitting & Publishing...
                        </>
                      ) : (
                        "Submit & Publish Professional Profile"
                      )}
                    </Button>
                  </div>
                </form>
              </div>

              {/* SECTION 8: Real-Time Live Profile Preview Card (Sticky Right Column) — 4 cols */}
              <div className="lg:col-span-4 space-y-6">
                <div className="lg:sticky lg:top-8 bg-white rounded-3xl border border-slate-200 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#717171] uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" /> Section 8 — Live Card Preview
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Real-time
                    </span>
                  </div>

                  {/* Mock Card Container */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs space-y-4">
                    {/* Mock Cover Banner */}
                    <div className="h-20 w-full bg-slate-900 relative overflow-hidden">
                      {coverPreview ? (
                        <img src={coverPreview} alt="Cover" className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-center text-white/20 font-bold text-xs">
                          Banner Preview
                        </div>
                      )}
                    </div>

                    <div className="p-5 pt-0 space-y-4 -mt-8 relative z-10">
                      {/* Avatar Header */}
                      <div className="flex items-end justify-between">
                        <div className="w-16 h-16 rounded-2xl bg-white border-2 border-white shadow-md overflow-hidden shrink-0">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xl">
                              {watchName ? watchName.charAt(0).toUpperCase() : "?"}
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                          Verified Advisor
                        </span>
                      </div>

                      {/* Name & Title */}
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-slate-900 text-base leading-snug truncate">
                          {watchName || "Your Full Name"}
                        </h4>
                        <p className="text-[#E1392A] font-bold text-xs truncate">
                          {watchProfession || "Your Professional Title"}
                        </p>
                        {watchHeadline && (
                          <p className="text-[#717171] text-[11px] font-medium italic line-clamp-1">
                            "{watchHeadline}"
                          </p>
                        )}
                      </div>

                      {/* Bio snippet */}
                      <p className="text-[#484848] text-xs leading-relaxed line-clamp-3 min-h-[36px]">
                        {watchBio || "Your short bio description will appear here as you type."}
                      </p>

                      {/* Metrics bar: Rating, Experience, Location */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#717171] font-bold border-y border-slate-100 py-2.5">
                        <span className="flex items-center gap-0.5 text-slate-800">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> New
                        </span>
                        <span>•</span>
                        {/* Only display experience if value exists! */}
                        {watchExperience && watchExperience.trim() ? (
                          <>
                            <span className="flex items-center gap-0.5 text-slate-800">
                              <Award className="w-3 h-3 text-slate-400" />
                              {watchExperience}
                            </span>
                            <span>•</span>
                          </>
                        ) : null}
                        <span className="flex items-center gap-0.5 text-[#717171]">
                          <MapPin className="w-3 h-3 text-slate-300" />
                          {watchCity || "City"}, {watchCountry || "Country"}
                        </span>
                      </div>

                      {/* Skills badges preview */}
                      <div className="flex flex-wrap gap-1">
                        {watchSkills ? (
                          watchSkills.split(",").slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-bold text-[#484848] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md"
                            >
                              {s.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-md">
                            Skill tags
                          </span>
                        )}
                      </div>

                      {/* Social handles preview icons */}
                      {(watchLinkedin || watchWebsite || watchGithub || watchTwitter) && (
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[10px] font-bold text-[#00142E]">
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-500">Links:</span>
                          {watchLinkedin && <span className="text-blue-600">LinkedIn</span>}
                          {watchWebsite && <span className="text-[#E1392A]">Website</span>}
                          {watchGithub && <span className="text-slate-800">GitHub</span>}
                        </div>
                      )}

                      {/* Price Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2 text-xs">
                        <div>
                          <span className="text-[8px] font-bold text-[#717171] uppercase tracking-wider block">
                            Rate ({watchPricingType || "hourly"})
                          </span>
                          <span className="text-slate-900 font-black text-sm">
                            {watchCurrency === "EUR" ? "€" : watchCurrency === "GBP" ? "£" : "$"}{watchRate || "50"}
                            <span className="text-[#717171] text-[9px] font-bold"> / hr</span>
                          </span>
                        </div>
                        <Button
                          disabled
                          size="sm"
                          className="bg-[#00142E] text-white text-[10px] font-bold h-7 px-3 rounded-lg"
                        >
                          Book Consult
                        </Button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#717171] text-center font-medium">
                    This preview shows how your profile card will appear to prospective clients.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
