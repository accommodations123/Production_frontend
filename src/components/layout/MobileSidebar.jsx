import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Calendar,
  Building,
  Users,
  Search,
  Globe,
  Plane,
  ChevronRight,
  Home,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";

import {
  useGetMeQuery,
  useLogoutMutation,
  authApi,
} from "@/store/api/authApi";
import { useGetHostProfileQuery, hostApi } from "@/store/api/hostApi";

import { cn } from "@/lib/utils";
import { useCountry } from "@/context/CountryContext";
import { COUNTRIES } from "@/lib/mock-data";
import { useClickOutside } from "@/hooks/useClickOutside";
import { resolveImageUrl } from "@/lib/imageUtils";

export function MobileSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get user data with refetch capability
  const { data: userData, isLoading: isAuthLoading, isError: isAuthError, refetch } = useGetMeQuery();
  const [logout] = useLogoutMutation();

  // Get host profile if authenticated
  const isAuthenticated = !!userData && !isAuthError;
  const { data: hostProfile } = useGetHostProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const { activeCountry, setCountry } = useCountry();
  const [isCountryOpen, setIsCountryOpen] = React.useState(false);
  const countryRef = useClickOutside(() => setIsCountryOpen(false));

  // Refetch user data when opening sidebar on accommodations page
  React.useEffect(() => {
    if (isOpen && location.pathname === '/search' && !userData && !isAuthLoading) {
      refetch();
    }
  }, [isOpen, location.pathname, userData, isAuthLoading, refetch]);

  // Resolve user data the same way as Navbar
  const resolvedUser = React.useMemo(() => {
    const userDetails = userData?.user || userData || {};
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
  }, [userData, hostProfile]);

  // Get display name the same way as Navbar
  const displayName = React.useMemo(() => {
    const name = resolvedUser?.name;
    const fullName = resolvedUser?.full_name;
    const emailName = resolvedUser?.email?.split("@")[0];

    if (name && name.trim() !== "") return name;
    if (fullName && fullName.trim() !== "") return fullName;
    if (emailName) return emailName;

    return "User";
  }, [resolvedUser]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    dispatch(authApi.util.resetApiState());
    dispatch(hostApi.util.resetApiState());
    onClose();
    navigate("/signin");
  };

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Accommodations", path: "/search", icon: Search },
    { name: "Buy/Sell", path: "/marketplace", icon: ShoppingBag },
    { name: "Community", path: "/groups", icon: Users },
    { name: "Events", path: "/events", icon: Calendar },
    { name: "Travel Partners", path: "/travel", icon: Plane },
  ];

  const getCountryCode = () =>
    activeCountry?.code || activeCountry?.country || "";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* SIDEBAR */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#0F2238] z-50 border-r border-white/10 shadow-2xl overflow-y-auto"
          >
            <div className="min-h-full flex flex-col pt-20 pb-8 px-6">

              {/* USER CARD */}
              <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/5">
                {isAuthLoading ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-white/10 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-white/10 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                ) : isAuthenticated ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/10">
                      {resolvedUser?.profile_image ? (
                        <img src={resolvedUser.profile_image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent to-[#E04642] flex items-center justify-center text-white font-bold">
                          {displayName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate">
                        {displayName}
                      </p>
                      <Link
                        to="/account-v2"
                        onClick={onClose}
                        className="text-xs text-accent hover:underline"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-white font-bold text-center mb-1">Welcome to NextKin</p>
                    <button
                      onClick={() => {
                        navigate("/signin");
                        onClose();
                      }}
                      className="w-full bg-accent hover:bg-accent/90 text-white font-bold rounded-xl py-2"
                    >
                      Sign In / Sign Up
                    </button>
                  </div>
                )}
              </div>

              {/* COUNTRY SELECT */}
              <div className="mb-6 relative" ref={countryRef}>
                <button
                  onClick={() => setIsCountryOpen(!isCountryOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5" />
                    <span>{activeCountry?.name || "India"}</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isCountryOpen && "rotate-90"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {isCountryOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 right-0 mt-2 w-full bg-[#0F2238]/95 backdrop-blur-xl rounded-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] z-50 border border-white/10 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-white/5 bg-white/5">
                        <p className="text-[10px] font-black text-accent uppercase tracking-widest">Select Region</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto py-2 px-2 scrollbar-hide">
                        {COUNTRIES.map((country) => (
                          <button
                            key={country.code}
                            onClick={() => {
                              setCountry(country);
                              setIsCountryOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-all",
                              getCountryCode() === country.code
                                ? "bg-accent text-white"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <span className="flex items-center gap-3">
                              {(country.flag.startsWith('/') || country.flag.startsWith('http')) ? (
                                <img src={country.flag} alt={country.name} className="w-5 h-3 object-cover rounded" />
                              ) : (
                                <span className="text-base">{country.flag}</span>
                              )}
                              <span className="font-medium">{country.name}</span>
                            </span>
                            {getCountryCode() === country.code && <div className="w-2 h-2 rounded-full bg-white" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* NAVIGATION */}
              <nav className="space-y-2 mb-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-4 py-3.5 rounded-xl transition-all",
                      location.pathname === item.path
                        ? "bg-accent text-white font-bold shadow-lg shadow-accent/20"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </div>
                    {location.pathname === item.path && <div className="w-2 h-2 rounded-full bg-white" />}
                  </Link>
                ))}
              </nav>

              <div className="h-px bg-white/10 my-4" />

              {/* LOGOUT */}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="mt-auto w-full py-4 text-[#FF6B6B] font-bold hover:bg-[#FF6B6B]/10 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}