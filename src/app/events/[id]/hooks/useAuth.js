import { useGetMeQuery } from "@/store/api/authApi";
import { useSelector } from "react-redux";

export const useAuth = () => {
    const { data: meData, isLoading, error } = useGetMeQuery();
    const reduxUser = useSelector((state) => state.auth?.user);

    const user = meData?.user || meData?.data || meData || reduxUser;

    return {
        user,
        loading: isLoading,
        error,
        isAuthenticated: !!user && !error
    };
};
