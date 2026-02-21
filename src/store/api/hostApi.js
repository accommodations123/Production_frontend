import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.PROD
    ? "https://api.nextkinlife.live"
    : "/api";

const rawBase = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
        const countryData = localStorage.getItem("selectedCountry");

        // If the query already provided a specific X-Country header (e.g. for events which prefer code), do not override it.
        if (headers.has("X-Country")) {
            return headers;
        }

        if (countryData) {
            try {
                const country = JSON.parse(countryData);
                if (country?.name) {
                    headers.set("X-Country", country.name);
                } else if (country?.code) {
                    headers.set("X-Country", country.code);
                }
            } catch (e) {
                console.error("Error parsing selectedCountry for header", e);
            }
        }

        return headers;
    },
})

const baseQueryWithLogger = async (args, api, extraOptions) => {
    try {
        const result = await rawBase(args, api, extraOptions)

        if (result.error) {
            const status = result.error.status;
            const url = String(args.url || args);

            // Silently ignore expected errors
            const isExpected =
                status === 401 ||                                          // Not logged in yet
                status === 403 ||                                          // Forbidden
                (status === 404 && url.includes('host/get')) ||            // No host profile
                (status === 400 && (url.includes('/join') || url.includes('/leave'))) ||  // Already member
                (status === 400 && url.includes('my-events'));             // No events

            if (!isExpected) {
                console.error(`⬅️ RTK Request Error [${status}] on ${url}:`, result.error);
            }

            // Sync localStorage on auth errors
            if (status === 401 || status === 403) {
                localStorage.removeItem("user");
            }
        }
        return result
    } catch (err) {
        console.error("❌ RTK baseQuery fatal error", err)
        return { error: { status: 'CUSTOM_ERROR', error: err.message } }
    }
}

export const hostApi = createApi({
    reducerPath: "hostApi",
    baseQuery: baseQueryWithLogger,
    tagTypes: ["Property", "Host", "Event", "Community", "BuySell", "Review", "Job", "Trips", "Match", "Notification", "Wishlist"],
    endpoints: (builder) => ({
        saveHost: builder.mutation({
            query: (hostData) => ({
                url: "host/save",
                method: "POST",
                body: hostData,
                credentials: "include"
            }),
            invalidatesTags: ["Host"],
        }),
        updateHost: builder.mutation({
            query: ({ hostId, data }) => {
                const isFormData =
                    typeof FormData !== "undefined" && data instanceof FormData;

                return {
                    url: `host/update/${hostId}`,
                    method: "PUT",
                    body: data,
                    credentials: "include"
                };
            },
            // Force refetch after successful update
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // Refetch the host profile
                    dispatch(hostApi.util.invalidateTags(['Host']));
                } catch (error) {
                    console.error('Update failed:', error);
                }
            },
            invalidatesTags: ["Host"],
        }),



        getHostProfile: builder.query({
            query: () => "host/get",
            providesTags: ["Host"],
            transformResponse: (response) => response?.host || response?.data || response,
        }),

        getApprovedHostDetails: builder.query({
            query: (country) => ({
                url: "admin/approved/approved-host-details",
                params: country ? { country } : undefined
            }),
            transformResponse: (response) => response?.data || response?.hosts || response || [],
        }),

        getApprovedProperties: builder.query({
            query: (country) => ({
                url: "property/approved",
                params: country ? { country } : undefined
            }),
            providesTags: ["Property"],
            transformResponse: (response) => {
                const items = response?.properties || response?.data?.properties || response?.data || response || [];
                return Array.isArray(items) ? items : [];
            },
        }),

        getAllProperties: builder.query({
            query: (params) => ({
                url: "property/all",
                params
            }),
            providesTags: ["Property"],
            transformResponse: (response) => {
                // Handle paginated response structure from getAllPropertiesWithHosts
                const items = response?.data || response?.properties || response || [];
                return Array.isArray(items) ? items : [];
            },
        }),

        getMyListings: builder.query({
            query: () => ({
                url: "property/my-listings",
                headers: { 'Cache-Control': 'no-cache' }
            }),
            providesTags: (result) =>
                result && Array.isArray(result)
                    ? [...result.map(({ id, _id }) => ({ type: "Property", id: _id || id })), { type: "Property", id: "LIST" }]
                    : [{ type: "Property", id: "LIST" }],
            transformResponse: (response) => {
                let results = response?.data?.properties || response?.properties || response?.listings || response?.data || response || [];
                return Array.isArray(results) ? results : [];
            },
        }),

        getPropertyById: builder.query({
            query: (id) => {
                const countryData = localStorage.getItem("selectedCountry");
                let countryName = "";
                if (countryData) {
                    try {
                        const c = JSON.parse(countryData);
                        if (c.name) countryName = c.name;
                    } catch (e) { }
                }
                return {
                    url: `property/${id}`,
                    params: countryName ? { country: countryName } : undefined,
                    headers: countryName ? { "X-Country": countryName } : undefined
                };
            },
            transformResponse: (response) => {
                const property = response?.property || response?.data?.property || response?.data || response;
                const host = response?.host || response?.data?.host || {};
                return { property, host };
            },
        }),

        getApprovedEvents: builder.query({
            query: (arg) => {
                // Support both string (countryCode) and object ({ code, limit })
                let code = typeof arg === 'string' ? arg : arg?.code;
                const limit = typeof arg === 'object' ? arg?.limit : undefined;

                // Events prefer country CODE (e.g. "IN")
                if (!code) {
                    const countryData = localStorage.getItem("selectedCountry");
                    if (countryData) {
                        try {
                            const c = JSON.parse(countryData);
                            code = c.code || "IN";
                        } catch (e) { console.error(e); }
                    }
                    if (!code) code = "IN";
                }

                return {
                    url: "events/approved",
                    headers: { "X-Country": code },
                    params: limit ? { limit } : undefined
                };
            },
            providesTags: ["Event"],
            transformResponse: (response) => {
                const items = response?.data?.events || response?.events || response?.data || response || [];
                return Array.isArray(items) ? items : [];
            }
        }),

        getEventById: builder.query({
            query: (id) => {
                const countryData = localStorage.getItem("selectedCountry");
                let countryCode = "IN";
                if (countryData) {
                    try {
                        const c = JSON.parse(countryData);
                        if (c.code) countryCode = c.code;
                    } catch (e) { }
                }
                return {
                    url: `events/${id}`,
                    headers: { "X-Country": countryCode }
                };
            },
            transformResponse: (response) => {
                const event = response?.event || response?.data || response;
                // Merge is_registered if it exists at the root level but not in the event object
                if (response?.is_registered !== undefined && event && typeof event === 'object') {
                    return { ...event, is_registered: response.is_registered };
                }
                return event;
            },
            providesTags: (result, error, id) => [{ type: "Event", id }],
        }),

        uploadFile: builder.mutation({
            query: (formData) => ({
                url: "upload",
                method: "POST",
                body: formData,
                credentials: "include"
            }),
        }),

        createPropertyDraft: builder.mutation({
            query: (data) => ({
                url: "property/create-draft",
                method: "POST",
                body: data,
                credentials: "include"
            }),
        }),

        updatePropertyBasic: builder.mutation({
            query: ({ id, data }) => ({
                url: `property/basic-info/${id}`,
                method: "PUT",
                body: data,
                credentials: "include"
            }),
        }),

        updatePropertyAddress: builder.mutation({
            query: ({ id, data }) => ({
                url: `property/address/${id}`,
                method: "PUT",
                body: data,
                credentials: "include"
            }),
        }),

        updatePropertyPricing: builder.mutation({
            query: ({ id, data }) => ({
                url: `property/pricing/${id}`,
                method: "PUT",
                body: data,
                credentials: "include"
            }),
        }),

        updatePropertyAmenities: builder.mutation({
            query: ({ id, amenities }) => ({
                url: `property/amenities/${id}`,
                method: "PUT",
                body: { amenities },
                credentials: "include"
            }),
        }),

        updatePropertyRules: builder.mutation({
            query: ({ id, rules }) => ({
                url: `property/rules/${id}`,
                method: "PUT",
                body: { rules },
                credentials: "include"
            }),
        }),

        updatePropertyMedia: builder.mutation({
            query: ({ id, formData }) => ({
                url: `property/media/${id}`,
                method: "PUT",
                body: formData,
                credentials: "include"
            }),
        }),

        updatePropertyVideo: builder.mutation({
            query: ({ id, formData }) => ({
                url: `property/media/video/${id}`,
                method: "PUT",
                body: formData,
                credentials: "include"
            }),
        }),



        submitProperty: builder.mutation({
            query: (id) => ({
                url: `property/submit/${id}`,
                method: "PUT",
                credentials: "include"
            }),
            invalidatesTags: (result, error, id) => [{ type: "Property", id: "LIST" }, { type: "Property", id: id }, "Property"],
        }),

        deleteProperty: builder.mutation({
            query: ({ id, reason }) => ({
                url: `property/delete/${id}`,
                method: "DELETE",
                headers: { "Accept": "application/json", "Content-Type": "application/json" },
                body: { reason: reason || "User deleted from dashboard" }
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Property", id: "LIST" }, { type: "Property", id: id }, "Property"],
        }),

        createBuySell: builder.mutation({
            query: (data) => ({ url: "buy-sell/create", method: "POST", body: data }),
            invalidatesTags: ["BuySell"],
        }),

        getBuySellListings: builder.query({
            query: ({ country, state, city, zip_code, category, minPrice, maxPrice, search, limit } = {}) => {
                const headers = {};
                if (country) headers["X-Country"] = country;
                if (state) headers["X-State"] = state;
                if (city) headers["X-City"] = city;
                if (zip_code) headers["X-Zip-Code"] = zip_code;

                const params = {};
                if (category) params.category = category;
                if (minPrice) params.minPrice = minPrice;
                if (maxPrice) params.maxPrice = maxPrice;
                if (search) params.search = search;
                if (limit) params.limit = limit;

                return {
                    url: "buy-sell/get",
                    headers,
                    params
                };
            },
            providesTags: ["BuySell"],
            transformResponse: (response) => {
                const res = response?.listings || response?.data?.listings || response?.data || response;
                return Array.isArray(res) ? res : (res?.listings || []);
            },
        }),

        getBuySellById: builder.query({
            query: (id) => `buy-sell/get/${id}`,
            transformResponse: (response) => response?.listing || response?.data?.listing || response?.data || response,
        }),

        getMyBuySellListings: builder.query({
            query: () => "buy-sell/my-buy-sell",
            providesTags: ["BuySell"],
            transformResponse: (response) => {
                const res = response?.listings || response?.data?.listings || response?.data || response;
                return Array.isArray(res) ? res : (res?.listings || []);
            },
        }),

        updateBuySell: builder.mutation({
            query: ({ id, data }) => ({ url: `buy-sell/update/${id}`, method: "PUT", body: data }),
            invalidatesTags: (result, error, { id }) => [{ type: "BuySell", id }],
        }),

        markBuySellAsSold: builder.mutation({
            query: (id) => ({ url: `buy-sell/buy-sell/${id}/sold`, method: "PATCH" }),
            invalidatesTags: (result, error, id) => [{ type: "BuySell", id }],
        }),

        deleteBuySell: builder.mutation({
            query: (id) => ({ url: `buy-sell/delete/${id}`, method: "DELETE" }),
            invalidatesTags: ["BuySell"],
        }),

        getCommunities: builder.query({
            query: (arg) => {
                const country = typeof arg === 'string' ? arg : arg?.country;
                const limit = typeof arg === 'object' ? arg?.limit : undefined;

                const params = {};
                if (country) params.country = country;
                if (limit) params.limit = limit;

                return {
                    url: "community",
                    params: Object.keys(params).length > 0 ? params : undefined
                };
            },
            providesTags: ["Community"],
            transformResponse: (response) => {
                const items = response?.communities || response?.data?.communities || response?.data || response || [];
                return Array.isArray(items) ? items : [];
            },
        }),

        getCommunityById: builder.query({
            query: (id) => `community/${id}`,
            providesTags: (result, error, id) => [{ type: "Community", id }],
            transformResponse: (response) => {
                const community = response?.community || response?.data || response;
                // Merge is_member/isJoined if it exists at the root level but not in the community object
                if (community && typeof community === 'object') {
                    if (response?.is_member !== undefined && community.is_member === undefined) {
                        return { ...community, is_member: response.is_member };
                    }
                    if (response?.isJoined !== undefined && community.isJoined === undefined) {
                        return { ...community, isJoined: response.isJoined };
                    }
                }
                return community;
            },
        }),

        joinCommunity: builder.mutation({
            query: (id) => ({ url: `community/${id}/join`, method: "POST" }),
            invalidatesTags: (result, error, id) => [{ type: "Community", id }],
        }),

        leaveCommunity: builder.mutation({
            query: (id) => ({ url: `community/${id}/leave`, method: "POST" }),
            invalidatesTags: (result, error, id) => [{ type: "Community", id }],
        }),

        createCommunity: builder.mutation({
            query: (data) => ({ url: "community", method: "POST", body: data }),
            invalidatesTags: ["Community"],
        }),

        updateCommunity: builder.mutation({
            query: ({ id, data }) => ({ url: `community/${id}/update`, method: "PUT", body: data }),
            invalidatesTags: (result, error, { id }) => [{ type: "Community", id }],
        }),

        getCommunityMembers: builder.query({
            query: ({ id, page = 1, search = "" }) => ({
                url: `community/${id}/members`,
                params: { page, search }
            }),
            providesTags: (result, error, { id }) => [{ type: "Community", id: `MEMBERS-${id}` }],
            transformResponse: (response) => {
                const members = response?.members || response?.data || [];
                return {
                    members: Array.isArray(members) ? members : [],
                    totalPages: response?.totalPages || 1,
                    currentPage: response?.currentPage || 1,
                    totalMembers: response?.totalMembers || 0
                };
            }
        }),
        getCommunityHostMembers: builder.query({
            query: ({ id, page = 1, limit = 10 }) => ({
                url: `community/${id}/hosts`,
                params: { page, limit }
            }),
            providesTags: (result, error, { id }) => [{ type: "Community", id: `HOSTS-${id}` }],
            transformResponse: (response) => {
                const hosts = response?.hosts || response?.data || [];
                return {
                    hosts: Array.isArray(hosts) ? hosts : [],
                    count: response?.count || 0,
                    page: response?.page || 1
                };
            }
        }),
        getMyEvents: builder.query({
            query: () => {
                const countryData = localStorage.getItem("selectedCountry");
                let countryCode = "IN";
                if (countryData) {
                    try {
                        const c = JSON.parse(countryData);
                        if (c.code) countryCode = c.code;
                    } catch (e) { }
                }
                return {
                    url: "events/host/my-events",
                    headers: { "X-Country": countryCode }
                }
            },
            providesTags: ["Event"],
            transformResponse: (response) => {
                const results = response?.data?.events || response?.events || response || [];
                return Array.isArray(results) ? results : [];
            },
        }),
        deleteEvent: builder.mutation({
            query: (id) => ({
                url: `events/delete/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Event"],
        }),

        // Community Feed & Resources
        createCommunityPost: builder.mutation({
            query: ({ id, data }) => ({
                url: `community/communities/${id}/posts`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Community", id: `FEED-${id}` }],
        }),

        getCommunityFeed: builder.query({
            query: ({ id, page = 1 }) => `community/communities/${id}/posts?page=${page}`,
            providesTags: (result, error, { id }) => [{ type: "Community", id: `FEED-${id}` }],
            transformResponse: (response) => {
                const posts = response?.posts || response?.data?.posts || response?.data || [];
                return {
                    posts: Array.isArray(posts) ? posts : [],
                    totalPages: response?.totalPages || 1,
                    currentPage: response?.currentPage || 1,
                    totalPosts: response?.totalPosts || 0
                };
            },
        }),

        deleteCommunityPost: builder.mutation({
            query: (postId) => ({
                url: `community/communities/posts/${postId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, arg) => ["Community"], // Broad invalidation or specific if we knew community ID
        }),

        addCommunityResource: builder.mutation({
            query: ({ id, data }) => ({
                url: `community/communities/${id}/resources`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Community", id: `RESOURCES-${id}` }],
        }),

        getCommunityResources: builder.query({
            query: (id) => `community/communities/${id}/resources`,
            providesTags: (result, error, id) => [{ type: "Community", id: `RESOURCES-${id}` }],
            transformResponse: (response) => response?.resources || [],
        }),

        deleteCommunityResource: builder.mutation({
            query: (resourceId) => ({
                url: `community/communities/resources/${resourceId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Community"],
        }),
        // Reviews
        getEventReviews: builder.query({
            query: (id) => `events/reviews/${id}/reviews`,
            providesTags: (result, error, id) => [{ type: "Review", id }],
            transformResponse: (response) => {
                const results = response?.reviews || response?.data || response || [];
                return Array.isArray(results) ? results : [];
            }
        }),

        addEventReview: builder.mutation({
            query: ({ id, data }) => ({
                url: `events/reviews/${id}/reviews`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Review", id }, { type: "Event", id }],
        }),

        getEventRating: builder.query({
            query: (id) => `events/reviews/${id}/rating`,
            providesTags: (result, error, id) => [{ type: "Review", id }],
        }),

        hideEventReview: builder.mutation({
            query: (id) => ({
                url: `events/reviews/reviews/${id}/hide`,
                method: "PATCH",
            }),
            invalidatesTags: (result, error, id) => [{ type: "Review", id }, { type: "Event", id }],
        }),

        joinEvent: builder.mutation({
            query: (id) => ({
                url: `events/${id}/join`,
                method: "POST",
            }),
            invalidatesTags: (result, error, id) => [{ type: "Event", id }],
        }),

        leaveEvent: builder.mutation({
            query: (id) => ({
                url: `events/${id}/leave`,
                method: "POST",
            }),
            invalidatesTags: (result, error, id) => [{ type: "Event", id }],
        }),
        getJobs: builder.query({
            query: () => "carrer/jobs",
            providesTags: ["Job"],
            transformResponse: (response) => {
                const jobs = response?.jobs || response?.data || response || [];
                if (!Array.isArray(jobs)) return [];

                // Helper function defined BEFORE use
                const getTimeAgo = (date) => {
                    if (!date) return "Recently";
                    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
                    if (seconds < 60) return "Just now";
                    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
                    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
                    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
                    return new Date(date).toLocaleDateString();
                };

                // Helper to normalize work_style values
                const normalizeWorkStyle = (val) => {
                    if (!val) return "Not specified";
                    const map = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site" };
                    return map[val.toLowerCase()] || val;
                };

                // Helper to normalize employment_type values
                const normalizeType = (val) => {
                    if (!val) return "Full-time";
                    const map = { full_time: "Full-time", part_time: "Part-time", contract: "Contract", internship: "Internship" };
                    return map[val.toLowerCase()] || val;
                };

                // Helper to normalize experience_level values
                const normalizeExperience = (val) => {
                    if (!val) return "Not specified";
                    const map = { junior: "Entry Level", mid: "2-4 years", senior: "5+ years", lead: "7+ years" };
                    return map[val.toLowerCase()] || val;
                };

                return jobs.map(job => ({
                    ...job,
                    id: job.id || job._id,
                    title: job.title || "Untitled Position",
                    company: job.company || "Company",
                    description: job.description || "",
                    department: job.department || "General",
                    location: job.location || "Remote",
                    experience: normalizeExperience(job.experience_level),
                    type: normalizeType(job.employment_type),
                    workStyle: normalizeWorkStyle(job.work_style),
                    salary: job.salary_range || job.salary || "Competitive",
                    postedDate: job.createdAt || job.created_at || new Date().toISOString(),
                    posted: getTimeAgo(job.createdAt || job.created_at),
                    applicants: job.applications_count || job.applicants || 0,
                    responsibilities: job.responsibilities || [],
                    requirements: job.requirements || [],
                    benefits: job.benefits || [],
                    skills: job.skills || [],
                    featured: job.featured || false,
                    isNew: (new Date() - new Date(job.createdAt || job.created_at || 0)) < 7 * 24 * 60 * 60 * 1000,
                }));
            },
        }),
        getJobById: builder.query({
            query: (id) => `carrer/jobs/${id}`,
            providesTags: (result, error, id) => [{ type: "Job", id }],
            transformResponse: (response) => {
                const job = response?.job || response?.data || response;
                if (!job) return null;
                return {
                    ...job,
                    id: job.id || job._id,
                    experience: job.experience_level || job.experience,
                    type: job.employment_type || job.type,
                    workStyle: job.work_style || job.workStyle,
                    salary: job.salary_range || job.salary,
                    postedDate: job.createdAt || job.postedDate,
                    applicants: job.applications_count || job.applicants,
                    // Ensure arrays are present
                    responsibilities: job.responsibilities || [],
                    requirements: job.requirements || [],
                    benefits: job.benefits || [],
                };
            },
        }),
        applyForJob: builder.mutation({
            query: (formData) => ({
                url: "carrer/applications",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["MyApplications", "Job"],
        }),
        getMyApplications: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => `carrer/applications/me?page=${page}&limit=${limit}`,
            providesTags: ["MyApplications"],
            transformResponse: (response) => {
                const applications = response?.applications || response?.data || [];
                return {
                    applications: applications.map(app => ({
                        ...app,
                        id: app.id || app._id,
                        status: app.status,
                        createdAt: app.created_at || app.createdAt,
                        job: app.job ? {
                            id: app.job.id || app.job._id,
                            title: app.job.title,
                            company: app.job.company,
                            location: app.job.location,
                            type: app.job.employment_type,
                            workStyle: app.job.work_style,
                        } : null,
                    })),
                    page: response?.page || 1,
                    limit: response?.limit || 10,
                };
            },
        }),

        // Travel Endpoints
        getMyTrips: builder.query({
            query: () => "travel/trips/me",
            providesTags: ["Trips"],
        }),

        getPublicTrips: builder.query({
            query: (params) => ({
                url: "travel/trips",
                params
            }),
            providesTags: ["Trips"],
        }),

        searchTrips: builder.query({
            query: (params) => ({
                url: "travel/trips/search",
                params
            }),
        }),

        createTrip: builder.mutation({
            query: (data) => ({
                url: "travel/trips",
                method: "POST",
                body: data
            }),
            invalidatesTags: ["Trips"]
        }),

        getMatches: builder.query({
            query: () => "travel/matches/received",
            providesTags: ["Match"],
        }),

        travelMatchAction: builder.mutation({
            query: (data) => ({
                url: "travel/matches/action",
                method: "POST",
                body: data
            }),
            invalidatesTags: ["Match", "Trips"]
        }),

        // Notifications
        getNotifications: builder.query({
            query: () => "notification/",
            providesTags: ["Notification"],
            transformResponse: (response) => {
                const items = response?.notifications || response?.data || response || [];
                return Array.isArray(items) ? items : [];
            },
        }),

        markNotificationAsRead: builder.mutation({
            query: (id) => ({
                url: `notification/${id}/read`,
                method: "PATCH",
            }),
            invalidatesTags: ["Notification"],
        }),

        markAllNotificationsAsRead: builder.mutation({
            query: () => ({
                url: "notification/read-all",
                method: "PATCH",
            }),
            invalidatesTags: ["Notification"],
        }),

        // Delete single notification
        deleteNotification: builder.mutation({
            query: (id) => ({
                url: `notification/notifications/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Notification"],
        }),

        // Delete all notifications
        deleteAllNotifications: builder.mutation({
            query: () => ({
                url: "notification/notifications",
                method: "DELETE",
            }),
            invalidatesTags: ["Notification"],
        }),

        // Wishlist
        getWishlist: builder.query({
            query: ({ page = 1, limit = 20, type } = {}) => ({
                url: "wishlist",
                params: { page, limit, type }
            }),
            providesTags: ["Wishlist"],
            transformResponse: (response) => response
        }),

        checkWishlistStatus: builder.query({
            query: ({ type, id }) => `wishlist/check/${type}/${id}`,
            providesTags: (result, error, { type, id }) => [{ type: "Wishlist", id: `${type}-${id}` }],
        }),

        addToWishlist: builder.mutation({
            query: (data) => ({
                url: "wishlist/add",
                method: "POST",
                body: { item_type: data.type, item_id: Number(data.id) }
            }),
            invalidatesTags: (result, error, { type, id }) => [
                "Wishlist",
                { type: "Wishlist", id: `${type}-${id}` }
            ],
        }),

        removeFromWishlist: builder.mutation({
            query: ({ type, id }) => ({
                url: `wishlist/${type}/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: (result, error, { type, id }) => [
                "Wishlist",
                { type: "Wishlist", id: `${type}-${id}` }
            ],
        }),

        toggleWishlist: builder.mutation({
            query: (data) => ({
                url: "wishlist/toggle",
                method: "POST",
                body: { item_type: data.type, item_id: Number(data.id) }
            }),
            invalidatesTags: (result, error, { type, id }) => [
                "Wishlist",
                { type: "Wishlist", id: `${type}-${id}` }
            ],
        }),
    }),
});

export const {
    useSaveHostMutation,
    useSendOtpMutation,
    useVerifyOtpMutation,
    useGetHostProfileQuery,
    useGetApprovedHostDetailsQuery,
    useGetApprovedPropertiesQuery,
    useGetAllPropertiesQuery,
    useGetMyListingsQuery,
    useGetPropertyByIdQuery,
    useGetApprovedEventsQuery,
    useGetEventByIdQuery,
    useUploadFileMutation,
    useCreatePropertyDraftMutation,
    useUpdatePropertyBasicMutation,
    useUpdatePropertyAddressMutation,
    useUpdatePropertyPricingMutation,
    useUpdatePropertyAmenitiesMutation,
    useUpdatePropertyRulesMutation,
    useUpdatePropertyMediaMutation,
    useUpdatePropertyVideoMutation,
    useSubmitPropertyMutation,
    useDeletePropertyMutation,
    useCreateBuySellMutation,
    useGetBuySellListingsQuery,
    useGetBuySellByIdQuery,
    useGetMyBuySellListingsQuery,
    useUpdateBuySellMutation,
    useMarkBuySellAsSoldMutation,
    useDeleteBuySellMutation,
    useGetCommunitiesQuery,
    useGetCommunityByIdQuery,
    useJoinCommunityMutation,
    useLeaveCommunityMutation,
    useCreateCommunityMutation,
    useUpdateCommunityMutation,
    useGetCommunityMembersQuery,
    useGetCommunityHostMembersQuery,
    useGetMyEventsQuery,
    useDeleteEventMutation,
    useCreateCommunityPostMutation,
    useGetCommunityFeedQuery,
    useDeleteCommunityPostMutation,
    useAddCommunityResourceMutation,
    useGetCommunityResourcesQuery,
    useDeleteCommunityResourceMutation,
    useUpdateHostMutation,
    useGetEventReviewsQuery,
    useAddEventReviewMutation,
    useGetEventRatingQuery,
    useHideEventReviewMutation,
    useJoinEventMutation,
    useLeaveEventMutation,
    useApplyForJobMutation,
    useGetJobsQuery,
    useGetJobByIdQuery,
    useGetMyTripsQuery,
    useGetPublicTripsQuery,
    useSearchTripsQuery,
    useLazySearchTripsQuery,
    useCreateTripMutation,
    useGetMatchesQuery,
    useTravelMatchActionMutation,
    useGetNotificationsQuery,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
    useDeleteNotificationMutation,
    useDeleteAllNotificationsMutation,
    useGetMyApplicationsQuery,
    useGetWishlistQuery,
    useCheckWishlistStatusQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
    useToggleWishlistMutation,
} = hostApi;