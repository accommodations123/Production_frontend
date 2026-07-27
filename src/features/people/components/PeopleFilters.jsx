import { Grid, Shield, Home, Landmark, Briefcase, Languages, Terminal, MapPin, Star, ShieldCheck, RefreshCw } from "lucide-react";
import { PEOPLE_CATEGORIES } from "../data/categories";

const getCategoryIcon = (iconName, className) => {
  switch (iconName) {
    case "Shield": return <Shield className={className} />;
    case "Home": return <Home className={className} />;
    case "Landmark": return <Landmark className={className} />;
    case "Briefcase": return <Briefcase className={className} />;
    case "Languages": return <Languages className={className} />;
    case "Terminal": return <Terminal className={className} />;
    default: return <Grid className={className} />;
  }
};

export default function PeopleFilters({
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  selectedExperience,
  setSelectedExperience,
  selectedRating,
  setSelectedRating,
  verifiedOnly,
  setVerifiedOnly,
  onReset,
  availableLocations = []
}) {
  const hasFiltersActive = 
    selectedCategory !== "all" || 
    selectedLocation !== "all" || 
    selectedExperience !== "all" || 
    selectedRating !== "all" || 
    verifiedOnly;

  return (
    <div className="space-y-6">
      
      {/* Category Horizontal Bar */}
      <div className="flex items-center justify-start gap-8 sm:gap-12 overflow-x-auto pb-1 border-b border-slate-100 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all flex flex-col items-center gap-2 cursor-pointer select-none whitespace-nowrap ${
            selectedCategory === "all"
              ? "border-[#E1392A] text-slate-900"
              : "border-transparent text-[#717171] hover:text-slate-700 hover:border-slate-200"
          }`}
        >
          <Grid className="w-5 h-5" />
          <span>All Categories</span>
        </button>
        {PEOPLE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all flex flex-col items-center gap-2 cursor-pointer select-none whitespace-nowrap ${
                isSelected
                  ? "border-[#E1392A] text-slate-900"
                  : "border-transparent text-[#717171] hover:text-slate-700 hover:border-slate-200"
              }`}
            >
              {getCategoryIcon(cat.iconName, "w-5 h-5")}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Pill-based Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-1 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Location Filter Select */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171] pointer-events-none" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="h-10 pl-9 pr-8 bg-slate-50 border border-slate-200/80 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl outline-none cursor-pointer appearance-none transition-all focus:ring-2 focus:ring-[#E1392A] focus:bg-white"
            >
              <option value="all">All Locations</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Experience Filter Select */}
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171] pointer-events-none" />
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="h-10 pl-9 pr-8 bg-slate-50 border border-slate-200/80 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl outline-none cursor-pointer appearance-none transition-all focus:ring-2 focus:ring-[#E1392A] focus:bg-white"
            >
              <option value="all">Any Experience</option>
              <option value="junior">1 - 4 Years</option>
              <option value="mid">5 - 9 Years</option>
              <option value="senior">10+ Years</option>
            </select>
          </div>

          {/* Rating Filter Select */}
          <div className="relative">
            <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171] pointer-events-none" />
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="h-10 pl-9 pr-8 bg-slate-50 border border-slate-200/80 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl outline-none cursor-pointer appearance-none transition-all focus:ring-2 focus:ring-[#E1392A] focus:bg-white"
            >
              <option value="all">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.8">4.8+ Stars</option>
              <option value="4.9">4.9+ Stars</option>
            </select>
          </div>

          {/* Verified Toggle */}
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`h-10 px-4 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              verifiedOnly
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                : "bg-slate-50 border-slate-200/80 text-[#222222] hover:border-slate-300"
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${verifiedOnly ? "text-emerald-600" : "text-[#717171]"}`} />
            <span>Verified Only</span>
          </button>

        </div>

        {/* Reset Filters Trigger */}
        {hasFiltersActive && (
          <button
            onClick={onReset}
            className="text-xs font-bold text-[#717171] hover:text-[#222222] flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        )}
      </div>

    </div>
  );
}
