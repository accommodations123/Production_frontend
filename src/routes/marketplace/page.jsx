
import React, { useState, useEffect } from "react";
import { MarketplaceLayout } from "@/features/marketplace/components/MarketplaceLayout";
import { FilterPanel } from "@/features/marketplace/components/FilterPanel";
import { MarketplaceCard } from "@/features/marketplace/components/MarketplaceCard";
import { SellForm } from "@/features/marketplace/components/SellForm";
import ProductDetailView from "@/features/marketplace/components/ProductDetailView";

import { VerificationModal } from "@/features/marketplace/components/VerificationModal";
import { ShieldCheck, Zap, Tag } from "lucide-react";
import { useCountry } from "@/context/CountryContext";
import { Button } from "@/shared/ui/button";
import { useGetBuySellListingsQuery, useGetBuySellByIdQuery } from "@/store/api/hostApi";
import { useGetMeQuery } from "@/store/api/authApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import HostGuard from "@/features/auth/components/HostGuard";
import { usePagination } from "@/shared/hooks/usePagination";
import { Pagination } from "@/shared/ui/Pagination";

/* ================= COMPONENT ================= */

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const productIdFromUrl = searchParams.get("product");

  const [activeTab, setActiveTab] = useState("buy");
  const { activeCountry } = useCountry();

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

  // Reset selected product view and URL search params if filters change
  useEffect(() => {
    setViewProduct(null);
    if (productIdFromUrl) {
      setSearchParams({});
    }
  }, [filters]); // only reset on filter change; do NOT depend on productIdFromUrl or clicking a card would instantly clear the view

  // Clear URL param when closing product view
  const handleBackFromProduct = () => {
    setViewProduct(null);
    if (productIdFromUrl) {
      setSearchParams({});
    }
  };

  const navigate = useNavigate();
  const { data: user } = useGetMeQuery();

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
      <>

      <div className="pt-1">
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
                    <ProductDetailView
                      product={viewProduct}
                      onBack={handleBackFromProduct}
                    />
                  ) : filteredProducts.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                        {paginatedProducts.map(product => (
                          <MarketplaceCard
                            key={product._id || product.id}
                            product={product}
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
              <div className="w-full">
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

      </>
    </div>
  );
}


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