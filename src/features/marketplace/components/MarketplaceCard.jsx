import React, { useState } from "react";
import { MapPin, ShieldCheck } from "lucide-react";
import { useCountry } from "@/context/CountryContext";
import WishlistButton from "@/shared/ui/WishlistButton";
import { useNavigate } from "react-router-dom";

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
      <div className={`bg-white rounded-3xl border border-[#E5E7EB] hover:border-gray-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-[350px] flex flex-col overflow-hidden relative ${className}`}>
        {children}
      </div>
    </div>
  );
};

export const MarketplaceCard = React.memo(({ product, onClick }) => {
  const { formatPrice } = useCountry();
  const navigate = useNavigate();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  if (!product || !product.title) return null;

  const imageUrl =
    product?.images?.length > 0
      ? product.images[0]
      : product?.image || null;

  const isVerified = product.status === "active";

  const getConditionStyle = (cond) => {
    const clean = (cond || "").toLowerCase();
    if (clean.includes("new") || clean === "mint" || clean.includes("like")) {
      return "bg-emerald-50 text-emerald-700 border border-emerald-100/50";
    }
    if (clean.includes("good") || clean.includes("excellent")) {
      return "bg-blue-50 text-blue-700 border border-blue-100/50";
    }
    if (clean.includes("fair")) {
      return "bg-amber-50 text-amber-700 border border-amber-100/50";
    }
    return "bg-gray-50 text-[#222222] border border-gray-150";
  };

  const handleCardClick = () => {
    if (typeof onClick === "function") {
      onClick(product);
    } else {
      navigate(`/marketplace?product=${product.id || product._id}`);
    }
  };

  return (
    <CardContainer onClick={handleCardClick}>
      <div className="relative h-[170px] w-full shrink-0 overflow-hidden bg-gray-100">        <img
        src={imageUrl}
        alt={product.title}
        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsImageLoaded(true)}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z'%3E%3C/path%3E%3Cline x1='7' y1='7' x2='7.01' y2='7'%3E%3C/line%3E%3C/svg%3E";
          e.target.className = "w-1/2 h-1/2 object-contain mx-auto my-auto opacity-50";
          e.target.classList.remove('opacity-0');
        }}
        loading="lazy"
      />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-20 flex gap-2">
          {isVerified ? (
            <div className="bg-green-500/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-green-400/50">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Verified</span>
            </div>
          ) : (
            <div className="bg-red-500/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-red-400/50">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Unverified</span>
            </div>
          )}
        </div>

        {/* Top Right Heart */}
        <div className="absolute top-3 right-3 z-20">
          <WishlistButton
            itemId={product.id || product._id}
            itemType="buysell"
            className="h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-sm border border-white/20 bg-black/20 hover:bg-white group"
            iconSize={14}
            outlineColor="text-white group-hover:text-[#E1392A]"
            filledColor="fill-[#E1392A] text-[#E1392A]"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-5">        {/* Title & Price Row */}
        <div className="flex justify-between items-start gap-2 min-w-0">
          <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-1 text-[#00142E] group-hover:text-[#E1392A] transition-colors" title={product.title}>
            {product.title}
          </h3>
          <span className="font-bold text-[#00142E] text-sm sm:text-base whitespace-nowrap shrink-0">
            {formatPrice(product.price || 0)}
          </span>
        </div>

        {/* Location Row */}
        <div className="flex items-center gap-1.5 text-[#717171] text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#717171]" />
          <span className="truncate">
            {product.location || [product.city, product.state, product.country].filter(Boolean).join(", ") || "Location not specified"}
          </span>
        </div>

        {/* Condition & Rating Row */}
        <div className="flex items-center justify-between mt-1">
          <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold tracking-wide ${getConditionStyle(product.condition)}`}>
            {product.condition || "Used"}
          </span>

        </div>

        {/* View Listing Button Footer */}
        <div className="mt-auto pt-3 border-t border-gray-100 shrink-0">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="w-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 rounded-2xl py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer text-center"
          >
            View Listing
          </button>
        </div>
      </div>
    </CardContainer>
  );
});
