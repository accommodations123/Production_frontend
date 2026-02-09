export const VISA_GUIDES = [
    {
        id: "usa",
        country: "United States of America",
        types: [
            {
                name: "F-1 Student Visa",
                description: "For academic studies at an accredited US college or university.",
                details: [
                    "Allows 20hrs/week on-campus work",
                    "Requires valid I-20 form",
                    "Optional Practical Training (OPT) available"
                ]
            },
            {
                name: "H-1B Work Visa",
                description: "For specialty occupations requiring theoretical or technical expertise.",
                details: [
                    "Requires employer sponsorship",
                    "Subject to annual cap (lottery)",
                    "Dual intent visa (can apply for Green Card)"
                ]
            }
        ],
        checklist: ["Passport", "I-20 Form", "DS-160 Confirmation", "SEVIS Fee Receipt", "Financial Proof"]
    },
    {
        id: "uk",
        country: "UK",
        types: [
            {
                name: "Student Visa",
                description: "For students aged 16 or over to study in the UK.",
                details: [
                    "Points-based system (70 points needed)",
                    "Requires CAS from university",
                    "Allows work up to 20hrs/week during term"
                ]
            },
            {
                name: "Skilled Worker Visa",
                description: "Allows you to come to or stay in the UK to do an eligible job.",
                details: [
                    "Requires job offer from approved sponsor",
                    "Must meet salary threshold",
                    "Up to 5 years before extension"
                ]
            }
        ],
        checklist: ["Passport", "CAS Reference Number", "TB Test Results", "Financial Evidence", "ATAS Certificate (if applicable)"]
    },
    {
        id: "canada",
        country: "Canada",
        types: [
            {
                name: "Study Permit",
                description: "Document issued that allows foreign nationals to study at DLI.",
                details: [
                    "Allows working off-campus up to 20hrs/week",
                    "Must be enrolled at DLI",
                    "Can bring spouse/partner"
                ]
            },
            {
                name: "Post-Graduation Work Permit (PGWP)",
                description: "Open work permit after completing studies.",
                details: [
                    "Valid for up to 3 years",
                    "No job offer required",
                    "Pathway to Permanent Residence"
                ]
            }
        ],
        checklist: ["Passport", "Letter of Acceptance", "Proof of Funds (GIC)", "Medical Exam", "Biometrics"]
    },
    {
        id: "germany",
        country: "Germany",
        types: [
            {
                name: "Student Visa",
                description: "For students accepted into a German university.",
                details: [
                    "Requires blocked account (Sperrkonto)",
                    "Allows 120 full days work/year",
                    "Can be extended for job seeking"
                ]
            },
            {
                name: "Job Seeker Visa",
                description: "Long-term residency permit that allows you to look for a job.",
                details: [
                    "Valid for 6 months",
                    "Cannot work during this period",
                    "Requires degree recognition"
                ]
            }
        ],
        checklist: ["Passport", "Admission Letter", "Proof of Blocked Account", "Health Insurance", "Biometric Photos"]
    }
];

export const LEGAL_RIGHTS = [
    {
        id: "tenant",
        title: "Tenant Rights",
        content: "As a tenant, you have specific rights that protect you from unfair treatment. Understanding these can help you avoid disputes and ensure a safe living environment.",
        takeaways: [
            "Landlords cannot evict you without proper notice (usually 30-60 days)",
            "Security deposits must be returned within a specific timeframe",
            "Right to a habitable home (heat, water, electricity)"
        ]
    },
    {
        id: "work",
        title: "Workplace Rights",
        content: "Labor laws protect employees from exploitation and ensure fair working conditions. These rights apply to international students and workers as well.",
        takeaways: [
            "Entitled to minimum wage and overtime pay",
            "Discrimination based on race/religion is illegal",
            "Right to a safe and hazard-free workplace"
        ]
    },
    {
        id: "police",
        title: "Police Interactions",
        content: "Knowing how to interact with law enforcement is crucial for your safety and legal protection.",
        takeaways: [
            "Right to remain silent",
            "Right to ask for a lawyer",
            "Do not sign anything without legal counsel"
        ]
    }
];
