export const HOST_TERMS = {
    DEFAULT: {
        general: [
            "Hosts must provide accurate information about their property.",
            "Changes to the listing availability must be updated promptly.",
            "Hosts respect the privacy and safety of all guests.",
            "Cancellation policies must be clearly communicated.",
            "Approved property listings will remain active for 15 days, after which they will automatically expire."
        ]
    },
    // Country Specific Rules
    US: {
        general: [
            "Compliance with Fair Housing Act is mandatory.",
            "Local occupancy tax collection requirements must be met.",
            "Smoke and carbon monoxide detectors are required.",
            "Approved property listings will remain active for 15 days, after which they will automatically expire."
        ],
        student: [
            "Lease agreements must comply with local student housing ordinances.",
            "Quiet hours must be strictly enforced during exam periods.",
            "Guarantor forms may be required for student tenants."
        ],
        family: [
            "Child safety features detailed in the listing must be verified.",
            "Neighborhood quiet hours (10 PM - 7 AM) must be respected.",
            "Max occupancy limits for families must adhere to local zoning."
        ],
        traveller: [
            "Short-term rental registration number must be displayed.",
            "Passport verification of international guests is recommended.",
            "Emergency contact information must be provided in the unit."
        ]
    },
    UK: {
        general: [
            "Gas Safety Certificate must be current and available.",
            "Energy Performance Certificate (EPC) rating must be meet minimums.",
            "Right to Rent checks must be conducted where applicable.",
            "Approved property listings will remain active for 15 days, after which they will automatically expire."
        ],
        student: [
            "HMO license is required if renting to 3+ students from different families.",
            "Deposit protection scheme usage is mandatory.",
            "Inventory check-in/check-out reports are required."
        ],
        backpacker: [
            "Hostel guidelines for shared spaces apply.",
            "Secure locker storage must be provided for valuables.",
            "CCTV in common areas (if any) must be disclosed."
        ]
    },
    IN: {
        general: [
            "Tenant police verification is mandatory for all long-term stays.",
            "PAN card details may be required for tax reporting.",
            "Society NOC (No Objection Certificate) should be obtained if applicable.",
            "Approved property listings will remain active for 15 days, after which they will automatically expire."
        ],
        student: [
            "Strict adherence to hostel/PG timings if situated in a managed building.",
            "Visitor policies for students must be clearly stated.",
            "Meal plans (if opted) must meet hygiene standards."
        ],
        family: [
            "Only married couples or direct family members allowed (as per local society rules).",
            "Verification of ID proofs (Aadhaar/Passport) for all adult members.",
            "Parking space allocation must be clarified beforehand."
        ],
        "working-professional": [
            "Employment proof or company ID may be requested.",
            "Rent agreement must run for a minimum of 11 months for long stays.",
            "Electricity and maintenance charges to be cleared monthly."
        ]
    }
};

export const getTermsFor = (countryCode, categorySlug) => {
    const countryRules = HOST_TERMS[countryCode] || HOST_TERMS['DEFAULT'];
    const categoryRules = countryRules[categorySlug] || [];
    const generalRules = countryRules.general || HOST_TERMS['DEFAULT'].general;

    return [...generalRules, ...categoryRules];
};
