import React, { useState } from 'react';
import { useGetMyTripsQuery, useLazySearchTripsQuery, useTravelMatchActionMutation } from '@/store/api/authApi';
import { useGetHostProfileQuery } from "@/store/api/hostApi";
import {
  Calendar, Clock, Plane, ArrowRight, UserPlus, Check, X,
  Smartphone, Loader2, MapPin, Users, Ticket, AlertCircle,
  ChevronRight, Compass, HelpCircle, ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

const MatchFinder = ({ trip, onClose }) => {
  const [triggerSearch, { data: searchResults, isFetching }] = useLazySearchTripsQuery();
  const [sendAction, { isLoading: isActionLoading }] = useTravelMatchActionMutation();
  const [sentRequests, setSentRequests] = useState(new Set());

  React.useEffect(() => {
    if (trip) {
      triggerSearch({
        from_country: trip.from_country,
        to_country: trip.to_country,
        date: trip.travel_date
      });
    }
  }, [trip, triggerSearch]);

  const handleAction = async (matchedTripId, action) => {
    try {
      const res = await sendAction({
        trip_id: trip.id,
        matched_trip_id: matchedTripId,
        action
      }).unwrap();

      if (res.success) {
        if (action === 'request') {
          setSentRequests(prev => new Set(prev).add(matchedTripId));
        }
      }
    } catch (error) {
      console.error(error);
      alert(error?.data?.message || "Action failed");
    }
  };

  return (
    <div className="mt-6 border-t border-gray-100 pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h4 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-blue-500" />
            Find Travel Partners
          </h4>
          <p className="text-xs text-gray-500">Travelers flying on a similar route or date</p>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-bold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-all"
        >
          Close Matcher
        </button>
      </div>

      {isFetching ? (
        <div className="flex flex-col items-center justify-center p-8 space-y-3">
          <Loader2 className="animate-spin text-blue-600 w-7 h-7" />
          <p className="text-xs text-gray-500 font-semibold">Searching for companions...</p>
        </div>
      ) : searchResults?.results?.length > 0 ? (
        <div className="space-y-3">
          {searchResults.results
            .filter(t => t.id !== trip.id) // Exclude self
            .map(match => (
              <div key={match.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all bg-gray-50/50 group">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md">
                    {match.host?.full_name?.[0] || "T"}
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                      {match.host?.full_name || "Traveler"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span className="font-bold">{match.airline || "Airline"}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>Flight {match.flight_number || "TBD"}</span>
                    </div>
                  </div>
                </div>

                {sentRequests.has(match.id) ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold">
                    <Check className="w-3.5 h-3.5" />
                    Requested
                  </span>
                ) : (
                  <button
                    onClick={() => handleAction(match.id, 'request')}
                    disabled={isActionLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0A1A2F] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Connect
                  </button>
                )}
              </div>
            ))}
          {searchResults.results.filter(t => t.id !== trip.id).length === 0 && (
            <div className="text-center py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-bold text-xs">No matching travelers found right now.</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Check back closer to your travel date.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2.5 text-gray-400">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-gray-600 font-bold text-xs">No companion matches found for this route.</p>
        </div>
      )}
    </div>
  );
};

export const Trips = () => {
  const { data, isLoading, isError } = useGetMyTripsQuery();
  const { data: hostProfile } = useGetHostProfileQuery();
  const [sendAction] = useTravelMatchActionMutation();
  const navigate = useNavigate();
  const [activeMatchTrip, setActiveMatchTrip] = useState(null);

  const handlePlanTrip = () => {
    if (!hostProfile || (!hostProfile.id && !hostProfile._id)) {
      navigate('/hosts', { replace: true });
      return;
    }
    // Redirect or prompt
    toast.info("Navigate to Travel Planner to create a new trip.");
  };

  const tripList = data?.trips || [];

  // Categorize request matches
  const incomingRequests = [];
  const sentRequests = [];

  tripList.forEach(trip => {
    (trip.matches || []).forEach(match => {
      if (match.status === 'pending' || match.status === 'requested') {
        if (match.matched_trip_id == trip.id) {
          incomingRequests.push({ ...match, tripDetails: trip });
        } else if (match.trip_id == trip.id) {
          sentRequests.push({ ...match, tripDetails: trip });
        }
      }
    });
  });

  const handleRequestAction = async (match, action) => {
    try {
      const res = await sendAction({
        trip_id: match.trip_id,
        matched_trip_id: match.matched_trip_id,
        action
      }).unwrap();

      if (res.success) {
        const msgMap = {
          accept: 'Request accepted!',
          reject: 'Request declined.',
          cancel: 'Connection request cancelled.'
        };
        toast.success(msgMap[action] || 'Action completed');
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || `Failed to perform action`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-16">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-sm text-gray-500 font-medium animate-pulse">Loading your journeys...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-100 rounded-3xl max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3 animate-bounce" />
        <h4 className="font-extrabold text-red-700">Failed to load trips</h4>
        <p className="text-xs text-red-600/70 mt-1">Please try reloading the page to fetch itineraries.</p>
        <Button onClick={() => window.location.reload()} className="mt-4 bg-red-600 text-white rounded-xl">Reload Page</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Visual Header Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-full blur-3xl -z-10"></div>
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase block">Your Adventures ✈️</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Your Journeys</h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg leading-relaxed">
            Manage your trips, view travel itineraries, and connect with verified travel companions.
          </p>
        </div>
        <button
          onClick={handlePlanTrip}
          className="bg-[#0A1A2F] hover:bg-blue-600 text-white rounded-xl h-11 px-5 text-sm font-semibold shadow-md transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Ticket className="w-4 h-4" />
          Plan New Trip
        </button>
      </div>

      {/* Travel Matches Pending Area */}
      {(incomingRequests.length > 0 || sentRequests.length > 0) && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Incoming Connections */}
          {incomingRequests.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider pl-1">Incoming Travel Requests</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {incomingRequests.map(match => (
                  <div key={match.id} className="bg-white p-4.5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-base shadow-sm">
                        {(match.sender_host?.full_name?.[0] || match.user?.full_name?.[0] || "T")}
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-900 text-sm">{match.sender_host?.full_name || match.user?.full_name || "Traveler"}</p>
                        <p className="text-[10px] text-gray-400">Wants to match on trip to {match.tripDetails?.to_city}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleRequestAction(match, 'accept')}
                        className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-all border border-green-200"
                        title="Accept"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleRequestAction(match, 'reject')}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all border border-red-200"
                        title="Decline"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sent Connections */}
          {sentRequests.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider pl-1">Sent Requests Waiting</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {sentRequests.map(match => (
                  <div key={match.id} className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400 text-base">
                        {(match.receiver_host?.full_name?.[0] || match.host?.full_name?.[0] || "C")}
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 text-sm">{match.receiver_host?.full_name || match.host?.full_name || "Traveler"}</p>
                        <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                          <Clock size={11} /> Pending host approval
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRequestAction(match, 'cancel')}
                      className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-1.5"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Itinerary Grid List */}
      <div className="space-y-6">
        {tripList.length === 0 ? (
          /* Empty state for trips */
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 max-w-xl mx-auto">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Plane className="w-9 h-9 text-emerald-500 rotate-45" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Plan Your Next Trip</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                Connect with travel partners, match flight details, and share your upcoming travel itineraries.
              </p>
            </div>
            <Button
              onClick={handlePlanTrip}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 h-11 font-semibold transition-all shadow-sm"
            >
              Post a Trip
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tripList.map((trip) => {
              const isMatchActive = activeMatchTrip === trip.id;

              return (
                <div key={trip.id} className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 space-y-6">

                  {/* Visual Boarding pass/itinerary row */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    {/* Visual route graphic */}
                    <div className="flex-1 w-full flex items-center justify-between md:justify-start gap-4 sm:gap-8">
                      {/* From */}
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Origin</span>
                        <h3 className="text-xl font-black text-gray-900 mt-0.5">{trip.from_city}</h3>
                        <p className="text-xs text-gray-500 font-medium">{trip.from_country}</p>
                      </div>

                      {/* Route Line graphic */}
                      <div className="flex-1 max-w-[200px] flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 font-mono">
                          <span>{trip.airline}</span>
                          <span className="text-gray-300">•</span>
                          <span>{trip.flight_number}</span>
                        </div>

                        <div className="w-full h-[2px] bg-gray-200 relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                            <Plane className="w-4 h-4 text-blue-600 rotate-45" />
                          </div>
                        </div>

                        <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mt-1">Flight Itinerary</span>
                      </div>

                      {/* To */}
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destination</span>
                        <h3 className="text-xl font-black text-gray-900 mt-0.5">{trip.to_city}</h3>
                        <p className="text-xs text-gray-500 font-medium">{trip.to_country}</p>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                      {/* Calendar info */}
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-2xl">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-extrabold text-gray-700">
                          {new Date(trip.travel_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Find Companion Button */}
                      {trip.status === "active" && (
                        <button
                          onClick={() => setActiveMatchTrip(isMatchActive ? null : trip.id)}
                          className={cn(
                            "px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 shadow-sm",
                            isMatchActive
                              ? "bg-gray-100 text-gray-700 border-transparent"
                              : "bg-[#0A1A2F] text-white border-transparent hover:bg-blue-600"
                          )}
                        >
                          {isMatchActive ? <X className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                          {isMatchActive ? "Close Search" : "Find Partner"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Match Finder Sub-drawer */}
                  {isMatchActive && (
                    <MatchFinder trip={trip} onClose={() => setActiveMatchTrip(null)} />
                  )}

                  {/* Confirmed Travel Partners */}
                  {trip.matches?.length > 0 && (
                    (() => {
                      const confirmed = trip.matches.filter(m => m.status === 'accepted');
                      if (confirmed.length === 0) return null;
                      return (
                        <div className="pt-5 border-t border-dashed border-gray-100 space-y-3.5 animate-in fade-in duration-300">
                          <h4 className="text-[10px] font-extrabold text-green-600 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                            <ShieldCheck className="w-4 h-4" />
                            Confirmed Travel Partners
                          </h4>
                          <div className="grid gap-4 md:grid-cols-2">
                            {confirmed.map(match => (
                              <div key={match.id} className="flex items-center justify-between p-3.5 bg-green-50/40 rounded-2xl border border-green-100">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-sm">
                                    {match.user?.full_name?.[0] || "P"}
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-gray-900 text-sm">{match.user?.full_name || "Partner"}</p>
                                    <p className="text-[10px] text-green-700 font-semibold flex items-center gap-1 mt-0.5">
                                      <Smartphone size={11} /> Contact info shared
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRequestAction(match, 'cancel')}
                                  className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-500 text-xs font-bold border border-red-100 rounded-xl transition-all shadow-sm"
                                >
                                  Cancel Connection
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
