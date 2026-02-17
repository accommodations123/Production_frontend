"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  User, Home, MapPin, Bell, Settings as SettingsIcon,
  Plane, Building2, Calendar, ArrowRight, Plus
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
  useUpdateHostMutation,
  useGetMyListingsQuery,
  useGetMyEventsQuery
} from "@/store/api/hostApi";

import { useGetMyTripsQuery } from "@/store/api/authApi";
import { cn } from "@/lib/utils";
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

  const [userData, setUserData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const activeTab = searchParams.get("tab") || "overview";

  /* -------------------------------
     Load auth user ONCE
  -------------------------------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      setUserData({
        ...parsed,
        firstName: (parsed.full_name || parsed.name || "User").split("")[0],
      });
    } catch (e) {
      console.error("Invalid user in localStorage", e);
    }
  }, []);

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
  const { data: listings = [] } = useGetMyListingsQuery();
  const { data: events = [] } = useGetMyEventsQuery();
  const { data: tripsData } = useGetMyTripsQuery();

  const propertiesCount = listings.length;
  const eventsCount = events.length;
  const tripsCount = tripsData?.trips?.length || 0;

  /* -------------------------------
     FINAL merged user (SAFE)
  -------------------------------- */
  const currentUser = useMemo(() => {
    if (!userData && !hostProfile) return null;

    return mergeDefined(
      userData,
      hostProfile,
      {
        profile_image: hostProfile?.profile_image
          ? `${hostProfile.profile_image}?v=${refreshKey}`
          : userData?.profile_image
      }
    );
  }, [userData, hostProfile, refreshKey]);

  /* -------------------------------
     Update handler
  -------------------------------- */
  const [updateHost, { isLoading: isUpdating }] = useUpdateHostMutation();

  const handleUpdatePersonalInfo = async (formData) => {
    if (!hostProfile?.id) return;

    const res = await updateHost({
      hostId: hostProfile.id,
      data: formData
    }).unwrap();

    if (!res?.success) return;

    const { host, user } = res.data;

    const updatedUser = {
      ...userData,
      ...host,
      profile_image: user?.profile_image || userData?.profile_image
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUserData(updatedUser);
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
  return (
    <main className="min-h-screen bg-[#F8F9FB]">
      <Navbar />

      <div className="container mx-auto pt-24 px-4 pb-12">
        <div className="flex gap-4 md:gap-6">

          {/* Sidebar */}
          <div className="hidden md:block w-64">
            <Sidebar activeTab={activeTab} onTabChange={(tab) => navigate(`?tab=${tab}`)} />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">

            {activeTab === "overview" && (
              <>
                <h1 className="text-3xl font-black">
                  Welcome, {currentUser?.firstName || "User"}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard label="Properties" value={propertiesCount} icon={Building2} />
                  <StatCard label="Events" value={eventsCount} icon={Calendar} />
                  <StatCard label="Trips" value={tripsCount} icon={Plane} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5">
                    <ProfileCard
                      user={currentUser}
                      onUpdate={handleUpdatePersonalInfo}
                      isLoading={isUpdating}
                    />
                  </div>
                  <div className="lg:col-span-7">
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
  <div className="p-6 bg-white rounded-2xl border shadow-lg">
    <Icon className="w-6 h-6 text-primary mb-3" />
    <p className="text-4xl font-black">{value}</p>
    <p className="text-sm text-primary/50">{label}</p>
  </div>
);
