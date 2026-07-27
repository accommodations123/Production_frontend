import { Users, MessageSquare } from "lucide-react";
import { Button } from "@/shared/ui/button";

/**
 * Sticky right-column sidebar for the room detail page: pricing breakdown,
 * quick guest info, and the direct-connect CTA.
 */
export function HostSidebar({ listing, formatPrice, onContact }) {
    return (
        <div className="">
            <div className="md:sticky md:top-28">
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8">
                    <div className="flex flex-col gap-3 mb-6">
                        {listing.price.nightly > 0 && (
                            <div className="flex items-baseline justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-slate-900">{formatPrice(listing.price.nightly, listing.price.currency)}</span>
                                    <span className="text-[#484848] font-medium">/ night</span>
                                </div>
                            </div>
                        )}

                        {listing.price.hourly > 0 && (
                            <div className="flex items-baseline justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                <div className="flex items-baseline gap-1">
                                    <span className={`${listing.price.nightly > 0 ? 'text-xl text-slate-700' : 'text-3xl text-slate-900'} font-bold`}>
                                        {formatPrice(listing.price.hourly, listing.price.currency)}
                                    </span>
                                    <span className="text-[#484848] font-medium">/ hour</span>
                                </div>
                            </div>
                        )}

                        {listing.price.monthly > 0 && (
                            <div className="flex items-baseline justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                <div className="flex items-baseline gap-1">
                                    <span className={`${(listing.price.nightly > 0 || listing.price.hourly > 0) ? 'text-xl text-slate-700' : 'text-3xl text-slate-900'} font-bold`}>
                                        {formatPrice(listing.price.monthly, listing.price.currency)}
                                    </span>
                                    <span className="text-[#484848] font-medium">/ month</span>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 border border-slate-200 rounded-xl overflow-hidden">
                            <div className="p-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer flex justify-between items-center group">
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-[#484848] tracking-wider">Guests</div>
                                    <div className="text-sm font-medium text-slate-900 mt-0.5">{listing.highlights.find(h => h.label === 'Capacity')?.text || '1 Guest'}</div>
                                </div>
                                <Users className="w-4 h-4 text-slate-300 group-hover:text-[#484848] transition-colors" />
                            </div>
                        </div>

                        <Button
                            onClick={onContact}
                            className="w-full bg-[#CB2A26] hover:bg-[#a82220] text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all text-sm mt-4"
                        >
                            <MessageSquare className="w-4 h-4" />
                            {listing.isSeekerRequest ? "Contact Seeker" : "Direct Connect"}
                        </Button>

                        <p className="text-center text-xs text-[#717171] mt-3">
                            Direct P2P verified communication
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
