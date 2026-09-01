import { useSelector } from "react-redux";
import { useGetMeQuery } from "@/store/api/authApi";

export function useAuth() {
    const reduxUser = useSelector((state) => state.auth?.user);
    const { data: meData, isLoading, error } = useGetMeQuery();

    const storedUser = (() => {
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    const rawUser = meData?.user !== undefined ? meData.user : (meData || reduxUser?.user || reduxUser || storedUser);
    const isValidUser = Boolean(rawUser && (rawUser.id || rawUser._id || rawUser.email));
    const user = isValidUser ? rawUser : null;
    const hasToken = Boolean(localStorage.getItem("token") || localStorage.getItem("sb-access-token") || localStorage.getItem("user"));

    return {
        user,
        loading: isLoading,
        error,
        isAuthenticated: (isValidUser && !error) || hasToken
    };
}
