import { createApi } from '@reduxjs/toolkit/query/react'
import { COUNTRIES } from '@/shared/utils/mock-data'
import { baseQueryWithAuth } from '@/store/baseQuery'

function getSymbolForLocation(location) {
    if (!location) return '$'
    const cleanLoc = location.toLowerCase().trim()
    const country = COUNTRIES.find(
        (c) => c.name.toLowerCase().trim() === cleanLoc || c.code.toLowerCase().trim() === cleanLoc
    )
    if (!country) return '$'
    const symbols = { INR: '₹', ZAR: 'R', EUR: '€', GBP: '£', USD: '$' }
    return symbols[country.currency] || '$'
}

function getTimeAgo(date) {
    if (!date) return 'Recently'
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return new Date(date).toLocaleDateString()
}

function normalizeWorkStyle(val) {
    if (!val) return 'Not specified'
    const map = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' }
    return map[val.toLowerCase()] || val
}

function normalizeType(val) {
    if (!val) return 'Full-time'
    const map = { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', internship: 'Internship' }
    return map[val.toLowerCase()] || val
}

function normalizeExperience(val) {
    if (!val) return 'Not specified'
    const map = { junior: 'Entry Level', mid: '2-4 years', senior: '5+ years', lead: '7+ years' }
    return map[val.toLowerCase()] || val
}

function buildSalaryText(job, symbol) {
    let salaryText = job.salary_range || job.salary
    if (salaryText) {
        if (!/^[$₹R€£]/.test(salaryText)) {
            salaryText = `${symbol} ${salaryText}`
        }
    } else if (job.pay_min && job.pay_max) {
        const suffix = job.pay_type === 'salary' ? 'yr' : 'hr'
        salaryText = `${symbol}${Math.round(job.pay_min)}-${symbol}${Math.round(job.pay_max)}/${suffix}`
    }
    return salaryText || 'Competitive'
}

function normalizeJob(jobItem) {
    const symbol = getSymbolForLocation(jobItem.location)
    return {
        ...jobItem,
        id: jobItem.id || jobItem._id,
        title: jobItem.title || 'Untitled Position',
        company: jobItem.company || 'NextKinLife LLC',
        clientName: jobItem.client_name || '',
        vendorName: jobItem.vendor_name || 'NextKinLife LLC',
        location: jobItem.location || 'Remote',
        description: jobItem.description || '',
        experience: normalizeExperience(jobItem.experience_level),
        type: normalizeType(jobItem.position_type || jobItem.employment_type),
        positionType: normalizeType(jobItem.position_type || jobItem.employment_type),
        workStyle: normalizeWorkStyle(jobItem.work_style),
        duration: jobItem.contract_duration || 'Long Term',
        salary: buildSalaryText(jobItem, symbol),
        payMin: jobItem.pay_min,
        payMax: jobItem.pay_max,
        payType: jobItem.pay_type || 'hourly',
        visaStatus: Array.isArray(jobItem.visa_status) ? jobItem.visa_status : [],
        startDate: jobItem.start_date,
        preferredSkills: Array.isArray(jobItem.preferred_skills) ? jobItem.preferred_skills : [],
        responsibilities: Array.isArray(jobItem.responsibilities) ? jobItem.responsibilities : [],
        requirements: Array.isArray(jobItem.requirements) ? jobItem.requirements : [],
        benefits: Array.isArray(jobItem.benefits) ? jobItem.benefits : [],
        recruiterName: jobItem.recruiter_name || '',
        recruiterEmail: jobItem.recruiter_email || '',
        recruiterPhone: jobItem.recruiter_phone || '',
        recruiterLinkedin: jobItem.recruiter_linkedin || '',
        companyLinkedin: jobItem.company_linkedin || '',
        postedDate: jobItem.createdAt || jobItem.created_at || new Date().toISOString(),
        posted: getTimeAgo(jobItem.createdAt || jobItem.created_at),
        skills: Array.isArray(jobItem.skills) ? jobItem.skills : [],
        isNew: (new Date() - new Date(jobItem.createdAt || jobItem.created_at || 0)) < 7 * 24 * 60 * 60 * 1000,
    }
}

export const careerApi = createApi({
    reducerPath: 'careerApi',
    baseQuery: baseQueryWithAuth,
    tagTypes: ['Job', 'MyApplications'],
    endpoints: (builder) => ({
        getJobs: builder.query({
            query: (params) => {
                if (typeof params === 'string') {
                    return params ? `career/jobs?country=${encodeURIComponent(params)}` : 'career/jobs'
                }
                const parts = []
                if (params) {
                    if (params.country) parts.push(`country=${encodeURIComponent(params.country)}`)
                    if (params.positionType) parts.push(`positionType=${encodeURIComponent(params.positionType)}`)
                    if (params.workMode) parts.push(`workMode=${encodeURIComponent(params.workMode)}`)
                    if (params.experience) parts.push(`experience=${encodeURIComponent(params.experience)}`)
                    if (params.state) parts.push(`state=${encodeURIComponent(params.state)}`)
                    if (params.city) parts.push(`city=${encodeURIComponent(params.city)}`)
                    if (params.payType) parts.push(`payType=${encodeURIComponent(params.payType)}`)
                    if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`)
                    if (params.sort) parts.push(`sort=${encodeURIComponent(params.sort)}`)
                    if (params.status) parts.push(`status=${encodeURIComponent(params.status)}`)
                }
                const qs = parts.join('&')
                return qs ? `career/jobs?${qs}` : 'career/jobs'
            },
            providesTags: ['Job'],
            transformResponse: (response) => {
                const jobs = response?.jobs || response?.data || response || []
                if (!Array.isArray(jobs)) return []
                return jobs.map(normalizeJob)
            },
        }),

        getJobById: builder.query({
            query: (id) => `career/jobs/${id}`,
            providesTags: (result, error, id) => [{ type: 'Job', id }],
            transformResponse: (response) => {
                const job = response?.job || response?.data || response
                if (!job) return null
                const symbol = getSymbolForLocation(job.location)
                return {
                    ...job,
                    id: job.id || job._id,
                    title: job.title || 'Untitled Position',
                    company: job.company || 'NextKinLife LLC',
                    clientName: job.client_name || '',
                    vendorName: job.vendor_name || 'NextKinLife LLC',
                    location: job.location || 'Remote',
                    description: job.description || '',
                    experience: job.experience_level || job.experience || 'Not specified',
                    type: job.position_type || job.employment_type || job.type || 'Full Time',
                    positionType: job.position_type || job.employment_type || job.type || 'Full Time',
                    workStyle: normalizeWorkStyle(job.work_style || job.workStyle),
                    duration: job.contract_duration || 'Long Term',
                    salary: buildSalaryText(job, symbol),
                    payMin: job.pay_min,
                    payMax: job.pay_max,
                    payType: job.pay_type || 'hourly',
                    visaStatus: Array.isArray(job.visa_status) ? job.visa_status : [],
                    startDate: job.start_date,
                    preferredSkills: Array.isArray(job.preferred_skills) ? job.preferred_skills : [],
                    responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
                    requirements: Array.isArray(job.requirements) ? job.requirements : [],
                    benefits: Array.isArray(job.benefits) ? job.benefits : [],
                    recruiterName: job.recruiter_name || 'Vinod Kumar',
                    recruiterEmail: job.recruiter_email || 'careers@nextkinlife.com',
                    recruiterPhone: job.recruiter_phone || '+1 (555) 123-4567',
                    recruiterLinkedin: job.recruiter_linkedin || 'linkedin.com/company/nextkinlife',
                    companyLinkedin: job.company_linkedin || 'https://linkedin.com/company/nextkinlife',
                    postedDate: job.createdAt || job.postedDate,
                }
            },
        }),

        applyForJob: builder.mutation({
            query: (formData) => ({
                url: 'career/applications',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['MyApplications', 'Job'],
        }),

        getMyApplications: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => `career/applications/me?page=${page}&limit=${limit}`,
            providesTags: ['MyApplications'],
            transformResponse: (response) => {
                const applications = response?.applications || response?.data || []
                return {
                    applications: applications.map((app) => ({
                        ...app,
                        id: app.id || app._id,
                        status: app.status,
                        createdAt: app.created_at || app.createdAt,
                        job: app.job
                            ? {
                                  id: app.job.id || app.job._id,
                                  title: app.job.title,
                                  company: app.job.company,
                                  location: app.job.location,
                                  type: app.job.employment_type,
                                  workStyle: app.job.work_style,
                              }
                            : null,
                    })),
                    page: response?.page || 1,
                    limit: response?.limit || 10,
                }
            },
        }),
    }),
})

export const {
    useGetJobsQuery,
    useGetJobByIdQuery,
    useApplyForJobMutation,
    useGetMyApplicationsQuery,
} = careerApi
