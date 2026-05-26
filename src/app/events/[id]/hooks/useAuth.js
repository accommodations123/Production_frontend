import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "@/store/slices/authSlice";

export const useAuth = () => {
    const dispatch = useDispatch();

    const {
        user,
        loading,
        error
    } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!user && !loading && !error) {
            dispatch(fetchCurrentUser());
        }
    }, [dispatch, user, loading, error]);

    return {
        user,
        loading,
        error,
        isAuthenticated: !!user && !error
    };
};
