/**
 * Resolves an image path to a full URL.
 * 
 * The backend sometimes returns just an S3 key (e.g. "properties/abc.jpeg")
 * or a raw S3 URL instead of the full CloudFront URL. This helper ensures
 * we always get a valid, absolute URL for image sources.
 * 
 * @param {string|null} imagePath - The image path or URL from the API
 * @param {string} [fallback] - Optional fallback image URL
 * @returns {string|null} The resolved full URL
 */
export function resolveImageUrl(imagePath, fallback = null) {
    if (!imagePath) return fallback;

    const CLOUDFRONT_BASE = import.meta.env.VITE_CLOUDFRONT_URL || 'https://d3dqp3l6ug81j3.cloudfront.net';

    // Already a CloudFront URL — use as-is
    if (imagePath.startsWith(CLOUDFRONT_BASE)) return imagePath;

    // Data URI — use as-is
    if (imagePath.startsWith('data:')) return imagePath;

    // S3 URL — rewrite to CloudFront
    if (imagePath.includes('.amazonaws.com/')) {
        const s3Key = imagePath.replace(/^https?:\/\/[^/]+\//, '');
        return `${CLOUDFRONT_BASE}/${s3Key}`;
    }

    // Other external URL (non-S3) — use as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // S3 key (e.g. "properties/177167584211-BhargavReddy.jpeg")
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${CLOUDFRONT_BASE}${cleanPath}`;
}
