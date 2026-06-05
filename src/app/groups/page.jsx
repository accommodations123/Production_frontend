// File: app/(pages)/groups/page.jsx (or wherever your GroupsPage is located)

"use client"

import * as React from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { GroupsHeader } from "@/components/groups/GroupsHeader"
import { GroupsSection } from "@/components/groups/GroupsSection"
import { GroupCard } from "@/components/groups/GroupCard"
import { useNavigate } from "react-router-dom"
import {
  useGetCommunitiesQuery,
  useGetCommunityByIdQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation
} from "@/store/api/hostApi"
import { Users, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useCountry } from "@/context/CountryContext"

export default function GroupsPage() {
  const navigate = useNavigate()
  const [joiningId, setJoiningId] = React.useState(null) // Tracks which card is loading
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeFilter, setActiveFilter] = React.useState("All")

  const { activeCountry } = useCountry();
  // API hooks
  const { data: communities, isLoading, error, refetch: refetchList } = useGetCommunitiesQuery(activeCountry?.name);
  const [joinCommunity] = useJoinCommunityMutation();
  const [leaveCommunity] = useLeaveCommunityMutation();

 const normalize = (str) =>
  str
    ?.toLowerCase()
    .replace(/&/g, "and")        // ✅ fix special char
    .replace(/[^a-z0-9]+/g, " ") // ✅ remove symbols
    .replace(/\s+/g, " ")
    .trim();

  // --- Filter Logic ---
 const filteredCommunities = React.useMemo(() => {
  if (!communities) return [];

  return communities.filter((community) => {

    // 🔍 SEARCH
    if (searchQuery) {
      const query = normalize(searchQuery);

      const match =
        normalize(community.name)?.includes(query) ||
        normalize(community.city)?.includes(query) ||
        normalize(community.country)?.includes(query) ||
        normalize(community.description)?.includes(query);

      if (!match) return false;
    }

    // 🎯 FILTER
    if (activeFilter === "All") return true;

    // Cities filter
    if (activeFilter === "Cities") {
      return !!community.city;
    }

    // Countries filter
    if (activeFilter === "Countries") {
      return !!community.country;
    }

    // 🔥 FIXED TOPIC FILTER (THIS IS YOUR ISSUE FIX)
if (community.topics?.length) {
  return community.topics.some(
    (topic) =>
      normalize(topic) === normalize(activeFilter)
  );
}

    return false;
  });

}, [communities, searchQuery, activeFilter]);

  // --- Categorize communities for display using FILTERED list ---
  const cityGroups = filteredCommunities.filter(community => community.city);
  // Country groups: has country but NOT city (to avoid duplication if that's the intent, or just has country)
  // Original logic was !community.city, keeping that.
  const countryGroups = filteredCommunities.filter(community => community.country && !community.city);
  const purposeGroups = filteredCommunities.filter(community => community.topics && community.topics.length > 0);

  // Trending/Recommended: Just slice the filtered list for now as we don't have explicit flags
  const trendingGroups = filteredCommunities.slice(0, 3);
  const recommendedGroups = filteredCommunities.slice(0, 3);


  // --- Handlers for joining/leaving from the LIST view ---
  const handleJoinFromList = async (communityId) => {
    setJoiningId(communityId);
    try {
      await joinCommunity(communityId).unwrap();
      toast.success("Successfully joined the community!");
      refetchList(); // Refresh the list to show updated status
    } catch (err) {
      toast.error(err.data?.message || "Failed to join community");
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeaveFromList = async (communityId) => {
    setJoiningId(communityId);
    try {
      await leaveCommunity(communityId).unwrap();
      toast.success("Successfully left the community!");
      refetchList();
    } catch (err) {
      toast.error(err.data?.message || "Failed to leave community");
    } finally {
      setJoiningId(null);
    }
  };

  // --- Loading and Error States for the main page ---
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background pt-20">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#C93A30] mb-4" />
            <p className="text-gray-500">Loading communities...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background pt-20">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="text-center max-w-md">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to load communities</h2>
            <p className="text-gray-500 mb-6 text-sm">Please check your connection and try again.</p>
            <button onClick={() => refetchList()} className="px-6 py-2.5 bg-[#C93A30] text-white rounded-lg hover:bg-[#B82E28] transition-colors font-medium">Try Again</button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  // --- Categorize communities for display ---
  // --- Filter Logic ---
  // --- Categorize communities for display ---
  // (Logic moved up due to Hooks rules)

  return (
    <main className="min-h-screen bg-background pt-20">
      <Navbar />

      {/* Header Section */}
      <div className="bg-[#F1E7D6] pt-12 pb-8 border-b border-[#E6E6E6]">
        <div className="container mx-auto px-4">
          <GroupsHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        </div>
      </div>



      {/* Community Sections */}
      <GroupsSection title="City-Based Groups" className="bg-white">
        {cityGroups.length > 0 ? (
          cityGroups.map((group) => (
            <GroupCard
              key={String(group.id || group._id)}
              type="city"
              data={group}
              onJoin={() => handleJoinFromList(group.id)}
              onLeave={() => handleLeaveFromList(group.id)}
              isJoining={joiningId === group.id}
              onCardClick={() => navigate(`/groups/${group.id}`)}
            />
          ))
        ) : <div className="w-full text-center py-8 text-gray-500">No city groups found</div>}
      </GroupsSection>

      <GroupsSection title="Topic-Based Groups" className="bg-[#F1E7D6]">
        {purposeGroups.length > 0 ? (
          purposeGroups.map((group) => (
            <GroupCard
              key={String(group.id || group._id)}
              type="purpose"
              data={group}
              onJoin={() => handleJoinFromList(group.id)}
              onLeave={() => handleLeaveFromList(group.id)}
              isJoining={joiningId === group.id}
              onCardClick={() => navigate(`/groups/${group.id}`)}
            />
          ))
        ) : <div className="w-full text-center py-8 text-gray-500">No topic-based groups found</div>}
      </GroupsSection>

      <GroupsSection title="Trending Now" className="bg-white">
        {trendingGroups.length > 0 ? (
          trendingGroups.map((group) => (
            <GroupCard
              key={String(group.id || group._id)}
              type="trending"
              data={group}
              onJoin={() => handleJoinFromList(group.id)}
              onLeave={() => handleLeaveFromList(group.id)}
              isJoining={joiningId === group.id}
              onCardClick={() => navigate(`/groups/${group.id}`)}
            />
          ))
        ) : <div className="w-full text-center py-8 text-gray-500">No trending groups found</div>}
      </GroupsSection>

      <GroupsSection title="Recommended for You" className="bg-[#F1E7D6] mb-12">
        {recommendedGroups.length > 0 ? (
          recommendedGroups.map((group) => (
            <GroupCard
              key={String(group.id || group._id)}
              type="recommended"
              data={group}
              onJoin={() => handleJoinFromList(group.id)}
              onLeave={() => handleLeaveFromList(group.id)}
              isJoining={joiningId === group.id}
              onCardClick={() => navigate(`/groups/${group.id}`)}
            />
          ))
        ) : <div className="w-full text-center py-8 text-gray-500">No recommended groups found</div>}
      </GroupsSection>

      <Footer />

      {/* The Modal receives the unwrapped data and loading/error states */}

    </main>
  )
}