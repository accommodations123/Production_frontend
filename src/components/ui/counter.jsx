import * as React from "react"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

export function Counter({ value, onChange, min = 0, max = 100 }) {
    const decrement = () => onChange(Math.max(min, value - 1))
    const increment = () => onChange(Math.min(max, value + 1))

    return (
        <div className="flex items-center gap-4">
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-gray-200 hover:border-indigo-500 hover:text-indigo-600"
                onClick={decrement}
                disabled={value <= min}
                type="button"
            >
                <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium text-lg text-gray-900">{value}</span>
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-gray-200 hover:border-indigo-500 hover:text-indigo-600"
                onClick={increment}
                disabled={value >= max}
                type="button"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    )
}
