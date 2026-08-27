import { useState, useMemo } from "react";
import { 
  Calendar, Eye, Plus, Search, AlertCircle, 
  Trash2, Users, MapPin, Loader2
} from "lucide-react";
import { isExpiredUTC } from "@/shared/utils/timezone";
import { 
  useGetMyEventsQuery, 
  useDeleteEventMutation, 
  useGetHostProfileQuery 
} from "@/store/api/hostApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/utils";
import { usePagination } from "@/shared/hooks/usePagination";
import { Pagination } from "@/shared/ui/Pagination";

export const MyEvents = () => {
  const navigate = useNavigate();
  const [activeFilterTab, setActiveFilterTab] = useState("active"); // active, drafts, archived
  const [searchQuery, setSearchQuery] = useState("");

  const { data: hostProfile } = useGetHostProfileQuery();

  const {
    data: eventListings = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMyEventsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    skip: !hostProfile
  });

  const [deleteEvent] = useDeleteEventMutation();
  const [deletingIds, setDeletingIds] = useState(new Set());

  // Helper: check if an event is expired
  const isEventExpired = (e) => {
    const dateStr = e.end_date || e.start_date;
    if (!dateStr) return false;
    const timeStr = e.end_time || e.start_time;
    return isExpiredUTC(dateStr, timeStr);
  };

  // Process Events
  const events = useMemo(() => {
    return (eventListings || []).map(e => {
      const id = e._id || e.id;
      const status = (e.status || "").toLowerCase();
      const isDeleted = e.is_deleted === true || status === "deleted";
      const isExpired = isEventExpired(e);

      let calculatedStatus = "active";
      if (isDeleted) calculatedStatus = "deleted";
      else if (isExpired) calculatedStatus = "expired";
      else if (status === "pending") calculatedStatus = "pending";
      else if (status === "rejected") calculatedStatus = "rejected";
      else if (status === "draft" || !status) calculatedStatus = "draft";
      else if (status === "approved" || status === "active" || status === "accepted") calculatedStatus = "active";

      return {
        ...e,
        id,
        calculatedStatus,
        isExpired,
        isDeleted,
        type: "experience"
      };
    }).filter(e => !e.isDeleted && !deletingIds.has(e.id));
  }, [eventListings, deletingIds]);

  const handleEventDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setDeletingIds(prev => new Set([...prev, id]));
    try {
      await deleteEvent(id).unwrap();
      toast.success("Event deleted successfully");
    } catch (err) {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error(err?.data?.message || "Failed to delete event");
    }
  };



  // Filter list based on tabs & search
  const filteredEvents = useMemo(() => {
    let list = [];
    if (activeFilterTab === "active") {
      list = events.filter(e => e.calculatedStatus === "active" || e.calculatedStatus === "pending");
    } else if (activeFilterTab === "drafts") {
      list = events.filter(e => e.calculatedStatus === "draft");
    } else if (activeFilterTab === "archived") {
      list = events.filter(e => e.calculatedStatus === "expired");
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(item => 
        (item.title || "").toLowerCase().includes(query) || 
        (item.city || item.location || "").toLowerCase().includes(query) ||
        (item.event_type || "").toLowerCase().includes(query)
      );
    }

    return list;
  }, [activeFilterTab, events, searchQuery]);

  const {
    currentItems: paginatedEvents,
    currentPage,
    totalPages,
    goToPage
  } = usePagination(filteredEvents, 6);

  const stats = useMemo(() => {
    const activeCount = events.filter(e => e.calculatedStatus === "active" || e.calculatedStatus === "pending").length;
    const draftsCount = events.filter(e => e.calculatedStatus === "draft").length;
    const archivedCount = events.filter(e => e.calculatedStatus === "expired").length;
    return { activeCount, draftsCount, archivedCount };
  }, [events]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header (Compact, visual) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Your Hosted Events</h2>
          <p className="text-xs text-[#484848] mt-1">Manage your planned experiences and local community get-togethers.</p>
        </div>
        <button 
          onClick={() => navigate("/events/host")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-4 text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Event
        </button>
      </div>

      {/* 2. Tabs and Filter Area */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-5">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveFilterTab("active")}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 border cursor-pointer",
                activeFilterTab === "active"
                  ? "bg-[#0A1A2F] text-white border-transparent shadow-sm"
                  : "bg-white text-[#484848] border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              Active Events
              <span className={cn("px-1.5 py-0.5 rounded-md text-[9px] font-extrabold", activeFilterTab === "active" ? "bg-white/20 text-white" : "bg-gray-100 text-[#484848]")}>
                {stats.activeCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilterTab("drafts")}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 border cursor-pointer",
                activeFilterTab === "drafts"
                  ? "bg-[#0A1A2F] text-white border-transparent shadow-sm"
                  : "bg-white text-[#484848] border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              Drafts
              <span className={cn("px-1.5 py-0.5 rounded-md text-[9px] font-extrabold", activeFilterTab === "drafts" ? "bg-white/20 text-white" : "bg-gray-100 text-[#484848]")}>
                {stats.draftsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilterTab("archived")}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 border cursor-pointer",
                activeFilterTab === "archived"
                  ? "bg-[#0A1A2F] text-white border-transparent shadow-sm"
                  : "bg-white text-[#484848] border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              Past / Expired
              <span className={cn("px-1.5 py-0.5 rounded-md text-[9px] font-extrabold", activeFilterTab === "archived" ? "bg-white/20 text-white" : "bg-gray-100 text-[#484848]")}>
                {stats.archivedCount}
              </span>
            </button>
          </div>
          
          <div className="text-xs font-bold text-[#717171]">
            Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717171] w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by event title, location, category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900"
          />
        </div>

        {/* Content list */}
        {isError ? (
          <div className="p-8 text-center bg-red-50 border border-red-100 rounded-2xl">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h4 className="font-bold text-red-700">Failed to load events</h4>
            <p className="text-xs text-red-600/70 mt-1">{error?.message || "Please check your network connection and try again."}</p>
            <button onClick={() => refetch()} className="mt-4 bg-red-600 text-white rounded-xl px-4 py-2 text-xs font-bold cursor-pointer">Try Again</button>
          </div>
        ) : isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            <p className="text-sm text-[#484848] font-medium">Loading your experiences...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Calendar className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Host Your First Experience</h3>
              <p className="text-xs text-[#484848] max-w-xs mx-auto leading-relaxed">
                Connect with the community by planning walks, group dinners, sports activities, or wellness sessions.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => navigate("/events/host")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-3 text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Create Event
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEvents.map((event) => (
              <EventItemCard
                key={event.id}
                event={event}
                onDelete={handleEventDelete}
              />
            ))}

            <div className="col-span-full pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------
   Experience Card Component
-------------------------------- */
const EventItemCard = ({ event, onDelete }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const thumbnail = event.banner_image || event.image || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80";
  const label = event.event_type || "Experience";
  const location = event.location || event.city || "Online / Flexible";

  const getStatus = () => {
    switch (event.calculatedStatus) {
      case "active":
      case "approved":
        return { text: "Live", class: "bg-green-500 text-white" };
      case "pending":
        return { text: "Pending Review", class: "bg-yellow-500 text-white" };
      case "draft":
        return { text: "Draft", class: "bg-blue-500 text-white" };
      case "expired":
        return { text: "Expired", class: "bg-red-500 text-white" };
      case "rejected":
        return { text: "Rejected", class: "bg-red-500 text-white" };
      default:
        return { text: "Live", class: "bg-green-500 text-white" };
    }
  };

  const statusObj = getStatus();

  return (
    <div className={cn(
      "group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    )}>
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-50">
        <img 
          src={thumbnail} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
        />
        
        {/* Status Badge */}
        <span className={cn("absolute top-3.5 right-3.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-md", statusObj.class)}>
          {statusObj.text}
        </span>

        {/* Category Label */}
        <span className="absolute top-3.5 left-3.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-lg text-[9px] font-black uppercase tracking-wider text-gray-700 shadow-sm border border-gray-100">
          {label}
        </span>
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-1 space-y-3">
        <div className="space-y-1">
          <h3 className="font-extrabold text-gray-900 group-hover:text-emerald-600 transition-colors text-base line-clamp-1">
            {event.title || "Untitled Event"}
          </h3>
          <p className="text-xs text-[#717171] font-semibold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            {location}
          </p>
        </div>

        {/* Date / Time summary */}
        <div className="bg-gray-50 p-2.5 rounded-xl text-xs font-semibold text-[#222222] flex justify-between items-center px-4">
          <div className="flex items-center gap-1 text-[10px] text-[#717171] uppercase tracking-wider font-extrabold">
            <Calendar className="w-3.5 h-3.5 text-[#717171]" />
            <span>Date</span>
          </div>
          <span className="text-gray-800 font-extrabold">
            {event.start_date ? new Date(event.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "TBD"}
          </span>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-4 text-xs font-bold text-[#717171] border-t border-gray-50 pt-2.5">
          <span className="flex items-center gap-1.5 hover:text-gray-700 cursor-pointer">
            <Eye className="w-3.5 h-3.5" />
            115 Views
          </span>
          <span className="flex items-center gap-1.5 hover:text-gray-700 cursor-pointer">
            <Users className="w-3.5 h-3.5" />
            {event.max_attendees ? `0/${event.max_attendees} Joined` : "Open Join"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-50 mt-auto">
          <div className="flex gap-2 flex-1">
            <button 
              className="flex-1 py-2 text-xs font-extrabold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all text-center cursor-pointer"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              Preview
            </button>
            
            {event.calculatedStatus !== "approved" && (
              <button 
                className="flex-1 py-2 text-xs font-extrabold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all text-center cursor-pointer"
                onClick={() => navigate(`/events/host?edit=${event.id}`)}
              >
                Edit
              </button>
            )}
          </div>

          <div className="flex gap-1.5">
            {/* Delete */}
            <button 
              type="button"
              className="w-8.5 h-8.5 rounded-xl border border-gray-200 text-[#717171] hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all cursor-pointer bg-white"
              disabled={isDeleting}
              onClick={async () => {
                setIsDeleting(true);
                try {
                  await onDelete(event.id);
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
