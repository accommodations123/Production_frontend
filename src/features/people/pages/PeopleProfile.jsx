import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Star,
  MapPin,
  ShieldCheck,
  Mail,
  Send,
  Award,
  Languages,
  Image as ImageIcon,
  ArrowLeft,
  UserPlus,
  UserCheck,
  UserMinus,
  Check,
  Plus,
  Share2,
  Calendar,
  MessageSquare,
  ThumbsUp,
  Loader2,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Lock,
  Phone,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getCurrencySymbol, getCurrencyForCountry } from "@/shared/utils/countryUtils";
import { useCountry } from "@/context/CountryContext";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { PeopleMessageModal } from "../components/PeopleMessageModal";
import { getCanonicalUserId, isSelfUser } from "@/shared/utils/userUtils";
import {
  useGetConnectionStatusQuery,
  useSendConnectionRequestMutation
} from "@/hooks/data/useConnectionHooks";

import {
  useGetPublicProfileQuery,
  useGetPublicProfilesQuery,
  useGetExpertReviewsQuery,
  useGetExpertRatingQuery,
  useGetExpertPortfolioQuery,
  useGetExpertRecommendationsQuery,
  useGetFollowersQuery,
  useGetMyFollowingQuery,
  useToggleFollowMutation,
  useAddReviewMutation,
  useTrackAnalyticsEventMutation
} from "@/hooks/data/usePeopleHooks";

export default function PeopleProfile() {
  const { id } = useParams();
  const { activeCountry } = useCountry();
  const authState = useSelector((state) => state.auth || {});
  const rawUser = authState.user;
  const currentUser = useMemo(() => {
    return rawUser?.user || rawUser?.data?.user || rawUser || {};
  }, [rawUser]);
  const isAuthenticated = Boolean(authState.isAuthenticated || (rawUser && !authState.error));
  const currentUserId = currentUser?.id || currentUser?._id || currentUser?.userId || currentUser?.user_id;

  // Tab State matching Image 4 (About | Experience | Education | Services | Portfolio | Reviews)
  const [activeTab, setActiveTab] = useState("about");
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  // 1. Fetch core profile
  const { data: profileResponse, isLoading, isError, error } = useGetPublicProfileQuery(id);
  const person = profileResponse?.data || profileResponse?.profile || (profileResponse?.id ? profileResponse : null);

  // 2. Fetch rating breakdown & reviews
  const { data: ratingResponse } = useGetExpertRatingQuery(id, { skip: !id });
  const ratingData = ratingResponse?.data?.rating || ratingResponse?.rating || {};

  const { data: reviewsResponse } = useGetExpertReviewsQuery(id, { skip: !id });
  const reviews = Array.isArray(reviewsResponse?.data)
    ? reviewsResponse.data
    : Array.isArray(reviewsResponse?.reviews)
      ? reviewsResponse.reviews
      : Array.isArray(reviewsResponse)
        ? reviewsResponse
        : [];

  // 3. Fetch portfolio items
  const { data: portfolioResponse } = useGetExpertPortfolioQuery(id, { skip: !id });
  const portfolioItems = person?.portfolio || portfolioResponse?.data?.portfolio || portfolioResponse?.portfolio || [];

  // 4. Fetch recommendations / endorsements
  const { data: recsResponse } = useGetExpertRecommendationsQuery(id, { skip: !id });
  const recommendations = person?.recommendations || recsResponse?.data?.recommendations || recsResponse?.recommendations || [];

  // 6. Track view analytics on mount
  const [trackEvent] = useTrackAnalyticsEventMutation();
  useEffect(() => {
    if (id) {
      trackEvent({ expert_id: id, event_type: "PROFILE_VIEW" }).catch(() => {});
    }
  }, [id, trackEvent]);

  // 7. Fetch related profiles in same category
  const category = person?.category;
  const { data: relatedData } = useGetPublicProfilesQuery(
    { category, limit: 4 },
    { skip: !category }
  );
  const relatedPeople = useMemo(() => {
    const list = Array.isArray(relatedData?.items)
      ? relatedData.items
      : Array.isArray(relatedData?.results)
        ? relatedData.results
        : Array.isArray(relatedData?.data?.items)
          ? relatedData.data.items
          : Array.isArray(relatedData?.data)
            ? relatedData.data
            : [];
    return list.filter((p) => p.id !== id).slice(0, 3);
  }, [relatedData, id]);

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [addReview, { isLoading: isSubmittingReview }] = useAddReviewMutation();

  // Message Modal & Follow state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [toggleFollowMutation, { isLoading: isToggleFollowLoading }] = useToggleFollowMutation();
  const [localFollowOverride, setLocalFollowOverride] = useState(null);

  const targetUserId = person?.user_id || person?.id || id;

  // Robust check if this profile belongs to the currently logged in user
  const isOwnProfile = useMemo(() => {
    if (!person || !currentUser) return false;
    return isSelfUser(currentUser, person);
  }, [currentUser, person]);

  // Query my followings list for reactive follow state matching PeopleCard and dashboard
  const { data: myFollowingResponse } = useGetMyFollowingQuery(currentUserId, {
    skip: !isAuthenticated || !currentUserId,
  });

  const followingList = useMemo(() => {
    if (!myFollowingResponse) return [];
    if (Array.isArray(myFollowingResponse)) return myFollowingResponse;
    if (Array.isArray(myFollowingResponse.data)) return myFollowingResponse.data;
    if (Array.isArray(myFollowingResponse.following)) return myFollowingResponse.following;
    return [];
  }, [myFollowingResponse]);

  const { data: followersResponse } = useGetFollowersQuery(targetUserId, {
    skip: !targetUserId,
  });

  const followersList = useMemo(() => {
    if (!followersResponse) return [];
    if (Array.isArray(followersResponse)) return followersResponse;
    if (Array.isArray(followersResponse.data)) return followersResponse.data;
    if (Array.isArray(followersResponse.followers)) return followersResponse.followers;
    return [];
  }, [followersResponse]);

  const isFollowingFromServer = useMemo(() => {
    if (!isAuthenticated || !currentUserId) return false;
    const tUserId = String(person?.user_id || "");
    const tProfId = String(person?.id || id || "");

    const inMyFollowing = followingList.some((item) => {
      const fId = String(item.following_user_id || item.user_id || item.id || item.expert_id || item.profile_id || "");
      return (tUserId && fId === tUserId) || (tProfId && fId === tProfId);
    });
    if (inMyFollowing) return true;

    const inTargetFollowers = followersList.some((item) => {
      const uId = String(item.follower_user_id || item.user_id || item.id || "");
      return String(currentUserId) === uId;
    });
    if (inTargetFollowers) return true;

    return false;
  }, [isAuthenticated, currentUserId, followingList, followersList, person, id]);

  const isFollowing = localFollowOverride !== null ? localFollowOverride : isFollowingFromServer;

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to follow professionals.");
      return;
    }
    if (isOwnProfile) {
      toast.info("This is your own profile.");
      return;
    }

    const nextState = !isFollowing;
    setLocalFollowOverride(nextState);

    const followTargetId = person?.user_id || person?.id || id;
    try {
      const res = await toggleFollowMutation(followTargetId).unwrap();
      const followed = res?.data?.followed ?? res?.followed ?? nextState;
      setLocalFollowOverride(followed);
      toast.success(followed ? `You are now following ${person?.name || "this professional"}.` : `Unfollowed ${person?.name || "this professional"}.`);
    } catch (err) {
      setLocalFollowOverride(!nextState);
      toast.error(err?.data?.message || "Failed to update follow status.");
    }
  };

  const [isConnectionRequestedLocally, setIsConnectionRequestedLocally] = useState(false);
  const [sendConnectionReq, { isLoading: isSendingConnectionReq }] = useSendConnectionRequestMutation();
  const profileItemId = person?.id || id || targetUserId;
  const { data: connectionStatusResponse } = useGetConnectionStatusQuery(
    profileItemId ? { targetUserId, itemId: profileItemId } : targetUserId,
    {
      skip: !isAuthenticated || !targetUserId || isOwnProfile
    }
  );

  const serverConnStatus = connectionStatusResponse?.status || connectionStatusResponse?.data?.status || "none";
  const connStatus = isOwnProfile ? "accepted" : (isConnectionRequestedLocally ? "pending" : serverConnStatus);

  const currency = useMemo(() => {
    if (person?.country && person.country !== "Global" && person.country !== "All") {
      return getCurrencyForCountry(person.country);
    }
    if (person?.pricing?.currency && person.pricing.currency !== "INR") {
      return person.pricing.currency;
    }
    if (person?.currency && person.currency !== "INR") {
      return person.currency;
    }
    if (activeCountry?.name && activeCountry.name !== "Global" && activeCountry.name !== "All") {
      return getCurrencyForCountry(activeCountry.name);
    }
    if (activeCountry?.currency) {
      return activeCountry.currency;
    }
    return person?.pricing?.currency || person?.currency || "USD";
  }, [person?.country, person?.pricing?.currency, person?.currency, activeCountry]);

  const handleMessageAction = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to send a connection request.");
      return;
    }

    if (isOwnProfile) {
      toast.info("This is your own profile.");
      return;
    }

    if (connStatus === "accepted") {
      toast.info(`You are connected with ${person?.name || "this professional"}. Contact channels are unlocked.`);
      return;
    }

    if (connStatus === "pending") {
      toast.info(`Your connection request is pending acceptance by ${person?.name || "the host"}.`);
      return;
    }

    try {
      setIsConnectionRequestedLocally(true);
      await sendConnectionReq({
        targetUserId,
        targetName: person?.name || "Professional",
        itemId: person?.id || id,
        itemTitle: person?.name || "Professional Profile",
        itemType: "people",
        requesterName: currentUser?.name || currentUser?.full_name || "User",
        requesterEmail: currentUser?.email || "",
        requesterPhone: currentUser?.phone || ""
      }).unwrap();

      toast.success(`✓ Connection request sent to ${person?.name || "the advisor"}! Waiting for approval.`);
    } catch (err) {
      setIsConnectionRequestedLocally(false);
      toast.error(err?.data?.message || "Failed to send connection request.");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to submit a review.");
      return;
    }
    if (isOwnProfile) {
      toast.info("You cannot review your own profile.");
      return;
    }
    if (connStatus !== "accepted") {
      toast.error("You can only review this professional after your connection request has been accepted.");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Please enter a review comment.");
      return;
    }

    try {
      await addReview({
        expertId: id,
        data: { rating: newRating, comment: newComment }
      }).unwrap();
      toast.success("Thank you! Your review has been published.");
      setNewComment("");
      setShowReviewForm(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit review.");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#FAFBFD] min-h-screen flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#E1392A]" />
          <p className="text-xs font-bold text-slate-500">Loading professional profile...</p>
        </div>
      </div>
    );
  }

  if (isError || !person) {
    return (
      <div className="bg-[#FAFBFD] min-h-screen flex items-center justify-center py-24 px-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900">Profile Not Found</h2>
          <p className="text-slate-500 text-sm">
            This professional profile may be inactive, unpublished, or removed.
          </p>
          <Link to="/people">
            <Button className="w-full h-11 bg-[#00142E] text-white font-bold rounded-xl">
              Back to Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const name = person.name || person.full_name || (person.firstName ? `${person.firstName} ${person.lastName || ''}`.trim() : "") || "Expert Advisor";
  const profession = person.profession || person.headline || person.occupation || "Expert Advisor";
  const bio = person.bio || person.description || (person.headline ? `Specialized in ${person.headline}. Dedicated to providing seamless relocation and consulting support.` : "Experienced professional dedicated to helping expats navigate relocation, housing, and local integration seamlessly.");
  const city = person.city || "";
  const state = person.state || "";
  const country = person.country || "";
  const locationText = city && country ? `${city}, ${country}` : (city ? `${city}${state ? `, ${state}` : ''}` : (country || "Global"));
  const hasCustomAvatar = Boolean(person.avatar || person.avatar_url || person.profile_image || person.user?.profile_image);
  const avatarUrl = person.avatar || person.avatar_url || person.profile_image || person.user?.profile_image;
  const coverImage = person.cover_image || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80";
  const rawHourly = person.pricing?.consultation ?? person.hourlyRate ?? person.hourly_rate ?? null;
  const hourlyRate = (rawHourly !== null && rawHourly !== undefined && !isNaN(Number(rawHourly)) && Number(rawHourly) > 0) ? Number(rawHourly) : null;
  const skills = Array.isArray(person.skills) && person.skills.length > 0
    ? person.skills
    : (profession !== "Expert Advisor" ? profession.split(/[,|•/]/).map(s => s.trim()).filter(Boolean) : ["Consulting", "Support", "Advisor"]);
  const languages = Array.isArray(person.languages) && person.languages.length > 0 ? person.languages : ["English"];
  const experiences = (Array.isArray(person.experiences) && person.experiences.length > 0)
    ? person.experiences
    : person.experience
      ? [
          {
            role: profession,
            company: (person.category ? person.category.replace(/-/g, ' ').toUpperCase() : "Independent Practice"),
            period: String(person.experience).toLowerCase().includes('yr') ? person.experience : `${person.experience} yrs`,
            description: bio || "Professional advisory and consulting practice."
          }
        ]
      : [];
  const educations = (Array.isArray(person.educations) && person.educations.length > 0) ? person.educations : [];
  const services = (Array.isArray(person.services) && person.services.length > 0)
    ? person.services
    : [
        {
          id: "consult-1",
          name: "1-on-1 Advisory Consultation",
          title: "1-on-1 Advisory Consultation",
          price: hourlyRate,
          rate: hourlyRate,
          currency: currency,
          duration: "1 Hour",
          description: "Personalized guidance, project review, and direct expert consultation."
        }
      ];
  const totalReviewsCount = reviews.length > 0 ? reviews.length : Number(person.review_count || person.reviewCount || 0);
  const calculatedRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length)
    : Number(person.rating || 0);
  const avgRating = totalReviewsCount > 0 ? (calculatedRating > 0 ? calculatedRating : 0) : 0;

  return (
    <div className="bg-[#FAFBFD] min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow pt-20 lg:pt-24 pb-16">
        
        {/* Top Breadcrumb Navigation */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            to="/people"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
        </div>

        {/* Owner Moderation Banner */}
        {isOwnProfile && (person.status === "pending" || (!person.is_approved && person.status !== "approved") || person.is_blocked || person.status === "rejected") && (
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mb-4">
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs font-bold ${
              person.is_blocked || person.status === "rejected"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="text-base">{person.is_blocked || person.status === "rejected" ? "🔒" : "⏳"}</span>
                <span>
                  {person.is_blocked
                    ? "This profile is currently blocked by administration."
                    : person.status === "rejected"
                      ? "This profile was rejected by moderation."
                      : "Your profile is pending admin approval and is currently hidden from the public directory."}
                </span>
              </div>
              <Link to="/people/become" className="shrink-0 underline hover:opacity-80">
                Edit Details
              </Link>
            </div>
          </div>
        )}

        {/* Image 4 Hero Header Card */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            
            {/* Cover Image Banner */}
            <div className="h-48 sm:h-64 w-full bg-slate-900 relative">
              {person.cover_image ? (
                <img
                  src={coverImage}
                  alt={`${person.name} Cover`}
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-slate-900 via-[#0A1A2F] to-slate-900" />
              )}
            </div>

            {/* Profile Info Header Content */}
            <div className="p-6 sm:p-8 pt-4 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                
                {/* Avatar + Text details */}
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-xl overflow-hidden shrink-0 bg-white flex items-center justify-center -mt-16 sm:-mt-22 relative z-20">
                    {hasCustomAvatar ? (
                      <img
                        src={avatarUrl}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#00142E] text-white flex items-center justify-center font-black text-4xl sm:text-5xl">
                        {person.name?.charAt(0) || "P"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {name}
                    </h1>
                    <p className="text-slate-700 font-bold text-sm sm:text-base leading-snug">
                      {profession}
                    </p>
                    <p className="text-slate-500 text-xs font-semibold flex items-center justify-center sm:justify-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {locationText}
                    </p>

                    {/* Rating + Badges */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                      {totalReviewsCount > 0 && avgRating > 0 ? (
                        <div className="flex items-center gap-1 font-bold text-slate-800">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{avgRating.toFixed(1)}</span>
                          <span className="text-blue-600 font-medium">({totalReviewsCount} reviews)</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium text-xs">No reviews yet</span>
                      )}

                      {person.status === "pending" && isOwnProfile && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 text-[10px]">
                          ⏳ Pending Approval
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Action CTA Bar (Follow + Contact Actions) */}
                <div className="flex items-center justify-center sm:justify-end gap-2.5 shrink-0 pt-2 md:pt-0">
                  {!isOwnProfile ? (
                    <>
                      <Button
                        onClick={handleFollowToggle}
                        disabled={isToggleFollowLoading}
                        variant={isFollowing ? "secondary" : "default"}
                        className={`rounded-2xl h-11 px-5 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                          isFollowing
                            ? "bg-slate-100 text-slate-800 border border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            : "bg-[#00142E] text-white hover:bg-slate-800"
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-4 h-4 mr-1.5 text-emerald-600" /> Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-1.5" /> Follow
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleMessageAction}
                        disabled={isSendingConnectionReq}
                        className={`rounded-2xl h-11 px-6 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                          connStatus === "accepted"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : connStatus === "pending"
                              ? "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200"
                              : "bg-[#E1392A] hover:bg-[#b0221e] text-white"
                        }`}
                      >
                        {connStatus === "accepted" ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Connected
                          </>
                        ) : connStatus === "pending" ? (
                          <>
                            <Clock className="w-4 h-4 mr-1.5" /> Request Pending
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4 mr-1.5" /> Connect & Consult
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Link to="/people/become">
                      <Button variant="outline" className="rounded-2xl h-11 px-5 text-xs font-bold border-slate-300 hover:bg-slate-50 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" /> Edit Profile
                      </Button>
                    </Link>
                  )}
                </div>

              </div>

              {/* Image 4 Navigation Tabs Bar (About | Experience | Education | Services | Portfolio | Reviews) */}
              <div className="mt-8 border-t border-slate-100 pt-2 flex items-center gap-6 overflow-x-auto scrollbar-hide text-xs sm:text-sm font-bold">
                {[
                  { id: "about", label: "About" },
                  { id: "experience", label: "Experience" },
                  { id: "education", label: "Education" },
                  { id: "services", label: "Services" },
                  { id: "portfolio", label: "Portfolio" },
                  { id: "reviews", label: `Reviews (${totalReviewsCount})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 relative cursor-pointer whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "text-[#E1392A] font-extrabold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E1392A] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-6">
          
          {/* TAB 1: About Panel */}
          {activeTab === "about" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-slate-900">About</h2>
                </div>
                <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                  {bio && bio.length > 300 && !isBioExpanded ? (
                    <>
                      {bio.slice(0, 300)}...
                      <button
                        onClick={() => setIsBioExpanded(true)}
                        className="text-[#E1392A] font-bold text-xs ml-1 inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        See more <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    bio
                  )}
                </div>
              </div>

              {/* Connected Social & Contact Channels Card */}
              {connStatus === "accepted" || isOwnProfile ? (
                <div className="bg-gradient-to-br from-slate-900 to-[#0A1A2F] text-white rounded-3xl p-6 sm:p-7 shadow-md space-y-4 border border-slate-800">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        ✓ Connected & Unlocked
                      </span>
                      <h3 className="text-base font-black text-white mt-1.5 flex items-center gap-2">
                        Direct Contact & Social Channels
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    {(person.whatsapp || person.phone || person.user?.phone) && (
                      <a
                        href={`https://wa.me/${(person.whatsapp || person.phone || person.user?.phone || "").replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white bg-[#25D366] hover:bg-[#20BD5A] rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        WhatsApp Chat <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {(person.phone || person.whatsapp || person.user?.phone) && (
                      <a
                        href={`tel:${person.phone || person.whatsapp || person.user?.phone}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 text-cyan-400" />
                        Call Phone ({person.phone || person.whatsapp || person.user?.phone})
                      </a>
                    )}

                    {(person.email || person.user?.email) && (
                      <a
                        href={`mailto:${person.email || person.user?.email}?subject=NextKinLife Connection Request`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Send Email ({person.email || person.user?.email})
                      </a>
                    )}

                    {person.instagram && (
                      <a
                        href={person.instagram.startsWith("http") ? person.instagram : `https://instagram.com/${person.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-xl hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
                      >
                        Instagram <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {person.facebook && (
                      <a
                        href={person.facebook.startsWith("http") ? person.facebook : `https://facebook.com/${person.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#1877F2] rounded-xl hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
                      >
                        Facebook <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {person.website && (
                      <a
                        href={person.website.startsWith("http") ? person.website : `https://${person.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
                      >
                        Website <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {person.telegram && (
                      <a
                        href={person.telegram.startsWith("http") ? person.telegram : `https://t.me/${person.telegram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#229ED9] rounded-xl hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
                      >
                        Telegram <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ) : connStatus === "pending" ? (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Connection Request Pending Approval</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    Your connection request was sent to {person.name}. Contact details will unlock automatically as soon as {person.name} approves your request in their Account Settings.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                    <Lock className="w-4 h-4 text-[#E1392A]" />
                    <span>Direct Contact Channels (Locked)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Click <strong className="text-[#E1392A]">"Send Connection Request"</strong> above to send a direct connection request to {person.name}. Once accepted by the host, phone number, email, WhatsApp, and social channels will unlock here.
                  </p>
                </div>
              )}

              {/* Skills & Languages Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Core Expertise & Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.length > 0 ? (
                      skills.map((skill, idx) => (
                        <span key={idx} className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No skills listed yet</span>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-slate-400" /> Languages Spoken
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {languages.length > 0 ? (
                      languages.map((lang, idx) => (
                        <span key={idx} className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                          {lang}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">English</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Experience Panel */}
          {activeTab === "experience" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#E1392A]" /> Professional Experience
              </h2>
              {experiences.length > 0 ? (
                <div className="space-y-6 divide-y divide-slate-100">
                  {experiences.map((exp, idx) => (
                    <div key={idx} className="pt-4 first:pt-0 space-y-1">
                      <h3 className="font-extrabold text-slate-900 text-sm">{exp.role || exp.title}</h3>
                      <p className="text-xs text-slate-600 font-bold">{exp.company}</p>
                      <p className="text-[11px] text-slate-400">{exp.period || exp.duration}</p>
                      {exp.description && <p className="text-xs text-slate-600 pt-1">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  {person.experience ? `Years of Experience: ${person.experience}` : "No formal experience items added yet."}
                </p>
              )}
            </div>
          )}

          {/* TAB 3: Education Panel */}
          {activeTab === "education" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#E1392A]" /> Education & Certifications
              </h2>
              {educations.length > 0 ? (
                <div className="space-y-6 divide-y divide-slate-100">
                  {educations.map((edu, idx) => (
                    <div key={idx} className="pt-4 first:pt-0 space-y-1">
                      <h3 className="font-extrabold text-slate-900 text-sm">{edu.degree || edu.title}</h3>
                      <p className="text-xs text-slate-600 font-bold">{edu.institution || edu.school}</p>
                      <p className="text-[11px] text-slate-400">{edu.year}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No formal education entries added yet.</p>
              )}
            </div>
          )}

          {/* TAB 4: Services Panel */}
          {activeTab === "services" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-base font-extrabold text-slate-900">Services & Consultation Packages</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-slate-900 text-sm">1-on-1 Advisory Consultation</h3>
                    {Number(hourlyRate) > 0 ? (
                      <span className="font-black text-slate-900 text-sm">
                        {getCurrencySymbol(currency)}{Number(hourlyRate).toLocaleString()} / hr
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-500 text-xs">
                        Rate not provided
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    Personalized relocation guidance, document review, or direct expert advice.
                  </p>
                  <Button onClick={handleMessageAction} size="sm" className="bg-[#E1392A] text-white font-bold text-xs h-8 rounded-lg mt-2">
                    Book Session
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Portfolio Panel */}
          {activeTab === "portfolio" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#E1392A]" /> Portfolio & Case Studies
              </h2>
              {portfolioItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-4 space-y-2">
                      {item.media_url && (
                        <img src={item.media_url} alt={item.title} className="w-full h-40 object-cover rounded-xl" />
                      )}
                      <h3 className="font-extrabold text-slate-900 text-sm">{item.title}</h3>
                      {item.description && <p className="text-xs text-slate-600">{item.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No portfolio items uploaded yet.</p>
              )}
            </div>
          )}

          {/* TAB 6: Reviews Panel */}
          {activeTab === "reviews" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-base font-extrabold text-slate-900">
                  Client Reviews ({person.review_count || 0})
                </h2>
                {!isOwnProfile && (
                  connStatus === "accepted" ? (
                    <Button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      size="sm"
                      variant="outline"
                      className="rounded-xl text-xs font-bold"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1" /> {showReviewForm ? "Cancel" : "Write Review"}
                    </Button>
                  ) : connStatus === "pending" ? (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                      ⏳ Connection Pending (Review available once accepted)
                    </span>
                  ) : (
                    <Button
                      onClick={handleMessageAction}
                      size="sm"
                      variant="outline"
                      className="rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 border-slate-300"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" /> Connect to Review
                    </Button>
                  )
                )}
              </div>

              {showReviewForm && connStatus === "accepted" && !isOwnProfile && (
                <form onSubmit={handleReviewSubmit} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm">Write a Review</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewRating(star)}
                          className="p-1 cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= newRating ? "text-amber-500 fill-amber-500" : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Share your experience working with this professional..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#E1392A]"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="bg-[#E1392A] text-white font-bold text-xs h-9 px-4 rounded-xl"
                    >
                      {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </form>
              )}

              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">
                  No client reviews yet. Be the first to leave a review!
                </p>
              ) : (
                <div className="space-y-4 divide-y divide-slate-100">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs">
                          {rev.reviewer_name || rev.reviewer?.name || "Client"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {(() => {
                            const rawDate = rev.created_at || rev.createdAt || rev.createdDate;
                            if (!rawDate) return "Recently";
                            const d = new Date(rawDate);
                            return isNaN(d.getTime()) ? "Recently" : d.toLocaleDateString();
                          })()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
      <PeopleMessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        person={person}
        currentUser={currentUser}
      />
      <Footer />
    </div>
  );
}
