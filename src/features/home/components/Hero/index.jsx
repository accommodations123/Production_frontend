import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { HeroSearchCard } from './HeroSearchCard';

export function Hero() {
  const navigate = useNavigate();

  const popularTags = [
    { label: 'Housing', query: 'Private Rooms', bg: 'bg-[#FDF2F2] text-[#E1392A] border-red-100/80 hover:border-red-200' },
    { label: 'Visa Help', query: 'Visa & Immigration', bg: 'bg-[#ECFDF5] text-[#059669] border-emerald-100/80 hover:border-emerald-200' },
    { label: 'Expat Banking', query: 'Expat Banking', bg: 'bg-[#EFF6FF] text-[#2563EB] border-blue-100/80 hover:border-blue-200' },
    { label: 'Airport Cab', query: 'Airport Pickup', bg: 'bg-[#FEFCE8] text-[#D97706] border-amber-100/80 hover:border-amber-200' },
    { label: 'Insurance', query: 'Health Insurance', bg: 'bg-[#F3E8FF] text-[#9333EA] border-purple-100/80 hover:border-purple-200' },
    { label: 'Student Rooms', query: 'Student Housing', bg: 'bg-[#FDF2F8] text-[#DB2777] border-pink-100/80 hover:border-pink-200' }
  ];

  const handleTagClick = (tagQuery) => {
    const isStaySearch =
      tagQuery.includes('stay') ||
      tagQuery.includes('rent') ||
      tagQuery.includes('room') ||
      tagQuery.includes('house') ||
      tagQuery.includes('apartment') ||
      tagQuery.includes('flat') ||
      tagQuery.includes('studio') ||
      tagQuery.includes('housing');

    const params = new URLSearchParams();
    params.set('location', 'India');
    params.set('query', tagQuery);

    if (isStaySearch) {
      navigate(`/search?${params.toString()}`);
    } else {
      navigate(`/people?${params.toString()}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FCFAF6] via-[#FFFFFF] to-[#FFFFFF] pt-14 pb-12 lg:pt-16 lg:pb-16 border-b border-slate-100" aria-labelledby="home-hero-title">

      {/* Floating Ambient Light Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#E1392A]/5 rounded-full filter blur-[100px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#D5CBA8]/10 rounded-full filter blur-[120px] pointer-events-none translate-y-1/3" />

      {/* Decorative Grid Line Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none opacity-50" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col space-y-7 text-center items-center">

        {/* Top Dark Navy Pill Badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#00162D] text-white font-extrabold text-xs tracking-tight shadow-sm select-none">
          Direct & Fee-Free Expat Relocation Network
        </div>

        {/* Editorial Heading */}
        <div className="max-w-3xl space-y-4">
          <h1 id="home-hero-title" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#00162D] tracking-tight leading-[1.08] font-sans">
            Settle Abroad, Guided by <br />
            <span className="text-[#E1392A] block mt-1">Verification.</span>
          </h1>
          <p className="text-sm sm:text-base font-semibold text-slate-500 max-w-[60ch] mx-auto leading-relaxed">
            Relocate with absolute confidence. Discover verified apartments, connect with local immigration partners, and access trusted expat services tailored to your destination country.
          </p>
        </div>

        {/* Centerpiece Search Console Widget */}
        <div className="w-full max-w-3xl transform hover:scale-[1.01] transition-transform duration-300">
          <HeroSearchCard />
        </div>

        {/* Suggested Tags Pill List */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-semibold text-slate-500 select-none max-w-2xl pt-2">
          <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px] mr-1">
            SUGGESTED:
          </span>
          {popularTags.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => handleTagClick(tag.query)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border ${tag.bg} font-extrabold cursor-pointer transition-all duration-150 hover:shadow-sm text-xs active:scale-95`}
            >
              <span>{tag.label}</span>
              <ArrowUpRight size={12} className="stroke-[2.5]" />
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
