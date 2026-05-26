import axios from "axios";

/**
 * Utility to fetch address details (City, State, Country) from an Indian Pincode.
 * Uses the free Post Office API (api.postalpincode.in).
 * 
 * @param {string} pincode - 6-digit Indian pincode
 * @returns {Promise<{city: string, state: string, country: string} | null>}
 */
export async function fetchAddressByPincode(pincode) {
    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
        return null;
    }

    try {
        const response =
            await axios.get(
                `https://api.postalpincode.in/pincode/${pincode}`
            );

        const data = response.data;

        if (data && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
            const details = data[0].PostOffice[0];
            return {
                city: details.District || details.Block || "",
                state: details.State || "",
                country: details.Country || "India"
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching pincode details:", error);
        return null;
    }
}
