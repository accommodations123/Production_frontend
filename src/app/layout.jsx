import "./globals.css";
import { MobileFooterNav } from "@/components/layout/MobileFooterNav";
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <div className="antialiased font-sans min-h-screen bg-background text-foreground pb-20 lg:pb-0">
      {/* Navbar handles both desktop and mobile headers internally */}
      {children}
      <MobileFooterNav />
      <Toaster position="top-center" richColors />
    </div>
  )
}
