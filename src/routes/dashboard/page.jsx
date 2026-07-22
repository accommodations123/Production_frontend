import { useMemo, useState } from "react";
import {
  User, Home, MapPin, Plane, Calendar,
  LayoutDashboard, Briefcase, ShoppingBag, Heart,
  CheckCircle2, Mail, Phone, ChevronRight, ShieldCheck, Instagram, Facebook,
  Award, Compass, ShieldAlert, Users
} from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { FaWhatsapp } from "react-icons/fa";
import { MyListings } from "@/features/dashboard/components/MyListings";
import { MyEvents } from "@/features/dashboard/components/MyEvents";
import { PersonalInfo } from "@/features/dashboard/components/PersonalInfo";
import { Trips } from "@/features/dashboard/components/Trips";
import { MyApplications } from "@/features/dashboard/components/MyApplications";
import { MyBuySellListings } from "@/features/marketplace/components/MyBuySellListings";
import { WishlistManager } from "@/features/dashboard/components/WishlistManager";
import { AnimatePresence, motion } from "framer-motion";

import {
  useGetHostProfileQuery,
  useUpdateHostMutation,
  useGetMyListingsQuery,
  useGetMyApplicationsQuery,
  useGetWishlistQuery
} from "@/store/api/hostApi";

import { useDispatch, useSelector } from "react-redux";
import { updateProfile, updateUserLocal } from "@/store/slices/authSlice";
import { useGetMyTripsQuery } from "@/store/api/authApi";
import { useNavigate, useSearchParams } from "react-router-dom";

/* -------------------------------
   Utility: safe merge (NO overwrite)
-------------------------------- */
const mergeDefined = (...sources) =>
  Object.assign(
    {},
    ...sources.map(obj =>
      Object.fromEntries(
        Object.entries(obj || {}).filter(([_, v]) => v !== undefined && v !== null)
      )
    )
  );

export default function NewDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [updateHost] = useUpdateHostMutation();

  const { user: reduxUser } = useSelector((state) => state.auth);
  const [refreshKey] = useState(() => Date.now());

  const activeTab = searchParams.get("tab") || "overview";

  /* -------------------------------
     API Data Queries
  -------------------------------- */
  const {
    data: hostProfile,
    isLoading: hostLoading,
    refetch: refetchHost
  } = useGetHostProfileQuery();

  const { data: tripsData } = useGetMyTripsQuery();

  const { data: propertyListings = [] } = useGetMyListingsQuery(undefined, {
    skip: !hostProfile
  });

  const { data: applicationsData } = useGetMyApplicationsQuery();

  const { data: wishlistData } = useGetWishlistQuery({ type: "property", limit: 1 });

  /* -------------------------------
     FINAL merged user (SAFE)
  -------------------------------- */
  const currentUser = useMemo(() => {
    if (!reduxUser && !hostProfile) return null;

    const merged = mergeDefined(
      hostProfile,
      reduxUser,
      {
        profile_image: hostProfile?.profile_image
          ? `${hostProfile.profile_image}?v=${refreshKey}`
          : reduxUser?.profile_image
      }
    );

    if (merged) {
      merged.firstName = (merged.full_name || merged.name || "User").split(" ")[0];
    }
    return merged;
  }, [reduxUser, hostProfile, refreshKey]);

  /* -------------------------------
     Profile Strength Calculator
  -------------------------------- */
  const completionScore = useMemo(() => {
    if (!currentUser) return 0;
    let score = 0;
    if (currentUser.full_name || currentUser.name) score += 20;
    if (currentUser.email) score += 20;
    if (currentUser.phone) score += 20;
    if (currentUser.country && currentUser.city) score += 20;
    if (currentUser.whatsapp || currentUser.facebook || currentUser.instagram || currentUser.profile_image) score += 20;
    return score;
  }, [currentUser]);

  /* -------------------------------
     Update handler
  -------------------------------- */
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePersonalInfo = async (formData) => {
    setIsUpdating(true);
    try {
      if (hostProfile?.id) {
        const res = await updateHost({ hostId: hostProfile.id, data: formData }).unwrap();
        if (res?.success) {
          refetchHost();
          if (res.data?.user) {
            dispatch(updateUserLocal(res.data.user));
          }
        }
      } else {
        await dispatch(updateProfile(formData)).unwrap();
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (!currentUser && hostLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
          <span className="absolute text-xs font-bold text-gray-500 mt-20">Loading portal...</span>
        </div>
      </div>
    );
  }

  const mobileTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'personal', label: 'Profile Settings', icon: User },
    { id: 'listings', label: 'My Spaces', icon: Home },
    { id: 'events', label: 'My Events', icon: Calendar },
    { id: 'buy-sell', label: 'Marketplace', icon: ShoppingBag },
    { id: 'communities', label: 'My Communities', icon: Users },
    { id: 'applications', label: 'Applications', icon: Briefcase },
    { id: 'trips', label: 'My Trips', icon: MapPin },
    { id: 'wishlist', label: 'Saved Collection', icon: Heart },
  ];

  // SVG circular properties
  const radius = 32;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionScore / 100) * circumference;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FCFAF6] via-[#FFFFFF] to-[#FAF8F5]/35 pb-24 font-sans antialiased text-gray-900">
      
      {/* 1. Large Cover Banner & Profile Area */}
      <div className="w-full relative bg-white border-b border-gray-250/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Cover graphic mesh */}
        <div className="h-44 sm:h-60 bg-gradient-to-br from-[#00162D] via-[#08223C] to-[#12365A] relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2)_0%,transparent_60%)]"></div>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#00162D]/60 to-transparent"></div>
        </div>

        {/* Profile Info Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 -mt-10 sm:-mt-16">
            
            {/* Avatar & Info details */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              {/* Premium double-ring Avatar */}
              <div className="relative group shrink-0 transition-transform duration-300 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden relative z-10">
                  {currentUser?.profile_image && !currentUser.profile_image.includes("ImageOff") ? (
                    <img
                      src={currentUser.profile_image}
                      alt={currentUser?.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#00162D] text-white flex items-center justify-center text-4xl font-black uppercase select-none">
                      {currentUser?.full_name?.[0] || currentUser?.name?.[0] || "U"}
                    </div>
                  )}
                </div>
                {/* Verified icon badge */}
                {hostProfile?.status === "approved" && (
                  <span className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full border-2 border-white shadow-lg flex items-center justify-center z-20" title="Verified Host">
                    <ShieldCheck className="w-4.5 h-4.5 fill-current" />
                  </span>
                )}
              </div>

              {/* Bio Details */}
              <div className="space-y-1 sm:mb-2 z-10 text-slate-800">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white sm:text-gray-900 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] sm:drop-shadow-none">
                  {currentUser?.full_name || currentUser?.name || "User"}
                </h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  {hostProfile?.status === "approved" ? (
                    <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50/80 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-100/50 text-xs font-bold shadow-sm">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      Verified Host
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-gray-700 bg-gray-50/80 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200/50 text-xs font-bold shadow-sm">
                      <User className="w-3.5 h-3.5 text-gray-500" />
                      Member
                    </span>
                  )}
                  {currentUser?.city && (
                    <span className="flex items-center gap-1 text-[#222222] bg-[#FAF6EE] px-3 py-1 rounded-full border border-[#D5CBA8]/30 text-xs font-semibold shadow-xs">
                      <MapPin className="w-3 h-3 text-[#E1392A]" />
                      {currentUser.city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-2.5 sm:mb-2 shrink-0">
              <button
                onClick={() => navigate("/host/create")}
                className="flex items-center gap-1.5 bg-[#00162D] hover:bg-[#CB2A26] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                List a Space
              </button>
              <button
                onClick={() => navigate("/events/host")}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                Plan Event
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Workspace Content Layout (Sidebar Desktop, top scroller Mobile) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT SIDEBAR NAVIGATION (Desktop) */}
          <aside className="w-72 shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4.5 space-y-1.5 shadow-sm sticky top-24">
              <div className="px-3.5 py-2 mb-2 border-b border-slate-100">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Account Console</span>
              </div>
              {mobileTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => navigate(`?tab=${tab.id}`)}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-left hover:translate-x-1 active:scale-[0.98]",
                      isActive
                        ? "bg-[#00162D] text-white shadow-md shadow-[#00162D]/10"
                        : "text-slate-600 hover:text-[#00162D] hover:bg-slate-50"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-[#CB2A26]" : "text-slate-400")} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* MOBILE TABS SCROLLER (Mobile/Tablet) */}
          <div className="lg:hidden overflow-x-auto no-scrollbar pb-2 shrink-0">
            <div className="flex gap-2 min-w-max">
              {mobileTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => navigate(`?tab=${tab.id}`)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-250 cursor-pointer border",
                      isActive
                        ? "bg-[#00162D] text-white border-transparent shadow-md"
                        : "bg-white text-slate-650 border-slate-200 hover:bg-slate-55"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT WORKSPACE DISPLAY PANELS */}
          <section className="flex-1 min-w-0">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 min-h-[520px] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#FCFAF6] rounded-full blur-3xl pointer-events-none -z-10" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  
                  {activeTab === "overview" && (
                    <div className="space-y-8">
                      {/* Grid metrics overview */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                          title="Stays Listed"
                          value={propertyListings?.length || 0}
                          icon={Home}
                          color="from-blue-550 to-indigo-600"
                          onClick={() => navigate("?tab=listings")}
                        />
                        <MetricCard
                          title="Trips Posted"
                          value={tripsData?.trips?.length || 0}
                          icon={Plane}
                          color="from-indigo-550 to-purple-600"
                          onClick={() => navigate("?tab=trips")}
                        />
                        <MetricCard
                          title="Applications"
                          value={applicationsData?.applications?.length || applicationsData?.length || 0}
                          icon={Briefcase}
                          color="from-emerald-550 to-teal-600"
                          onClick={() => navigate("?tab=applications")}
                        />
                        <MetricCard
                          title="Saved Items"
                          value={wishlistData?.total || wishlistData?.wishlist?.length || 0}
                          icon={Heart}
                          color="from-rose-550 to-pink-600"
                          onClick={() => navigate("?tab=wishlist")}
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Welcome message & trip metrics */}
                        <div className="lg:col-span-8 space-y-6">
                          <div className="bg-gradient-to-br from-white to-[#FCFAF6] rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="space-y-1.5 text-center sm:text-left">
                              <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase block">Verified Member Portal</span>
                              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                {getGreeting()}, {currentUser?.firstName || "Traveler"}!
                              </h2>
                              <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
                                Welcome to your expat community portal. Access your verifications, stays, and travel itineraries here.
                              </p>
                            </div>
                            <button
                              onClick={() => navigate("?tab=personal")}
                              className="h-10 px-5 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 font-bold text-xs shadow-xs hover:bg-blue-100 transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                            >
                              Edit Profile Details
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">Upcoming Journey</h3>
                                <p className="text-xs text-[#717171]">Your next travel connection</p>
                              </div>
                              <button onClick={() => navigate("?tab=trips")} className="text-xs font-bold text-[#CB2A26] hover:underline flex items-center gap-1 cursor-pointer">
                                Boarding Details <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {tripsData?.trips?.length > 0 ? (
                              (() => {
                                const nextTrip = tripsData.trips[0];
                                return (
                                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00162D] via-[#08223C] to-[#12365A] p-6 text-white shadow-xl">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                                    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                                    
                                    <div className="flex items-center justify-between relative z-10">
                                      <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-black text-blue-300 tracking-widest block">Departure</span>
                                        <p className="text-xl sm:text-2xl font-black tracking-tight">{nextTrip.from_city || "Departure City"}</p>
                                        <p className="text-xs text-white/60 font-semibold">{nextTrip.from_country}</p>
                                      </div>
                                      
                                      <div className="flex flex-col items-center gap-1 px-4 text-center">
                                        <Plane className="w-6 h-6 text-[#E1392A] rotate-45 animate-pulse" />
                                        <div className="w-20 h-[2px] bg-white/20 relative my-1">
                                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#E1392A] border border-[#0B1528]"></div>
                                        </div>
                                        <span className="text-[10px] text-white/50 font-mono tracking-wider uppercase">{nextTrip.flight_number || "Direct Path"}</span>
                                      </div>
                                      
                                      <div className="text-right space-y-1">
                                        <span className="text-[10px] uppercase font-black text-blue-300 tracking-widest block">Arrival</span>
                                        <p className="text-xl sm:text-2xl font-black tracking-tight">{nextTrip.to_city || "Arrival City"}</p>
                                        <p className="text-xs text-white/60 font-semibold">{nextTrip.to_country}</p>
                                      </div>
                                    </div>

                                    <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-white/70 relative z-10">
                                      <span className="flex items-center gap-2 font-bold bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                                        <Calendar className="w-3.5 h-3.5 text-[#E1392A]" />
                                        {new Date(nextTrip.travel_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                      </span>
                                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#CB2A26] text-white font-black text-[10px] tracking-wider uppercase border border-red-400/20 shadow-md">
                                        CONFIRMED
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="py-14 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center space-y-3">
                                <Compass className="w-10 h-10 text-slate-300" />
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-[#00162D]">No active itineraries</p>
                                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">Planning a relocation flight? Post your trip to discover co-travelers.</p>
                                </div>
                                <button
                                  onClick={() => navigate("?tab=trips")}
                                  className="h-8.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 cursor-pointer shadow-xs"
                                >
                                  Plan Journey Now
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Trust Column */}
                        <div className="lg:col-span-4 space-y-6">
                          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                              <h3 className="font-extrabold text-[#00162D] text-xs">Trust Metrics</h3>
                              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Level 1</span>
                            </div>

                            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex items-center gap-4">
                              <div className="relative shrink-0 flex items-center justify-center">
                                <svg className="w-16 h-16 transform -rotate-90">
                                  <circle cx="32" cy="32" r={radius} className="text-slate-100" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" />
                                  <circle cx="32" cy="32" r={radius} className="text-blue-600 transition-all duration-700 ease-out" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" stroke="currentColor" fill="transparent" />
                                </svg>
                                <span className="absolute text-xs font-black text-[#00162D]">{completionScore}%</span>
                              </div>
                              <div className="space-y-0.5">
                                <p className="font-extrabold text-[#00162D] text-xs">Completeness</p>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                  {completionScore < 100 ? "Add missing info in settings to reach 100%." : "Profile is fully detailed!"}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider ml-1">Verifications</h4>
                              <div className="space-y-2">
                                <VerificationRow label="Email Verified" verified={!!currentUser?.email} icon={Mail} />
                                <VerificationRow label="Phone Verified" verified={!!currentUser?.phone} icon={Phone} />
                                <VerificationRow label="Host Approved" verified={hostProfile?.status === "approved"} icon={ShieldCheck} />
                              </div>
                            </div>

                            <div className="space-y-3 pt-2 border-t border-slate-100">
                              <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider ml-1">Channels</h4>
                              <div className="flex gap-2">
                                <SocialBadge icon={FaWhatsapp} label="WhatsApp" connected={!!currentUser?.whatsapp} activeColor="bg-green-500" />
                                <SocialBadge icon={Mail} label="Gmail" connected={!!currentUser?.email} activeColor="bg-red-500" />
                                <SocialBadge icon={Instagram} label="Instagram" connected={!!currentUser?.instagram} activeColor="bg-pink-500" />
                                <SocialBadge icon={Facebook} label="Facebook" connected={!!currentUser?.facebook} activeColor="bg-blue-600" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "personal" && (
                    <PersonalInfo
                      initialData={currentUser}
                      onUpdate={handleUpdatePersonalInfo}
                      isUpdating={isUpdating}
                      isHost={!!hostProfile?.id}
                    />
                  )}

                  {activeTab === "listings" && <MyListings />}
                  {activeTab === "events" && <MyEvents />}
                  {activeTab === "buy-sell" && <MyBuySellListings />}
                  {activeTab === "trips" && <Trips />}
                  {activeTab === "applications" && <MyApplications />}
                  {activeTab === "wishlist" && <WishlistManager />}

                  {activeTab === "communities" && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h2 className="text-xl font-extrabold text-[#00162D]">My Communities</h2>
                        <p className="text-xs text-slate-500 mt-1">Explore local expat groups and connections.</p>
                      </div>
                      <div className="py-14 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center space-y-3">
                        <Users className="w-10 h-10 text-slate-350" />
                        <div>
                          <p className="text-sm font-bold text-slate-700">No joined groups yet</p>
                          <p className="text-xs text-slate-400 max-w-xs leading-relaxed mt-1">Connect with expat community directories in the People section.</p>
                        </div>
                        <button
                          onClick={() => navigate("/people")}
                          className="h-8.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-750 cursor-pointer shadow-xs transition-all"
                        >
                          Browse People Directory
                        </button>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </section>
          
        </div>
      </div>
    </main>
  );
}

/* -------------------------------
   Helper Widgets & Cards
-------------------------------- */
const MetricCard = ({ title, value, icon: Icon, color, onClick }) => (
  <div 
    onClick={onClick}
    className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#CB2A26]/30 transition-all duration-300 cursor-pointer flex items-center justify-between relative overflow-hidden"
  >
    <div className="space-y-1.5 relative z-10">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight group-hover:scale-105 origin-left transition-transform duration-300">{value}</p>
    </div>
    <div className={cn("w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white relative z-10 shadow-sm group-hover:rotate-6 transition-transform duration-300", color)}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gray-50/20 rounded-full blur-xl pointer-events-none transition-transform duration-500 group-hover:scale-125"></div>
  </div>
);

const VerificationRow = ({ label, verified, icon: Icon }) => (
  <div className="flex items-center justify-between text-xs py-2 px-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl border border-slate-100 transition-colors">
    <div className="flex items-center gap-2 text-[#222222]">
      <Icon className="w-4 h-4 text-[#717171]" />
      <span className="font-semibold text-slate-700">{label}</span>
    </div>
    {verified ? (
      <span className="flex items-center gap-1 text-green-600 font-extrabold text-[10px] bg-green-50/80 px-2 py-0.5 rounded-md border border-green-100/50">
        <CheckCircle2 className="w-3 h-3 fill-green-100" />
        VERIFIED
      </span>
    ) : (
      <span className="flex items-center gap-1 text-amber-600 font-extrabold text-[10px] bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-100/50">
        <ShieldAlert className="w-3 h-3 text-amber-500" />
        PENDING
      </span>
    )}
  </div>
);

const SocialBadge = ({ icon: Icon, label, connected, activeColor }) => (
  <div
    className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 text-white shadow-xs border cursor-pointer hover-lift",
      connected ? `${activeColor} border-transparent` : "bg-gray-50/60 border-gray-200 text-gray-300 hover:bg-gray-100"
    )}
    title={`${connected ? 'Connected' : 'Not Connected'}`}
  >
    <Icon className="w-4.5 h-4.5" />
  </div>
);
