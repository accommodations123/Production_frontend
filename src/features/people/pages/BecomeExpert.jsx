import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Navbar } from "@/shared/layout/Navbar";
import Footer from "@/shared/layout/Footer";
import { TextField, TextareaField, SelectField } from "@/shared/ui/form-fields";
import { Button } from "@/shared/ui/button";
import { Sparkles, Star, MapPin, ShieldCheck, CheckCircle2, Loader2, ArrowLeft, Heart, DollarSign } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { MOCK_PEOPLE } from "../data/people";
import { PEOPLE_CATEGORIES } from "../data/categories";
import { toast } from "sonner";

// Zod validation rules
const expertOnboardingSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  profession: z.string().min(3, "Professional title must be at least 3 characters"),
  category: z.string().min(1, "Please select an expert category"),
  city: z.string().min(2, "City name is required"),
  country: z.string().min(2, "Country name is required"),
  hourlyRate: z.coerce.number().min(5, "Minimum hourly rate is $5 USD").max(500, "Maximum hourly rate is $500 USD"),
  bio: z.string()
    .min(20, "Bio description must be at least 20 characters")
    .max(300, "Bio description cannot exceed 300 characters"),
  skills: z.string().min(3, "Please enter at least 1 or 2 core expertise tags separated by commas"),
  languages: z.string().min(2, "Please enter languages you speak (e.g. English, French)")
});

export default function BecomeExpert() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
      name: "",
      profession: "",
      category: "legal-visa",
      city: "",
      country: "",
      hourlyRate: 50,
      bio: "",
      skills: "",
      languages: "English"
    }
  });

  // Watch fields in real-time to render inside the live profile preview card
  const watchName = watch("name");
  const watchProfession = watch("profession");
  const watchCity = watch("city");
  const watchCountry = watch("country");
  const watchRate = watch("hourlyRate");
  const watchBio = watch("bio");
  const watchSkills = watch("skills");

  const onSubmitForm = async (data) => {
    try {
      setSubmitting(true);
      // Simulate validation onboarding delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      let currentList = MOCK_PEOPLE;
      try {
        const savedPeople = localStorage.getItem("kinlife_people");
        if (savedPeople) currentList = JSON.parse(savedPeople);
      } catch (err) {
        console.error("Error reading kinlife_people from storage:", err);
      }

      // Map Zod variables to registry attributes
      const newExpert = {
        id: `people_${Date.now()}`,
        name: data.name,
        profession: data.profession,
        category: data.category,
        city: data.city,
        country: data.country,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", // default placeholder profile photo
        coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
        bio: data.bio,
        experience: "1 year",
        languages: data.languages.split(",").map((l) => l.trim()),
        skills: data.skills.split(",").map((s) => s.trim()),
        hourlyRate: Number(data.hourlyRate),
        availability: "Available",
        rating: 5.0,
        reviewCount: 0,
        verified: false, // verification requires administrative audit workflow
        portfolioImages: []
      };

      // Save list modifications
      localStorage.setItem("kinlife_people", JSON.stringify([newExpert, ...currentList]));
      setSuccess(true);
      toast.success("Congratulations! Your expert profile application has been filed successfully.");
    } catch (e) {
      toast.error("Failed to submit expert application. Please verify parameters.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen flex flex-col justify-between">


      <main className="flex-grow pb-16">

        {/* Banner Section */}
        <div className="bg-[#00142E] text-white py-12 border-b border-slate-800">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
            <Link
              to="/people"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#717171] hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Directory
            </Link>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white pt-2">
              Join NextKinLife as an Expert
            </h1>
            <p className="text-[#717171] text-sm max-w-xl font-medium">
              Help global expats settle in your city. Offer consultations, document translations, and relocation guides while growing your local agency.
            </p>
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
                <h2 className="text-2xl font-extrabold text-slate-900">Application Submitted!</h2>
                <p className="text-[#484848] text-sm leading-relaxed max-w-sm mx-auto">
                  Your expert profile has been registered in the database. Newcomers can now view your listing in the local directory.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/people">
                  <Button className="w-full sm:w-auto h-11 px-6 bg-[#00142E] hover:bg-slate-800 text-white font-bold rounded-xl active:scale-95 transition-all cursor-pointer">
                    Browse Advisors List
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Left Column Form */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-6">

                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Application Details</h2>
                  <p className="text-[#717171] text-xs mt-0.5">Please provide accurate details about your expertise.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">

                  {/* Name Title Category */}
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
                      label="Hourly Rate (USD) *"
                      placeholder="50"
                      type="number"
                      error={errors.hourlyRate}
                      variant="light"
                      {...register("hourlyRate")}
                    />
                  </div>

                  {/* City Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextField
                      label="City *"
                      placeholder="e.g. Munich"
                      error={errors.city}
                      variant="light"
                      {...register("city")}
                    />
                    <TextField
                      label="Country *"
                      placeholder="e.g. Germany"
                      error={errors.country}
                      variant="light"
                      {...register("country")}
                    />
                  </div>

                  {/* Skills tags and languages list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextField
                      label="Core Skills (comma separated) *"
                      placeholder="e.g. Visa Filings, Tax Audit, Relocation"
                      error={errors.skills}
                      variant="light"
                      {...register("skills")}
                    />
                    <TextField
                      label="Languages Spoken (comma separated) *"
                      placeholder="e.g. English, French, German"
                      error={errors.languages}
                      variant="light"
                      {...register("languages")}
                    />
                  </div>

                  {/* Bio statement */}
                  <TextareaField
                    label="Service Description & Bio *"
                    placeholder="Describe how you can help expat newcomers settle in your home city..."
                    error={errors.bio}
                    charCount={watchBio?.length || 0}
                    maxLength={300}
                    variant="light"
                    {...register("bio")}
                  />

                  {/* Submit buttons */}
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto h-12 px-8 bg-[#E1392A] hover:bg-[#b0221e] text-white font-bold rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Submitting Application...
                        </>
                      ) : (
                        "Submit Profile"
                      )}
                    </Button>
                  </div>

                </form>

              </div>

              {/* Right Column Profile Preview */}
              <div className="lg:col-span-4 space-y-6">

                {/* Visual Live Preview Box Header */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#717171] uppercase tracking-wider border-b border-slate-100 pb-3">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" /> Real-time Card Preview
                  </div>

                  {/* Mock People Card rendering tracked form values */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 text-[#717171] rounded-xl flex items-center justify-center font-bold text-lg select-none shrink-0 border border-slate-150">
                        {watchName ? watchName.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-extrabold text-slate-900 text-sm leading-snug truncate">
                          {watchName || "Your Full Name"}
                        </h4>
                        <p className="text-[#E1392A] font-bold text-[11px] truncate">
                          {watchProfession || "Your Professional Title"}
                        </p>
                      </div>
                    </div>

                    <p className="text-[#484848] text-xs leading-relaxed line-clamp-2 min-h-[32px]">
                      {watchBio || "Your short bio description will appear here as you type."}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#717171] font-bold border-b border-slate-50 pb-3">
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> 5.0 (0)
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-300" />
                        {watchCity || "City"}, {watchCountry || "Country"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {watchSkills ? (
                        watchSkills.split(",").slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-bold text-[#484848] bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md"
                          >
                            {s.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] font-bold text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded-md">
                          Skill tags
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2 text-xs">
                      <div>
                        <span className="text-[8px] font-bold text-[#717171] uppercase tracking-wider block">Rate</span>
                        <span className="text-slate-900 font-black text-sm">
                          ${watchRate || "50"} <span className="text-[#717171] text-[9px] font-bold">/ hr</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#717171] uppercase">
                        Preview only
                      </span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

      </main>


    </div>
  );
}
