import { MapPin, Clock, Home } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useCountry } from '@/context/CountryContext';
import { SocialQuickConnect } from '@/components/ui/SocialConnect';
import WishlistButton from "@/components/ui/WishlistButton";

export function StayRequestCard({ request }) {
  const { formatPrice } = useCountry();

  if (!request) return null;

  const seekerName = request.seekerName || request.name || request.Host?.full_name || request.host?.full_name || request.User?.name || "Stay Seeker";
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
    <Card className="rounded-2xl border border-border/80 hover:border-accent/30 p-5 sm:p-6 flex flex-col justify-between h-full group hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 relative overflow-hidden text-left bg-card">
      {/* Top Header Block */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar className="w-12 h-12 sm:w-14 sm:h-14">
              <AvatarImage src={userImage} alt={seekerName} />
              <AvatarFallback className="bg-primary text-white font-bold">{initials || "S"}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-base leading-snug group-hover:text-accent transition-colors truncate">
                  {seekerName}
                </h3>
                {isVerified && <StatusBadge status="verified" className="py-0.5 px-2 text-[10px]" />}
              </div>
              {title && (
                <p className="text-xs font-semibold text-accent truncate mt-0.5">
                  {title}
                </p>
              )}
            </div>
          </div>

          <WishlistButton
            itemId={itemId}
            itemType="stay-request"
            className="p-2 rounded-full border border-border/80 bg-muted/50 hover:bg-muted shrink-0 cursor-pointer shadow-xs"
            iconSize={16}
            filledColor="fill-accent text-accent"
            outlineColor="text-muted-foreground hover:text-foreground"
          />
        </div>

        {/* Feature Tags / Badges Row */}
        <div className="flex flex-wrap gap-2 my-3">
          {locationString && (
            <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="truncate max-w-[140px]">{locationString}</span>
            </Badge>
          )}

          {stayType && (
            <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>{stayType}</span>
            </Badge>
          )}

          {furnishing && (
            <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 font-medium">
              <Home className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{furnishing}</span>
            </Badge>
          )}
        </div>

        {/* Description Body */}
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Card Footer: Budget and Social Quick Connect */}
      <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3 mt-auto">
        <div className="min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Target Budget
          </span>
          <span className="text-base sm:text-lg font-bold text-foreground truncate">
            {budget > 0 ? formatPrice(budget, currency) : "Flexible Budget"}
            {budget > 0 && <span className="text-xs font-normal text-muted-foreground ml-1">/mo</span>}
          </span>
        </div>

        <SocialQuickConnect
          socials={socials}
          ownerId={ownerId}
          ownerName={seekerName}
          itemId={itemId}
          itemTitle={title || `Stay Request by ${seekerName}`}
          itemType="stay_request"
        />
      </div>
    </Card>
  );
}
