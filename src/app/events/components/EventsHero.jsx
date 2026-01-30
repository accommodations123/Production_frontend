import React, { memo } from "react"
import { Link } from "react-router-dom"
import { Globe, Search, Plus, Calendar, Users, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroEventSlider } from "@/components/events/HeroEventSlider"
import { getHostPath } from "@/lib/navigationUtils"

import { useGetMeQuery } from "@/store/api/authApi"

export const EventsHero = memo(({ totalEvents, searchQuery, setSearchQuery, featuredEvents, isLoading }) => {
    // Robust Auth Check matching Navbar
    const { data: userData, isError: isAuthError } = useGetMeQuery()
    const isAuthenticated = !!userData && !isAuthError

    // Fallback to localStorage to prevent hydration mismatch/flicker if query is loading but local data exists
    const effectiveAuth = isAuthenticated || !!localStorage.getItem("user");

    const hostPath = getHostPath('event', effectiveAuth)

    return (
        <div className="relative bg-white pt-20 pb-12 px-4 overflow-hidden border-b border-gray-100">
            {/* Background Elements - Clean Background matching Community Page */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                {/* Removed extra gradients to reduce brightness/contrast jump */}
            </div>

            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="text-center lg:text-left max-w-2xl animate-fade-in">


                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#00142E] mb-6 leading-[1.1] tracking-tight">
                            Discover Amazing <span className="text-[#CB2A25]">Events</span>
                        </h1>

                        <p className="text-[#00142E]/70 text-base md:text-lg max-w-xl mb-8 font-medium leading-relaxed">
                            Explore concerts, workshops, meetups, and more happening around the world. Join millions of people creating memorable experiences.
                        </p>

                        {/* Search Bar - Adapted for Light Background */}
                        <div className="relative mb-8 max-w-lg mx-auto lg:mx-0 group">
                            <input
                                type="text"
                                placeholder="Search events by name, location, or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-5 py-3 pl-12 rounded-xl bg-[#F8F9FA] border border-gray-200 text-[#00142E] placeholder-[#00142E]/50 focus:outline-none focus:border-[#00142E] focus:ring-2 focus:ring-[#00142E]/10 transition-all duration-300 shadow-sm hover:shadow-md"
                            />
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#00142E]/50 group-focus-within:text-[#00142E] transition-colors duration-300" />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                            <Link to={hostPath}>
                                <Button className="h-12 px-6 sm:px-8 bg-[#00142E] hover:bg-[#00142E]/90 text-white rounded-xl font-medium shadow-lg shadow-[#00142E]/20 flex items-center gap-2 transform hover:scale-105 transition-all duration-300 text-sm sm:text-base">
                                    <Plus className="h-5 w-5" />
                                    Host an Event
                                </Button>
                            </Link>
                        </div>


                    </div>

                    {/* Hero Slider */}
                    <div className="w-full lg:w-1/2 animate-slide-in-right">
                        <HeroEventSlider events={isLoading ? [] : featuredEvents} />
                    </div>
                </div>
            </div>
        </div>
    )
})
EventsHero.displayName = "EventsHero"
