import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useGetMeQuery } from '@/store/api/authApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export function AuthGuard({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const { data: user, isLoading: isUserLoading } = useGetMeQuery();

    useEffect(() => {
        if (isUserLoading) return;

        if (!user) {
            navigate('/signin', { replace: true, state: { from: location } });
        }
    }, [user, isUserLoading, navigate, location]);

    if (isUserLoading || !user) {
        return <LoadingSpinner />;
    }

    return children;
}

export default AuthGuard;
