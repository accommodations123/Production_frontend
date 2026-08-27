import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook to scroll the window to the top on route/pathname change.
 */
export default function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}
