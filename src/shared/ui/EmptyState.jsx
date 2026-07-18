import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/shared/ui/button"

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onActionClick,
  actionLink,
  className
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl border border-dashed border-gray-200/80 bg-white/40 backdrop-blur-sm shadow-sm max-w-lg mx-auto ${className || ""}`}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#717171] mb-6 shadow-sm">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[#484848] max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {(actionText && (onActionClick || actionLink)) && (
        <Button
          onClick={onActionClick}
          asChild={!!actionLink}
          className="bg-accent hover:bg-accent/95 text-white font-bold text-sm px-6 h-11 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          {actionLink ? actionLink : actionText}
        </Button>
      )}
    </motion.div>
  )
}
