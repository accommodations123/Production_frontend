import { uploadToSupabaseStorage } from '@/lib/storageUtils';

// ── Wishlist Local Fallback Helpers ────────────────────────────────
export function getLocalWishlist(userId) {
    try {
        const raw = localStorage.getItem(`user_wishlist_${userId || 'guest'}`);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function setLocalWishlist(userId, list) {
    try {
        localStorage.setItem(`user_wishlist_${userId || 'guest'}`, JSON.stringify(list));
    } catch {}
}

export async function parseFormDataWithUploads(formData, folder = 'uploads') {
    const parsed = {};
    const uploadPromises = [];

    for (const [key, value] of formData.entries()) {
        if ((value instanceof File || value instanceof Blob) && value.size > 0) {
            uploadPromises.push(
                uploadToSupabaseStorage(value, folder).then(url => {
                    if (key.endsWith('[]') || key === 'images' || key === 'photos' || key === 'galleryImages' || key === 'photo') {
                        const cleanKey = key.replace('[]', '');
                        parsed[cleanKey] = parsed[cleanKey] || [];
                        if (Array.isArray(parsed[cleanKey])) {
                            parsed[cleanKey].push(url);
                        } else {
                            parsed[cleanKey] = [parsed[cleanKey], url];
                        }
                    } else {
                        parsed[key] = url;
                    }
                })
            );
        } else if (typeof value === 'string') {
            try {
                parsed[key] = JSON.parse(value);
            } catch {
                parsed[key] = value;
            }
        } else {
            parsed[key] = value;
        }
    }

    if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
    }

    return parsed;
}
