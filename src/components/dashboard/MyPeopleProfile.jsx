import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Sparkles,
  ShieldCheck,
  Star,
  MapPin,
  Edit3,
  ExternalLink,
  Plus,
  Users,
  UserCheck,
  UserMinus,
  ArrowRight
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  useGetMyProfileQuery,
  useGetFollowingQuery,
  useToggleFollowMutation,
  useGetPublicProfilesQuery
} from "@/hooks/data/usePeopleHooks";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { getCurrencySymbol, getCurrencyForCountry } from "@/shared/utils/countryUtils";
import { useCountry } from "@/context/CountryContext";


export function MyPeopleProfile() {
  const { activeCountry } = useCountry();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.auth || {});
  const rawUser = authState.user;
  const currentUser = rawUser?.user || rawUser?.data?.user || rawUser || {};
  const currentUserId = currentUser?.id || currentUser?._id || currentUser?.userId || currentUser?.user_id;

  const { data: profileResponse, isLoading } = useGetMyProfileQuery(undefined, { skip: !currentUserId });
  const fetchedProfile = profileResponse?.profile || profileResponse?.data || (profileResponse && profileResponse.id ? profileResponse : null);

  // Fetch all public profiles to match details of followed users
  const { data: publicProfilesData } = useGetPublicProfilesQuery({});
  const allProfiles = useMemo(() => {
    if (!publicProfilesData) return [];
    if (Array.isArray(publicProfilesData)) return publicProfilesData;
    if (Array.isArray(publicProfilesData.items)) return publicProfilesData.items;
    if (Array.isArray(publicProfilesData.results)) return publicProfilesData.results;
    if (Array.isArray(publicProfilesData.data?.items)) return publicProfilesData.data.items;
    if (Array.isArray(publicProfilesData.data)) return publicProfilesData.data;
    return [];
  }, [publicProfilesData]);

  const profile = useMemo(() => {
    if (fetchedProfile) return fetchedProfile;
    if (allProfiles.length > 0 && currentUserId) {
      return (
        allProfiles.find(
          (p) =>
            String(p.user_id) === String(currentUserId) ||
            String(p.user?.id) === String(currentUserId) ||
            String(p.id) === String(currentUserId)
        ) || null
      );
    }
    return null;
  }, [fetchedProfile, allProfiles, currentUserId]);



  // Fetch following list
  const { data: followingResponse, isLoading: isFollowingLoading } = useGetFollowingQuery(currentUserId, { skip: !currentUserId });
  const [toggleFollowMutation, { isLoading: isTogglingFollow }] = useToggleFollowMutation();

  // Extract list of followed items
  const followingItems = useMemo(() => {
    if (!followingResponse) return []
    if (Array.isArray(followingResponse)) return followingResponse;
    if (Array.isArray(followingResponse.data)) return followingResponse.data;
    return [];
  }, [followingResponse]);

  // Map followed user IDs to full professional profile cards
  const followedProfiles = useMemo(() => {
    if (followingItems.length === 0) return [];
    const followedIds = new Set(
      followingItems.map((item) => String(item.following_user_id || item.target_user_id || item.id || item.user_id))
    );
    return allProfiles.filter(
      (p) => followedIds.has(String(p.user_id)) || followedIds.has(String(p.id))
    );
  }, [followingItems, allProfiles]);

  const handleUnfollow = async (targetUserId, targetName) => {
    try {
      await toggleFollowMutation(targetUserId).unwrap();
      toast.success(`Unfollowed ${targetName || "professional"}.`);
    } catch (err) {
      toast.error("Failed to update follow status.");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#E1392A]/30 border-t-[#E1392A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* 1. My Professional Advisor Profile Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-[#E1392A]" /> My Professional Profile
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Manage your professional advisor identity, skills, consultation rates, and social channels.
            </p>
          </div>

          <Button
            onClick={() => navigate("/people/become")}
            className="bg-[#E1392A] hover:bg-[#b0221e] text-white font-bold text-xs h-10 px-5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {profile ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {profile ? "Edit Profile" : "Create Profile"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#E1392A]" />
          </div>
        ) : profile ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 bg-slate-50/70 rounded-2xl border border-slate-100">
              <div className="relative shrink-0">
                {profile.profile_image || profile.avatar ? (
                  <img
                    src={profile.profile_image || profile.avatar}
                    alt={profile.name || "Advisor"}
                    className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#00142E] text-white flex items-center justify-center font-black text-2xl border-2 border-white shadow-md">
                    {(profile.name || "A").charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 truncate">
                    {profile.name || profile.full_name}
                  </h3>
                  {profile.status === "rejected" ? (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full w-fit mx-auto sm:mx-0">
                      ✕ Rejected
                    </span>
                  ) : profile.status === "pending" || (!profile.is_approved && profile.status !== "approved") ? (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full w-fit mx-auto sm:mx-0">
                      ⏳ Pending Approval
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full w-fit mx-auto sm:mx-0">
                      ✓ Approved & Live
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold text-[#E1392A]">{profile.profession}</p>

                {profile.headline && (
                  <p className="text-xs text-slate-600 italic">"{profile.headline}"</p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-slate-500 font-semibold pt-1">
                  <span className="flex items-center gap-1 text-slate-800">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {profile.rating > 0 && (profile.review_count > 0 || profile.reviewCount > 0) ? Number(profile.rating).toFixed(1) : "0"} ({profile.review_count || profile.reviewCount || 0} reviews)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {profile.city}, {profile.country}
                  </span>
                  <span>•</span>
                  <span className="font-extrabold text-slate-900">
                    {getCurrencySymbol((profile.country && profile.country !== "Global") ? getCurrencyForCountry(profile.country) : (profile.pricing?.currency && profile.pricing.currency !== "INR") ? profile.pricing.currency : (profile.currency && profile.currency !== "INR") ? profile.currency : (activeCountry?.currency || "USD"))}{profile.pricing?.consultation ?? profile.hourlyRate ?? 0} / hr
                  </span>
                </div>
              </div>

              <div className="shrink-0 pt-2 sm:pt-0">
                <Link to={`/people/${profile.id}`}>
                  <Button variant="outline" className="h-9 px-4 text-xs font-bold text-slate-700 border-slate-300 rounded-xl hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer">
                    <ExternalLink className="w-3.5 h-3.5" /> View Public Card
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>



      {/* 3. People You Follow / Following Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0A66C2]" /> People You Follow
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              View and manage the expat advisors, relocation experts, and professionals you are following.
            </p>
          </div>

          <Link to="/people">
            <Button variant="outline" className="h-9 px-4 text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-1.5">
              Browse Directory <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {isFollowingLoading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="w-7 h-7 border-3 border-[#0A66C2]/30 border-t-[#0A66C2] rounded-full animate-spin" />
          </div>
        ) : followedProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {followedProfiles.map((person) => (
              <div key={person.id} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <img
                    src={person.avatar || person.user?.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                    alt={person.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-slate-900 text-sm truncate">{person.name}</h4>
                    <p className="text-xs font-semibold text-[#E1392A] truncate">{person.profession || person.headline}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 shrink-0" /> {person.city}, {person.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 gap-2">
                  <Link to={`/people/${person.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold h-8 rounded-lg border-slate-300 text-slate-700 hover:bg-white">
                      View Profile
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    disabled={isTogglingFollow}
                    onClick={() => handleUnfollow(person.user_id || person.id, person.name)}
                    className="h-8 px-3 text-xs font-extrabold bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-300 hover:border-red-200 rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Following
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-8 text-center space-y-3">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-800 text-sm">Not following anyone yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Follow verified immigration lawyers, relocation specialists, and housing experts from the People directory to see them here.
              </p>
            </div>
            <Link to="/people" className="inline-block pt-1">
              <Button className="bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs h-9 px-5 rounded-xl">
                Explore People Directory
              </Button>
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
