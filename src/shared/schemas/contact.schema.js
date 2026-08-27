import * as z from "zod"

export const contactSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    subject: z.string().min(1, "Please select a topic"),
    message: z.string()
        .min(10, "Message must be at least 10 characters")
        .max(500, "Message cannot exceed 500 characters"),
    agreed: z.boolean().refine(val => val === true, {
        message: "You must agree to the Privacy Policy and Terms of Service"
    })
});
