import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useCountry } from '@/context/CountryContext';
import { useSendOtpMutation, useVerifyOtpMutation } from '@/hooks/data/useAuthHooks';
import { getTermsFor } from '@/lib/host-terms-data';
import { fetchCurrentUser } from '@/store/slices/authSlice';
import { useHostSubmission } from './useHostSubmission';
import {
    useGetHostProfileQuery,
    useGetPropertyByIdQuery,
    useGetMyListingsQuery
} from '@/hooks/data/useHostHooks';

export const STEPS = [
    { title: "Basics", description: "Title, type & capacity" },
    { title: "Location", description: "Address & Country" },
    { title: "Pricing", description: "Price & Currency" },
    { title: "Media", description: "Photos & proofs" },
    { title: "Amenities", description: "Features & rules" },
    { title: "Review", description: "Final check" }
];

// Different form structures for different contribution types
const getFormDataStructure = (type = 'property') => {
    const baseStructure = {
        // Step 1: Identity
        fullName: "",
        email: "",
        phone: "",
        hostAddress: "",
        hostCity: "",
        hostCountry: "India",
        idType: "Aadhaar",
        profilePhoto: null,
        idProof: null,
        idNumber: "",

        // Step 2: Basics
        title: "",
        category: "student",
        type: "",
        privacyType: "entire place",
        petsAllowed: "",
        sqft: "",
        capacity: "",
        bedrooms: "",
        bathrooms: "",
        description: "",

        // Step 3: Location
        address: "",
        city: "Hyderabad",
        pincode: "",
        country: "India",
        state: "Telangana",

        // Step 5: Media & Proofs
        images: [],
        video: null,
        propertyProof: null,

        // Step 6: Amenities & Rules
        amenities: [],
        customAmenities: [],
        rules: []
    };

    switch (type) {
        case 'property':
            return {
                ...baseStructure,
                // Pricing details for properties
                currency: "INR",
                pricePerHour: "",
                priceNight: "",
                priceWeek: "",
                priceMonth: "",
                hostPreference: "cultural_exchange", // 'cultural_exchange', 'community_stay', 'long_term'
                maxGuests: "",
                sharedSpaces: []
            };

        case 'event':
            return {
                ...baseStructure,
                // Event-specific fields
                eventType: "cultural", // 'cultural', 'festival', 'workshop', 'networking'
                startDate: "",
                endDate: "",
                startTime: "",
                endTime: "",
                maxAttendees: "",
                eventCategory: "community", // 'community', 'cultural', 'educational'
                eventPrice: "free", // 'free', 'donation', 'fixed_price'
                priceAmount: "",
                requirements: []
            };

        case 'group':
            return {
                ...baseStructure,
                // Group-specific fields
                groupType: "community", // 'community', 'professional', 'cultural', 'hobby'
                groupSize: "",
                meetingFrequency: "", // 'weekly', 'biweekly', 'monthly'
                membershipType: "open", // 'open', 'closed', 'invite_only'
                groupRules: [],
                topics: []
            };

        case 'local_guide':
            return {
                ...baseStructure,
                // Local guide fields
                languages: ["English", "Hindi"],
                areas: [],
                experience: "",
                guideType: "city", // 'city', 'cultural', 'food', 'historical'
                availability: "",
                preferredGroupSize: ""
            };

        case 'travel_companion':
            return {
                ...baseStructure,
                // Travel companion fields
                destinationCountry: "",
                destinationCity: "",
                travelDates: "",
                budgetPreference: "shared", // 'shared', 'separate'
                travelStyle: "cultural", // 'cultural', 'adventure', 'relaxation'
                languages: ["English", "Hindi"],
                maxCompanions: ""
            };

        case 'workshop':
            return {
                ...baseStructure,
                // Workshop fields
                workshopType: "cultural", // 'cultural', 'skill', 'art', 'cooking'
                duration: "",
                skillLevel: "beginner", // 'beginner', 'intermediate', 'advanced'
                materialsProvided: false,
                maxParticipants: "",
                prerequisites: []
            };

        default:
            return baseStructure;
    }
};

export function useHostCreation() {
    const dispatch = useDispatch();
    const { activeCountry } = useCountry();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    // Auth State (Redux State)
    const { user: userData, error: isAuthError } = useSelector((state) => state.auth);
    const { data: hostProfile, isError: isHostError } = useGetHostProfileQuery(undefined, {
        skip: !userData || !!isAuthError
    });

    const [sendOtp] = useSendOtpMutation();
    const [verifyOtp] = useVerifyOtpMutation();

    const isExistingHost = !!hostProfile && !isHostError;

    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [contributionType, setContributionType] = useState('property');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    // Form State - Initialize with property type as default
    const [formData, setFormData] = useState(() => getFormDataStructure('property'));

    // Synchronize defaults with user's selected country
    useEffect(() => {
        if (activeCountry && activeCountry.name && activeCountry.name !== "Global" && !editId) {
            setFormData(prev => ({
                ...prev,
                country: prev.country === "India" ? activeCountry.name : prev.country,
                hostCountry: prev.hostCountry === "India" ? activeCountry.name : prev.hostCountry,
                phonePrefix: activeCountry.phoneCode || prev.phonePrefix,
                phoneIso: activeCountry.code || prev.phoneIso,
                whatsappPrefix: activeCountry.phoneCode || prev.whatsappPrefix,
                whatsappIso: activeCountry.code || prev.whatsappIso,
                currency: activeCountry.currency || prev.currency || "USD"
            }));
        }
    }, [activeCountry, editId]);

    const [customAmenityInput, setCustomAmenityInput] = useState("");
    const [customRuleInput, setCustomRuleInput] = useState("");

    // Terms State
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [displayedTerms, setDisplayedTerms] = useState([]);
    const [isReadOnly, setIsReadOnly] = useState(false);

    // Hooks Delegation
    const { isLoading, handleSubmit } = useHostSubmission({
        formData,
        contributionType,
        editId,
        isExistingHost,
        customRuleInput,
        termsAccepted,
        isReadOnly
    });


    // Update form structure when contribution type changes
    useEffect(() => {
        if (contributionType) {
            setFormData(getFormDataStructure(contributionType));
        }
    }, [contributionType]);

    // Update Country in Form & Clear stale location fields when changed
    const lastCountryRef = useRef(null);
    useEffect(() => {
        if (activeCountry) {
            const lastCountryName = lastCountryRef.current;
            const currentCountryName = activeCountry.name;
            const countryChanged = lastCountryName && lastCountryName !== currentCountryName;

            setFormData(prev => ({
                ...prev,
                country: activeCountry,
                hostCountry: activeCountry.name,
                currency: activeCountry.currency || "INR",
                phoneCode: prev.phoneCode && prev.phoneCode !== "+91" ? prev.phoneCode : (activeCountry.phoneCode || (activeCountry.code === "US" ? "+1" : "+91")),
                phoneIso: prev.phoneIso && prev.phoneIso !== "IN" ? prev.phoneIso : (activeCountry.code || "US"),
                ...(countryChanged ? {
                    address: "",
                    city: "",
                    state: "",
                    pincode: ""
                } : {})
            }));
            lastCountryRef.current = currentCountryName;
        }
    }, [activeCountry]);

    // Update Terms
    useEffect(() => {
        const terms = getTermsFor(formData.country?.code || "DEFAULT", formData.category);
        setDisplayedTerms(terms);
        setTermsAccepted(false);
    }, [formData.country, formData.category, contributionType]);

    // Auto-login check (Populate form from backend verified session)
    useEffect(() => {
        if (userData) {
            setFormData(prev => ({
                ...prev,
                email: userData.email || prev.email,
                phone: userData.phone || prev.phone,
                fullName: userData.full_name || userData.name || prev.fullName
            }));
        }

        if (hostProfile) {
            setFormData(prev => ({
                ...prev,
                hostAddress: hostProfile.address || prev.hostAddress,
                hostCity: hostProfile.city || prev.hostCity,
                hostCountry: hostProfile.country || prev.hostCountry,
                idType: hostProfile.id_type || prev.idType,
                idNumber: hostProfile.id_number || prev.idNumber,
            }));
        }
    }, [userData, hostProfile]);

    // FETCH DATA FROM MY LISTINGS (OWNER VIEW) INSTEAD OF PUBLIC API
    const { data: myListings } = useGetMyListingsQuery(undefined, {
        skip: !editId || contributionType !== 'property'
    });

    // Fallback to public API (Only works for Approved)
    const { data: publicPropertyData } = useGetPropertyByIdQuery(editId, {
        skip: !editId || contributionType !== 'property' || !!myListings // Skip if we have myListings
    });

    useEffect(() => {
        if (editId) {
            let prop = null;

            // 1. Try finding in MyListings (Best for unverified/drafts)
            if (myListings && Array.isArray(myListings)) {
                prop = myListings.find(p => String(p.id) === String(editId) || String(p._id) === String(editId));
            }

            // 2. Fallback to public API
            if (!prop && publicPropertyData) {
                // Handle different response structures
                prop = publicPropertyData.property || publicPropertyData.data || publicPropertyData;
            }

            if (prop) {
                // Check if property is approved (read-only), but allow editing if it has expired
                const isExpired = prop.is_expired || (prop.listing_expires_at && new Date(prop.listing_expires_at).getTime() < Date.now());
                if (prop.status === 'approved' && !isExpired) {
                    setIsReadOnly(true);
                }

                setTermsAccepted(true); // Auto-accept to avoid blocking view

                setFormData(prev => ({
                    ...prev,
                    // Basics
                    title: prop.title || prop.name || prev.title,
                    category: prop.category || prop.category_slug || prev.category,
                    type: (() => {
                        const val = prop.property_type || prop.type || prev.type;
                        if (!val) return "";
                        const lower = val.toLowerCase().trim();
                        if (lower === "pg" || lower === "hostel" || lower === "pg / hostel") return "PG / Hostel";
                        const types = ["Apartment", "House", "Private Room", "Shared Room", "Studio", "PG / Hostel", "Villa", "Townhouse"];
                        const match = types.find(t => t.toLowerCase() === lower);
                        return match || val;
                    })(),
                    privacyType: prop.privacy_type || prev.privacyType,
                    petsAllowed: prop.pets_allowed !== undefined && prop.pets_allowed !== null ? String(prop.pets_allowed) : prev.petsAllowed,
                    sqft: prop.specs?.area || prop.area || prev.sqft,
                    capacity: prop.specs?.guests !== undefined ? String(prop.specs.guests) : (prop.guests !== undefined ? String(prop.guests) : prev.capacity),
                    bedrooms: prop.specs?.bedrooms !== undefined ? String(prop.specs.bedrooms) : (prop.bedrooms !== undefined ? String(prop.bedrooms) : prev.bedrooms),
                    bathrooms: prop.specs?.bathrooms !== undefined ? String(prop.specs.bathrooms) : (prop.bathrooms !== undefined ? String(prop.bathrooms) : prev.bathrooms),
                    description: prop.description || prev.description,

                    // Location - handle flattened or nested
                    address: prop.location?.address || prop.address || prop.street_address || prop.location?.street_address || prev.address,
                    city: prop.location?.city || prop.city || prev.city,
                    state: prop.location?.state || prop.state || prev.state,
                    country: prop.location?.country || prop.country || prev.country,
                    pincode: prop.location?.zip_code || prop.zip_code || prev.pincode,
                    latitude: prop.latitude !== undefined && prop.latitude !== null ? prop.latitude : (prop.location?.latitude || prev.latitude),
                    longitude: prop.longitude !== undefined && prop.longitude !== null ? prop.longitude : (prop.location?.longitude || prev.longitude),
                    locationPrivacy: prop.location_privacy || prop.locationPrivacy || prev.locationPrivacy || "approximate",

                    // Pricing
                    currency: prop.pricing?.currency || prop.currency || "INR",
                    pricePerHour: prop.pricing?.price_per_hour || prop.price_per_hour || prev.pricePerHour,
                    priceNight: prop.pricing?.price_per_night || prop.price_per_night || prev.priceNight,
                    priceWeek: prop.price_per_week !== undefined && prop.price_per_week !== null ? prop.price_per_week : (prop.pricing?.price_per_week || prev.priceWeek),
                    priceMonth: prop.pricing?.price_per_month || prop.price_per_month || prev.priceMonth,

                    // Media
                    // Map URL strings to objects { url, file: null }
                    images: (prop.photos || prop.images || []).map(url =>
                        typeof url === 'string' ? { url, file: null } : url
                    ),
                    video: prop.video ? { url: prop.video } : null,
                    propertyProof: (prop.legal_docs || [])[0] ? { url: prop.legal_docs[0] } : null,

                    // Amenities & Rules
                    amenities: prop.amenities || [],
                    rules: prop.rules || []
                }));
            }
        }
    }, [myListings, publicPropertyData, editId]);

    // Handlers
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        if (!formData.email) {
            toast.error("Please enter a valid email address.");
            return;
        }
        try {
            await sendOtp({ email: formData.email, phone: formData.phone || "0000000000" }).unwrap();
            setShowOtpModal(true);
            toast.success("OTP sent to your email!");
        } catch (error) {
            console.error("Failed to send OTP:", error);
            const msg = error.message || "";
            if (msg.includes("429") || msg.toLowerCase().includes("too many")) {
                toast.error("Too many OTP requests. Please wait a few minutes before trying again.");
            } else {
                toast.error("Failed to send OTP. Please try again.");
            }
        }
    };

    const handleVerifyOtp = async (otpCode) => {
        try {
            const response = await verifyOtp({ email: formData.email, phone: formData.phone || "0000000000", otp: otpCode }).unwrap();

            if (response) {
                if (response.user || response.data?.user) {
                    const userData = response.user || response.data?.user;
                    const safeUser = { ...userData, id: userData.id || userData._id };
                    localStorage.setItem("user", JSON.stringify(safeUser));
                }
                toast.success("Verification Successful! You are logged in.");
                setIsEmailVerified(true);
                // Hydrate global auth state
                dispatch(fetchCurrentUser());
                setShowOtpModal(false);
            } else {
                if (response.message === "Email verified successfully" || response.success) {
                    toast.success("Email verified.");
                    setIsEmailVerified(true);
                    dispatch(fetchCurrentUser());
                    setShowOtpModal(false);
                } else {
                    toast.error(`Verification failed: ${response.message}`);
                }
            }
        } catch (error) {
            console.error("Failed to verify OTP:", error);
            toast.error("Invalid OTP. Please try again.");
        }
    };

    const handleFileChange = (e, field, multiple = false) => {
        const files = Array.from(e.target.files);
        
        const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
        if (validFiles.length < files.length) {
            toast.error(multiple ? "Some files exceed the 10MB limit and were skipped." : "File exceeds the 10MB limit.");
        }
        
        if (validFiles.length === 0) return;

        if (multiple) {
            const newImages = validFiles.map(file => ({
                file,
                url: URL.createObjectURL(file)
            }));
            setFormData(prev => ({ ...prev, [field]: [...prev[field], ...newImages] }));
        } else {
            setFormData(prev => ({ ...prev, [field]: validFiles[0] }));
        }
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const toggleAmenity = (amenity) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const addCustomAmenity = () => {
        if (!customAmenityInput.trim()) return;
        setFormData(prev => ({
            ...prev,
            customAmenities: [...prev.customAmenities, customAmenityInput.trim()]
        }));
        setCustomAmenityInput("");
    };

    const addRule = () => {
        if (!customRuleInput.trim()) return;
        setFormData(prev => ({
            ...prev,
            rules: [...prev.rules, customRuleInput.trim()]
        }));
        setCustomRuleInput("");
    };

    // Zip code required countries helper
    const isZipCodeRequired = (country) => {
        if (!country) return false;
        const code = (typeof country === 'object' ? country.code : '') || '';
        const name = (typeof country === 'object' ? country.name : country) || '';
        const codeUpper = code.toUpperCase().trim();
        const nameLower = name.toLowerCase().trim();
        
        const requiredCodes = ["US", "IN", "GB", "CA", "AU", "DE", "FR"];
        const requiredNames = ["united states", "united states of america", "india", "united kingdom", "great britain", "canada", "australia", "germany", "france"];
        
        return requiredCodes.includes(codeUpper) || requiredNames.includes(nameLower);
    };

    // Updated validation for different contribution types
    const validateStep = (step) => {
        switch (step) {
            case 1: { // Basics
                const hasTitle = formData.title && formData.title.trim() !== "";
                const hasCategory = !!formData.category;
                const hasDescription = formData.description && formData.description.trim() !== "";

                if (contributionType === 'property') {
                    const isValidNumeric = (val) => {
                        if (val === "" || val === null || val === undefined) return false;
                        const num = Number(val);
                        return Number.isFinite(num) && num >= 0;
                    };
                    const hasCapacity = isValidNumeric(formData.capacity);
                    const hasBedrooms = isValidNumeric(formData.bedrooms);
                    const hasBathrooms = isValidNumeric(formData.bathrooms);
                    const hasPropertyType = formData.type && formData.type.trim() !== "";
                    const hasPrivacyType = formData.privacyType && formData.privacyType.trim() !== "";
                    
                    return hasTitle && hasCategory && hasDescription && hasCapacity && hasBedrooms && hasBathrooms && hasPropertyType && hasPrivacyType;
                }

                return hasTitle && hasCategory && hasDescription;
            }

            case 2: { // Location
                const addrVal = (formData.address || formData.street_address || formData.streetAddress || "").toString().trim();
                const countryVal = formData.country
                  ? (typeof formData.country === 'object' ? formData.country.name : formData.country)
                  : "India";
                const stateVal = (formData.state || "Telangana").toString().trim();
                const cityVal = (formData.city || "Hyderabad").toString().trim();

                const hasAddress = addrVal !== "";
                const hasCity = cityVal !== "";
                const hasState = stateVal !== "";
                const hasCountry = !!countryVal;
                
                const zipRequired = isZipCodeRequired(countryVal);
                const zipVal = (formData.pincode || formData.zipCode || formData.zip_code || "").toString().trim();
                const hasZip = !zipRequired || zipVal !== "";
                
                return hasAddress && hasCity && hasState && hasCountry && hasZip;
            }

            case 3: { // Pricing
                if (contributionType === 'event') {
                    // Free events don't need price
                    if (formData.eventPrice === 'free') return true;
                    return formData.priceAmount !== "" && formData.priceAmount !== null;
                }
                if (contributionType === 'travel_companion') return true; // Budget preference is always set to default

                const hasPrice = formData.priceMonth !== "" && formData.priceMonth !== null && formData.priceMonth !== undefined;
                const hasCurrency = !!formData.currency;
                return hasPrice && hasCurrency;
            }

            case 4: // Media
                return formData.images.length >= 1; // Relax proof check for non-properties? 
            // && formData.propertyProof; 

            case 5: // Amenities
                return (formData.amenities.length + formData.customAmenities.length) > 0;

            case 6: // Review
                return true;

            default:
                return false;
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setDirection(1);
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
        } else {
            toast.error("Please fill in all required fields for this step.");
        }
    };

    const prevStep = () => {
        setDirection(-1);
        setCurrentStep(prev => {
            if (prev === 2 && !contributionType) {
                return 1; // Go back to selection
            }
            return Math.max(prev - 1, 1);
        });
    };



    const isEdit = !!editId;

    return {
        // State
        activeCountry,
        showOtpModal,
        setShowOtpModal,
        isEmailVerified,
        currentStep,
        direction,
        isLoading,
        formData,
        setFormData,
        customAmenityInput,
        setCustomAmenityInput,
        customRuleInput,
        setCustomRuleInput,
        termsAccepted,
        setTermsAccepted,
        displayedTerms,
        contributionType,
        setContributionType,
        isEdit,
        isReadOnly,

        // Actions
        handleSendOtp,
        handleVerifyOtp,
        handleFileChange,
        removeArrayItem,
        toggleAmenity,
        addCustomAmenity,
        addRule,
        nextStep,
        prevStep,
        handleSubmit
    };
}
