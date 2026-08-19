// Fetch city/state/country from a 6-digit Indian pincode via the public postalpincode API.
// Falls back gracefully — the caller should handle null gracefully.

const PINCODE_API = "https://api.postalpincode.in/pincode";

export async function fetchAddressByPincode(pincode) {
  if (!pincode || !/^\d{6}$/.test(String(pincode))) return null;

  try {
    const res = await fetch(`${PINCODE_API}/${pincode}`);
    if (!res.ok) return null;

    const [data] = await res.json();
    if (data?.Status !== "Success" || !data.PostOffice?.length) return null;

    const po = data.PostOffice[0];
    return {
      city: po.District || "",
      state: po.State || "",
      country: po.Country || "India",
    };
  } catch {
    return null;
  }
}
