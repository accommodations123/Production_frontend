import { FileText, CreditCard, UserSquare2, Building, MapPin } from "lucide-react";

export const verificationSteps = [
    { id: 1, title: "Contact Verification", description: "Verify email & phone" },
    { id: 2, title: "Identity & Residency", description: "Verify who you are" },
    { id: 3, title: "Profile Verification", description: "Setup your host profile" },
];

export const countryIdRequirements = {
    US: {
        name: "United States",
        documents: [
            { id: "passport", label: "Passport", icon: UserSquare2 },
            { id: "driver_license", label: "Driver's License", icon: CreditCard },
            { id: "state_id", label: "State ID Card", icon: FileText },
        ],
        extraFields: [
            { id: "ssn_last4", label: "SSN (Last 4 digits)", type: "password", placeholder: "XXXX" }
        ]
    },
    IN: {
        name: "India",
        documents: [
            { id: "aadhaar", label: "Aadhaar Card", icon: CreditCard },
            { id: "pan", label: "PAN Card", icon: FileText },
            { id: "passport", label: "Passport", icon: UserSquare2 },
            { id: "driving_license", label: "Driving License", icon: CreditCard },
        ]
    },
    GB: {
        name: "United Kingdom",
        documents: [
            { id: "passport", label: "Passport", icon: UserSquare2 },
            { id: "driver_license", label: "Driving Licence", icon: CreditCard },
            { id: "residence_permit", label: "Biometric Residence Permit", icon: FileText },
        ]
    },
    CA: {
        name: "Canada",
        documents: [
            { id: "passport", label: "Passport", icon: UserSquare2 },
            { id: "driver_license", label: "Driver's License", icon: CreditCard },
            { id: "provincial_id", label: "Provincial ID Card", icon: FileText },
        ]
    },
    AU: {
        name: "Australia",
        documents: [
            { id: "passport", label: "Passport", icon: UserSquare2 },
            { id: "driver_license", label: "Driver's License", icon: CreditCard },
            { id: "medicare", label: "Medicare Card", icon: CreditCard },
        ]
    },
    // Default fallback
    DEFAULT: {
        name: "Other",
        documents: [
            { id: "passport", label: "Passport", icon: UserSquare2 },
            { id: "national_id", label: "National ID Card", icon: CreditCard },
            { id: "driver_license", label: "Driver's License", icon: FileText },
        ]
    }
};

export const cityRules = {
    "New York": {
        requiresRegistration: true,
        registrationLabel: "NYC Short-Term Rental Registration Number",
        minStay: 30, // days
        warning: "New York City laws require hosts to register with the city. Stays under 30 days are generally prohibited unless the host is present."
    },
    "San Francisco": {
        requiresRegistration: true,
        registrationLabel: "San Francisco Business Registration Certificate",
        minStay: 30, // if not registered
        warning: "Hosts in San Francisco must register as a business and obtain a Short-Term Rental Certificate."
    },
    "London": {
        requiresRegistration: false,
        limit: 90, // days per year
        warning: "The '90-day rule' applies in London. You cannot rent out your entire home for more than 90 nights a year without planning permission."
    },
    "Barcelona": {
        requiresRegistration: true,
        registrationLabel: "Tourist Household (HUT) License",
        warning: "You must have a valid tourist license to rent out your property in Barcelona."
    }
};

export const addressProofs = [
    { id: "utility", label: "Utility Bill (Water, Gas, Electric)", icon: Building },
    { id: "bank", label: "Bank Statement", icon: FileText },
    { id: "lease", label: "Lease Agreement", icon: FileText },
    { id: "tax", label: "Property Tax Bill", icon: Building },
];
