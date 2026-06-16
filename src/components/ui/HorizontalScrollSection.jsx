"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HorizontalScrollSection({ title, subtitle, children, className }) {
    const scrollContainerRef = React.useRef(null)

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300
            scrollContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            })
        }
    }

    return (
        <section className={cn("py-8", className)}>
            <div className="container mx-auto px-4">
                <div className="flex items-end justify-between mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-200 rounded-full">
                        <span className="text-sm font-medium text-blue-500">{title}</span>
                        {subtitle && (
                            <span className="text-xs text-gray-500">• {subtitle}</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-8 w-8"
                            onClick={() => scroll("left")}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-8 w-8"
                            onClick={() => scroll("right")}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide snap-x"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {children}
                </div>
            </div>
        </section>
    )
}
