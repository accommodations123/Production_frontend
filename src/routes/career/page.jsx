
import { useState, useMemo, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"


import { JobCard } from "@/features/career/components/JobCard"
import { FilterSection } from "@/features/career/components/FilterSection"
import { JobDetailsModal } from "@/features/career/components/JobDetailsModal"
import { useGetJobsQuery } from "@/store/api/careerApi"
import {
    Search, Filter, X, Building,
    TrendingUp, Users, Coffee, Award, Shield, Zap, Target, Wifi, Loader2
} from 'lucide-react'
import { Button } from "@/shared/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { usePagination } from "@/shared/hooks/usePagination"
import { Pagination } from "@/shared/ui/Pagination"
import { useCountry } from "@/context/CountryContext"

const BENEFITS = [
    { icon: TrendingUp, title: "Career Growth", desc: "Consulting career pathways" },
    { icon: Users, title: "Top Vendors", desc: "Collaborate with direct tier-1 clients" },
    { icon: Coffee, title: "Work-Life Balance", desc: "Flexible hours & remote work modes" },
    { icon: Award, title: "Competitive Rates", desc: "Top consulting industry pricing" },
    { icon: Shield, title: "Health Plans", desc: "W2 medical coverage options" },
    { icon: Zap, title: "Cutting Edge Technology", desc: "Work on advanced enterprise stacks" },
    { icon: Target, title: "Placement Speed", desc: "Fast-track onboarding with clients" },
    { icon: Wifi, title: "Nationwide Support", desc: "Opportunities across the USA" },
]

const ITEMS_PER_PAGE = 9

export default function CareerPage() {
    const { id: routeJobId } = useParams()
    const navigate = useNavigate()
    const jobListRef = useRef(null)

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedFilters, setSelectedFilters] = useState({
        positionType: [],
        workMode: [],
        experience: [],
        payType: [],
        state: "",
        city: "",
        sort: "newest"
    })

    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
    const [selectedJob, setSelectedJob] = useState(null)
    const [openApplyDirectly, setOpenApplyDirectly] = useState(false)

    const { activeCountry } = useCountry()

    // ─── DIRECT SEO ROUTE DETECTOR ──────────────────────────────────
    useEffect(() => {
        if (routeJobId) {
            setSelectedJob({ id: routeJobId })
        }
    }, [routeJobId])

    // ─── QUERY PARAMS FOR BACKEND API ──────────────────────────────
    const queryParams = useMemo(() => {
        return {
            country: activeCountry?.name || undefined,
            positionType: selectedFilters.positionType.join(","),
            workMode: selectedFilters.workMode.join(","),
            experience: selectedFilters.experience.join(","),
            payType: selectedFilters.payType.join(","),
            state: selectedFilters.state,
            city: selectedFilters.city,
            search: searchQuery,
            sort: selectedFilters.sort
        }
    }, [activeCountry, selectedFilters, searchQuery])

    // ─── FETCH JOBS FROM BACKEND API ────────────────────────────────
    const { data: apiJobsResponse, isLoading, isError, refetch } = useGetJobsQuery(queryParams)

    // Normalize jobs array from response and filter by active country
    const jobs = useMemo(() => {
        const rawJobs = apiJobsResponse?.jobs || apiJobsResponse?.data || apiJobsResponse
        const list = Array.isArray(rawJobs) ? rawJobs : []

        if (!activeCountry?.name) return list

        const selectedCountryName = activeCountry.name.toLowerCase().trim()
        const selectedCountryCode = (activeCountry.code || "").toLowerCase().trim()

        return list.filter(job => {
            const jobLocation = (job.location || "").toLowerCase().trim()
            return jobLocation === selectedCountryName || jobLocation === selectedCountryCode
        })
    }, [apiJobsResponse, activeCountry])

    // ─── PAGINATION ─────────────────────────────────────────────────
    const {
        currentItems: paginatedJobs,
        currentPage,
        totalPages,
        goToPage
    } = usePagination(jobs, ITEMS_PER_PAGE)

    // ─── FILTER HANDLERS ────────────────────────────────────────────
    const toggleFilter = (category, value) => {
        setSelectedFilters(prev => {
            const current = prev[category]
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value]
            return { ...prev, [category]: updated }
        })
    }

    const handleFilterTextChange = (field, value) => {
        setSelectedFilters(prev => ({ ...prev, [field]: value }))
    }

    const clearFilters = () => {
        setSelectedFilters({
            positionType: [],
            workMode: [],
            experience: [],
            payType: [],
            state: "",
            city: "",
            sort: "newest"
        })
        setSearchQuery("")
    }

    const handleViewDetails = (job) => {
        setOpenApplyDirectly(false)
        setSelectedJob(job)
        if (job.id) {
            navigate(`/career/job/${job.id}`)
        }
    }

    const handleApplyNow = (job) => {
        setOpenApplyDirectly(true)
        setSelectedJob(job)
        if (job.id) {
            navigate(`/career/job/${job.id}`)
        }
    }

    const handleCloseModal = () => {
        setSelectedJob(null)
        setOpenApplyDirectly(false)
        if (routeJobId) {
            navigate("/career")
        }
    }

    const activeFilterCount = useMemo(() => {
        let count = 0
        count += selectedFilters.positionType.length
        count += selectedFilters.workMode.length
        count += selectedFilters.experience.length
        count += selectedFilters.payType.length
        if (selectedFilters.state) count += 1
        if (selectedFilters.city) count += 1
        return count
    }, [selectedFilters])

    // Render filter sidebar contents
    const renderFilterContent = () => (
        <div className="space-y-5">
            {/* Search Input in Filters */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#484848] uppercase tracking-widest">Search</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#717171]" />
                    <input
                        type="text"
                        placeholder="Keyword, skill, title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 focus:border-[#E1392A] focus:ring-4 focus:ring-[#E1392A]/5 outline-none transition-all text-xs font-semibold"
                    />
                </div>
            </div>

            {/* Position Type Filter */}
            <FilterSection
                title="Position Type"
                options={["C2C", "W2", "Contract", "Full Time"]}
                selected={selectedFilters.positionType}
                onChange={(val) => toggleFilter('positionType', val)}
            />

            {/* Work Mode Filter */}
            <FilterSection
                title="Work Mode"
                options={["Remote", "Hybrid", "Onsite"]}
                selected={selectedFilters.workMode}
                onChange={(val) => toggleFilter('workMode', val)}
            />

            {/* Experience Filter */}
            <FilterSection
                title="Experience"
                options={["0–3 Years", "4–7 Years", "8+ Years"]}
                selected={selectedFilters.experience}
                onChange={(val) => toggleFilter('experience', val)}
            />

            {/* Pay Type Filter */}
            <FilterSection
                title="Pay Type"
                options={["Hourly", "Salary"]}
                selected={selectedFilters.payType}
                onChange={(val) => toggleFilter('payType', val)}
            />

            {/* Location Filters */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Location</h4>
                
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#484848] uppercase">State</label>
                    <input
                        type="text"
                        placeholder="e.g. Texas"
                        value={selectedFilters.state}
                        onChange={(e) => handleFilterTextChange('state', e.target.value)}
                        className="w-full h-10 px-3.5 rounded-xl border border-gray-200 focus:border-[#E1392A] focus:ring-4 focus:ring-[#E1392A]/5 outline-none text-xs font-semibold"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#484848] uppercase">City</label>
                    <input
                        type="text"
                        placeholder="e.g. Dallas"
                        value={selectedFilters.city}
                        onChange={(e) => handleFilterTextChange('city', e.target.value)}
                        className="w-full h-10 px-3.5 rounded-xl border border-gray-200 focus:border-[#E1392A] focus:ring-4 focus:ring-[#E1392A]/5 outline-none text-xs font-semibold"
                    />
                </div>
            </div>
        </div>
    )

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100/30 to-gray-50 font-sans pb-32 lg:pb-0 overflow-x-hidden">
            <>

          

            {/* ═══════════════════ MAIN CONTENT GRID ═══════════════════ */}
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Filters Sidebar (Desktop) */}
                    <aside className="hidden lg:block w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-28 space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                    <Filter className="h-4.5 w-4.5 text-[#E1392A]" />
                                    Filter Positions
                                    {activeFilterCount > 0 && (
                                        <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-[#E1392A] text-white text-[10px] font-bold">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </h3>
                                {activeFilterCount > 0 && (
                                    <button onClick={clearFilters} className="text-[11px] font-bold text-[#E1392A] hover:underline">
                                        Clear All
                                    </button>
                                )}
                            </div>
                            {renderFilterContent()}
                        </div>
                    </aside>

                    {/* Mobile Filter Trigger */}
                    <div className="lg:hidden">
                        <Button
                            onClick={() => setIsMobileFiltersOpen(true)}
                            variant="outline"
                            className="w-full h-11 flex items-center justify-center gap-2 border-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-[#E1392A] text-white text-[10px] rounded-full font-bold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                    </div>

                    {/* Job Listings Column */}
                    <div className="flex-1 min-w-0" ref={jobListRef}>
                        {/* Header controls & sorting */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {isLoading ? "Searching Careers..." : `${jobs.length} Opportunities Found`}
                            </h2>

                            {!isLoading && (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#484848]">
                                        <span>Sort by:</span>
                                        <select
                                            value={selectedFilters.sort}
                                            onChange={(e) => setSelectedFilters(prev => ({ ...prev, sort: e.target.value }))}
                                            className="bg-transparent text-[#00142E] font-bold border-none outline-none cursor-pointer focus:ring-0 text-xs"
                                        >
                                            <option value="newest">Newest</option>
                                            <option value="highest_pay">Highest Pay</option>
                                            <option value="remote_first">Remote First</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Loading Spinner */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 text-[#E1392A] animate-spin mb-4" />
                                <p className="text-xs text-[#717171] font-semibold">Fetching NextKinLife job listings...</p>
                            </div>
                        )}

                        {/* Error state */}
                        {isError && (
                            <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl p-6">
                                <Building className="h-10 w-10 text-red-400 mx-auto mb-4" />
                                <h3 className="text-base font-bold text-gray-900 mb-1">Failed to retrieve listings</h3>
                                <p className="text-xs text-[#484848] mb-4">Please check your backend connection or refresh the page.</p>
                                <Button onClick={() => refetch()} className="bg-[#E1392A] hover:bg-[#b0221e] text-white text-xs font-bold h-9">
                                    Try Again
                                </Button>
                            </div>
                        )}

                        {/* Jobs Grid list */}
                        {!isLoading && !isError && (
                            <>
                                {jobs.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {paginatedJobs.map((job) => (
                                            <JobCard
                                                key={job.id}
                                                job={job}
                                                onViewDetails={handleViewDetails}
                                                onApply={handleApplyNow}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
                                        <Search className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-base font-bold text-gray-900 mb-1">No positions match your search</h3>
                                        <p className="text-xs text-[#484848] max-w-sm mx-auto mb-6">
                                            Try adjusting filters or checking other locations.
                                        </p>
                                        {activeFilterCount > 0 && (
                                            <Button onClick={clearFilters} variant="outline" className="border-gray-200 text-gray-700 h-9 font-bold text-xs rounded-xl">
                                                Reset Filters
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8 flex justify-center">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={goToPage}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* ═══════════════════ ABOUT SECTION ═══════════════════ */}
                <section className="bg-gradient-to-br from-[#00142E] to-[#0A1C30] text-white p-6 sm:p-10 md:p-12 rounded-[2rem] my-16 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#E1392A]/15 rounded-full filter blur-3xl pointer-events-none" />
                    <div className="relative z-10 max-w-4xl">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#E1392A] bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10 mb-4 inline-block">
                            About NextKinLife Section
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black mb-4 leading-tight">
                            US-Based IT Staffing & Technology Consulting Partners
                        </h2>
                        <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                            NextKinLife LLC is a US-based IT Consulting and Staffing company helping organizations connect with qualified technology professionals. We support client and vendor requirements across software development, cloud engineering, data engineering, QA, DevOps, AI, and enterprise technology roles.
                        </p>
                    </div>
                </section>

                {/* ═══════════════════ WHY WORK WITH US BENEFITS ═══════════════════ */}
                <section className="py-6 border-t border-gray-100">
                    <h2 className="text-base font-bold text-gray-900 mb-6 text-center">Benefits of Consulting with NextKinLife</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {BENEFITS.map((benefit, index) => (
                            <div key={index} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-300">
                                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E1392A] flex items-center justify-center mb-3">
                                    <benefit.icon className="w-4.5 h-4.5" />
                                </div>
                                <h4 className="text-xs font-bold text-gray-900 mb-1">{benefit.title}</h4>
                                <p className="text-[10px] text-[#717171] font-medium leading-relaxed">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Mobile Filters Drawer */}
            <AnimatePresence>
                {isMobileFiltersOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/55 z-[1000] backdrop-blur-xs"
                            onClick={() => setIsMobileFiltersOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="fixed inset-y-0 right-0 w-[85vw] max-w-sm bg-white shadow-2xl z-[1001] overflow-y-auto p-6 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                                    <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                        <Filter className="h-4.5 w-4.5 text-[#E1392A]" />
                                        Filter Positions
                                    </h3>
                                    <button onClick={() => setIsMobileFiltersOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                                        <X className="h-4 w-4 text-[#717171]" />
                                    </button>
                                </div>
                                {renderFilterContent()}
                            </div>

                            <div className="pt-6 border-t border-gray-100 space-y-2 mt-8">
                                <Button onClick={clearFilters} variant="outline" className="w-full h-11 text-xs font-bold border-gray-200">
                                    Reset Filters
                                </Button>
                                <Button onClick={() => setIsMobileFiltersOpen(false)} className="w-full h-11 text-xs font-bold bg-[#00142E] text-white">
                                    Apply Filters ({jobs.length} jobs)
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Details Modal */}
            <JobDetailsModal
                job={selectedJob}
                isOpen={!!selectedJob}
                preOpenApply={openApplyDirectly}
                onClose={handleCloseModal}
            />

            </>
        </main>
    )
}
