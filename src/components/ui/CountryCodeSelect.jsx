import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COUNTRIES } from '@/lib/mock-data';
import { AnimatePresence, motion } from 'framer-motion';
import { useClickOutside } from '@/hooks/useClickOutside';

export const CountryCodeSelect = ({ value, onChange, className, isoCode }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const ref = useClickOutside(() => setIsOpen(false));

    // Filter and Sort countries: A-Z
    const filteredCountries = React.useMemo(() => {
        return [...COUNTRIES]
            .filter(c =>
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.phoneCode.includes(search) ||
                c.code.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [search]);

    const selectedCountry = React.useMemo(() => {
        if (isoCode) {
            const found = COUNTRIES.find(c => c.code === isoCode);
            if (found && found.phoneCode === value) return found;
        }
        return COUNTRIES.find(c => c.phoneCode === value) || COUNTRIES.find(c => c.code === "IN");
    }, [value, isoCode]);

    return (
        <div className={cn("relative", className)} ref={ref}>
            <button
                type="button"
                onClick={() => {
                    setIsOpen(!isOpen);
                    setSearch(""); // Reset search on open
                }}
                className="flex items-center gap-2 px-3 py-4 bg-white border-2 border-neutral/30 rounded-xl hover:border-accent/30 transition-all w-full min-w-[100px]"
            >
                {selectedCountry && (
                    <div className="flex items-center gap-2">
                        {selectedCountry.flag.startsWith('/') ? (
                            <img src={selectedCountry.flag} alt={selectedCountry.name} className="w-5 h-3.5 object-cover rounded-sm" />
                        ) : (
                            <span className="text-lg leading-none">{selectedCountry.flag}</span>
                        )}
                        <span className="font-semibold text-primary">{selectedCountry.phoneCode}</span>
                    </div>
                )}
                <ChevronDown className={cn("w-4 h-4 text-neutral/50 ml-auto transition-transform", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral/10 max-h-64 flex flex-col z-50 overflow-hidden"
                    >
                        {/* Search Input */}
                        <div className="p-2 border-b border-neutral/10 bg-white sticky top-0 z-10">
                            <input
                                type="text"
                                placeholder="Search country..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                                className="w-full px-3 py-2 text-sm bg-neutral/5 border border-neutral/10 rounded-lg focus:outline-none focus:border-accent/50 focus:bg-white transition-colors"
                            />
                        </div>

                        {/* Country List */}
                        <div className="overflow-y-auto max-h-[200px] py-1">
                            {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => (
                                    <button
                                        key={`${country.code}-${country.phoneCode}`}
                                        type="button"
                                        onClick={() => {
                                            onChange(country.phoneCode, country.code);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-neutral/5 transition-colors",
                                            (value === country.phoneCode && (!isoCode || isoCode === country.code)) && "bg-neutral/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {country.flag.startsWith('/') ? (
                                                <img src={country.flag} alt={country.name} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                                            ) : (
                                                <span className="text-xl leading-none">{country.flag}</span>
                                            )}
                                            <span className="text-sm font-medium text-primary truncate max-w-[120px]">{country.name}</span>
                                            <span className="text-xs text-neutral/50 font-mono ml-auto">({country.phoneCode})</span>
                                        </div>
                                        {(value === country.phoneCode && (!isoCode || isoCode === country.code)) && <Check className="w-3 h-3 text-accent shrink-0 ml-2" />}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-neutral/50 text-center">
                                    No countries found
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
