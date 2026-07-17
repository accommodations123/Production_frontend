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
    <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between h-full group hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300">
      
      <div>
        
        {/* Header section with photo, name, and save bookmark */}
        <div className="flex items-start justify-between gap-4 mb-4">
          
          <div className="flex gap-4 items-center">
            <div className="relative shrink-0">
              <img
                src={person.avatar}
                alt={person.name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm"
                loading="lazy"
              />
              {person.verified && (
                <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-[#00142E]">
                {person.name}
              </h3>
              <p className="text-[#CB2A25] font-bold text-xs">
                {person.profession}
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveToggle}
            className={`p-2 rounded-xl border border-slate-100 transition-colors cursor-pointer ${
              isSaved 
                ? "bg-amber-50 text-amber-600 border-amber-200" 
                : "bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            }`}
            title={isSaved ? "Saved" : "Save Expert"}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-500" : ""}`} />
          </button>

        </div>

        {/* Short Bio summary */}
        <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
          {person.bio}
        </p>

        {/* Badges metadata info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5 text-xs text-slate-500 font-semibold border-b border-slate-50 pb-4">
          
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-slate-800 font-bold">{person.rating.toFixed(2)}</span>
            <span className="text-slate-400">({person.reviewCount})</span>
          </div>

          <div className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>{person.experience} Exp</span>
          </div>

          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{person.city}, {person.country}</span>
          </div>

        </div>

        {/* Skills Tag row */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {person.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg select-none"
            >
              {skill}
            </span>
          ))}
          {person.skills.length > 3 && (
            <span className="text-[10px] font-bold text-slate-400 px-1 py-0.5">
              +{person.skills.length - 3} more
            </span>
          )}
        </div>

      </div>

      {/* Footer view CTA and hourly rate estimates */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Consulting Rate</span>
          <span className="text-slate-900 font-black text-base sm:text-lg">
            ${person.hourlyRate} <span className="text-slate-400 text-[10px] font-bold">/ hr</span>
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
