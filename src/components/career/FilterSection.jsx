import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Search } from 'lucide-react'

const SEARCHABLE_THRESHOLD = 6

export function FilterSection({ title, options = [], selected = [], onChange }) {
    const [isExpanded, setIsExpanded] = useState(true)
    const [filterQuery, setFilterQuery] = useState('')
    const contentRef = useRef(null)
    const [contentHeight, setContentHeight] = useState('auto')

    const activeCount = selected.length
    const isSearchable = options.length >= SEARCHABLE_THRESHOLD

    // Measure content height for smooth animation
    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(isExpanded ? `${contentRef.current.scrollHeight}px` : '0px')
        }
    }, [isExpanded, options, filterQuery])

    const filteredOptions = useCallback(() => {
        if (!filterQuery.trim()) return options
        const q = filterQuery.toLowerCase()
        return options.filter(opt => String(opt).toLowerCase().includes(q))
    }, [options, filterQuery])

    const visibleOptions = filteredOptions()

    return (
        <div className="border-b border-gray-100 pb-4 last:border-0">
            {/* Header */}
            <button
                type="button"
                className="w-full flex items-center justify-between py-2 group cursor-pointer"
                onClick={() => setIsExpanded(prev => !prev)}
                aria-expanded={isExpanded}
            >
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">{title}</span>
                    {activeCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#CB2A25] text-white text-[11px] font-bold leading-none">
                            {activeCount}
                        </span>
                    )}
                </div>
                <ChevronDown
                    className={`h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Collapsible content */}
            <div
                style={{ maxHeight: contentHeight }}
                className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
            >
                <div ref={contentRef}>
                    {/* Search within filter */}
                    {isSearchable && isExpanded && (
                        <div className="relative mb-2">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <input
                                type="text"
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                placeholder={`Search ${title.toLowerCase()}...`}
                                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 bg-gray-50/80 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CB2A25]/20 focus:border-[#CB2A25]/40 transition-all"
                            />
                        </div>
                    )}

                    {/* Options list */}
                    <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                        {visibleOptions.length > 0 ? (
                            visibleOptions.map((option) => {
                                const isActive = selected.includes(option)
                                return (
                                    <label
                                        key={option}
                                        className={`flex items-center gap-2.5 cursor-pointer px-2.5 py-2 rounded-lg transition-all duration-200 ${
                                            isActive
                                                ? 'bg-[#CB2A25]/5 border border-[#CB2A25]/15'
                                                : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                    >
                                        <div className="relative flex items-center justify-center flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={isActive}
                                                onChange={() => onChange(option)}
                                            />
                                            <div
                                                className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all duration-200 ${
                                                    isActive
                                                        ? 'bg-[#CB2A25] border-[#CB2A25]'
                                                        : 'border-gray-300 bg-white group-hover:border-gray-400'
                                                }`}
                                            >
                                                {isActive && (
                                                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                                                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-sm transition-colors ${isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                            {option}
                                        </span>
                                    </label>
                                )
                            })
                        ) : (
                            <p className="text-xs text-gray-400 py-2 px-2.5">No options match your search</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}