/**
 * Lazy-loads the country-state-city library on demand.
 *
 * The library contains ~8.7 MB of static JSON (every city/state/country on earth).
 * By dynamically importing it, we avoid including it in the initial bundle.
 * The module is cached after the first load so subsequent calls are instant.
 *
 * Usage:
 *   const { Country, State, City } = await loadLocationData();
 */

let cachedModule = null;

export async function loadLocationData() {
    if (cachedModule) return cachedModule;

    const mod = await import('country-state-city');
    cachedModule = {
        Country: mod.Country,
        State: mod.State,
        City: mod.City,
    };
    return cachedModule;
}
