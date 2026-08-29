import { useSelector } from "react-redux";
import { useGetMeQuery } from "@/store/api/authApi";

export function useAuth() {
    const reduxUser = useSelector((state) => state.auth?.user);
    const { data: meData, isLoading, error } = useGetMeQuery();

    const rawUser = meData?.user !== undefined ? meData.user : (meData || reduxUser?.user || reduxUser);
    const isValidUser = Boolean(rawUser && (rawUser.id || rawUser.email));
    const user = isValidUser ? rawUser : null;

    return {
        user,
        loading: isLoading,
        error,
        isAuthenticated: isValidUser && !error
    };
}
