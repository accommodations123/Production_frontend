import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, ChevronDown, Check, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const SearchableDropdown = ({
    options = [],
    value,
    onChange,
    placeholder = "Select an option...",
    searchPlaceholder = "Search...",
    label,
    error,
    disabled = false,
    isLoading = false,
    className,
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
        if (!searchQuery) return options;
        const lowerQuery = searchQuery.toLowerCase();
        return options.filter((option) =>
            option.name?.toLowerCase().includes(lowerQuery) ||
            option.label?.toLowerCase().includes(lowerQuery)
        );
    }, [options, searchQuery]);

    const selectedOption = useMemo(() => {
        if (!value) return null;
        const found = options.find((opt) => opt.value === value || opt.name === value || opt.code === value || opt.isoCode === value);
        if (found) return found;

        // Support manual entries / custom text values
        if (typeof value === "string") {
            return { name: value, label: value, value: value };
        }
        if (value && typeof value === "object") {
            return value;
        }
        return null;
    }, [options, value]);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
        setSearchQuery("");
    };

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className={cn("relative w-full", isOpen && "z-10", className)} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div
                onClick={toggleDropdown}
                className={cn(
                    "relative flex items-center justify-between w-full px-4 py-3 border-2 rounded-lg cursor-pointer transition-all",
                    isOpen ? "border-primary ring-1 ring-primary bg-primary/5" : "border-gray-200 bg-gray-50",
                    disabled && "opacity-50 cursor-not-allowed",
                    error && "border-red-500"
                )}
            >
                <span className={cn("truncate text-black", !selectedOption && "text-gray-400")}>
                    {selectedOption ? (selectedOption.name || selectedOption.label) : placeholder}
                </span>
                <div className="flex items-center gap-2">
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    <ChevronDown className={cn("h-5 w-5 text-gray-400 transition-transform", isOpen && "rotate-180")} />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    ref={inputRef}
                                    autoFocus
                                    type="text"
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary transition-all text-black"
                                    placeholder={searchPlaceholder}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto py-1">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option, index) => {
                                    const isSelected = selectedOption && (selectedOption.code === option.code || selectedOption.isoCode === option.isoCode || selectedOption.name === option.name);
                                    return (
                                        <div
                                            key={option.code || option.isoCode || option.name || index}
                                            className={cn(
                                                "px-4 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-primary hover:text-white transition-all",
                                                isSelected ? "bg-primary/10 text-primary font-medium" : "text-gray-700"
                                            )}
                                            onClick={() => handleSelect(option)}
                                        >
                                            <span className="truncate">{option.name || option.label}</span>
                                            {isSelected && <Check className="h-4 w-4" />}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-500 italic flex flex-col gap-1">
                                    <span>No results found</span>
                                    {searchQuery && (
                                        <span className="text-xs text-gray-400 not-italic">
                                            Type custom value and click "Use '{searchQuery}' (Manual Entry)" below.
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Manual Entry Option */}
                            {searchQuery && (
                                <div
                                    className="px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between text-primary bg-primary/10 hover:bg-primary hover:text-white transition-all font-semibold border-t border-gray-200"
                                    onClick={() => handleSelect({ name: searchQuery, label: searchQuery, value: searchQuery, isoCode: "CUSTOM", custom: true })}
                                >
                                    <span className="truncate">Use "{searchQuery}" (Manual Entry)</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default SearchableDropdown;
