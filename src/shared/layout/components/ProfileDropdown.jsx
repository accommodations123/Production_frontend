import * as React from "react"
import { ChevronDown, Home, User, LogOut, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Link } from "react-router-dom"
import { cn } from "@/shared/utils/utils"
import { useClickOutside } from "@/shared/hooks/useClickOutside"

export function ProfileDropdown({ resolvedUser, displayName, renderTimestamp, handleLogout }) {
    const [isProfileOpen, setIsProfileOpen] = React.useState(false)
    const profileRef = useClickOutside(() => setIsProfileOpen(false))

    return (
        <div className="relative ml-1" ref={profileRef}>
            <button
                aria-label="Account menu"
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
                <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-slate-150 relative bg-slate-50">
                    {resolvedUser?.profile_image && !resolvedUser.profile_image.includes("ImageOff") ? (
                        <img src={`${resolvedUser.profile_image}?v=${renderTimestamp}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#00162D] text-white font-extrabold text-xs uppercase">
                            {displayName.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>
                <ChevronDown className={cn("h-4 w-4 text-[#717171] transition-transform duration-200", isProfileOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isProfileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full right-0 mt-2.5 w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden z-50 py-2.5"
                    >
                        {/* User Header Profile Card */}
                        <div className="px-4.5 py-3.5 border-b border-slate-100/80 mb-2 flex items-center gap-3 bg-[#FCFAF6]/50">
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-1 ring-slate-200 bg-slate-50">
                                {resolvedUser?.profile_image && !resolvedUser.profile_image.includes("ImageOff") ? (
                                    <img src={`${resolvedUser.profile_image}?v=${renderTimestamp}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#00162D] text-white font-black text-xs">
                                        {displayName.slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-black text-[#00162D] truncate tracking-tight">{displayName}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Verified Account</p>
                            </div>
                        </div>
                        
                        {/* Main Cockpit Actions */}
                        <div className="px-2 space-y-0.5">
                            <Link
                                to="/account-v2?tab=listings"
                                className="group flex items-center gap-3.5 px-3.5 py-2.5 text-slate-700 hover:text-[#00162D] hover:bg-slate-50 rounded-xl transition-all duration-200"
                                onClick={() => setIsProfileOpen(false)}
                            >
                                <span className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-[#CB2A26]/5 group-hover:text-[#CB2A26] transition-colors">
                                    <Home className="h-4.5 w-4.5" />
                                </span>
                                <span className="flex-1 text-left min-w-0">
                                    <span className="block font-bold text-xs tracking-tight">My Dashboard</span>
                                    <span className="block text-[9px] text-slate-400 truncate">Access stays, trips, and listings</span>
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </Link>

                            <Link
                                to="/account-v2?tab=personal"
                                className="group flex items-center gap-3.5 px-3.5 py-2.5 text-slate-700 hover:text-[#00162D] hover:bg-slate-50 rounded-xl transition-all duration-200"
                                onClick={() => setIsProfileOpen(false)}
                            >
                                <span className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-[#CB2A26]/5 group-hover:text-[#CB2A26] transition-colors">
                                    <User className="h-4.5 w-4.5" />
                                </span>
                                <span className="flex-1 text-left min-w-0">
                                    <span className="block font-bold text-xs tracking-tight">Profile Settings</span>
                                    <span className="block text-[9px] text-slate-400 truncate">Personal info & verifications</span>
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </Link>
                        </div>

                        {/* Logout Section */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100/80 px-2">
                            <button
                                onClick={() => {
                                    setIsProfileOpen(false)
                                    handleLogout()
                                }}
                                className="w-full text-left px-3 py-2.5 text-xs text-[#CB2A26] hover:bg-red-50/50 font-black rounded-xl flex items-center justify-between transition-colors cursor-pointer group"
                            >
                                <span className="flex items-center gap-3">
                                    <LogOut className="w-4 h-4 text-[#CB2A26]" />
                                    Logout Session
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
