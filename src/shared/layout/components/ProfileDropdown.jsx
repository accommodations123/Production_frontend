import * as React from "react"
import { ChevronDown, Home, User, Briefcase, Building, ShoppingBag, Users, Heart, Plane, LogOut } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Link } from "react-router-dom"
import { cn } from "@/shared/utils/utils"
import { useClickOutside } from "@/shared/hooks/useClickOutside"

export function ProfileDropdown({ resolvedUser, displayName, renderTimestamp, handleLogout }) {
    const [isProfileOpen, setIsProfileOpen] = React.useState(false)
    const profileRef = useClickOutside(() => setIsProfileOpen(false))

    const menuItems = [
        { to: "/account-v2?tab=overview", icon: Home, label: "Overview" },
        { to: "/account-v2?tab=personal", icon: User, label: "Personal Info" },
        { to: "/account-v2?tab=applications", icon: Briefcase, label: "My Applications" },
        { to: "/account-v2?tab=listings", icon: Building, label: "My Listings" },
        { to: "/account-v2?tab=buy-sell", icon: ShoppingBag, label: "My Buy/Sell" },
        { to: "/account-v2?tab=communities", icon: Users, label: "My Communities" },
        { to: "/account-v2?tab=wishlist", icon: Heart, label: "My Wishlist" },
        { to: "/account-v2?tab=trips", icon: Plane, label: "My Trips" },
    ];

    return (
        <div className="relative ml-1" ref={profileRef}>
            <button
                aria-label="Account menu"
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E1392A]"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
                <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-gray-200">
                    {resolvedUser?.profile_image ? (
                        <img src={`${resolvedUser.profile_image}?v=${renderTimestamp}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#00142E] text-white font-bold text-xs">
                            {displayName.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>
                <ChevronDown className={cn("h-4 w-4 text-[#717171] transition-transform", isProfileOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isProfileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 py-2"
                    >
                        <div className="px-4 py-3 border-b border-gray-100 mb-1">
                            <p className="text-foreground font-semibold truncate">{displayName}</p>
                            <Link to="/account-v2?tab=personal" className="text-xs text-[#484848] hover:text-[#E1392A] transition-colors" onClick={() => setIsProfileOpen(false)}>
                                View Profile
                            </Link>
                        </div>
                        
                        <div className="px-2 space-y-0.5">
                            {menuItems.map(({ to, icon: Icon, label }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:text-foreground hover:bg-gray-50/80 rounded-lg hover:translate-x-1 active:scale-[0.98] transition-all duration-200"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Icon className="h-4 w-4 text-[#717171]" />
                                    {label}
                                </Link>
                            ))}
                        </div>

                        <div className="mt-1 pt-1 border-t border-gray-100 px-2">
                            <button
                                onClick={() => {
                                    setIsProfileOpen(false)
                                    handleLogout()
                                }}
                                className="w-full text-left px-3 py-2.5 text-sm text-[#E1392A] hover:bg-[#E1392A]/10 font-semibold rounded-lg flex items-center gap-3 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
