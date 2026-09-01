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
    const str = typeof name === 'string' ? name : (name?.name || name?.code || String(name));
    const trimmed = str.trim();
    if (!trimmed) return "";
    if (US_ALIASES.some(alias => alias.toLowerCase() === trimmed.toLowerCase())) {
        return "United States of America";
    }

    const found = COUNTRIES.find(
        (c) => c.name?.toLowerCase() === trimmed.toLowerCase() || c.code?.toLowerCase() === trimmed.toLowerCase(),
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
export function getCurrencySymbol(str) {
    if (!str) return "$";
    const upper = str.toString().trim().toUpperCase();

    // Direct currency code matching
    if (upper === "INR" || upper === "RS" || upper === "RUPEE" || upper === "RUPEES" || upper === "INDIA" || upper === "IN") return "₹";
    if (upper === "EUR" || upper === "EURO" || upper === "EUROS" || upper === "GERMANY" || upper === "FRANCE") return "€";
    if (upper === "GBP" || upper === "POUND" || upper === "POUNDS" || upper === "UK" || upper === "UNITED KINGDOM" || upper === "GB") return "£";
    if (upper === "USD" || upper === "DOLLAR" || upper === "DOLLARS" || upper === "US" || upper === "USA" || upper === "UNITED STATES" || upper === "UNITED STATES OF AMERICA") return "$";
    if (upper === "ZAR" || upper === "SOUTH AFRICA" || upper === "ZA") return "R";
    if (upper === "CAD" || upper === "CANADA" || upper === "AUD" || upper === "AUSTRALIA") return "$";
    if (upper === "AED" || upper === "UAE" || upper === "UNITED ARAB EMIRATES") return "AED ";
    if (upper === "SGD" || upper === "SINGAPORE") return "S$";

    const country =
        getCountryByName(str) ||
        getCountryByCode(str);

    const currencyCode = country?.currency || upper;

    try {
        return (
            new Intl.NumberFormat("en", {
                style: "currency",
                currency: currencyCode,
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
/**
 * Look up the 3-letter currency code (e.g. "INR", "USD", "EUR", "GBP") for a country name or code.
 *
 * @param {string} countryNameOrCode
 * @returns {string} e.g. "INR", "USD", "EUR"
 */
export function getCurrencyForCountry(str) {
    if (!str) return "USD";
    const upper = str.toString().trim().toUpperCase();

    if (upper === "INDIA" || upper === "IN" || upper === "INR") return "INR";
    if (upper === "UNITED STATES" || upper === "UNITED STATES OF AMERICA" || upper === "US" || upper === "USA" || upper === "USD") return "USD";
    if (upper === "UNITED KINGDOM" || upper === "UK" || upper === "GB" || upper === "GBP") return "GBP";
    if (upper === "CANADA" || upper === "CA" || upper === "CAD") return "CAD";
    if (upper === "AUSTRALIA" || upper === "AU" || upper === "AUD") return "AUD";
    if (upper === "SOUTH AFRICA" || upper === "ZA" || upper === "ZAR") return "ZAR";
    if (upper === "UNITED ARAB EMIRATES" || upper === "UAE" || upper === "AE" || upper === "AED") return "AED";
    if (upper === "SINGAPORE" || upper === "SG" || upper === "SGD") return "SGD";
    if (["GERMANY", "FRANCE", "ITALY", "SPAIN", "IRELAND", "NETHERLANDS", "AUSTRIA", "BELGIUM", "PORTUGAL", "GREECE", "FINLAND", "EUR"].includes(upper)) return "EUR";

    const country = getCountryByName(str) || getCountryByCode(str);
    return country?.currency || "USD";
}

