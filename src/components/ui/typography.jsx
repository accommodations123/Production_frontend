import * as React from "react"
import { cn } from "@/lib/utils"

export function TypographyH1({ className, children, ...props }) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  )
}

export function TypographyH2({ className, children, ...props }) {
  return (
    <h2
      className={cn(
        "scroll-m-20 border-b border-border pb-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground first:mt-0",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
}

export function TypographyH3({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-xl sm:text-2xl font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export function TypographyH4({ className, children, ...props }) {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-lg font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </h4>
  )
}

export function TypographyP({ className, children, ...props }) {
  return (
    <p
      className={cn("leading-7 text-foreground/80 [&:not(:first-child)]:mt-4", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function TypographyLead({ className, children, ...props }) {
  return (
    <p className={cn("text-lg sm:text-xl text-muted-foreground", className)} {...props}>
      {children}
    </p>
  )
}

export function TypographyLarge({ className, children, ...props }) {
  return (
    <div className={cn("text-lg font-semibold text-foreground", className)} {...props}>
      {children}
    </div>
  )
}

export function TypographySmall({ className, children, ...props }) {
  return (
    <small className={cn("text-xs sm:text-sm font-medium leading-none text-muted-foreground", className)} {...props}>
      {children}
    </small>
  )
}

export function TypographyMuted({ className, children, ...props }) {
  return (
    <p className={cn("text-xs sm:text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  )
}
