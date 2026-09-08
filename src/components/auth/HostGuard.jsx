import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetMeQuery } from '@/hooks/data/useAuthHooks';
import { useGetHostProfileQuery } from '@/hooks/data/useHostHooks';

import LoadingSpinner from '@/components/ui/LoadingSpinner';

export function HostGuard({ children, allowPending = false }) {
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

    // Check if user has submitted host details (pending admin review or already approved)
    const hasSubmittedHost = Boolean(
        isApprovedHost ||
        (host && (host.status === 'pending' || host.country || host.city || host.phone || host.address || host.street_address)) ||
        (activeUser && (activeUser.status === 'pending' || activeUser.role === 'host'))
    );

    // Accommodations posting allows users who submitted host details; other services require approved host
    const hasAccess = allowPending ? (hasSubmittedHost || isApprovedHost) : isApprovedHost;

    // If access is confirmed, never block with a spinner
    const isResolving = !hasAccess && (isUserLoading || (Boolean(activeUser) && isHostLoading && host === undefined));

    useEffect(() => {
        if (isResolving) return;

        // If not logged in, redirect to signin
        if (!activeUser && !isUserLoading) {
            navigate('/signin', { replace: true, state: { from: location } });
            return;
        }

        // If user does not have required access once checks complete, redirect to host onboarding form
        if (!hasAccess && !isHostLoading && !isUserLoading) {
            navigate('/hosts', { replace: true });
        }

    }, [activeUser, host, isResolving, hasAccess, isUserLoading, isHostLoading, navigate, location]);

    // Show loading spinner while resolving permissions
    if (isResolving || (!hasAccess && isHostLoading)) {
        return <LoadingSpinner />;
    }

    return hasAccess ? children : null;
}

export default HostGuard;
