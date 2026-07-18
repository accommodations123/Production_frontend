import React, { memo } from "react"
import { ChevronRight } from "lucide-react"

export const EventsSection = memo(({ category, events, visibleSections, onViewDetails, categoryIndex, onViewAll }) => {
    if (events.length === 0) return null

    return (
        <section
            id={category.id}
            className={`space-y-4 sm:space-y-6 mb-8 sm:mb-16`}
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[#00142E] flex items-center gap-2">
                    {category.title}
                    <span className="text-sm font-normal text-[#00142E]/60 ml-2">({events.length} events)</span>
                </h2>
                <button
                    onClick={onViewAll}
                    className="text-sm font-medium text-[#00142E] hover:text-[#00142E]/70 flex items-center gap-1 group transition-colors duration-300"
                >
                    View All
                    <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                </button>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="relative">
                <div className="flex flex-col gap-4 sm:gap-6">
                    {events.map((event) => (
                        <div key={event.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900">{event.title}</h3>
                            <p className="text-xs text-[#484848]">{event.city ? `${event.city}, ${event.country || ""}` : event.location || "Location TBA"}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
})
EventsSection.displayName = "EventsSection"
