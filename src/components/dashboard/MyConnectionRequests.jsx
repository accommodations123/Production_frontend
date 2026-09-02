import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  MessageSquare, Check, X, Mail, Phone, Clock, Home, ShoppingBag, Plane, Calendar,
  User, Copy, CheckCheck, MessageCircle, ShieldCheck, Search
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  useGetIncomingRequestsQuery,
  useUpdateRequestStatusMutation
} from "@/hooks/data/useConnectionHooks";

const CATEGORY_CONFIG = {
  accommodations: { label: "Accommodation", icon: Home, emoji: "🏠", color: "bg-blue-50 text-blue-700 border-blue-200" },
  property: { label: "Accommodation", icon: Home, emoji: "🏠", color: "bg-blue-50 text-blue-700 border-blue-200" },
  buysell: { label: "Buy/Sell", icon: ShoppingBag, emoji: "🛍", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  travel: { label: "Travel Partner", icon: Plane, emoji: "✈️", color: "bg-sky-50 text-sky-700 border-sky-200" },
  trip: { label: "Travel Partner", icon: Plane, emoji: "✈️", color: "bg-sky-50 text-sky-700 border-sky-200" },
  events: { label: "Event", icon: Calendar, emoji: "🎉", color: "bg-purple-50 text-purple-700 border-purple-200" },
  event: { label: "Event", icon: Calendar, emoji: "🎉", color: "bg-purple-50 text-purple-700 border-purple-200" },
  people: { label: "People", icon: User, emoji: "👤", color: "bg-indigo-50 text-indigo-700 border-indigo-200" }
};

const AVATAR_GRADIENTS = [
  "from-rose-500 to-red-600 text-white",
  "from-indigo-500 to-blue-600 text-white",
  "from-emerald-500 to-teal-600 text-white",
  "from-amber-500 to-orange-600 text-white",
  "from-purple-500 to-violet-600 text-white",
  "from-sky-500 to-cyan-600 text-white",
  "from-fuchsia-500 to-pink-600 text-white"
];

function getAvatarGradient(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function resolveRequesterName(req) {
  const raw = (req?.requesterName || req?.requester_name || "").trim();
  const isGeneric = !raw || /^(community\s*member|user\d*|member|guest|null|undefined)$/i.test(raw);
  if (!isGeneric) return raw;

  const email = (req?.requesterEmail || req?.requester_email || "").trim();
  if (email && email.includes("@")) {
    const handle = email.split("@")[0];
    const parts = handle.replace(/[^a-zA-Z]+/g, " ").trim().split(/\s+/).filter(Boolean);
    if (parts.length > 0) {
      return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
    }
  }

  return "Verified Member";
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return name.charAt(0).toUpperCase() || "M";
}

function formatTimeAgo(dateString) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  return date.toLocaleDateString();
}

export function MyConnectionRequests() {
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'pending' | 'accepted' | 'declined'
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);

  const { data: serverResponse, isLoading, isFetching } = useGetIncomingRequestsQuery({ page, limit: 10 });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateRequestStatusMutation();

  const requestsList = Array.isArray(serverResponse?.data)
    ? serverResponse.data
    : Array.isArray(serverResponse)
      ? serverResponse
      : [];

  const totalPages = serverResponse?.totalPages || 1;
  const totalCount = serverResponse?.count ?? requestsList.length;

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied "${text}" to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAcceptRequest = async (requestId, requesterName) => {
    try {
      await updateStatus({ requestId, status: "accepted" }).unwrap();
      toast.success(
        `✓ Connected with ${requesterName || "member"}! Contact channels are now unlocked.`
      );
    } catch (err) {
      toast.error(err?.data?.message || "Failed to accept connection request.");
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await updateStatus({ requestId, status: "declined" }).unwrap();
      toast.info("Connection request declined.");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to decline request.");
    }
  };

  const pendingCount = requestsList.filter((r) => r.status === "pending").length;
  const acceptedCount = requestsList.filter((r) => r.status === "accepted").length;
  const declinedCount = requestsList.filter((r) => r.status === "declined" || r.status === "rejected").length;

  const filteredRequests = useMemo(() => {
    return requestsList.filter((req) => {
      // Filter by tab
      if (activeFilter === "pending" && req.status !== "pending") return false;
      if (activeFilter === "accepted" && req.status !== "accepted") return false;
      if (activeFilter === "declined" && req.status !== "declined" && req.status !== "rejected") return false;

      // Filter by search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const name = resolveRequesterName(req).toLowerCase();
        const item = (req.itemTitle || "").toLowerCase();
        const email = (req.requesterEmail || "").toLowerCase();
        const phone = (req.requesterPhone || "").toLowerCase();
        return name.includes(query) || item.includes(query) || email.includes(query) || phone.includes(query);
      }

      return true;
    });
  }, [requestsList, activeFilter, searchQuery]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#E1392A]" /> Incoming Connection Requests
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Review and differentiate requests from members who want to connect with you regarding your listings and trips.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="text-xs font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full w-fit shrink-0 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {pendingCount} Pending Approval
            </span>
          )}
          {acceptedCount > 0 && (
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full w-fit shrink-0 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {acceptedCount} Connected
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All ({requestsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("pending")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === "pending"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("accepted")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === "accepted"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Connected ({acceptedCount})
          </button>
          {declinedCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter("declined")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === "declined"
                  ? "bg-slate-700 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Declined ({declinedCount})
            </button>
          )}
        </div>

        {requestsList.length > 2 && (
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, listing, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="py-12 text-center text-xs font-bold text-slate-400 flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-[#E1392A] rounded-full animate-spin" />
          Loading connection requests...
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const catConfig = CATEGORY_CONFIG[req.itemType] || CATEGORY_CONFIG.accommodations;
            const requesterName = resolveRequesterName(req);
            const initials = getInitials(requesterName);
            const avatarGradient = getAvatarGradient(req.requesterId || req.requester_id || req.requesterEmail || requesterName);
            const reqId = req.id || req._id;

            // Clean phone for WhatsApp URL
            const cleanPhone = (req.requesterPhone || "").replace(/[^0-9]/g, "");

            return (
              <div
                key={reqId}
                className={`bg-white border rounded-2xl p-5 transition-all shadow-xs hover:shadow-md ${
                  req.status === "pending"
                    ? "border-amber-200/80 ring-1 ring-amber-100"
                    : req.status === "accepted"
                    ? "border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/20"
                    : "border-slate-200 opacity-75"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Distinct Avatar */}
                    <div
                      className={`w-13 h-13 rounded-2xl bg-gradient-to-tr ${avatarGradient} font-black text-base flex items-center justify-center shrink-0 overflow-hidden shadow-xs ring-2 ring-white`}
                    >
                      {req.requesterAvatar ? (
                        <img
                          src={req.requesterAvatar}
                          alt={requesterName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>

                    {/* Member & Context Information */}
                    <div className="min-w-0 space-y-1.5 flex-1">
                      {/* Name & Status Row */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="font-black text-slate-900 text-base truncate flex items-center gap-1.5">
                          {requesterName}
                        </h4>

                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            req.status === "accepted"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : req.status === "declined" || req.status === "rejected"
                              ? "bg-slate-200 text-slate-600 border-slate-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                          }`}
                        >
                          {req.status === "accepted"
                            ? "✓ Connected"
                            : req.status === "declined" || req.status === "rejected"
                            ? "Declined"
                            : "Pending Approval"}
                        </span>
                      </div>

                      {/* Requester Headline / Location if available */}
                      {(req.requesterHeadline || req.requesterLocation) && (
                        <p className="text-xs text-slate-500 font-medium truncate">
                          {[req.requesterHeadline, req.requesterLocation].filter(Boolean).join(" • ")}
                        </p>
                      )}

                      {/* What they are connecting regarding */}
                      <div className="space-y-0.5 pt-0.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Wants to connect regarding:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-extrabold text-slate-900 text-sm leading-snug">
                            "{req.itemTitle || "Listing"}"
                          </h5>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold ${catConfig.color}`}
                          >
                            <span>{catConfig.emoji}</span>
                            <span>{catConfig.label}</span>
                          </span>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 pt-0.5">
                        <span className="text-[11px] font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {req.status === "accepted"
                            ? `Connected ${formatTimeAgo(req.updated_at || req.created_at)}`
                            : `Requested ${formatTimeAgo(req.created_at)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Pending Requests */}
                  {req.status === "pending" && (
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleAcceptRequest(reqId, requesterName)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-9 px-4 rounded-xl cursor-pointer shadow-xs flex-1 sm:flex-initial"
                      >
                        <Check className="w-4 h-4 mr-1" /> Accept & Share
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() => handleDeclineRequest(reqId)}
                        className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs h-9 px-3 rounded-xl cursor-pointer flex-1 sm:flex-initial"
                      >
                        <X className="w-4 h-4 mr-1 text-slate-400" /> Decline
                      </Button>
                    </div>
                  )}
                </div>

                {/* Unlocked Contact Details for Accepted Requests */}
                {req.status === "accepted" && (req.requesterEmail || req.requesterPhone) && (
                  <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/60 rounded-xl p-3 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Unlocked Direct Contact Details:
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {req.requesterEmail && (
                        <div className="inline-flex items-center rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold overflow-hidden shadow-2xs">
                          <a
                            href={`mailto:${req.requesterEmail}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-blue-100 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-blue-600" /> {req.requesterEmail}
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopy(req.requesterEmail, `email_${reqId}`)}
                            title="Copy email"
                            className="px-2 py-1.5 border-l border-blue-200 hover:bg-blue-200/60 text-blue-700 cursor-pointer transition-colors"
                          >
                            {copiedKey === `email_${reqId}` ? (
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {req.requesterPhone && (
                        <div className="inline-flex items-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold overflow-hidden shadow-2xs">
                          <a
                            href={`tel:${req.requesterPhone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-emerald-100 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" /> {req.requesterPhone}
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopy(req.requesterPhone, `phone_${reqId}`)}
                            title="Copy phone"
                            className="px-2 py-1.5 border-l border-emerald-200 hover:bg-emerald-200/60 text-emerald-700 cursor-pointer transition-colors"
                          >
                            {copiedKey === `phone_${reqId}` ? (
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075E54] text-xs font-bold border border-[#25D366]/30 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" /> Chat on WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-8 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="font-extrabold text-slate-800 text-sm">
            {activeFilter === "all"
              ? "No connection requests found"
              : `No ${activeFilter} connection requests`}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When members send connection requests for your accommodations, marketplace items, travel trips, or events, they will appear here.
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-600">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="h-8 px-3.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
          >
            ← Previous
          </Button>

          <span className="text-slate-500 font-bold">
            Page <span className="text-slate-900">{page}</span> of <span className="text-slate-900">{totalPages}</span> ({totalCount} total)
          </span>

          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="h-8 px-3.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}

