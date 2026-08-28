/**
 * Resolves an image path to a full URL.
 * 
 * Media files are stored in Supabase Storage. This helper ensures
 * we always get a valid, absolute URL for image sources.
 * 
 * @param {string|null} imagePath - The image path or URL from the API / Supabase
 * @param {string} [fallback] - Optional fallback image URL
 * @returns {string|null} The resolved full URL
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dmhxnuxlodsshdkunngb.supabase.co';
export const MEDIA_STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public`;
export const CLOUDFRONT_BASE = MEDIA_STORAGE_BASE; // Kept for backward compatibility

export function resolveImageUrl(imagePath, fallback = null) {
    if (!imagePath) return fallback;

    const trimmed = String(imagePath).trim();
    if (
        trimmed === '' ||
        trimmed === 'null' ||
        trimmed === 'undefined' ||
        trimmed.endsWith('/null') ||
        trimmed.endsWith('/undefined')
    ) {
        return fallback;
    }

    // Already a full URL (Supabase Storage, Google, Unsplash, etc.) — use as-is
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        // Rewrite legacy S3 URLs if encountered
        if (trimmed.includes('.amazonaws.com/')) {
            const s3Key = trimmed.replace(/^https?:\/\/[^/]+\//, '');
            return `${MEDIA_STORAGE_BASE}/${s3Key.replace(/^\/+/, '')}`;
        }
        return trimmed;
    }

    // Data URI or Blob URI — use as-is
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
        return trimmed;
    }

    // Relative Supabase storage path (e.g. "properties/photo.jpg" or "/avatars/user.png")
    const cleanPath = trimmed.replace(/^\/+/, '');
    return `${MEDIA_STORAGE_BASE}/${cleanPath}`;
}


/**
 * Compresses an image file (JPEG/PNG) on the client side using Canvas.
 * 
 * @param {File} file - The raw File object from input
 * @param {object} options - Optional compression configurations
 * @param {number} options.maxWidth - Maximum width of output image (default: 1200)
 * @param {number} options.maxHeight - Maximum height of output image (default: 1200)
 * @param {number} options.quality - Compression quality between 0.1 and 1.0 (default: 0.7)
 * @returns {Promise<File>} Compressed File object
 */
export function compressImage(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.7 } = {}) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type || !file.type.startsWith("image/")) {
            return resolve(file); // Non-images bypass compression
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions matching max constraints while keeping aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Force filename to have a .jpg extension and convert to image/jpeg
                const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "image";
                const compressedName = `${baseName}.jpg`;

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            return resolve(file); // Fallback to original file on failure
                        }
                        const compressedFile = new File([blob], compressedName, {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    "image/jpeg",
                    quality
                );
            };
            img.onerror = (err) => resolve(file); // Fallback on error
        };
        reader.onerror = (err) => resolve(file); // Fallback on error
    });
}

