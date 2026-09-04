import React from "react"
import { cn } from "@/lib/utils"

export function PageHeader({
    title,
    description,
    badge,
    breadcrumbs,
    actions,
    className
}) {
    return (
        <div className={cn("flex flex-col gap-4 pb-6 pt-2 border-b border-border/60 mb-6", className)}>
            {breadcrumbs && (
                <div className="text-xs text-muted-foreground">
                    {breadcrumbs}
                </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            {title}
                        </h1>
                        {badge}
                    </div>
                    {description && (
                        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}
