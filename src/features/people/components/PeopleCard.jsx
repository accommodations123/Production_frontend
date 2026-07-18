import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, ShieldCheck, Bookmark, Briefcase } from "lucide-react";
import { Button } from "@/shared/ui/button";

export default function PeopleCard({ person }) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex flex-col justify-between h-full group hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-[0_16px_36px_rgba(0,0,0,0.05)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden">
      
      {/* Save Button (Absolute Positioned) */}
      <button
        onClick={handleSaveToggle}
        className={`absolute top-4 right-4 p-2 rounded-full border transition-all cursor-pointer z-10 ${
          isSaved 
            ? "bg-amber-50 text-amber-600 border-amber-200" 
            : "bg-slate-50/50 hover:bg-slate-100 text-[#717171] hover:text-[#222222] border-transparent"
        }`}
        title={isSaved ? "Saved" : "Save Expert"}
      >
        <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`} />
      </button>

      <div>
        {/* Profile Header Block */}
        <div className="flex gap-4 items-center mb-4">
          <div className="relative shrink-0">
            <img
              src={person.avatar}
              alt={person.name}
              className="w-16 h-16 rounded-full object-cover border border-slate-100 shadow-sm"
              loading="lazy"
            />
            {person.verified && (
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          
          <div className="space-y-0.5 pr-8 min-w-0">
            <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-[#E1392A] transition-colors duration-250 truncate">
              {person.name}
            </h3>
            <p className="text-[#E1392A] font-bold text-xs truncate">
              {person.profession}
            </p>
          </div>
        </div>

        {/* Short Bio summary */}
        <p className="text-[#484848] text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
          {person.bio}
        </p>

        {/* Dashboard-style Metrics Bar */}
        <div className="grid grid-cols-3 gap-1 py-3 my-4 text-center border-y border-slate-100/80 bg-slate-50/50 rounded-xl">
          <div>
            <span className="text-[10px] text-[#717171] font-bold uppercase tracking-wider block">Rating</span>
            <span className="text-xs font-bold text-slate-800 flex items-center justify-center gap-0.5 mt-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {person.rating.toFixed(1)}
              <span className="text-[#717171] font-medium">({person.reviewCount})</span>
            </span>
          </div>
          
          <div className="border-x border-slate-200/60">
            <span className="text-[10px] text-[#717171] font-bold uppercase tracking-wider block">Experience</span>
            <span className="text-xs font-bold text-slate-800 block mt-1">{person.experience}</span>
          </div>

          <div className="px-1">
            <span className="text-[10px] text-[#717171] font-bold uppercase tracking-wider block">Location</span>
            <span className="text-xs font-bold text-slate-800 block truncate mt-1">{person.city}</span>
          </div>
        </div>

        {/* Skills Tag row */}
        <div className="flex flex-wrap gap-1.5 mb-6 pt-1">
          {person.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="text-[10px] font-bold text-[#222222] bg-slate-50 border border-slate-100/80 px-2.5 py-0.5 rounded-full select-none"
            >
              {skill}
            </span>
          ))}
          {person.skills.length > 3 && (
            <span className="text-[10px] font-bold text-[#717171] px-1 py-0.5">
              +{person.skills.length - 3} more
            </span>
          )}
        </div>

      </div>

      {/* Footer view CTA and hourly rate estimates */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100/80 mt-auto">
        <div>
          <span className="text-[9px] font-bold text-[#717171] uppercase tracking-wider block">Hourly Rate</span>
          <span className="text-slate-900 font-black text-base sm:text-lg">
            ${person.hourlyRate} <span className="text-[#717171] text-[10px] font-bold">/ hr</span>
          </span>
        </div>
        <Link to={`/people/${person.id}`}>
          <Button
            size="sm"
            className="bg-[#00142E] hover:bg-slate-800 text-white font-bold rounded-xl text-xs px-4 py-2 cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            View Profile
          </Button>
        </Link>
      </div>

    </div>
  );
}
