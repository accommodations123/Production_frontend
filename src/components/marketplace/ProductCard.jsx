import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, ShieldCheck, Tag } from "lucide-react";
import { useCountry } from "@/context/CountryContext";
import WishlistButton from "@/components/ui/WishlistButton";
import { SocialQuickConnect } from "@/components/ui/SocialConnect";
import { formatUTCDate } from "../../utils/timezone";

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
      className={`group block h-full cursor-pointer select-none focus:outline-none`}
    >
      <div className={`bg-white rounded-[1.5rem] border border-[#E5E7EB] hover:border-[#CB2A25]/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden relative ${className}`}>
        {children}
      </div>
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

  const imageUrl =
    product?.images?.length > 0
      ? product.images[0]
      : product?.image || null;

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

  const isVerified = product.status === "active";

  return (
    <CardContainer onClick={handleCardClick}>
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsImageLoaded(true)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z'%3E%3C/path%3E%3Cline x1='7' y1='7' x2='7.01' y2='7'%3E%3C/line%3E%3C/svg%3E"; // SVG tag icon
            e.target.className = "w-1/2 h-1/2 object-contain mx-auto my-auto opacity-50";
            e.target.classList.remove('opacity-0');
          }}
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          {isVerified ? (
            <div className="bg-green-500/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-green-400/50">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-bold text-white">Verified</span>
            </div>
          ) : (
            <div className="bg-red-500/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-red-400/50">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-bold text-white">Unverified</span>
            </div>
          )}
        </div>

        {/* Top Right Heart */}
        <div className="absolute top-4 right-4 z-20">
          <WishlistButton
            itemId={product.id || product._id}
            itemType="buysell"
            className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-sm border border-white/20 bg-black/20 hover:bg-white group"
            iconSize={16}
            outlineColor="text-white group-hover:text-[#CB2A25]"
            filledColor="fill-[#CB2A25] text-[#CB2A25]"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3.5 sm:p-4 md:p-5 flex-grow flex flex-col gap-3 sm:gap-4 min-w-0">
        {/* Title & Location */}
        <div className="space-y-1">
          <h3 className="font-bold text-lg leading-tight line-clamp-1 text-[#00142E] group-hover:text-[#CB2A25] transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center gap-1.5 text-[#00142E]/60 text-sm font-medium">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">
              {product.location || [product.city, product.state, product.country].filter(Boolean).join(", ") || "Location not specified"}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#00142E]/70 min-w-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#CB2A25]" />
            <span className="font-medium">{product.condition || "Used"}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <Tag className="w-3.5 h-3.5 text-[#CB2A25] shrink-0" />
            <span className="font-medium truncate">{product.category || "Furniture"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#CB2A25]" />
            <span className="font-medium whitespace-nowrap">{postedDate}</span>
          </div>
        </div>

        {/* Price & Actions Row */}
        <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-[#00142E]">
                {formatPrice(product.price || 0)}
              </span>
            </div>
          </div>

          {/* Social Media Quick Connect */}
          <SocialQuickConnect
            socials={socials}
            ownerId={product.sellerId || product.seller_id || product.user_id || product.userId || product.Host?.user_id || product.host?.user_id || product.Host?.id || product.host?.id || product.creator?.id}
            ownerEmail={product.sellerEmail || product.email || product.seller_email || product.Host?.email || product.host?.email}
            ownerName={product.sellerName || product.seller_name || "Seller"}
            itemId={product.id || product._id}
            itemTitle={product.title}
            itemType="buysell"
          />
        </div>
      </div>
    </CardContainer>
  );
})