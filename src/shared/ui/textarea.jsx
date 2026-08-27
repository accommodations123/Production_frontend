import * as React from "react"
import { cn } from "@/shared/utils/utils"

const Textarea = React.forwardRef(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 ease-in-out ring-offset-background placeholder:text-muted-foreground hover:border-gray-300 focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
