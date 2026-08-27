import * as React from "react"
import { Home, Calendar, Plane, ShoppingBag, Search, ChevronDown, Plus } from "lucide-react"
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
            title: 'Share Your Space (List Stay)',
            description: 'Rent out your apartment, room or PG',
            icon: <Home className="h-5 w-5" />,
            path: getHostPath('property', isAuthenticated)
        },
        {
            id: 'stay_request',
            title: 'Look for Stay (Stay Request)',
            description: 'Post details of the room you need',
            icon: <Search className="h-5 w-5" />,
            path: isAuthenticated ? '/search?action=request' : '/signin'
        },
        {
            id: 'marketplace',
            title: 'Sell an Item (Post Ad)',
            description: 'List products in Marketplace',
            icon: <ShoppingBag className="h-5 w-5" />,
            path: getHostPath('marketplace', isAuthenticated)
        },
        {
            id: 'event',
            title: 'Host an Event (Post Meetup)',
            description: 'Organize workshops, meetups or festivals',
            icon: <Calendar className="h-5 w-5" />,
            path: getHostPath('event', isAuthenticated)
        },
        {
            id: 'travel',
            title: 'Become Travel Partner',
            description: 'Connect with fellow travelers and expats',
            icon: <Plane className="h-5 w-5" />,
            path: getHostPath('travel', isAuthenticated)
        }
    ]

    return (
        <div className="relative mr-1" ref={hostDropdownRef}>
            <button
                onClick={() => setIsHostDropdownOpen(!isHostDropdownOpen)}
                className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg text-slate-700 hover:bg-gray-100 hover:text-slate-900 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.98]"
            >
                <Plus className="w-4 h-4 text-accent stroke-[2.5]" />
                <span className="hidden xl:inline whitespace-nowrap">Create Post</span>
                <span className="xl:hidden">Post</span>
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
                            <p className="text-xs font-semibold text-[#484848] uppercase tracking-wide">Create Listing / Post Ad</p>
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
                                    <span className="p-2 rounded-lg bg-gray-100 text-[#222222] group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                                        {option.icon}
                                    </span>
                                    <span className="flex-1">
                                        <span className="block font-semibold text-foreground text-sm group-hover:text-accent transition-colors">{option.title}</span>
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
