import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Heart } from 'lucide-react';
import { useCheckWishlistStatusQuery, useToggleWishlistMutation } from '@/store/api/hostApi';
import { useGetMeQuery } from '@/store/api/authApi';

const WishlistButton = ({
    itemId,
    itemType,
    className = "",
    iconSize = 20,
    filledColor = "fill-[#CB2A25] text-[#CB2A25]",
    outlineColor = "text-white"
}) => {
    const { data: userData } = useGetMeQuery();
    const user = userData?.user || userData;
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Skip query if no user or no ID
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

        // Optimistic update
        const previousState = isWishlisted;
        setIsWishlisted(!previousState);

        try {
            const result = await toggleWishlist({
                id: itemId,
                type: itemType,
                itemId: itemId,
                itemType: itemType
            }).unwrap();

            // Server truth
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

    return (
        <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`transition-all duration-200 active:scale-90 hover:scale-110 p-2 rounded-full ${className}`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                size={iconSize}
                className={`${isWishlisted ? (filledColor || "fill-[#CB2A25] text-[#CB2A25]") : (outlineColor || "text-white")} drop-shadow-md transition-colors duration-300`}
            />
        </button>
    );
};

export default WishlistButton;

