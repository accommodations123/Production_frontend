import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

export function Pagination({ currentPage, totalPages, onPageChange, className }) {
    if (!totalPages || totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        // Always show 1
        pages.push(1);

        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);

        // Adjust constraints to show more context if near start/end
        if (currentPage <= 3) {
            end = Math.min(totalPages - 1, 4);
        }
        if (currentPage >= totalPages - 2) {
            start = Math.max(2, totalPages - 3);
        }

        if (start > 2) pages.push('...');
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        if (end < totalPages - 1) pages.push('...');

        if (totalPages > 1) {
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className={cn("flex items-center justify-center gap-2 mt-8", className)}>
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 w-9 border-gray-200"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1.5 hidden sm:flex">
                {getPageNumbers().map((page, index) => (
                    typeof page === 'number' ? (
                        <Button
                            key={index}
                            variant={currentPage === page ? "default" : "ghost"}
                            size="icon"
                            onClick={() => onPageChange(page)}
                            className={cn(
                                "h-9 w-9 text-sm font-medium",
                                currentPage === page
                                    ? "bg-[#C93A30] text-white hover:bg-[#b02e25]"
                                    : "text-gray-600 hover:bg-gray-100"
                            )}
                        >
                            {page}
                        </Button>
                    ) : (
                        <span key={index} className="text-gray-400 px-1 text-sm">...</span>
                    )
                ))}
            </div>

            {/* Mobile View: Simplified */}
            <div className="flex items-center gap-2 sm:hidden text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 w-9 border-gray-200"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
