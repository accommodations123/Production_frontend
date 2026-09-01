import { MapPin, Clock, Home, ShieldCheck } from 'lucide-react';
import { useCountry } from '@/context/CountryContext';
import { SocialQuickConnect } from '@/components/ui/SocialConnect';
import WishlistButton from "@/components/ui/WishlistButton";

export function StayRequestCard({ request }) {
  const { formatPrice } = useCountry();

  if (!request) return null;

  const seekerName = request.seekerName || request.name || request.Host?.full_name || request.host?.full_name || request.User?.name || "";
  const userImage = request.profile_image || request.avatar || request.Host?.User?.profile_image || request.host?.User?.profile_image || request.User?.profile_image || "";
  const city = request.city || request.location || "";
  const state = request.state || "";
  const country = request.country || "";
  const locationString = [city, state, country].filter(Boolean).join(", ");
  const stayType = request.stayType || request.stay_type || "";
  const furnishing = request.furnishing || "";
  const title = request.title || "";
  const description = request.description || "";
  const budget = Number(request.budget || request.price || request.price_per_month || 0);
  const currency = request.currency || "";

  const isVerified = Boolean(request.isVerified || request.verified || request.Host?.verified || request.host?.verified);

  const socials = {
    whatsapp:
      request.whatsappNumber ||
      request.whatsapp ||
      request.Host?.whatsapp ||
      request.host?.whatsapp ||
      request.phone ||
      request.Host?.phone ||
      request.host?.phone ||
      "",
    email:
      request.email ||
      request.Host?.email ||
      request.host?.email ||
      request.Host?.User?.email ||
      request.host?.User?.email ||
      "",
    linkedin:
      request.linkedin ||
      request.Host?.linkedin ||
      request.host?.linkedin ||
      "",
    instagram:
      request.instagram ||
      request.Host?.instagram ||
      request.host?.instagram ||
      "",
    facebook:
      request.facebook ||
      request.Host?.facebook ||
      request.host?.facebook ||
      "",
  };

  const ownerId =
    request.user_id ||
    request.userId ||
    request.seeker_id ||
    request.seekerId ||
    request.Host?.user_id ||
    request.host?.user_id ||
    request.Host?.User?.id ||
    request.host?.User?.id ||
    request.Host?.id ||
    request.host?.id ||
    request.creator?.id ||
    request.id ||
    request._id;

  const itemId = request.id || request._id || "";

  const initials = seekerName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-[1.5rem] border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between h-full group hover:-translate-y-1 hover:border-[#CB2A26]/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden text-left">
      
      {/* Top Header Block */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              {userImage ? (
                <img
                  src={userImage}
                  alt={seekerName}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                  loading="lazy"
                />
              ) : (
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#00142E] text-white font-extrabold text-sm sm:text-base flex items-center justify-center border-2 border-slate-100 shadow-sm">
                  {initials || "S"}
                </div>
              )}
              {isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-xs" title="Verified Seeker">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-[#CB2A26] transition-colors truncate">
                {seekerName}
              </h3>
              {title && (
                <p className="text-xs font-semibold text-[#CB2A26] truncate mt-0.5">
                  {title}
                </p>
              )}
            </div>
          </div>

          <WishlistButton
            itemId={itemId}
            itemType="stay-request"
            className="p-2 rounded-full border border-slate-200/60 bg-slate-50 hover:bg-slate-100 shrink-0 cursor-pointer shadow-xs"
            iconSize={16}
            filledColor="fill-[#CB2A26] text-[#CB2A26]"
            outlineColor="text-slate-400 hover:text-slate-600"
          />
        </div>

        {/* Feature Tags / Badges Row */}
        <div className="flex flex-wrap gap-2 my-3">
          {locationString && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 text-slate-700 text-xs font-semibold border border-slate-200/50">
              <MapPin className="w-3.5 h-3.5 text-[#CB2A26] shrink-0" />
              <span className="truncate max-w-[140px]">{locationString}</span>
            </span>
          )}

          {stayType && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 text-slate-700 text-xs font-semibold border border-slate-200/50">
              <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{stayType}</span>
            </span>
          )}

          {furnishing && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 text-slate-700 text-xs font-semibold border border-slate-200/50">
              <Home className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{furnishing}</span>
            </span>
          )}
        </div>

        {/* Description Body */}
        {description && (
          <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed my-3 font-normal">
            {description}
          </p>
        )}
      </div>

      {/* Footer Action Bar */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Budget</span>
          <span className="text-slate-900 font-extrabold text-lg sm:text-xl">
            {budget > 0 ? formatPrice(budget, currency) : "On Request"}
            {budget > 0 && <span className="text-slate-500 text-xs font-medium"> / mo</span>}
          </span>
        </div>

        {/* Social Quick Connect (Handles Connect Button + Connected Social Icons) */}
        <div className="flex items-center">
          <SocialQuickConnect
            socials={socials}
            ownerId={ownerId}
            ownerName={seekerName}
            itemId={itemId}
            itemTitle={title}
            itemType="accommodations"
          />
        </div>
      </div>

    </div>
  );
}

export default StayRequestCard;
