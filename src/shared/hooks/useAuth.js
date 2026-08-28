import { useGetMeQuery } from "@/store/api/authApi";
import { useSelector } from "react-redux";

export function useAuth() {
    const { data, isLoading, error } = useGetMeQuery();
    const reduxUser = useSelector((state) => state.auth?.user);

    let localUser = null;
    try {
        const stored = localStorage.getItem("user");
        if (stored) localUser = JSON.parse(stored);
    } catch {
        // ignore
    }

    const raw = data?.user || data?.data?.user || data?.data || data || reduxUser || localUser;
    const user = raw?.user || raw;

    return {
        user,
        loading: isLoading,
        error,
        isAuthenticated: !!user && !error
    };
}
