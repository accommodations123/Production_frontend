import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { HeroSearchCard } from './HeroSearchCard';

export function Hero() {
  const navigate = useNavigate();

  const popularTags = [
    { label: 'Housing', query: 'Private Rooms' },
    { label: 'Visa Help', query: 'Visa & Immigration' },
    { label: 'Expat Banking', query: 'Expat Banking' },
    { label: 'Airport Cab', query: 'Airport Pickup' },
    { label: 'Insurance', query: 'Health Insurance' },
    { label: 'Student Rooms', query: 'Student Housing' }
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
    params.set('location', 'India'); // Default country
    params.set('query', tagQuery);

    if (isStaySearch) {
      navigate(`/search?${params.toString()}`);
    } else {
      navigate(`/people?${params.toString()}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FCFAF6] via-[#FFFFFF] to-[#FFFFFF] pt-20 pb-10 lg:pt-24 lg:pb-12 border-b border-slate-100" aria-labelledby="home-hero-title">

      {/* Premium Floating Ambient Light Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#E1392A]/5 rounded-full filter blur-[100px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#D5CBA8]/10 rounded-full filter blur-[120px] pointer-events-none translate-y-1/3" />

      {/* Decorative Grid Line Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none opacity-50" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col space-y-9 text-center items-center">



        {/* Editorial Heading and Brand Narrative */}
        <div className="max-w-3xl space-y-4">
          <h1 id="home-hero-title" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#00162D] tracking-tight leading-[1.1] font-sans">
            Settle Abroad, Guided by <span className="bg-gradient-to-r from-[#CB2A26] via-[#E1392A] to-[#F15A24] bg-clip-text text-transparent">Verification.</span>
          </h1>
          <p className="text-sm sm:text-base font-semibold text-slate-500 max-w-[62ch] mx-auto leading-relaxed">
            Relocate with absolute confidence. Discover verified apartments, connect with local immigration partners, and access trusted expat services tailored to your destination country.
          </p>
        </div>

        {/* Centerpiece Simple Autocomplete Search Console */}
        <div className="w-full max-w-3xl transform hover:scale-[1.01] transition-transform duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-3xl">
          <HeroSearchCard />
        </div>

        {/* Popular Tags List underneath */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-semibold text-slate-500 select-none max-w-2xl pt-2">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mr-1">
            Suggested:
          </span>
          {popularTags.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => handleTagClick(tag.query)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-slate-200/80 bg-white hover:border-slate-800 text-slate-600 hover:text-slate-900 cursor-pointer transition-all hover:shadow-sm text-xs font-bold active:scale-95"
            >
              {tag.label}
              <ArrowUpRight size={10} className="text-slate-400" />
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
