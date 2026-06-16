import * as React from "react"
import { cn } from "@/lib/utils"

export function CardSelect({ options, value, onChange, className }) {
    return (
        <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-4", className)}>
            {options.map((option) => {
                const Icon = option.icon
                const isSelected = value === option.id
                return (
                    <div
                        key={option.id}
                        onClick={() => onChange(option.id)}
                        className={cn(
                            "cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:border-indigo-500/50 hover:bg-indigo-50/50 hover:shadow-md",
                            isSelected
                                ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-md"
                                : "border-gray-200 bg-white"
                        )}
                    >
                        {Icon && (
                            <div className={cn("mb-3 rounded-lg p-2 w-fit transition-colors", isSelected ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500")}>
                                <Icon className="h-6 w-6" />
                            </div>
                        )}
                        <div className={cn("font-semibold transition-colors", isSelected ? "text-indigo-900" : "text-gray-900")}>{option.label}</div>
                        {option.description && (
                            <div className="mt-1 text-xs text-gray-500 leading-relaxed">{option.description}</div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
