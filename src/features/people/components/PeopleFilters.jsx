import React from "react";
import { Search, MapPin, Star, Filter, ShieldCheck, X, RefreshCw } from "lucide-react";
import { PEOPLE_CATEGORIES } from "../data/categories";

export default function PeopleFilters({
  searchQuery,
  setSearchQuery,
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
  return (
    <div className="space-y-6">
      
      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 whitespace-nowrap select-none ${
            selectedCategory === "all"
              ? "bg-[#00142E] border-[#00142E] text-white shadow-sm"
              : "bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50"
          }`}
        >
          All Categories
        </button>
        {PEOPLE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 whitespace-nowrap select-none ${
                isSelected
                  ? "bg-[#00142E] border-[#00142E] text-white shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Main Filter Panel Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Main Keyword Search */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search experts by name, professional title, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 focus:border-[#00142E] focus:bg-white text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm rounded-xl outline-none transition-all duration-200"
            />
          </div>

          {/* Location Selector */}
          <div className="md:col-span-3 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 focus:border-[#00142E] focus:bg-white text-slate-700 text-xs font-semibold rounded-xl outline-none cursor-pointer appearance-none transition-all"
            >
              <option value="all">All Locations</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Experience level dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 focus:border-[#00142E] focus:bg-white text-slate-700 text-xs font-semibold rounded-xl outline-none cursor-pointer transition-all"
            >
              <option value="all">All Experience Levels</option>
              <option value="junior">1 - 4 Years</option>
              <option value="mid">5 - 9 Years</option>
              <option value="senior">10+ Years</option>
            </select>
          </div>

        </div>

        {/* Bottom Options Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
          
          {/* Filter Toggles & Checkbox Options */}
          <div className="flex items-center gap-6">
            
            {/* Rating Filter Selection */}
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="bg-transparent border-0 text-slate-600 font-bold text-xs outline-none cursor-pointer hover:text-slate-800"
              >
                <option value="all">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.8">4.8+ Stars</option>
                <option value="4.9">4.9+ Stars</option>
              </select>
            </div>

            {/* Verified Badge Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#00142E] focus:ring-[#00142E] focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs text-slate-600 font-bold flex items-center gap-1">
                Verified Experts Only <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </span>
            </label>

          </div>

          {/* Reset Action */}
          {(searchQuery || selectedCategory !== "all" || selectedLocation !== "all" || selectedExperience !== "all" || selectedRating !== "all" || verifiedOnly) && (
            <button
              onClick={onReset}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
