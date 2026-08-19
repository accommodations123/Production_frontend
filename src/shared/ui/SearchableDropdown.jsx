import { useState, useEffect, useRef, useMemo } from "react";
import { Search, ChevronDown, Check, Loader2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/utils/utils";

const SearchableDropdown = ({
    options,
    items,
    value,
    selectedItem,
    onChange,
    onSelect,
    placeholder = "Select an option...",
    searchPlaceholder = "Search or type custom value...",
    label,
    error,
    disabled = false,
    isLoading = false,
    className,
    required = false,
}) => {
    const activeOptions = useMemo(() => {
        if (Array.isArray(options) && options.length > 0) return options;
        if (Array.isArray(items) && items.length > 0) return items;
        return Array.isArray(options) ? options : Array.isArray(items) ? items : [];
    }, [options, items]);

    const activeValue = value !== undefined && value !== null ? value : selectedItem;
    const activeOnChange = onChange || onSelect || (() => {});

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
        if (!searchQuery) return activeOptions;
        const lowerQuery = searchQuery.toLowerCase().trim();
        return activeOptions.filter((option) =>
            option.name?.toLowerCase().includes(lowerQuery) ||
            option.label?.toLowerCase().includes(lowerQuery)
        );
    }, [activeOptions, searchQuery]);

    const selectedOption = useMemo(() => {
        if (!activeValue) return null;
        const found = activeOptions.find((opt) => opt.value === activeValue || opt.name === activeValue || opt.code === activeValue || opt.isoCode === activeValue);
        if (found) return found;

        // Support manual entries / custom text values
        if (typeof activeValue === "string") {
            return { name: activeValue, label: activeValue, value: activeValue };
        }
        if (activeValue && typeof activeValue === "object") {
            return activeValue;
        }
        return null;
    }, [activeOptions, activeValue]);

    const handleSelect = (option) => {
        activeOnChange(option);
        setIsOpen(false);
        setSearchQuery("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (filteredOptions.length === 1) {
                handleSelect(filteredOptions[0]);
            } else if (searchQuery.trim()) {
                handleSelect({
                    name: searchQuery.trim(),
                    label: searchQuery.trim(),
                    value: searchQuery.trim(),
                    isoCode: "CUSTOM",
                    custom: true
                });
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className={cn("relative w-full", className)} ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div
                onClick={toggleDropdown}
                className={cn(
                    "relative flex items-center justify-between w-full min-h-[48px] px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition-all text-slate-900 select-none",
                    isOpen ? "border-slate-400 ring-2 ring-slate-200 bg-white" : "hover:border-slate-300 hover:bg-slate-100/50",
                    disabled && "opacity-50 cursor-not-allowed bg-slate-100",
                    error && "border-red-400 ring-1 ring-red-200"
                )}
            >
                <span className={cn("truncate text-sm font-medium", !selectedOption && "text-slate-400 font-normal")}>
                    {selectedOption ? (selectedOption.name || selectedOption.label) : placeholder}
                </span>
                <div className="flex items-center gap-2">
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isOpen && "rotate-180 text-slate-700")} />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.99 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-[9999] w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-900/10 overflow-hidden"
                    >
                        <div className="p-2 bg-slate-50 border-b border-slate-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <input
                                    ref={inputRef}
                                    autoFocus
                                    type="text"
                                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                                    placeholder={searchPlaceholder}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                        </div>

                        <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option, index) => {
                                    const isSelected = selectedOption && (selectedOption.code === option.code || selectedOption.isoCode === option.isoCode || selectedOption.name === option.name);
                                    return (
                                        <div
                                            key={option.code || option.isoCode || option.name || index}
                                            className={cn(
                                                "px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center justify-between transition-colors",
                                                isSelected ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                                            )}
                                            onClick={() => handleSelect(option)}
                                        >
                                            <span className="truncate">{option.name || option.label}</span>
                                            {isSelected && <Check className="h-3.5 w-3.5 text-slate-900 shrink-0" />}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="px-3 py-3 text-xs text-slate-500 italic flex flex-col gap-1 text-center">
                                    <span>No direct matches</span>
                                    {searchQuery && (
                                        <span className="text-[11px] text-slate-400 not-italic">
                                            Press Enter to add "{searchQuery.trim()}".
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Manual Entry Option */}
                            {searchQuery.trim() && (
                                <div
                                    className="px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center gap-1.5 text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors font-bold border-t border-slate-100 mt-1"
                                    onClick={() => handleSelect({ name: searchQuery.trim(), label: searchQuery.trim(), value: searchQuery.trim(), isoCode: "CUSTOM", custom: true })}
                                >
                                    <Plus className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">Use "{searchQuery.trim()}" (Custom)</span>
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


