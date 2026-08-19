import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/utils/utils"
import { useCurrentUser } from "@/shared/hooks/useCurrentUser"
import { HostDropdown } from "./components/HostDropdown"
import { CountryDropdown } from "./components/CountryDropdown"
import { ProfileDropdown } from "./components/ProfileDropdown"
import { NotificationDropdown } from "@/shared/components/NotificationDropdown"
import { MobileMenu } from "./MobileMenu"

const NAV_ITEMS = [
    { name: "Home", path: "/" },
    { name: "Accommodations", path: "/accommodations" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Events", path: "/events" },
    { name: "Travel Partners", path: "/travel" },
    { name: "Careers", path: "/career" },
    { name: "People", path: "/people" },
]

export function Navbar({ minimal = false, onMenuClick }) {
    const location = useLocation()
    const navigate = useNavigate()
    const { isAuthenticated, resolvedUser, displayName, handleLogout, getCountryCode } = useCurrentUser()

    const [renderTimestamp] = useState(() => Date.now())
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const closeMobileMenu = () => setIsMobileMenuOpen(false)

    return (
        <>
            {/* ================= DESKTOP ================= */}
            <header className="sticky top-0 z-50 hidden border-b border-gray-200 bg-white/95 backdrop-blur lg:block">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 lg:gap-2 xl:gap-4 px-4 xl:px-6">
                    {/* Logo */}
                    <Link
                        to="/"
                        aria-label="NextKinLife home"
                        className="flex shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                        <span className="flex h-12 w-28 items-center justify-center overflow-hidden rounded-lg bg-white">
                            <img src="/logo.jpeg" alt="NextKinLife" className="h-full w-full object-contain" />
                        </span>
                    </Link>

                    {/* Nav links */}
                    {!minimal && (
                        <nav aria-label="Primary" className="hidden items-center lg:flex lg:gap-5 xl:gap-6 2xl:gap-8">
                            {NAV_ITEMS.map((item) => {
                                const isActive = location.pathname === item.path
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        aria-current={isActive ? "page" : undefined}
                                        className={cn(
                                            "relative inline-flex items-center h-full lg:text-[14px] xl:text-sm lg:font-semibold xl:font-medium tracking-tight transition-all duration-200 ease-out whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-md lg:px-1.5 xl:px-1 group",
                                            isActive ? "text-accent" : "text-[#222222] hover:text-slate-900"
                                        )}
                                    >
                                        <span className="relative py-1.5">
                                            {item.name}
                                            <span
                                                className={cn(
                                                    "absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-transform duration-200 origin-left scale-x-0 group-hover:scale-x-100 bg-accent/40",
                                                    isActive && "scale-x-100 bg-accent"
                                                )}
                                            />
                                        </span>
                                    </Link>
                                )
                            })}
                        </nav>
                    )}

                    {/* Right actions */}
                    <div className="flex items-center gap-1 shrink-0">
                        <HostDropdown isAuthenticated={isAuthenticated} />
                        <CountryDropdown />
                        {isAuthenticated && (
                            <div className="text-gray-700">
                                <NotificationDropdown />
                            </div>
                        )}
                        {!isAuthenticated ? (
                            <Button
                                onClick={() => navigate("/signin")}
                                className="ml-1 h-9 lg:h-9 xl:h-11 rounded-xl bg-white border border-gray-300 text-foreground hover:bg-gray-50 px-3 lg:px-3 xl:px-5 text-xs lg:text-xs xl:text-sm font-semibold"
                            >
                                Sign In
                            </Button>
                        ) : (
                            <ProfileDropdown
                                resolvedUser={resolvedUser}
                                displayName={displayName}
                                renderTimestamp={renderTimestamp}
                                handleLogout={handleLogout}
                            />
                        )}
                    </div>
                </div>
            </header>

            {/* ================= MOBILE ================= */}
            <div className="lg:hidden">
                <div className="sticky top-0 z-50 px-4 h-16 flex items-center bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between w-full relative">
                        <button
                            onClick={() => setIsMobileMenuOpen((p) => !p)}
                            aria-label="Menu"
                            className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative z-[60]"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                            <div className="w-16 h-10 rounded-lg overflow-hidden ring-1 ring-gray-200">
                                <img src="/logo.jpeg" alt="NextKinLife Logo" className="object-cover w-full h-full" />
                            </div>
                        </Link>

                        <div className="flex items-center gap-1 relative z-[60]">
                            {isAuthenticated && (
                                <div className="text-gray-700">
                                    <NotificationDropdown />
                                </div>
                            )}
                            {!isAuthenticated ? (
                                <Button
                                    onClick={() => navigate("/signin")}
                                    className="h-9 rounded-xl bg-white border border-gray-300 text-foreground hover:bg-gray-50 px-3 text-xs font-semibold animate-none"
                                >
                                    Sign In
                                </Button>
                            ) : (
                                <ProfileDropdown
                                    resolvedUser={resolvedUser}
                                    displayName={displayName}
                                    renderTimestamp={renderTimestamp}
                                    handleLogout={handleLogout}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <MobileMenu
                    isOpen={isMobileMenuOpen}
                    onClose={closeMobileMenu}
                    isAuthenticated={isAuthenticated}
                    resolvedUser={resolvedUser}
                    displayName={displayName}
                    handleLogout={handleLogout}
                    getCountryCode={getCountryCode}
                />
            </div>
        </>
    )
}
