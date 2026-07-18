import React, { memo, useEffect } from "react"
import { Grid, List, Filter, Plus } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { useCountry } from "@/context/CountryContext"
import { useNavigate } from "react-router-dom"
import { getHostPath } from "@/shared/utils/navigationUtils"

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
    isScrolled,
    uniqueLocations = []
}) => {

    const navigate = useNavigate();
    const { activeCountry, formatPrice } = useCountry();
    const isINR = activeCountry?.currency === "INR";

    const priceRanges = isINR ? [
        { value: "free", label: "Free" },
        { value: "0-2000", label: `${formatPrice(0)} - ${formatPrice(2000)}` },
        { value: "2000-4000", label: `${formatPrice(2000)} - ${formatPrice(4000)}` },
        { value: "4000-8000", label: `${formatPrice(4000)} - ${formatPrice(8000)}` },
        { value: "8000+", label: `${formatPrice(8000)}+` }
    ] : [
        { value: "free", label: "Free" },
        { value: "0-25", label: `${formatPrice(0)} - ${formatPrice(25)}` },
        { value: "25-50", label: `${formatPrice(25)} - ${formatPrice(50)}` },
        { value: "50-100", label: `${formatPrice(50)} - ${formatPrice(100)}` },
        { value: "100+", label: `${formatPrice(100)}+` }
    ];

    // Prevent body scroll lock issues
    useEffect(() => {
        document.body.style.overflow = "auto"
        document.documentElement.style.overflow = "auto"

        return () => {
            document.body.style.overflow = "auto"
            document.documentElement.style.overflow = "auto"
        }
    }, [showFilters])

    return (
        <div
            className={`bg-white py-4 sm:py-6 px-4 sticky top-16 z-20 border-b transition-all duration-300 ${isScrolled ? "shadow-lg" : "shadow-sm"
                }`}
        >
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 overflow-visible">

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">

                    {/* Category Filters */}
                    <div className="flex-1 w-full overflow-hidden">

                        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">

                            <button
                                onClick={() => setActiveFilter("all")}
                                className={`px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2 text-sm shadow-sm hover:shadow-md ${activeFilter === "all"
                                        ? "bg-[#00142E] text-white"
                                        : "bg-white text-[#222222] border border-gray-200 hover:bg-gray-50"
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
                                            ? "bg-[#00142E] text-white"
                                            : "bg-white text-[#222222] border border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    {category.icon && (
                                        <span className="text-base">
                                            {category.icon}
                                        </span>
                                    )}

                                    {category.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">

                        {/* View Toggle */}
                        <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-md transition-all ${viewMode === "grid"
                                        ? "bg-white shadow-sm"
                                        : ""
                                    }`}
                            >
                                <Grid className="h-4 w-4 text-gray-700" />
                            </button>

                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-md transition-all ${viewMode === "list"
                                        ? "bg-white shadow-sm"
                                        : ""
                                    }`}
                            >
                                <List className="h-4 w-4 text-gray-700" />
                            </button>
                        </div>

                        {/* Filter Button */}
                        <Button
                            variant="outline"
                            className={`relative h-11 px-5 rounded-lg transition-all ${hasActiveFilters
                                    ? "bg-[#00142E]/10 border-[#00142E]/30 text-[#00142E]"
                                    : "bg-white border-gray-200 text-gray-700"
                                }`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4 mr-2" />

                            Filters

                            {hasActiveFilters && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00142E] text-white text-xs rounded-full flex items-center justify-center">
                                    {
                                        Object.values(selectedFilters).filter(
                                            (v) => v !== ""
                                        ).length
                                    }
                                </span>
                            )}
                        </Button>

                        {/* Host Event Button */}
                        <Button
                            onClick={() => navigate(getHostPath('event', !!localStorage.getItem("user")))}
                            className="bg-[#E1392A] hover:bg-[#E1392A]/90 text-white rounded-lg h-11 px-5 font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm cursor-pointer"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Host Event</span>
                        </Button>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="mt-5 p-5 bg-gray-50 rounded-2xl border border-gray-200 shadow-inner overflow-visible">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date
                                </label>

                                <select
                                    value={selectedFilters.date}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "date",
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00142E] bg-white"
                                >
                                    <option value="">Any Date</option>
                                    <option value="today">Today</option>
                                    <option value="tomorrow">Tomorrow</option>
                                    <option value="this-week">This Week</option>
                                    <option value="this-weekend">
                                        This Weekend
                                    </option>
                                    <option value="next-week">Next Week</option>
                                    <option value="this-month">
                                        This Month
                                    </option>
                                </select>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price
                                </label>

                                <select
                                    value={selectedFilters.price}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "price",
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00142E] bg-white"
                                >
                                    <option value="">Any Price</option>
                                    {priceRanges.map(range => (
                                        <option key={range.value} value={range.value}>
                                            {range.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </label>

                                <select
                                    value={selectedFilters.location}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "location",
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00142E] bg-white text-gray-900"
                                >
                                    <option value="">Any Location</option>
                                    <option value="online">Online</option>
                                    {uniqueLocations.map((loc) => (
                                        <option key={loc} value={loc}>
                                            {loc}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-end gap-2">
                                <Button
                                    onClick={clearFilters}
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl"
                                >
                                    Clear
                                </Button>

                                <Button
                                    className="flex-1 h-12 bg-[#00142E] hover:bg-[#00142E]/90 text-white rounded-xl"
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
