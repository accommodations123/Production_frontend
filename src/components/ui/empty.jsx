import * as React from "react"
import { cn } from "@/lib/utils"

function Empty({
  className,
  children,
  ...props
}) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}

function EmptyIcon({
  className,
  children,
  ...props
}) {
  return (
    <div
      data-slot="empty-icon"
      className={cn(
        "flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4 shadow-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function EmptyTitle({
  className,
  children,
  ...props
}) {
  return (
    <h3
      data-slot="empty-title"
      className={cn("text-lg font-bold tracking-tight text-foreground mb-1", className)}
      {...props}
    >
      {children}
    </h3>
  )
}

function EmptyDescription({
  className,
  children,
  ...props
}) {
  return (
    <p
      data-slot="empty-description"
      className={cn("text-sm text-muted-foreground mb-6 max-w-sm", className)}
      {...props}
    >
      {children}
    </p>
  )
}

function EmptyAction({
  className,
  children,
  ...props
}) {
  return (
    <div
      data-slot="empty-action"
      className={cn("flex flex-wrap items-center justify-center gap-3", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Empty, EmptyIcon, EmptyTitle, EmptyDescription, EmptyAction }
