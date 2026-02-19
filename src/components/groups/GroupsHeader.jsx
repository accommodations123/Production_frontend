"use client"

import * as React from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

export function GroupsHeader({ searchQuery, setSearchQuery, activeFilter, setActiveFilter }) {

    return (
        <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-10 md:mb-12">
            <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-5xl font-bold text-[#07182A]">Communities & Groups</h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                    Join local groups, connect with people, and get real information from residents.
                </p>
            </div>

            <div className="max-w-2xl mx-auto relative">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by country, city, or group name..."
                        className="pl-12 pr-4 h-12 sm:h-14 rounded-full border-gray-200 shadow-sm text-base sm:text-lg text-[#07182A]"
                    />
                    <Button
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#C93A30] hover:bg-[#C93A30]/90 h-10 w-10"
                    >
                        <Search className="h-5 w-5 text-white" />
                    </Button>
                </div>
            </div>

            <div className="relative overflow-hidden pt-2">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#F1E7D6] to-transparent z-10 pointer-events-none md:hidden"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#F1E7D6] to-transparent z-10 pointer-events-none md:hidden"></div>

                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar justify-start md:justify-center px-4">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shadow-sm hover:shadow-md",
                                activeFilter === filter
                                    ? "bg-[#07182A] text-white ring-2 ring-[#07182A] ring-offset-2"
                                    : "bg-white border border-gray-100 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
