import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/shared/layout/Navbar";
import { Footer } from "@/shared/layout/Footer";
import { MOCK_PEOPLE } from "../data/people";
import { Star, MapPin, ShieldCheck, Mail, Send, Award, Languages, Image, ArrowLeft, Calendar, HelpCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";

export default function PeopleProfile() {
  const { id } = useParams();

  // Load dynamically from localStorage/mock data
  const peopleList = useMemo(() => {
    const saved = localStorage.getItem("kinlife_people");
    return saved ? JSON.parse(saved) : MOCK_PEOPLE;
  }, []);

  // Find target advisor
  const person = useMemo(() => {
    return peopleList.find((p) => p.id === id) || peopleList[0];
  }, [peopleList, id]);

  // Find related profiles in same category, up to 3 cards
  const relatedPeople = useMemo(() => {
    return peopleList
      .filter((p) => p.category === person.category && p.id !== person.id)
      .slice(0, 3);
  }, [peopleList, person]);

  // Generate mock services based on category
  const services = useMemo(() => {
    switch (person.category) {
      case "legal-visa":
        return [
          { name: "Initial Immigration Strategy Session", price: 90, desc: "A comprehensive 45-minute visa audit outlining your residency pathway options." },
          { name: "Residency Application Document Review", price: 250, desc: "Full validation of your financial proofs, leases, and administrative forms before submission." }
        ];
      case "tax-finance":
        return [
          { name: "Expat Tax Optimization Review", price: 120, desc: "A detailed review of double-taxation parameters and capital gains liabilities." },
          { name: "Annual Income Tax Filing Preparation", price: 300, desc: "Complete tax preparation and filing including regional deductions and claims." }
        ];
      case "career-coaching":
        return [
          { name: "Resume & CV Adaptation Program", price: 80, desc: "Rewriting your CV to match local recruitment specifications and pass ATS audits." },
          { name: "Technical/Executive Interview Prep", price: 150, desc: "A live mock interview session with direct verbal feedback and salary coaching." }
        ];
      case "languages-translation":
        return [
          { name: "Bilingual Language Course (5 Lessons)", price: 160, desc: "Customized conversational tutorials focusing on local registration bureaucracy terms." },
          { name: "Official Lease/Form Certified Translation", price: 60, desc: "Accredited document translations with stamps acceptable at municipal offices." }
        ];
      case "tech-mentorship":
        return [
          { name: "System Architecture Architecture Review", price: 110, desc: "Codebase analysis, scale bottleneck reviews, and deployment roadmap reviews." },
          { name: "1-on-1 Development Mentorship Session", price: 70, desc: "An interactive pairing programming block reviewing algorithms or React layouts." }
        ];
      default:
        return [
          { name: "Initial Neighborhood Settling Tour", price: 100, desc: "A personalized neighborhood orientation matching housing budgets and transit routes." },
          { name: "Relocation Coordination & Utilities Setup", price: 200, desc: "Full local ward registrations, water/power bookings, and internet lease setup." }
        ];
    }
  }, [person]);

  const handleConnectAction = (type) => {
    if (type === "chat") {
      toast.success("Direct secure connection request initiated. Checking expert availability...");
    } else {
      window.location.href = `mailto:${person.name.toLowerCase().replace(/\s/g, "")}@nextkinlife.com?subject=Inquiry regarding expat consulting services`;
      toast.success("Mail client opened with default template.");
    }
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen flex flex-col justify-between">


      <main className="flex-grow">

        {/* Navigation back bar */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/people"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#484848] hover:text-[#00142E] transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
        </div>

        {/* Cover Header Image section */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900 border-b border-slate-200">
          <img
            src={person.coverImage}
            alt={`${person.name} Cover`}
            className="w-full h-full object-cover opacity-75"
          />
        </div>

        {/* Main Details Wrapper Grid */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left side details block */}
            <div className="lg:col-span-8 space-y-8">

              {/* Profile Card Summary Header */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">

                {/* Photo & Verification badge */}
                <div className="relative shrink-0">
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-24 h-24 rounded-2xl object-cover border border-slate-100 shadow-md"
                  />
                  {person.verified && (
                    <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-md">
                      <ShieldCheck className="w-4.5 h-4.5" />
                    </div>
                  )}
                </div>

                {/* Name, Professional text parameters */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {person.name}
                    </h1>
                    {person.verified && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full select-none">
                        Verified Expert
                      </span>
                    )}
                  </div>

                  <p className="text-[#E1392A] font-bold text-base leading-snug">
                    {person.profession}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-xs text-[#484848] font-semibold pt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-slate-800 font-bold">{person.rating.toFixed(2)}</span>
                      <span className="text-[#717171]">({person.reviewCount} client reviews)</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-[#717171]" />
                      <span>{person.experience} exp</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#717171]" />
                      <span>{person.city}, {person.country}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* About description paragraph */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-3">
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  About Me & Philosophy
                </h2>
                <p className="text-[#222222] text-sm leading-relaxed whitespace-pre-line">
                  {person.bio}
                </p>
              </div>

              {/* Service Cards selection section */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-4">
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
                  Services Offered
                </h2>
                <div className="space-y-4 divide-y divide-slate-100">
                  {services.map((srv, idx) => (
                    <div key={idx} className={`pt-4 ${idx === 0 ? "pt-0" : ""} flex flex-col sm:flex-row items-start justify-between gap-4`}>
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">{srv.name}</h3>
                        <p className="text-[#484848] text-xs sm:text-sm leading-relaxed">{srv.desc}</p>
                      </div>
                      <span className="text-slate-900 font-black text-sm sm:text-base whitespace-nowrap bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-xl self-start sm:self-center">
                        Est. ${srv.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills and Languages spoken summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Core Expertise Tags */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-3">
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                    Expertise & Skills
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {person.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="text-xs font-bold text-[#222222] bg-slate-50 border border-slate-150 px-3 py-1 rounded-xl"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages list */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-3">
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <Languages className="w-4 h-4 text-[#717171]" /> Languages Spoken
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {person.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="text-xs font-bold text-[#222222] bg-slate-50 border border-slate-150 px-3 py-1 rounded-xl"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Portfolio section */}
              {person.portfolioImages && person.portfolioImages.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-4">
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-[#717171]" /> Portfolio & Resources
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {person.portfolioImages.map((img, idx) => (
                      <div key={idx} className="h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-150">
                        <img
                          src={img}
                          alt="Portfolio workspace item"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right side contact information box */}
            <div className="lg:col-span-4 space-y-6">

              {/* Sticky Contact Sidebox */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-5 lg:sticky lg:top-24">

                {/* Rate estimates info */}
                <div>
                  <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider block">Consulting Hourly Rate</span>
                  <div className="flex items-baseline text-[#00142E] font-black mt-1">
                    <span className="text-2xl font-bold">$</span>
                    <span className="text-4xl leading-none">{person.hourlyRate}</span>
                    <span className="text-sm text-[#717171] font-bold ml-1">USD / hour</span>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Consultant Availability Indicator */}
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#717171] uppercase tracking-wider block">Advisor Availability</span>
                  <span className={`px-2.5 py-0.5 rounded-lg border ${person.availability === "Available"
                    ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                    : "text-amber-700 bg-amber-50 border-amber-100"
                    }`}>
                    {person.availability}
                  </span>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Direct Action Connection Controls */}
                <div className="space-y-2.5">
                  <Button
                    onClick={() => handleConnectAction("chat")}
                    className="w-full h-12 bg-[#00142E] hover:bg-slate-800 text-white font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-4 h-4" /> Secure Consult Request
                  </Button>
                  <Button
                    onClick={() => handleConnectAction("email")}
                    variant="outline"
                    className="w-full h-12 rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" /> Send Email Inquiry
                  </Button>
                </div>

                {/* Disclaimers safety warnings */}
                <p className="text-[10px] text-[#717171] leading-relaxed text-center font-medium">
                  Facilitated directly via NextKinLife networks. Please ensure standard credentials reviews before contracting.
                </p>

              </div>

            </div>

          </div>

          {/* Related Professionals List row (if any in same category exist) */}
          {relatedPeople.length > 0 && (
            <div className="mt-16 space-y-6 pt-10 border-t border-slate-200">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Other Experts in this Category
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPeople.map((related) => (
                  <Link
                    key={related.id}
                    to={`/people/${related.id}`}
                    onClick={() => window.scrollTo(0, 0)}
                    className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col gap-3 hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.01)] transition-all"
                  >
                    <div className="flex gap-3 items-center">
                      <img
                        src={related.avatar}
                        alt={related.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-sm"
                      />
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-[#00142E]">
                          {related.name}
                        </h4>
                        <p className="text-[#E1392A] font-bold text-[11px]">
                          {related.profession}
                        </p>
                      </div>
                    </div>
                    <p className="text-[#484848] text-xs line-clamp-2 leading-relaxed">
                      {related.bio}
                    </p>
                    <div className="flex items-center justify-between text-xs font-bold text-[#717171] mt-2">
                      <span className="text-slate-800">${related.hourlyRate} / hr</span>
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {related.rating.toFixed(2)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

      </main>


    </div>
  );
}
