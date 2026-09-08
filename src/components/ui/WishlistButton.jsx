import React, { useState, useEffect, useMemo } from 'react';
import { toast } from "sonner";
import { Heart } from 'lucide-react';
import { useCheckWishlistStatusQuery, useToggleWishlistMutation } from '@/hooks/data/useWishlistHooks';
import { useAuth } from '@/hooks/useAuth';

function isItemWishlistedInCache(id, itemType) {
    if (typeof window === 'undefined' || !id) return false;
    const idStr = String(id);
    const normType = (itemType || '').toLowerCase().replace(/[-_\s]/g, '');
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('user_wishlist_')) {
                const raw = localStorage.getItem(k);
                if (raw && raw.includes(idStr)) {
                    try {
                        const list = JSON.parse(raw);
                        if (Array.isArray(list) && list.some(item => {
                            const matchId = String(item.id || item.item_id) === idStr;
                            if (!matchId) return false;
                            if (!normType || !item.type) return true;
                            const itNorm = (item.type || '').toLowerCase().replace(/[-_\s]/g, '');
                            return itNorm === normType || (normType.includes('buy') && itNorm.includes('buy'));
                        })) {
                            return true;
                        }
                    } catch {}
                }
            }
        }
        const rawUser = localStorage.getItem('user');
        if (rawUser && rawUser.includes(idStr)) {
            try {
                const parsed = JSON.parse(rawUser);
                const street = parsed?.street_address || parsed?.user?.street_address;
                const meta = typeof street === 'string' ? JSON.parse(street) : street;
                if (Array.isArray(meta?.wishlist) && meta.wishlist.some(item => {
                    const matchId = String(item.id || item.item_id) === idStr;
                    if (!matchId) return false;
                    if (!normType || !item.type) return true;
                    const itNorm = (item.type || '').toLowerCase().replace(/[-_\s]/g, '');
                    return itNorm === normType || (normType.includes('buy') && itNorm.includes('buy'));
                })) {
                    return true;
                }
            } catch {}
        }
    } catch {}
    return false;
}

export function WishlistButton({
    itemId,
    itemType,
    className = "",
    iconSize = 20,
    filledColor = "fill-[#CB2A25] text-[#CB2A25]",
    outlineColor = "text-white"
}) {
    const { user: authUser } = useAuth();
    
    // Defensive fallback user from localStorage to avoid unnecessary query skipping
    const user = useMemo(() => {
        if (authUser) return authUser;
        if (typeof window === 'undefined') return null;
        try {
            const raw = localStorage.getItem('user');
            if (raw) {
                const parsed = JSON.parse(raw);
                return parsed?.user || parsed;
            }
        } catch {}
        return null;
    }, [authUser]);

    // Synchronously check local cache on mount so the red color is immediately present on page refresh
    const [isWishlisted, setIsWishlisted] = useState(() => isItemWishlistedInCache(itemId, itemType));

    // Check wishlist status from server
    const { data } = useCheckWishlistStatusQuery(
        { type: itemType, id: itemId },
        { skip: !user || !itemId || !itemType }
    );

    const [toggleWishlist, { isLoading: isToggling }] = useToggleWishlistMutation();

    useEffect(() => {
        if (data) {
            const status = data.isWishlisted ?? data.is_wishlisted ?? data.data?.isWishlisted ?? data.data?.is_wishlisted ?? data.isSaved ?? data.saved;
            if (typeof status !== 'undefined') {
                setIsWishlisted(Boolean(status));
            }
        }
    }, [data]);

    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error("Please login to add to wishlist");
            return;
        }

        const previousState = isWishlisted;
        const nextState = !previousState;
        setIsWishlisted(nextState);

        try {
            const result = await toggleWishlist({
                id: itemId,
                type: itemType,
                itemId: itemId,
                itemType: itemType
            }).unwrap();

            // Confirm server status
            const status = result?.isWishlisted ?? result?.is_wishlisted ?? result?.data?.isWishlisted ?? result?.data?.is_wishlisted ?? result?.isSaved ?? result?.saved;
            if (typeof status !== 'undefined') {
                const isSaved = Boolean(status);
                setIsWishlisted(isSaved);
                if (isSaved) {
                    toast.success("Added to wishlist");
                } else {
                    toast.success("Removed from wishlist");
                }
            }
        } catch (error) {
            // Revert on error
            setIsWishlisted(previousState);
            console.error("Failed to toggle wishlist:", error);
            toast.error("Failed to update wishlist");
        }
    };

    const resolvedFilledColor = (filledColor && !filledColor.includes("accent")) ? filledColor : "fill-[#CB2A25] text-[#CB2A25]";

    return (
        <button
            type="button"
            onClick={handleToggle}
            disabled={isToggling}
            className={`transition-all duration-200 active:scale-90 hover:scale-110 p-2 rounded-full cursor-pointer ${className}`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                size={iconSize}
                className={`${isWishlisted ? resolvedFilledColor : (outlineColor || "text-white")} drop-shadow-md transition-colors duration-300`}
            />
        </button>
    );
}

export default WishlistButton;
