/**
 * Country name normalisation and lookup helpers.
 *
 * Uses the COUNTRIES list from mock-data as the canonical source
 * so every consumer stays consistent.
 */

import { COUNTRIES } from "@/shared/utils/mock-data";

const US_ALIASES = ["United States", "United States of America", "US", "USA"];

/**
 * Normalise a country name to its canonical form in COUNTRIES.
 * Maps all US variants to "United States of America".
 *
 * @param {string} name
 * @returns {string}
 */
export function normalizeCountryName(name) {
    if (!name) return "";
    const trimmed = name.trim();
    if (US_ALIASES.includes(trimmed)) return "United States of America";

    const found = COUNTRIES.find(
        (c) => c.name === trimmed || c.code === trimmed.toUpperCase(),
    );
    return found?.name || trimmed;
}

/**
 * Look up a country record by its ISO code (e.g. "US").
 *
 * @param {string} code
 * @returns {{ name: string, code: string, flag: string, phoneCode: string, currency: string } | null}
 */
export function getCountryByCode(code) {
    if (!code) return null;
    return COUNTRIES.find((c) => c.code === code.toUpperCase()) || null;
}

/**
 * Look up a country record by name (normalised first).
 *
 * @param {string} name
 * @returns {{ name: string, code: string, flag: string, phoneCode: string, currency: string } | null}
 */
export function getCountryByName(name) {
    if (!name) return null;
    const normalized = normalizeCountryName(name);
    return COUNTRIES.find((c) => c.name === normalized) || null;
}

/**
 * Resolve a currency symbol for a country name or ISO code.
 * Falls back to "$" when the country or currency is unknown.
 *
 * @param {string} countryNameOrCode - e.g. "India", "IN", "US"
 * @returns {string} e.g. "₹", "$", "€"
 */
export function getCurrencySymbol(countryNameOrCode) {
    if (!countryNameOrCode) return "$";

    const country =
        getCountryByName(countryNameOrCode) ||
        getCountryByCode(countryNameOrCode);

    if (!country?.currency) return "$";

    try {
        return (
            new Intl.NumberFormat("en", {
                style: "currency",
                currency: country.currency,
                maximumFractionDigits: 0,
            })
                .format(0)
                .replace(/[\d.,\s]/g, "")
                .trim() || "$"
        );
    } catch {
        return "$";
    }
}
