import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Eye, Clock, Hash, Share2, ZoomIn,
  Star, ChevronRight, ChevronDown, ChevronUp, Flag, AlertTriangle, Shield, ArrowRight, CheckCircle, Phone, Mail, UserPlus
} from "lucide-react";
import WishlistButton from "@/components/ui/WishlistButton";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useCountry } from "@/context/CountryContext";
import { useGetBuySellByIdQuery, useGetBuySellListingsQuery } from "@/hooks/data/useMarketplaceHooks";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  useGetConnectionStatusQuery,
  useSendConnectionRequestMutation
} from "@/hooks/data/useConnectionHooks";
import { normalizeImages, resolveImageUrl } from "@/lib/imageUtils";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";

const RED = "#E1392A";
const BODY_FONT = `"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

function Badge({
  children,
  variant = "default",
}) {
  const colors = {
    default: "bg-slate-100 text-[#484848] border border-slate-200/50",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100/60",
    warning: "bg-amber-50 text-amber-700 border border-amber-100/60",
    red: "bg-red-50 text-[#E1392A] border border-red-100/60",
    info: "bg-blue-50 text-blue-700 border border-blue-100/60",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all ${colors[variant]}`}>
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

  const baseProduct = initialProduct?.listing || initialProduct?.item || initialProduct?.data || initialProduct || {};
  const targetId = baseProduct?.id || baseProduct?._id;
  const { data: fetchedRaw } = useGetBuySellByIdQuery(
    targetId,
    { skip: !targetId }
  );

  const fetchedProduct = fetchedRaw?.listing || fetchedRaw?.item || fetchedRaw?.data || fetchedRaw;
  const raw = fetchedProduct || baseProduct;

  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id || currentUser?.user_id;

  const sellerUserId = raw.sellerId || raw.seller_id || raw.user_id || raw.userId || raw.Host?.user_id || raw.host?.user_id || raw.Host?.id || raw.host?.id || raw.creator?.id;

  const currentItemId = targetId || raw.id || raw._id;
  const { data: statusRes } = useGetConnectionStatusQuery(
    currentItemId ? { targetUserId: sellerUserId, itemId: currentItemId } : sellerUserId,
    {
      skip: !sellerUserId || !currentUserId || String(sellerUserId) === String(currentUserId)
    }
  );
  const [sendReq, { isLoading: isSending }] = useSendConnectionRequestMutation();

  const connStatus = statusRes?.status || "none";

  const product = {
    ...raw,
    sellerName: raw.sellerName || raw.seller_name || raw.name || "Seller",
    sellerPhone: raw.sellerPhone || raw.phone || raw.seller_phone,
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

  const normImages = normalizeImages(
    product.images && product.images.length > 0
      ? product.images
      : (product.image ? [product.image] : (product.photos || []))
  );

  const images = normImages.length > 0 ? normImages : [FALLBACK_IMAGE];
  const mainImage = imgError ? FALLBACK_IMAGE : (images[activeImg] || images[0] || FALLBACK_IMAGE);
  const shortId = (product.id || product._id || "0000").toString().slice(-4).toUpperCase();
  const memberYear = (raw.created_at || raw.createdAt)
    ? new Date(raw.created_at || raw.createdAt).getFullYear() : null;

  const original = Number(product.original_price || product.mrp || 0);
  const price = Number(product.price || 0);
  const discountPct = original > price && original > 0 ? Math.round(((original - price) / original) * 100) : 0;

  const rating = Number(product.sellerRating || product.rating || 0);
  const responseRate = product.response_rate || product.responseRate;
  const responseTime = product.response_time || product.responseTime;
  const languages = Array.isArray(product.languages) ? product.languages.join(", ") : product.languages;
  const isVerified = product.status?.toLowerCase() === "active" || product.status?.toLowerCase() === "approved";
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

  // Related listings in the same category or marketplace
  const { data: relatedRaw } = useGetBuySellListingsQuery(
    product.category ? { category: product.category, country: product.country } : { country: product.country }
  );
  const rawRelatedList = Array.isArray(relatedRaw) ? relatedRaw : (relatedRaw?.listings || relatedRaw?.items || relatedRaw?.data || []);
  const related = rawRelatedList
    .filter((p) => {
      const pId = p.id || p._id;
      const currentId = product.id || product._id;
      return pId && (!currentId || String(pId) !== String(currentId)) && (p.title || p.name);
    })
    .slice(0, 3);

  const descLong = (product.description || "").length > 240;
  const descText = product.description || "No description provided.";

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleContact = () => {
    if (product.sellerPhone) {
      window.open(`https://wa.me/${product.sellerPhone.replace(/\D/g, "")}`, "_blank", "noopener,noreferrer");
    } else if (product.sellerEmail) {
      window.open(`mailto:${product.sellerEmail}`);
    } else {
      toast.info("Seller contact details are not available.");
    }
  };

  const renderContactActions = () => {
    if (sellerUserId && currentUserId && String(sellerUserId) !== String(currentUserId)) {
      if (connStatus !== "accepted") {
        const handleConnectClick = async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!currentUserId) {
            toast.error("Please sign in to send a connection request.");
            return;
          }
          try {
            await sendReq({
              targetUserId: sellerUserId,
              targetName: product.sellerName || "Seller",
              itemId: product.id || product._id,
              itemTitle: product.title,
              itemType: "buysell",
              requesterPhone: currentUser?.phone || "",
              requesterEmail: currentUser?.email || ""
            }).unwrap();
            toast.success(`Connection request sent to ${product.sellerName || "the seller"}!`);
          } catch (err) {
            toast.error(err?.data?.message || "Failed to send connection request.");
          }
        };

        if (connStatus === "pending") {
          return (
            <button
              type="button"
              disabled
              className="w-full h-12 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed select-none text-xs"
            >
              <Clock className="w-4 h-4" />
              Connection Request Pending Approval
            </button>
          );
        }

        return (
          <button
            type="button"
            disabled={isSending}
            onClick={handleConnectClick}
            className="w-full h-12 bg-[#E1392A] hover:bg-[#C82E20] text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            Send Connection Request to View Contacts
          </button>
        );
      }
    }

    const actions = [];

    // Call
    if (product.sellerPhone) {
      actions.push({
        label: "Call",
        icon: <Phone className="w-3.5 h-3.5" />,
        onClick: () => window.open(`tel:${product.sellerPhone.trim()}`),
      });
    }

    // Email
    if (product.sellerEmail) {
      actions.push({
        label: "Email",
        icon: <Mail className="w-3.5 h-3.5" />,
        onClick: () => window.open(`mailto:${product.sellerEmail.trim()}`),
      });
    }

    // Instagram
    if (product.sellerInstagram) {
      actions.push({
        label: "Instagram",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        ),
        onClick: () => {
          const ig = product.sellerInstagram.trim().replace(/^@/, '');
          window.open(`https://instagram.com/${ig}`, '_blank', 'noopener,noreferrer');
        },
      });
    }

    // Facebook
    if (product.sellerFacebook) {
      actions.push({
        label: "Facebook",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        ),
        onClick: () => {
          const fb = product.sellerFacebook.trim();
          const url = fb.startsWith('http') ? fb : `https://facebook.com/${fb}`;
          window.open(url, '_blank', 'noopener,noreferrer');
        },
      });
    }

    return (
      <div className="space-y-3">
        {/* Primary Contact: WhatsApp */}
        {product.sellerPhone && (
          <button
            onClick={() => {
              const cleanNumber = product.sellerPhone.replace(/\D/g, '');
              window.open(`https://wa.me/${cleanNumber}`, '_blank', 'noopener,noreferrer');
            }}
            className="w-full h-12 bg-[#E1392A] hover:bg-[#C82E20] text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-[#E1392A]/10 active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 448 512" fill="currentColor">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 480l117.7-30.9c32.4 17.7 68.9 27 106.2 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
            </svg>
            Connect on WhatsApp
          </button>
        )}

        {/* Secondary Contact Grid */}
        {actions.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {actions.map((act, idx) => (
              <button
                key={idx}
                onClick={act.onClick}
                className="h-10 border border-slate-200 text-[#222222] bg-white hover:bg-slate-50 transition-all rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {act.icon}
                {act.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const scrollToSeller = () => {
    document.getElementById("seller-info")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const openRelated = (item) => {
    navigate(`/marketplace/${item.id || item._id}`);
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
    <div className="pt-2 bg-[#FAFBFD] min-h-screen" style={{ fontFamily: BODY_FONT }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">

        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb
            items={[
              { label: "Marketplace", path: "/marketplace" },
              ...(product.category ? [{ label: product.category, path: `/marketplace?category=${encodeURIComponent(product.category)}` }] : []),
              { label: product.title }
            ]}
          />
        </div>

        {/* ── Top section: gallery + sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">

          {/* Gallery Column (col-span-7) */}
          <div className="lg:col-span-7 min-w-0 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden relative shadow-[0_4px_24px_rgba(0,0,0,0.015)]">
              <div className="relative h-[280px] sm:h-[420px] w-full">
                <img
                  src={mainImage}
                  alt={product.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Floating controls */}
                <div className="absolute top-4 left-4 flex gap-2 z-10">
                  {product.condition && (
                    <Badge variant={product.condition.toLowerCase().includes("new") ? "success" : product.condition.toLowerCase().includes("good") ? "info" : "default"}>
                      {product.condition}
                    </Badge>
                  )}
                </div>

                <div className="absolute top-4 right-4 flex gap-2.5 z-10">
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                    <WishlistButton
                      itemId={product.id || product._id}
                      itemType="buysell"
                      className="h-full w-full flex items-center justify-center cursor-pointer"
                      iconSize={14}
                      outlineColor="text-[#222222]"
                      filledColor="fill-[#E1392A] text-[#E1392A]"
                    />
                  </div>
                  <button onClick={copyLink} className="p-2 bg-white rounded-full shadow-sm border border-slate-100 hover:bg-slate-50 text-[#484848] hover:text-[#222222] transition-all cursor-pointer" title="Share Link">
                    <Share2 size={14} />
                  </button>
                  <button onClick={() => window.open(mainImage, "_blank", "noopener,noreferrer")} className="p-2 bg-white rounded-full shadow-sm border border-slate-100 hover:bg-slate-50 text-[#484848] hover:text-[#222222] transition-all cursor-pointer" title="Zoom Image">
                    <ZoomIn size={14} />
                  </button>
                </div>

                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-lg font-bold">
                    {activeImg + 1} / {images.length}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveImg(i); setImgError(false); }}
                    className={`w-20 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${i === activeImg ? "border-[#E1392A]" : "border-slate-200 hover:border-slate-900"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = FALLBACK_IMAGE; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Sidebar Column (col-span-5) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)] space-y-6">

              {/* Product Info details */}
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                  {product.condition && (
                    <Badge variant={product.condition.toLowerCase().includes("new") ? "success" : product.condition.toLowerCase().includes("good") ? "info" : "default"}>
                      {product.condition}
                    </Badge>
                  )}
                  {product.category && <Badge variant="default">{product.category}</Badge>}
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-[#222222] mb-2 leading-tight">{product.title}</h1>

                <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-[#484848]">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-400" /> {product.location}</span>
                  <span className="text-slate-350">•</span>
                  {product.views != null && (
                    <>
                      <span className="flex items-center gap-1"><Eye size={12} className="text-slate-400" /> {product.views} views</span>
                      <span className="text-slate-350">•</span>
                    </>
                  )}
                  <span className="flex items-center gap-1"><Clock size={12} className="text-slate-400" /> {product.postedTime}</span>
                  <span className="text-slate-350">•</span>
                  <span className="flex items-center gap-1"><Hash size={12} className="text-slate-400" /> NKL-{shortId}</span>
                </div>
              </div>

              {/* Price details section */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#222222]">{formatPrice ? formatPrice(price) : `${product.currency || '₹'} ${price.toLocaleString()}`}</span>
                  {original > price && (
                    <>
                      <span className="text-sm text-slate-400 font-bold line-through">{formatPrice ? formatPrice(original) : `${product.currency || '₹'} ${original.toLocaleString()}`}</span>
                      {discountPct > 0 && <Badge variant="red">{discountPct}% off</Badge>}
                    </>
                  )}
                </div>
                {product.negotiable && (
                  <div className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center gap-1.5">
                    <CheckCircle size={12} />
                    <span>Price is negotiable</span>
                  </div>
                )}
              </div>

              {/* Seller Contact widget */}
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Contact Seller</span>
                {renderContactActions()}
              </div>

              {/* Mini Seller Profile Card */}
              <div className="border-t border-slate-100 pt-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00142E] text-white flex items-center justify-center font-bold relative shrink-0 overflow-hidden border border-slate-100 shadow-sm">
                    {sellerAvatarUrl ? (
                      <img src={sellerAvatarUrl} alt={product.sellerName} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      product.sellerName ? product.sellerName.charAt(0).toUpperCase() : 'S'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-[#222222]">{product.sellerName}</span>
                      {isVerified && <CheckCircle size={12} className="text-green-600" />}
                    </div>
                    {memberYear && (
                      <div className="text-xs text-[#484848] font-semibold mt-0.5">
                        Since {memberYear}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={scrollToSeller}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 text-[#484848] bg-white hover:bg-slate-50 hover:border-slate-350 transition-all cursor-pointer"
                >
                  View Profile
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* ── Below the fold layout: details + safety (col-span-8 and col-span-4) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Details (col-span-8) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Specifications Card */}
            {specs.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.015)]">
                <h2 className="font-extrabold text-[#222222] text-base mb-4">Specifications</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {specs.map(([label, value]) => (
                    <div key={label} className="bg-slate-50/50 rounded-xl p-3 border border-slate-100/60 flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                      <span className="text-sm font-extrabold text-[#222222]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.015)]">
              <h2 className="font-extrabold text-[#222222] text-base mb-4">Description</h2>
              <div>
                <p className="text-[#484848] text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {!showFullDesc && descLong ? descText.slice(0, 320) + "…" : descText}
                </p>
                {descLong && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="mt-3 text-xs font-bold text-[#E1392A] hover:text-[#C82E20] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {showFullDesc ? <><ChevronUp size={13} strokeWidth={2.5} /> Read Less</> : <><ChevronDown size={13} strokeWidth={2.5} /> Read More</>}
                  </button>
                )}
              </div>
            </div>

            {/* Pickup Location Card with Map Pin */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.015)]">
              <h2 className="font-extrabold text-[#222222] text-base mb-4">Pickup Location</h2>

              {/* Map Blueprint Container */}
              <div
                className="w-full rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner"
                style={{ height: 260, backgroundColor: "#E8EDF2" }}
              >
                <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94A3B8" strokeWidth="0.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#map-grid)" />
                  <line x1="0" y1="130" x2="100%" y2="130" stroke="#CBD5E1" strokeWidth="3" />
                  <line x1="200" y1="0" x2="200" y2="100%" stroke="#CBD5E1" strokeWidth="3" />
                  <line x1="0" y1="80" x2="100%" y2="80" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="340" y1="0" x2="340" y2="100%" stroke="#CBD5E1" strokeWidth="1.5" />
                </svg>
                {/* Pin in Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center animate-bounce">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: RED }}
                    >
                      <MapPin size={20} />
                    </div>
                    <div className="mt-2 px-3 py-1.5 bg-[#00142E] rounded-xl shadow-sm text-[10px] font-bold text-white tracking-wide">
                      {product.city || product.location}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-1 text-sm text-[#222222]">
                <div className="flex items-center gap-1.5 font-extrabold text-[#222222]">
                  <MapPin className="h-4 w-4 text-[#E1392A] shrink-0" />
                  <span>{product.location}</span>
                </div>
                {product.street_address && (
                  <p className="pl-5.5 text-xs text-[#717171] font-bold">
                    {product.street_address}
                  </p>
                )}
              </div>
            </div>

            {/* Related Listings */}
            {related.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-extrabold text-[#222222] text-lg">Related Listings</h2>
                  <button onClick={onBack} className="text-xs font-bold text-[#E1392A] hover:text-[#C82E20] flex items-center gap-1 hover:underline cursor-pointer">
                    <span>View All</span> <ArrowRight size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {related.map((item) => (
                    <button
                      key={item.id || item._id}
                      onClick={() => openRelated(item)}
                      className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden group hover:shadow-[0_12px_24px_rgba(0,0,0,0.03)] transition-all text-left flex flex-col h-full cursor-pointer"
                    >
                      <div className="overflow-hidden relative aspect-[16/10] bg-gray-50 border-b border-slate-150">
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
                            <h3 className="font-bold text-[#222222] text-sm leading-snug line-clamp-1 group-hover:text-[#E1392A] transition-colors">{item.title}</h3>
                            <span className="text-sm font-extrabold text-[#222222] shrink-0">{formatPrice ? formatPrice(item.price || 0) : `${item.currency || '₹'} ${item.price}`}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#717171] font-semibold mb-3">
                            <MapPin size={11} />
                            <span className="line-clamp-1">{item.location || [item.city, item.country].filter(Boolean).join(", ")}</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.category || "Item"}</span>
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
            <div id="seller-info" className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.015)] space-y-4">
              <h3 className="font-extrabold text-[#222222] text-sm mb-1">Seller Information</h3>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#00142E] text-white flex items-center justify-center font-bold text-lg relative shrink-0 overflow-hidden border border-slate-100 shadow-sm">
                  {sellerAvatarUrl ? (
                    <img src={sellerAvatarUrl} alt={product.sellerName} className="w-full h-full object-cover" />
                  ) : (
                    product.sellerName ? product.sellerName.charAt(0).toUpperCase() : 'S'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-extrabold text-[#222222]">{product.sellerName}</span>
                    {isVerified && <CheckCircle size={13} className="text-green-600 shrink-0" />}
                  </div>
                  <div className="text-xs font-semibold text-[#717171]">
                    {isVerified ? "Verified Seller" : "Seller"}{memberYear ? ` · Since ${memberYear}` : ""}
                  </div>
                </div>
              </div>



              <div className="space-y-2.5 text-xs font-bold text-[#717171] border-b border-slate-100 pb-4">
                <div className="flex justify-between gap-3">
                  <span className="shrink-0">Location</span>
                  <span className="font-extrabold text-[#222222] truncate max-w-[150px]">{product.location}</span>
                </div>
                {languages && (
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0">Languages</span>
                    <span className="font-extrabold text-[#222222] truncate max-w-[150px]">{languages}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Contact Seller</span>
                {renderContactActions()}
              </div>
            </div>

            {/* Buying tips card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.015)]">
              <div className="flex items-center gap-2 mb-3 text-sm font-extrabold text-[#222222]">
                <Shield size={15} className="text-slate-400" /> Buying Tips
              </div>
              <ul className="space-y-2.5 text-xs font-semibold text-[#717171]">
                <li className="flex items-start gap-2"><CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" /> Inspect item before payment</li>
                <li className="flex items-start gap-2"><CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" /> Meet in a public place</li>
                <li className="flex items-start gap-2"><CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" /> Verify seller on NKL profile</li>
                <li className="flex items-start gap-2"><AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" /> Never pay via gift cards or wire</li>
              </ul>
              <button className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#717171] hover:text-[#E1392A] transition-colors cursor-pointer">
                <Flag size={12} /> Report this listing
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Mobile sticky bottom CTA */}
      <div className="md:hidden fixed bottom-[56px] left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3 z-40 shadow-lg">
        <div>
          <div className="text-lg font-black text-[#222222]">{formatPrice ? formatPrice(price) : `${product.currency || '₹'} ${price}`}</div>
          <div className="text-xs font-bold text-[#717171]">
            {product.condition} {product.negotiable && "· Negotiable"}
          </div>
        </div>
        <div className="flex-1 max-w-[200px]">
          <button
            onClick={handleContact}
            className="w-full py-2.5 text-sm font-bold rounded-xl text-white hover:bg-[#C82E20] transition-colors shadow-sm cursor-pointer"
            style={{ backgroundColor: RED }}
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}
