import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/shared/utils/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:scale-100",
    {
        variants: {
            variant: {
                default: "bg-accent text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:bg-accent/95 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(203,72,71,0.25)]",
                destructive:
                    "bg-red-500 text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:bg-red-500/90 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(239,68,68,0.25)]",
                outline:
                    "border border-input bg-background hover:bg-accent/5 hover:border-accent hover:text-accent",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-secondary/90 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(10,28,48,0.1)]",
                ghost: "hover:bg-accent hover:text-white",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-lg px-3",
                lg: "h-12 rounded-2xl px-8 text-[15px]",
                pill: "h-12 rounded-full px-7 text-[15px]",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
