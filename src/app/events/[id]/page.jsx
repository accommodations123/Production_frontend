"use client"
import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useParams } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { useGetEventByIdQuery, useJoinEventMutation, useLeaveEventMutation } from "@/hooks/data/useEventHooks"
import { toast } from "sonner"
import { resolveImageUrl, normalizeImages } from "@/lib/imageUtils"

// Hooks & Services
import { useAuth } from "./hooks/useAuth"

// Components
import { HeroSection } from "./components/HeroSection"
import { RegistrationBar } from "./components/RegistrationBar"
import { TabNavigation } from "./components/TabNavigation"
import { OverviewTab } from "./components/OverviewTab"
import { ScheduleTab } from "./components/ScheduleTab"
import { VenueTab } from "./components/VenueTab"

import { Sidebar } from "./components/Sidebar"
import { EventNotFound } from "./components/EventNotFound"

export default function EventDetailsPage() {
    const { id } = useParams()
    const { data: apiEvent, isLoading, error } = useGetEventByIdQuery(id)

    const event = useMemo(() => {
        if (!apiEvent) return null
        const raw = apiEvent.event || apiEvent.data || apiEvent
        const hostObj = raw.Host || raw.host || raw.User || raw.user || null
        const hostName = hostObj?.full_name || hostObj?.name || hostObj?.User?.full_name || raw.organizer || raw.hostName || "Host"
        const hostPhoto = resolveImageUrl(hostObj?.profile_image || hostObj?.selfie_photo || hostObj?.avatar || hostObj?.User?.profile_image || null)

        const locationStr = raw.location || 
            (raw.city && raw.country ? `${raw.city}, ${raw.country}` : raw.city || raw.street_address || raw.venue_name || raw.address || "Location TBA")

        const resolvedBanner = resolveImageUrl(raw.banner_image || raw.image || (Array.isArray(raw.images) ? raw.images[0] : null) || (raw.gallery_images?.[0]) || null)
        const resolvedGallery = normalizeImages(raw.images || raw.gallery_images || (resolvedBanner ? [resolvedBanner] : []))

        return {
            id: raw.id || raw._id || raw.eventId,
            title: raw.title || raw.eventName || raw.name || "Untitled Event",
            description: raw.description || raw.desc || "No description available",
            image: resolvedBanner,
            banner_image: resolvedBanner,
            date: raw.start_date || raw.date || raw.event_date,
            time: raw.start_time || raw.time,
            end_date: raw.end_date || raw.endDate,
            end_time: raw.end_time || raw.endTime,
            location: locationStr,
            city: raw.city || "",
            country: raw.country || "",
            address: raw.address || raw.street_address || locationStr,
            type: raw.event_type || raw.type || "Event",
            price: raw.price ?? raw.ticketPrice ?? 0,
            venueName: raw.venue_name || raw.venueName || raw.venue,
            venueDescription: raw.venue_description || raw.venueDescription,
            parkingInfo: raw.parking_info || raw.parkingInfo,
            accessibilityInfo: raw.accessibility_info || raw.accessibilityInfo,
            googleMapsUrl: raw.google_maps_url || raw.googleMapsUrl,
            attendeesCount: raw.attendees_count || raw.attendeesCount || 0,
            galleryImages: resolvedGallery,
            images: resolvedGallery,
            includedItems: Array.isArray(raw.included_items) ? raw.included_items : [],
            schedule: Array.isArray(raw.schedule) ? raw.schedule : [],
            facilities: Array.isArray(raw.facilities) ? raw.facilities : [],
            accessibilityFeatures: Array.isArray(raw.accessibility_features) ? raw.accessibility_features : [],
            host: hostObj
                ? {
                    full_name: hostName,
                    selfie_photo: hostPhoto,
                    profile_image: hostPhoto,
                    phone: hostObj.phone || hostObj.whatsapp || hostObj.User?.phone,
                    email: hostObj.email || hostObj.User?.email,
                    status: hostObj.status
                }
                : null,
            event_mode: raw.event_mode || "offline",
            event_url: raw.event_url || "",
            online_instructions: raw.online_instructions || "",
            is_registered: raw.is_registered || apiEvent.is_registered || false
        }
    }, [apiEvent])

    // const [isSaved, setIsSaved] = useState(false) // Removed local state
    const [showShareMenu, setShowShareMenu] = useState(false)
    const [isRegistered, setIsRegistered] = useState(false)
    const [prevEvent, setPrevEvent] = useState(null)

    // Sync isRegistered inline during render when event data changes
    if (event !== prevEvent) {
        setPrevEvent(event)
        setIsRegistered(!!event?.is_registered)
    }

    const [activeTab, setActiveTab] = useState("overview")
    const [prevActiveTab, setPrevActiveTab] = useState("overview")
    const [visibleSections, setVisibleSections] = useState(new Set(['overview']))

    // Sync visible sections inline during render when active tab changes
    if (activeTab !== prevActiveTab) {
        setPrevActiveTab(activeTab)
        setVisibleSections(prev => {
            const next = new Set(prev)
            next.add(activeTab)
            if (activeTab === 'overview') {
                next.add('included')
                next.add('gallery')
            }
            return next
        })
    }

    const [copiedLink, setCopiedLink] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [registrationError, setRegistrationError] = useState('')
    const [registrationSuccess, setRegistrationSuccess] = useState('')
    const [isCheckingRegistration, setIsCheckingRegistration] = useState(true)

    const [joinEvent, { isLoading: isJoining }] = useJoinEventMutation()
    const [leaveEvent, { isLoading: isLeaving }] = useLeaveEventMutation()

    const { user } = useAuth()

    // Syncing of isRegistered is handled inline during render above

    // Removed manual registration check effect since we rely on apiEvent data now

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(entry => entry.isIntersecting && setVisibleSections(prev => new Set([...prev, entry.target.id]))),
            { threshold: 0.1 }
        )
        const sections = document.querySelectorAll('.animate-section')
        sections.forEach(section => observer.observe(section))
        return () => sections.forEach(section => observer.unobserve(section))
    }, [])

    // Syncing of visible sections is handled inline during render above

    const handleCopyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            setCopiedLink(true)
            toast.success("Link copied to clipboard!")
            setTimeout(() => setCopiedLink(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
            toast.error("Failed to copy link")
        }
    }, [])
    const handleShareToggle = useCallback(() => setShowShareMenu(prev => !prev), [])

    const handleRegister = useCallback(async () => {
        if (!user) {
            toast.error('You must be logged in to register for this event.')
            return
        }

        try {
            setRegistrationError('')
            setRegistrationSuccess('')

            await joinEvent(event.id).unwrap()

            setIsRegistered(true)
            setRegistrationSuccess('Successfully registered for event!')
            toast.success('Successfully registered for event!')
            setTimeout(() => setRegistrationSuccess(''), 5000)
        } catch (error) {
            console.error('Error joining event:', error)
            const msg = error?.data?.message || error.message || 'Failed to register for event.'

            if (msg.includes('already joined')) {
                setIsRegistered(true)
                setRegistrationSuccess('You are already registered for this event.')
                toast.info('You are already registered for this event.')
            } else {
                setRegistrationError(msg)
                toast.error(msg)
            }
            setTimeout(() => {
                setRegistrationError('')
                setRegistrationSuccess('')
            }, 5000)
        }
    }, [event?.id, user, joinEvent])

    const handleLeave = useCallback(async () => {
        if (!user) {
            toast.error('You must be logged in to leave this event.')
            return
        }

        try {
            setRegistrationError('')
            setRegistrationSuccess('')

            await leaveEvent(event.id).unwrap()

            setIsRegistered(false)
            setRegistrationSuccess('Successfully left the event.')
            toast.success('Successfully left the event.')
            setTimeout(() => setRegistrationSuccess(''), 5000)
        } catch (error) {
            console.error('Error leaving event:', error)
            const msg = error?.data?.message || error.message || 'Failed to leave event.'
            setRegistrationError(msg)
            toast.error(msg)
            setTimeout(() => setRegistrationError(''), 5000)
        }
    }, [event?.id, user, leaveEvent])

    const handleTabClick = useCallback((tab) => {
        setActiveTab(tab)
        setVisibleSections(prev => new Set([...prev, tab]))
    }, [])

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                <Navbar />
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading event details...</p>
                </div>
            </main>
        )
    }

    const currentUserId = user?.id || user?.user_id || user?._id;
    const currentUserEmail = (user?.email || "").trim().toLowerCase();
    const currentUserName = (user?.full_name || user?.name || "").trim().toLowerCase();
    const currentUserHostId = user?.host_id || user?.Host?.id || user?.host?.id;

    const host = event?.Host || event?.host || {};
    const hostUserId =
        host?.user_id ||
        event?.host_user_id ||
        host?.id ||
        event?.host_id ||
        event?.user_id ||
        host?.User?.id ||
        host?.User?.user_id;

    const hostEmail = (host?.email || host?.User?.email || "").trim().toLowerCase();
    const rawHostName = host?.full_name || host?.name || "";
    const hostNormalizedName = rawHostName.trim().toLowerCase();

    const isOwner = Boolean(
        user && (
            (currentUserId && (
                String(host?.user_id) === String(currentUserId) ||
                String(event?.host_user_id) === String(currentUserId) ||
                String(event?.user_id) === String(currentUserId) ||
                String(host?.User?.id) === String(currentUserId) ||
                (hostUserId && String(hostUserId) === String(currentUserId))
            )) ||
            (currentUserHostId && (
                String(currentUserHostId) === String(host?.id) ||
                String(currentUserHostId) === String(event?.host_id)
            )) ||
            (currentUserEmail && hostEmail && currentUserEmail === hostEmail) ||
            (currentUserName && hostNormalizedName && (
                currentUserName === hostNormalizedName ||
                currentUserName.replace(/[\s.]+/g, '') === hostNormalizedName.replace(/[\s.]+/g, '')
            ))
        )
    );

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <HeroSection
                event={event}
                shareOpen={showShareMenu}
                onShare={handleShareToggle}
                copied={copiedLink}
                onCopy={handleCopyLink}
            />
            <RegistrationBar
                isRegistered={isRegistered}
                handleRegister={handleRegister}
                handleLeave={handleLeave}
                event={event}
                isLoading={isProcessing || isJoining || isLeaving}
                errorMessage={registrationError}
                successMessage={registrationSuccess}
                isOwner={isOwner}
            />
            <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    <div className="md:col-span-2 space-y-6 md:space-y-8">
                        <TabNavigation activeTab={activeTab} handleTabClick={handleTabClick} />
                        <div className="min-h-[500px]">
                            {activeTab === 'overview' && <OverviewTab event={event} visibleSections={visibleSections} />}
                            {activeTab === 'schedule' && <ScheduleTab event={event} visibleSections={visibleSections} />}
                            {activeTab === 'venue' && <VenueTab event={event} visibleSections={visibleSections} />}
                        </div>
                    </div>
                    <Sidebar event={event} />
                </div>
            </div>
            <Footer />
        </main>
    )
}