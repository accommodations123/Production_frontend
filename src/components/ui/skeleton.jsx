import React, { useState, useEffect, useRef } from "react";
import {
  Search, MapPin, Plus, Heart, Share2, ChevronRight, Star, Phone, Mail,
  User, Filter, X, Camera, Car, Home, Smartphone, Laptop, Sofa,
  Shirt, Baby, Book, Music, Dumbbell, Gamepad2, Package,
  Clock, Shield, ChevronDown, Grid, List, Gauge, Fuel,
  Palette, FileText, Settings, Wifi, HardDrive, Monitor, Cpu
} from "lucide-react";

import {
  useGetBuySellListingsQuery,
  useGetBuySellByIdQuery
} from "@/store/api/hostApi";

/* ---------------- CATEGORIES (UNCHANGED) ---------------- */
const categories = [
  { id: 1, name: "Vehicles", icon: <Car className="w-8 h-8" />, color: "bg-blue-100 text-blue-600",
    subcategories: [{ id: 11, name: "Cars" }, { id: 12, name: "Motorcycles" }] },
  { id: 2, name: "Properties", icon: <Home className="w-8 h-8" />, color: "bg-green-100 text-green-600",
    subcategories: [{ id: 21, name: "Apartments" }, { id: 22, name: "Houses" }] },
  { id: 3, name: "Mobiles", icon: <Smartphone className="w-8 h-8" />, color: "bg-purple-100 text-purple-600",
    subcategories: [{ id: 31, name: "Smartphones" }, { id: 32, name: "Accessories" }] },
  { id: 4, name: "Electronics", icon: <Laptop className="w-8 h-8" />, color: "bg-orange-100 text-orange-600",
    subcategories: [{ id: 41, name: "Laptops" }, { id: 42, name: "TVs" }] },
  { id: 5, name: "Furniture", icon: <Sofa className="w-8 h-8" />, color: "bg-yellow-100 text-yellow-600",
    subcategories: [{ id: 51, name: "Sofas" }, { id: 52, name: "Chairs" }] }
];

/* ---------------- COMPONENT ---------------- */
const EssentialsBundle = () => {
  const productsSectionRef = useRef(null);

  /* -------- API INTEGRATION -------- */
  const { data: apiListings = [], isLoading, isError } =
    useGetBuySellListingsQuery();

  const [selectedListingId, setSelectedListingId] = useState(null);

  const { data: selectedListing } =
    useGetBuySellByIdQuery(selectedListingId, { skip: !selectedListingId });

  /* -------- STATE (UNCHANGED LOGIC) -------- */
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [savedItems, setSavedItems] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [showPostAd, setShowPostAd] = useState(false);

  /* -------- SYNC API DATA -------- */
  useEffect(() => {
    setListings(apiListings);
  }, [apiListings]);

  /* -------- FILTER + SORT (UNCHANGED) -------- */
  const filteredListings = listings.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === "all" || item.category === selectedCategory) &&
    (selectedSubcategory === "all" || item.subcategory === selectedSubcategory)
  );

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

  const toggleSaveItem = id => {
    setSavedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  /* -------- LOADING / ERROR -------- */
  if (isLoading) {
    return <div className="p-10 text-center">Loading marketplace...</div>;
  }

  if (isError) {
    return <div className="p-10 text-center text-red-600">
      Failed to load listings
    </div>;
  }

  /* ---------------- RENDER ---------------- */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* SEARCH */}
      <div className="p-6 bg-white shadow">
        <input
          className="w-full p-3 border rounded-lg"
          placeholder="Search items"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LISTINGS */}
      <div
        ref={productsSectionRef}
        className={`p-6 ${
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-3 gap-6"
            : "space-y-4"
        }`}
      >
        {sortedListings.map(listing => (
          <div
            key={listing._id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
            onClick={() => setSelectedListingId(listing._id)}
          >
            <img
              src={listing.images?.[0]}
              alt={listing.title}
              className="h-48 w-full object-cover rounded-t-lg"
            />

            <div className="p-4">
              <div className="flex justify-between">
                <h3 className="font-semibold">{listing.title}</h3>
                <span className="font-bold text-blue-600">
                  ₹{listing.price}
                </span>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">
                {listing.description}
              </p>

              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {listing.createdAt
                    ? new Date(listing.createdAt).toLocaleDateString()
                    : "Recently"}
                </span>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleSaveItem(listing._id);
                  }}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      savedItems.includes(listing._id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DETAILS MODAL */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 relative">
            <button
              onClick={() => setSelectedListingId(null)}
              className="absolute top-3 right-3"
            >
              <X />
            </button>

            <img
              src={selectedListing.images?.[0]}
              className="w-full h-80 object-cover rounded-lg"
            />

            <h2 className="text-2xl font-bold mt-4">
              {selectedListing.title}
            </h2>

            <p className="mt-2 text-gray-600">
              {selectedListing.description}
            </p>

            <div className="mt-4 text-xl font-bold text-blue-600">
              ₹{selectedListing.price}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Changed from default export to named export
export { EssentialsBundle };