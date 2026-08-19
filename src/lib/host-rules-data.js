import { GraduationCap, Users, Plane, Briefcase, Backpack, Building, Home, Share2, Star, Tent } from "lucide-react";

export const categories = [
    {
        id: "student",
        name: "Student Accommodation",
        icon: GraduationCap,
        description: "For hosts offering long stays to students (3–12 months).",
        rules: {
            US: [
                "Clear monthly rent + deposit amount",
                "Written rental agreement (lease) required",
                "Provide secure environment (locks, smoke alarms, CO detectors)",
                "Must follow state landlord-tenant laws",
                "Mention rules for roommates, kitchen use, quiet hours",
                "Must disclose all utilities (WiFi, electricity, water)",
                "No false promises about distance to university"
            ],
            UK: [
                "Must have HMO license if renting to 3+ students",
                "Gas Safety Certificate required annually",
                "Deposit protection scheme mandatory",
                "Right to Rent checks required",
                "Energy Performance Certificate (EPC) rating E or better",
                "Electrical Installation Condition Report (EICR) every 5 years"
            ],
            CA: [
                "Standard Lease Form required in Ontario",
                "Rent increase guidelines must be followed",
                "Snow removal responsibilities must be clear",
                "Vital services (heat, water, electricity) cannot be cut off",
                "Smoke and CO alarms mandatory on every floor"
            ],
            AU: [
                "Bond must be lodged with state authority",
                "Condition report required at start/end of tenancy",
                "Minimum housing standards apply (locks, ventilation, lighting)",
                "Written tenancy agreement mandatory",
                "Smoke alarms must be compliant and tested"
            ],
            IN: [
                "Police verification of tenant mandatory",
                "Rent agreement must be registered if >11 months",
                "Security deposit usually 2-6 months rent",
                "Maintenance charges clarity required",
                "House rules for guests/timings must be clear"
            ]
        }
    },
    {
        id: "family",
        name: "Family Accommodation",
        icon: Users,
        description: "For families staying long/medium term.",
        rules: {
            US: [
                "Must provide correct number of beds & child-friendly environment",
                "Must follow landlord-tenant rules (if >30 days)",
                "List exact occupancy limit (adults + children)",
                "Provide safe facilities (no hazards, working detectors)",
                "If pets allowed, mention clearly & specify count limit",
                "Pet deposit & cleaning rules must be disclosed",
                "Must provide all mandatory disclosures (mold, pest history if required)"
            ],
            UK: [
                "No discrimination against families with children",
                "Furniture must meet Fire Safety Regulations",
                "Blind cords must be safety compliant",
                "Garden/outdoor space safety check recommended",
                "Clear rules on school catchment if mentioned",
                "Pet allowance rules (Consumer Rights Act 2015 compliance)"
            ],
            CA: [
                "Human Rights Code prohibits discrimination against families",
                "Window safety devices recommended for high floors",
                "Lead paint disclosure for older homes",
                "Clear rules on stroller storage/parking",
                "Pet clauses in leases may be void (Ontario) - check local laws"
            ],
            AU: [
                "Pool fencing laws must be strictly followed",
                "Window restrictors required for upper floors",
                "Blind/curtain cord safety standards apply",
                "Discrimination against children prohibited (mostly)",
                "Pet request forms standard in some states"
            ],
            IN: [
                "Family-friendly society rules disclosure",
                "Child safety grills on balconies recommended",
                "Maid/Cook availability info helpful",
                "Nearby park/school info recommended",
                "Society rules regarding pets must be clear"
            ]
        }
    },
    {
        id: "general",
        name: "General / All Types",
        icon: Home,
        description: "Suitable for all types of visitors (Students, Families, Travellers).",
        rules: {
            US: [
                "Must meet standard safety & health codes",
                "Non-discriminatory policy required",
                "Clear house rules for all guest types",
                "Accessibility features recommended"
            ],
            UK: [
                "Gas & Fire safety compliance mandatory",
                "EPC rating E or above",
                "Right to Rent checks if applicable",
                "Insurance covering all guest types"
            ],
            CA: [
                "Compliance with local municipal bylaws",
                "Safety standards (smoke/CO alarms)",
                "Clear cancellation policies"
            ],
            AU: [
                "Safety standards compliance",
                "Insurance coverage",
                "Respect for neighbors & noise rules"
            ],
            IN: [
                "ID proof mandatory for all guests",
                "Police verification if required",
                "Clear policy on gates/curfews"
            ]
        }
    },
    {
        id: "traveller",
        name: "Traveller (Tourist / Vacation Stay)",
        icon: Plane,
        description: "Short-term stay (1–30 nights).",
        rules: {
            US: [
                "Check if city requires short-term rental license",
                "Must collect occupancy/hotel tax if required",
                "Strict safety standards (smoke & CO detectors, fire extinguisher)",
                "Clear check-in / check-out rules",
                "Must provide essentials (clean bed, basic supplies)",
                "No misleading photos or amenities",
                "Noise rules & party restrictions"
            ],
            UK: [
                "Planning permission may be needed (e.g. London 90-day rule)",
                "Fire risk assessment mandatory",
                "TV License required if TV provided",
                "Public Liability Insurance recommended",
                "No 'party house' advertising allowed in some areas"
            ],
            CA: [
                "Principal residence requirement in some cities (e.g. Vancouver, Toronto)",
                "Short-term rental registration number must be displayed",
                "Municipal Accommodation Tax (MAT) collection",
                "Condo board rules must be respected"
            ],
            AU: [
                "Code of Conduct for STR industry applies",
                "Registration on state STR register (e.g. NSW)",
                "Fire safety standards for STR",
                "Neighbors have right to complain via hotline"
            ],
            IN: [
                "Form C submission for foreign guests mandatory (FRRO)",
                "ID proof of all guests required",
                "Homestay registration with Tourism Dept (state specific)",
                "No illegal activities declaration"
            ]
        }
    },
    // ... (Other categories would follow similar pattern, defaulting to US if not specified)
    // {
    //     id: "business",
    //     name: "Business Traveller",
    //     icon: Briefcase,
    //     description: "For professionals needing clean, quiet spaces.",
    //     rules: {
    //         US: [
    //             "Must provide workspace (desk, WiFi, proper lighting)",
    //             "No loud neighbors or party-friendly environment",
    //             "Must disclose if property has shared areas",
    //             "Safety & privacy must be high",
    //             "Must follow STR license rules if <30 nights"
    //         ],
    //         UK: [
    //             "Portable Appliance Testing (PAT) for electronics",
    //             "High-speed internet speed verification recommended",
    //             "Invoice/Receipt provision capability",
    //             "Self check-in preferred"
    //         ],
    //         CA: [
    //             "Business license may be required",
    //             "Quiet hours must be strictly enforced",
    //             "Workspace ergonomics recommended"
    //         ],
    //         AU: [
    //             "ABN required for invoicing",
    //             "Reliable WiFi guarantee",
    //             "24/7 access or key safe required"
    //         ],
    //         IN: [
    //             "GST registration if turnover > 20L",
    //             "Invoice with GSTIN required for business expensing",
    //             "Power backup (inverter/generator) essential"
    //         ]
    //     }
    // },
    {
        id: "backpacker",
        name: "Backpacker",
        icon: Backpack,
        description: "Budget stays, shared or minimal facilities.",
        rules: {
            US: [
                "Must be clean, hygienic, safe",
                "Shared rooms must follow occupancy limits",
                "List exactly what is shared (bathroom, kitchen, bedroom)",
                "Provide lockers or secure storage",
                "Must clearly mention noise level and social environment",
                "No overcrowding (U.S. fire code rules)"
            ],
            UK: [
                "HMO license almost certainly required",
                "Fire doors and emergency lighting mandatory",
                "Weekly fire alarm testing",
                "Hygiene rating if food provided"
            ],
            CA: [
                "Rooming house license may be required",
                "Maximum occupancy per room limits",
                "Bed bug protocols in place"
            ],
            AU: [
                "Class 1b or 3 building classification may apply",
                "Registration as boarding house if >5 residents",
                "Strict fire safety for shared accommodation"
            ],
            IN: [
                "Dormitory license if applicable",
                "Foreigner registration (Form C) critical",
                "Safe storage for valuables mandatory"
            ]
        }
    },
    {
        id: "longterm",
        name: "Long-term Rental (30+ nights)",
        icon: Building,
        description: "Typical residential rental.",
        rules: {
            US: [
                "Must follow landlord-tenant laws",
                "Required disclosures (lead paint, mold, fire safety depending on state)",
                "Written lease contract mandatory",
                "Security deposit should follow state limit rules",
                "Host must handle maintenance & repairs",
                "Guests gain tenant rights → host must respect them"
            ],
            UK: [
                "Assured Shorthold Tenancy (AST) agreement",
                "Deposit protection within 30 days",
                "How to Rent guide must be provided",
                "Gas/Electric safety certs mandatory"
            ],
            CA: [
                "Standard Lease usage mandatory (Ontario)",
                "Rent control rules apply",
                "Eviction only for specific reasons (N12, N4, etc.)",
                "Interest on last month's rent deposit"
            ],
            AU: [
                "Residential Tenancies Act applies",
                "Bond lodging required",
                "Entry notice periods for inspections",
                "Urgent repairs timeline compliance"
            ],
            IN: [
                "11-month agreement standard practice",
                "Police verification of tenant",
                "Society NOC often required",
                "TDS deduction on rent if applicable"
            ]
        }
    },
    {
        id: "shortterm",
        name: "Short-term Rental (1–29 nights)",
        icon: Home,
        description: "Typical Airbnb-style stay.",
        rules: {
            US: [
                "Must obtain STR license/registration if city requires",
                "Must collect lodging/occupancy taxes",
                "Must follow safety/fire code (detectors, extinguishers, emergency exit info)",
                "House rules must be clear & visible",
                "No parties, illegal activity",
                "Host must stay compliant with HOA rules"
            ],
            UK: [
                "90-day limit in London (Greater London Authority Act)",
                "Business rates may apply if available >140 days",
                "Fire safety risk assessment",
                "Insurance for paying guests"
            ],
            CA: [
                "Principal residence only (Toronto/Vancouver)",
                "Registration fee and number display",
                "4% MAT tax collection",
                "Fire safety plan posting"
            ],
            AU: [
                "Code of Conduct adherence",
                "180-day cap in some Sydney areas",
                "Strata by-laws may ban STR",
                "Fire safety compliance"
            ],
            IN: [
                "Homestay/BnB registration",
                "Commercial electricity rates may apply",
                "Society permission letter",
                "Guest ID record keeping"
            ]
        }
    },
    {
        id: "sharing",
        name: "Sharing (Co-living / Room Sharing)",
        icon: Share2,
        description: "Guests share spaces with others.",
        rules: {
            US: [
                "Must disclose exactly what is shared",
                "Must follow occupancy limits",
                "Provide house rules for cleanliness, noise, guests",
                "Provide secure private storage",
                "Host must ensure fair & safe co-living environment"
            ],
            UK: [
                "HMO licensing for 3+ unrelated people",
                "Fire doors required",
                "Minimum room size standards",
                "Management regulations apply"
            ],
            CA: [
                "Rooming house by-laws check",
                "Shared kitchen/bath standards",
                "Privacy locks on bedrooms"
            ],
            AU: [
                "Boarding house registration if applicable",
                "Written occupancy agreement",
                "House rules must be reasonable"
            ],
            IN: [
                "PG (Paying Guest) rules apply",
                "Police verification",
                "Food/Amenities clarity",
                "Curfew/Gate timing rules"
            ]
        }
    },
    // {
    //     id: "luxury",
    //     name: "Luxury Stay",
    //     icon: Star,
    //     description: "High-standard accommodation.",
    //     rules: {
    //         US: [
    //             "Must include premium amenities (high-quality linens, toiletries, WiFi, AC)",
    //             "Property must be spotless and professionally maintained",
    //             "Safety systems must be advanced (alarms, CO detectors, escape plan)",
    //             "Accurate premium photos required",
    //             "Host must clearly state all luxury services (chauffeur, chef, etc.)",
    //             "Must have proper liability insurance"
    //         ],
    //         UK: [
    //             "Higher insurance coverage required",
    //             "Concierge/Service availability clarity",
    //             "Premium safety standards",
    //             "Privacy guarantees"
    //         ],
    //         CA: [
    //             "Luxury tax implications check",
    //             "High-end amenities maintenance guarantee",
    //             "Privacy and security priority"
    //         ],
    //         AU: [
    //             "Premium insurance",
    //             "Strict privacy compliance",
    //             "Service guarantees"
    //         ],
    //         IN: [
    //             "Luxury tax if room rate > specific amount",
    //             "Staff verification",
    //             "Premium service delivery guarantee"
    //         ]
    //     }
    // },
    // {
    //     id: "camping",
    //     name: "Camping / Outdoor Stay",
    //     icon: Tent,
    //     description: "Tents / RV sites / nature stays.",
    //     rules: {
    //         US: [
    //             "Must follow land-use/zoning laws",
    //             "Fire safety rules (fire pits, wildfire restrictions)",
    //             "Provide clean water / sanitation info",
    //             "Mention wildlife risks, safety rules",
    //             "Must provide emergency contact & directions",
    //             "Host must specify if it’s private land camping or RV parking"
    //         ],
    //         UK: [
    //             "Camping license if >28 days/year",
    //             "Sanitation facilities provision",
    //             "Countryside Code adherence",
    //             "Fire safety in open air guidance"
    //         ],
    //         CA: [
    //             "Conservation authority rules",
    //             "Fire ban adherence",
    //             "Waste management plan",
    //             "Wildlife safety education"
    //         ],
    //         AU: [
    //             "Bushfire safety plan mandatory",
    //             "Council approval for camping on private land",
    //             "Waste disposal rules",
    //             "Snake/Spider safety info"
    //         ],
    //         IN: [
    //             "Forest department permission if near protected areas",
    //             "Waste disposal strict rules",
    //             "Safety from wildlife",
    //             "Bonfire permissions"
    //         ]
    //     }
    // }
];

export const universalRules = {
    US: [
        "I confirm I checked local city/state laws for hosting.",
        "I have required STR license/permit (if needed).",
        "My property meets safety requirements: smoke alarm, CO detector, fire extinguisher.",
        "My listing will be honest & accurate.",
        "I understand I may need to collect lodging/occupancy tax for short stays.",
        "I will follow HOA / zoning rules (if applicable).",
        "I agree to provide emergency contacts & house rules.",
        "I will follow landlord-tenant laws for stays over 30 days."
    ],
    UK: [
        "I confirm I have the right to rent out this property (mortgage/lease check).",
        "I have a valid Gas Safety Certificate.",
        "I have a valid Energy Performance Certificate (EPC).",
        "I have conducted a Fire Risk Assessment.",
        "I have appropriate insurance for hosting.",
        "I will comply with the 90-day rule (London only).",
        "I will perform Right to Rent checks for long stays.",
        "I confirm all electrical appliances are safe (PAT testing)."
    ],
    CA: [
        "I have registered my short-term rental with the city (if required).",
        "I am collecting and remitting Municipal Accommodation Tax (MAT).",
        "I confirm this is my principal residence (if required by local law).",
        "I have liability insurance of at least $2M.",
        "I will respect condo/strata bylaws.",
        "I have working smoke and CO alarms on all floors.",
        "I will provide a safe and clean environment."
    ],
    AU: [
        "I have registered my property on the state STR register.",
        "I will follow the Code of Conduct for the Short-term Rental Accommodation Industry.",
        "I have adequate public liability insurance.",
        "I meet all fire safety standards for my dwelling type.",
        "I will not exceed the 180-day cap (if applicable in Greater Sydney).",
        "I will provide neighbors with my contact details for complaints.",
        "I will respect strata by-laws."
    ],
    IN: [
        "I have submitted Form C for all foreign guests.",
        "I verify the ID of all guests before check-in.",
        "I have registered my homestay with the Tourism Department (if applicable).",
        "I will not allow illegal activities on the premises.",
        "I have police verification for my staff.",
        "I will maintain a guest register.",
        "I have necessary permissions from my Society/RWA."
    ]
};
