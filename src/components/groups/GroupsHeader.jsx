"use client"

import * as React from "react"
import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { getHostPath } from "@/lib/navigationUtils"

const FILTERS = [
    "All",
    "Countries",
    "Cities",
    "Students",
    "Workers",
    "Visa & Immigration",
    "Accommodation Help",
    "Buy/Sell",
    "Women-only"
]



export function GroupsHeader({
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter
}) {
    const navigate = useNavigate();

    return (
        <div className="space-y-5 sm:space-y-8 mb-6 sm:mb-10 md:mb-12">

            {/* Title */}
            <div className="text-center space-y-2 sm:space-y-4 px-4">
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#07182A] leading-tight">
                    Communities & Groups
                </h1>
                <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
                    Join local groups, connect with people, and get real information from residents.
                </p>
            </div>

            {/* Search & Action Button */}
            <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <div className="flex-1 w-full flex items-center bg-white border border-gray-200 rounded-full shadow-sm h-11 sm:h-14 px-2 sm:px-3">

                    {/* Left Icon */}
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 ml-2 mr-2 shrink-0" />

                    {/* Input */}
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by country, city, or group name..."
                        className="
        flex-1 bg-transparent outline-none 
        text-sm sm:text-lg text-[#07182A] 
        placeholder:text-gray-400
      "
                    />

                    {/* Right Button */}
                    <button
                        className="
        flex items-center justify-center
        bg-[#C93A30] hover:bg-[#C93A30]/90 
        rounded-full 
        h-8 w-8 sm:h-10 sm:w-10 
        shrink-0
      "
                    >
                        <Search className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </button>

                </div>

                <button
                    onClick={() => navigate(getHostPath('group', !!localStorage.getItem("user")))}
                    className="
                        w-full sm:w-auto flex items-center justify-center gap-2
                        bg-[#07182A] hover:bg-[#07182A]/90 text-white 
                        rounded-full font-bold px-6
                        h-11 sm:h-14 text-sm sm:text-base whitespace-nowrap cursor-pointer shadow-md hover:shadow-lg transition-all
                    "
                >
                    <Plus className="h-4 sm:h-5 sm:w-5 text-white" />
                    <span>Start a Group</span>
                </button>
            </div>

            {/* Filters */}
            <div className="pt-1">
                <div className="max-w-5xl mx-auto px-2 sm:px-6">

                    <div className="
                        bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm
                        rounded-2xl p-1.5 
                        flex gap-2 overflow-x-auto md:overflow-visible md:flex-wrap 
                        justify-start md:justify-center
                        no-scrollbar snap-x scroll-smooth
                    ">

                        {FILTERS.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={cn(
                                    "snap-start shrink-0 px-5 sm:px-6 py-2 rounded-xl text-sm sm:text-sm font-semibold whitespace-nowrap transition-all duration-200",

                                    activeFilter === filter
                                        ? "bg-[#07182A] text-white shadow-sm ring-1 ring-[#07182A]/10"
                                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-[#07182A] hover:border-gray-300"
                                )}
                            >
                                {filter}
                            </button>
                        ))}

                    </div>

                </div>
            </div>

        </div>
    )
}