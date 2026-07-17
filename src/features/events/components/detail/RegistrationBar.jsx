import React, { memo } from "react"
import { TrendingUp, CheckCircle, Ticket, Clock } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { COUNTRIES } from "@/shared/utils/mock-data"
import { useCountry } from "@/context/CountryContext"
import { isEventExpired } from "@/shared/utils/eventUtils"

export const RegistrationBar = memo(({ isRegistered, handleRegister, handleLeave, event, isLoading, errorMessage, successMessage }) => {
    const expired = isEventExpired(event)

    const getCurrencySymbol = (countryName) => {
        if (!countryName) return '$';
        const normalized = (countryName === "United States" || countryName === "United States of America") ? "United States of America" : countryName;
        const country = COUNTRIES.find(c => c.name === normalized || c.code === normalized);
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
    const targetCountryName = event?.country || activeCountry?.name;
    const currencySymbol = getCurrencySymbol(targetCountryName);

    // ── Expired Event Banner ──────────────────────────────────
    if (expired) {
        return (
            <>
                {/* Desktop */}
                <div className="hidden lg:block sticky top-0 z-40 bg-gray-800/90 shadow-2xl backdrop-blur-xl">
                   <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 pt-5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="text-white flex items-center gap-3">
                                <Clock className="h-5 w-5 text-gray-400" />
                                <div>
                                    <span className="font-bold">This event has ended</span>
                                    <p className="text-sm text-white/60">
                                        Registration is no longer available. Browse other upcoming events.
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => window.location.href = "/events"}
                                className="font-bold py-3 px-8 rounded-full bg-white text-gray-800 hover:bg-gray-100 transition-all duration-300 shadow-xl"
                            >
                                Browse Events
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile */}
                <div className="lg:hidden mx-4 -mt-6 relative z-20">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gray-800 px-4 py-3">
                            <div className="flex items-center gap-2 text-white">
                                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                                <span className="font-bold text-sm">This event has ended</span>
                            </div>
                            <p className="text-white/60 text-xs mt-1">
                                Registration is no longer available.
                            </p>
                        </div>
                        <div className="p-4 flex items-center justify-center">
                            <Button
                                onClick={() => window.location.href = "/events"}
                                className="w-full font-bold py-3 px-6 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-all duration-300 shadow-lg"
                            >
                                Browse Upcoming Events
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    // ── Active Event Registration Bar ─────────────────────────
    return (
        <>
            {/* Desktop: Full-width sticky bar */}
            <div className="hidden lg:block sticky top-0 z-40 bg-accent/90 shadow-2xl backdrop-blur-xl">
               <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 pt-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-white">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="h-5 w-5 text-yellow-400" />
                                <span className="font-bold">Limited Time Offer</span>
                            </div>
                            <p className="text-sm">
                                Early bird price: {currencySymbol}{event?.price || 'N/A'} (Regular price: {currencySymbol}{event?.price ? Math.round(event.price * 1.7) : 'N/A'})
                            </p>
                            {errorMessage && (
                                <p className="text-sm text-red-200 mt-1">{errorMessage}</p>
                            )}
                            {successMessage && (
                                <p className="text-sm text-green-200 mt-1">{successMessage}</p>
                            )}
                        </div>
                        <Button
                            onClick={isRegistered ? handleLeave : handleRegister}
                            disabled={isLoading}
                            className={`font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl ${isRegistered
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-white text-accent hover:bg-gray-100'
                                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Processing...
                                </>
                            ) : isRegistered ? (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Leave Event
                                </>
                            ) : (
                                <>
                                    <Ticket className="h-4 w-4 mr-2" />
                                    Register Now
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile: Compact card within page flow */}
            <div className="lg:hidden mx-4 -mt-6 relative z-20">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-accent px-4 py-3">
                        <div className="flex items-center gap-2 text-white">
                            <TrendingUp className="h-4 w-4 text-yellow-400 shrink-0" />
                            <span className="font-bold text-sm">Limited Time Offer</span>
                        </div>
                        <p className="text-white/90 text-xs mt-1">
                            Early bird: {currencySymbol}{event?.price || 'N/A'} (Regular: {currencySymbol}{event?.price ? Math.round(event.price * 1.7) : 'N/A'})
                        </p>
                    </div>
                    <div className="p-4 flex items-center justify-center">
                        <Button
                            onClick={isRegistered ? handleLeave : handleRegister}
                            disabled={isLoading}
                            className={`w-full font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg ${isRegistered
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-accent text-white hover:bg-accent/90'
                                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Processing...
                                </>
                            ) : isRegistered ? (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Leave Event
                                </>
                            ) : (
                                <>
                                    <Ticket className="h-4 w-4 mr-2" />
                                    Register Now
                                </>
                            )}
                        </Button>
                    </div>
                    {errorMessage && (
                        <p className="text-sm text-red-500 px-4 pb-3">{errorMessage}</p>
                    )}
                    {successMessage && (
                        <p className="text-sm text-green-600 px-4 pb-3">{successMessage}</p>
                    )}
                </div>
            </div>
        </>
    )
})
RegistrationBar.displayName = "RegistrationBar"

