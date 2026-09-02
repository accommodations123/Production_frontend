"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { JobCard } from "@/components/career/JobCard"
import { FilterSection } from "@/components/career/FilterSection"
import { JobDetailsModal } from "@/components/career/JobDetailsModal"
import { useGetJobsQuery } from "@/hooks/data/useCareerHooks"
import {
    Search, MapPin, Filter, X, Briefcase, Building, Globe,
    TrendingUp, Users, Coffee, Award, Shield, Zap, Target, Wifi,
    ChevronDown, ArrowRight, Loader2, Star, Sparkles
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { usePagination } from "@/hooks/usePagination"
import { Pagination } from "@/components/ui/Pagination"
import { useCountry } from "@/context/CountryContext"
import { normalizeCountryName } from "@/shared/utils/countryUtils"

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
        visaStatus: [],
        payType: [],
        department: [],
        duration: [],
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
            visaStatus: selectedFilters.visaStatus.join(","),
            department: selectedFilters.department.join(","),
            duration: selectedFilters.duration.join(","),
            payType: selectedFilters.payType.join(","),
            state: selectedFilters.state,
            city: selectedFilters.city,
            search: searchQuery,
            sort: selectedFilters.sort
        }
    }, [activeCountry, selectedFilters, searchQuery])

    // ─── FETCH JOBS FROM BACKEND API ────────────────────────────────
    const { data: apiJobsResponse, isLoading, isError, refetch } = useGetJobsQuery(queryParams)

    // Filter and sort jobs based on search, active country, and all filter categories
    const jobs = useMemo(() => {
        const rawJobs = apiJobsResponse?.jobs || apiJobsResponse?.data || apiJobsResponse
        const list = Array.isArray(rawJobs) ? rawJobs : []

        return list.filter(job => {
            // 0. Public visibility status filter
            const jobStatus = (job.status || 'active').toLowerCase();
            if (jobStatus !== 'active' && jobStatus !== 'open') {
                return false;
            }

            // 1. Active Country Matching
            if (activeCountry?.name && activeCountry.name !== "All" && activeCountry.name !== "Global") {
                const normSelected = normalizeCountryName(activeCountry.name).toLowerCase();
                const selectedCode = (activeCountry.code || "").toLowerCase();
                const jobCountry = normalizeCountryName(job.country || job.location || "").toLowerCase();
                const jobLoc = (job.location || "").toLowerCase();

                const isUSASelected = normSelected.includes('united states') || normSelected === 'usa' || normSelected === 'us' || selectedCode === 'us';
                const isJobUSA = jobCountry.includes('united states') || jobCountry === 'usa' || jobCountry === 'us' || 
                                 jobLoc.includes('united states') || jobLoc.includes('usa') || jobLoc.includes('america');

                if (isUSASelected) {
                    if (!isJobUSA && jobCountry && !jobCountry.includes('united states')) return false;
                    if (!isJobUSA && jobLoc && !jobLoc.includes('united states') && !jobLoc.includes('usa')) return false;
                } else {
                    if (isJobUSA) return false;
                    const matchesCurrent = (jobCountry && (jobCountry.includes(normSelected) || normSelected.includes(jobCountry))) ||
                                           (jobLoc && (jobLoc.includes(normSelected) || (selectedCode && jobLoc.includes(selectedCode))));
                    if (!matchesCurrent) return false;
                }
            }

            // 2. Keyword Search Query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const titleMatch = (job.title || job.job_title || "").toLowerCase().includes(q);
                const descMatch = (job.description || "").toLowerCase().includes(q);
                const clientMatch = (job.clientName || job.client_name || "").toLowerCase().includes(q);
                const vendorMatch = (job.vendorName || job.vendor_name || "").toLowerCase().includes(q);
                const companyMatch = (job.company || job.company_name || "").toLowerCase().includes(q);
                const deptMatch = (job.department || job.category || "").toLowerCase().includes(q);
                const locationMatch = (job.location || job.country || "").toLowerCase().includes(q);
                const skillsMatch = Array.isArray(job.skills) && job.skills.some(s => String(s).toLowerCase().includes(q));
                if (!titleMatch && !descMatch && !clientMatch && !vendorMatch && !companyMatch && !deptMatch && !locationMatch && !skillsMatch) {
                    return false;
                }
            }

            // 3. Position Type Filter (e.g. "C2C (Corp-to-Corp)", "W2", "Contract", "Full Time", "Part Time", "Contract to Hire")
            if (selectedFilters.positionType.length > 0) {
                const jobType = (job.positionType || job.employment_type || job.job_type || job.type || "").toLowerCase();
                const matchesPosition = selectedFilters.positionType.some(filterType => {
                    const normFilter = filterType.toLowerCase().replace(/[\s-_()]/g, "");
                    const normJobType = jobType.replace(/[\s-_()]/g, "");
                    return normJobType.includes(normFilter) || normFilter.includes(normJobType) ||
                           (filterType.toLowerCase().includes("c2c") && jobType.includes("c2c")) ||
                           (filterType.toLowerCase().includes("w2") && jobType.includes("w2")) ||
                           (filterType.toLowerCase().includes("contract to hire") && (jobType.includes("c2h") || jobType.includes("contract to hire")));
                });
                if (!matchesPosition) return false;
            }

            // 4. Work Mode Filter (e.g. "Remote", "Hybrid", "Onsite")
            if (selectedFilters.workMode.length > 0) {
                const jobWork = (job.workStyle || job.work_style || job.workMode || "").toLowerCase().replace(/[\s-_]/g, "");
                const matchesWork = selectedFilters.workMode.some(filterMode => {
                    const normFilter = filterMode.toLowerCase().replace(/[\s-_]/g, "");
                    return jobWork.includes(normFilter) || normFilter.includes(jobWork);
                });
                if (!matchesWork) return false;
            }

            // 5. Experience Filter (e.g. "0-3 Years", "4-7 Years", "8+ Years", "Senior", "Lead")
            if (selectedFilters.experience.length > 0) {
                const jobExp = (job.experience || job.experience_level || "").toLowerCase();
                const matchesExp = selectedFilters.experience.some(filterExp => {
                    const cleanFilter = filterExp.toLowerCase().replace(/–/g, "-");
                    if (cleanFilter.includes("0-3") || cleanFilter.includes("entry") || cleanFilter.includes("junior")) {
                        return jobExp.includes("0-3") || jobExp.includes("entry") || jobExp.includes("junior") || jobExp.includes("1") || jobExp.includes("2") || jobExp.includes("3");
                    }
                    if (cleanFilter.includes("4-7") || cleanFilter.includes("mid")) {
                        return jobExp.includes("4-7") || jobExp.includes("mid") || jobExp.includes("4") || jobExp.includes("5") || jobExp.includes("6") || jobExp.includes("7");
                    }
                    if (cleanFilter.includes("8+") || cleanFilter.includes("senior") || cleanFilter.includes("lead")) {
                        return jobExp.includes("8+") || jobExp.includes("senior") || jobExp.includes("lead") || jobExp.includes("8") || jobExp.includes("9") || jobExp.includes("10");
                    }
                    if (cleanFilter.includes("lead")) {
                        return jobExp.includes("lead") || jobExp.includes("principal") || jobExp.includes("staff");
                    }
                    return jobExp.includes(cleanFilter);
                });
                if (!matchesExp) return false;
            }

            // 6. Visa Authorization Filter (e.g. "USC", "GC", "H1B", "OPT", "CPT", "All Authorizations")
            if (selectedFilters.visaStatus.length > 0) {
                let jobVisas = [];
                if (Array.isArray(job.visaStatus)) jobVisas = job.visaStatus;
                else if (Array.isArray(job.visa_status)) jobVisas = job.visa_status;
                else {
                    const vStr = String(job.visaStatus || job.visa_status || job.work_authorization || '');
                    jobVisas = vStr.split(/[,/]/).map(v => v.trim()).filter(Boolean);
                }
                const jobVisasLower = jobVisas.map(v => v.toLowerCase());
                const matchesVisa = selectedFilters.visaStatus.some(filterVisa => {
                    const fLow = filterVisa.toLowerCase();
                    if (fLow.includes("all")) return true;
                    return jobVisasLower.some(jv => jv.includes(fLow) || fLow.includes(jv) || jv.includes("all"));
                });
                if (!matchesVisa) return false;
            }

            // 7. Department / Category Filter
            if (selectedFilters.department.length > 0) {
                const jobDept = (job.department || job.category || "").toLowerCase();
                const matchesDept = selectedFilters.department.some(filterDept => {
                    const fLow = filterDept.toLowerCase();
                    return jobDept.includes(fLow) || fLow.includes(jobDept);
                });
                if (!matchesDept) return false;
            }

            // 8. Contract Duration Filter
            if (selectedFilters.duration.length > 0) {
                const jobDur = (job.duration || job.contract_duration || "").toLowerCase();
                const matchesDur = selectedFilters.duration.some(filterDur => {
                    const fLow = filterDur.toLowerCase();
                    return jobDur.includes(fLow) || fLow.includes(jobDur);
                });
                if (!matchesDur) return false;
            }

            // 9. Pay Type Filter (e.g. "Hourly", "Salary")
            if (selectedFilters.payType.length > 0) {
                const jobPay = (job.payType || job.pay_type || "").toLowerCase();
                const matchesPay = selectedFilters.payType.some(filterPay => {
                    const normFilter = filterPay.toLowerCase();
                    return jobPay.includes(normFilter) || (normFilter === "hourly" && jobPay.includes("hr")) || (normFilter === "salary" && (jobPay.includes("yr") || jobPay.includes("annual")));
                });
                if (!matchesPay) return false;
            }

            // 10. State Filter
            if (selectedFilters.state.trim()) {
                const filterState = selectedFilters.state.toLowerCase().trim();
                const jobState = (job.state || job.state_name || "").toLowerCase();
                const jobLoc = (job.location || "").toLowerCase();
                if (!jobState.includes(filterState) && !jobLoc.includes(filterState)) {
                    return false;
                }
            }

            // 11. City Filter
            if (selectedFilters.city.trim()) {
                const filterCity = selectedFilters.city.toLowerCase().trim();
                const jobCity = (job.city || "").toLowerCase();
                const jobLoc = (job.location || "").toLowerCase();
                if (!jobCity.includes(filterCity) && !jobLoc.includes(filterCity)) {
                    return false;
                }
            }

            return true;
        }).sort((a, b) => {
            if (selectedFilters.sort === "salary-high") {
                const priceA = Number(a.payMax || a.payMin || a.salary_max || 0);
                const priceB = Number(b.payMax || b.payMin || b.salary_max || 0);
                return priceB - priceA;
            }
            if (selectedFilters.sort === "salary-low") {
                const priceA = Number(a.payMin || a.payMax || a.salary_min || 0);
                const priceB = Number(b.payMin || b.payMax || b.salary_min || 0);
                return priceA - priceB;
            }
            if (selectedFilters.sort === "title-asc") {
                return (a.title || "").localeCompare(b.title || "");
            }
            // default "newest"
            const dateA = new Date(a.postedDate || a.createdAt || a.created_at || 0);
            const dateB = new Date(b.postedDate || b.createdAt || b.created_at || 0);
            return dateB - dateA;
        });
    }, [apiJobsResponse, activeCountry, searchQuery, selectedFilters])

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
            const current = prev[category] || []
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
            visaStatus: [],
            payType: [],
            department: [],
            duration: [],
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
        count += (selectedFilters.positionType || []).length
        count += (selectedFilters.workMode || []).length
        count += (selectedFilters.experience || []).length
        count += (selectedFilters.visaStatus || []).length
        count += (selectedFilters.department || []).length
        count += (selectedFilters.duration || []).length
        count += (selectedFilters.payType || []).length
        if (selectedFilters.state) count += 1
        if (selectedFilters.city) count += 1
        return count
    }, [selectedFilters])

    // Render filter sidebar contents
    const renderFilterContent = () => (
        <div className="space-y-5">
            {/* Search Input in Filters */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Keyword, skill, client, vendor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 focus:border-[#CB2A25] focus:ring-4 focus:ring-[#CB2A25]/5 outline-none transition-all text-xs font-semibold"
                    />
                </div>
            </div>

            {/* Position Type Filter */}
            <FilterSection
                title="Position Type"
                options={["C2C (Corp-to-Corp)", "W2", "Contract", "Full Time", "Part Time", "Contract to Hire"]}
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
                title="Experience Level"
                options={["0-3 Years", "4-7 Years", "8+ Years", "Senior", "Lead"]}
                selected={selectedFilters.experience}
                onChange={(val) => toggleFilter('experience', val)}
            />

            {/* Visa Authorization Filter */}
            <FilterSection
                title="Visa Authorization"
                options={["USC", "GC", "H1B", "OPT", "CPT", "All Authorizations"]}
                selected={selectedFilters.visaStatus}
                onChange={(val) => toggleFilter('visaStatus', val)}
            />

            {/* Department / Category Filter */}
            <FilterSection
                title="Department"
                options={["Engineering", "Data & AI", "Cloud & DevOps", "Design", "Product", "Quality Assurance", "Cybersecurity", "Management"]}
                selected={selectedFilters.department}
                onChange={(val) => toggleFilter('department', val)}
            />

            {/* Contract Duration Filter */}
            <FilterSection
                title="Contract Duration"
                options={["12+ Months", "Long Term", "6 Months", "3-6 Months", "Full Time"]}
                selected={selectedFilters.duration}
                onChange={(val) => toggleFilter('duration', val)}
            />

            {/* Pay Type Filter */}
            <FilterSection
                title="Pay Frequency"
                options={["Hourly", "Salary"]}
                selected={selectedFilters.payType}
                onChange={(val) => toggleFilter('payType', val)}
            />

            {/* Location Filters */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Location</h4>
                
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">State</label>
                    <input
                        type="text"
                        placeholder="e.g. Texas, California"
                        value={selectedFilters.state}
                        onChange={(e) => handleFilterTextChange('state', e.target.value)}
                        className="w-full h-10 px-3.5 rounded-xl border border-gray-200 focus:border-[#CB2A25] focus:ring-4 focus:ring-[#CB2A25]/5 outline-none text-xs font-semibold"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">City</label>
                    <input
                        type="text"
                        placeholder="e.g. Dallas, Austin"
                        value={selectedFilters.city}
                        onChange={(e) => handleFilterTextChange('city', e.target.value)}
                        className="w-full h-10 px-3.5 rounded-xl border border-gray-200 focus:border-[#CB2A25] focus:ring-4 focus:ring-[#CB2A25]/5 outline-none text-xs font-semibold"
                    />
                </div>
            </div>
    )

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100/30 to-gray-50 font-sans pb-32 lg:pb-0 overflow-x-hidden">
            <Navbar />

            {/* ═══════════════════ HERO SECTION ═══════════════════ */}
            <div className="bg-gradient-to-br from-[#00142E] via-[#0A1C30] to-[#02152B] pt-28 pb-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#CB2A25] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#CB2A25] rounded-full mix-blend-multiply filter blur-xl opacity-10" />
                </div>

                <div className="container mx-auto max-w-5xl relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Country indicator */}
                        {activeCountry?.name && (
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold mb-6">
                                {activeCountry.flag && (
                                    <img
                                        src={activeCountry.flag}
                                        alt={activeCountry.name}
                                        className="w-5 h-3.5 object-cover rounded-sm"
                                        loading="lazy"
                                    />
                                )}
                                <span>Showing jobs in {activeCountry.name}</span>
                                <Globe className="h-3 w-3 text-white/60" />
                            </div>
                        )}

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4 max-w-4xl mx-auto">
                            Explore IT Consulting Opportunities with{' '}
                            <span className="text-[#CB2A25]">NextKinLife LLC</span>
                        </h1>
                        <p className="text-white/80 max-w-3xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
                            Connect with client and vendor opportunities across the United States. Apply for C2C, W2, Contract, and Full-Time positions.
                        </p>
                    </motion.div>

                    {/* Search Bar in Hero */}
                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 max-w-3xl mx-auto flex flex-col sm:flex-row gap-2.5 shadow-xl">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                            <input
                                type="text"
                                placeholder="Search by job title, description, vendor, or skills..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-11 pl-12 pr-4 rounded-xl outline-none bg-white/10 text-white placeholder:text-gray-400 focus:bg-white focus:text-gray-900 transition-all text-sm font-semibold"
                            />
                        </div>
                        <Button className="h-11 px-6 bg-[#CB2A25] hover:bg-[#b0221e] text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2">
                            Search Jobs
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* ═══════════════════ MAIN CONTENT GRID ═══════════════════ */}
            <div className="container mx-auto max-w-7xl px-4 py-10 sm:py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Filters Sidebar (Desktop) */}
                    <aside className="hidden lg:block w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-28 space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                    <Filter className="h-4.5 w-4.5 text-[#CB2A25]" />
                                    Filter Positions
                                    {activeFilterCount > 0 && (
                                        <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-[#CB2A25] text-white text-[10px] font-bold">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </h3>
                                {activeFilterCount > 0 && (
                                    <button onClick={clearFilters} className="text-[11px] font-bold text-[#CB2A25] hover:underline">
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
                                <span className="ml-1 px-2 py-0.5 bg-[#CB2A25] text-white text-[10px] rounded-full font-bold">
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
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
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
                                <Loader2 className="h-8 w-8 text-[#CB2A25] animate-spin mb-4" />
                                <p className="text-xs text-gray-400 font-semibold">Fetching NextKinLife job listings...</p>
                            </div>
                        )}

                        {/* Error state */}
                        {isError && (
                            <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl p-6">
                                <Building className="h-10 w-10 text-red-400 mx-auto mb-4" />
                                <h3 className="text-base font-bold text-gray-900 mb-1">Failed to retrieve listings</h3>
                                <p className="text-xs text-gray-500 mb-4">Please check your backend connection or refresh the page.</p>
                                <Button onClick={() => refetch()} className="bg-[#CB2A25] hover:bg-[#b0221e] text-white text-xs font-bold h-9">
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
                                        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
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
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#CB2A25]/15 rounded-full filter blur-3xl pointer-events-none" />
                    <div className="relative z-10 max-w-4xl">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#CB2A25] bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10 mb-4 inline-block">
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
                                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#CB2A25] flex items-center justify-center mb-3">
                                    <benefit.icon className="w-4.5 h-4.5" />
                                </div>
                                <h4 className="text-xs font-bold text-gray-900 mb-1">{benefit.title}</h4>
                                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{benefit.desc}</p>
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
                                        <Filter className="h-4.5 w-4.5 text-[#CB2A25]" />
                                        Filter Positions
                                    </h3>
                                    <button onClick={() => setIsMobileFiltersOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                                        <X className="h-4 w-4 text-gray-400" />
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

            <Footer />
        </main>
    )
}