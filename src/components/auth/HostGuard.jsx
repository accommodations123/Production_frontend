import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetMeQuery } from '@/store/api/authApi';
import { useGetHostProfileQuery } from '@/store/api/hostApi';

import LoadingSpinner from '@/components/ui/LoadingSpinner';

const HostGuard = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Check if User is Logged In
    const { data: user, isLoading: isUserLoading } = useGetMeQuery();

    // 2. Check Host Status (Skip if not logged in)
    const {
        data: host,
        isLoading: isHostLoading
    } = useGetHostProfileQuery(undefined, {
        skip: !user
    });

    useEffect(() => {
        if (isUserLoading || isHostLoading) return;

        // If not logged in, redirect to signin
        if (!user) {
            // Optional: You might want to save the current location to redirect back after login
            navigate('/signin', { replace: true, state: { from: location } });
            return;
        }

        // If User is Logged In...
        const hasHostProfile = host && (host.id || host._id); // Check for valid ID

        if (!hasHostProfile) {
            navigate('/hosts', { replace: true });
        }

    }, [user, host, isUserLoading, isHostLoading, navigate, location]);

    // Show loading spinner while loading or if redirecting
    if (isUserLoading || isHostLoading || (!user) || (user && !(host && (host.id || host._id)))) {
        return <LoadingSpinner />;
    }

    return children;
};

export default HostGuard;
