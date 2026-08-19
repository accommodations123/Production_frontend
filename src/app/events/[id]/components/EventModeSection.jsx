import React, { memo } from "react"
import { Video, Monitor, MapPin, Link2, ExternalLink, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export const EventModeSection = memo(({ event }) => {
    const isOnline = event.event_mode === 'online';
    const isHybrid = event.event_mode === 'hybrid';
    const isInPerson = event.event_mode === 'offline';
    const bgColor = isOnline ? 'from-blue-500 to-blue-600' :
        isHybrid ? 'from-purple-500 to-purple-600' :
            'from-green-500 to-green-600';
    const icon = isOnline ? <Video className="h-6 w-6 text-white" /> :
        isHybrid ? <Monitor className="h-6 w-6 text-white" /> :
            <MapPin className="h-6 w-6 text-white" />;
    const title = isOnline ? 'Online Event' :
        isHybrid ? 'Hybrid Event' :
            'In-Person Event';
    const description = isOnline
        ? 'This event will be held entirely online. Join from anywhere in the world!'
        : isHybrid
            ? 'This event has both in-person and online attendance options. Choose what works best for you!'
            : 'This event will be held in person at the venue location.';

    return (
        <section className="bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-xl p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${bgColor} rounded-2xl flex items-center justify-center shadow-lg`}>
                    {icon}
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
                    <p className="text-gray-500 text-sm mt-1">Event Format Details</p>
                </div>
            </div>
            <div className={`bg-gradient-to-b ${isOnline ? 'from-blue-50 to-blue-100' :
                isHybrid ? 'from-purple-50 to-purple-100' :
                    'from-green-50 to-green-100'
                } rounded-2xl p-6 border ${isOnline ? 'border-blue-200' :
                    isHybrid ? 'border-purple-200' :
                        'border-green-200'
                }`}>
                <p className="text-gray-700 mb-6">{description}</p>
                {(isOnline || isHybrid) && event.event_url && (
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Link2 className="h-5 w-5 text-accent" />
                            Event Link
                        </h3>
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                            <a
                                href={event.event_url.trim()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 truncate flex-1 mr-4"
                            >
                                {event.event_url.trim()}
                            </a>
                            <Button
                                onClick={() => window.open(event.event_url.trim(), '_blank')}
                                className="bg-accent text-white hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 shadow-lg rounded-xl px-4 py-2"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
                {(isOnline || isHybrid) && event.online_instructions && (
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Volume2 className="h-5 w-5 text-accent" />
                            Online Instructions
                        </h3>
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                            <p className="text-gray-700 whitespace-pre-line">{event.online_instructions}</p>
                        </div>
                    </div>
                )}
                {(isHybrid || isInPerson) && (
                    <div className={`${isHybrid ? 'pt-6 border-t border-gray-200' : ''}`}>
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-accent" />
                            {isHybrid ? 'In-Person Location' : 'Event Location'}
                        </h3>
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                            <p className="text-gray-700">{event.venueName || event.location}</p>
                            <p className="text-gray-600 text-sm mt-1">{event.address}</p>
                            <Button
                                onClick={() => {
                                    if (event.googleMapsUrl) {
                                        window.open(event.googleMapsUrl, '_blank');
                                    } else {
                                        toast.error("Location not available");
                                    }
                                }}
                                variant="link"
                                className="text-accent hover:text-accent/90 transition-colors font-medium mt-2"
                            >
                                Get Directions →
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
});
EventModeSection.displayName = "EventModeSection"
