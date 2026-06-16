import React, { memo } from "react"
import { Calendar, CheckCircle, Camera, ExternalLink } from "lucide-react"
import { EventModeSection } from "./EventModeSection"

export const OverviewTab = memo(({ event, visibleSections }) => {
    const images = event.galleryImages || []
    return (
        <div className="space-y-6 md:space-y-8">
            <section
                id="overview"
                className={`bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-xl p-6 md:p-8 animate-section transition-all duration-700 ${visibleSections.has('overview') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
                        <Calendar className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">About this Event</h2>
                        <p className="text-gray-500 text-sm mt-1">Discover what makes this event special</p>
                    </div>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
                    <p className="text-gray-700 text-lg leading-relaxed">{event.description}</p>
                </div>
            </section>
            <EventModeSection event={event} />
            <section
                id="included"
                className={`bg-accent/10 rounded-3xl p-6 md:p-8 border border-accent/20 animate-section transition-all duration-700 ${visibleSections.has('included') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">What's Included</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {event.includedItems?.length > 0 ? (
                        event.includedItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <CheckCircle className="h-5 w-5 text-accent" />
                                <p className="text-gray-800 font-medium">{item}</p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8">
                            <p className="text-gray-500">No included items information available.</p>
                        </div>
                    )}
                </div>
            </section>
            <section
                id="gallery"
                className={`animate-section transition-all duration-700 ${visibleSections.has('gallery') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
                        <Camera className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Event Gallery</h2>
                        <p className="text-gray-500 text-sm mt-1">Get a glimpse of past events</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.length === 0 ? (
                        <p className="text-gray-500 col-span-full text-center">No gallery images available.</p>
                    ) : (
                        images.map((img, idx) => (
                            <div key={idx} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition">
                                <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover aspect-square" />
                                <div className="absolute inset-0 bg-accent/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                    <ExternalLink className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    )
})
OverviewTab.displayName = "OverviewTab"
