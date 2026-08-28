import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Heart } from 'lucide-react';
import { useCheckWishlistStatusQuery, useToggleWishlistMutation } from '@/store/api/hostApi';
import { useAuth } from '@/shared/hooks/useAuth';

const WishlistButton = ({
    itemId,
    itemType = "property",
    className = "",
    iconSize = 20,
    filledColor = "fill-red-500 text-red-500",
    outlineColor = "text-white"
}) => {
    const { user } = useAuth();
    const currentUserId = user?.id || user?.user_id || user?._id;
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Normalize itemType
    const normalizedType = String(itemType || "property").toLowerCase();
    const normalizedId = String(itemId || "");

    // Check wishlist status from API
    const { data } = useCheckWishlistStatusQuery(
        { type: normalizedType, id: normalizedId },
        { skip: !currentUserId || !normalizedId }
    );

    const [toggleWishlist, { isLoading: isToggling }] = useToggleWishlistMutation();

    useEffect(() => {
        if (data && typeof data.isWishlisted !== 'undefined') {
            setIsWishlisted(Boolean(data.isWishlisted));
        } else if (data?.data && typeof data.data.isWishlisted !== 'undefined') {
            setIsWishlisted(Boolean(data.data.isWishlisted));
        }
    }, [data]);

    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUserId) {
            toast.error("Please sign in to save items to your wishlist");
            return;
        }

        // Optimistic toggle
        const previousState = isWishlisted;
        const nextState = !previousState;
        setIsWishlisted(nextState);

        try {
            const result = await toggleWishlist({
                id: normalizedId,
                type: normalizedType
            }).unwrap();

            const serverStatus = result?.isWishlisted ?? result?.data?.isWishlisted ?? result?.isSaved ?? nextState;
            setIsWishlisted(Boolean(serverStatus));
            if (serverStatus) {
                toast.success("Added to wishlist");
            } else {
                toast.success("Removed from wishlist");
            }
        } catch (error) {
            // Revert on error
            setIsWishlisted(previousState);
            console.error("Failed to toggle wishlist:", error);
            toast.error(error?.data?.message || error?.error || "Failed to update wishlist");
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`transition-all duration-200 active:scale-90 hover:scale-110 p-2 rounded-full cursor-pointer select-none ${className}`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            type="button"
        >
            <Heart
                size={iconSize}
                className={`${isWishlisted ? filledColor : outlineColor} drop-shadow-md transition-colors duration-300`}
            />
        </button>
    );
};

export default WishlistButton;
