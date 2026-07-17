import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Eye, Clock, Hash, Share2, ZoomIn,
  Star, ChevronRight, ChevronDown, ChevronUp, Flag, AlertTriangle, Shield, ArrowRight, CheckCircle
} from "lucide-react";
import WishlistButton from "@/shared/ui/WishlistButton";
import { useCountry } from "@/context/CountryContext";
import { useGetBuySellByIdQuery, useGetBuySellListingsQuery } from "@/store/api/hostApi";
import { toast } from "sonner";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";

const RED = "#C92A26";
const BODY_FONT = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

function Badge({
  children,
  variant = "default",
}) {
  const colors = {
    default: "bg-[#E2E8F0] text-[#5B6B7F]",
    success: "bg-green-50 text-green-700 border border-green-100/50",
    warning: "bg-amber-50 text-amber-700 border border-amber-100/50",
    red: "bg-red-50 text-[#C92A26] border border-red-100/50",
    info: "bg-blue-50 text-blue-700 border border-blue-100/50",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${colors[variant]}`}>
      {children}
    </span>
  );
}

export default function ProductDetailView({ product: initialProduct, onBack }) {
  const navigate = useNavigate();
  const { formatPrice } = useCountry();
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const { data: fetchedProduct } = useGetBuySellByIdQuery(
    initialProduct.id || initialProduct._id,
    { skip: !initialProduct.id && !initialProduct._id }
  );

  const raw = fetchedProduct || initialProduct;

  const product = {
    ...raw,
    sellerName: raw.sellerName || raw.name || "Seller",
    sellerPhone: raw.sellerPhone || raw.phone,
    sellerEmail: raw.sellerEmail || raw.email || raw.seller_email,
    sellerInstagram: raw.sellerInstagram || raw.instagram || raw.seller_instagram,
    sellerFacebook: raw.sellerFacebook || raw.facebook || raw.seller_facebook || raw.Host?.facebook || raw.host?.facebook,
    location:
      raw.location ||
      [raw.city, raw.state, raw.country].filter(Boolean).join(", ") ||
      "Location not specified",
    postedTime:
      raw.postedTime ||
      ((raw.created_at || raw.createdAt)
        ? new Date(raw.created_at || raw.createdAt).toLocaleDateString()
        : "Recently"),
  };

  const images =
    Array.isArray(product.images) && product.images.length
      ? product.images
      : product.image ? [product.image] : [FALLBACK_IMAGE];

  const mainImage = imgError ? FALLBACK_IMAGE : images[activeImg] || images[0] || FALLBACK_IMAGE;
  const shortId = (product.id || product._id || "0000").toString().slice(-4).toUpperCase();
  const memberYear = (raw.created_at || raw.createdAt)
    ? new Date(raw.created_at || raw.createdAt).getFullYear() : null;

  const original = Number(product.original_price || product.mrp || 0);
  const price = Number(product.price || 0);
  const discountPct = original > price && original > 0 ? Math.round(((original - price) / original) * 100) : 0;

  const rating = Number(product.sellerRating || product.rating || 0);
  const reviewsCount = product.reviews_count ?? product.reviewCount ?? product.reviews;
  const responseRate = product.response_rate || product.responseRate;
  const responseTime = product.response_time || product.responseTime;
  const languages = Array.isArray(product.languages) ? product.languages.join(", ") : product.languages;
  const isVerified = product.status === "active";
  const sellerAvatarUrl = product.sellerImage || product.sellerAvatar || product.avatar || product.Host?.avatar || product.host?.avatar || product.Host?.image || product.host?.image || null;

  const specs = [
    product.brand && ["Brand", product.brand],
    product.model && ["Model", product.model],
    product.condition && ["Condition", product.condition],
    product.age && ["Age", product.age],
    product.warranty && ["Warranty", product.warranty],
    product.color && ["Color", product.color],
    product.year && ["Year", product.year],
    product.mileage && ["Mileage", product.mileage],
    product.fuel_type && ["Fuel Type", product.fuel_type],
    product.transmission && ["Transmission", product.transmission],
    product.category && ["Category", product.category],
    product.subcategory && ["Subcategory", product.subcategory],
    ["Negotiable", product.negotiable ? "Yes" : "No"],
  ].filter(Boolean);

  // Related listings in the same category
  const { data: relatedRaw } = useGetBuySellListingsQuery(
    { category: product.category, country: product.country },
    { skip: !product.category }
  );
  const related = (relatedRaw || [])
    .filter((p) => (p.id || p._id) !== (product.id || product._id) && p.title)
    .slice(0, 3);

  const descLong = (product.description || "").length > 240;
  const descText = product.description || "No description provided.";

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/marketplace?product=${product.id || product._id}`);
    toast.success("Link copied to clipboard!");
  };

  const handleContact = () => {
    if (product.sellerPhone) {
      window.open(`https://wa.me/${product.sellerPhone.replace(/\D/g, "")}`, "_blank");
    } else if (product.sellerEmail) {
      window.open(`mailto:${product.sellerEmail}`);
    } else {
      toast.info("Seller contact details are not available.");
    }
  };

  const renderContactButtons = () => {
    const buttons = [];

    // WhatsApp
    if (product.sellerPhone) {
      buttons.push({
        label: "WhatsApp",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 480l117.7-30.9c32.4 17.7 68.9 27 106.2 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
          </svg>
        ),
        onClick: () => {
          const cleanNumber = product.sellerPhone.replace(/\D/g, '');
          window.open(`https://wa.me/${cleanNumber}`, '_blank');
        },
        className: "bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md shadow-[#25D366]/10",
      });
      // Call
      buttons.push({
        label: "Call",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        ),
        onClick: () => window.open(`tel:${product.sellerPhone.trim()}`),
        className: "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-250 shadow-sm",
      });
    }

    // Email
    if (product.sellerEmail) {
      buttons.push({
        label: "Gmail",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        ),
        onClick: () => window.open(`mailto:${product.sellerEmail.trim()}`),
        className: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 shadow-sm",
      });
    }

    // Instagram
    if (product.sellerInstagram) {
      buttons.push({
        label: "Instagram",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        ),
        onClick: () => {
          const ig = product.sellerInstagram.trim().replace(/^@/, '');
          window.open(`https://instagram.com/${ig}`, '_blank', 'noopener,noreferrer');
        },
        className: "bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-100 shadow-sm",
      });
    }

    // Facebook
    if (product.sellerFacebook) {
      buttons.push({
        label: "Facebook",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        ),
        onClick: () => {
          const fb = product.sellerFacebook.trim();
          const url = fb.startsWith('http') ? fb : `https://facebook.com/${fb}`;
          window.open(url, '_blank', 'noopener,noreferrer');
        },
        className: "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 shadow-sm",
      });
    }

    if (buttons.length === 0) {
      return (
        <div className="text-xs text-[#5B6B7F] text-center py-2 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
          No contact options available
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2 w-full">
        {buttons.map((btn, idx) => {
          const isWhatsApp = btn.label === "WhatsApp";
          const isFullWidth = isWhatsApp && (buttons.length % 2 !== 0);
          return (
            <button
              key={idx}
              onClick={btn.onClick}
              className={`h-10 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${isFullWidth ? "col-span-2 text-sm h-11" : ""} ${btn.className}`}
            >
              {btn.icon}
              {btn.label}
            </button>
          );
        })}
      </div>
    );
  };

  const scrollToSeller = () => {
    document.getElementById("seller-info")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const openRelated = (item) => {
    navigate(`/marketplace?product=${item.id || item._id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Keyboard navigation for image gallery
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      if (e.key === "ArrowLeft") {
        setActiveImg((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        setImgError(false);
      } else if (e.key === "ArrowRight") {
        setActiveImg((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        setImgError(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length]);

  return (
    <div className="pt-4 bg-[#F7F8FA] min-h-screen" style={{ fontFamily: BODY_FONT }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-[#5B6B7F] mb-6">
          <button onClick={onBack} className="hover:text-[#C92A26] transition-colors">Home</button>
          <ChevronRight size={13} className="text-[#C9D5E0]" />
          <button onClick={onBack} className="hover:text-[#C92A26] transition-colors">Marketplace</button>
          {product.category && (
            <>
              <ChevronRight size={13} className="text-[#C9D5E0]" />
              <button onClick={onBack} className="hover:text-[#C92A26] transition-colors">{product.category}</button>
            </>
          )}
          <ChevronRight size={13} className="text-[#C9D5E0]" />
          <span className="text-[#00142E] font-medium truncate max-w-[240px]">{product.title}</span>
        </nav>

        {/* ── Top section: gallery + sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">

          {/* Gallery Column (col-span-7) */}
          <div className="lg:col-span-7 min-w-0">
            <div className="bg-white rounded border border-[#E2E8F0] overflow-hidden mb-3 relative shadow-sm">
              <div className="relative" style={{ height: 420 }}>
                <img 
                  src={mainImage} 
                  alt={product.title} 
                  onError={() => setImgError(true)} 
                  className="w-full h-full object-cover" 
                />
                
                {/* Floating controls */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {product.condition && (
                    <Badge variant={product.condition.toLowerCase().includes("new") ? "success" : product.condition.toLowerCase().includes("good") ? "info" : "default"}>
                      {product.condition}
                    </Badge>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <WishlistButton 
                      itemId={product.id || product._id} 
                      itemType="buysell" 
                      className="h-full w-full flex items-center justify-center" 
                      iconSize={14} 
                      outlineColor="text-gray-500" 
                      filledColor="fill-[#C92A26] text-[#C92A26]" 
                    />
                  </div>
                  <button onClick={copyLink} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-[#5B6B7F] hover:text-[#00142E] transition-colors" title="Share Link">
                    <Share2 size={14} />
                  </button>
                  <button onClick={() => window.open(mainImage, "_blank")} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-[#5B6B7F] hover:text-[#00142E] transition-colors" title="Zoom Image">
                    <ZoomIn size={14} />
                  </button>
                </div>

                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded font-semibold">
                    {activeImg + 1} / {images.length}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
                {images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setActiveImg(i); setImgError(false); }}
                    className={`w-20 h-16 rounded border-2 overflow-hidden shrink-0 transition-all ${i === activeImg ? "border-[#C92A26]" : "border-[#E2E8F0] hover:border-[#00142E]"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = FALLBACK_IMAGE; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Sidebar Column (col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded border border-[#E2E8F0] p-6 shadow-sm">
              
              {/* Card Header details */}
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {product.condition && (
                    <Badge variant={product.condition.toLowerCase().includes("new") ? "success" : product.condition.toLowerCase().includes("good") ? "info" : "default"}>
                      {product.condition}
                    </Badge>
                  )}
                  {product.category && <Badge variant="default">{product.category}</Badge>}
                </div>
                <h1 className="text-xl font-bold text-[#00142E] mb-1 leading-tight" style={{ fontFamily: BODY_FONT }}>{product.title}</h1>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#5B6B7F] mt-2">
                  <span className="flex items-center gap-1"><MapPin size={11} /> {product.location}</span>
                  {product.views != null && <span className="flex items-center gap-1"><Eye size={11} /> {product.views} views</span>}
                  <span className="flex items-center gap-1"><Clock size={11} /> Posted {product.postedTime}</span>
                  <span className="flex items-center gap-1"><Hash size={11} /> ID: NKL-{shortId}</span>
                </div>
              </div>

              {/* Price details section */}
              <div className="border-t border-[#E2E8F0] pt-4 mb-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#00142E]">{formatPrice(price)}</span>
                  {original > price && (
                    <>
                      <span className="text-sm text-[#5B6B7F] line-through">{formatPrice(original)}</span>
                      {discountPct > 0 && <Badge variant="red">{discountPct}% off</Badge>}
                    </>
                  )}
                </div>
                {product.negotiable && (
                  <div className="text-xs text-green-700 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle size={11} /> Price is negotiable
                  </div>
                )}
              </div>

              {/* Seller Contact Grid */}
              <div className="space-y-3 mb-5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#5B6B7F]">Contact Seller</div>
                {renderContactButtons()}
              </div>

              {/* Seller mini card inside sidebar */}
              <div className="border-t border-[#E2E8F0] pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#00142E] text-white flex items-center justify-center font-bold relative shrink-0 overflow-hidden border border-[#E2E8F0]">
                    {sellerAvatarUrl ? (
                      <img src={sellerAvatarUrl} alt={product.sellerName} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      product.sellerName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-[#00142E]">{product.sellerName}</span>
                      {isVerified && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-semibold rounded border border-green-100/50">
                          <CheckCircle size={9} /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#5B6B7F] mt-0.5">
                      {rating > 0 && <span className="flex items-center gap-0.5 text-amber-500 font-semibold"><Star size={11} className="fill-amber-400 text-amber-400" />{rating}</span>}
                      {memberYear && <span>· Member since {memberYear}</span>}
                    </div>
                  </div>
                </div>

                {(responseRate || responseTime) && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#5B6B7F] mt-3">
                    <div className="bg-[#F8F9FA] rounded p-2 border border-gray-100/50">
                      <div className="font-semibold text-[#00142E] text-sm">{responseRate || "—"}</div>
                      <div className="mt-0.5">Response rate</div>
                    </div>
                    <div className="bg-[#F8F9FA] rounded p-2 border border-gray-100/50">
                      <div className="font-semibold text-[#00142E] text-sm">{responseTime || "—"}</div>
                      <div className="mt-0.5">Avg. response</div>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={scrollToSeller}
                    className="flex-grow py-2 text-xs font-semibold rounded border border-[#E2E8F0] text-[#00142E] hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer text-center"
                  >
                    View Profile
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── Below the fold layout: details + safety (col-span-8 and col-span-4) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Details (col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Specifications Card */}
            <div className="bg-white rounded border border-[#E2E8F0] p-6 shadow-sm">
              <h2 className="font-bold text-[#00142E] text-base mb-4">Specifications</h2>
              <div className="divide-y divide-[#E2E8F0]">
                {specs.map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2.5 text-sm">
                    <span className="text-[#5B6B7F] font-medium">{label}</span>
                    <span className="font-bold text-[#00142E]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded border border-[#E2E8F0] p-6 shadow-sm">
              <h2 className="font-bold text-[#00142E] text-base mb-4">Description</h2>
              <div>
                <p className="text-[#5B6B7F] text-sm leading-relaxed whitespace-pre-wrap">
                  {!showFullDesc && descLong ? descText.slice(0, 320) + "…" : descText}
                </p>
                {descLong && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="mt-2 text-sm font-semibold text-[#C92A26] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {showFullDesc ? <><ChevronUp size={14} /> Read Less</> : <><ChevronDown size={14} /> Read More</>}
                  </button>
                )}
              </div>
            </div>

            {/* Pickup Location Card with Figma Road Map */}
            <div className="bg-white rounded border border-[#E2E8F0] p-6 shadow-sm">
              <h2 className="font-bold text-[#00142E] text-base mb-4">Pickup Location</h2>
              
              {/* Figma Map Blueprint */}
              <div
                className="w-full rounded border border-[#E2E8F0] overflow-hidden relative"
                style={{ height: 260, backgroundColor: "#E8EDF2" }}
              >
                {/* SVG grid lines & fake roads */}
                <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94A3B8" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#map-grid)" />
                  <line x1="0" y1="130" x2="100%" y2="130" stroke="#CBD5E1" strokeWidth="3" />
                  <line x1="200" y1="0" x2="200" y2="100%" stroke="#CBD5E1" strokeWidth="3" />
                  <line x1="0" y1="80" x2="100%" y2="80" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="340" y1="0" x2="340" y2="100%" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="0" y1="200" x2="100%" y2="190" stroke="#CBD5E1" strokeWidth="2" />
                </svg>
                {/* Pin in Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: RED }}
                    >
                      <MapPin size={20} />
                    </div>
                    <div className="mt-2.5 px-3 py-1.5 bg-white rounded shadow-sm border border-gray-100 text-xs font-bold text-[#00142E]">
                      {product.city || product.location}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-white rounded px-2.5 py-1 text-xs text-[#5B6B7F] shadow border border-gray-100 cursor-pointer font-semibold hover:bg-gray-50 transition-colors">
                  Map view
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-1 text-sm text-gray-600">
                <div className="flex items-center gap-1.5 font-bold text-[#00142E]">
                  <MapPin className="h-4 w-4 text-[#C92A26] shrink-0" />
                  <span>{product.location}</span>
                </div>
                {product.street_address && (
                  <p className="pl-5.5 text-xs text-gray-500 font-medium">
                    {product.street_address}
                  </p>
                )}
              </div>
            </div>

            {/* Related Listings */}
            {related.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-[#00142E] text-lg">Related Listings</h2>
                  <button onClick={onBack} className="text-sm font-semibold text-[#C92A26] flex items-center gap-1 hover:underline cursor-pointer">
                    <span>View All</span> <ArrowRight size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {related.map((item) => (
                    <button 
                      key={item.id || item._id} 
                      onClick={() => openRelated(item)}
                      className="bg-white rounded border border-[#E2E8F0] overflow-hidden group hover:shadow-md transition-shadow text-left flex flex-col h-full cursor-pointer"
                    >
                      <div className="overflow-hidden relative aspect-[16/10] bg-gray-50 border-b border-gray-100">
                        <img src={(item.images && item.images[0]) || item.image || FALLBACK_IMAGE} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" onError={(e) => { e.target.src = FALLBACK_IMAGE; }} />
                        {item.condition && (
                          <div className="absolute top-3 left-3">
                            <Badge variant={item.condition.toLowerCase().includes("new") ? "success" : item.condition.toLowerCase().includes("good") ? "info" : "default"}>
                              {item.condition}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-[#00142E] text-sm leading-snug line-clamp-1">{item.title}</h3>
                            <span className="text-sm font-bold text-[#00142E] shrink-0">{formatPrice(item.price || 0)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#5B6B7F] mb-3">
                            <MapPin size={11} /> 
                            <span className="line-clamp-1">{item.location || [item.city, item.country].filter(Boolean).join(", ")}</span>
                          </div>
                        </div>
                        
                        <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.category || "Item"}</span>
                          {(item.sellerRating || item.rating) && (
                            <div className="flex items-center gap-1 text-xs text-[#5B6B7F] font-semibold">
                              <Star size={11} className="fill-amber-400 text-amber-400" />
                              {item.sellerRating || item.rating}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar right column (col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Full Seller Information Card */}
            <div id="seller-info" className="bg-white rounded border border-[#E2E8F0] p-5 shadow-sm">
              <h3 className="font-bold text-[#00142E] text-sm mb-4">Seller Information</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#00142E] text-white flex items-center justify-center font-bold text-lg relative shrink-0 overflow-hidden border border-[#E2E8F0]">
                  {sellerAvatarUrl ? (
                    <img src={sellerAvatarUrl} alt={product.sellerName} className="w-full h-full object-cover" />
                  ) : (
                    product.sellerName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-bold text-[#00142E]">{product.sellerName}</span>
                    {isVerified && <CheckCircle size={13} className="text-green-600 shrink-0" />}
                  </div>
                  <div className="text-xs text-[#5B6B7F]">
                    {isVerified ? "Verified Seller" : "Seller"}{memberYear ? ` · Since ${memberYear}` : ""}
                  </div>
                  {rating > 0 && (
                    <div className="flex items-center gap-1 text-xs mt-0.5 font-semibold text-amber-500">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span>{rating}</span>
                      {reviewsCount != null && <span className="text-[#5B6B7F] font-normal">({reviewsCount} reviews)</span>}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-[#5B6B7F] mb-4 border-t border-gray-150 pt-3">
                {responseRate && (
                  <div className="flex justify-between">
                    <span>Response Rate</span>
                    <span className="font-semibold text-[#00142E]">{responseRate}</span>
                  </div>
                )}
                {responseTime && (
                  <div className="flex justify-between">
                    <span>Response Time</span>
                    <span className="font-semibold text-[#00142E]">{responseTime}</span>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <span className="shrink-0">Location</span>
                  <span className="font-semibold text-[#00142E] truncate max-w-[150px]">{product.location}</span>
                </div>
                {languages && (
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0">Languages</span>
                    <span className="font-semibold text-[#00142E] truncate max-w-[150px]">{languages}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 border-t border-[#E2E8F0] pt-3 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#5B6B7F]">Contact Seller</div>
                {renderContactButtons()}
              </div>
            </div>

            {/* Buying tips card */}
            <div className="bg-white rounded border border-[#E2E8F0] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-[#00142E]">
                <Shield size={15} className="text-[#5B6B7F]" /> Buying Tips
              </div>
              <ul className="space-y-2.5 text-xs text-[#5B6B7F]">
                <li className="flex items-start gap-2"><CheckCircle size={12} className="text-green-600 mt-0.5 shrink-0" /> Inspect item before payment</li>
                <li className="flex items-start gap-2"><CheckCircle size={12} className="text-green-600 mt-0.5 shrink-0" /> Meet in a public place</li>
                <li className="flex items-start gap-2"><CheckCircle size={12} className="text-green-600 mt-0.5 shrink-0" /> Verify seller on NKL profile</li>
                <li className="flex items-start gap-2"><AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" /> Never pay via gift cards or wire</li>
              </ul>
              <button className="mt-4 flex items-center gap-1.5 text-xs text-[#5B6B7F] hover:text-[#C92A26] transition-colors cursor-pointer">
                <Flag size={12} /> Report this listing
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Mobile sticky bottom CTA */}
      <div className="md:hidden fixed bottom-[56px] left-0 right-0 bg-white border-t border-[#E2E8F0] px-4 py-3 flex items-center justify-between gap-3 z-40 shadow-lg">
        <div>
          <div className="text-lg font-bold text-[#00142E]">{formatPrice(price)}</div>
          <div className="text-xs text-[#5B6B7F]">
            {product.condition} {product.negotiable && "· Negotiable"}
          </div>
        </div>
        <div className="flex-1 max-w-[200px]">
          <button 
            onClick={handleContact} 
            className="w-full py-2.5 text-sm font-semibold rounded text-white hover:opacity-90 transition-opacity" 
            style={{ backgroundColor: RED }}
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}