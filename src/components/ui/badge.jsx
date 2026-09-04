import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground",
                destructive:
                    "border-transparent bg-destructive/15 text-destructive border-destructive/20",
                outline: "text-foreground border-border",
                accent: "border-transparent bg-accent text-white",
                success: "border-emerald-200 bg-emerald-50 text-emerald-700",
                warning: "border-amber-200 bg-amber-50 text-amber-700",
                info: "border-sky-200 bg-sky-50 text-sky-700",
                neutral: "border-slate-200 bg-slate-50 text-slate-700",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

function Badge({ className, variant, ...props }) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
