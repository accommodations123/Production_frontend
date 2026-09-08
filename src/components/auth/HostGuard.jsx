import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetMeQuery } from '@/hooks/data/useAuthHooks';
import { useGetHostProfileQuery } from '@/hooks/data/useHostHooks';

import LoadingSpinner from '@/components/ui/LoadingSpinner';

export function HostGuard({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Check if User is Logged In
    const { data: user, isLoading: isUserLoading } = useGetMeQuery();

    // 2. Check Host Status (Skip only if user check has finished and user is not logged in)
    const {
        data: host,
        isLoading: isHostLoading,
        isFetching: isHostFetching,
    } = useGetHostProfileQuery(undefined, {
        skip: !isUserLoading && !user
    });

    // Check host approval status from host profile, user object, or role
    const isApprovedHost = Boolean(
        (host && (host.status === 'approved' || host.is_approved === true || host.role === 'host')) ||
        (user && (user.status === 'approved' || user.is_approved === true || user.role === 'host'))
    );

    // If still resolving authentication or host profile, wait before deciding to redirect
    const isResolving = isUserLoading || (Boolean(user) && (isHostLoading || isHostFetching || (host === undefined && !isApprovedHost)));

    useEffect(() => {
        if (isResolving) return;

        // If not logged in, redirect to signin
        if (!user) {
            navigate('/signin', { replace: true, state: { from: location } });
            return;
        }

        // Only redirect to /hosts if host verification check has completed and user is genuinely not a host
        if (!isApprovedHost) {
            navigate('/hosts', { replace: true });
        }

    }, [user, host, isResolving, isApprovedHost, navigate, location]);

    // Show loading spinner while loading or if redirecting
    if (isResolving || !isApprovedHost) {
        return <LoadingSpinner />;
    }

    return children;
}

export default HostGuard;
