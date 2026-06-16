import React from "react";
import { Search, MapPin, Filter } from "lucide-react";


export default function TravelFilter({
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    onReset
}) {
    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border" style={{ borderColor: 'var(--color-neutral)' }}>
            <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Main Search */}
                    <div className="md:col-span-4 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search destination, user..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-red-500 outline-none transition-all font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Country Filter */}
                    <div className="md:col-span-2 relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Country"
                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-red-500 outline-none transition-all font-medium"
                            value={filters.country}
                            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                        />
                    </div>

                    {/* State Filter */}
                    <div className="md:col-span-2 relative group">
                        <input
                            type="text"
                            placeholder="State"
                            className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-red-500 outline-none transition-all font-medium"
                            value={filters.state}
                            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                        />
                    </div>

                    {/* City Filter */}
                    <div className="md:col-span-2 relative group">
                        <input
                            type="text"
                            placeholder="City"
                            className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-red-500 outline-none transition-all font-medium"
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                        />
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-2 flex gap-2">
                        <button
                            onClick={onReset}
                            className="flex-1 px-4 py-4 rounded-xl border-2 font-bold transition-all hover:bg-gray-50 active:scale-95"
                            style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Filters Bar */}
            {(filters.country || filters.state || filters.city || searchQuery) && (
                <div className="px-8 py-3 bg-gray-50 border-t flex flex-wrap gap-2 items-center" style={{ borderColor: 'var(--color-neutral)' }}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mr-2">Quick Filter:</span>
                    {filters.country && <span className="px-3 py-1 bg-white rounded-full text-xs font-bold border shadow-sm">Country: {filters.country}</span>}
                    {filters.state && <span className="px-3 py-1 bg-white rounded-full text-xs font-bold border shadow-sm">State: {filters.state}</span>}
                    {filters.city && <span className="px-3 py-1 bg-white rounded-full text-xs font-bold border shadow-sm">City: {filters.city}</span>}
                    {searchQuery && <span className="px-3 py-1 bg-white rounded-full text-xs font-bold border shadow-sm">Search: {searchQuery}</span>}
                </div>
            )}
        </div>
    );
}
