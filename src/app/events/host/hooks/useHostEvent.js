import { useState, useCallback, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { hostEventService, compressImage } from "../services/hostEventService"
import { useGetMyEventsQuery, useGetEventByIdQuery } from "@/store/api/hostApi"

// Helper to split phone number
// Known country codes (most common first)
const KNOWN_CODES = ["+1", "+91", "+44", "+86", "+81", "+49", "+33", "+61", "+55", "+39", "+34", "+7", "+82", "+62", "+52", "+31", "+27", "+966", "+971", "+65", "+60", "+63", "+66", "+84", "+92", "+94", "+880", "+977", "+254", "+233", "+234"];

const splitPhone = (fullPhone) => {
    if (!fullPhone) return { code: "+91", number: "" };

    const phoneStr = fullPhone.toString().trim();

    // Check against known country codes (sorted by length, longest first)
    if (phoneStr.startsWith('+')) {
        const sortedCodes = [...KNOWN_CODES].sort((a, b) => b.length - a.length);
        for (const code of sortedCodes) {
            if (phoneStr.startsWith(code)) {
                return { code: code, number: phoneStr.slice(code.length).trim() };
            }
        }
    }

    // Fallback for numbers without + or unknown codes
    return { code: "+91", number: phoneStr };
};

export const useHostEvent = () => {
    const [searchParams] = useSearchParams()
    const editId = searchParams.get('edit')
    const [eventId, setEventId] = useState(editId || null)
    const isEdit = !!editId || !!eventId

    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isReadOnly, setIsReadOnly] = useState(false)
    const [error, setError] = useState(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [previewImages, setPreviewImages] = useState({ banner: null, gallery: [] })

    const [formData, setFormData] = useState({
        title: "",
        date: "",
        end_date: "",
        time: "",
        end_time: "",
        location: "",
        description: "",
        country: "US",
        state: "",
        city: "",
        zip_code: "",
        landmark: "",
        venue_name: "",
        venue_description: "",
        parking_info: "",
        accessibility_info: "",
        price: "",
        event_type: "meetup",
        event_mode: "offline",
        event_url: "",
        online_instructions: "",
        documents: {},
        schedule: [],
        bannerImage: null,
        galleryImages: [],
        what_is_included: "",
        what_is_not_included: "",
        phone: "",
        phoneCode: "+91",
    })


    // Data Fetching
    const { data: myEvents } = useGetMyEventsQuery(undefined, { skip: !editId });
    const { data: publicEventData } = useGetEventByIdQuery(editId, { skip: !editId || !!myEvents });

    // Fetch event data for editing
    useEffect(() => {
        if (!editId) return;

        let event = null;

        // 1. Try finding in My Events (Private - includes drafts)
        if (myEvents && Array.isArray(myEvents)) {
            event = myEvents.find(e => String(e.id) === String(editId) || String(e._id) === String(editId));
        }

        // 2. Fallback to public API (Public - approved only)
        if (!event && publicEventData) {
            event = publicEventData.event || publicEventData.data || publicEventData;
        }

        if (event) {
            setEventId(editId); // Ensure ID is set

            // Check status for read-only mode, but allow editing if it's the owner (which it is if found in myEvents/edit flow)
            // Logic: If approved, maybe warn strictly? Or just alert.
            // For now, mirroring property logic: allow editing unless strictly locked, but usually approved items are locked.
            // However, the previous logic locked it. Let's keep it but maybe loosen for owner if needed.
            // Actually, approved events usually CAN be edited? The old logic locked it. I will keep the lock conformant to old logic.
            if (event.status === 'approved') {
                setIsReadOnly(true);
                setError("This event is approved and cannot be modified.");
            }

            const { code, number } = splitPhone(event.phone || "");

            // Populate form
            setFormData(prev => ({
                ...prev,
                title: event.title || "",
                description: event.description || "",
                event_type: event.event_type || "meetup",
                event_mode: event.event_mode || "offline",

                // Phone
                phone: number,
                phoneCode: code,

                // Date/Time (handling potential ISO strings)
                date: event.start_date ? new Date(event.start_date).toISOString().split('T')[0] : "",
                end_date: event.end_date ? new Date(event.end_date).toISOString().split('T')[0] : "",
                time: event.start_time || "",
                end_time: event.end_time || "",

                // Location
                country: event.country || "US",
                state: event.state || "",
                city: event.city || "",
                zip_code: event.zip_code || "",
                location: event.street_address || event.location || "",
                landmark: event.landmark || "",

                // Venue
                venue_name: event.venue_name || "",
                venue_description: event.venue_description || "",
                parking_info: event.parking_info || "",
                accessibility_info: event.accessibility_info || "",

                // Online
                event_url: event.event_url || "",
                online_instructions: event.online_instructions || "",

                // Extras
                price: event.price || "",
                what_is_included: event.what_is_included || "",
                what_is_not_included: event.what_is_not_included || "",
            }));

            // Set Previews
            setPreviewImages({
                banner: event.banner_image || null,
                gallery: event.gallery_images || []
            });
        }
    }, [editId, myEvents, publicEventData]);

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }, [])

    const handleFileChange = useCallback((docName, file) => {
        setFormData(prev => ({
            ...prev,
            documents: { ...prev.documents, [docName]: file }
        }))
    }, [])

    const validateFile = (file) => {
        const MAX_FILE_SIZE = 10 * 1024 * 1024
        if (!file.type.match('image.*')) return { valid: false, error: "Please upload an image file" }
        if (file.size > MAX_FILE_SIZE) return { valid: false, error: "File is too large (max 10MB)" }
        return { valid: true }
    }

    const handleBannerImageChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const validation = validateFile(file)
        if (!validation.valid) {
            setError(validation.error)
            return
        }

        try {
            setError(null)
            const compressedFile = await compressImage(file)
            const reader = new FileReader()
            reader.onload = () => setPreviewImages(prev => ({ ...prev, banner: reader.result }))
            reader.readAsDataURL(compressedFile)
            setFormData(prev => ({ ...prev, bannerImage: compressedFile }))
        } catch (err) {
            setError("Failed to process image")
        }
    }

    const handleGalleryImagesChange = async (e) => {
        const files = Array.from(e.target.files)
        if (!files.length) return

        setError(null)
        const validFiles = []
        const previews = []

        for (const file of files) {
            const validation = validateFile(file)
            if (!validation.valid) {
                setError(validation.error)
                return
            }

            try {
                const compressedFile = await compressImage(file)
                validFiles.push(compressedFile)
                const reader = new FileReader()
                reader.onload = () => {
                    previews.push(reader.result)
                    if (previews.length === validFiles.length) {
                        setPreviewImages(prev => ({
                            ...prev,
                            gallery: [...prev.gallery, ...previews]
                        }))
                    }
                }
                reader.readAsDataURL(compressedFile)
            } catch (err) {
                setError("Failed to process images")
                return
            }
        }

        setFormData(prev => ({
            ...prev,
            galleryImages: [...prev.galleryImages, ...validFiles]
        }))
    }

    const removeGalleryImage = (index) => {
        setFormData(prev => ({
            ...prev,
            galleryImages: prev.galleryImages.filter((_, i) => i !== index)
        }))
        setPreviewImages(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index)
        }))
    }

    const createOrUpdateEvent = async () => {
        setIsSubmitting(true)
        setError(null)

        try {
            let currentId = eventId

            if (!currentId) {
                // Backend createEventDraftSchema expects: title, type, start_date, start_time, end_date, end_time
                const draftPayload = {
                    title: formData.title,
                    type: formData.event_type,
                    start_date: formData.date,
                    start_time: formData.time
                }
                if (formData.end_date) draftPayload.end_date = formData.end_date
                if (formData.end_time) draftPayload.end_time = formData.end_time

                const draftResponse = await hostEventService.createDraft(draftPayload)
                currentId = draftResponse?.eventId || draftResponse?.id || draftResponse?._id || draftResponse?.event?.id || draftResponse?.event?._id || draftResponse?.data?.id || draftResponse?.data?._id
                if (!currentId) throw new Error("Failed to create event draft")
                setEventId(currentId)
            }

            // Backend eventBasicInfoSchema expects: title, description, type, event_type
            await hostEventService.updateBasicInfo(currentId, {
                title: formData.title,
                description: formData.description,
                type: formData.event_type
            })

            // Backend eventLocationSchema expects: country, state, city, street_address, landmark, zip_code
            if (formData.event_mode !== 'online') {
                await hostEventService.updateLocation(currentId, {
                    country: formData.country,
                    state: formData.state,
                    city: formData.city,
                    zip_code: formData.zip_code,
                    street_address: formData.location,
                    landmark: formData.landmark
                })
            }

            // Backend eventVenueSchema expects: venue_name, venue_description, parking_info, accessibility_info,
            // event_mode, event_url, online_instructions, included_items, latitude, longitude, google_maps_url
            // ALWAYS call updateVenue — this is where event_mode gets saved
            const venuePayload = {
                event_mode: formData.event_mode,
                online_instructions: formData.online_instructions
            }
            if (formData.event_mode !== 'online') {
                venuePayload.venue_name = formData.venue_name
                venuePayload.venue_description = formData.venue_description
                venuePayload.parking_info = formData.parking_info
                venuePayload.accessibility_info = formData.accessibility_info
            }
            // Convert comma-separated string to array for included_items
            if (formData.what_is_included) {
                venuePayload.included_items = typeof formData.what_is_included === 'string'
                    ? formData.what_is_included.split(',').map(s => s.trim()).filter(Boolean)
                    : formData.what_is_included
            }

            // Format and sanitize event_url to prevent Joi/backend URI validation errors
            const rawUrl = formData.event_url?.trim()
            if (rawUrl) {
                if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(rawUrl)) {
                    venuePayload.event_url = rawUrl
                } else {
                    venuePayload.event_url = `https://${rawUrl}`
                }
            }

            await hostEventService.updateVenue(currentId, venuePayload)

            // Backend eventScheduleSchema expects: end_date, end_time, schedule
            if (formData.end_date || formData.end_time || formData.schedule?.length > 0) {
                const schedulePayload = { schedule: formData.schedule || [] }
                if (formData.end_date) schedulePayload.end_date = formData.end_date
                if (formData.end_time) schedulePayload.end_time = formData.end_time
                await hostEventService.updateSchedule(currentId, schedulePayload)
            }

            return currentId
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleNextStep = async () => {
        if (!formData.title || !formData.date || !formData.time) {
            setError("Title, Date and Time are required")
            return
        }


        if (isReadOnly) {
            setStep(2); // Allow viewing next step but operation will be blocked on submit
            return;
        }
        try {
            await createOrUpdateEvent()
            setStep(2)
        } catch (err) {
            // Error handled in createOrUpdateEvent
        }
    }

    const handleSubmit = async (e) => {
        if (e) e.preventDefault()

        if (isReadOnly) {
            setError("Approved events cannot be modified. Please contact support to request changes.");
            return;
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const currentId = eventId || await createOrUpdateEvent()

            if (formData.bannerImage || formData.galleryImages.length > 0) {
                await hostEventService.uploadMedia(
                    currentId,
                    formData.bannerImage,
                    formData.galleryImages,
                    (progress) => setUploadProgress(progress)
                )
            }

            // Backend eventPricingSchema expects: price (Number, min 0)
            await hostEventService.updatePricing(currentId, Number(formData.price) || 0)
            await hostEventService.submitEvent(currentId)
            setIsSuccess(true)
            toast.success(isEdit ? "Event updated successfully!" : "Event created successfully! Your event is under review.")
        } catch (err) {
            setError(err.message)
            toast.error(err?.message || "Failed to submit event. Please try again.")
        } finally {
            setIsSubmitting(false)
            setUploadProgress(0)
        }
    }

    return {
        step,
        setStep,
        isSubmitting,
        isSuccess,
        eventId,
        error,
        setError,
        uploadProgress,
        previewImages,
        formData,
        handleInputChange,
        handleFileChange,
        handleBannerImageChange,
        handleGalleryImagesChange,
        removeGalleryImage,
        handleNextStep,
        handleSubmit,
        isEdit: !!eventId,
        isReadOnly
    }
}
