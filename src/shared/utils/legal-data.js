
export const VISA_GUIDES = [
    {
        id: "us",
        country: "United States",
        checklist: [
            "Valid Passport (6+ months validity)",
            "DS-160 Confirmation Page",
            "Visa Interview Appointment Letter",
            "I-20 Form (for Students)",
            "SEVIS Fee Receipt",
            "Financial Proof (Bank Statements)",
            "Passport Size Photographs"
        ],
        types: [
            {
                name: "F1 Student Visa",
                description: "For international students attending academic programs in the US.",
                details: [
                    "Requires I-20 from accredited institution",
                    "Must prove non-immigrant intent",
                    "Allows on-campus work (20hrs/week)"
                ]
            },
            {
                name: "H1B Work Visa",
                description: "For specialty occupations requiring theoretical or technical expertise.",
                details: [
                    "Employer must sponsor",
                    "Lottery based selection",
                    "Valid for 3 years (extendable)"
                ]
            }
        ]
    },
    {
        id: "uk",
        country: "United Kingdom",
        checklist: [
            "Valid Passport",
            "CAS Letter (for Students)",
            "Tuberculosis Test Results",
            "Financial Evidence",
            "ATAS Certificate (if applicable)",
            "Biometric Residence Permit (BRP) info"
        ],
        types: [
            {
                name: "Student Route",
                description: "For students aged 16+ who have been offered a place on a course.",
                details: [
                    "70 points required (CAS + English + Finance)",
                    "Allows work up to 20hrs/week",
                    "Graduate Route available after completion"
                ]
            },
            {
                name: "Skilled Worker Visa",
                description: "Allows you to come to or stay in the UK to do an eligible job with an approved employer.",
                details: [
                    "Job offer from approved sponsor required",
                    "Minimum salary threshold applies",
                    "English language requirement"
                ]
            }
        ]
    },
    {
        id: "ca",
        country: "Canada",
        checklist: [
            "Valid Passport",
            "Letter of Acceptance",
            "Proof of Funds",
            "Immigration Medical Exam",
            "Police Clearance Certificate",
            "Statement of Purpose"
        ],
        types: [
            {
                name: "Study Permit",
                description: "Document issued that allows foreign nationals to study at designated learning institutions (DLI).",
                details: [
                    "May need Temporary Resident Visa (TRV) or eTA",
                    "Work off-campus allowed (20hrs/week)",
                    "PGWP eligible after graduation"
                ]
            },
            {
                name: "Work Permit",
                description: "Document that authorizes a foreigner to work in Canada.",
                details: [
                    "Employer-specific or Open work permit",
                    "LMIA may be required for employer-specific",
                    "Spousal open work permit available"
                ]
            }
        ]
    }
];

export const LEGAL_RIGHTS = [
    {
        id: "tenant",
        title: "Tenant Rights",
        content: "As a tenant, you have the right to a habitable home, privacy, and protection from eviction without proper cause. Landlords must provide notice before entering and maintain the property.",
        takeaways: [
            "Right to a written lease agreement",
            "Protection against discrimination",
            "Right to sue for security deposit return"
        ]
    },
    {
        id: "employee",
        title: "Employee Rights",
        content: "Employees are entitled to fair wages, safe working conditions, and protection from discrimination and harassment. You have the right to unionize and to be paid for overtime.",
        takeaways: [
            "Right to minimum wage",
            "Protection from workplace retaliation",
            "Right to family and medical leave"
        ]
    },
    {
        id: "consumer",
        title: "Consumer Rights",
        content: "Consumers have the right to safety, to be informed, to choose, and to be heard. You are protected from unfair business practices and defective products.",
        takeaways: [
            "Right to a refund for defective goods",
            "Protection from false advertising",
            "Right to data privacy"
        ]
    }
];
