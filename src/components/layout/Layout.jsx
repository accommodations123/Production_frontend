import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import useScrollToTop from "@/hooks/useScrollToTop";

/**
 * Reusable Layout wrapper component that adds global Navbar, Footer,
 * and handles automatic scrolling to the top on route/pathname change.
 */
const Layout = ({ children }) => {
  useScrollToTop();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="bg-gray-50 pt-16 md:pt-20 flex-grow">
        <div className="w-full">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
