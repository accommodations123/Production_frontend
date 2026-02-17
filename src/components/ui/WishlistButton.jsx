import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Heart } from 'lucide-react';
import { useCheckWishlistStatusQuery, useToggleWishlistMutation } from '../../store/api/hostApi';
import { useGetMeQuery } from '../../store/api/authApi';

const WishlistButton = ({
    itemId,
    itemType,
    className = "",
    iconSize = 20,
    filledColor = "fill-red-500 text-red-500",
    outlineColor = "text-white"
}) => {
    const { data: userData } = useGetMeQuery();
    const user = userData?.user || userData;
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Debug logging
    // console.log("WishlistButton Render:", { itemId, itemType, user: !!user, isWishlisted });

    // Skip query if no user or no ID
    const { data, isLoading, error } = useCheckWishlistStatusQuery(
        { type: itemType, id: itemId },
        { skip: !user || !itemId || !itemType }
    );

    const [toggleWishlist, { isLoading: isToggling }] = useToggleWishlistMutation();

    useEffect(() => {
        if (data && typeof data.isWishlisted !== 'undefined') {
            setIsWishlisted(data.isWishlisted);
        }
    }, [data]);

    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("WishlistButton Clicked:", { itemId, itemType, user: !!user });

        if (!user) {
            console.warn("User not logged in, cannot toggle wishlist");
            toast.error("Please login to add to wishlist");
            return;
        }

        // Optimistic update
        const previousState = isWishlisted;
        setIsWishlisted(!previousState);

        try {
            const result = await toggleWishlist({
                id: itemId,
                type: itemType
            }).unwrap();

            // Server truth
            if (result && typeof result.isWishlisted !== 'undefined') {
                setIsWishlisted(result.isWishlisted);
                if (result.isWishlisted) {
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

    if (isLoading && !isWishlisted) {
        // Optional: Show loading spinner or nothing
        // For now, showing empty heart is fine to prevent layout shift
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`transition-all duration-200 active:scale-90 hover:scale-110 p-2 rounded-full ${className}`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                size={iconSize}
                className={`${isWishlisted ? filledColor : outlineColor} drop-shadow-md transition-colors duration-300`}
            />
        </button>
    );
};

export default WishlistButton;
