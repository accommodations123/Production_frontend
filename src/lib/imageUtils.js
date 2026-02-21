/**
 * Resolves an image path to a full URL.
 * 
 * The backend sometimes returns just an S3 key (e.g. "properties/abc.jpeg")
 * instead of the full CloudFront URL. This helper ensures we always get a
 * valid, absolute URL for image sources.
 * 
 * @param {string|null} imagePath - The image path or URL from the API
 * @param {string} [fallback] - Optional fallback image URL
 * @returns {string|null} The resolved full URL
 */
export function resolveImageUrl(imagePath, fallback = null) {
    if (!imagePath) return fallback;

    // Already a full URL — use as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
        return imagePath;
    }

    // S3 key (e.g. "properties/177167584211-BhargavReddy.jpeg")
    // Prepend the API base so the Vite proxy or production reverse-proxy
    // forwards it to the backend which serves CloudFront URLs
    const CLOUDFRONT_BASE = import.meta.env.VITE_CLOUDFRONT_URL || 'https://d3dqp3l6ug81j3.cloudfront.net';
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    return `${CLOUDFRONT_BASE}${cleanPath}`;
}
