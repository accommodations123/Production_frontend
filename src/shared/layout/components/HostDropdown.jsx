import * as React from "react"
import { Sparkles, Home, Calendar, Plane, ShoppingBag, ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { getHostPath } from "@/shared/utils/navigationUtils"
import { useClickOutside } from "@/shared/hooks/useClickOutside"

export function HostDropdown({ isAuthenticated }) {
    const navigate = useNavigate()
    const [isHostDropdownOpen, setIsHostDropdownOpen] = React.useState(false)

    const hostDropdownRef = useClickOutside(() => setIsHostDropdownOpen(false))

    const hostOptions = [
        {
            id: 'property',
            title: 'Share Your Space',
            description: 'List your property for stays',
            icon: <Home className="h-5 w-5" />,
            path: getHostPath('property', isAuthenticated)
        },
        {
            id: 'event',
            title: 'Host an Event',
            description: 'Organize workshops, meetups or festivals.',
            icon: <Calendar className="h-5 w-5" />,
            path: getHostPath('event', isAuthenticated)
        },
        {
            id: 'travel',
            title: 'Become Travel Partner',
            description: 'Connect with fellow travelers.',
            icon: <Plane className="h-5 w-5" />,
            path: getHostPath('travel', isAuthenticated)
        },
        {
            id: 'marketplace',
            title: 'Sell an Item',
            description: 'List products in Buy/Sell marketplace.',
            icon: <ShoppingBag className="h-5 w-5" />,
            path: getHostPath('marketplace', isAuthenticated)
        },
    ]

    return (
        <div className="relative mr-1" ref={hostDropdownRef}>
            <button
                onClick={() => setIsHostDropdownOpen(!isHostDropdownOpen)}
                className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg text-slate-700 hover:bg-gray-100 hover:text-slate-900 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E1392A] active:scale-[0.98]"
            >
                <Sparkles className="w-4 h-4 text-[#E1392A]" />
                <span className="hidden xl:inline whitespace-nowrap">Become Host</span>
                <span className="xl:hidden">Host</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#717171]" />
            </button>

            <AnimatePresence>
                {isHostDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50"
                    >
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-xs font-semibold text-[#484848] uppercase tracking-wide">Start Hosting</p>
                        </div>
                        <div className="p-2">
                            {hostOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        navigate(option.path)
                                        setIsHostDropdownOpen(false)
                                    }}
                                    className="w-full text-left p-3 rounded-xl hover:bg-gray-50/80 active:scale-[0.98] transition-all duration-200 flex items-center gap-3 group"
                                >
                                    <span className="p-2 rounded-lg bg-gray-100 text-[#222222] group-hover:bg-[#E1392A]/10 group-hover:text-[#E1392A] transition-colors">
                                        {option.icon}
                                    </span>
                                    <span className="flex-1">
                                        <span className="block font-semibold text-foreground text-sm group-hover:text-[#E1392A] transition-colors">{option.title}</span>
                                        <span className="block text-xs text-[#484848]">{option.description}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
