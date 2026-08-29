import { useGetMeQuery } from "@/store/api/authApi";
import { useSelector } from "react-redux";

export const useAuth = () => {
    const { data: meData, isLoading, error } = useGetMeQuery();
    const reduxUser = useSelector((state) => state.auth?.user);

    const rawUser = meData?.user !== undefined ? meData.user : (meData?.data || meData || reduxUser?.user || reduxUser);
    const isValidUser = Boolean(rawUser && (rawUser.id || rawUser.email));
    const user = isValidUser ? rawUser : null;

    return {
        user,
        loading: isLoading,
        error,
        isAuthenticated: isValidUser && !error
    };
};
