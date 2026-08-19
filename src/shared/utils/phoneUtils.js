/**
 * Phone number utilities — splitting a full phone string into
 * country-code + local number, and re-joining them.
 *
 * KNOWN_CODES is sorted longest-first so "+353" matches before "+3".
 */

// Sorted longest-first for greedy matching
const KNOWN_CODES = [
    '+971', '+966', '+353', '+351', '+244', '+234',
    '+91', '+86', '+82', '+81', '+65', '+61', '+55',
    '+49', '+48', '+44', '+39', '+34', '+33', '+31',
    '+27', '+1',
]

/**
 * Split a full phone string into { code, number }.
 * Defaults to +91 when no known code prefix is found.
 *
 * @param {string} fullPhone - e.g. "+14155551234"
 * @returns {{ code: string, number: string }}
 */
export function splitPhone(fullPhone) {
    if (!fullPhone) return { code: '+91', number: '' }
    const str = String(fullPhone).trim()

    for (const code of KNOWN_CODES) {
        if (str.startsWith(code)) {
            return { code, number: str.slice(code.length).trim() }
        }
    }
    return { code: '+91', number: str }
}

/**
 * Join a country code and local number into a single string.
 * Returns empty string when no number is provided.
 *
 * @param {string} code   - e.g. "+1"
 * @param {string} number - e.g. "4155551234"
 * @returns {string}
 */
export function formatPhone(code, number) {
    if (!number) return ''
    return `${code}${number}`
}
