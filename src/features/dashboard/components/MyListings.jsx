import React, { useState, useMemo } from "react";
import { 
  Home, Plus, Search, AlertCircle, Trash2, MapPin, Loader2, Clock
} from "lucide-react";
import { 
  useGetMyListingsQuery, 
  useDeletePropertyMutation, 
  useGetHostProfileQuery 
} from "@/store/api/hostApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/utils";
import { usePagination } from "@/shared/hooks/usePagination";
import { Pagination } from "@/shared/ui/Pagination";

export const MyListings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active"); // active, drafts, archived
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data
  const { data: hostProfile } = useGetHostProfileQuery();

  const {
    data: propertyListings = [],
    isLoading: isLoading,
    isError: isError,
    error: error,
    refetch,
  } = useGetMyListingsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    skip: !hostProfile
  });

  const [deleteProperty] = useDeletePropertyMutation();
  const [deletingIds, setDeletingIds] = useState(new Set());

  // Helper: check if a property is expired in UTC
  const isPropertyExpired = (p) => {
    return p.listing_expires_at && new Date(p.listing_expires_at).getTime() < Date.now();
  };

  // Process Properties
  const properties = useMemo(() => {
    return (propertyListings || []).map(p => {
      const id = p._id || p.id;
      const status = (p.status || "").toLowerCase();
      const isDeleted = p.is_deleted === true || status === "deleted";
      const isExpired = isPropertyExpired(p);
      
      let calculatedStatus = "active";
      if (isDeleted) calculatedStatus = "deleted";
      else if (isExpired) calculatedStatus = "expired";
      else if (status === "pending") calculatedStatus = "pending";
      else if (status === "draft" || !status) calculatedStatus = "draft";

      return {
        ...p,
        id,
        calculatedStatus,
        isExpired,
        isDeleted,
        type: "space"
      };
    }).filter(p => !p.isDeleted && !deletingIds.has(p.id));
  }, [propertyListings, deletingIds]);

  // Handle deletions
  const handlePropertyDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    setDeletingIds(prev => new Set([...prev, id]));
    try {
      await deleteProperty({ id, reason: "User deleted from dashboard" }).unwrap();
      toast.success("Listing deleted successfully");
    } catch (err) {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error(err?.data?.message || "Failed to delete listing");
    }
  };



  // Filtered lists based on tabs & search
  const filteredListings = useMemo(() => {
    let list = [];
    if (activeTab === "active") {
      list = properties.filter(p => p.calculatedStatus === "active" || p.calculatedStatus === "pending");
    } else if (activeTab === "drafts") {
      list = properties.filter(p => p.calculatedStatus === "draft");
    } else if (activeTab === "archived") {
      list = properties.filter(p => p.calculatedStatus === "expired");
    }

    // Apply Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(item => 
        (item.title || "").toLowerCase().includes(query) || 
        (item.city || "").toLowerCase().includes(query) ||
        (item.property_type || "").toLowerCase().includes(query)
      );
    }

    return list;
  }, [activeTab, properties, searchQuery]);

  // Statistics counters
  const stats = useMemo(() => {
    const activeSpaces = properties.filter(p => p.calculatedStatus === "active" || p.calculatedStatus === "pending").length;
    const draftsCount = properties.filter(p => p.calculatedStatus === "draft").length;
    const archivedCount = properties.filter(p => p.calculatedStatus === "expired").length;

    return {
      activeSpaces,
      draftsCount,
      archivedCount
    };
  }, [properties]);

  // Pagination hook
  const {
    currentItems: paginatedListings,
    currentPage,
    totalPages,
    goToPage
  } = usePagination(filteredListings, 6);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header (Compact, website-style) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Your Hosted Spaces</h2>
          <p className="text-xs text-gray-500 mt-1">Manage your active spaces and draft accommodations.</p>
        </div>
        <button 
          onClick={() => navigate("/host/create")}
          className="bg-[#0A1A2F] hover:bg-blue-600 text-white rounded-xl h-10 px-4 text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Space
        </button>
      </div>

      {/* 2. Filtering and Tabs section */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-5">
        
        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <TabButton label="Active Spaces" active={activeTab === "active"} count={stats.activeSpaces} onClick={() => setActiveTab("active")} />
            <TabButton label="Drafts" active={activeTab === "drafts"} count={stats.draftsCount} onClick={() => setActiveTab("drafts")} />
            <TabButton label="Archived" active={activeTab === "archived"} count={stats.archivedCount} onClick={() => setActiveTab("archived")} />
          </div>
          
          <div className="text-xs font-bold text-gray-400">
            Showing {filteredListings.length} listing{filteredListings.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by title, property type, city..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
          />
        </div>

        {/* Content list */}
        {isError ? (
          <div className="p-8 text-center bg-red-50 border border-red-100 rounded-2xl">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h4 className="font-bold text-red-700">Failed to load listings</h4>
            <p className="text-xs text-red-600/70 mt-1">{error?.message || "Verify your connection and reload."}</p>
            <button onClick={() => refetch()} className="mt-4 bg-red-600 text-white rounded-xl px-4 py-2 text-xs font-bold cursor-pointer">Try Again</button>
          </div>
        ) : isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500 font-medium">Fetching listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Home className="w-8 h-8 text-blue-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Ready to welcome your first guest?</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Start hosting and connect with travelers from around the world.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => navigate("/host/create")}
                className="bg-[#0A1A2F] hover:bg-blue-600 text-white rounded-xl px-5 py-3 text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Create Your First Space
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedListings.map((item) => (
              <ListingItemCard
                key={item.id}
                item={item}
                onDelete={handlePropertyDelete}
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
   Tab Button Helper
-------------------------------- */
const TabButton = ({ label, active, count, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 border cursor-pointer",
      active 
        ? "bg-[#0A1A2F] text-white border-transparent shadow-md"
        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
    )}
  >
    {label}
    <span className={cn("px-1.5 py-0.5 rounded-md text-[9px] font-extrabold", active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500")}>
      {count}
    </span>
  </button>
);

/* -------------------------------
   Airbnb-style Listing Item Card
-------------------------------- */
const ListingItemCard = ({ item, onDelete }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const photos = Array.isArray(item.photos) ? item.photos : [];
  const thumbnail = photos[0] || item.banner_image || item.image || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80";
  const label = item.property_type || "Stay";
  const city = item.city || item.location || "Flexible";

  // Status Configurations
  const getStatus = () => {
    switch (item.calculatedStatus) {
      case "active":
        return { text: "Live", class: "bg-green-500 text-white" };
      case "pending":
        return { text: "Pending", class: "bg-yellow-500 text-white" };
      case "draft":
        return { text: "Draft", class: "bg-blue-500 text-white" };
      case "expired":
        return { text: "Expired", class: "bg-red-500 text-white" };
      default:
        return { text: "Live", class: "bg-green-500 text-white" };
    }
  };

  const statusObj = getStatus();

  return (
    <div className={cn(
      "group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    )}>
      {/* Visual Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-50">
        <img 
          src={thumbnail} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
        />
        
        {/* Status Badge overlayed */}
        <span className={cn("absolute top-3.5 right-3.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-md", statusObj.class)}>
          {statusObj.text}
        </span>

        {/* Property Type Badge overlayed */}
        <span className="absolute top-3.5 left-3.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-lg text-[9px] font-black uppercase tracking-wider text-gray-700 shadow-sm border border-gray-100">
          {label}
        </span>
      </div>

      {/* Details Area */}
      <div className="p-5 flex flex-col flex-1 space-y-3">
        <div className="space-y-1">
          <h3 className="font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors text-base line-clamp-1">
            {item.title || "Untitled Space"}
          </h3>
          <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            {city}
          </p>
        </div>

        {/* Specs line like Airbnb */}
        <p className="text-xs text-gray-500 font-bold tracking-tight">
          {item.guests || 0} Guests · {item.bedrooms || 0} Beds · {item.bathrooms || 0} Baths
        </p>

        {item.calculatedStatus === "active" && item.listing_expires_at && (
          <p className="text-xs text-amber-600 font-semibold flex items-center gap-1.5 bg-amber-50/50 p-2 rounded-xl border border-amber-100/50 w-fit">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {(() => {
                const diffTime = new Date(item.listing_expires_at).getTime() - Date.now();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 0 
                  ? `${diffDays} day${diffDays !== 1 ? 's' : ''} left` 
                  : "Expiring today";
              })()}
            </span>
          </p>
        )}

        {item.calculatedStatus === "expired" && item.listing_expires_at && (
          <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 bg-rose-50/50 p-2 rounded-xl border border-rose-100/50 w-fit">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Expired on {new Date(item.listing_expires_at).toLocaleDateString()}</span>
          </p>
        )}



        {/* Airbnb action links or small visual buttons */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-50 mt-auto">
          <div className="flex gap-2 flex-1">
            <button 
              onClick={() => navigate(`/rooms/${item.id}`)}
              className="flex-1 py-2 text-xs font-extrabold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all text-center cursor-pointer"
            >
              Preview
            </button>
            
            {item.calculatedStatus !== "approved" && (
              <button 
                onClick={() => navigate(`/host/create?edit=${item.id}`)}
                className="flex-1 py-2 text-xs font-extrabold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all text-center cursor-pointer"
              >
                Edit
              </button>
            )}
          </div>

          <div className="flex gap-1.5">
            {/* Delete icon button */}
            <button 
              type="button"
              className="w-8.5 h-8.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all cursor-pointer bg-white"
              disabled={isDeleting}
              onClick={async () => {
                setIsDeleting(true);
                try {
                  await onDelete(item.id);
                } finally {
                  setIsDeleting(false);
                }
              }}
              title="Delete Listing"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
