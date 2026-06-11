"use client";

import { useMemo, useState } from "react";
import {
  User, Home, MapPin, Plane, Building2, Calendar,
  LayoutDashboard, Briefcase, ShoppingBag
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/account-v2/Sidebar";
import { ProfileCard } from "@/components/account-v2/ProfileCard";
import { InfoCard } from "@/components/account-v2/InfoCard";
import { MyListings } from "@/components/dashboard/MyListings";
import { Settings } from "@/components/dashboard/Settings";
import { PersonalInfo } from "@/components/dashboard/PersonalInfo";
import { Trips } from "@/components/dashboard/Trips";
import { MyApplications } from "@/components/dashboard/MyApplications";
import { MyBuySellListings } from "@/components/marketplace/MyBuySellListings";
import { WishlistManager } from "@/components/dashboard/WishlistManager";

import {
  useGetHostProfileQuery,
  useGetMyListingsQuery,
  useGetMyEventsQuery,
  useUpdateHostMutation
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
  const { data: listings = [] } = useGetMyListingsQuery(undefined, { skip: !hostProfile });
  const { data: events = [] } = useGetMyEventsQuery(undefined, { skip: !hostProfile });
  const { data: tripsData } = useGetMyTripsQuery();

  const propertiesCount = listings.length;
  const eventsCount = events.length;
  const tripsCount = tripsData?.trips?.length || 0;

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
  const mobileTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'personal', label: 'Profile', icon: User },
    { id: 'listings', label: 'Listings', icon: Home },
    { id: 'buy-sell', label: 'Buy/Sell', icon: ShoppingBag },
    { id: 'applications', label: 'Applications', icon: Briefcase },
    { id: 'trips', label: 'Trips', icon: MapPin },
  ];

  return (
    <main className="min-h-screen bg-[#F8F9FB]">
      <Navbar />

      <div className="container mx-auto pt-20 xl:pt-24 px-3 sm:px-4 pb-12">

        {/* Mobile/Tablet Tab Bar - shown below lg */}
        <div className="xl:hidden mb-4 -mx-3 sm:-mx-4 px-3 sm:px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 py-2 min-w-max">
            {mobileTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(`?tab=${tab.id}`)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${isActive
                    ? 'bg-[#0A1A2F] text-white shadow-lg'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4 xl:gap-6">

          {/* Sidebar - only on large screens */}
          <div className="hidden xl:block w-64 flex-shrink-0">
            <Sidebar activeTab={activeTab} onTabChange={(tab) => navigate(`?tab=${tab}`)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-4">

            {activeTab === "overview" && (
              <>
                <h1 className="text-2xl sm:text-3xl font-black">
                  Welcome, {currentUser?.firstName || "User"}
                </h1>

                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <StatCard label="Properties" value={propertiesCount} icon={Building2} />
                  <StatCard label="Events" value={eventsCount} icon={Calendar} />
                  <StatCard label="Trips" value={tripsCount} icon={Plane} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
                  <div className="md:col-span-5">
                    <ProfileCard
                      user={currentUser}
                      onUpdate={handleUpdatePersonalInfo}
                      isLoading={isUpdating}
                    />
                  </div>
                  <div className="md:col-span-7">
                    <InfoCard user={currentUser} />
                  </div>
                </div>
              </>
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
            {activeTab === "buy-sell" && <MyBuySellListings />}
            {activeTab === "trips" && <Trips />}
            {activeTab === "applications" && <MyApplications />}
            {activeTab === "wishlist" && <WishlistManager />}
            {activeTab === "settings" && <Settings />}

          </div>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------
   Small stat card
-------------------------------- */
const StatCard = ({ label, value, icon: Icon }) => (
  <div className="p-2.5 xs:p-4 sm:p-6 bg-white rounded-2xl border shadow-lg">
    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-2 sm:mb-3" />
    <p className="text-2xl sm:text-4xl font-black">{value}</p>
    <p className="text-xs sm:text-sm text-primary/50">{label}</p>
  </div>
);
