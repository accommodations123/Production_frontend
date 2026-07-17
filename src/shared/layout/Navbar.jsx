import * as React from "react"
import { Menu, Globe, User, ChevronDown, X, Search, Users, Briefcase, Home, Calendar, Building, Plane, ShoppingBag, Check, Sparkles, LogOut, Heart } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/utils/utils"
import { COUNTRIES } from "@/shared/utils/mock-data"
import { getHostPath } from "@/shared/utils/navigationUtils"
import { resolveImageUrl } from "@/shared/utils/imageUtils"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useCountry } from "@/context/CountryContext"
import { useClickOutside } from "@/shared/hooks/useClickOutside"
import { getSocket, disconnectSocket } from "@/shared/utils/socket"
import { useDispatch, useSelector } from "react-redux"
import { logoutUser, fetchCurrentUser } from "@/store/slices/authSlice"
import { useGetHostProfileQuery, hostApi } from "@/store/api/hostApi"
import { authApi } from "@/store/api/authApi"
import { NotificationDropdown } from "@/shared/components/NotificationDropdown"

export function Navbar({ minimal = false, onMenuClick }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [renderTimestamp] = React.useState(() => Date.now());

    const socketRef = React.useRef(null);
    const isSocketInitialized = React.useRef(false);

    const { activeCountry, setCountry, isSelected } = useCountry()
    const [isCountryOpen, setIsCountryOpen] = React.useState(false)
    const [isProfileOpen, setIsProfileOpen] = React.useState(false)
    const [isHostDropdownOpen, setIsHostDropdownOpen] = React.useState(false)

    // ================= AUTH STATE (BACKEND VERIFIED) =================
    const { user: userData, error: isAuthError } = useSelector((state) => state.auth)
    const isAuthenticated = !!userData && !isAuthError

    // Automatically fetch current user session on mount to validate session state and avoid stale cache
    React.useEffect(() => {
        dispatch(fetchCurrentUser())
    }, [dispatch])

    // Fetch host profile if authenticated
    const { data: hostProfile } = useGetHostProfileQuery(undefined, {
        skip: !isAuthenticated,
    })
    const resolvedUser = React.useMemo(() => {
        const userDetails = userData?.user || userData || {};

        return {
            ...(hostProfile || {}),
            ...userDetails,
            // Prefer the source that already has a full CloudFront URL
            profile_image: (() => {
                const candidates = [
                    hostProfile?.profile_image,
                    userDetails?.profile_image,
                ];
                // First, try to find one that's already a full URL
                const fullUrl = candidates.find(img => img && img.startsWith('http'));
                if (fullUrl) return fullUrl;
                // Fallback: use resolveImageUrl on whichever is available
                const rawKey = candidates.find(img => img);
                return resolveImageUrl(rawKey);
            })()
        };
    }, [userData, hostProfile]);

    const displayName = React.useMemo(() => {
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

        // Force expire the access_token cookie
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.nextkinlife.live;";

        localStorage.removeItem("user");

        dispatch(authApi.util.resetApiState());
        dispatch(hostApi.util.resetApiState());
        dispatch(authApi.util.resetApiState());
        setIsMobileMenuOpen(false);
        navigate("/signin");
    };

    // ================= WEBSOCKET LOGIC =================
    React.useEffect(() => {
        if (!isAuthenticated) return;

        const socket = getSocket();
        socketRef.current = socket;

        const onConnect = () => {
            // Socket connected successfully
        };

        const onConnectError = (err) => {
            console.error("❌ Socket Connection Error:", err.message);
        };

        socket.on("connect", onConnect);
        socket.on("connect_error", onConnectError);

        isSocketInitialized.current = true;

        return () => {
            if (socketRef.current) {
                socketRef.current.off("connect", onConnect);
                socketRef.current.off("connect_error", onConnectError);
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

    // Close dropdowns on route change but keep the main menu open
    React.useEffect(() => {
        setIsMobileCountryOpen(false)
        setIsHostDropdownOpen(false)
        setIsCountryOpen(false)
        setIsProfileOpen(false)
        // Note: We're NOT closing setIsMobileMenuOpen here
    }, [location.pathname])

    // Click Outside Refs
    const countryRef = useClickOutside(() => setIsCountryOpen(false))
    const profileRef = useClickOutside(() => setIsProfileOpen(false))
    const mobileCountryRef = useClickOutside(() => setIsMobileCountryOpen(false))
    const hostDropdownRef = useClickOutside(() => setIsHostDropdownOpen(false))
    // NOTE: No useClickOutside for mobile menu — backdrop onClick handles it
    const mobileMenuRef = React.useRef(null)

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

    // Navigation items - ensuring consistent paths for desktop and mobile
    const navItems = [
        { name: "Home", path: "/" },
        { name: "Accommodations", path: "/search" },
        { name: "Buy/Sell", path: "/marketplace" },
        { name: "Events", path: "/events" },
        { name: "Travel Partners", path: "/travel" },
        { name: "Careers", path: "/career" },
        { name: "People", path: "/people" },
    ]

    // Safely get country code with fallback
    const getCountryCode = () => {
        if (!activeCountry) return "";
        if (activeCountry.code) return activeCountry.code;
        if (activeCountry.country) return activeCountry.country;
        return "";
    };

    return (
        <>
            {/* ================= DESKTOP NAVBAR ================= */}
            <header className="sticky top-0 z-50 hidden border-b border-gray-200 bg-white/95 backdrop-blur lg:block">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6">
                    {/* Logo */}
                    <Link
                        to="/"
                        aria-label="NextKinLife home"
                        className="flex shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CB2A25] focus-visible:ring-offset-2"
                    >
                        <span className="flex h-12 w-28 items-center justify-center overflow-hidden rounded-lg bg-white">
                            <img src="/logo.jpeg" alt="NextKinLife" className="h-full w-full object-contain" />
                        </span>
                    </Link>
 
                    {/* Primary text navigation */}
                    {!minimal && (
                        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex xl:gap-8">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        aria-current={isActive ? "page" : undefined}
                                        className={cn(
                                            "relative inline-flex items-center h-full text-[15px] transition-all duration-300 ease-out whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CB2A25] focus-visible:ring-offset-2 rounded-md px-2 group",
                                            isActive
                                                ? "text-[#CB2A25] font-semibold"
                                                : "text-gray-600 hover:text-[#CB2A25]"
                                        )}
                                    >
                                        <span className="relative py-1.5">
                                            {item.name}
                                            <span 
                                                className={cn(
                                                    "absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100 bg-[#CB2A25]/50",
                                                    isActive ? "scale-x-100 bg-[#CB2A25]" : ""
                                                )}
                                            />
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>
                    )}

                    {/* Right actions: Become Host · Country · Wishlist · Notifications · Profile */}
                    <div className="flex items-center gap-1 shrink-0">
                        {/* Become Host (primary) */}
                        <div className="relative mr-1" ref={hostDropdownRef}>
                            <button
                                onClick={() => setIsHostDropdownOpen(!isHostDropdownOpen)}
                                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#CB2A25] text-white text-[15px] font-semibold transition-all duration-200 cubic-bezier(0.4, 0, 0.2, 1) hover:bg-[#a9201c] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(203,42,37,0.25)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CB2A25] focus-visible:ring-offset-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span className="hidden xl:inline whitespace-nowrap">Become Host</span>
                                <span className="xl:hidden">Host</span>
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
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Hosting</p>
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
                                                    <span className="p-2 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-[#CB2A25]/10 group-hover:text-[#CB2A25] transition-colors">
                                                        {option.icon}
                                                    </span>
                                                    <span className="flex-1">
                                                        <span className="block font-semibold text-foreground text-sm group-hover:text-[#CB2A25] transition-colors">{option.title}</span>
                                                        <span className="block text-xs text-gray-500">{option.description}</span>
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Country Selector */}
                        <div className="relative" ref={countryRef}>
                            <button
                                aria-label="Select country"
                                className={cn(
                                    "flex items-center gap-1.5 h-10 px-2.5 rounded-lg text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CB2A25]",
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
                                <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", isCountryOpen && "rotate-180")} />
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
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Region</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">Currency is set automatically</p>
                                        </div>
                                        <div className="px-3 py-2 border-b border-gray-100">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search country..."
                                                    value={countrySearchQuery}
                                                    onChange={(e) => setCountrySearchQuery(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#CB2A25] focus:bg-white transition-colors"
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
                                                                ? "bg-[#CB2A25]/8 text-[#CB2A25] font-bold"
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
                                                <div className="px-4 py-6 text-center text-gray-400 text-sm">No countries found</div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Wishlist */}
                        <Link
                            to="/account-v2?tab=wishlist"
                            aria-label="Wishlist"
                            className="p-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CB2A25]"
                        >
                            <Heart className="w-5 h-5" />
                        </Link>

                        {/* Notifications */}
                        {isAuthenticated && (
                            <div className="text-gray-700">
                                <NotificationDropdown />
                            </div>
                        )}

                        {/* Profile / Sign In */}
                        {!isAuthenticated ? (
                            <Button
                                onClick={() => navigate("/signin")}
                                className="ml-1 h-11 rounded-xl bg-white border border-gray-300 text-foreground hover:bg-gray-50 px-5 font-semibold"
                            >
                                Sign In
                            </Button>
                        ) : (
                            <div className="relative ml-1" ref={profileRef}>
                                <button
                                    aria-label="Account menu"
                                    className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CB2A25]"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                >
                                    <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-gray-200">
                                        {resolvedUser?.profile_image ? (
                                            <img src={`${resolvedUser.profile_image}?v=${renderTimestamp}`} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-xs">
                                                {displayName.slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isProfileOpen && "rotate-180")} />
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
                                                <Link to="/account-v2?tab=personal" className="text-xs text-gray-500 hover:text-[#CB2A25] transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                    View Profile
                                                </Link>
                                            </div>
                                            <div className="px-2 space-y-0.5">
                                                {[
                                                    { to: "/account-v2?tab=overview", icon: Home, label: "Overview" },
                                                    { to: "/account-v2?tab=personal", icon: User, label: "Personal Info" },
                                                    { to: "/account-v2?tab=applications", icon: Briefcase, label: "My Applications" },
                                                    { to: "/account-v2?tab=listings", icon: Building, label: "My Listings" },
                                                    { to: "/account-v2?tab=buy-sell", icon: ShoppingBag, label: "My Buy/Sell" },
                                                    { to: "/account-v2?tab=communities", icon: Users, label: "My Communities" },
                                                    { to: "/account-v2?tab=wishlist", icon: Heart, label: "My Wishlist" },
                                                    { to: "/account-v2?tab=trips", icon: Plane, label: "My Trips" },
                                                ].map(({ to, icon: Icon, label }) => (
                                                    <Link
                                                        key={to}
                                                        to={to}
                                                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:text-foreground hover:bg-gray-50/80 rounded-lg hover:translate-x-1 active:scale-[0.98] transition-all duration-200"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <Icon className="h-4 w-4 text-gray-400" />
                                                        {label}
                                                    </Link>
                                                ))}
                                            </div>
                                            <div className="mt-1 pt-1 border-t border-gray-100 px-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-3 py-2.5 text-sm text-[#CB2A25] hover:bg-[#CB2A25]/10 font-semibold rounded-lg flex items-center gap-3 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Logout
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
                {/* Mobile Top Bar */}
                <div className="sticky top-0 z-50 px-4 h-16 flex items-center bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between w-full">
                        {/* Hamburger */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMobileMenuOpen(prev => !prev);
                            }}
                            aria-label="Menu"
                            className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative z-[60]"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 pr-26">
                            <div className="w-16 h-10 rounded-lg overflow-hidden ring-1 ring-gray-200">
                                <img src="/logo.jpeg" alt="NextKinLife Logo" className="object-cover w-full h-full" />
                            </div>
                        </Link>
                        {/* Right: Country + Notifications */}
                        <div className="flex items-center gap-1">
                            <div className="relative" ref={mobileCountryRef}>
                                <button
                                    aria-label="Select country"
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium text-gray-700 transition-colors",
                                        isMobileCountryOpen ? "bg-gray-100" : "hover:bg-gray-100"
                                    )}
                                    onClick={() => setIsMobileCountryOpen(!isMobileCountryOpen)}
                                >
                                    <span className="text-sm">{!isSelected ? "IN" : (activeCountry?.code || "IN")}</span>
                                    <ChevronDown className={cn("h-3 w-3 transition-transform", isMobileCountryOpen && "rotate-180")} />
                                </button>

                                <AnimatePresence>
                                    {isMobileCountryOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 6 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                                        >
                                            <div className="px-4 py-2.5 border-b border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Region</p>
                                            </div>
                                            <div className="px-3 py-2 border-b border-gray-100">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search country..."
                                                        value={countrySearchQuery}
                                                        onChange={(e) => setCountrySearchQuery(e.target.value)}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#CB2A25] focus:bg-white transition-colors"
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto py-2 px-2 scrollbar-hide">
                                                {filteredCountries.length > 0 ? (
                                                    filteredCountries.map((country) => (
                                                        <button
                                                            key={country.code}
                                                            className={cn(
                                                                "w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center justify-between transition-colors",
                                                                getCountryCode() === country.code
                                                                    ? "bg-[#CB2A25]/10 text-[#CB2A25] font-semibold"
                                                                    : "text-gray-700 hover:bg-gray-50"
                                                            )}
                                                            onClick={() => {
                                                                setCountry(country)
                                                                setIsMobileCountryOpen(false)
                                                            }}
                                                        >
                                                            <span className="flex items-center gap-3">
                                                                {(country.flag.startsWith('/') || country.flag.startsWith('http')) ? (
                                                                    <img src={country.flag} alt={country.name} className="w-5 h-3.5 object-cover rounded-sm" />
                                                                ) : (
                                                                    <span className="text-base">{country.flag}</span>
                                                                )}
                                                                <span className="font-medium">{country.name}</span>
                                                            </span>
                                                            {getCountryCode() === country.code && <Check className="w-3.5 h-3.5" />}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-6 text-center text-gray-400 text-sm">No countries found</div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {isAuthenticated && (
                                <div className="text-gray-700">
                                    <NotificationDropdown />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/40 z-40"
                                onClick={() => setIsMobileMenuOpen(false)}
                            />

                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "tween", duration: 0.25 }}
                                className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-40 overflow-y-auto border-r border-gray-200 shadow-xl"
                                ref={mobileMenuRef}
                            >
                                <div className="min-h-full flex flex-col pt-20 pb-8 px-5">
                                    {/* User section */}
                                    <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        {isAuthenticated ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full overflow-hidden ring-1 ring-gray-200">
                                                    {resolvedUser?.profile_image ? (
                                                        <img src={resolvedUser.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold">
                                                            {displayName.slice(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-foreground font-semibold truncate">{displayName}</p>
                                                    <Link to="/account-v2" className="text-xs text-[#CB2A25] hover:underline" onClick={() => setIsMobileMenuOpen(false)}>View Profile</Link>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                <p className="text-foreground font-semibold text-center">Welcome to NextKinLife</p>
                                                <Button onClick={() => { navigate("/signin"); setIsMobileMenuOpen(false); }} className="w-full h-11 bg-[#CB2A25] hover:bg-[#a9201c] text-white font-semibold rounded-xl">
                                                    Sign In / Sign Up
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Navigation */}
                                    <nav className="space-y-1 mb-6">
                                        {navItems.map((item) => {
                                            const isActive = location.pathname === item.path;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    to={item.path}
                                                    className={cn(
                                                        "flex items-center min-h-12 px-4 rounded-xl text-[15px] transition-colors",
                                                        isActive
                                                            ? "bg-[#CB2A25]/10 text-[#CB2A25] font-semibold"
                                                            : "text-gray-700 font-medium hover:bg-gray-50"
                                                    )}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    {item.name}
                                                </Link>
                                            );
                                        })}
                                    </nav>

                                    <div className="h-px bg-gray-100 my-2" />

                                    {/* Become Host */}
                                    <button
                                        onClick={() => {
                                            navigate(getHostPath('property', isAuthenticated))
                                            setIsMobileMenuOpen(false)
                                        }}
                                        className="w-full h-12 rounded-xl bg-[#CB2A25] hover:bg-[#a9201c] text-white font-semibold flex items-center justify-center gap-2 transition-colors my-4"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Become Host
                                    </button>

                                    {/* Hosting options */}
                                    <div className="mb-6">
                                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Hosting</p>
                                        <div className="space-y-1">
                                            {hostOptions.map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => {
                                                        navigate(option.path)
                                                        setIsMobileMenuOpen(false)
                                                    }}
                                                    className="w-full text-left min-h-12 px-4 rounded-xl hover:bg-gray-50 flex items-center gap-3 group transition-colors"
                                                >
                                                    <span className="p-2 rounded-lg bg-gray-100 text-gray-500 group-hover:text-[#CB2A25] transition-colors">
                                                        {React.cloneElement(option.icon, { className: "w-5 h-5" })}
                                                    </span>
                                                    <span className="text-gray-700 font-medium group-hover:text-foreground">{option.title}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Account */}
                                    {isAuthenticated && (
                                        <div className="mb-6">
                                            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Account</p>
                                            <div className="space-y-1">
                                                {[
                                                    { to: "/account-v2?tab=overview", icon: Home, label: "Overview" },
                                                    { to: "/account-v2?tab=personal", icon: User, label: "Personal Info" },
                                                    { to: "/account-v2?tab=listings", icon: Building, label: "My Listings" },
                                                    { to: "/account-v2?tab=buy-sell", icon: ShoppingBag, label: "My Buy/Sell" },
                                                    { to: "/account-v2?tab=communities", icon: Users, label: "My Communities" },
                                                    { to: "/account-v2?tab=applications", icon: Briefcase, label: "My Applications" },
                                                    { to: "/account-v2?tab=wishlist", icon: Heart, label: "My Wishlist" },
                                                    { to: "/account-v2?tab=trips", icon: Plane, label: "My Trips" },
                                                ].map(({ to, icon: Icon, label }) => (
                                                    <Link
                                                        key={to}
                                                        to={to}
                                                        className="flex items-center gap-3 min-h-12 px-4 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-foreground transition-colors"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        <Icon className="w-5 h-5 text-gray-400" />
                                                        <span>{label}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Logout */}
                                    {isAuthenticated && (
                                        <button
                                            onClick={handleLogout}
                                            className="mt-auto w-full min-h-12 text-[#CB2A25] font-semibold hover:bg-[#CB2A25]/10 rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            <LogOut className="w-5 h-5" /> Sign Out
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </>
    )
}
