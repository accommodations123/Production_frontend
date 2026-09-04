import React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function CardSkeleton({ count = 1, className }) {
    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
            {Array.from({ length: count }).map((_, index) => (
                <Card key={index} className="overflow-hidden border border-border/80">
                    <Skeleton className="aspect-4/3 w-full rounded-none" />
                    <CardHeader className="space-y-2 p-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-3.5 w-1/2" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex justify-between items-center">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function TableSkeleton({ rows = 5, columns = 4, className }) {
    return (
        <div className={cn("w-full border border-border rounded-xl overflow-hidden bg-card", className)}>
            <div className="border-b border-border bg-muted/40 p-4 flex gap-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            <div className="divide-y divide-border">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="p-4 flex gap-4 items-center">
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <Skeleton key={colIndex} className="h-4 flex-1" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export function ListSkeleton({ count = 3, className }) {
    return (
        <div className={cn("space-y-4", className)}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex gap-4 p-4 border border-border rounded-xl bg-card items-center">
                    <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3.5 w-2/3" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
                </div>
            ))}
        </div>
    )
}

export function ProfileSkeleton({ className }) {
    return (
        <div className={cn("space-y-6 p-6 border border-border rounded-2xl bg-card", className)}>
            <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-border">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    )
}

export function PageSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <CardSkeleton count={6} />
        </div>
    )
}
