"use client";

import { useMemo, useState } from "react";
import {
  User, Home, MapPin, Plane, Building2, Calendar,
  LayoutDashboard, Briefcase, ShoppingBag, Users, Heart, Sparkles,
  CheckCircle2, Mail, Phone, ChevronRight, MessageSquare, ShieldCheck, Instagram, Facebook
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";
import { FaWhatsapp } from "react-icons/fa";
import { ProfileCard } from "@/components/account-v2/ProfileCard";
import { InfoCard } from "@/components/account-v2/InfoCard";
import { MyListings } from "@/components/dashboard/MyListings";
import { MyEvents } from "@/components/dashboard/MyEvents";
import { PersonalInfo } from "@/components/dashboard/PersonalInfo";
import { Trips } from "@/components/dashboard/Trips";
import { MyApplications } from "@/components/dashboard/MyApplications";
import { MyBuySellListings } from "@/components/marketplace/MyBuySellListings";
import { WishlistManager } from "@/components/dashboard/WishlistManager";
import { MyPeopleProfile } from "@/components/dashboard/MyPeopleProfile";
import { MyConnectionRequests } from "@/components/dashboard/MyConnectionRequests";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { AdminNotificationCenter } from "@/components/admin/AdminNotificationCenter";
import { Bell } from "lucide-react";

import {
  useGetHostProfileQuery,
  useUpdateHostMutation
} from "@/hooks/data/useHostHooks";
import { useGetMyListingsQuery } from "@/hooks/data/usePropertyHooks";
import { useGetMyEventsQuery } from "@/hooks/data/useEventHooks";

import { useDispatch, useSelector } from "react-redux";
import { updateProfile, updateUserLocal } from "@/store/slices/authSlice";
import { useGetMyTripsQuery } from "@/hooks/data/useTravelHooks";
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
     Host profile (NO SKIP)
  -------------------------------- */
  const {
    data: hostProfile,
    isLoading: hostLoading,
    refetch: refetchHost
  } = useGetHostProfileQuery();

  /* -------------------------------
     Other dashboard data
  -------------------------------- */
  const { data: listings } = useGetMyListingsQuery();
  const { data: events } = useGetMyEventsQuery();
  const { data: tripsData } = useGetMyTripsQuery();

  const propertiesCount = useMemo(() => {
    if (Array.isArray(listings)) return listings.length;
    if (Array.isArray(listings?.properties)) return listings.properties.length;
    if (Array.isArray(listings?.data?.properties)) return listings.data.properties.length;
    if (Array.isArray(listings?.data)) return listings.data.length;
    return 0;
  }, [listings]);

  const eventsCount = useMemo(() => {
    if (Array.isArray(events)) return events.length;
    if (Array.isArray(events?.events)) return events.events.length;
    if (Array.isArray(events?.data?.events)) return events.data.events.length;
    if (Array.isArray(events?.data)) return events.data.length;
    return 0;
  }, [events]);

  const tripsCount = tripsData?.trips?.length || (Array.isArray(tripsData) ? tripsData.length : 0);

  /* -------------------------------
     FINAL merged user (SAFE)
  -------------------------------- */
  const currentUser = useMemo(() => {
    if (!reduxUser && !hostProfile) return null;

    const merged = mergeDefined(
      reduxUser,
      hostProfile,
      {
        profile_image: hostProfile?.profile_image
          ? `${hostProfile.profile_image}?v=${refreshKey}`
          : reduxUser?.profile_image
      }
    );

    if (merged) {
      // Calculate first initial or name consistently
      merged.firstName = (merged.full_name || merged.name || "User").split(" ")[0];
    }
    return merged;
  }, [reduxUser, hostProfile, refreshKey]);



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


  if (!currentUser && hostLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  /* -------------------------------
     RENDER
  -------------------------------- */
  /* Mobile tab items for horizontal scroll bar */
  const isAdminUser = Boolean(
    reduxUser?.role === 'admin' ||
    reduxUser?.role === 'super_admin' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'super_admin'
  );

  const mobileTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(isAdminUser ? [{ id: 'admin-notifications', label: 'Admin Alerts', icon: ShieldCheck }] : []),
    { id: 'personal', label: 'Profile', icon: User },
    { id: 'listings', label: 'Listings', icon: Home },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'buy-sell', label: 'Marketplace', icon: ShoppingBag },
    { id: 'applications', label: 'Applications', icon: Briefcase },
    { id: 'trips', label: 'Trips', icon: MapPin },
    { id: 'people', label: 'People', icon: User },
    { id: 'requests', label: 'Connection Requests', icon: MessageSquare },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  const isHostVerified = Boolean(
    hostProfile?.status === "approved" ||
    hostProfile?.is_approved === true ||
    hostProfile?.role === "host" ||
    hostProfile?.role === "expert" ||
    reduxUser?.role === "host" ||
    reduxUser?.role === "expert" ||
    currentUser?.role === "host" ||
    currentUser?.role === "expert" ||
    currentUser?.status === "approved" ||
    currentUser?.is_approved === true
  );



  return (
    <main className="min-h-screen bg-[#F8F9FB] pb-16">
      <Navbar />

      {/* 1. Large Cover Banner & Top Profile Section */}
      <div className="w-full relative bg-white border-b border-gray-200/50">
        {/* Cover visual overlay */}
        <div className="h-40 sm:h-56 bg-[#0F223A] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]"></div>
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Profile Card Container */}
        <div className="container mx-auto px-4 pb-6 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">

            {/* Left side: Avatar + Identity details */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              {/* Avatar frame (negative margin to float up) */}
              <div className="relative group shrink-0 -mt-16 sm:-mt-20">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden relative">
                  {currentUser?.profile_image && !currentUser.profile_image.includes("ImageOff") ? (
                    <img
                      src={currentUser.profile_image}
                      alt={currentUser?.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0F223A] to-[#1E3A5F] text-white flex items-center justify-center text-4xl font-extrabold uppercase select-none">
                      {currentUser?.full_name?.[0] || currentUser?.name?.[0] || "U"}
                    </div>
                  )}
                </div>
                {/* Verified icon badge */}
                {isHostVerified && (
                  <span className="absolute bottom-1 right-1 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-md flex items-center justify-center" title="Verified Host">
                    <ShieldCheck className="w-4 h-4 fill-current" />
                  </span>
                )}
              </div>

              {/* Bio Details */}
              <div className="space-y-1 sm:mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {currentUser?.full_name || currentUser?.name || "User"}
                </h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-xs text-gray-500 font-semibold">
                  {isHostVerified ? (
                    <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                      <ShieldCheck className="w-3.5 h-3.5 fill-blue-100" />
                      Verified Host
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      Member
                    </span>
                  )}

                </div>
              </div>
            </div>

            {/* Right side: Quick Action Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-2.5 sm:mb-2 shrink-0">
              <button
                onClick={() => navigate("/host/create")}
                className="flex items-center gap-1.5 bg-[#0A1A2F] hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Create Space
              </button>
              <button
                onClick={() => navigate("/events/host")}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                Plan Event
              </button>
              <button
                onClick={() => navigate("?tab=trips")}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Plane className="w-3.5 h-3.5" />
                Post Trip
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Unified Navigation Pills */}
      <div className="border-b border-gray-200/50 bg-white sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 py-4 min-w-max">
            {mobileTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(`?tab=${tab.id}`)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${isActive
                    ? 'bg-[#0A1A2F] text-white shadow-md shadow-[#0A1A2F]/15'
                    : 'bg-white text-gray-500 border border-gray-200/60 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Main Content Rendering Container */}
      <div className="container mx-auto px-4 mt-8">
        <div className="max-w-7xl mx-auto">

          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Main Content & Trust Column split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Recent Activities & Previews */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Upcoming Journey / Trip Boarding Pass preview */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Upcoming Journey</h3>
                        <p className="text-xs text-gray-500">Your next adventure details</p>
                      </div>
                      <button onClick={() => navigate("?tab=trips")} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
                        View details <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {tripsData?.trips?.length > 0 ? (
                      (() => {
                        const nextTrip = tripsData.trips[0];
                        return (
                          <div className="bg-gradient-to-br from-[#0F2137] to-[#1D324D] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Departure</span>
                                <p className="text-xl font-extrabold">{nextTrip.from_city || "Departure City"}</p>
                                <p className="text-xs text-white/60">{nextTrip.from_country}</p>
                              </div>
                              <div className="flex flex-col items-center gap-1.5 px-4 text-center">
                                <Plane className="w-5 h-5 text-accent rotate-45 animate-pulse" />
                                <div className="w-16 h-[2px] bg-white/20 relative">
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent"></div>
                                </div>
                                <span className="text-[10px] text-white/50 font-mono">{nextTrip.flight_number || "Direct"}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Arrival</span>
                                <p className="text-xl font-extrabold">{nextTrip.to_city || "Arrival City"}</p>
                                <p className="text-xs text-white/60">{nextTrip.to_country}</p>
                              </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-accent" />
                                {new Date(nextTrip.travel_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white font-extrabold text-[10px]">
                                CONFIRMED
                              </span>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="py-12 text-center text-gray-400 text-xs font-semibold">
                        No upcoming trips planned.
                      </div>
                    )}
                  </div>


                </div>

                {/* Right Column: Profile Trust Indicators & Completion */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
                    <h3 className="font-bold text-gray-900">Trust Profile</h3>

                    {/* Photo upload component inline */}
                    <ProfileCard
                      user={currentUser}
                      onUpdate={handleUpdatePersonalInfo}
                      isLoading={isUpdating}
                    />



                    {/* Trust Indicators */}
                    <div className="space-y-3 border-t border-gray-50 pt-4">
                      <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Verifications</h4>

                      <VerificationRow label="Email Address Verified" verified={!!currentUser?.email} icon={Mail} />
                      <VerificationRow label="Phone Number Verified" verified={!!currentUser?.phone} icon={Phone} />
                      <VerificationRow label="Host Profile Approved" verified={isHostVerified} icon={ShieldCheck} />
                    </div>

                    {/* Connected Socials widget */}
                    <div className="border-t border-gray-50 pt-4">
                      <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5">Connected Channels</h4>
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
              isHost={isHostVerified}
            />
          )}

          {activeTab === "notifications" && <NotificationCenter />}
          {activeTab === "admin-notifications" && <AdminNotificationCenter />}

          {activeTab === "listings" && <MyListings />}
          {activeTab === "events" && <MyEvents />}
          {activeTab === "buy-sell" && <MyBuySellListings />}
          {activeTab === "trips" && <Trips />}
          {activeTab === "applications" && <MyApplications />}
          {activeTab === "people" && <MyPeopleProfile />}
          {activeTab === "requests" && <MyConnectionRequests />}
          {activeTab === "wishlist" && <WishlistManager />}

        </div>
      </div>
    </main>
  );
}

/* -------------------------------
   Helper Widgets & Cards
-------------------------------- */
const QuickActionCard = ({ title, desc, icon: Icon, action, gradient, iconColor }) => (
  <button
    onClick={action}
    className={cn(
      "p-5 rounded-3xl border bg-gradient-to-br transition-all duration-300 text-left hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-40 group w-full",
      gradient
    )}
  >
    <div className={cn("p-3 rounded-2xl flex-shrink-0 w-fit", iconColor)}>
      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
    </div>
    <div>
      <h4 className="font-bold text-gray-900 text-base">{title}</h4>
      <p className="text-xs text-gray-500 mt-1 leading-tight">{desc}</p>
    </div>
  </button>
);

const VerificationRow = ({ label, verified, icon: Icon }) => (
  <div className="flex items-center justify-between text-xs p-1">
    <div className="flex items-center gap-2 text-gray-600">
      <Icon className="w-4 h-4 text-gray-400" />
      <span>{label}</span>
    </div>
    {verified ? (
      <span className="flex items-center gap-1 text-green-600 font-bold">
        <CheckCircle2 className="w-3.5 h-3.5 fill-green-50" />
        Verified
      </span>
    ) : (
      <span className="text-gray-400 font-medium">Pending</span>
    )}
  </div>
);

const SocialBadge = ({ icon: Icon, label, connected, activeColor }) => (
  <div
    className={cn(
      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 text-white shadow-sm border cursor-pointer",
      connected ? `${activeColor} border-transparent` : "bg-gray-50 border-gray-200 text-gray-300 hover:bg-gray-100"
    )}
    title={`${label}: ${connected ? 'Connected' : 'Not Connected'}`}
  >
    <Icon className="w-4 h-4" />
  </div>
);

/* -------------------------------
   Small stat card
-------------------------------- */
const StatCard = ({ label, value, icon: Icon, colorClass }) => (
  <div className="p-4 sm:p-5 bg-white rounded-3xl border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group">
    <div className={`p-3.5 sm:p-4.5 rounded-2xl ${colorClass} text-white shadow-md transition-transform duration-300 group-hover:scale-105 flex-shrink-0`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl sm:text-3xl font-extrabold text-[#07182A] tracking-tight">{value}</p>
      <p className="text-xs sm:text-sm font-semibold text-gray-400 mt-0.5">{label}</p>
    </div>
  </div>
);
