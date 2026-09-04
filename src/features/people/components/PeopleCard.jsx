import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Star, Bookmark, ShieldCheck, UserPlus, UserCheck, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getCurrencySymbol, getCurrencyForCountry } from "@/shared/utils/countryUtils";
import { useCountry } from "@/context/CountryContext";
import { useToggleWishlistMutation, useCheckWishlistStatusQuery } from "@/hooks/data/useWishlistHooks";
import { useToggleFollowMutation, useGetMyFollowingQuery, useGetExpertReviewsQuery } from "@/hooks/data/usePeopleHooks";
import { getCanonicalUserId, isSelfUser } from "@/shared/utils/userUtils";
import { useSelector } from "react-redux";
import { toast } from "sonner";

function isPersonWishlistedInCache(id) {
  if (typeof window === "undefined" || !id) return false;
  const idStr = String(id);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("user_wishlist_")) {
        const raw = localStorage.getItem(k);
        if (raw && raw.includes(idStr)) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.some((item) => String(item.id || item.item_id) === idStr)) {
            return true;
          }
        }
      }
    }
    const rawUser = localStorage.getItem("user");
    if (rawUser && rawUser.includes(idStr)) {
      const parsed = JSON.parse(rawUser);
      const street = parsed?.street_address || parsed?.user?.street_address;
      if (street) {
        const meta = typeof street === "string" ? JSON.parse(street) : street;
        if (Array.isArray(meta?.wishlist) && meta.wishlist.some((item) => String(item.id || item.item_id) === idStr)) {
          return true;
        }
      }
    }
  } catch {}
  return false;
}

export function PeopleCard({ person }) {
  const { activeCountry } = useCountry();
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
    const targetUserId = String(person.user_id || "");
    const targetProfileId = String(person.id || "");
    return followingList.some((item) => {
      const fId = String(item.following_user_id || item.user_id || item.id || "");
      return (targetUserId && fId === targetUserId) || (targetProfileId && fId === targetProfileId);
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
  const [isSavedState, setIsSavedState] = useState(() => isPersonWishlistedInCache(person?.id));

  useEffect(() => {
    if (statusData) {
      const status = statusData.isWishlisted ?? statusData.isSaved ?? statusData.saved ?? statusData.data?.isWishlisted;
      if (typeof status !== "undefined") {
        setIsSavedState(Boolean(status));
      }
    }
  }, [statusData]);

  const isSaved = isSavedState;

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to save professionals to your wishlist.");
      return;
    }

    const nextSaved = !isSavedState;
    setIsSavedState(nextSaved);

    // Optimistically update local cache so refresh immediately preserves the new state
    try {
      const uId = currentUserId || currentUser?.id || currentUser?._id;
      const key = `user_wishlist_${uId || "guest"}`;
      const raw = localStorage.getItem(key);
      let list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
      if (nextSaved) {
        if (!list.some((i) => String(i.id || i.item_id) === String(person.id))) {
          list.push({ id: person.id, item_id: person.id, type: "expert", created_at: new Date().toISOString() });
        }
      } else {
        list = list.filter((i) => String(i.id || i.item_id) !== String(person.id));
      }
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}

    try {
      const res = await toggleWishlist({ type: "expert", id: person.id }).unwrap();
      const serverStatus = res?.isWishlisted ?? res?.is_wishlisted ?? res?.isSaved ?? res?.saved;
      if (typeof serverStatus !== "undefined") {
        setIsSavedState(Boolean(serverStatus));
      }
      toast.success(nextSaved ? "Saved to your wishlist!" : "Removed from saved experts.");
    } catch (err) {
      setIsSavedState(!nextSaved);
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
      (Array.isArray(person.reviews) && person.reviews.length > 0
        ? (person.reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / person.reviews.length)
        : 0)
    );
    return isNaN(rawRating) ? 0 : rawRating;
  }, [liveReviews, person]);

  // Extract years of experience accurately from experience field, without inventing fallback values

  // Format experience string
  const experienceDisplay =
    person.experience !== undefined && person.experience !== null && String(person.experience).trim() !== ""
      ? (/^\d+$/.test(String(person.experience).trim()) ? `${person.experience} yrs` : String(person.experience).trim())
      : (Array.isArray(person.experiences) && person.experiences.length > 0)
        ? (person.experiences[0]?.duration || `${person.experiences.length} yrs`)
        : (Array.isArray(person.experience) && person.experience.length > 0)
          ? `${person.experience.length} yrs`
          : "—";
  const name = person.name || person.full_name || (person.firstName ? `${person.firstName} ${person.lastName || ''}`.trim() : "") || "Expert Advisor";
  const profession = person.profession || person.headline || person.occupation || "Advisor";
  const bio = person.bio || person.description || (person.headline ? `Specialized in ${person.headline}` : "Dedicated expat support advisor assisting with relocation, housing, and integration.");
  const city = person.city || "";
  const state = person.state || "";
  const country = person.country || "";
  const locationText = city && country ? `${city}, ${country}` : city || state || country || "Global";
  const hourlyRate = (person.hourly_rate !== null && person.hourly_rate !== undefined && person.hourly_rate !== "")
    ? Number(person.hourly_rate)
    : (person.hourlyRate !== null && person.hourlyRate !== undefined && person.hourlyRate !== "")
      ? Number(person.hourlyRate)
      : (person.pricing?.consultation !== null && person.pricing?.consultation !== undefined && person.pricing?.consultation !== "")
        ? Number(person.pricing.consultation)
        : null;

  const currency = useMemo(() => {
    if (country && country !== "Global" && country !== "All") {
      return getCurrencyForCountry(country);
    }
    if (person.pricing?.currency && person.pricing.currency !== "INR") {
      return person.pricing.currency;
    }
    if (person.currency && person.currency !== "INR") {
      return person.currency;
    }
    if (activeCountry?.name && activeCountry.name !== "Global" && activeCountry.name !== "All") {
      return getCurrencyForCountry(activeCountry.name);
    }
    if (activeCountry?.currency) {
      return activeCountry.currency;
    }
    return person.pricing?.currency || person.currency || "USD";
  }, [country, person.pricing?.currency, person.currency, activeCountry]);

  const hasCustomAvatar = Boolean(person.avatar || person.avatar_url || person.profile_image || person.user?.profile_image);
  const avatarUrl = person.avatar || person.avatar_url || person.profile_image || person.user?.profile_image;
  const skills = Array.isArray(person.skills) && person.skills.length > 0
    ? person.skills
    : (profession !== "Advisor" ? profession.split(/[,|•/]/).map(s => s.trim()).filter(Boolean) : ["Consulting", "Support", "Advisor"]);

  const websiteUrl = (person.website && typeof person.website === "string" && person.website.trim() !== "")
    ? person.website.trim()
    : (person.website_url && typeof person.website_url === "string" && person.website_url.trim() !== "")
      ? person.website_url.trim()
      : (person.portfolio && typeof person.portfolio === "string" && person.portfolio.trim() !== "")
        ? person.portfolio.trim()
        : (person.social_links?.website && typeof person.social_links.website === "string" && person.social_links.website.trim() !== "")
          ? person.social_links.website.trim()
          : null;

  if (!person) return null;

  return (
    <Card className="rounded-2xl border border-border/80 p-5 flex flex-col justify-between h-full group hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lg transition-all duration-300 relative overflow-hidden bg-card">
      
      {/* Save & Follow Action Buttons (Top Right) */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
        {!isOwnCard && (
          <Button
            size="sm"
            variant={isFollowing ? "outline" : "accent"}
            onClick={handleFollowToggle}
            disabled={isFollowLoading}
            className="rounded-full text-xs font-bold h-8 px-3 gap-1 shadow-xs"
            title={isFollowing ? "Following" : "Follow Expert"}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Follow</span>
              </>
            )}
          </Button>
        )}

        <Button
          size="icon"
          variant="outline"
          onClick={handleSaveToggle}
          disabled={isToggling}
          className={`h-8 w-8 rounded-full border transition-all ${
            isSaved 
              ? "bg-destructive/10 text-destructive border-destructive/20" 
              : "border-border/80 text-muted-foreground hover:text-foreground"
          }`}
          title={isSaved ? "Saved" : "Save Expert"}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-destructive text-destructive" : ""}`} />
        </Button>
      </div>

      <div>
        {/* Profile Header Block */}
        <div className="flex gap-4 items-center mb-4 pr-32 sm:pr-36 min-w-0">
          <Avatar className="w-14 h-14 shrink-0 border border-border">
            {hasCustomAvatar && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback className="bg-primary text-white font-bold text-lg">
              {name?.charAt(0) || "P"}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-0.5 min-w-0 flex-1">
            <h3 className="font-bold text-foreground text-base leading-snug group-hover:text-accent transition-colors truncate">
              {name}
            </h3>
            <p className="text-accent font-semibold text-xs truncate">
              {profession}
            </p>
          </div>
        </div>

        {/* Short Bio summary */}
        <p className="text-muted-foreground text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
          {bio}
        </p>

        {/* Dashboard-style Metrics Bar */}
        <div className="grid grid-cols-3 gap-1 py-3 my-4 text-center border-y border-border bg-muted/30 rounded-xl">
          <div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Rating</span>
            <span className="text-xs font-bold text-foreground flex items-center justify-center gap-0.5 mt-1">
              {reviewCount > 0 && rating > 0 ? (
                <>
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {rating.toFixed(1)} ({reviewCount})
                </>
              ) : (
                <span className="text-[10px] text-muted-foreground font-medium">No reviews</span>
              )}
            </span>
          </div>
          
          <div className="border-x border-border">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Experience</span>
            <span className="text-xs font-bold text-foreground block mt-1">{experienceDisplay || "—"}</span>
          </div>

          <div className="px-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Location</span>
            <span className="text-xs font-bold text-foreground block truncate mt-1">{locationText}</span>
          </div>
        </div>

        {/* Skills Tag row */}
        <div className="flex flex-wrap gap-1.5 mb-6 pt-1">
          {skills.slice(0, 3).map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-[10px] font-medium py-0.5 px-2.5"
            >
              {skill}
            </Badge>
          ))}
          {skills.length > 3 && (
            <span className="text-[10px] font-semibold text-muted-foreground px-1 py-0.5">
              +{skills.length - 3} more
            </span>
          )}
        </div>

        {/* Website Link (if provided) */}
        {websiteUrl && (
          <div className="mb-4">
            <a
              href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1 rounded-lg transition-colors border border-emerald-200/60 max-w-full truncate group/web"
              title={`Visit website: ${websiteUrl}`}
            >
              <Globe className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span className="truncate">{websiteUrl.replace(/^https?:\/\//i, "").replace(/^www\./i, "")}</span>
              <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover/web:opacity-100" />
            </a>
          </div>
        )}

      </div>

      {/* Footer view CTA and hourly rate estimates */}
      <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
        <div>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Consultation Rate</span>
          {Number(hourlyRate) > 0 ? (
            <span className="text-foreground font-bold text-base sm:text-lg">
              {getCurrencySymbol(currency)}{Number(hourlyRate).toLocaleString()} <span className="text-muted-foreground text-[10px] font-normal">/ hr</span>
            </span>
          ) : (
            <span className="text-muted-foreground font-medium text-xs mt-1 block">
              Rate on request
            </span>
          )}
        </div>
        <Link to={`/people/${person.id}`}>
          <Button
            size="sm"
            variant="default"
            className="font-semibold text-xs px-4"
          >
            View Profile
          </Button>
        </Link>
      </div>

    </Card>
  );
}

export default PeopleCard;

