import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetMeQuery } from '@/hooks/data/useAuthHooks';
import { useGetHostProfileQuery } from '@/hooks/data/useHostHooks';

import LoadingSpinner from '@/components/ui/LoadingSpinner';

export function HostGuard({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Synchronous immediate check from localStorage to prevent white-screen stalls
    const localUser = (() => {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    // 1. Check if User is Logged In
    const { data: user, isLoading: isUserLoading } = useGetMeQuery();
    const activeUser = user || localUser;

    // 2. Check Host Status (Skip only if user check has finished and user is not logged in)
    const {
        data: host,
        isLoading: isHostLoading,
    } = useGetHostProfileQuery(undefined, {
        skip: !isUserLoading && !activeUser
    });

    // Check host approval status from host profile, user object, local state, or role
    const isApprovedHost = Boolean(
        (host && (host.status === 'approved' || host.is_approved === true || host.role === 'host')) ||
        (activeUser && (activeUser.status === 'approved' || activeUser.is_approved === true || activeUser.role === 'host'))
    );

    // If host is already confirmed, never block with a spinner
    const isResolving = !isApprovedHost && (isUserLoading || (Boolean(activeUser) && isHostLoading && host === undefined));

    useEffect(() => {
        if (isResolving) return;

        // If not logged in, redirect to signin
        if (!activeUser && !isUserLoading) {
            navigate('/signin', { replace: true, state: { from: location } });
            return;
        }

        // Only redirect to /hosts if host verification check has completed and user is genuinely not a host
        if (!isApprovedHost && !isHostLoading && !isUserLoading) {
            navigate('/hosts', { replace: true });
        }

    }, [activeUser, host, isResolving, isApprovedHost, isUserLoading, isHostLoading, navigate, location]);

    // Show loading spinner while loading or if redirecting
    if (isResolving || (!isApprovedHost && isHostLoading)) {
        return <LoadingSpinner />;
    }

    return isApprovedHost ? children : null;
}

export default HostGuard;
