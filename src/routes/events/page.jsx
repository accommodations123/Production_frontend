import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"


import { EVENT_CATEGORIES } from "@/shared/utils/mock-events"
import { TrendingUp, Sparkles, ChevronRight } from "lucide-react"
import { useGetApprovedEventsQuery } from "@/store/api/eventApi"
import { useCountry } from "@/context/CountryContext"
import { filterUpcomingEvents } from "@/shared/utils/eventUtils"

// Components
import { EventsHero } from "@/features/events/components/EventsHero"
import { EventsFilters } from "@/features/events/components/EventsFilters"
import { EventCard } from "@/features/events/components/EventCard"
import { usePagination } from "@/shared/hooks/usePagination"
import { Pagination } from "@/shared/ui/Pagination"

// Constants for better maintainability
const SCROLL_THRESHOLD = 50

const parsePrice = (priceVal) => {
  if (priceVal === undefined || priceVal === null || priceVal === "") return 0;
  if (typeof priceVal === "number") return priceVal;
  if (typeof priceVal === "string") {
    if (priceVal.toLowerCase().includes("free")) return 0;
    const cleaned = priceVal.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const EventsPage = () => {
  const navigate = useNavigate()
  const { activeCountry } = useCountry()
  const { data: apiEvents = [], isLoading, isError, refetch } = useGetApprovedEventsQuery(activeCountry?.name)

  // (Removed handleScroll and visibleSections logic)
  const [activeFilter, setActiveFilter] = useState("all")
  const [isScrolled, setIsScrolled] = useState(false) // Keep isScrolled for Navbar if needed, or remove if unused. Keeping for now as it seemed separate.
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState("grid")
  const [selectedFilters, setSelectedFilters] = useState({
    date: "",
    price: "",
    location: "",
    category: ""
  })

  // Clean up unused scroll visibility logic
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
  if (showFilters) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [showFilters]);

  // Process events from API
  const eventsByCategory = useMemo(() => {
    if (!apiEvents || apiEvents.length === 0) return {};

    const grouped = {};
    EVENT_CATEGORIES.forEach(cat => {
      grouped[cat.id] = [];
    });

    const classifyEventCategory = (e) => {
      if (e.event_mode === "online") {
        return "online";
      }
      const t = e.type?.toLowerCase().replace(/\s+/g, "").trim();
      if (!t) return "other";
      if (t === "public") return "sports";
      if (t === "private") return "online";
      if (t === "festival" || t === "music") return "festival";
      if (t === "meetup" || t === "community") return "meetup";
      if (t === "party" || t === "food") return "party";
      if (t === "workshop" || t === "class" || t === "workshops") return "workshop";
      if (t === "sports" || t === "wellness") return "sports";
      if (t === "online") return "online";
      return "other";
    };

    // 1. Remove expired events first
    const activeApiEvents = filterUpcomingEvents(apiEvents);

    // 2. Then filter by country
    const filteredApiEvents = activeApiEvents.filter(event => {
      if (!activeCountry?.name) return true;
      const eventCountry = (event.country || "").toLowerCase().trim();
      const selectedCountry = activeCountry.name.toLowerCase().trim();
      const selectedCountryCode = (activeCountry.code || "").toLowerCase().trim();

      // Allow online events to show globally
      if (event.event_mode?.toLowerCase() === "online") return true;

      return eventCountry === selectedCountry || eventCountry === selectedCountryCode;
    });

    filteredApiEvents.forEach(event => {
      const categoryId = classifyEventCategory(event);
      const uiEvent = {
        id: event._id || event.id,
        title: event.title || event.eventName || "Untitled Event",
        description: event.description || "No description available",
        date: event.date || event.start_date,
        time: event.time || event.start_time,
        location: event.location || event.venue || "Location TBA",
        city: event.city,
        country: event.country,
        image: event.image || event.banner_image || (event.gallery_images && event.gallery_images.length > 0 ? event.gallery_images[0] : null),
        price: event.price || event.ticketPrice,
        organizer: event.organizer || event.hostName,
        type: event.type || "Event",
        category: categoryId,
        attendees_count: event.attendees_count || 0,
        reviews_count: event.reviews_count || 0,
        comments_count: event.comments_count || 0,
        host: event.Host || event.host || null,
        gallery_images: Array.isArray(event.gallery_images) ? event.gallery_images : [],
        included_items: Array.isArray(event.included_items) ? event.included_items : [],
        schedule: Array.isArray(event.schedule) ? event.schedule : []
      };

      if (grouped[categoryId]) {
        grouped[categoryId].push(uiEvent);
      } else {
        if (!grouped['other']) grouped['other'] = [];
        grouped['other'].push(uiEvent);
      }
    });

    return grouped;
  }, [apiEvents, activeCountry]);

  const allEventsList = useMemo(() => {
    return Object.values(eventsByCategory).flat();
  }, [eventsByCategory]);

  const uniqueLocations = useMemo(() => {
    if (!allEventsList || allEventsList.length === 0) return [];
    const locations = new Set();
    allEventsList.forEach(event => {
      if (event.category === "online") {
        return;
      }
      const city = event.city?.trim();
      const country = event.country?.trim();
      if (city && country) {
        locations.add(`${city}, ${country}`);
      } else if (city) {
        locations.add(city);
      } else if (event.location && event.location !== "Location TBA") {
        locations.add(event.location.trim());
      }
    });
    return Array.from(locations).sort();
  }, [allEventsList]);

  const totalEvents = useMemo(() => allEventsList.length, [allEventsList])
  const featuredEvents = useMemo(() => allEventsList.slice(0, 5), [allEventsList])

  const hasActiveFilters = useMemo(() =>
    Object.values(selectedFilters).some(value => value !== ""),
    [selectedFilters]
  )

  // --- Search & Filter Logic ---
const filteredEventsDisplay = useMemo(() => {
  let filtered = [...allEventsList];

  // ✅ 1. CATEGORY BUTTON FILTER
  if (activeFilter !== "all" && activeFilter !== "trending") {
    filtered = filtered.filter(
      e => e.category === activeFilter
    );
  }

  // ✅ 2. LOCATION FILTER
  if (selectedFilters.location) {
    const query = selectedFilters.location.toLowerCase().trim();

    if (query === "online") {
      filtered = filtered.filter(e => e.category === "online" || e.event_mode?.toLowerCase() === "online");
    } else {
      filtered = filtered.filter(e => {
        const city = e.city?.toLowerCase() || "";
        const country = e.country?.toLowerCase() || "";
        const location = e.location?.toLowerCase() || "";
        const cleanQuery = query.replace(/,/g, " ").replace(/\s+/g, " ");
        const searchString = `${city} ${country} ${location}`.replace(/,/g, " ").replace(/\s+/g, " ");
        const queryWords = cleanQuery.split(" ").filter(Boolean);
        return queryWords.every(word => searchString.includes(word));
      });
    }
  }

  // ✅ 2.5 PRICE FILTER
  if (selectedFilters.price) {
    filtered = filtered.filter(e => {
      const p = parsePrice(e.price);
      if (selectedFilters.price === "free") {
        return p === 0;
      }
      if (selectedFilters.price.endsWith("+")) {
        const min = parseFloat(selectedFilters.price.slice(0, -1));
        return p >= min;
      }
      if (selectedFilters.price.includes("-")) {
        const [min, max] = selectedFilters.price.split("-").map(parseFloat);
        return p >= min && p <= max;
      }
      return true;
    });
  }

  // ✅ 2.6 DATE FILTER
  if (selectedFilters.date) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);
    const tomorrowEnd = new Date(todayEnd);
    tomorrowEnd.setDate(todayEnd.getDate() + 1);

    const dayOfWeek = todayStart.getDay(); // 0 is Sunday, 1 is Monday...

    filtered = filtered.filter(e => {
      if (!e.date) return false;
      const eventDate = new Date(e.date);
      if (isNaN(eventDate.getTime())) return false;

      const eventTime = eventDate.getTime();

      switch (selectedFilters.date) {
        case "today":
          return eventTime >= todayStart.getTime() && eventTime <= todayEnd.getTime();
        case "tomorrow":
          return eventTime >= tomorrowStart.getTime() && eventTime <= tomorrowEnd.getTime();
        case "this-week": {
          const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
          const endOfWeek = new Date(todayStart);
          endOfWeek.setDate(todayStart.getDate() + daysToSunday);
          endOfWeek.setHours(23, 59, 59, 999);
          return eventTime >= todayStart.getTime() && eventTime <= endOfWeek.getTime();
        }
        case "this-weekend": {
          const friday = new Date(todayStart);
          friday.setDate(todayStart.getDate() + (5 - (dayOfWeek === 0 ? 7 : dayOfWeek)));
          friday.setHours(0, 0, 0, 0);

          const sunday = new Date(todayStart);
          sunday.setDate(todayStart.getDate() + (7 - (dayOfWeek === 0 ? 7 : dayOfWeek)));
          sunday.setHours(23, 59, 59, 999);

          return eventTime >= friday.getTime() && eventTime <= sunday.getTime();
        }
        case "next-week": {
          const daysToNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
          const nextMonday = new Date(todayStart);
          nextMonday.setDate(todayStart.getDate() + daysToNextMonday);
          nextMonday.setHours(0, 0, 0, 0);

          const nextSunday = new Date(nextMonday);
          nextSunday.setDate(nextMonday.getDate() + 6);
          nextSunday.setHours(23, 59, 59, 999);

          return eventTime >= nextMonday.getTime() && eventTime <= nextSunday.getTime();
        }
        case "this-month": {
          const endOfMonth = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 0, 23, 59, 59, 999);
          return eventTime >= todayStart.getTime() && eventTime <= endOfMonth.getTime();
        }
        default:
          return true;
      }
    });
  }

  // ✅ 3. DROPDOWN CATEGORY FILTER
  if (selectedFilters.category) {
    filtered = filtered.filter(
      e => e.category === selectedFilters.category
    );
  }

  // ✅ 4. SEARCH FILTER
  if (searchQuery) {
    const query = searchQuery.toLowerCase();

    filtered = filtered.filter(e =>
      e.title?.toLowerCase().includes(query) ||
      e.city?.toLowerCase().includes(query) ||
      e.country?.toLowerCase().includes(query)
    );
  }

  // ✅ 5. TRENDING SORT (LAST)
  if (activeFilter === "trending") {
    filtered = [...filtered].sort(
      (a, b) => b.attendees_count - a.attendees_count
    );
  }

  return filtered;
}, [allEventsList, searchQuery, activeFilter, selectedFilters]);

  // ✅ Pagination for filtered events
  const {
    currentItems: paginatedEvents,
    currentPage,
    totalPages,
    goToPage
  } = usePagination(filteredEventsDisplay || [], 12);

  const handleFilterChange = useCallback((filterType, value) => {
    setSelectedFilters(prev => ({ ...prev, [filterType]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setSelectedFilters({ date: "", price: "", location: "", category: "" })
    setActiveFilter("all")
  }, [])

   const handleViewDetails = useCallback((eventId) => {
    navigate(`/events/${eventId}`)
  }, [navigate])

  const isSearchingOrFiltering = activeFilter !== "all" || searchQuery !== "" || hasActiveFilters;

  if (isError) {
    return (
      <main className="min-h-screen bg-white font-sans flex flex-col justify-between">
        <div>
          
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Sparkles className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-[#00142E] mb-2">Unable to load events</h2>
            <p className="text-[#484848] mb-6 max-w-sm text-sm">We couldn't connect to the server. Please check your internet connection and try again.</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 bg-[#00142E] text-white font-semibold rounded-xl hover:bg-[#00142E]/90 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
            >
              Try Again
            </button>
          </div>
        </div>
        
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white font-sans">
      

      <EventsHero
        totalEvents={totalEvents}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        featuredEvents={featuredEvents}
        isLoading={isLoading}
      />

      <EventsFilters
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        eventCategories={EVENT_CATEGORIES}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        selectedFilters={selectedFilters}
        handleFilterChange={handleFilterChange}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        isScrolled={isScrolled}
        uniqueLocations={uniqueLocations}
      />

      {/* 1. LANDING STATE (No active filter/search) */}
      {!isSearchingOrFiltering ? (
        <>
          {/* Trending Events Section */}
          <div id="trending" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#00142E] flex items-center gap-3">
                <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-[#00142E]" />
                Trending Events
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-[#E1392A] animate-pulse" />
              </h2>
              <button
                onClick={() => setActiveFilter("trending")}
                className="text-sm font-medium text-[#00142E] hover:text-[#00142E]/70 flex items-center gap-1 group transition-colors duration-300"
              >
                View All
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-[#00142E] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#484848] font-medium tracking-wide">Fetching amazing events...</p>
              </div>
            ) : featuredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-[#717171]" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700">No Trending Events</h3>
                  <p className="text-[#484848] text-sm mt-1">Check back later for trending events in your area</p>
                </div>
              </div>
            ) : (
              <div className={`grid gap-6 mb-12 sm:mb-16 ${viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
                }`}>
                {featuredEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    viewMode={viewMode}
                    onViewDetails={handleViewDetails}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Grouped Category Sections */}
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
            <div className="space-y-12 animate-in fade-in duration-500">
              {/* Show empty state if all categories are empty */}
              {Object.values(eventsByCategory).every(arr => arr.length === 0) && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-[#717171]" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-700">No Events Available</h3>
                    <p className="text-[#484848] mt-2 max-w-md">There are no events in your selected region right now. Check back soon or try a different location.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* 2. SEARCH/FILTER ACTIVE STATE */
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
          {filteredEventsDisplay.length > 0 ? (
            <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold text-[#00142E] mt-4">
                Found {filteredEventsDisplay.length} events
              </h2>
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                {paginatedEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    viewMode={viewMode}
                    onViewDetails={handleViewDetails}
                    index={index}
                  />
                ))}
              </div>

              {/* Pagination Logic */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          ) : (
            /* Premium Filter Empty State */
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 my-8 animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-[#717171] animate-pulse" />
              </div>
              <div className="text-center max-w-md px-4">
                <h3 className="text-xl font-bold text-gray-700">No Events Found</h3>
                <p className="text-[#484848] mt-2 text-sm leading-relaxed">
                  We couldn't find any events matching your selected category, search query, or advanced filters. Try resetting your choices to discover more!
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 px-6 py-2.5 bg-[#00142E] text-white font-semibold rounded-xl hover:bg-[#00142E]/90 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      
    </main>

  )
}

export default EventsPage
