import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "sonner";
import "./globals.css";
import { MobileFooterNav } from "@/components/layout/MobileFooterNav";

export default function RootLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get("error") || params.get("auth_error");

    if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
      params.delete("error");
      params.delete("auth_error");
      const newSearch = params.toString();
      navigate({ search: newSearch ? `?${newSearch}` : "" }, { replace: true });
    }
  }, [location.search, navigate]);

  return (
    <div className="antialiased font-sans min-h-screen bg-background text-foreground pb-[60px] lg:pb-0">
      {/* Navbar handles both desktop and mobile headers internally */}
      {children}
      <MobileFooterNav />
      <Toaster position="top-center" richColors />
    </div>
  );
}


