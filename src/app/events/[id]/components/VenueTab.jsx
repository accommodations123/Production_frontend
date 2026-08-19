import React, { memo } from "react"
import { MapPin, Video, Monitor, Car, Navigation, Shield, Wifi, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export const VenueTab = memo(({ event, visibleSections }) => {
    if (event.event_mode === 'online') {
        return (
            <div id="venue" className="space-y-6 md:space-y-8">
                <section className={`bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-xl overflow-hidden animate-section transition-all duration-700 ${visibleSections.has('venue') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="relative h-64 md:h-80">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
                            <Video className="h-20 w-20 text-blue-600" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/80 to-transparent h-32"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">Online Event Platform</h3>
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                            This event will be hosted online. You can join from anywhere in the world using the link provided after registration.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="group bg-gradient-to-b from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Video className="h-6 w-6 text-white" />
                                </div>
                                <p className="font-semibold text-gray-900">Platform</p>
                                <p className="text-gray-600 text-sm">{event.event_url ? new URL(event.event_url).hostname : 'Online Platform'}</p>
                            </div>
                            <div className="group bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Wifi className="h-6 w-6 text-white" />
                                </div>
                                <p className="font-semibold text-gray-900">Requirements</p>
                                <p className="text-gray-600 text-sm">Stable internet connection</p>
                            </div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-3">How to Join</h3>
                            <div className="text-gray-700 whitespace-pre-line">
                                {event.online_instructions || 'Register for the event and you will receive the event link via email.'}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (event.event_mode === 'hybrid') {
        return (
            <div id="venue" className="space-y-6 md:space-y-8">
                <section className={`bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-xl overflow-hidden animate-section transition-all duration-700 ${visibleSections.has('venue') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="relative h-64 md:h-80">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center">
                            <Monitor className="h-20 w-20 text-purple-600" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-900/80 to-transparent h-32"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">Hybrid Event</h3>
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                            This event offers both in-person and online attendance options. Choose what works best for you!
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-accent" />
                                    In-Person Location
                                </h3>
                                <p className="text-gray-700 mb-4">{event.venueName || event.location}</p>
                                <p className="text-gray-600 text-sm mb-4">{event.address}</p>
                                <Button
                                    onClick={() => window.open(event.googleMapsUrl, '_blank')}
                                    className="w-full bg-accent text-white hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 shadow-xl rounded-2xl"
                                >
                                    Get Directions
                                </Button>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Video className="h-5 w-5 text-blue-500" />
                                    Online Access
                                </h3>
                                <p className="text-gray-700 mb-4">Join from anywhere in the world</p>
                                {event.event_url && (
                                    <p className="text-gray-600 text-sm mb-4 truncate">{event.event_url}</p>
                                )}
                                <Button
                                    onClick={() => event.event_url && window.open(event.event_url.trim(), '_blank')}
                                    className="w-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-xl rounded-2xl"
                                >
                                    Join Online
                                </Button>
                            </div>
                        </div>
                        {event.online_instructions && (
                            <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-3">Online Instructions</h3>
                                <div className="text-gray-700 whitespace-pre-line">
                                    {event.online_instructions}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div id="venue" className="space-y-6 md:space-y-8">
            <section className={`bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-xl overflow-hidden animate-section transition-all duration-700 ${visibleSections.has('venue') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="relative h-64 md:h-80">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <MapPin className="h-20 w-20 text-gray-400" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-accent/80 h-32"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{event.venueName || event.location}</h3>
                    </div>
                </div>
                <div className="p-6 md:p-8">
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                        {event.venueDescription}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="group bg-accent/10 rounded-2xl p-4 border border-accent/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
                            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <MapPin className="h-6 w-6 text-white" />
                            </div>
                            <p className="font-semibold text-gray-900">Address</p>
                            <p className="text-gray-600 text-sm">{event.address}</p>
                        </div>
                        {event.parkingInfo && (
                            <div className="group bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Car className="h-6 w-6 text-white" />
                                </div>
                                <p className="font-semibold text-gray-900">Parking</p>
                                <p className="text-gray-600 text-sm">{event.parkingInfo}</p>
                            </div>
                        )}
                        {event.accessibilityInfo && (
                            <div className="group bg-accent/10 rounded-2xl p-4 border border-accent/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
                                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Navigation className="h-6 w-6 text-white" />
                                </div>
                                <p className="font-semibold text-gray-900">Accessibility</p>
                                <p className="text-gray-600 text-sm">{event.accessibilityInfo}</p>
                            </div>
                        )}
                    </div>
                    <Button
                        onClick={() => window.open(event.googleMapsUrl, '_blank')}
                        className="w-full sm:w-auto bg-accent text-white hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 shadow-xl rounded-2xl"
                    >
                        Get Directions
                    </Button>
                </div>
            </section>
            {(event.facilities?.length > 0 || event.accessibilityFeatures?.length > 0) && (
                <section
                    className={`bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-xl p-6 md:p-8 animate-section transition-all duration-700 delay-100 ${visibleSections.has('venue-features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}
                    id="venue-features"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Venue Features</h2>
                            <p className="text-gray-500 text-sm mt-1">Everything you need for a successful event</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {event.facilities?.length > 0 && (
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                                <h3 className="font-bold text-gray-900 mb-3">Facilities</h3>
                                <ul className="space-y-2">
                                    {event.facilities.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <Wifi className="h-4 w-4 text-accent" />
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {event.accessibilityFeatures?.length > 0 && (
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                                <h3 className="font-bold text-gray-900 mb-3">Accessibility</h3>
                                <ul className="space-y-2">
                                    {event.accessibilityFeatures.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    )
})
VenueTab.displayName = "VenueTab"
