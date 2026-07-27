import { MapPin, Share2, ShieldCheck } from "lucide-react";
import WishlistButton from "@/shared/ui/WishlistButton";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { HostDetailSocials } from '@/shared/ui/SocialConnect';
import { Tooltip } from "@/shared/ui/tooltip";

/**
 * Left-column content for the room detail page: title header, host promo
 * card, highlight stats, description, amenities grid, and map embed.
 */
export function PropertyInfo({ listing, onShare, onShowAllAmenities }) {
    return (
        <div className="min-w-0 space-y-10">

            {/* Title Header */}
            <div className="border-b border-slate-100 pb-8">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-medium hover:bg-slate-200">
                                {listing.type}
                            </Badge>
                            {listing.isVerified && (
                                <Tooltip content="This listing has been verified by the NextKinLife team for authenticity and safety.">
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 pl-1 pr-2 hover:bg-emerald-100 cursor-help">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                                    </Badge>
                                </Tooltip>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
                            {listing.title}
                        </h1>
                        <div className="flex items-center text-[#484848] text-base">
                            <MapPin className="w-4 h-4 mr-1.5 text-rose-500" />
                            {listing.location.city}, {listing.location.country}
                        </div>
                    </div>

                    {/* Desktop Share/Save */}
                    <div className="hidden md:flex gap-2">
                        <Button variant="outline" size="sm" onClick={onShare} className="gap-2 text-slate-700">
                            <Share2 className="w-4 h-4" /> Share
                        </Button>
                        <div className="flex items-center">
                            <WishlistButton
                                itemId={listing.id}
                                itemType="property"
                                className="h-9 px-4 py-2 border border-slate-200 rounded-md hover:bg-slate-100 flex items-center gap-2 transition-colors"
                                iconSize={16}
                                outlineColor="text-slate-700"
                                filledColor="fill-rose-500 text-rose-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Host Promo Card */}
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-rose-50 to-white border border-rose-100/50">
                <div className="relative">
                    {listing.host.avatar ? (
                        <img src={listing.host.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" alt={listing.host.name} />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xl border-2 border-white shadow-sm">
                            {listing.host.initials}
                        </div>
                    )}
                    {listing.host.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                            <ShieldCheck className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900">Hosted by {listing.host.name}</h3>
                    <div className="flex items-center gap-1.5">
                        <Tooltip content="Superhosts are experienced, highly rated hosts who are committed to providing great stays.">
                            <span className="text-[#484848] text-sm border-b border-dashed border-slate-300 cursor-help">Superhost</span>
                        </Tooltip>
                        <span className="text-[#717171] text-sm">·</span>
                        <span className="text-[#484848] text-sm">Very responsive</span>
                    </div>
                </div>
                <HostDetailSocials socials={listing.host.socials} />
            </div>

            {/* Highlights Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {listing.highlights.map((h, i) => (
                    <div key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:shadow-sm transition-shadow">
                        <h.icon className="w-6 h-6 text-slate-700 mb-2" />
                        <span className="font-semibold text-slate-900">{h.text.split(' ')[0]}</span>
                        <span className="text-xs text-[#484848] uppercase tracking-wide">{h.label}</span>
                    </div>
                ))}
            </div>

            {/* Description */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">About this place</h2>
                <p className="text-[#222222] leading-relaxed whitespace-pre-wrap text-lg">
                    {listing.description}
                </p>
            </div>

            {/* Amenities */}
            <div className="border-t border-slate-200 pt-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">What this place offers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listing.amenities.slice(0, 10).map((am, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <am.icon className="w-6 h-6 text-[#484848]" />
                            <span className="text-slate-700">{am.name}</span>
                        </div>
                    ))}
                </div>
                {listing.amenities.length > 10 && (
                    <Button variant="outline" className="mt-6 w-full md:w-auto" onClick={onShowAllAmenities}>
                        Show all {listing.amenities.length} amenities
                    </Button>
                )}
            </div>

            {/* Map */}
            <div className="border-t border-slate-200 pt-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Where you’ll be</h2>
                <div className="h-[400px] w-full rounded-2xl overflow-hidden relative group">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(`${listing.location.city}, ${listing.location.country}`)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        frameBorder="0"
                        className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
                        title="Location"
                    />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.location.city}, ${listing.location.country}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/90 backdrop-blur pointer-events-auto px-6 py-3 rounded-full shadow-lg font-semibold text-slate-900 flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all"
                        >
                            <MapPin className="w-4 h-4 text-rose-600" /> Open in Maps
                        </a>
                    </div>
                </div>
                <div className="mt-4 text-[#484848] text-sm flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{listing.location.city}, {listing.location.country}. Exact location provided after booking.</p>
                </div>
            </div>

        </div>
    );
}
