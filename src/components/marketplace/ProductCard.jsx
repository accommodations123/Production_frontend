import React from "react";
import { MapPin, Clock, Heart, ImageOff } from "lucide-react";
import { useCountry } from "@/context/CountryContext";

import { Badge } from "@/components/ui/badge";
import WishlistButton from "@/components/ui/WishlistButton";

const FALLBACK_IMAGE = null;

export function ProductCard({ product, onClick }) {
  const { formatPrice } = useCountry();
  if (!product || !product.title) return null;

  const imageUrl =
    product?.images?.length > 0
      ? product.images[0]
      : product?.image || FALLBACK_IMAGE;

  const postedDate = product?.postedTime
    ? product.postedTime
    : product?.createdAt
      ? new Date(product.createdAt).toLocaleDateString()
      : "Recently";

  return (
    <div
      onClick={() => typeof onClick === "function" && onClick(product)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group flex flex-col h-full cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 text-stone-950 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product?.title || "Marketplace product"}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <ImageOff className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Wishlist */}
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton
            itemId={product.id || product._id}
            itemType="buysell"
            className="w-8 h-8 bg-white/80 backdrop-blur-sm hover:bg-white flex items-center justify-center"
            iconSize={16}
            outlineColor="text-gray-400"
          />
        </div>

        {/* Tags */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          {product?.tags?.includes("urgent") && (
            <span className="px-1.5 sm:px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
              Urgent
            </span>
          )}
          {product?.tags?.includes("moving") && (
            <span className="px-1.5 sm:px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-sm">
              Moving
            </span>
          )}
          {product?.status === "pending" && (
            <span className="px-1.5 sm:px-2 py-0.5 bg-yellow-500 text-white text-[10px] font-bold rounded-full shadow-sm">
              Unverified
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <span className="font-bold text-primary text-xs sm:text-sm whitespace-nowrap ml-2">
            {formatPrice(product.price || 0)}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {product.condition && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 sm:h-5 bg-gray-100 text-gray-600 font-medium border-gray-200"
            >
              {product.condition}
            </Badge>
          )}
          <span className="text-[10px] text-gray-400">•</span>
          <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {postedDate}
          </span>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-2.5 sm:pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-500 truncate max-w-[55%]">
            <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
            <span className="truncate">
              {product.location || [product.city, product.state, product.country].filter(Boolean).join(", ") || "Location not specified"}
            </span>
          </div>


        </div>
      </div>
    </div>
  );
}