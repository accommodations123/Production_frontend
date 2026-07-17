import * as React from "react"
import { cn } from "@/shared/utils/utils"

const Input = React.forwardRef(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 ease-in-out file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground hover:border-gray-300 focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
