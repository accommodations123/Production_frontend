import { useMemo, useState } from "react";
import {
  User, Home, MapPin, Plane, Calendar,
  Briefcase, ShoppingBag, Heart, ShieldCheck, Award, Users
} from "lucide-react";
import { cn } from "@/shared/utils/utils";
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
} from "@/store/api/propertyApi";
import {
  useGetMeQuery,
  useUpdateUserProfileMutation,
} from "@/store/api/authApi";

import { useSelector } from "react-redux";
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
  const [searchParams] = useSearchParams();
  const [updateHost] = useUpdateHostMutation();
  const [updateUserProfile] = useUpdateUserProfileMutation();

  const { user: reduxUser } = useSelector((state) => state.auth);
  const [refreshKey] = useState(() => Date.now());

  const activeTab = searchParams.get("tab") || "listings";

  /* -------------------------------
     API Data Queries
  -------------------------------- */
  const {
    data: hostProfile,
    isLoading: hostLoading,
    refetch: refetchHost
  } = useGetHostProfileQuery();

  const { refetch: refetchUser } = useGetMeQuery();

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
     Update handler for Profile Settings
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
            refetchUser();
          }
        }
      } else {
        await updateUserProfile(formData).unwrap();
        refetchUser();
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsUpdating(false);
    }
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
    { id: 'listings', label: 'My Spaces', icon: Home },
    { id: 'personal', label: 'Profile Settings', icon: User },
    { id: 'events', label: 'My Events', icon: Calendar },
    { id: 'buy-sell', label: 'Marketplace', icon: ShoppingBag },
    { id: 'communities', label: 'My Communities', icon: Users },
    { id: 'applications', label: 'Applications', icon: Briefcase },
    { id: 'trips', label: 'My Trips', icon: MapPin },
    { id: 'wishlist', label: 'Saved Collection', icon: Heart },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FCFAF6] via-[#FFFFFF] to-[#FAF8F5]/35 pb-24 font-sans antialiased text-gray-900">
      
      {/* 1. Top Cover Banner (Only shown when not viewing personal tab) */}
      {activeTab !== 'personal' && (
        <div className="w-full relative bg-white border-b border-gray-250/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="h-44 sm:h-56 bg-gradient-to-br from-[#00162D] via-[#08223C] to-[#12365A] relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2)_0%,transparent_60%)]"></div>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#00162D]/60 to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 -mt-10 sm:-mt-16">
              
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden relative z-10">
                    {currentUser?.profile_image && !currentUser.profile_image.includes("ImageOff") ? (
                      <img
                        src={currentUser.profile_image}
                        alt={currentUser?.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#7C3AED] text-white flex items-center justify-center text-4xl font-extrabold uppercase select-none">
                        {currentUser?.full_name?.[0] || currentUser?.name?.[0] || "B"}
                      </div>
                    )}
                  </div>
                  {hostProfile?.status === "approved" && (
                    <span className="absolute bottom-1 right-1 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white shadow-lg flex items-center justify-center z-20" title="Verified Host">
                      <ShieldCheck className="w-4 h-4 fill-current" />
                    </span>
                  )}
                </div>

                <div className="space-y-1 sm:mb-2 z-10 text-slate-800">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white sm:text-gray-900 tracking-tight">
                    {currentUser?.full_name || currentUser?.name || "Bhargav Reddy"}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    {hostProfile?.status === "approved" ? (
                      <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50/80 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-100/50 text-xs font-bold shadow-sm">
                        <Award className="w-3.5 h-3.5 text-blue-600" />
                        Verified Host
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 text-xs font-bold">
                        <User className="w-3.5 h-3.5" />
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

              <div className="flex flex-wrap justify-center lg:justify-end gap-2.5 sm:mb-2 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate("/host/create")}
                  className="flex items-center gap-1.5 bg-[#00162D] hover:bg-[#CB2A26] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>List a Space</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/events/host")}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Plan Event</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. Workspace Content Layout (Sidebar Desktop, top scroller Mobile) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT SIDEBAR NAVIGATION (Desktop) - Hidden on Profile Page */}
          {activeTab !== 'personal' && (
            <aside className="w-72 shrink-0 hidden lg:block">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-2 shadow-xs sticky top-24">
                <div className="px-3.5 py-2 mb-2 border-b border-slate-100">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Account Console</span>
                </div>
                {mobileTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => navigate(`?tab=${tab.id}`)}
                      className={cn(
                        "w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer text-left active:scale-[0.98]",
                        isActive
                          ? "bg-[#00142E] text-white shadow-md shadow-[#00142E]/10"
                          : "text-slate-600 hover:text-[#00142E] hover:bg-slate-50"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-[#CB2A26]" : "text-slate-400")} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}

          {/* MOBILE TABS SCROLLER (Mobile/Tablet) - Hidden on Profile Page */}
          {activeTab !== 'personal' && (
            <div className="lg:hidden overflow-x-auto no-scrollbar pb-2 shrink-0">
              <div className="flex gap-2 min-w-max">
                {mobileTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => navigate(`?tab=${tab.id}`)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer border",
                        isActive
                          ? "bg-[#00142E] text-white border-transparent shadow-md"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* RIGHT WORKSPACE DISPLAY PANELS */}
          <section className="flex-1 min-w-0">
            <div className="bg-transparent min-h-[520px] relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >

                  {activeTab === "personal" && (
                    <PersonalInfo
                      initialData={currentUser}
                      onUpdate={handleUpdatePersonalInfo}
                      isUpdating={isUpdating}
                      isHost={!!hostProfile?.id}
                    />
                  )}

                  {activeTab === "listings" && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                      <MyListings />
                    </div>
                  )}

                  {activeTab === "events" && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                      <MyEvents />
                    </div>
                  )}

                  {activeTab === "buy-sell" && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                      <MyBuySellListings />
                    </div>
                  )}

                  {activeTab === "trips" && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                      <Trips />
                    </div>
                  )}

                  {activeTab === "applications" && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                      <MyApplications />
                    </div>
                  )}

                  {activeTab === "wishlist" && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                      <WishlistManager />
                    </div>
                  )}

                  {activeTab === "communities" && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
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
                          type="button"
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
