import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { useCountry } from "@/context/CountryContext";
import WishlistButton from "@/components/ui/WishlistButton";
import { SocialQuickConnect } from "@/components/ui/SocialConnect";
import { formatUTCDate } from "@/lib/timezone";
import { resolveImageUrl } from "@/lib/imageUtils";

export const CardContainer = ({ children, onClick, className = "" }) => {
  const navigate = (e) => {
    // Ignore clicks on buttons/icons/links
    if (e.target.closest("button") || e.target.closest("a")) return;
    if (typeof onClick === "function") {
      onClick(e);
    }
  };

  return (
    <div
      onClick={navigate}
      className="group block h-full cursor-pointer select-none focus:outline-none"
    >
      <Card className={`rounded-2xl border border-border/80 hover:border-accent/30 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full flex flex-col overflow-hidden relative bg-card ${className}`}>
        {children}
      </Card>
    </div>
  );
};

export const ProductCard = React.memo(function ProductCard({ product, onClick }) {
  const navigate = useNavigate();
  const { formatPrice } = useCountry();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  if (!product || !product.title) return null;

  const handleCardClick = () => {
    if (typeof onClick === "function") {
      onClick(product);
    } else {
      const targetId = product.id || product._id;
      if (targetId) {
        navigate(`/marketplace/${targetId}`);
      }
    }
  };

  const socials = {
    whatsapp:
      product.sellerPhone ||
      product.phone ||
      product.whatsapp ||
      product.Host?.whatsapp ||
      product.host?.whatsapp ||
      product.Host?.phone ||
      product.host?.phone ||
      "",

    email:
      product.sellerEmail ||
      product.email ||
      product.seller_email ||
      product.Host?.email ||
      product.host?.email ||
      "",

    instagram:
      product.sellerInstagram ||
      product.instagram ||
      product.seller_instagram ||
      product.Host?.instagram ||
      product.host?.instagram ||
      "",

    facebook:
      product.sellerFacebook ||
      product.facebook ||
      product.seller_facebook ||
      product.Host?.facebook ||
      product.host?.facebook ||
      "",
  };

  const normImgs = Array.isArray(product?.images)
    ? product.images
    : (product?.images ? [product.images] : []);
  const rawImage = normImgs[0] || product?.image || product?.photos?.[0] || null;
  const imageUrl = resolveImageUrl(rawImage);

  const getPostedDateDisplay = () => {
    if (product?.postedTime) return product.postedTime;
    const rawDate = product?.created_at || product?.createdAt;
    if (!rawDate) return "Recently";
    if (rawDate.includes("T")) {
      const parts = rawDate.split("T");
      return formatUTCDate(parts[0], parts[1].slice(0, 5));
    }
    return formatUTCDate(rawDate);
  };
  const postedDate = getPostedDateDisplay();

  const isVerified = product.status === "active" || product.status === "approved";

  return (
    <CardContainer onClick={handleCardClick}>
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsImageLoaded(true)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z'%3E%3C/path%3E%3Cline x1='7' y1='7' x2='7.01' y2='7'%3E%3C/line%3E%3C/svg%3E";
              e.target.className = "w-1/2 h-1/2 object-contain mx-auto my-auto opacity-50";
              setIsImageLoaded(true);
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
            <Tag className="w-12 h-12 stroke-[1.25]" />
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 z-20">
          <StatusBadge status={isVerified ? "verified" : "pending"} />
        </div>

        {/* Top Right Heart */}
        <div className="absolute top-3.5 right-3.5 z-20">
          <WishlistButton
            itemId={product.id || product._id}
            itemType="buysell"
            className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-xs border border-white/20 bg-black/20 hover:bg-white group"
            iconSize={16}
            outlineColor="text-white group-hover:text-accent"
            filledColor="fill-accent text-accent"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-grow flex flex-col gap-3 min-w-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-1 text-foreground group-hover:text-accent transition-colors">
              {product.title}
            </h3>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
            <span className="flex items-center gap-1 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-accent" />
              {product.city || product.location || "Location Info"}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-muted-foreground" />
              {postedDate}
            </span>
          </div>
        </div>

        {/* Category & Condition tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {product.category && (
            <Badge variant="secondary" className="text-[11px] font-medium py-0.5 px-2">
              {product.category}
            </Badge>
          )}
          {product.condition && (
            <Badge variant="outline" className="text-[11px] font-medium py-0.5 px-2">
              {product.condition}
            </Badge>
          )}
        </div>

        {/* Price & Actions Row */}
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-border/60">
          <div>
            <span className="text-lg sm:text-xl font-bold text-foreground">
              {Number(product.price) > 0 ? formatPrice(product.price, product.currency) : "Free"}
            </span>
          </div>

          <SocialQuickConnect
            socials={socials}
            ownerId={product.user_id || product.userId || product.seller_id || product.sellerId || product.Host?.user_id || product.host?.user_id || product.Host?.id || product.host?.id || product.id}
            ownerName={product.sellerName || product.seller_name || product.userName || product.user_name || "Seller"}
            itemId={product.id || product._id}
            itemTitle={product.title}
            itemType="marketplace"
          />
        </div>
      </div>
    </CardContainer>
  );
});