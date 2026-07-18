import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";

export default function PeopleHero({ searchQuery, setSearchQuery }) {
  return (
    <div className="bg-[#00142E] text-white px-4 py-12 sm:py-16 relative overflow-hidden border-b border-slate-800/60">

      {/* Mesh gradients for premium depth */}
      <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-[#E1392A]/10 rounded-full blur-[100px] -mr-24 -mt-24 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-[#D5CBA8]/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Decorative background grid element */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:20px_20px] opacity-60" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">

          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold tracking-wide uppercase select-none">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E1392A]" /> Verified Support Networks
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1] sm:leading-[1.12]">
              Connect with Expat Support Experts
            </h1>
            
            <p className="text-[#717171] text-sm sm:text-base leading-relaxed font-medium max-w-xl">
              Consult verified immigration attorneys, housing agents, cross-border accountants, and local liaisons to ensure a smooth transition into your new home.
            </p>

            {/* Elegant Search Pill inside Hero */}
            <div className="relative max-w-lg pt-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717171]" />
              <input
                type="text"
                placeholder="Search experts by name, professional title, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-white/95 backdrop-blur-md text-slate-800 placeholder:text-[#717171] text-sm rounded-xl outline-none shadow-lg shadow-black/20 focus:ring-2 focus:ring-[#E1392A] transition-all border border-white/20"
              />
            </div>
          </div>

          {/* Right Column: Stats & Expert Trigger CTA */}
          <div className="flex flex-col gap-6 lg:items-end justify-between self-stretch lg:pt-6">
            
            {/* Stats Indicators */}
            <div className="flex items-center gap-8 sm:gap-12">
              <div className="space-y-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight block">30+</span>
                <span className="text-[10px] sm:text-xs font-semibold text-[#717171] uppercase tracking-wider block">Local Experts</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight block">100%</span>
                <span className="text-[10px] sm:text-xs font-semibold text-[#717171] uppercase tracking-wider block">ID Verified</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight block">4.9★</span>
                <span className="text-[10px] sm:text-xs font-semibold text-[#717171] uppercase tracking-wider block">Avg Rating</span>
              </div>
            </div>

            <Link to="/people/become" className="block w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-11 px-5 bg-[#E1392A] hover:bg-[#C82E20] text-white font-bold rounded-xl shadow-md border-0 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                <Sparkles className="w-4 h-4" /> Become an Expert
              </Button>
            </Link>

          </div>

        </div>
      </div>
    </div>
  );
}
