import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye, Calendar, MapPin, Clock, Lock, ImageOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { COUNTRIES } from "@/lib/mock-data"
import { useCountry } from "@/context/CountryContext"

export function EventCard({ event, onDelete }) {
    const [isDeleting, setIsDeleting] = useState(false)

    if (!event) return null

    const id = event._id || event.id
    const status = (event.status || "").toLowerCase()
    const bannerUrl = event.banner_image || null

    const startDate = event.start_date ? new Date(event.start_date).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    }) : "Date TBD"

    const startTime = event.start_time || "Time TBD"
    const location = [event.city, event.country].filter(Boolean).join(", ") || "Location TBD"

    const getCurrencySymbol = (countryName) => {
        if (!countryName) return '$';
        const country = COUNTRIES.find(c => c.name === countryName || c.code === countryName);
        if (!country || !country.currency) return '$';

        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: country.currency,
            }).formatToParts(0).find(part => part.type === 'currency')?.value || country.currency;
        } catch (e) {
            return country.currency;
        }
    };

    const { activeCountry } = useCountry();
    const targetCountryName = activeCountry?.name || event.country;
    const currencySymbol = getCurrencySymbol(targetCountryName);
    const price = event.price && event.price !== "0" && event.price !== 0 ? `${currencySymbol}${event.price}` : "Free"

    // Status badge configuration
    const getStatusBadge = () => {
        switch (status) {
            case "approved":
                return { text: "Approved", className: "bg-green-500 text-white" }
            case "pending":
                return { text: "Pending", className: "bg-yellow-500 text-white" }
            case "rejected":
                return { text: "Rejected", className: "bg-red-500 text-white" }
            default:
                return { text: "Draft", className: "bg-gray-400 text-white" }
        }
    }

    const statusBadge = getStatusBadge()
    const isPending = status === "pending"

    return (
        <div className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all">
            {/* Image with Status Badge */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                {bannerUrl ? (
                    <img
                        src={bannerUrl}
                        alt={event.title || "Event"}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <ImageOff className="w-12 h-12 text-gray-400" />
                    </div>
                )}

                {/* Status Badge - Top Right */}
                <div className={cn(
                    "absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-semibold shadow-lg",
                    statusBadge.className
                )}>
                    {statusBadge.text}
                </div>

                {/* Event Type Badge - Top Left */}
                <div className="absolute top-3 left-3">
                    <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md text-[10px] font-bold uppercase tracking-wider text-primary">
                        {event.event_type || "Event"}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1">
                        {event.title || "Untitled Event"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-accent font-semibold uppercase">
                        <Calendar className="w-3 h-3" />
                        <span>{startDate}</span>
                        <span className="mx-1">•</span>
                        <Clock className="w-3 h-3" />
                        <span>{startTime}</span>
                    </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">{location}</span>
                </div>

                {/* Price */}
                <div className="text-lg font-bold text-gray-900">
                    {price}
                </div>

                {/* Pending Review Message */}
                {isPending && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                        <p className="text-xs text-yellow-800">
                            Your event is under review.
                        </p>
                    </div>
                )}

                {status === 'approved' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        <p className="text-xs text-green-800">
                            Approved events cannot be edited.
                        </p>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                    >
                        <Link to={`/events/${id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                        </Link>
                    </Button>

                    {status !== 'approved' && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            asChild
                        >
                            <Link to={`/events/host?edit=${id}`}>
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                            </Link>
                        </Button>
                    )}

                    <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        disabled={isDeleting}
                        onClick={async () => {
                            if (typeof onDelete === "function" && window.confirm("Are you sure you want to delete this event?")) {
                                setIsDeleting(true)
                                try {
                                    await onDelete(id)
                                } finally {
                                    setIsDeleting(false)
                                }
                            }
                        }}
                    >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {isDeleting ? "..." : "Delete"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
