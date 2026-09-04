import { supabase } from '@/lib/supabaseClient';
import { JOB_COLUMNS, sanitizePayload, resilientInsert } from '../constants';
import { getCurrentUserId, getCurrentUserObject } from '../userUtils';
import { parseFormDataWithUploads } from '../storageUtils';
import { uploadToSupabaseStorage } from '@/lib/storageUtils';
import { normalizeCountryName } from '@/shared/utils/countryUtils';
import { NOTIFICATION_TYPES } from '@/shared/constants/notificationTypes';
import { createInAppAndEmailNotification, notifyAdminsOfUserSubmission } from '../notificationUtils';

export async function handleCareerRoute({ cleanUrl, method, body, queryParams }) {
        // ── 8. CAREER, JOBS & APPLICATIONS ──────────────────────────
        if (cleanUrl.startsWith('career') || cleanUrl.startsWith('jobs') || cleanUrl.startsWith('applications')) {
            const userObj = await getCurrentUserObject()
            const currentUserId = userObj?.id || userObj?.user_id || userObj?.user?.id || userObj?._id || await getCurrentUserId()

            // 1. Submit Job Application: POST career/applications or POST applications or POST career/apply
            if ((cleanUrl.includes('application') || cleanUrl.endsWith('/apply')) && method === 'POST') {
                if (!currentUserId) {
                    return { error: { status: 401, data: { message: 'Please sign in to submit a job application' } } }
                }

                let payload = {}
                let resumeUrl = ''

                if (body instanceof FormData) {
                    for (const [key, value] of body.entries()) {
                        if (value instanceof File) {
                            if (key === 'resume' || key === 'resume_file' || key === 'file') {
                                try {
                                    resumeUrl = await uploadToSupabaseStorage(value, 'documents')
                                } catch (uploadErr) {
                                    console.warn('Resume upload fallback:', uploadErr)
                                    resumeUrl = `https://storage.mock/resumes/${value.name}`
                                }
                            }
                        } else {
                            payload[key] = value
                        }
                    }
                } else {
                    payload = { ...(body || {}) }
                }

                const urlParts = cleanUrl.split('/');
                const urlJobId = (urlParts.length >= 3 && urlParts[0] === 'career' && urlParts[1] === 'jobs') ? urlParts[2] : '';
                const jobId = payload.job_id || payload.jobId || urlJobId || '';
                let jobInfo = null

                if (jobId) {
                    try {
                        const { data: dbJob } = await supabase.from('jobs').select('*').eq('id', jobId).maybeSingle()
                        if (dbJob) {
                            jobInfo = {
                                id: dbJob.id,
                                _id: dbJob.id,
                                title: dbJob.title || 'Job Position',
                                company: dbJob.company || dbJob.company_name || 'NextKinLife Partner',
                                location: dbJob.location || dbJob.city || 'Remote',
                                type: dbJob.employment_type || dbJob.job_type || 'Full-time',
                                employment_type: dbJob.employment_type || dbJob.job_type || 'Full-time',
                                work_style: dbJob.work_style || 'On-site',
                                workStyle: dbJob.work_style || 'On-site'
                            }
                        }
                    } catch (jobErr) {
                        console.warn('Could not fetch job from db:', jobErr)
                    }
                }

                if (!jobInfo) {
                    jobInfo = {
                        id: jobId || `job_${Date.now()}`,
                        _id: jobId || `job_${Date.now()}`,
                        title: payload.job_title || payload.jobTitle || 'Technology Professional',
                        company: payload.company || payload.company_name || 'NextKinLife Partner',
                        location: payload.current_location || payload.location || 'Remote',
                        type: payload.employment_type || payload.job_type || 'Full-time',
                        employment_type: payload.employment_type || payload.job_type || 'Full-time',
                        work_style: payload.work_style || 'On-site',
                        workStyle: payload.work_style || 'On-site'
                    }
                }

                // Get current user profile
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUserId).maybeSingle()
                let profileMeta = {}
                if (profile?.street_address && (profile.street_address.startsWith('{') || profile.street_address.startsWith('['))) {
                    try { profileMeta = JSON.parse(profile.street_address) } catch {}
                }
                profileMeta.job_applications = Array.isArray(profileMeta.job_applications) ? profileMeta.job_applications : []

                // Check for existing application for this specific job to prevent duplicate entries
                const existingIdx = profileMeta.job_applications.findIndex(a => 
                    (jobId && (String(a.job_id || a.jobId) === String(jobId) || String(a.job?.id || a.job?._id) === String(jobId)))
                )

                const applicationId = existingIdx >= 0 && (profileMeta.job_applications[existingIdx].id || profileMeta.job_applications[existingIdx]._id)
                    ? (profileMeta.job_applications[existingIdx].id || profileMeta.job_applications[existingIdx]._id)
                    : `app_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

                const newApplication = {
                    id: applicationId,
                    _id: applicationId,
                    user_id: currentUserId,
                    userId: currentUserId,
                    job_id: jobId,
                    jobId: jobId,
                    full_name: payload.full_name || profile?.name || profile?.full_name || userObj?.user_metadata?.full_name || 'Applicant',
                    email: payload.email || profile?.email || userObj?.email || '',
                    phone: payload.phone || profile?.phone || userObj?.phone || '',
                    current_location: payload.current_location || '',
                    linkedin_url: payload.linkedin_url || '',
                    work_authorization: payload.work_authorization || '',
                    years_of_experience: payload.years_of_experience || '',
                    resume_url: resumeUrl || payload.resume_url || '',
                    status: 'submitted',
                    created_at: existingIdx >= 0 ? (profileMeta.job_applications[existingIdx].created_at || profileMeta.job_applications[existingIdx].createdAt || new Date().toISOString()) : new Date().toISOString(),
                    createdAt: existingIdx >= 0 ? (profileMeta.job_applications[existingIdx].createdAt || profileMeta.job_applications[existingIdx].created_at || new Date().toISOString()) : new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    job: jobInfo
                }

                if (existingIdx >= 0) {
                    profileMeta.job_applications[existingIdx] = { ...profileMeta.job_applications[existingIdx], ...newApplication }
                } else {
                    profileMeta.job_applications.unshift(newApplication)
                }

                // Clean all duplicates in stored profileMeta
                const seenKeys = new Set()
                profileMeta.job_applications = profileMeta.job_applications.filter(a => {
                    const key = String(a.job_id || a.jobId || a.job?.id || a.id || a._id)
                    if (seenKeys.has(key)) return false
                    seenKeys.add(key)
                    return true
                })

                // Save into user profile metadata
                await supabase.from('profiles').update({ street_address: JSON.stringify(profileMeta) }).eq('id', currentUserId)

                // Insert/upsert directly into job_applications table in Supabase
                try {
                    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
                    const validJobId = isUuid(jobId) ? jobId : (isUuid(jobInfo?.id) ? jobInfo.id : null);

                    const dbPayload = {
                        applicant_name: newApplication.full_name || profile?.name || 'Applicant',
                        name: newApplication.full_name || profile?.name || 'Applicant',
                        email: newApplication.email || profile?.email || '',
                        phone: newApplication.phone || profile?.phone || '',
                        resume_url: newApplication.resume_url || null,
                        linkedin_url: newApplication.linkedin_url || null,
                        experience_years: parseFloat(newApplication.years_of_experience) || null,
                        status: 'Pending',
                        source: 'NextKinLife Portal',
                        notes: jobInfo?.title ? `Position: ${jobInfo.title}` : null
                    };
                    if (validJobId) {
                        dbPayload.job_id = validJobId;
                    }

                    const { data: dbInserted, error: insertError } = await supabase
                        .from('job_applications')
                        .insert(dbPayload)
                        .select()
                        .maybeSingle();

                    if (!insertError && dbInserted?.id) {
                        newApplication.id = dbInserted.id;
                        newApplication._id = dbInserted.id;
                    } else if (insertError) {
                        console.warn('job_applications table insert note:', insertError.message);
                    }
                } catch (tableErr) {
                    console.warn('job_applications table insert exception:', tableErr);
                }

                // Send user confirmation
                await createInAppAndEmailNotification({
                    userId: currentUserId,
                    recipientId: currentUserId,
                    userEmail: newApplication.email,
                    title: `💼 Application Submitted: ${jobInfo?.title || 'Job Opportunity'}`,
                    message: `Your application for "${jobInfo?.title || 'Job Opportunity'}" has been submitted successfully to the recruiting team.`,
                    type: NOTIFICATION_TYPES.JOB_APPLICATION_SUBMITTED,
                    entityType: 'job_application',
                    entityId: applicationId,
                    actionUrl: '/account-v2?tab=applications',
                    link: '/account-v2?tab=applications',
                    metadata: newApplication
                });

                // Send admin notification
                await notifyAdminsOfUserSubmission({
                    title: `💼 New Job Application: ${jobInfo?.title || 'Job Position'}`,
                    message: `${newApplication.full_name} (${newApplication.email}) applied for ${jobInfo?.title || 'Job Position'} (Vendor: ${jobInfo?.vendorName || 'NextKinLife'}).`,
                    type: NOTIFICATION_TYPES.JOB_APPLICATION_SUBMITTED,
                    entityType: 'job_application',
                    entityId: applicationId,
                    actionUrl: '/admin/careers',
                    link: '/admin/careers',
                    userId: currentUserId,
                    userEmail: newApplication.email,
                    userName: newApplication.full_name,
                    metadata: newApplication
                });

                return {
                    data: {
                        success: true,
                        message: 'Application submitted successfully',
                        data: newApplication,
                        application: newApplication
                    }
                }
            }

            // 2. Get User's Applications: GET career/applications/me or GET career/applications or GET applications/me
            if (cleanUrl.includes('application') && method === 'GET') {
                if (!currentUserId) {
                    return { data: { applications: [], data: [], count: 0, total: 0, totalPages: 1 } }
                }

                let applications = []
                let isAuthoritativeDbSuccess = false

                // 1. Direct query to live Supabase job_applications table
                try {
                    const userEmail = userObj?.email || userObj?.user?.email;
                    let query = supabase.from('job_applications').select('*, jobs:job_id(*)').order('created_at', { ascending: false });
                    if (userEmail) {
                        query = query.eq('email', userEmail);
                    }
                    const { data: dbApps, error: dbErr } = await query;

                    if (!dbErr && Array.isArray(dbApps)) {
                        isAuthoritativeDbSuccess = true
                        applications = dbApps

                        // If rows exist, enrich with live job details from Supabase jobs table
                        if (applications.length > 0) {
                            const jobIds = [...new Set(applications.map(a => a.job_id).filter(Boolean))]
                            let jobsMap = {}
                            if (jobIds.length > 0) {
                                const { data: dbJobs } = await supabase.from('jobs').select('*').in('id', jobIds)
                                if (dbJobs) {
                                    dbJobs.forEach(j => { jobsMap[j.id] = j })
                                }
                            }

                            applications = applications.map(app => {
                                const job = jobsMap[app.job_id] || app.job || null
                                return {
                                    ...app,
                                    id: app.id || app._id,
                                    _id: app.id || app._id,
                                    createdAt: app.created_at || app.createdAt,
                                    job: job ? {
                                        id: job.id,
                                        _id: job.id,
                                        title: job.title || 'Job Position',
                                        company: job.company || job.company_name || 'NextKinLife Partner',
                                        location: job.location || job.city || 'Remote',
                                        type: job.employment_type || job.job_type || 'Full-time',
                                        employment_type: job.employment_type || job.job_type || 'Full-time',
                                        work_style: job.work_style || 'On-site',
                                        workStyle: job.work_style || 'On-site'
                                    } : null
                                }
                            })
                        }
                    }
                } catch (err) {
                    console.warn('job_applications table query fallback:', err)
                }

                // 2. If job_applications table does not exist, query user profile metadata and validate against live jobs table
                if (!isAuthoritativeDbSuccess) {
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUserId).maybeSingle()
                    let profileMeta = {}
                    if (profile?.street_address && (profile.street_address.startsWith('{') || profile.street_address.startsWith('['))) {
                        try { profileMeta = JSON.parse(profile.street_address) } catch {}
                    }
                    applications = Array.isArray(profileMeta.job_applications) ? profileMeta.job_applications : []
                }

                // 3. Verify applications against live Supabase jobs table: if jobs were removed from Supabase, prune them!
                try {
                    const { data: liveJobs, error: liveJobsErr } = await supabase.from('jobs').select('id')
                    if (!liveJobsErr && Array.isArray(liveJobs)) {
                        const validJobIdSet = new Set(liveJobs.map(j => String(j.id)))
                        // Preserve all user applications even if job is archived or external
                        applications = applications.filter(Boolean);
                    }
                } catch (jErr) {
                    console.warn('Live jobs validation note:', jErr)
                }

                // Deduplicate applications
                const seenJobIds = new Set()
                const uniqueApplications = []
                for (const app of applications) {
                    const jKey = String(app.job_id || app.jobId || app.job?.id || app.job?._id || app.id || app._id)
                    if (!seenJobIds.has(jKey)) {
                        seenJobIds.add(jKey)
                        uniqueApplications.push(app)
                    }
                }
                applications = uniqueApplications

                // Synchronize profile metadata and localStorage with the live state
                try {
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUserId).maybeSingle()
                    let profileMeta = {}
                    if (profile?.street_address && (profile.street_address.startsWith('{') || profile.street_address.startsWith('['))) {
                        try { profileMeta = JSON.parse(profile.street_address) } catch {}
                    }
                    profileMeta.job_applications = applications
                    await supabase.from('profiles').update({ street_address: JSON.stringify(profileMeta) }).eq('id', currentUserId)
                    localStorage.setItem(`nxt_job_applications_${currentUserId}`, JSON.stringify(applications))
                } catch {}

                return {
                    data: {
                        applications: applications,
                        data: applications,
                        count: applications.length,
                        total: applications.length,
                        page: parseInt(queryParams.page) || 1,
                        limit: parseInt(queryParams.limit) || 10,
                        totalPages: Math.ceil(applications.length / (parseInt(queryParams.limit) || 10)) || 1
                    }
                }
            }

            // 3. Create Job (Admin / Employer): POST career/create or POST jobs/create or POST jobs
            if ((cleanUrl === 'career/create' || cleanUrl === 'jobs/create' || cleanUrl === 'jobs') && method === 'POST') {
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'jobs') : { ...(body || {}) }
                payload.status = payload.status || 'Active'
                const clean = sanitizePayload(payload, JOB_COLUMNS)
                const { data, error } = await supabase.from('jobs').insert(clean).select().maybeSingle()
                if (error) throw error
                const formatted = formatJobRecord(data)
                return { data: { job: formatted, data: formatted, success: true } }
            }

            // 4. Get Single Job: GET career/jobs/:id or GET jobs/:id
            if ((cleanUrl.startsWith('career/jobs/') || cleanUrl.startsWith('jobs/')) && cleanUrl.split('/').length >= 2 && method === 'GET') {
                const jobId = cleanUrl.split('/').pop()
                if (jobId && jobId !== 'jobs' && jobId !== 'career') {
                    const { data } = await supabase.from('jobs').select('*').eq('id', jobId).maybeSingle()
                    const formatted = data ? formatJobRecord(data) : null
                    return { data: { job: formatted, data: formatted } }
                }
            }

            // 5. Get All Jobs: GET career/jobs or GET jobs
            let query = supabase.from('jobs').select('*').order('created_at', { ascending: false })
            const jobCountryParam = queryParams.country || queryParams.country_name || queryParams.countryName
            if (jobCountryParam && jobCountryParam.toLowerCase() !== 'all' && jobCountryParam.toLowerCase() !== 'global') {
                const norm = normalizeCountryName(jobCountryParam)
                if (norm === 'United States of America' || jobCountryParam.toLowerCase() === 'usa' || jobCountryParam.toLowerCase() === 'us' || jobCountryParam.toLowerCase() === 'united states') {
                    query = query.or('location.ilike.%United States%,location.ilike.%USA%,location.ilike.%US%,location.ilike.%America%')
                } else {
                    query = query.or(`location.ilike.%${jobCountryParam}%,location.ilike.%${norm}%`)
                }
            }
            const { data } = await query
            const formattedJobs = Array.isArray(data) ? data.map(formatJobRecord) : []
            return { data: { jobs: formattedJobs, data: formattedJobs, count: formattedJobs.length } }
        }
}

export function formatJobRecord(raw) {
    if (!raw || typeof raw !== 'object') return raw;

    // Parse JSON skills if stored as JSON string or object
    let parsedSkills = [];
    let structuredSkills = { primary: [], secondary: [], nice_to_have: [] };
    if (raw.skills) {
        if (typeof raw.skills === 'string') {
            try {
                const parsed = JSON.parse(raw.skills);
                if (Array.isArray(parsed)) {
                    parsedSkills = parsed;
                } else if (parsed && typeof parsed === 'object') {
                    structuredSkills = { ...structuredSkills, ...parsed };
                    parsedSkills = [
                        ...(Array.isArray(parsed.primary) ? parsed.primary : []),
                        ...(Array.isArray(parsed.secondary) ? parsed.secondary : []),
                        ...(Array.isArray(parsed.nice_to_have) ? parsed.nice_to_have : [])
                    ];
                }
            } catch {
                parsedSkills = raw.skills.split(',').map(s => s.trim()).filter(Boolean);
            }
        } else if (Array.isArray(raw.skills)) {
            parsedSkills = raw.skills;
        } else if (raw.skills && typeof raw.skills === 'object') {
            structuredSkills = { ...structuredSkills, ...raw.skills };
            parsedSkills = [
                ...(Array.isArray(raw.skills.primary) ? raw.skills.primary : []),
                ...(Array.isArray(raw.skills.secondary) ? raw.skills.secondary : []),
                ...(Array.isArray(raw.skills.nice_to_have) ? raw.skills.nice_to_have : [])
            ];
        }
    }

    // Helper for array fields (requirements, responsibilities, benefits, preferred_skills)
    const parseArrayField = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
            try {
                const parsed = JSON.parse(val);
                if (Array.isArray(parsed)) return parsed;
            } catch {}
            return val.split('\n').map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
        }
        return [];
    };

    // Visa status array
    let parsedVisa = [];
    const rawVisa = raw.visa_status || raw.visaStatus || raw.work_authorization || '';
    if (Array.isArray(rawVisa)) {
        parsedVisa = rawVisa;
    } else if (typeof rawVisa === 'string' && rawVisa.trim()) {
        parsedVisa = rawVisa.split(/[,/]/).map(v => v.trim()).filter(Boolean);
    }

    // Salary formatting
    const currency = raw.currency || raw.currencySymbol || '$';
    const payMin = raw.salary_min ?? raw.pay_min ?? raw.payMin ?? null;
    const payMax = raw.salary_max ?? raw.pay_max ?? raw.payMax ?? null;
    const payType = raw.pay_type || raw.payType || 'hourly';
    let formattedSalary = raw.salary_range || raw.salaryRange || raw.salary || '';
    if (!formattedSalary && (payMin !== null || payMax !== null)) {
        const symbol = currency === 'USD' ? '$' : (currency === 'INR' ? '₹' : (currency === 'EUR' ? '€' : (currency === 'GBP' ? '£' : currency)));
        const unit = String(payType).toLowerCase().includes('hr') || String(payType).toLowerCase().includes('hour') ? '/ hr' : '/ yr';
        if (payMin && payMax) {
            formattedSalary = `${symbol}${payMin} - ${symbol}${payMax} ${unit}`;
        } else if (payMin) {
            formattedSalary = `${symbol}${payMin}+ ${unit}`;
        } else if (payMax) {
            formattedSalary = `Up to ${symbol}${payMax} ${unit}`;
        }
    }
    if (!formattedSalary) {
        formattedSalary = 'Competitive';
    }

    const title = raw.title || raw.job_title || 'Position';
    const company = raw.company || raw.company_name || 'NextKinLife LLC';
    const clientName = raw.client_name || raw.clientName || 'N/A';
    const vendorName = raw.vendor_name || raw.vendorName || company;
    const department = raw.department || raw.category || 'Engineering';
    const workStyle = raw.work_style || raw.workplace_type || raw.workMode || 'remote';
    const location = raw.location || raw.country || 'United States of America';
    const state = raw.state || raw.state_name || '';
    const city = raw.city || '';
    const positionType = raw.employment_type || raw.position_type || raw.job_type || 'Contract';
    const duration = raw.contract_duration || raw.duration || '12+ Months';
    const startDate = raw.start_date || raw.startDate || 'Immediate';
    const experience = raw.experience_level || raw.experience || '8+ Years';

    return {
        ...raw,
        id: raw.id || raw._id,
        _id: raw.id || raw._id,
        title,
        job_title: title,
        company,
        company_name: company,
        client_name: clientName,
        clientName,
        vendor_name: vendorName,
        vendorName,
        department,
        category: department,
        work_style: workStyle,
        workplace_type: workStyle,
        workMode: workStyle,
        workStyle,
        location,
        country: location,
        state,
        state_name: state,
        city,
        employment_type: positionType,
        position_type: positionType,
        job_type: positionType,
        positionType,
        type: positionType,
        contract_duration: duration,
        duration,
        start_date: startDate,
        startDate,
        experience_level: experience,
        experience,
        visa_status: parsedVisa,
        visaStatus: parsedVisa,
        pay_type: payType,
        payType,
        salary_range: formattedSalary,
        salaryRange: formattedSalary,
        salary: formattedSalary,
        salary_min: payMin,
        pay_min: payMin,
        payMin,
        salary_max: payMax,
        pay_max: payMax,
        payMax,
        currency,
        currencySymbol: currency,
        description: raw.description || '',
        requirements: parseArrayField(raw.requirements),
        responsibilities: parseArrayField(raw.responsibilities),
        benefits: parseArrayField(raw.benefits),
        preferred_skills: parseArrayField(raw.preferred_skills),
        skills: parsedSkills,
        structured_skills: structuredSkills,
        recruiter_name: raw.recruiter_name || raw.recruiterName || '',
        recruiterName: raw.recruiter_name || raw.recruiterName || '',
        recruiter_email: raw.recruiter_email || raw.recruiterEmail || '',
        recruiterEmail: raw.recruiter_email || raw.recruiterEmail || '',
        recruiter_phone: raw.recruiter_phone || raw.recruiterPhone || '',
        recruiterPhone: raw.recruiter_phone || raw.recruiterPhone || '',
        recruiter_linkedin: raw.recruiter_linkedin || raw.recruiterLinkedin || '',
        recruiterLinkedin: raw.recruiter_linkedin || raw.recruiterLinkedin || '',
        company_linkedin: raw.company_linkedin || raw.companyLinkedin || '',
        companyLinkedin: raw.company_linkedin || raw.companyLinkedin || '',
        status: raw.status || 'Active',
        created_at: raw.created_at || new Date().toISOString(),
        updated_at: raw.updated_at || new Date().toISOString(),
        postedDate: raw.created_at || new Date().toISOString()
    };
}
