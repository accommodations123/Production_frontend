import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGetApprovedPropertiesQuery } from "@/store/api/hostApi";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useCountry } from "@/context/CountryContext";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/ui/Pagination";

export default function PropertiesListPage() {
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const view = qs.get("view") || "all"; // recommended | related | all

  // ✅ Country from context
  const { activeCountry } = useCountry();

  // Fetch all approved properties
  const {
    data: properties,
    isLoading,
    isFetching,
    isError,
  } = useGetApprovedPropertiesQuery();

  // Normalize API data
  const items = useMemo(() => {
    return (properties || []).filter(Boolean).map((p) => ({
      id: p.id ?? p._id,
      title: p.title ?? `Property #${p.id ?? p._id}`,
      city: p.city ?? "",
      country: p.country ?? "",
      image:
        Array.isArray(p.photos) && p.photos.length
          ? p.photos[0]
          : p.image ??
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
      price:
        p.price_per_month ??
        p.price_per_night ??
        p.price_per_hour ??
        0,
      currency: p.currency ?? "INR",
      isVerified: (p.status ?? "").toLowerCase() === "approved",
      raw: p,
    }));
  }, [properties]);

  // ✅ Apply view filter (recommended / related)
  const filtered = useMemo(() => {
    if (view === "recommended") {
      return items.filter((it) => it.isVerified);
    }
    return items;
  }, [view, items]);

  // ✅ Pagination
  const { currentItems, currentPage, totalPages, goToPage } = usePagination(filtered, 12);

  // -------------------- STATES --------------------
  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 sm:p-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 sm:p-12">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Failed to load properties
          </h2>
          <p className="text-gray-500">Please try again later.</p>
        </div>
      </div>
    );
  }

  // -------------------- UI --------------------
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {view === "recommended"
            ? "Recommended"
            : view === "related"
              ? "Related Properties"
              : "All Properties"}
        </h1>
        <div className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {filtered.length}
          </span>{" "}
          results
          {activeCountry?.name && (
            <span className="ml-2">
              for <b>{activeCountry.name}</b>
            </span>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 sm:py-20 text-gray-500">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No properties found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            No listings available for the selected country
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {currentItems.map((it) => (
              <Link
                to={`/rooms/${it.id}`}
                key={it.id}
                className="block group"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative h-48 sm:h-52 lg:h-48 overflow-hidden bg-gray-100">
                    <img
                      src={it.image}
                      alt={it.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <VerificationBadge isVerified={it.isVerified} />
                    </div>
                  </div>

                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                      {it.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {it.city}
                      {it.city && it.country ? ", " : ""}
                      {it.country}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg sm:text-xl font-bold text-primary">
                        {it.currency === "INR" ? "₹" : "$"}
                        {Number(it.price).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">
                        per night
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>
      )}
    </main>
  );
}