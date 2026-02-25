import React, { memo } from "react"
import { TrendingUp, CheckCircle, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { COUNTRIES } from "@/lib/mock-data"
import { useCountry } from "@/context/CountryContext"

export const RegistrationBar = memo(({ isRegistered, handleRegister, handleLeave, event, isLoading, errorMessage, successMessage }) => {
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
    const targetCountryName = activeCountry?.name || event?.country;
    const currencySymbol = getCurrencySymbol(targetCountryName);

    return (
        <div className="sticky top-0 z-40 bg-accent/90 shadow-2xl backdrop-blur-xl">
            <div className="container mx-auto max-w-7xl px-4 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
                        className={`font-bold py-3 px-6 sm:px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl ${isRegistered
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
    )
})
RegistrationBar.displayName = "RegistrationBar"
