import { Link, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { X, ChevronRight, LogOut, User, Settings, Home } from "lucide-react"
import { cn } from "@/shared/utils/utils"

const NAV_ITEMS = [
    { name: "Home", path: "/" },
    { name: "Accommodations", path: "/search" },
    { name: "Buy/Sell", path: "/marketplace" },
    { name: "Events", path: "/events" },
    { name: "Travel Partners", path: "/travel" },
    { name: "Careers", path: "/career" },
    { name: "People", path: "/people" },
]

export function MobileMenu({
    isOpen,
    onClose,
    isAuthenticated,
    resolvedUser,
    displayName,
    handleLogout,
    getCountryCode,
}) {
    const location = useLocation()

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Menu Panel */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 left-0 z-[60] w-[280px] bg-white shadow-xl"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
                                <span className="text-lg font-bold text-[#00162D] tracking-tight">Menu</span>
                                <button
                                    onClick={onClose}
                                    aria-label="Close menu"
                                    className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Nav Links */}
                            <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Mobile navigation">
                                {NAV_ITEMS.map((item) => {
                                    const isActive = location.pathname === item.path
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.path}
                                            onClick={onClose}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                                                isActive
                                                    ? "bg-[#CB2A26]/5 text-[#CB2A26]"
                                                    : "text-[#222222] hover:bg-gray-50 hover:text-slate-900"
                                            )}
                                        >
                                            <span className="flex-1">{item.name}</span>
                                            <ChevronRight
                                                className={cn(
                                                    "w-4 h-4 transition-opacity",
                                                    isActive ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </Link>
                                    )
                                })}
                            </nav>


                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
