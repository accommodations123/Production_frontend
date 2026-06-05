"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
import { FilterPanel } from "@/components/marketplace/FilterPanel";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { SellForm } from "@/components/marketplace/SellForm";

import { VerificationModal } from "@/components/marketplace/VerificationModal";
import { ShieldCheck, Zap, Tag, MapPin, Clock, Shield, Share2, Calendar, MessageCircle, Phone, ArrowLeft } from "lucide-react";
import { useCountry } from "@/context/CountryContext";
import { SellerContactButtons, HostDetailSocials } from '@/components/ui/SocialConnect';
import WishlistButton from "@/components/ui/WishlistButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useGetBuySellListingsQuery, useGetHostProfileQuery, useGetBuySellByIdQuery } from "@/store/api/hostApi";
import { useGetMeQuery } from "@/store/api/authApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import HostGuard from "@/components/auth/HostGuard";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/ui/Pagination";

/* ================= COMPONENT ================= */

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const productIdFromUrl = searchParams.get("product");

  const [activeTab, setActiveTab] = useState("buy");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { activeCountry, isSelected } = useCountry();

  const getInitialCountryName = (country) => {
    if (!country?.name) return "";
    let name = country.name;
    if (name === "United States" || name.startsWith("United States")) {
        return "United States of America";
    }
    return name;
  };

  const [filters, setFilters] = useState(() => {
    const countryName = getInitialCountryName(activeCountry);
    return {
      priceMin: "",
      priceMax: "",
      category: "",
      country: countryName,
      state: "",
      city: "",
      search: "",
    };
  });

  const [prevActiveCountryName, setPrevActiveCountryName] = useState(activeCountry?.name || "");

  // Sync country filter inline during render when activeCountry changes
  const activeCountryName = activeCountry?.name || "";
  if (activeCountryName !== prevActiveCountryName) {
    setPrevActiveCountryName(activeCountryName);
    const countryName = getInitialCountryName(activeCountry);
    if (countryName && filters.country !== countryName) {
      setFilters(prev => ({
        ...prev,
        country: countryName,
        state: "",
        city: "",
      }));
    }
  }

  const [viewProduct, setViewProduct] = useState(null);
  const [prevProductFromUrl, setPrevProductFromUrl] = useState(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  // products state is now managed by RTK Query
  const { data: productsData, isLoading: loading, error, refetch } = useGetBuySellListingsQuery({
    country: filters.country || activeCountry?.name,
    state: filters.state === "All States" ? "" : filters.state,
    city: filters.city === "All Cities" ? "" : filters.city,
    category: filters.category,
    minPrice: filters.priceMin,
    maxPrice: filters.priceMax,
    search: filters.search // Assuming search might be added to filters later or passed separately
  });

  // Fetch single product if coming from URL param
  const { data: productFromUrl } = useGetBuySellByIdQuery(productIdFromUrl, {
    skip: !productIdFromUrl
  });

  // Auto-display product from URL param inline during render
  if (productFromUrl !== prevProductFromUrl) {
    setPrevProductFromUrl(productFromUrl);
    if (productFromUrl && productIdFromUrl) {
      setViewProduct(productFromUrl);
    }
  }

  // Clear URL param when closing product view
  const handleBackFromProduct = () => {
    setViewProduct(null);
    if (productIdFromUrl) {
      setSearchParams({});
    }
  };

  const navigate = useNavigate();
  const { data: user } = useGetMeQuery();
  const { data: hostProfile } = useGetHostProfileQuery(undefined, { skip: !user });

  const handleTabChange = (tab) => {
    if (tab === 'sell' && !user) {
      navigate('/signin');
      return;
    }
    setActiveTab(tab);
  };


  const products = productsData || [];

  /* ================= FILTER LOGIC ================= */

  /* ================= FILTER LOGIC ================= */
  // Filtering is now handled by the backend API
  const filteredProducts = products;

  // ✅ Pagination
  const {
    currentItems: paginatedProducts,
    currentPage,
    totalPages,
    goToPage
  } = usePagination(filteredProducts, 12);

  /* ================= HANDLERS ================= */



  const handlePost = () => {
    setActiveTab("buy");
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20">
        <MarketplaceLayout
          activeTab={activeTab}
          onTabChange={handleTabChange}
        >
          {/* ================= BUY TAB ================= */}
          {activeTab === "buy" && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6">

              {!viewProduct && (
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                />
              )}

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-16 max-w-md mx-auto">
                  <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="h-8 w-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to load products</h3>
                  <p className="text-gray-500 mb-6 text-sm">Please check your connection and try again.</p>
                  <Button onClick={() => refetch()} className="bg-[#CB2A25] hover:bg-[#a82220] text-white">
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  {viewProduct ? (
                    <SingleProductView
                      product={viewProduct}
                      onBack={handleBackFromProduct}
                    />
                  ) : filteredProducts.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                        {paginatedProducts.map(product => (
                          <ProductCard
                            key={product._id || product.id}
                            product={product}
                            onMessage={() => { }} // No-op or remove prop entirely
                            onClick={() => setSearchParams({ product: product.id || product._id })}
                          />
                        ))}
                      </div>
                      {/* Pagination */}
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                        className="mt-8"
                      />
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No products found.
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ================= SELL TAB ================= */}
          {activeTab === "sell" && (
            <HostGuard>
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Tip icon={<Zap />} title="Sell Faster" desc="Add clear photos" />
                  <Tip icon={<Tag />} title="Moving Sale" desc="Use tags" />
                  <Tip icon={<ShieldCheck />} title="Get Verified" desc="Build trust" />
                </div>

                <SellForm onPost={handlePost} />
              </div>
            </HostGuard>
          )}
        </MarketplaceLayout>
      </div>



      <VerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        onComplete={() => {
          setIsVerificationOpen(false);
          alert("Verification Complete. Listing is live.");
        }}
      />

      <Footer />
    </div>
  );
}

/* ================= SINGLE PRODUCT ================= */

const SingleProductView = ({ product: initialProduct, onBack }) => {
  const [imageError, setImageError] = useState(false);
  const { formatPrice } = useCountry();
  const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";

  const { data: fetchedProduct, isLoading } = useGetBuySellByIdQuery(initialProduct.id || initialProduct._id, {
    skip: !initialProduct.id && !initialProduct._id
  });

  const rawProduct = fetchedProduct || initialProduct;

  const product = {
    ...rawProduct,
    sellerName: rawProduct.sellerName || rawProduct.name || "Seller",
    sellerPhone: rawProduct.sellerPhone || rawProduct.phone,
    sellerEmail: rawProduct.sellerEmail || rawProduct.email || rawProduct.seller_email,
    sellerInstagram: rawProduct.sellerInstagram || rawProduct.instagram || rawProduct.seller_instagram,
    sellerFacebook: rawProduct.sellerFacebook || rawProduct.facebook || rawProduct.seller_facebook || rawProduct.Host?.facebook || rawProduct.host?.facebook,
    location: rawProduct.location || [rawProduct.city, rawProduct.state, rawProduct.country].filter(Boolean).join(", ") || "Location not specified",
    postedTime: rawProduct.postedTime || ((rawProduct.created_at || rawProduct.createdAt) ? new Date(rawProduct.created_at || rawProduct.createdAt).toLocaleDateString() : "Recently"),
  };

  const socials = {
    whatsapp: product.sellerPhone || "",
    email: product.sellerEmail || "",
    instagram: product.sellerInstagram || "",
    facebook: product.sellerFacebook || "",
  };

  const copyLink = () => {
    const shareUrl = `${window.location.origin}/marketplace?product=${product.id || product._id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 bg-white rounded-[2rem] border border-gray-100 shadow-xl p-4 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-gradient-to-bl from-blue-50/50 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Back Button */}
      <div className="mb-6 relative z-10">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#CB2A25] transition-colors"
        >
          <div className="p-1.5 sm:p-2 rounded-full bg-gray-50 group-hover:bg-[#CB2A25]/10 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Marketplace
        </button>
      </div>

      {/* Gallery Section - banner style */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden h-[260px] sm:h-[360px] md:h-[400px] lg:h-[440px] shadow-sm group bg-slate-50 border border-slate-100 mb-8 z-10 flex items-center justify-center">
        {isLoading && !product.image ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CB2A25]"></div>
          </div>
        ) : (
          <>
            {/* Blurred background image for ambient glassmorphism look */}
            <div 
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 scale-110 pointer-events-none"
              style={{ backgroundImage: `url(${imageError ? FALLBACK_IMAGE : (product.images?.[0] || product.image || FALLBACK_IMAGE)})` }}
            />
            
            {/* Actual product image, fully visible and uncropped */}
            <img
              src={imageError ? FALLBACK_IMAGE : (product.images?.[0] || product.image || FALLBACK_IMAGE)}
              className="relative z-10 max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-[1.01]"
              onError={() => setImageError(true)}
              alt={product.title}
            />
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-gray-900 shadow-sm border border-white/20">
                {product.condition || "Used"}
              </span>
            </div>
          </>
        )}

        {/* Share/Save floating buttons (Mobile) */}
        <div className="absolute top-4 right-4 flex gap-2 md:hidden z-20">
          <button onClick={copyLink} className="p-2 bg-white rounded-full shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer">
            <Share2 className="w-4 h-4 text-slate-700" />
          </button>
          <div className="bg-white rounded-full shadow-md w-8 h-8 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
            <WishlistButton
              itemId={product.id || product._id}
              itemType="buysell"
              className="w-full h-full flex items-center justify-center"
              iconSize={16}
              outlineColor="text-gray-400"
              filledColor="fill-[#CB2A25] text-[#CB2A25]"
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_380px] gap-8 md:gap-10 lg:gap-12">
          
          {/* Left Column: Details */}
          <div className="min-w-0 space-y-10">
            {/* Title Header */}
            <div className="border-b border-slate-100 pb-8">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-medium hover:bg-slate-200">
                      {product.category || "General"}
                    </Badge>
                    {product.status === "active" ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 pl-1 pr-2 hover:bg-emerald-100">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Listing
                      </Badge>
                    ) : (
                      <Badge className="bg-red-50 text-red-700 border-red-200 gap-1 pl-1 pr-2 hover:bg-red-100">
                        <ShieldCheck className="w-3.5 h-3.5 text-red-600" /> Unverified Listing
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                    {product.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-500 text-sm">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1.5 text-[#CB2A25] shrink-0" />
                      {product.location}
                    </div>
                    <div className="hidden sm:block w-px h-3 bg-slate-200" />
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1.5 text-slate-400 shrink-0" />
                      Listed {product.postedTime}
                    </div>
                  </div>
                </div>

                {/* Desktop Share/Save */}
                <div className="hidden md:flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={copyLink} className="gap-2 text-slate-700">
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                  <div className="flex items-center">
                    <WishlistButton
                      itemId={product.id || product._id}
                      itemType="buysell"
                      className="h-9 px-4 py-2 border border-slate-200 rounded-md hover:bg-slate-100 flex items-center gap-2 transition-colors"
                      iconSize={16}
                      outlineColor="text-slate-700"
                      filledColor="fill-[#CB2A25] text-[#CB2A25]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Promo Card (Styled to match host promo card) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-red-50/50 to-white border border-[#CB2A25]/10">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full bg-[#00142E] flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-sm">
                  {product.sellerName ? product.sellerName.charAt(0).toUpperCase() : "S"}
                </div>
                {product.status === "active" && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900">Listed by {product.sellerName}</h3>
                <p className="text-slate-500 text-sm">Verified Seller · Responsive partner</p>
              </div>
              <HostDetailSocials socials={socials} />
            </div>

            {/* Highlights Stats Section */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:shadow-sm transition-shadow">
                <Shield className="w-6 h-6 text-slate-700 mb-2" />
                <span className="font-semibold text-slate-900">{product.condition || "Used"}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wide">Condition</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:shadow-sm transition-shadow">
                <Tag className="w-6 h-6 text-slate-700 mb-2" />
                <span className="font-semibold text-slate-900 truncate max-w-full px-2">{product.category || "General"}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wide">Category</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:shadow-sm transition-shadow col-span-2 sm:col-span-1">
                <Calendar className="w-6 h-6 text-slate-700 mb-2" />
                <span className="font-semibold text-slate-900">{product.postedTime}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wide">Listed On</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">About this item</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-base">
                {product.description || "No description provided."}
              </p>
            </div>

            {/* Safety Disclaimer Box */}
            <div className="flex items-start gap-4 p-5 bg-yellow-50 rounded-2xl border border-yellow-100/50">
              <div className="min-w-6 mt-0.5 text-yellow-600">
                <ShieldCheck size={20} />
              </div>
              <div className="text-sm text-yellow-800 leading-relaxed font-medium">
                <span className="block font-bold mb-1 text-yellow-900 text-base">Safety First</span>
                Meet in public places. Inspect item before payment. Never send money in advance.
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div>
            <div className="sticky top-28 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8">
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-3xl font-black text-[#00142E] tracking-tight">
                    {formatPrice(product.price || 0)}
                  </span>
                  {product.negotiable && (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 shrink-0">
                      Negotiable
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  {product.sellerPhone && (
                    <button
                      onClick={() => {
                        const cleanNumber = product.sellerPhone.replace(/\D/g, '');
                        window.open(`https://wa.me/${cleanNumber}`, '_blank');
                      }}
                      className="w-full h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-base cursor-pointer"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Chat on WhatsApp
                    </button>
                  )}

                  {product.sellerPhone && (
                    <button
                      onClick={() => window.open(`tel:${product.sellerPhone}`)}
                      className="w-full h-12 bg-[#00142E] hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-base border border-slate-700 cursor-pointer"
                    >
                      <Phone className="w-5 h-5" />
                      Call Seller
                    </button>
                  )}

                  {/* Other social connections */}
                  <div className="pt-4 border-t border-slate-100 mt-2">
                    <div className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wider text-center">Other Channels</div>
                    <HostDetailSocials socials={socials} className="justify-center" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

/* ================= TIP ================= */

const Tip = ({ icon, title, desc }) => (
  <div className="bg-gray-50 border p-3 sm:p-4 rounded-xl flex gap-3">
    <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
    <div>
      <h4 className="font-bold text-sm">{title}</h4>
      <p className="text-xs text-gray-600">{desc}</p>
    </div>
  </div>
);