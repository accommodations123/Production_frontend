"use client";

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  X,
  Phone,
  Mail,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { useCountry } from "@/context/CountryContext";

import {
  useGetBuySellListingsQuery,
  useGetBuySellByIdQuery,
} from "@/store/api/hostApi";

/* ===================== COMPONENT ===================== */

const EssentialsBundle = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCountry();

  /* ===================== API ===================== */

  const { data: listings = [], isLoading, isError } =
    useGetBuySellListingsQuery();

  const [selectedId, setSelectedId] = useState(null);
  const { data: selectedItem } = useGetBuySellByIdQuery(selectedId, {
    skip: !selectedId,
  });

  /* ===================== SEARCH ===================== */

  const [search, setSearch] = useState("");

  const filteredListings = useMemo(() => {
    if (!search) return listings;

    return listings.filter(item =>
      item.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [listings, search]);

  /* ===================== STATES ===================== */

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Failed to load listings
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ===================== TOP SEARCH BAR ===================== */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-7xl mx-auto p-3 sm:p-4 flex gap-3 sm:gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              className="w-full pl-9 sm:pl-10 py-2 border rounded-lg text-sm"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => navigate("/sell")}
            className="bg-[#00152D] text-white px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap"
          >
            Sell Your Product
          </button>
        </div>
      </div>

      {/* ===================== PRODUCTS GRID ===================== */}
      <div className="max-w-7xl mx-auto p-3 sm:p-4">
        {filteredListings.length === 0 ? (
          <div className="text-center text-gray-500 mt-12 sm:mt-20">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredListings.map(item => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow hover:shadow-md cursor-pointer"
                onClick={() => setSelectedId(item._id)}
              >
                <img
                  src={item.images?.[0] || "https://picsum.photos/300"}
                  alt={item.title}
                  className="h-32 sm:h-40 w-full object-cover rounded-t-lg"
                />

                <div className="p-3">
                  <h4 className="font-semibold text-sm truncate">
                    {item.title}
                  </h4>

                  <p className="text-indigo-600 font-bold text-sm">
                    {formatPrice(item.price || 0)}
                  </p>

                  {(item.location?.city || item.location?.state) && (
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {item.location?.city}, {item.location?.state}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===================== DETAIL MODAL ===================== */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">

            {/* HEADER */}
            <div className="flex justify-between items-center p-3 sm:p-4 border-b">
              <h2 className="font-bold text-sm sm:text-base">{selectedItem.title}</h2>
              <button onClick={() => setSelectedId(null)}>
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* BODY */}
            <div className="p-4 sm:p-6">
              <img
                src={selectedItem.images?.[0]}
                alt={selectedItem.title}
                className="w-full h-48 sm:h-72 object-cover rounded mb-4"
              />

              <p className="text-lg sm:text-xl font-bold text-indigo-600 mb-2">
                {formatPrice(selectedItem.price || 0)}
              </p>

              <p className="text-gray-600 text-sm sm:text-base mb-4">
                {selectedItem.description}
              </p>

              <div className="flex flex-wrap gap-2 sm:gap-4">
                {selectedItem.seller?.phone && (
                  <a
                    href={`tel:${selectedItem.seller.phone}`}
                    className="flex items-center gap-2 border px-3 sm:px-4 py-2 rounded text-sm"
                  >
                    <Phone size={16} /> Call
                  </a>
                )}

                {selectedItem.seller?.phone && (
                  <a
                    href={`https://wa.me/${selectedItem.seller.phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 border px-3 sm:px-4 py-2 rounded text-sm"
                  >
                    <FaWhatsapp /> WhatsApp
                  </a>
                )}

                {selectedItem.seller?.email && (
                  <a
                    href={`mailto:${selectedItem.seller.email}`}
                    className="flex items-center gap-2 border px-3 sm:px-4 py-2 rounded text-sm text-[#EA4335] hover:bg-red-50 transition-colors"
                  >
                    <SiGmail size={16} /> Gmail
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EssentialsBundle;