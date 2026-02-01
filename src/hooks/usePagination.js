import { useState, useMemo, useEffect } from 'react';

/**
 * Custom hook for client-side pagination.
 * 
 * @param {Array} items - The full list of items to paginate
 * @param {number} itemsPerPage - Number of items to show per page
 * @returns {Object} Pagination state and controls
 */
export function usePagination(items = [], itemsPerPage = 12) {
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 when the array length changes (filtering happened)
    useEffect(() => {
        setCurrentPage(1);
    }, [items?.length]);

    // Calculate total pages
    const totalPages = Math.max(1, Math.ceil((items?.length || 0) / itemsPerPage));

    // Get current items slice
    const currentItems = useMemo(() => {
        if (!items || items.length === 0) return [];
        const begin = (currentPage - 1) * itemsPerPage;
        const end = begin + itemsPerPage;
        return items.slice(begin, end);
    }, [items, currentPage, itemsPerPage]);

    // Handlers
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToPage = (page) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return {
        currentPage,
        totalPages,
        currentItems,
        nextPage,
        prevPage,
        goToPage,
        setCurrentPage
    };
}
