import { createApi } from "@reduxjs/toolkit/query/react";
import { COUNTRIES } from "@/lib/mock-data";
import { CLOUDFRONT_BASE } from "../../lib/imageUtils";
import { baseQueryWithAuth } from "@/store/baseQuery";

const getSymbolForLocation = (location) => {
    if (!location) return "$";
    const cleanLoc = location.toLowerCase().trim();
    const country = COUNTRIES.find(c => 
        c.name.toLowerCase().trim() === cleanLoc || 
        c.code.toLowerCase().trim() === cleanLoc
    );
    if (!country) return "$";
    const symbols = { INR: "₹", ZAR: "R", EUR: "€", GBP: "£", USD: "$" };
    return symbols[country.currency] || "$";
};

export const hostApi = createApi({
    reducerPath: "hostApi",
    baseQuery: baseQueryWithAuth,
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
            transformResponse: (response) => {
                const host = response?.host || response?.data || response;
                if (host && typeof host === 'object') {
                    const CLOUDFRONT = CLOUDFRONT_BASE;
                    const fixImage = (img) => {
                        if (img && typeof img === 'string' && !img.startsWith('http')) {
                            return `${CLOUDFRONT}${img.startsWith('/') ? img : `/${img}`}`;
                        }
                        return img;
                    };
                    if (host.profile_image) host.profile_image = fixImage(host.profile_image);
                    if (host.selfie_photo) host.selfie_photo = fixImage(host.selfie_photo);
                }
                return host;
            },
        }),

        getApprovedHostDetails: builder.query({
            query: (country) => ({
                url: "admin/approved/approved-host-details",
                params: country ? { country } : undefined
            }),
            transformResponse: (response) => {
                const hosts = response?.data || response?.hosts || response || [];
                const CLOUDFRONT = CLOUDFRONT_BASE;
                const fixImage = (img) => {
                    if (img && typeof img === 'string' && !img.startsWith('http')) {
                        return `${CLOUDFRONT}${img.startsWith('/') ? img : `/${img}`}`;
                    }
                    return img;
                };
                if (Array.isArray(hosts)) {
                    return hosts.map(h => {
                        const host = { ...h };
                        if (host.profile_image) host.profile_image = fixImage(host.profile_image);
                        if (host.selfie_photo) host.selfie_photo = fixImage(host.selfie_photo);
                        return host;
                    });
                }
                return hosts;
            },
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
                const CLOUDFRONT = CLOUDFRONT_BASE;
                const fixImage = (img) => {
                    if (img && typeof img === 'string' && !img.startsWith('http')) {
                        return `${CLOUDFRONT}${img.startsWith('/') ? img : `/${img}`}`;
                    }
                    return img;
                };
                if (host && typeof host === 'object') {
                    if (host.profile_image) host.profile_image = fixImage(host.profile_image);
                    if (host.selfie_photo) host.selfie_photo = fixImage(host.selfie_photo);
                    if (host.image) host.image = fixImage(host.image);
                    if (host.User && typeof host.User === 'object') {
                        if (host.User.profile_image) host.User.profile_image = fixImage(host.User.profile_image);
                        if (host.User.selfie_photo) host.User.selfie_photo = fixImage(host.User.selfie_photo);
                    }
                }
                return { property, host };
            },
        }),

        getApprovedEvents: builder.query({
            query: (arg) => {
                let countryCode = typeof arg === 'string' ? (arg.length === 2 ? arg : undefined) : arg?.code;
                let countryName = typeof arg === 'string' ? arg : arg?.name;

                if (!countryCode && !countryName) {
                    const countryData = localStorage.getItem("selectedCountry");
                    if (countryData) {
                        try {
                            const c = JSON.parse(countryData);
                            countryCode = c.code;
                            countryName = c.name;
                        } catch (e) { }
                    }
                }

                if (!countryCode && countryName) {
                    const found = COUNTRIES.find(c => c.name?.toLowerCase() === countryName?.toLowerCase() || c.code === countryName?.toUpperCase());
                    if (found) {
                        countryCode = found.code;
                        countryName = found.name;
                    }
                }

                const limit = typeof arg === 'object' ? arg?.limit : undefined;

                const params = {};
                if (limit) params.limit = limit;
                if (countryCode) params.country = countryCode;
                else if (countryName) params.country = countryName;

                const headerCountry = countryCode || countryName;

                return {
                    url: "events/approved",
                    headers: headerCountry ? { "X-Country": headerCountry, "X-Country-Code": countryCode || headerCountry } : undefined,
                    params
                };
            },
            providesTags: ["Event"],
            transformResponse: (response) => {
                let items = response?.data?.events || response?.events || response?.data?.results || response?.results || response?.data?.items || response?.data || response || [];
                if (!Array.isArray(items) && items && typeof items === 'object') {
                    if (Array.isArray(items.events)) items = items.events;
                    else if (Array.isArray(items.data)) items = items.data;
                    else if (Array.isArray(items.results)) items = items.results;
                    else if (Array.isArray(items.items)) items = items.items;
                    else items = [];
                }
                if (Array.isArray(items)) {
                    const CLOUDFRONT = CLOUDFRONT_BASE;
                    const fixImage = (img) => {
                        if (img && typeof img === 'string' && !img.startsWith('http')) {
                            return `${CLOUDFRONT}${img.startsWith('/') ? img : `/${img}`}`;
                        }
                        return img;
                    };
                    items.forEach(e => {
                        if (e.banner_image) e.banner_image = fixImage(e.banner_image);
                        if (e.image) e.image = fixImage(e.image);
                        if (Array.isArray(e.gallery_images)) {
                            e.gallery_images = e.gallery_images.map(fixImage);
                        }
                        const host = e.Host || e.host || {};
                        if (host.profile_image) host.profile_image = fixImage(host.profile_image);
                        if (host.selfie_photo) host.selfie_photo = fixImage(host.selfie_photo);
                        if (host.User && typeof host.User === 'object') {
                            if (host.User.profile_image) host.User.profile_image = fixImage(host.User.profile_image);
                        }
                        e.Host = host;
                    });
                    return items;
                }
                return [];
            }
        }),

        getEventById: builder.query({
            query: (id) => {
                const countryData = localStorage.getItem("selectedCountry");
                let countryName = "";
                if (countryData) {
                    try {
                        const c = JSON.parse(countryData);
                        countryName = c.name || c.code || "";
                    } catch (e) { }
                }
                return {
                    url: `events/${id}`,
                    headers: countryName ? { "X-Country": countryName } : undefined
                };
            },
            transformResponse: (response) => {
                let event = response?.event || response?.data?.event || response?.data || response;
                if (event && typeof event === 'object' && !event.title && event.event) {
                    event = event.event;
                }
                const CLOUDFRONT = CLOUDFRONT_BASE;
                const fixImage = (img) => {
                    if (img && typeof img === 'string' && !img.startsWith('http')) {
                        return `${CLOUDFRONT}${img.startsWith('/') ? img : `/${img}`}`;
                    }
                    return img;
                };
                if (event && typeof event === 'object') {
                    if (event.banner_image) event.banner_image = fixImage(event.banner_image);
                    if (event.image) event.image = fixImage(event.image);
                    if (Array.isArray(event.gallery_images)) {
                        event.gallery_images = event.gallery_images.map(fixImage);
                    }
                    const host = event.Host || event.host || {};
                    if (host.profile_image) host.profile_image = fixImage(host.profile_image);
                    if (host.selfie_photo) host.selfie_photo = fixImage(host.selfie_photo);
                    if (host.User && typeof host.User === 'object') {
                        if (host.User.profile_image) host.User.profile_image = fixImage(host.User.profile_image);
                    }
                    event.Host = host;
                }
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

                const params = {};
                if (country) params.country = country;
                if (state) params.state = state;
                if (city) params.city = city;
                if (zip_code) params.zip_code = zip_code;
                if (category) params.category = category;
                if (minPrice) params.minPrice = minPrice;
                if (maxPrice) params.maxPrice = maxPrice;
                if (search) params.search = search;
                if (limit) params.limit = limit;
                if (country) params.country = country;
                if (state) params.state = state;
                if (city) params.city = city;
                if (zip_code) params.zip_code = zip_code;

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

        getMyCommunities: builder.query({
            query: () => "community/me",
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

        createEvent: builder.mutation({
            query: (data) => ({ url: "events/create", method: "POST", body: data }),
            invalidatesTags: ["Event"],
        }),

        createCommunityContribution: builder.mutation({
            query: (data) => ({ url: "community/contributions", method: "POST", body: data }),
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
                let countryCode = "";
                if (countryData) {
                    try {
                        const c = JSON.parse(countryData);
                        countryCode = c.code || c.name || "";
                    } catch (e) { }
                }
                return {
                    url: "events/host/my-events",
                    headers: countryCode ? { "X-Country": countryCode } : undefined
                }
            },
            providesTags: ["Event"],
            transformResponse: (response) => {
                let results = response?.data?.events || response?.events || response?.data?.results || response?.results || response?.data?.items || response?.data || response || [];
                if (!Array.isArray(results) && results && typeof results === 'object') {
                    if (Array.isArray(results.events)) results = results.events;
                    else if (Array.isArray(results.data)) results = results.data;
                    else results = [];
                }
                if (Array.isArray(results)) {
                    const CLOUDFRONT = CLOUDFRONT_BASE;
                    const fixImage = (img) => {
                        if (img && typeof img === 'string' && !img.startsWith('http')) {
                            return `${CLOUDFRONT}${img.startsWith('/') ? img : `/${img}`}`;
                        }
                        return img;
                    };
                    results.forEach(e => {
                        if (e.banner_image) e.banner_image = fixImage(e.banner_image);
                        if (e.image) e.image = fixImage(e.image);
                        if (Array.isArray(e.gallery_images)) {
                            e.gallery_images = e.gallery_images.map(fixImage);
                        }
                    });
                    return results;
                }
                return [];
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
                formData: true,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Community", id: `FEED-${id}` }],
        }),

        getCommunityFeed: builder.query({
            query: ({ id, page = 1 }) => `community/communities/${id}/posts?page=${page}`,
            providesTags: (result, error, { id }) => [{ type: "Community", id: `FEED-${id}` }],
            transformResponse: (response) => {
                const CLOUDFRONT = CLOUDFRONT_BASE;
                const fixImage = (img) => {
                    if (img && typeof img === 'string' && !img.startsWith('http')) {
                        return `${CLOUDFRONT}${img.startsWith('/') ? img : `/${img}`}`;
                    }
                    return img;
                };

                const rawPosts = response?.posts || response?.data?.posts || response?.data || [];
                const posts = Array.isArray(rawPosts) ? rawPosts.map(post => {
                    const author = post.author || {};
                    const Host = author.Host || {};
                    const User = author.User || {};
                    const userObj = post.user || {};

                    // Ensure S3 URLs are fully resolved
                    if (author.profile_image) author.profile_image = fixImage(author.profile_image);
                    if (Host.profile_image) Host.profile_image = fixImage(Host.profile_image);
                    if (User.profile_image) User.profile_image = fixImage(User.profile_image);
                    if (author.image) author.image = fixImage(author.image);
                    if (author.selfie_photo) author.selfie_photo = fixImage(author.selfie_photo);
                    if (Host.selfie_photo) Host.selfie_photo = fixImage(Host.selfie_photo);
                    if (userObj.profile_image) userObj.profile_image = fixImage(userObj.profile_image);
                    if (userObj.selfie_photo) userObj.selfie_photo = fixImage(userObj.selfie_photo);

                    return {
                        ...post,
                        author: {
                            ...author,
                            Host: { ...Host },
                            User: { ...User }
                        },
                        user: { ...userObj }
                    };
                }) : [];

                return {
                    posts,
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
                formData: true,
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
            query: (params) => {
                if (typeof params === 'string') {
                    return params ? `career/jobs?country=${encodeURIComponent(params)}` : "career/jobs";
                }
                const parts = [];
                if (params) {
                    if (params.country) parts.push(`country=${encodeURIComponent(params.country)}`);
                    if (params.positionType) parts.push(`positionType=${encodeURIComponent(params.positionType)}`);
                    if (params.workMode) parts.push(`workMode=${encodeURIComponent(params.workMode)}`);
                    if (params.experience) parts.push(`experience=${encodeURIComponent(params.experience)}`);
                    if (params.state) parts.push(`state=${encodeURIComponent(params.state)}`);
                    if (params.city) parts.push(`city=${encodeURIComponent(params.city)}`);
                    if (params.payType) parts.push(`payType=${encodeURIComponent(params.payType)}`);
                    if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`);
                    if (params.sort) parts.push(`sort=${encodeURIComponent(params.sort)}`);
                    if (params.status) parts.push(`status=${encodeURIComponent(params.status)}`);
                }
                const qs = parts.join('&');
                return qs ? `career/jobs?${qs}` : "career/jobs";
            },
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

                const normalizeJob = (jobItem) => {
                    const visaStatus = Array.isArray(jobItem.visa_status) ? jobItem.visa_status : [];
                    const preferredSkills = Array.isArray(jobItem.preferred_skills) ? jobItem.preferred_skills : [];
                    const responsibilities = Array.isArray(jobItem.responsibilities) ? jobItem.responsibilities : [];
                    const requirements = Array.isArray(jobItem.requirements) ? jobItem.requirements : [];
                    const benefits = Array.isArray(jobItem.benefits) ? jobItem.benefits : [];

                    const symbol = getSymbolForLocation(jobItem.location);
                    let salaryText = jobItem.salary_range || jobItem.salary;
                    if (salaryText) {
                        if (!salaryText.startsWith('$') && !salaryText.startsWith('₹') && !salaryText.startsWith('R') && !salaryText.startsWith('€') && !salaryText.startsWith('£')) {
                            salaryText = `${symbol} ${salaryText}`;
                        }
                    } else if (jobItem.pay_min && jobItem.pay_max) {
                        salaryText = `${symbol}${Math.round(jobItem.pay_min)}-${symbol}${Math.round(jobItem.pay_max)}/${jobItem.pay_type === 'salary' ? 'yr' : 'hr'}`;
                    }

                    return {
                        ...jobItem,
                        id: jobItem.id || jobItem._id,
                        title: jobItem.title || "Untitled Position",
                        company: jobItem.company || "NextKinLife LLC",
                        clientName: jobItem.client_name || "",
                        vendorName: jobItem.vendor_name || "NextKinLife LLC",
                        location: jobItem.location || "Remote",
                        description: jobItem.description || "",
                        experience: jobItem.experience_level || "Not specified",
                        type: jobItem.position_type || jobItem.employment_type || "Full Time",
                        positionType: jobItem.position_type || jobItem.employment_type || "Full Time",
                        workStyle: normalizeWorkStyle(jobItem.work_style),
                        duration: jobItem.contract_duration || "Long Term",
                        salary: salaryText || "Competitive",
                        payMin: jobItem.pay_min,
                        payMax: jobItem.pay_max,
                        payType: jobItem.pay_type || "hourly",
                        visaStatus,
                        startDate: jobItem.start_date,
                        preferredSkills,
                        responsibilities,
                        requirements,
                        benefits,
                        recruiterName: jobItem.recruiter_name || "Vinod Kumar",
                        recruiterEmail: jobItem.recruiter_email || "careers@nextkinlife.com",
                        recruiterPhone: jobItem.recruiter_phone || "+1 (555) 123-4567",
                        recruiterLinkedin: jobItem.recruiter_linkedin || "linkedin.com/company/nextkinlife",
                        companyLinkedin: jobItem.company_linkedin || "https://linkedin.com/company/nextkinlife",
                        postedDate: jobItem.createdAt || jobItem.created_at || new Date().toISOString(),
                        posted: getTimeAgo(jobItem.createdAt || jobItem.created_at),
                        skills: Array.isArray(jobItem.skills) ? jobItem.skills : [],
                        isNew: (new Date() - new Date(jobItem.createdAt || jobItem.created_at || 0)) < 7 * 24 * 60 * 60 * 1000,
                    };
                };

                return jobs.map(normalizeJob);
            },
        }),
        getJobById: builder.query({
            query: (id) => `career/jobs/${id}`,
            providesTags: (result, error, id) => [{ type: "Job", id }],
            transformResponse: (response) => {
                const job = response?.job || response?.data || response;
                if (!job) return null;

                const normalizeWorkStyle = (val) => {
                    if (!val) return "Not specified";
                    const map = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site" };
                    return map[val.toLowerCase()] || val;
                };

                const visaStatus = Array.isArray(job.visa_status) ? job.visa_status : [];
                const preferredSkills = Array.isArray(job.preferred_skills) ? job.preferred_skills : [];
                const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : [];
                const requirements = Array.isArray(job.requirements) ? job.requirements : [];
                const benefits = Array.isArray(job.benefits) ? job.benefits : [];

                const symbol = getSymbolForLocation(job.location);
                let salaryText = job.salary_range || job.salary;
                if (salaryText) {
                    if (!salaryText.startsWith('$') && !salaryText.startsWith('₹') && !salaryText.startsWith('R') && !salaryText.startsWith('€') && !salaryText.startsWith('£')) {
                        salaryText = `${symbol} ${salaryText}`;
                    }
                } else if (job.pay_min && job.pay_max) {
                    salaryText = `${symbol}${Math.round(job.pay_min)}-${symbol}${Math.round(job.pay_max)}/${job.pay_type === 'salary' ? 'yr' : 'hr'}`;
                }

                return {
                    ...job,
                    id: job.id || job._id,
                    title: job.title || "Untitled Position",
                    company: job.company || "NextKinLife LLC",
                    clientName: job.client_name || "",
                    vendorName: job.vendor_name || "NextKinLife LLC",
                    location: job.location || "Remote",
                    description: job.description || "",
                    experience: job.experience_level || job.experience || "Not specified",
                    type: job.position_type || job.employment_type || job.type || "Full Time",
                    positionType: job.position_type || job.employment_type || job.type || "Full Time",
                    workStyle: normalizeWorkStyle(job.work_style || job.workStyle),
                    duration: job.contract_duration || "Long Term",
                    salary: salaryText || "Competitive",
                    payMin: job.pay_min,
                    payMax: job.pay_max,
                    payType: job.pay_type || "hourly",
                    visaStatus,
                    startDate: job.start_date,
                    preferredSkills,
                    responsibilities,
                    requirements,
                    benefits,
                    recruiterName: job.recruiter_name || "Vinod Kumar",
                    recruiterEmail: job.recruiter_email || "careers@nextkinlife.com",
                    recruiterPhone: job.recruiter_phone || "+1 (555) 123-4567",
                    recruiterLinkedin: job.recruiter_linkedin || "linkedin.com/company/nextkinlife",
                    companyLinkedin: job.company_linkedin || "https://linkedin.com/company/nextkinlife",
                    postedDate: job.createdAt || job.postedDate,
                };
            },
        }),
        applyForJob: builder.mutation({
            query: (formData) => ({
                url: "career/applications",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["MyApplications", "Job"],
        }),
        getMyApplications: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => `career/applications/me?page=${page}&limit=${limit}`,
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



        // Notifications
        getNotifications: builder.query({
            query: () => "notification/",
            providesTags: ["Notification"],
            transformResponse: (response) => {
                const items = response?.notifications || response?.data || response || [];
                if (!Array.isArray(items)) return [];

                const deletedIds = JSON.parse(localStorage.getItem('deletedNotifications') || '[]');
                const deleteAllTime = parseInt(localStorage.getItem('deleteAllNotificationsTime') || '0', 10);

                return items
                    .filter(n => {
                        const notifId = n.id || n._id;
                        const notifTime = new Date(n.createdAt || n.created_at || 0).getTime();
                        return !deletedIds.includes(notifId) && notifTime >= deleteAllTime;
                    })
                    .map(n => ({
                        ...n,
                        id: n.id || n._id,
                        is_read: n.is_read !== undefined ? n.is_read : n.read
                    }));
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
            queryFn: async (id, _queryApi, _extraOptions, baseQuery) => {
                await baseQuery({
                    url: `notification/${id}`,
                    method: "DELETE"
                });

                const deletedIds = JSON.parse(localStorage.getItem('deletedNotifications') || '[]');
                if (!deletedIds.includes(id)) {
                    deletedIds.push(id);
                    localStorage.setItem('deletedNotifications', JSON.stringify(deletedIds));
                }
                return { data: { success: true } };
            },
            invalidatesTags: ["Notification"],
        }),

        // Delete all notifications
        deleteAllNotifications: builder.mutation({
            queryFn: async (_, _queryApi, _extraOptions, baseQuery) => {
                await baseQuery({
                    url: "notification/",
                    method: "DELETE"
                });

                localStorage.setItem('deleteAllNotificationsTime', Date.now().toString());
                return { data: { success: true } };
            },
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
                body: { ...data, id: data.id || data.itemId, type: data.type || data.itemType, item_type: data.type || data.itemType, item_id: data.id || data.itemId }
            }),
            invalidatesTags: (result, error, data) => [
                "Wishlist",
                { type: "Wishlist", id: `${data.type || data.itemType}-${data.id || data.itemId}` }
            ],
        }),

        removeFromWishlist: builder.mutation({
            query: (data) => ({
                url: `wishlist/${data.type || data.itemType}/${data.id || data.itemId}`,
                method: "DELETE"
            }),
            invalidatesTags: (result, error, data) => [
                "Wishlist",
                { type: "Wishlist", id: `${data.type || data.itemType}-${data.id || data.itemId}` }
            ],
        }),

        toggleWishlist: builder.mutation({
            query: (data) => ({
                url: "wishlist/toggle",
                method: "POST",
                body: { ...data, id: data.id || data.itemId, type: data.type || data.itemType, item_type: data.type || data.itemType, item_id: data.id || data.itemId }
            }),
            invalidatesTags: (result, error, data) => [
                "Wishlist",
                { type: "Wishlist", id: `${data.type || data.itemType}-${data.id || data.itemId}` }
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
    useGetMyCommunitiesQuery,
    useGetCommunityByIdQuery,
    useJoinCommunityMutation,
    useLeaveCommunityMutation,
    useCreateCommunityMutation,
    useUpdateCommunityMutation,
    useCreateEventMutation,
    useCreateCommunityContributionMutation,
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