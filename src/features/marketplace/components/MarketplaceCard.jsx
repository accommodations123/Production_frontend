import React, { useState } from 'react';
import { MapPin, Tag } from 'lucide-react';
import { useCountry } from '@/context/CountryContext';
import WishlistButton from '@/shared/ui/WishlistButton';
import { SocialQuickConnect } from '@/shared/ui/SocialConnect';

export const MarketplaceCard = React.memo(function MarketplaceCard({ product, onClick }) {
  const { formatPrice } = useCountry();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  if (!product || !product.title) return null;

  const imageUrl = product?.images?.length > 0 ? product.images[0] : product?.image || null;

  const sellerContact = {
    name: product.seller?.name || product.User?.name || product.userName || 'Seller',
    whatsapp: product.whatsapp || product.phone || product.seller?.whatsapp || product.Host?.whatsapp || '',
    instagram: product.instagram || product.seller?.instagram || product.Host?.instagram || '',
    facebook: product.facebook || product.seller?.facebook || product.Host?.facebook || '',
    linkedin: product.linkedin || product.seller?.linkedin || product.Host?.linkedin || '',
    email: product.email || product.seller?.email || product.User?.email || product.Host?.User?.email || ''
  };

  const getConditionLabel = (cond) => {
    const clean = (cond || '').toLowerCase();
    if (clean.includes('new') || clean.includes('mint') || clean.includes('like')) return 'Like New';
    if (clean.includes('good') || clean.includes('excellent')) return 'Good';
    return 'Fair';
  };

  const formattedPrice = formatPrice(product.price, product.currency || 'USD');

  return (
    <div
      onClick={() => onClick?.(product)}
      className="relative overflow-hidden rounded-3xl border border-gray-100 shadow-sm h-[350px] flex flex-col bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 select-none cursor-pointer text-left"
    >
      {/* Card Image Header (Matching EventCard & TravelPartnerCard Header Dimensions) */}
      <div className="w-full h-[150px] shrink-0 relative overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05] ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsImageLoaded(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
            <Tag className="w-12 h-12 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Category Status Badge top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="px-2 sm:px-3 py-1 bg-[#00142E] text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg">
            {product.category || "Marketplace"}
          </span>
        </div>

        {/* Wishlist top-right */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <WishlistButton
            itemId={product.id || product._id}
            itemType="buysell"
            className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 rounded-full"
            iconSize={16}
            outlineColor="text-white"
          />
        </div>

        {/* Price Badge at bottom of header */}
        {product.price !== undefined && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-2 sm:px-3 py-1 bg-white/90 backdrop-blur-md text-gray-900 font-bold rounded-lg shadow-lg text-xs sm:text-sm">
              {formattedPrice}
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-3.5 flex-grow flex flex-col gap-2 min-h-0 min-w-0">
        
        {/* Location & Condition */}
        <div className="flex items-center gap-1.5 text-[#484848] text-xs sm:text-sm font-medium">
          <MapPin className="h-3.5 w-3.5 text-[#E1392A] shrink-0" />
          <span className="truncate">
            {product.city || product.location || 'Location TBA'}
          </span>
          {product.condition && (
            <span className="text-[10px] text-[#717171] ml-auto font-bold">
              {getConditionLabel(product.condition)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-sm sm:text-base font-bold text-gray-900 leading-snug truncate group-hover:text-[#E1392A] transition-colors"
          title={product.title}
        >
          {product.title}
        </h3>

        {/* Description snippet */}
        <p className="text-[#222222] text-xs line-clamp-2 leading-relaxed border-l-2 border-gray-100 pl-3">
          {product.description || `Pre-owned ${product.category || 'item'} available for pickup.`}
        </p>

        {/* Footer: Seller Profile & Social Quick Connect */}
        <div className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-gray-100 h-[60px] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#00142E] flex items-center justify-center text-white font-bold text-xs shrink-0">
              {sellerContact.name?.[0] || "S"}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-wider text-[#717171] font-bold leading-none">
                Seller
              </p>
              <p
                className="text-xs font-bold text-gray-900 truncate w-24 sm:w-28 mt-0.5"
                title={sellerContact.name}
              >
                {sellerContact.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <SocialQuickConnect socials={sellerContact} />
          </div>
        </div>

      </div>
    </div>
  );
});
