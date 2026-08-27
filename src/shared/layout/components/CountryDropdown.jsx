import * as React from "react"
import { Globe, ChevronDown, Search, Check } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/shared/utils/utils"
import { COUNTRIES } from "@/shared/utils/mock-data"
import { useCountry } from "@/context/CountryContext"
import { useClickOutside } from "@/shared/hooks/useClickOutside"

export function CountryDropdown() {
    const { activeCountry, setCountry, isSelected } = useCountry()
    const [isCountryOpen, setIsCountryOpen] = React.useState(false)
    const [countrySearchQuery, setCountrySearchQuery] = React.useState("")

    const countryRef = useClickOutside(() => setIsCountryOpen(false))

    const filteredCountries = React.useMemo(() => {
        if (!countrySearchQuery) return COUNTRIES;
        const query = countrySearchQuery.toLowerCase();
        return COUNTRIES.filter(c => c.name?.toLowerCase().includes(query) || c.code?.toLowerCase().includes(query));
    }, [countrySearchQuery]);

    React.useEffect(() => {
        if (!isCountryOpen) {
            const timeout = setTimeout(() => setCountrySearchQuery(""), 200);
            return () => clearTimeout(timeout);
        }
    }, [isCountryOpen]);

    const getCountryCode = () => {
        if (!activeCountry) return "";
        if (activeCountry.code) return activeCountry.code;
        if (activeCountry.country) return activeCountry.country;
        return "";
    };

    return (
        <div className="relative" ref={countryRef}>
            <button
                aria-label="Select country"
                className={cn(
                    "flex items-center gap-1.5 h-10 px-2.5 rounded-lg text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    isCountryOpen ? "bg-gray-100" : "hover:bg-gray-100"
                )}
                onClick={() => setIsCountryOpen(!isCountryOpen)}
            >
                {!isSelected ? (
                    <Globe className="h-5 w-5" />
                ) : (
                    activeCountry && activeCountry.flag && (
                        (activeCountry.flag.startsWith('/') || activeCountry.flag.startsWith('http')) ? (
                            <img src={activeCountry.flag} alt={activeCountry.name} className="w-6 h-4 object-cover rounded-sm" />
                        ) : (
                            <span className="text-xl leading-none">{activeCountry.flag}</span>
                        )
                    )
                )}
                <ChevronDown className={cn("h-3.5 w-3.5 text-[#717171] transition-transform", isCountryOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isCountryOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full right-0 mt-2 w-72 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50"
                    >
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-xs font-semibold text-[#484848] uppercase tracking-wide">Select Region</p>
                            <p className="text-[11px] text-[#717171] mt-0.5">Currency is set automatically</p>
                        </div>
                        <div className="px-3 py-2 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                                <input
                                    type="text"
                                    placeholder="Search country..."
                                    value={countrySearchQuery}
                                    onChange={(e) => setCountrySearchQuery(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-[#717171] focus:outline-none focus:border-accent focus:bg-white transition-colors"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto py-2 px-2 scrollbar-hide">
                            {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => (
                                    <button
                                        key={country.code}
                                        className={cn(
                                            "w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center justify-between transition-all duration-200 active:scale-[0.98]",
                                            getCountryCode() === country.code
                                                ? "bg-accent/8 text-accent font-bold"
                                                : "text-gray-700 hover:bg-gray-50/80 hover:translate-x-1"
                                        )}
                                        onClick={() => {
                                            setCountry(country)
                                            setIsCountryOpen(false)
                                        }}
                                    >
                                        <span className="flex items-center gap-3">
                                            {(country.flag.startsWith('/') || country.flag.startsWith('http')) ? (
                                                <img src={country.flag} alt={country.name} className="w-6 h-4 object-cover rounded-sm" />
                                            ) : (
                                                <span className="text-lg">{country.flag}</span>
                                            )}
                                            <span className="font-medium">{country.name}</span>
                                        </span>
                                        {getCountryCode() === country.code && <Check className="w-4 h-4" />}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-6 text-center text-[#717171] text-sm">No countries found</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
