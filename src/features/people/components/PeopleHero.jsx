import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Users, Award, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/ui/button";

export default function PeopleHero() {
  return (
    <div className="bg-[#00142E] text-white py-16 sm:py-20 relative overflow-hidden border-b border-slate-800">
      
      {/* Decorative background grid element */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-bold tracking-wide uppercase select-none">
              <ShieldCheck className="w-3.5 h-3.5 text-[#CB2A25]" /> Verified Support Networks
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Connect with Expat Support Experts
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-medium">
              Consult verified immigration attorneys, housing agents, cross-border accountants, and local liaisons to ensure a smooth transition into your new home.
            </p>
            
            {/* Direct Stats Indicators */}
            <div className="grid grid-cols-3 gap-6 pt-4 max-w-md">
              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-black text-white block">30+</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Local Experts</span>
              </div>
              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-black text-white block">100%</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">ID Verified</span>
              </div>
              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-black text-white block">4.9★</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Average Rating</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:self-center shrink-0">
            <Link to="/people/become">
              <Button className="w-full sm:w-auto h-12 px-6 bg-[#CB2A25] hover:bg-[#b0221e] text-white font-bold rounded-xl shadow-md border-0 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                <Sparkles className="w-4 h-4" /> Become an Expert
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
