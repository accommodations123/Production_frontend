import { useGetMeQuery } from "@/store/api/authApi";
import { useGetHostProfileQuery } from "@/store/api/hostApi";
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
    const baseUser = raw?.user || raw;
    const hasAuth = Boolean(baseUser?.id || baseUser?.email || localStorage.getItem("token") || localStorage.getItem("sb-token") || localStorage.getItem("supabase.auth.token"));

    const { data: hostProfile } = useGetHostProfileQuery(undefined, {
        skip: !hasAuth
    });

    const user = baseUser ? {
        ...baseUser,
        phone: baseUser.phone || hostProfile?.phone || hostProfile?.whatsapp || "",
        whatsapp: baseUser.whatsapp || hostProfile?.whatsapp || hostProfile?.phone || baseUser.phone || "",
        instagram: baseUser.instagram || hostProfile?.instagram || "",
        facebook: baseUser.facebook || hostProfile?.facebook || "",
        twitter: baseUser.twitter || baseUser.x || hostProfile?.twitter || "",
        host_id: baseUser.host_id || hostProfile?.id || hostProfile?.host_id || baseUser.Host?.id,
        Host: {
            ...(baseUser.Host || {}),
            ...(hostProfile || {})
        }
    } : null;

    return {
        user,
        hostProfile,
        loading: isLoading,
        error,
        isAuthenticated: !!user && !error
    };
}
