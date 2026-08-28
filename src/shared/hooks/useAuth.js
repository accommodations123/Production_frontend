import { useGetMeQuery } from "@/store/api/authApi";

export function useAuth() {
    const { data, isLoading, error } = useGetMeQuery();

    const user = data?.user || data;

    return {
        user,
        loading: isLoading,
        error,
        isAuthenticated: !!user && !error
    };
}
