import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Star, Bookmark, ShieldCheck, UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { getCurrencySymbol } from "@/shared/utils/countryUtils";
import { useToggleWishlistMutation, useCheckWishlistStatusQuery } from "@/store/api/wishlistApi";
import { useToggleFollowMutation, useGetMyFollowingQuery, useGetExpertReviewsQuery } from "@/store/api/peopleApi";
import { getCanonicalUserId, isSelfUser } from "@/shared/utils/userUtils";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export function PeopleCard({ person }) {
  const authState = useSelector((state) => state.auth || {});
  const rawUser = authState.user;
  const currentUser = rawUser?.user || rawUser?.data?.user || rawUser || {};
  const currentUserId = getCanonicalUserId(currentUser);
  const isAuthenticated = Boolean(currentUserId);

  const isOwnCard = useMemo(() => {
    if (!isAuthenticated || !person) return false;
    return isSelfUser(currentUser, person);
  }, [isAuthenticated, currentUser, person]);

  // Query live reviews for accurate real-time review count and rating
  const { data: reviewsResponse } = useGetExpertReviewsQuery(person?.id, {
    skip: !person?.id
  });

  const liveReviews = useMemo(() => {
    if (!reviewsResponse) return [];
    if (Array.isArray(reviewsResponse)) return reviewsResponse;
    if (Array.isArray(reviewsResponse.data)) return reviewsResponse.data;
    if (Array.isArray(reviewsResponse.reviews)) return reviewsResponse.reviews;
    if (Array.isArray(reviewsResponse.data?.reviews)) return reviewsResponse.data.reviews;
    return [];
  }, [reviewsResponse]);

  // Query followings list for reactive follow state
  const { data: followingResponse } = useGetMyFollowingQuery(currentUserId, {
    skip: !isAuthenticated || !currentUserId
  });

  const followingList = Array.isArray(followingResponse?.data)
    ? followingResponse.data
    : Array.isArray(followingResponse)
    ? followingResponse
    : [];

  const isFollowingServer = useMemo(() => {
    if (!person || !followingList.length) return false;
    const targetUserId = String(person.user_id || person.id || "");
    return followingList.some((item) => {
      const fId = String(item.following_user_id || item.user_id || item.id || "");
      return fId === targetUserId;
    });
  }, [person, followingList]);

  const [localFollowOverride, setLocalFollowOverride] = useState(null);
  const isFollowing = localFollowOverride !== null ? localFollowOverride : isFollowingServer;

  // Check wishlist status from API if authenticated
  const { data: statusData } = useCheckWishlistStatusQuery(
    { type: "expert", id: person.id },
    { skip: !isAuthenticated || !person?.id }
  );

  const [toggleWishlist, { isLoading: isToggling }] = useToggleWishlistMutation();
  const [toggleFollowMutation, { isLoading: isFollowLoading }] = useToggleFollowMutation();
  const [isSavedState, setIsSavedState] = useState(false);

  const isSavedApi = Boolean(
    statusData?.isWishlisted ?? statusData?.isSaved ?? statusData?.saved ?? statusData?.data?.isWishlisted
  );
  const isSaved = isSavedState || isSavedApi;

  useEffect(() => {
    if (statusData) {
      setIsSavedState(Boolean(statusData.isWishlisted ?? statusData.isSaved ?? statusData.saved ?? statusData.data?.isWishlisted));
    }
  }, [statusData]);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to save professionals to your wishlist.");
      return;
    }

    try {
      const res = await toggleWishlist({ type: "expert", id: person.id }).unwrap();
      const nextSaved = res?.isSaved ?? res?.saved ?? !isSavedState;
      setIsSavedState(nextSaved);
      toast.success(nextSaved ? "Saved to your wishlist!" : "Removed from saved experts.");
    } catch (err) {
      toast.error("Failed to update wishlist.");
    }
  };

  const handleFollowToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to follow professionals.");
      return;
    }

    if (isOwnCard) {
      toast.info("This is your own profile.");
      return;
    }

    const nextState = !isFollowing;
    setLocalFollowOverride(nextState);

    const targetId = person.user_id || person.id;
    try {
      const res = await toggleFollowMutation(targetId).unwrap();
      const followed = res?.data?.followed ?? res?.followed ?? nextState;
      setLocalFollowOverride(followed);
      toast.success(followed ? `You are now following ${person.name || "this professional"}!` : `Unfollowed ${person.name || "this professional"}.`);
    } catch (err) {
      setLocalFollowOverride(!nextState);
      toast.error("Failed to update follow status.");
    }
  };

  // Field mapping normalizing backend schema vs legacy frontend expected props
  const name = person.name || "Professional";
  const profession = person.headline || person.profession || (person.category ? person.category.replace("-", " & ") : "");
  const bio = person.bio || "";
  
  const reviewCount = useMemo(() => {
    if (liveReviews.length > 0) return liveReviews.length;
    return Number(
      person.review_count ??
      person.reviewCount ??
      person.reviews_count ??
      person.total_reviews ??
      person.stats?.review_count ??
      (Array.isArray(person.reviews) ? person.reviews.length : 0)
    );
  }, [liveReviews, person]);

  const rating = useMemo(() => {
    if (liveReviews.length > 0) {
      const sum = liveReviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
      return sum / liveReviews.length;
    }
    const rawRating = Number(
      person.rating ??
      person.avg_rating ??
      person.average_rating ??
      person.rating_average ??
      person.stats?.rating ??
      (Array.isArray(person.reviews) && person.reviews.length
        ? (person.reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / person.reviews.length)
        : (reviewCount > 0 ? 5 : 0))
    );
    return isNaN(rawRating) ? 0 : rawRating;
  }, [liveReviews, person, reviewCount]);

  // Extract years of experience intelligently from experience field, headline or profession
  const expMatch = String(person.experience || person.headline || person.profession || "").match(/(\d+)\s*(?:years?|yrs?)/i);
  const experience = typeof person.experience === 'string' && person.experience && !person.experience.toLowerCase().includes("developer")
    ? person.experience
    : expMatch
      ? `${expMatch[1]}+ yrs`
      : (person.yearsOfExperience || person.years_of_experience)
        ? `${person.yearsOfExperience || person.years_of_experience} yrs`
        : person.experiences?.length
          ? `${person.experiences.length}+ yrs`
          : "1+ yrs";
  const city = person.city || "";
  const country = person.country || "";
  const hourlyRate = person.pricing?.consultation ?? person.hourlyRate ?? person.hourly_rate ?? 0;
  const currency = (person.pricing?.currency && person.pricing.currency !== "USD")
    ? person.pricing.currency
    : (person.currency && person.currency !== "USD")
      ? person.currency
      : (country && country !== "Global" ? country : "India");

  const isVerified = Boolean(
    person.identity_verified ||
    person.documents_verified ||
    person.linkedin_verified ||
    person.verified
  );

  const hasCustomAvatar = Boolean(person.avatar || person.user?.profile_image);
  const avatarUrl = person.avatar || person.user?.profile_image;
  const skills = Array.isArray(person.skills) ? person.skills : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex flex-col justify-between h-full group hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-[0_16px_36px_rgba(0,0,0,0.05)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden">
      
      {/* Save & Follow Action Buttons (Top Right) */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
        {!isOwnCard && (
          <button
            onClick={handleFollowToggle}
            disabled={isFollowLoading}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
              isFollowing
                ? "bg-slate-100 text-slate-800 border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                : "bg-[#E1392A] hover:bg-[#b0221e] text-white border-transparent"
            }`}
            title={isFollowing ? "Following" : "Follow Expert"}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Following
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" /> Follow
              </>
            )}
          </button>
        )}

        <button
          onClick={handleSaveToggle}
          disabled={isToggling}
          className={`p-2 rounded-full border transition-all cursor-pointer ${
            isSaved 
              ? "bg-red-50 text-[#E1392A] border-red-200" 
              : "bg-slate-50/50 hover:bg-slate-100 text-[#717171] hover:text-[#222222] border-transparent"
          }`}
          title={isSaved ? "Saved" : "Save Expert"}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-[#E1392A] text-[#E1392A]" : ""}`} />
        </button>
      </div>

      <div>
        {/* Profile Header Block with pr-36 padding to prevent text collision into action buttons */}
        <div className="flex gap-4 items-center mb-4 pr-32 sm:pr-36 min-w-0">
          <div className="relative shrink-0">
            {hasCustomAvatar ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-16 h-16 rounded-full object-cover border border-slate-100 shadow-sm"
                loading="lazy"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#00142E] text-white flex items-center justify-center font-black text-xl border border-slate-100 shadow-sm">
                {name?.charAt(0) || "P"}
              </div>
            )}
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          
          <div className="space-y-0.5 min-w-0 flex-1">
            <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-[#E1392A] transition-colors duration-250 truncate">
              {name}
            </h3>
            <p className="text-[#E1392A] font-bold text-xs truncate">
              {profession}
            </p>
          </div>
        </div>

        {/* Short Bio summary */}
        <p className="text-[#484848] text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
          {bio}
        </p>

        {/* Dashboard-style Metrics Bar */}
        <div className="grid grid-cols-3 gap-1 py-3 my-4 text-center border-y border-slate-100/80 bg-slate-50/50 rounded-xl">
          <div>
            <span className="text-[10px] text-[#717171] font-bold uppercase tracking-wider block">Rating</span>
            <span className="text-xs font-bold text-slate-800 flex items-center justify-center gap-0.5 mt-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {reviewCount > 0
                ? `${(rating > 0 ? rating : 5).toFixed(1)} (${reviewCount})`
                : rating > 0
                  ? `${rating.toFixed(1)} (1)`
                  : `0 (0)`}
            </span>
          </div>
          
          <div className="border-x border-slate-200/60">
            <span className="text-[10px] text-[#717171] font-bold uppercase tracking-wider block">Experience</span>
            <span className="text-xs font-bold text-slate-800 block mt-1">{experience || "—"}</span>
          </div>

          <div className="px-1">
            <span className="text-[10px] text-[#717171] font-bold uppercase tracking-wider block">Location</span>
            <span className="text-xs font-bold text-slate-800 block truncate mt-1">{city || country || "Global"}</span>
          </div>
        </div>

        {/* Skills Tag row */}
        <div className="flex flex-wrap gap-1.5 mb-6 pt-1">
          {skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="text-[10px] font-bold text-[#222222] bg-slate-50 border border-slate-100/80 px-2.5 py-0.5 rounded-full select-none"
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="text-[10px] font-bold text-[#717171] px-1 py-0.5">
              +{skills.length - 3} more
            </span>
          )}
        </div>

      </div>

      {/* Footer view CTA and hourly rate estimates */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100/80 mt-auto">
        <div>
          <span className="text-[9px] font-bold text-[#717171] uppercase tracking-wider block">Consultation Rate</span>
          <span className="text-slate-900 font-black text-base sm:text-lg">
            {getCurrencySymbol(currency)}{hourlyRate} <span className="text-[#717171] text-[10px] font-bold">/ hr</span>
          </span>
        </div>
        <Link to={`/people/${person.id}`}>
          <Button
            size="sm"
            className="bg-[#00142E] hover:bg-slate-800 text-white font-bold rounded-xl text-xs px-4 py-2 cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            View Profile
          </Button>
        </Link>
      </div>

    </div>
  );
}

export default PeopleCard;
