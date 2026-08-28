import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { supabase } from '@/lib/supabase';
import { updateUserLocal, fetchCurrentUser } from '@/store/slices/authSlice';
import { resolveImageUrl } from '@/lib/imageUtils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

export default function AuthCallback() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        let isMounted = true;

        async function handleAuth() {
            try {
                // Get session from Supabase
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;

                const session = data?.session;
                const rawUser = session?.user;

                if (session && rawUser) {
                    const token = session.access_token;
                    if (token) {
                        localStorage.setItem('token', token);
                    }

                    const user = {
                        id: rawUser.id,
                        email: rawUser.email,
                        name: rawUser.user_metadata?.full_name || rawUser.user_metadata?.name || rawUser.email?.split('@')[0],
                        first_name: rawUser.user_metadata?.first_name || rawUser.user_metadata?.full_name?.split(' ')[0] || '',
                        last_name: rawUser.user_metadata?.last_name || rawUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                        profile_image: resolveImageUrl(rawUser.user_metadata?.avatar_url || rawUser.user_metadata?.picture || null),
                        ...rawUser.user_metadata,
                    };

                    localStorage.setItem('user', JSON.stringify(user));
                    dispatch(updateUserLocal(user));
                    dispatch(fetchCurrentUser());

                    toast.success('Successfully signed in with Google');
                    if (isMounted) navigate('/', { replace: true });
                } else {
                    // Fallback to signin if no session found
                    if (isMounted) navigate('/signin', { replace: true });
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                toast.error(err.message || 'Authentication failed');
                if (isMounted) navigate('/signin', { replace: true });
            }
        }

        handleAuth();

        return () => {
            isMounted = false;
        };
    }, [dispatch, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <LoadingSpinner />
        </div>
    );
}
