"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
import { FilterPanel } from "@/components/marketplace/FilterPanel";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { SellForm } from "@/components/marketplace/SellForm";

import { VerificationModal } from "@/components/marketplace/VerificationModal";
import { ShieldCheck, Zap, Tag } from "lucide-react";
import { useCountry } from "@/context/CountryContext";
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
  const { data: productsData, isLoading: loading, error } = useGetBuySellListingsQuery({
    country: filters.country || activeCountry?.name,
    state: filters.state,
    city: filters.city,
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

              <FilterPanel
                filters={filters}
                onChange={setFilters}
              />

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
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
                            onClick={() => setViewProduct(product)}
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
    location: rawProduct.location || [rawProduct.city, rawProduct.state, rawProduct.country].filter(Boolean).join(", ") || "Location not specified",
    postedTime: rawProduct.postedTime || (rawProduct.createdAt ? new Date(rawProduct.createdAt).toLocaleDateString() : "Recently"),
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl sm:rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 relative">

        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-gradient-to-bl from-blue-50/50 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="p-4 sm:p-6 md:p-10 relative z-10">

          {/* Back Button */}
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#CB2A25] mb-6 sm:mb-8 transition-colors"
          >
            <div className="p-1.5 sm:p-2 rounded-full bg-gray-50 group-hover:bg-[#CB2A25]/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            Back to Marketplace
          </button>

          <div className="grid md:grid-cols-12 gap-6 md:gap-8 lg:gap-10 xl:gap-14">

            {/* Left Column: Image (Span 7) */}
            <div className="md:col-span-7">
              <div className="aspect-[4/3] bg-gray-50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative group">
                {isLoading && !product.image ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    <img
                      src={imageError ? FALLBACK_IMAGE : (product.images?.[0] || product.image || FALLBACK_IMAGE)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={() => setImageError(true)}
                      alt={product.title}
                    />
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-gray-900 shadow-sm border border-white/20">
                        {product.condition || "Used"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Details (Span 5) */}
            <div className="md:col-span-5 flex flex-col justify-center space-y-5 sm:space-y-6 md:space-y-8">

              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#00142E] mb-3 leading-tight">
                  {product.title}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-gray-500 text-sm font-medium">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#CB2A25]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {product.location || "Location not specified"}
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {product.postedTime || "Recently"}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-4xl sm:text-5xl font-black text-[#CB2A25] tracking-tight">
                  ${Number(product.price).toLocaleString()}
                </div>
                {product.negotiable && (
                  <span className="inline-block text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    Negotiable Price
                  </span>
                )}
              </div>

              {/* Seller Card */}
              <div className="bg-[#00142E] p-4 sm:p-6 rounded-2xl text-white relative overflow-hidden group">
                {/* Glow effect */}
                <div className="absolute -right-8 -top-8 w-32 h-32 sm:w-40 sm:h-40 bg-[#CB2A25]/20 rounded-full blur-3xl group-hover:bg-[#CB2A25]/30 transition-colors duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-white border border-white/5 font-bold text-lg sm:text-xl">
                      {product.sellerName ? product.sellerName.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div>
                      <div className="font-bold text-base sm:text-lg">{product.sellerName || "Seller Name"}</div>
                      <div className="flex items-center gap-1.5 text-xs text-green-400 font-medium mt-1">
                        <ShieldCheck size={14} />
                        <span>Verified Seller</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Primary Row: WhatsApp & Call */}
                    <div className="flex gap-2">
                      {product.sellerPhone && (
                        <button
                          onClick={() => {
                            // Strip non-numeric characters for the link
                            const cleanNumber = product.sellerPhone.replace(/\D/g, '');
                            window.open(`https://wa.me/${cleanNumber}`, '_blank');
                          }}
                          className="flex-1 h-11 sm:h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-sm sm:text-base"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 448 512" fill="currentColor">
                            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 480l117.7-30.9c32.4 17.7 68.9 27 106.2 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                          </svg>
                          WhatsApp
                        </button>
                      )}

                      {product.sellerPhone && (
                        <button
                          onClick={() => window.open(`tel:${product.sellerPhone}`)}
                          className="h-11 sm:h-12 w-11 sm:w-12 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center border border-white/10 hover:scale-105 active:scale-95 transition-all shrink-0"
                          title="Call Seller"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Secondary Row: Instagram & Gmail */}
                    {(product.sellerEmail || product.sellerInstagram) && (
                      <div className="flex gap-2 w-full">
                        {product.sellerEmail && (
                          <button
                            onClick={() => window.open(`mailto:${product.sellerEmail}`)}
                            className="flex-1 h-10 bg-white/5 hover:bg-red-500/10 text-gray-200 hover:text-red-400 rounded-xl font-bold flex items-center justify-center gap-2 border border-white/10 hover:border-red-500/20 transition-all hover:scale-[1.02] active:scale-95 text-xs sm:text-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                              <rect width="20" height="16" x="2" y="4" rx="2" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                            Gmail
                          </button>
                        )}

                        {product.sellerInstagram && (
                          <button
                            onClick={() => {
                              const value = product.sellerInstagram.trim();
                              const url = (value.startsWith("http://") || value.startsWith("https://") || value.includes("instagram.com"))
                                ? (value.startsWith("http") ? value : `https://${value}`)
                                : `https://instagram.com/${value.replace(/^@/, '')}`;
                              window.open(url, '_blank');
                            }}
                            className="flex-1 h-10 bg-white/5 hover:bg-pink-500/10 text-gray-200 hover:text-pink-400 rounded-xl font-bold flex items-center justify-center gap-2 border border-white/10 hover:border-pink-500/20 transition-all hover:scale-[1.02] active:scale-95 text-xs sm:text-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
                              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                            </svg>
                            Instagram
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="flex items-start gap-3 p-3 sm:p-4 bg-yellow-50 rounded-xl sm:rounded-2xl border border-yellow-100/50">
                <div className="min-w-5 mt-0.5 text-yellow-600">
                  <ShieldCheck size={18} />
                </div>
                <div className="text-xs sm:text-sm text-yellow-800 leading-relaxed font-medium">
                  <span className="block font-bold mb-0.5 text-yellow-900">Safety First</span>
                  Meet in public places. Inspect item before payment. Never send money in advance.
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
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