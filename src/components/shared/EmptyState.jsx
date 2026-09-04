import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

export function EmptyState({
    icon: Icon = Inbox,
    title = "No data found",
    description,
    actionText,
    onActionClick,
    actionLink,
    action,
    secondaryAction,
    className
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-border bg-card/60 shadow-xs max-w-lg mx-auto my-6",
                className
            )}
        >
            {Icon && (
                <div className="w-14 h-14 rounded-2xl bg-muted border border-border/80 flex items-center justify-center text-muted-foreground mb-4 shadow-xs">
                    <Icon className="w-7 h-7" />
                </div>
            )}
            <h3 className="text-lg font-bold text-foreground mb-1.5 leading-tight">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
                    {description}
                </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
                {action}
                {actionText && (onActionClick || actionLink) && (
                    <Button
                        onClick={onActionClick}
                        asChild={!!actionLink}
                        variant="accent"
                        className="font-semibold px-5"
                    >
                        {actionLink ? actionLink : actionText}
                    </Button>
                )}
                {secondaryAction}
            </div>
        </motion.div>
    )
}
