import "./globals.css";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { useLocation, Outlet } from "react-router-dom";
import { Navbar } from "@/shared/layout/Navbar";
import Footer from "@/shared/layout/Footer";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";

export default function RootLayout() {
  const { pathname } = useLocation();

  // Simple path checks for layout elements
  const isAuth = pathname === "/signin" || pathname === "/signup";
  const showNavbar = !isAuth;
  const showFooter = !isAuth && pathname !== "/search" && pathname !== "/account-v2";

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased [--app-navbar-height:4rem] lg:[--app-navbar-height:5rem]">
      {showNavbar && <Navbar />}
      <main className="min-w-0 flex-1 overflow-x-clip">
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      {showFooter && (
        <div className="pb-[env(safe-area-inset-bottom)]">
          <Footer />
        </div>
      )}
      <Toaster position="top-center" richColors />
    </div>
  );
}
