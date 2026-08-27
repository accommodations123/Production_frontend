import React from "react";
import { toast } from "sonner";
import {
  MessageSquare, Check, X, Mail, Phone, Clock, Home, ShoppingBag, Plane, Calendar, User
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  useGetIncomingRequestsQuery,
  useUpdateRequestStatusMutation
} from "@/store/api/connectionApi";

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

function formatTimeAgo(dateString) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  return date.toLocaleDateString();
}

export function MyConnectionRequests() {
  const [page, setPage] = React.useState(1);
  const { data: serverResponse, isLoading, isFetching } = useGetIncomingRequestsQuery({ page, limit: 5 });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateRequestStatusMutation();

  const requestsList = Array.isArray(serverResponse?.data)
    ? serverResponse.data
    : Array.isArray(serverResponse)
      ? serverResponse
      : [];

  const totalPages = serverResponse?.totalPages || 1;
  const totalCount = serverResponse?.count ?? requestsList.length;

  const handleAcceptRequest = async (requestId, requesterName) => {
    try {
      await updateStatus({ requestId, status: "accepted" }).unwrap();
      toast.success(
        `✓ Accepted connection request${requesterName ? ` from ${requesterName}` : ""}! Direct contact details are now unlocked.`
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

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#E1392A]" /> Incoming Connection Requests
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Review requests from members who want to connect with you. Accept a request to share your available contact and social details.
          </p>
        </div>

        <span className="text-xs font-extrabold text-[#E1392A] bg-red-50 border border-red-200 px-3 py-1 rounded-full w-fit shrink-0">
          {pendingCount} Pending
        </span>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs font-bold text-slate-400">
          Loading connection requests...
        </div>
      ) : requestsList.length > 0 ? (
        <div className="space-y-4">
          {requestsList.map((req) => {
            const catConfig = CATEGORY_CONFIG[req.itemType] || CATEGORY_CONFIG.accommodations;
            const rawName = (req.requesterName || "").trim();
            const isGenericName = !rawName || /^user(\s*\d*)?$/i.test(rawName);
            const requesterName = isGenericName ? "" : rawName;

            return (
              <div
                key={req.id || req._id}
                className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:bg-slate-50 hover:shadow-xs"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-[#00142E] text-white font-black text-base flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                    {req.requesterAvatar ? (
                      <img src={req.requesterAvatar} alt="" className="w-full h-full object-cover" />
                    ) : requesterName ? (
                      requesterName.charAt(0).toUpperCase()
                    ) : (
                      <User className="w-5 h-5 text-slate-300" />
                    )}
                  </div>

                  {/* Context Info */}
                  <div className="min-w-0 space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {requesterName && (
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                          {requesterName}
                        </h4>
                      )}
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          req.status === "accepted"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : req.status === "declined"
                            ? "bg-slate-200 text-slate-600"
                            : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}
                      >
                        {req.status === "accepted" ? "✓ Accepted" : req.status === "declined" ? "Declined" : "Pending"}
                      </span>
                    </div>

                    {/* Context Headline */}
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-500">Wants to connect regarding:</p>
                      <h5 className="font-black text-slate-900 text-sm sm:text-base leading-snug">
                        "{req.itemTitle || "Listing"}"
                      </h5>
                    </div>

                    {/* Meta row: Category Badge & Timestamp */}
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600 flex-wrap pt-0.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${catConfig.color}`}>
                        <span>{catConfig.emoji}</span>
                        <span>{catConfig.label}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {req.status === "accepted"
                          ? `Connected ${formatTimeAgo(req.updated_at || req.created_at)}`
                          : `Requested ${formatTimeAgo(req.created_at)}`}
                      </span>
                    </div>

                    {/* Unlocked Contact Details (ONLY shown when status === "accepted") */}
                    {req.status === "accepted" && (req.requesterEmail || req.requesterPhone) && (
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        {req.requesterEmail && (
                          <a
                            href={`mailto:${req.requesterEmail}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" /> {req.requesterEmail}
                          </a>
                        )}
                        {req.requesterPhone && (
                          <a
                            href={`tel:${req.requesterPhone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" /> {req.requesterPhone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                  {req.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleAcceptRequest(req.id || req._id, requesterName)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-9 px-4 rounded-xl cursor-pointer shadow-xs flex-1 sm:flex-initial"
                      >
                        <Check className="w-4 h-4 mr-1" /> Accept Request
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() => handleDeclineRequest(req.id || req._id)}
                        className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs h-9 px-3 rounded-xl cursor-pointer flex-1 sm:flex-initial"
                      >
                        <X className="w-4 h-4 mr-1 text-slate-400" /> Decline
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-8 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="font-extrabold text-slate-800 text-sm">No pending connection requests</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When users click "Send Connection Request" on your listings, their requests will appear here for you to accept.
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
