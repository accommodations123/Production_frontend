import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  MapPin,
  ShieldCheck,
  Mail,
  Send,
  Award,
  Languages,
  Image,
  ArrowLeft,
  UserPlus,
  UserCheck,
  Share2,
  Calendar,
  MessageSquare,
  ThumbsUp,
  Loader2
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import {
  useGetPublicProfileQuery,
  useGetPublicProfilesQuery,
  useGetExpertReviewsQuery,
  useGetExpertRatingQuery,
  useGetExpertPortfolioQuery,
  useGetExpertRecommendationsQuery,
  useCheckFollowStatusQuery,
  useFollowExpertMutation,
  useUnfollowExpertMutation,
  useAddReviewMutation,
  useTrackAnalyticsEventMutation
} from "@/store/api/peopleApi";

export default function PeopleProfile() {
  const { id } = useParams();
  const { isAuthenticated, user: currentUser } = useSelector((state) => state.auth || {});

  // 1. Fetch core profile
  const { data: profileResponse, isLoading, isError, error } = useGetPublicProfileQuery(id);
  const person = profileResponse?.profile || null;

  // 2. Fetch rating breakdown & reviews
  const { data: ratingResponse } = useGetExpertRatingQuery(id, { skip: !id });
  const ratingData = ratingResponse?.rating || {};

  const { data: reviewsResponse } = useGetExpertReviewsQuery(id, { skip: !id });
  const reviews = reviewsResponse?.reviews || [];

  // 3. Fetch portfolio items
  const { data: portfolioResponse } = useGetExpertPortfolioQuery(id, { skip: !id });
  const portfolioItems = portfolioResponse?.portfolio || [];

  // 4. Fetch recommendations / endorsements
  const { data: recsResponse } = useGetExpertRecommendationsQuery(id, { skip: !id });
  const recommendations = recsResponse?.recommendations || [];

  // 5. Follow status & mutations
  const { data: followStatusData } = useCheckFollowStatusQuery(id, { skip: !isAuthenticated || !id });
  const isFollowing = Boolean(followStatusData?.isFollowing);

  const [followExpert, { isLoading: isFollowingLoading }] = useFollowExpertMutation();
  const [unfollowExpert, { isLoading: isUnfollowingLoading }] = useUnfollowExpertMutation();

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
    return (relatedData?.results || []).filter((p) => p.id !== id).slice(0, 3);
  }, [relatedData, id]);

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [addReview, { isLoading: isSubmittingReview }] = useAddReviewMutation();

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to follow professionals.");
      return;
    }
    try {
      if (isFollowing) {
        await unfollowExpert(id).unwrap();
        toast.success("Unfollowed successfully.");
      } else {
        await followExpert(id).unwrap();
        toast.success(`You are now following ${person?.name || "this professional"}.`);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Action failed.");
    }
  };

  const handleConnectAction = (type) => {
    const prefs = person?.contact_preferences || {};

    if (type === "chat") {
      if (person?.calendly) {
        window.open(person.calendly, "_blank");
        toast.success("Opening scheduling page...");
        trackEvent({ expert_id: id, event_type: "CALENDLY_CLICK" }).catch(() => {});
        return;
      }
      toast.info("Direct consult request sent to advisor.");
    } else {
      if (person?.user?.email) {
        window.location.href = `mailto:${person.user.email}?subject=Inquiry regarding consulting services`;
      } else {
        toast.info("Opening contact request...");
      }
      trackEvent({ expert_id: id, event_type: "EMAIL_CLICK" }).catch(() => {});
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to submit a review.");
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
          <p className="text-xs font-bold text-[#717171]">Loading professional profile...</p>
        </div>
      </div>
    );
  }

  if (isError || !person) {
    return (
      <div className="bg-[#FAFBFD] min-h-screen flex items-center justify-center py-24 px-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900">Profile Not Found</h2>
          <p className="text-[#717171] text-sm">
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

  const isVerified = Boolean(
    person.identity_verified ||
    person.documents_verified ||
    person.linkedin_verified
  );

  const avatar = person.avatar || person.user?.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
  const coverImage = person.cover_image || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80";
  const hourlyRate = person.pricing?.consultation || 0;
  const currency = person.pricing?.currency || "USD";
  const skills = Array.isArray(person.skills) ? person.skills : [];
  const languages = Array.isArray(person.languages) ? person.languages : [];
  const badges = Array.isArray(person.badges) ? person.badges : [];

  return (
    <div className="bg-[#FAFBFD] min-h-screen flex flex-col justify-between">
      <main className="flex-grow">
        {/* Navigation back bar */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            to="/people"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#484848] hover:text-[#00142E] transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
        </div>

        {/* Cover Header Image section */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900 border-b border-slate-200">
          <img
            src={coverImage}
            alt={`${person.name} Cover`}
            className="w-full h-full object-cover opacity-75"
          />
        </div>

        {/* Main Details Wrapper Grid */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-16 relative z-10 space-y-4">
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 border border-slate-200/80 shadow-xs">
            <Breadcrumb
              items={[
                { label: "People & Experts", path: "/people" },
                { label: person.name || "Advisor Profile" }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side details block */}
            <div className="lg:col-span-8 space-y-8">
              {/* Profile Card Summary Header */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
                {/* Photo & Verification badge */}
                <div className="relative shrink-0">
                  <img
                    src={avatar}
                    alt={person.name}
                    className="w-24 h-24 rounded-2xl object-cover border border-slate-100 shadow-md"
                  />
                  {isVerified && (
                    <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-md">
                      <ShieldCheck className="w-4.5 h-4.5" />
                    </div>
                  )}
                </div>

                {/* Name, Professional text parameters */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {person.name}
                      </h1>
                      {isVerified && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full select-none">
                          Verified Expert
                        </span>
                      )}
                    </div>

                    {/* Follow Action Button */}
                    {person.user_id !== currentUser?.id && (
                      <Button
                        onClick={handleFollowToggle}
                        disabled={isFollowingLoading || isUnfollowingLoading}
                        variant={isFollowing ? "outline" : "default"}
                        className={`h-9 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isFollowing
                            ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                            : "bg-[#E1392A] hover:bg-[#b0221e] text-white shadow-sm"
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" /> Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" /> Follow ({person.followers_count || 0})
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <p className="text-[#E1392A] font-bold text-base leading-snug">
                    {person.profession}
                  </p>

                  {person.headline && (
                    <p className="text-[#484848] text-xs font-medium italic">
                      "{person.headline}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-xs text-[#484848] font-semibold pt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-slate-800 font-bold">
                        {person.rating > 0 ? person.rating.toFixed(1) : "New"}
                      </span>
                      <span className="text-[#717171]">({person.review_count || 0} client reviews)</span>
                    </div>
                    {person.experience && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-[#717171]" />
                          <span>{person.experience}</span>
                        </div>
                      </>
                    )}
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#717171]" />
                      <span>{person.city}, {person.country}</span>
                    </div>
                  </div>

                  {/* Badges list */}
                  {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {badges.map((b, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md"
                        >
                          {b.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* About description paragraph */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-3">
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  About Me & Philosophy
                </h2>
                <p className="text-[#222222] text-sm leading-relaxed whitespace-pre-line">
                  {person.bio}
                </p>
              </div>

              {/* Skills and Languages spoken summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Core Expertise Tags */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-3">
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                    Expertise & Skills
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="text-xs font-bold text-[#222222] bg-slate-50 border border-slate-150 px-3 py-1 rounded-xl"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages list */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-3">
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <Languages className="w-4 h-4 text-[#717171]" /> Languages Spoken
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {languages.map((lang, index) => (
                      <span
                        key={index}
                        className="text-xs font-bold text-[#222222] bg-slate-50 border border-slate-150 px-3 py-1 rounded-xl"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Portfolio section */}
              {portfolioItems.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-4">
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-[#717171]" /> Portfolio & Case Studies
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {portfolioItems.map((item) => (
                      <div key={item.id} className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-150 p-4 space-y-2">
                        {item.media_url && (
                          <div className="h-40 rounded-xl overflow-hidden bg-slate-200 mb-2">
                            <img
                              src={item.media_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h4 className="font-extrabold text-slate-900 text-sm">{item.title}</h4>
                        {item.description && (
                          <p className="text-[#484848] text-xs line-clamp-2">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Endorsements / Recommendations Section */}
              {recommendations.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-4">
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ThumbsUp className="w-4 h-4 text-[#717171]" /> Recommendations & Endorsements
                  </h2>
                  <div className="space-y-4 divide-y divide-slate-100">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="pt-4 first:pt-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-xs">
                            {rec.recommender?.name || "Colleague"}
                          </span>
                          <span className="text-[10px] text-[#717171] font-bold">
                            {rec.relationship}
                          </span>
                        </div>
                        <p className="text-[#484848] text-xs italic leading-relaxed">
                          "{rec.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                      Client Reviews ({person.review_count || 0})
                    </h2>
                    {ratingData.avgRating > 0 && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#717171]">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span className="font-bold text-slate-800">{ratingData.avgRating}</span>
                        </div>
                        {ratingData.recommendPercentage > 0 && (
                          <span>• {ratingData.recommendPercentage}% would recommend</span>
                        )}
                      </div>
                    )}
                  </div>

                  {isAuthenticated && person.user_id !== currentUser?.id && (
                    <Button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      size="sm"
                      variant="outline"
                      className="rounded-xl text-xs font-bold"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      {showReviewForm ? "Cancel" : "Write Review"}
                    </Button>
                  )}
                </div>

                {/* Submit Review Form */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm">Write a Review</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#717171]">Rating:</span>
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
                        className="bg-[#E1392A] hover:bg-[#b0221e] text-white font-bold text-xs h-9 px-4 rounded-xl"
                      >
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <p className="text-xs text-[#717171] italic text-center py-4">
                    No client reviews yet. Be the first to leave a review!
                  </p>
                ) : (
                  <div className="space-y-4 divide-y divide-slate-100">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs">
                              {rev.reviewer?.name || "Client"}
                            </span>
                            <div className="flex items-center gap-0.5 text-amber-500">
                              <Star className="w-3 h-3 fill-amber-500" />
                              <span className="text-[11px] font-bold">{rev.rating}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#717171]">
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {rev.title && (
                          <h4 className="font-extrabold text-slate-800 text-xs">{rev.title}</h4>
                        )}
                        <p className="text-[#484848] text-xs leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right side contact information box */}
            <div className="lg:col-span-4 space-y-6">
              {/* Sticky Contact Sidebox */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-5 lg:sticky lg:top-24">
                {/* Rate estimates info */}
                <div>
                  <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider block">
                    Consulting Hourly Rate
                  </span>
                  <div className="flex items-baseline text-[#00142E] font-black mt-1">
                    <span className="text-2xl font-bold">$</span>
                    <span className="text-4xl leading-none">{hourlyRate}</span>
                    <span className="text-sm text-[#717171] font-bold ml-1">{currency} / hour</span>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Consultant Availability Indicator */}
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#717171] uppercase tracking-wider block">Advisor Availability</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg border ${
                      person.availability === "Available"
                        ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                        : "text-amber-700 bg-amber-50 border-amber-100"
                    }`}
                  >
                    {person.availability}
                  </span>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Direct Action Connection Controls */}
                <div className="space-y-2.5">
                  <Button
                    onClick={() => handleConnectAction("chat")}
                    className="w-full h-12 bg-[#00142E] hover:bg-slate-800 text-white font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Calendar className="w-4 h-4" /> Book Consultation / Schedule
                  </Button>
                  <Button
                    onClick={() => handleConnectAction("email")}
                    variant="outline"
                    className="w-full h-12 rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" /> Direct Contact Inquiry
                  </Button>
                </div>

                {/* External Social / Professional Links if visible */}
                {(person.linkedin || person.website || person.github || person.twitter) && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 justify-center text-xs font-bold">
                    {person.linkedin && (
                      <a
                        href={person.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    {person.github && (
                      <a
                        href={person.github}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-800 hover:underline"
                      >
                        GitHub
                      </a>
                    )}
                    {person.website && (
                      <a
                        href={person.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#E1392A] hover:underline"
                      >
                        Website
                      </a>
                    )}
                  </div>
                )}

                {/* Disclaimers safety warnings */}
                <p className="text-[10px] text-[#717171] leading-relaxed text-center font-medium">
                  Facilitated directly via NextKinLife networks. Please ensure standard credentials reviews before contracting.
                </p>
              </div>
            </div>
          </div>

          {/* Related Professionals List row */}
          {relatedPeople.length > 0 && (
            <div className="mt-16 space-y-6 pt-10 border-t border-slate-200">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Other Experts in this Category
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPeople.map((related) => (
                  <Link
                    key={related.id}
                    to={`/people/${related.id}`}
                    onClick={() => window.scrollTo(0, 0)}
                    className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col gap-3 hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.01)] transition-all"
                  >
                    <div className="flex gap-3 items-center">
                      <img
                        src={related.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                        alt={related.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-sm"
                      />
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-[#00142E]">
                          {related.name}
                        </h4>
                        <p className="text-[#E1392A] font-bold text-[11px]">
                          {related.profession}
                        </p>
                      </div>
                    </div>
                    <p className="text-[#484848] text-xs line-clamp-2 leading-relaxed">
                      {related.bio}
                    </p>
                    <div className="flex items-center justify-between text-xs font-bold text-[#717171] mt-2">
                      <span className="text-slate-800">${related.pricing?.consultation || 0} / hr</span>
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {related.rating ? related.rating.toFixed(1) : "New"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
