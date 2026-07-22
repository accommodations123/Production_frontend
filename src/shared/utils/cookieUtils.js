export function clearAuthCookie() {
    const doc = window.document;
    doc.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    doc.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.nextkinlife.live;";
}
