"use client"

import * as React from "react"
import { Menu, Globe, User, ChevronDown, X, Search, Users, Briefcase, Home, Calendar, Building, Plane, BookOpen, ShoppingBag, HomeIcon, Check, Sparkles, Settings as SettingsIcon, Grid3X3, LogOut, Heart, UserCheck, Repeat, MessageSquare } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CATEGORIES, COUNTRIES } from "@/lib/mock-data"
import { getHostPath } from "@/lib/navigationUtils"
import { resolveImageUrl } from "@/lib/imageUtils"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useCountry } from "@/context/CountryContext"
import { useClickOutside } from "@/hooks/useClickOutside"
import { getSocket, disconnectSocket } from "@/lib/socket"
import { useDispatch, useSelector } from "react-redux"
import { logoutUser, fetchCurrentUser } from "@/store/slices/authSlice"
import { useGetHostProfileQuery } from "@/hooks/data/useHostHooks"
import { invalidateTags } from "@/lib/supabase/eventBus"
import { NotificationDropdown } from "@/components/common/NotificationDropdown"
import { clearAuthCookie } from "@/shared/utils/cookieUtils"
import { MobileSidebar } from './MobileSidebar'

export function Navbar({ minimal = false, onMenuClick }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [renderTimestamp] = React.useState(() => Date.now());

    const socketRef = React.useRef(null);
    const isSocketInitialized = React.useRef(false);

    const [isScrolled, setIsScrolled] = React.useState(false)
    const { activeCountry, setCountry, isSelected } = useCountry()
    const [isCountryOpen, setIsCountryOpen] = React.useState(false)
    const [isProfileOpen, setIsProfileOpen] = React.useState(false)
    const [isHostDropdownOpen, setIsHostDropdownOpen] = React.useState(false)
    const [isPeopleDropdownOpen, setIsPeopleDropdownOpen] = React.useState(false)

    // ================= AUTH STATE (BACKEND VERIFIED) =================
    const { user: authUser, loading: isAuthLoading, error: isAuthError } = useSelector((state) => state.auth)
    const userDetails = authUser?.user !== undefined ? authUser.user : authUser
    const isAuthenticated = Boolean(userDetails && (userDetails.id || userDetails.email)) && !isAuthError

    // Automatically fetch current user session on mount
    React.useEffect(() => {
        dispatch(fetchCurrentUser())
    }, [dispatch])

    // Fetch host profile if authenticated
    const { data: hostProfile } = useGetHostProfileQuery(undefined, {
        skip: !isAuthenticated,
    })
    const resolvedUser = React.useMemo(() => {
        if (!isAuthenticated || !userDetails) return null;

        return {
            ...(hostProfile || {}),
            ...userDetails,
            profile_image: (() => {
                const candidates = [
                    hostProfile?.profile_image,
                    userDetails?.profile_image,
                ];
                const fullUrl = candidates.find(img => img && img.startsWith('http'));
                if (fullUrl) return fullUrl;
                const rawKey = candidates.find(img => img);
                return resolveImageUrl(rawKey);
            })()
        };
    }, [isAuthenticated, userDetails, hostProfile]);

    const displayName = React.useMemo(() => {
        if (!resolvedUser) return "User";
        const name = resolvedUser?.name;
        const fullName = resolvedUser?.full_name;
        const emailName = resolvedUser?.email?.split("@")[0];

        if (name && name.trim() !== "") return name;
        if (fullName && fullName.trim() !== "") return fullName;
        if (emailName) return emailName;

        return "User";
    }, [resolvedUser]);

    // Handle logout function
    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
        } catch (e) {
            console.warn("Backend logout failed, proceeding with local cleanup", e);
        }
        disconnectSocket();
        clearAuthCookie();

        invalidateTags(['User', 'Host', 'Property', 'Event', 'Trips', 'Wishlist', 'Notification']);
        setIsMobileMenuOpen(false);
        navigate("/signin");
    };

    // Auto-scroll listener
    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // WebSocket Initialization
    React.useEffect(() => {
        if (!isAuthenticated) return;

        const socket = getSocket();
        socketRef.current = socket;
        isSocketInitialized.current = true;

        return () => {
            if (socketRef.current) {
                socketRef.current = null;
            }
        };
    }, [isAuthenticated]);

    // Mobile State
    const [isMobileCountryOpen, setIsMobileCountryOpen] = React.useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    const [countrySearchQuery, setCountrySearchQuery] = React.useState("")
    const location = useLocation()

    const filteredCountries = React.useMemo(() => {
        if (!countrySearchQuery) return COUNTRIES;
        const query = countrySearchQuery.toLowerCase();
        return COUNTRIES.filter(c => c.name?.toLowerCase().includes(query) || c.code?.toLowerCase().includes(query));
    }, [countrySearchQuery]);

    React.useEffect(() => {
        if (!isCountryOpen && !isMobileCountryOpen) {
            const timeout = setTimeout(() => setCountrySearchQuery(""), 200);
            return () => clearTimeout(timeout);
        }
    }, [isCountryOpen, isMobileCountryOpen]);

    // Close dropdowns on route change
    React.useEffect(() => {
        setIsMobileCountryOpen(false)
        setIsHostDropdownOpen(false)
        setIsPeopleDropdownOpen(false)
        setIsCountryOpen(false)
        setIsProfileOpen(false)
    }, [location.pathname])

    // Click Outside Refs
    const countryRef = useClickOutside(() => setIsCountryOpen(false))
    const profileRef = useClickOutside(() => setIsProfileOpen(false))
    const mobileCountryRef = useClickOutside(() => setIsMobileCountryOpen(false))
    const hostDropdownRef = useClickOutside(() => setIsHostDropdownOpen(false))
    const peopleDropdownRef = useClickOutside(() => setIsPeopleDropdownOpen(false))

    // Host options for dropdown
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
            id: 'people',
            title: 'Become an Expert',
            description: 'Offer consultations and guidance.',
            icon: <Users className="h-5 w-5" />,
            path: getHostPath('people', isAuthenticated)
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
            description: 'List products in Marketplace.',
            icon: <ShoppingBag className="h-5 w-5" />,
            path: getHostPath('marketplace', isAuthenticated)
        },
    ]

    // Navigation items
    const navItems = [
        { name: "Home", path: "/" },
        { name: "Accommodations", path: "/accommodations" },
        { name: "Marketplace", path: "/marketplace" },
        { name: "People", path: "/people" },
        { name: "Events", path: "/events" },
        { name: "Travel Partners", path: "/travel" },
    ]

    const getCountryCode = () => {
        if (!activeCountry) return "";
        if (activeCountry.code) return activeCountry.code;
        if (activeCountry.country) return activeCountry.country;
        return "";
    };

    const handleMyProfessionalProfileClick = () => {
        setIsPeopleDropdownOpen(false);
        setIsProfileOpen(false);
        if (isAuthenticated) {
            navigate("/people/become");
        } else {
            navigate("/signin?redirect=/people/become");
        }
    };

    return (
        <>
            {/* ================= DESKTOP NAVBAR ================= */}
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-500 hidden lg:block",
                    isScrolled
                        ? "bg-[#0A1A2F]/80 backdrop-blur-2xl border-b border-white/5 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                        : "bg-gradient-to-b from-[#0A1A2F]/90 to-transparent py-5"
                )}
            >
                <div className="max-w-[1600px] mx-auto px-4 lg:px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group relative">
                        <div className="relative w-10 h-10 lg:w-12 lg:h-12 xl:w-16 xl:h-16 rounded-xl xl:rounded-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-accent/50 transition-all shadow-2xl shadow-black/20">
                            <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <img
                                src="/logo.jpeg"
                                alt="NextKinLife Logo"
                                className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700 ease-out"
                            />
                        </div>
                        <div className="hidden 2xl:flex items-center transition-all duration-300">
                            <span className="text-white font-bold text-xl">Next</span>
                            <span className="text-white font-bold text-xl">Kin</span>
                            <span className="text-accent font-bold text-xl">Life</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    {!minimal && (
                        <nav className="hidden lg:flex items-center gap-0.5 p-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-md shadow-inner shadow-black/20">
                            {navItems.map((item) => {
                                const isActive = location.pathname.startsWith(item.path) && (item.path !== "/" || location.pathname === "/");
                                
                                if (item.hasDropdown) {
                                    return (
                                        <div key={item.name} className="relative" ref={peopleDropdownRef}>
                                            <button
                                                onClick={() => setIsPeopleDropdownOpen(!isPeopleDropdownOpen)}
                                                className={cn(
                                                    "relative px-2.5 lg:px-3 xl:px-4 2xl:px-5 py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-1 cursor-pointer",
                                                    isActive || isPeopleDropdownOpen
                                                        ? "text-white"
                                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="navbar-pill"
                                                        className="absolute inset-0 bg-accent rounded-full shadow-[0_0_20px_rgba(203,42,37,0.3)]"
                                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                    />
                                                )}
                                                <span className="relative z-10">{item.name}</span>
                                                <ChevronDown className={cn("relative z-10 w-3.5 h-3.5 transition-transform duration-200", isPeopleDropdownOpen && "rotate-180")} />
                                            </button>

                                            {/* Image 2 Rule: Dropdown has ONLY 2 options: Browse People & My Professional Profile */}
                                            <AnimatePresence>
                                                {isPeopleDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 p-1.5"
                                                    >
                                                        <Link
                                                            to="/people"
                                                            onClick={() => setIsPeopleDropdownOpen(false)}
                                                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
                                                        >
                                                            <Users className="w-4 h-4 text-[#E1392A]" />
                                                            <span>Browse People</span>
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={handleMyProfessionalProfileClick}
                                                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                                                        >
                                                            <User className="w-4 h-4 text-blue-600" />
                                                            <span>My Professional Profile</span>
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={cn(
                                            "relative px-2.5 lg:px-3 xl:px-4 2xl:px-5 py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-300 whitespace-nowrap",
                                            isActive
                                                ? "text-white"
                                                : "text-white/60 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="navbar-pill"
                                                className="absolute inset-0 bg-accent rounded-full shadow-[0_0_20px_rgba(203,42,37,0.3)]"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-10">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    )}

                    {/* Desktop Right Actions */}
                    <div className="flex items-center gap-1.5 lg:gap-2 xl:gap-3">
                        {isAuthenticated && <NotificationDropdown />}

                        {/* Country Selector */}
                        <div className="relative hidden sm:block" ref={countryRef}>
                            <button
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border group",
                                    isCountryOpen
                                        ? "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                        : "bg-transparent border-transparent hover:bg-white/5 text-white/80 hover:text-white"
                                )}
                                onClick={() => setIsCountryOpen(!isCountryOpen)}
                            >
                                {!isSelected ? (
                                    <>
                                        <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                                            <Globe className="h-4 w-4" />
                                        </div>
                                        <span className="hidden xl:inline">Select Country</span>
                                    </>
                                ) : (
                                    <>
                                        {activeCountry && activeCountry.flag && (
                                            (activeCountry.flag.startsWith('/') || activeCountry.flag.startsWith('http')) ? (
                                                <img src={activeCountry.flag} alt={activeCountry.name} className="w-8 h-6 object-cover rounded-md shadow-md bg-white/10" />
                                            ) : (
                                                <span className="text-2xl filter drop-shadow-sm">{activeCountry.flag}</span>
                                            )
                                        )}
                                    </>
                                )}
                                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300 opacity-50 group-hover:opacity-100", isCountryOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {isCountryOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full right-0 mt-3 w-72 bg-[#0F2238]/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] py-2 z-50 border border-white/10 overflow-hidden"
                                    >
                                        <div className="px-5 py-3 border-b border-white/5 bg-white/5">
                                            <p className="text-[10px] font-black text-accent uppercase tracking-widest">Select Region</p>
                                            <p className="text-[10px] text-white/50 mt-1">💡 Currency will be set automatically</p>
                                        </div>
                                        <div className="px-3 py-2 border-b border-white/5">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                                <input
                                                    type="text"
                                                    placeholder="Search country..."
                                                    value={countrySearchQuery}
                                                    onChange={(e) => setCountrySearchQuery(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-colors"
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
                                                            "w-full text-left px-4 py-3 text-sm rounded-xl flex items-center justify-between transition-all group",
                                                            getCountryCode() === country.code
                                                                ? "bg-accent text-white shadow-lg shadow-accent/20"
                                                                : "text-white/70 hover:bg-white/5 hover:text-white"
                                                        )}
                                                        onClick={() => {
                                                            setCountry(country)
                                                            setIsCountryOpen(false)
                                                        }}
                                                    >
                                                        <span className="flex items-center gap-4">
                                                            {(country.flag.startsWith('/') || country.flag.startsWith('http')) ? (
                                                                <img src={country.flag} alt={country.name} className="w-6 h-4 object-cover rounded shadow-sm" />
                                                            ) : (
                                                                <span className="text-lg">{country.flag}</span>
                                                            )}
                                                            <span className="font-medium">{country.name}</span>
                                                        </span>
                                                        {getCountryCode() === country.code && <Check className="w-4 h-4" />}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-6 text-center text-white/50 text-sm">
                                                    No countries found
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Become Host Button */}
                        <div className="relative hidden sm:block" ref={hostDropdownRef}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsHostDropdownOpen(!isHostDropdownOpen)}
                                className={cn(
                                    "relative overflow-hidden cursor-pointer rounded-xl px-3 lg:px-5 py-2.5 font-bold text-xs lg:text-sm transition-all flex items-center gap-2",
                                    "bg-gradient-to-r from-accent to-[#E04642] text-white shadow-lg shadow-accent/25 hover:shadow-accent/40"
                                )}
                            >
                                <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
                                <Sparkles className="w-4 h-4 fill-white/20" />
                                <span className="hidden sm:inline whitespace-nowrap">Become Host</span>
                                <span className="sm:hidden">Host</span>
                            </motion.button>

                            <AnimatePresence>
                                {isHostDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-3 w-80 bg-[#0F2238]/95 backdrop-blur-xl rounded-3xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] z-50 border border-white/10 overflow-hidden"
                                    >
                                        <div className="px-5 py-4 border-b border-white/5 bg-gradient-to-r from-accent/10 to-transparent">
                                            <p className="text-[10px] font-black text-accent uppercase tracking-widest">Start Hosting</p>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            {hostOptions.map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => {
                                                        navigate(option.path)
                                                        setIsHostDropdownOpen(false)
                                                    }}
                                                    className="w-full text-left p-3 hover:bg-white/5 rounded-2xl transition-all flex items-center gap-4 cursor-pointer group border border-transparent hover:border-white/5"
                                                >
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-white/10 to-transparent ring-1 ring-white/5 text-white group-hover:bg-accent group-hover:text-white transition-all shadow-inner">
                                                        {option.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-bold text-white text-sm group-hover:text-accent transition-colors">{option.title}</div>
                                                        <div className="text-xs text-white/50 group-hover:text-white/70">{option.description}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Profile / Sign In (Image 3: Logged-in Avatar Dropdown Menu) */}
                        {!isAuthenticated ? (
                            <Button
                                onClick={() => navigate("/signin")}
                                className="rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white hover:text-[#0A1A2F] px-3 lg:px-4 xl:px-6 font-bold tracking-wide transition-all shadow-lg hover:shadow-white/20 whitespace-nowrap cursor-pointer"
                            >
                                Sign In
                            </Button>
                        ) : (
                            <div className="relative" ref={profileRef}>
                                <button
                                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                >
                                    <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-accent transition-all shadow-lg">
                                        {resolvedUser?.profile_image ? (
                                            <img
                                                src={`${resolvedUser.profile_image}?v=${renderTimestamp}`}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent to-[#E04642] text-white font-bold text-xs">
                                                {displayName.slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-white max-w-[90px] truncate">{displayName}</span>
                                    <ChevronDown className={cn("h-3.5 w-3.5 text-white/60 transition-transform group-hover:text-white", isProfileOpen && "rotate-180")} />
                                </button>

                                {/* Image 3 Rule: Avatar menu options */}
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 py-2 text-slate-800"
                                        >
                                            <div className="px-4 py-2.5 border-b border-slate-100">
                                                <p className="font-extrabold text-sm text-slate-900 truncate">{displayName}</p>
                                                <p className="text-[11px] text-slate-500 truncate">{resolvedUser?.email || ""}</p>
                                            </div>

                                            <div className="space-y-1 p-1.5">
                                                {/* Switch to Hosting (Image 3 rule) */}
                                                <Link
                                                    to={getHostPath('property', isAuthenticated)}
                                                    className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <HomeIcon className="h-4 w-4 text-emerald-600" />
                                                    <span>Switch to Hosting</span>
                                                </Link>

                                                {/* My Professional Profile (Image 3 rule) */}
                                                <button
                                                    type="button"
                                                    onClick={handleMyProfessionalProfileClick}
                                                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all text-left cursor-pointer"
                                                >
                                                    <User className="h-4 w-4 text-blue-600" />
                                                    <span>My Professional Profile</span>
                                                </button>
                                            </div>

                                            <div className="my-1 border-t border-slate-100" />

                                            <div className="space-y-1 p-1.5">
                                                {/* Connection Requests */}
                                                <Link
                                                    to="/account-v2?tab=requests"
                                                    className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <MessageSquare className="h-4 w-4 text-orange-500" />
                                                    <span>Connection Requests</span>
                                                </Link>

                                                {/* Account settings */}
                                                <Link
                                                    to="/account-v2?tab=personal"
                                                    className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <SettingsIcon className="h-4 w-4 text-slate-500" />
                                                    <span>Account settings</span>
                                                </Link>

                                                {/* Log out */}
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-3 py-2 text-xs text-[#E1392A] hover:bg-red-50 font-bold cursor-pointer transition-colors rounded-xl flex items-center gap-3"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span>Log out</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ================= MOBILE NAVBAR ================= */}
            <div className="lg:hidden">
                <div className={cn(
                    "fixed top-0 left-0 right-0 z-50 px-4 py-3 transition-all duration-300",
                    isScrolled || isMobileMenuOpen ? "bg-[#0A1A2F]/95 backdrop-blur-xl border-b border-white/10 shadow-lg" : "bg-[#0A1A2F]"
                )}>
                    <div className="flex items-center justify-between">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMobileMenuOpen(prev => !prev);
                            }}
                            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors relative z-[60]"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        <Link to="/" className="flex items-center gap-2">
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/10">
                                <img
                                    src="/logo.jpeg"
                                    alt="NextKinLife Logo"
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <div className="flex items-center">
                                <span className="text-white font-bold text-base">Next</span>
                                <span className="text-white font-bold text-base">Kin</span>
                                <span className="text-accent font-bold text-base">Life</span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2">
                            {isAuthenticated && (
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <MobileSidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />
        </>
    )
}