/**
 * Extracts social / contact information from any entity shape
 * used across the app (host listings, marketplace items, user profiles, etc.).
 *
 * Handles direct fields, nested host/user/Host objects, and seller_ prefixed
 * fields from the marketplace API.
 */

const SOCIAL_FIELDS = [
    "whatsapp",
    "email",
    "instagram",
    "facebook",
    "linkedin",
    "twitter",
    "phone",
];

/**
 * Extract social/contact info from any entity shape.
 *
 * @param {object} entity - The raw object (listing, user, host, marketplace item, etc.)
 * @returns {Record<string, string>} An object keyed by platform with the first truthy value found.
 *
 * @example
 *   const socials = extractSocials(listing)
 *   // { whatsapp: "+91...", email: "a@b.com", instagram: "@handle" }
 */
export function extractSocials(entity) {
    if (!entity) return {};

    const result = {};
    const sources = [
        entity,       // direct fields
        entity.host,  // nested host
        entity.user,  // nested user
        entity.Host,  // capitalised Host (Sequelize-style includes)
    ];

    for (const field of SOCIAL_FIELDS) {
        // Check each source in priority order
        for (const source of sources) {
            if (source?.[field]) {
                result[field] = source[field];
                break;
            }
        }

        // Fallback: seller_ prefixed fields (marketplace)
        if (!result[field]) {
            const sellerKey = `seller_${field}`;
            if (entity[sellerKey]) {
                result[field] = entity[sellerKey];
            }
        }
    }

    return result;
}
