import React, { memo } from "react"
import { Grid, List, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

export const EventsFilters = memo(({
    activeFilter,
    setActiveFilter,
    eventCategories,
    viewMode,
    setViewMode,
    showFilters,
    setShowFilters,
    selectedFilters,
    handleFilterChange,
    clearFilters,
    hasActiveFilters,
    isScrolled
}) => {
    return (
        <div className={`bg-white py-4 sm:py-6 px-4 sticky top-16 z-20 shadow-md transition-all duration-300 ${isScrolled ? 'shadow-lg' : 'shadow-sm'}`}>
            <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Category Filters */}
                    <div className="relative flex-1 w-full md:w-auto overflow-hidden">
                        {/* Shadow masks for scroll indication */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none md:hidden"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none md:hidden"></div>

                        <div className="flex items-center gap-3 overflow-x-auto py-2 no-scrollbar w-full translate-x-0">
                            <button
                                onClick={() => setActiveFilter("all")}
                                className={`px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2 text-sm shadow-sm hover:shadow-md ${activeFilter === "all"
                                    ? "bg-[#00142E] text-white ring-2 ring-[#00142E] ring-offset-2"
                                    : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                                    }`}
                            >
                                <Grid className="h-4 w-4" />
                                All Events
                            </button>

                            {eventCategories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveFilter(category.id)}
                                    className={`px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2 text-sm shadow-sm hover:shadow-md ${activeFilter === category.id
                                        ? "bg-[#00142E] text-white ring-2 ring-[#00142E] ring-offset-2"
                                        : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                                        }`}
                                >
                                    {category.icon && <span className="text-base grayscale group-hover:grayscale-0 transition-all">{category.icon}</span>}
                                    {category.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-md transition-all duration-300 ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                            >
                                <Grid className="h-4 w-4 text-gray-700" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-md transition-all duration-300 ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                            >
                                <List className="h-4 w-4 text-gray-700" />
                            </button>
                        </div>

                        {/* More Filters Button */}
                        <Button
                            variant="outline"
                            className={`h-10 sm:h-12 px-4 sm:px-6 rounded-lg transition-all duration-300 transform hover:scale-105 relative ${hasActiveFilters
                                ? "bg-[#00142E]/10 border-[#00142E]/30 text-[#00142E] hover:bg-[#00142E]/20"
                                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                }`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Filters</span>
                            {hasActiveFilters && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00142E] text-white text-xs rounded-full flex items-center justify-center">
                                    {Object.values(selectedFilters).filter(v => v !== "").length}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in shadow-inner">
                        <div className="flex flex-col md:flex-row gap-4 items-start">
                            {/* Date Filter */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <select
                                    value={selectedFilters.date}
                                    onChange={(e) => handleFilterChange("date", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00142E] focus:border-transparent bg-white"
                                >
                                    <option value="">Any Date</option>
                                    <option value="today">Today</option>
                                    <option value="tomorrow">Tomorrow</option>
                                    <option value="this-week">This Week</option>
                                    <option value="this-weekend">This Weekend</option>
                                    <option value="next-week">Next Week</option>
                                    <option value="this-month">This Month</option>
                                </select>
                            </div>

                            {/* Price Filter */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                                <select
                                    value={selectedFilters.price}
                                    onChange={(e) => handleFilterChange("price", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00142E] focus:border-transparent bg-white"
                                >
                                    <option value="">Any Price</option>
                                    <option value="free">Free</option>
                                    <option value="0-25">$0 - $25</option>
                                    <option value="25-50">$25 - $50</option>
                                    <option value="50-100">$50 - $100</option>
                                    <option value="100+">$100+</option>
                                </select>
                            </div>

                            {/* Location Filter */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <select
                                    value={selectedFilters.location}
                                    onChange={(e) => handleFilterChange("location", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00142E] focus:border-transparent bg-white"
                                >
                                    <option value="">Any Location</option>
                                    <option value="online">Online</option>
                                    <option value="nearby">Near Me</option>
                                    <option value="new-york">New York</option>
                                    <option value="london">London</option>
                                    <option value="tokyo">Tokyo</option>
                                    <option value="paris">Paris</option>
                                </select>
                            </div>

                            {/* Filter Actions */}
                            <div className="flex items-end gap-2 md:self-end">
                                <Button
                                    onClick={clearFilters}
                                    variant="outline"
                                    className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-300 h-10"
                                >
                                    Clear
                                </Button>
                                <Button
                                    className="px-4 py-2 bg-[#00142E] hover:bg-[#00142E]/90 text-white rounded-lg transition-all duration-300 h-10"
                                    onClick={() => setShowFilters(false)}
                                >
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
})
EventsFilters.displayName = "EventsFilters"
