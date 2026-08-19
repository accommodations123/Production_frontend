import React, { useState, useCallback, useMemo } from "react"

export const HostPhoto = React.memo(({ host }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Get host photo with fallbacks
    const hostPhoto = useMemo(() => {
        if (!host) return null;

        const photoFields = [
            'selfie_photo',
            'selfiePhoto',
            'profile_photo',
            'profilePhoto',
            'avatar',
            'photo',
            'image',
            'profileImage'
        ];

        for (const field of photoFields) {
            if (host[field]) {
                return host[field];
            }
        }

        return null;
    }, [host]);

    // Handle image loading error
    const handleImageError = useCallback(() => {
        setImageError(true);
        setImageLoaded(false);
    }, []);

    // Handle successful image load
    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
        setImageError(false);
    }, []);

    // Get initial letter for fallback
    const initialLetter = useMemo(() => {
        return host?.full_name?.charAt(0)?.toUpperCase() || 'H';
    }, [host?.full_name]);

    // Check if URL is valid
    const isValidUrl = useMemo(() => {
        if (!hostPhoto) return false;
        return hostPhoto.startsWith('https://') || hostPhoto.startsWith('http://');
    }, [hostPhoto]);

    return (
        <div className="w-8 h-8 rounded-full overflow-hidden">
            {hostPhoto && isValidUrl && !imageError ? (
                <>
                    {!imageLoaded && (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    <img
                        src={hostPhoto}
                        alt={host?.full_name || "Host"}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
                            }`}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        loading="lazy"
                    />
                </>
            ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600">{initialLetter}</span>
                </div>
            )}
        </div>
    );
});
HostPhoto.displayName = "HostPhoto"
