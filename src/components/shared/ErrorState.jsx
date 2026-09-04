import React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ErrorState({
    title = "Something went wrong",
    description = "We were unable to load this information. Please check your connection and try again.",
    retryAction,
    retryLabel = "Try Again",
    technicalDetail,
    className
}) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-destructive/20 bg-destructive/5 max-w-lg mx-auto my-6",
            className
        )}>
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1.5 leading-tight">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-5 leading-relaxed">
                {description}
            </p>

            {retryAction && (
                <Button
                    onClick={retryAction}
                    variant="outline"
                    className="font-semibold gap-2 border-destructive/30 hover:bg-destructive/10"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>{retryLabel}</span>
                </Button>
            )}

            {technicalDetail && (
                <details className="mt-4 text-xs text-muted-foreground text-left max-w-md cursor-pointer">
                    <summary className="hover:underline">Technical details</summary>
                    <pre className="mt-2 p-2 bg-background border border-border rounded-lg overflow-x-auto text-[11px]">
                        {typeof technicalDetail === "object" ? JSON.stringify(technicalDetail, null, 2) : String(technicalDetail)}
                    </pre>
                </details>
            )}
        </div>
    )
}
