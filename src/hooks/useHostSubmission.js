import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hostService } from '@/services/hostService';
import { compressImage } from '@/lib/imageUtils';
import {
    useSaveHostMutation,
    useUploadFileMutation,
    useCreatePropertyDraftMutation,
    useUpdatePropertyBasicMutation,
    useUpdatePropertyAddressMutation,
    useUpdatePropertyPricingMutation,
    useUpdatePropertyAmenitiesMutation,
    useUpdatePropertyRulesMutation,
    useUpdatePropertyMediaMutation,
    useUpdatePropertyVideoMutation,
    useSubmitPropertyMutation
} from '@/store/api/hostApi';

export function useHostSubmission({
    formData,
    contributionType,
    editId,
    isExistingHost,
    customRuleInput,
    termsAccepted,
    isReadOnly
}) {
    const navigate = useNavigate();
    const { user: userData } = useSelector((state) => state.auth);
    const [isLoading, setIsLoading] = useState(false);

    // API Mutations
    const [saveHost] = useSaveHostMutation();
    const [uploadFile] = useUploadFileMutation();
    const [createPropertyDraft] = useCreatePropertyDraftMutation();
    const [updatePropertyBasic] = useUpdatePropertyBasicMutation();
    const [updatePropertyAddress] = useUpdatePropertyAddressMutation();
    const [updatePropertyPricing] = useUpdatePropertyPricingMutation();
    const [updatePropertyAmenities] = useUpdatePropertyAmenitiesMutation();
    const [updatePropertyRules] = useUpdatePropertyRulesMutation();
    const [updatePropertyMedia] = useUpdatePropertyMediaMutation();
    const [updatePropertyVideo] = useUpdatePropertyVideoMutation();
    const [submitProperty] = useSubmitPropertyMutation();

    const getContributionTypeLabel = (type) => {
        const labels = {
            property: 'Space Sharing',
            event: 'Event',
            group: 'Community Group',
            local_guide: 'Local Guide Profile',
            travel_companion: 'Travel Companion Offer',
            workshop: 'Workshop'
        };
        return labels[type] || 'Contribution';
    };

    const handleSubmitProperty = async (propertyId) => {
        await updatePropertyPricing({
            id: propertyId, data: {
                pricePerHour: Number(formData.pricePerHour) || 0,
                pricePerNight: Number(formData.priceNight) || 0,
                pricePerWeek: Number(formData.priceWeek) || 0,
                pricePerMonth: Number(formData.priceMonth) || 0,
                currency: formData.currency || 'INR'
            }
        }).unwrap();

        const combinedAmenities = [...formData.amenities, ...formData.customAmenities];
        if (combinedAmenities.length > 0) {
            await updatePropertyAmenities({ id: propertyId, amenities: combinedAmenities }).unwrap();
        }

        // Auto-add pending rule if exists
        const finalRules = [...formData.rules];
        if (customRuleInput.trim()) {
            finalRules.push(customRuleInput.trim());
        }

        if (finalRules.length > 0) {
            await updatePropertyRules({ id: propertyId, rules: finalRules }).unwrap();
        }

        // Filter for NEW images only (those with a file object)
        const newImages = formData.images.filter(img => img.file);
        if (newImages.length > 0) {
            for (const img of newImages) {
                const photoFd = new FormData();
                try {
                    const compressed = await compressImage(img.file);
                    photoFd.append('photo', compressed);
                } catch (err) {
                    console.error("Failed to compress image, using original:", err);
                    photoFd.append('photo', img.file);
                }
                await updatePropertyMedia({ id: propertyId, formData: photoFd }).unwrap();
            }
        }

        // Only upload video if it is a new File object (not an existing URL object)
        if (formData.video && formData.video instanceof File) {
            const videoFd = new FormData();
            videoFd.append('video', formData.video);
            await updatePropertyVideo({ id: propertyId, formData: videoFd }).unwrap();
        }
    };

    const handleSubmitEvent = async () => {
        const eventPayload = {
            title: formData.title,
            description: formData.description,
            eventType: formData.eventType,
            category: formData.eventCategory,
            startDate: formData.startDate,
            endDate: formData.endDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            location: `${formData.address}, ${formData.city}`,
            maxAttendees: formData.maxAttendees,
            priceType: formData.eventPrice,
            priceAmount: formData.priceAmount || 0,
            requirements: formData.requirements,
            images: formData.images.map(img => img.url),
            hostId: userData?.id || userData?._id || userData?.user?.id || null
        };

        await hostService.createEvent(eventPayload);
    };

    const handleSubmitGroup = async () => {
        const groupPayload = {
            name: formData.title,
            description: formData.description,
            type: formData.groupType,
            category: formData.category,
            location: `${formData.city}, ${formData.country?.name || 'Unknown'}`,
            size: formData.groupSize,
            meetingFrequency: formData.meetingFrequency,
            membershipType: formData.membershipType,
            rules: formData.groupRules,
            topics: formData.topics,
            adminId: userData?.id || userData?._id || userData?.user?.id || null
        };

        await hostService.createGroup(groupPayload);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (isReadOnly) {
            toast.warning("This property is approved and cannot be modified.");
            return;
        }

        if (!termsAccepted) {
            toast.warning("Please accept the terms to continue.");
            return;
        }

        setIsLoading(true);
        try {
            // Redux auth state is the absolute single source of truth.
            if (!userData) throw new Error("User not authenticated. Session verification failed.");

            let userId = userData.id || userData._id || userData.user_id || userData.user?.id || userData.user?._id;

            if (!userId) {
                console.error("❌ User ID Extraction Failed. Object keys:", Object.keys(userData || {}));
                throw new Error("User ID missing. Authentication failed.");
            }
            userId = String(userId);

            let idPhotoUrl = "";
            let selfiePhotoUrl = "";

            if (formData.idProof) {
                const fd = new FormData();
                let uploadFileObj = formData.idProof;
                try {
                    uploadFileObj = await compressImage(formData.idProof);
                } catch (err) {
                    console.error("Failed to compress idProof:", err);
                }
                fd.append('images', uploadFileObj);
                const res = await uploadFile(fd).unwrap();
                if (res.urls && res.urls.length > 0) idPhotoUrl = res.urls[0];
            }
            if (formData.profilePhoto) {
                const fd = new FormData();
                let uploadFileObj = formData.profilePhoto;
                try {
                    uploadFileObj = await compressImage(formData.profilePhoto);
                } catch (err) {
                    console.error("Failed to compress profilePhoto:", err);
                }
                fd.append('images', uploadFileObj);
                const res = await uploadFile(fd).unwrap();
                if (res.urls && res.urls.length > 0) selfiePhotoUrl = res.urls[0];
            }

            const hostPayload = {
                user_id: Number(userId) || userId,
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                country: formData.hostCountry,
                city: formData.hostCity,
                address: formData.hostAddress,
                id_type: formData.idType,
                id_number: formData.idNumber,
                id_photo: idPhotoUrl,
                selfie_photo: selfiePhotoUrl,
                whatsapp: formData.phone,
                userId: userId,
                fullName: formData.fullName,
                idType: formData.idType,
                idNumber: formData.idNumber,
                idPhoto: idPhotoUrl,
                selfiePhoto: selfiePhotoUrl,
                contribution_type: contributionType
            };

            // Save Host Profile if not existing
            if (!isExistingHost) {
                await saveHost(hostPayload).unwrap();
            }

            // Handle different contribution types
            switch (contributionType) {
                case 'property': {
                    let propertyId = editId;

                    if (!propertyId) {
                        const draftPayload = {
                            categoryId: formData.category,
                            propertyType: (formData.type || '').toLowerCase(),
                            privacyType: formData.privacyType
                        };
                        const draftRes = await createPropertyDraft(draftPayload).unwrap();
                        propertyId = draftRes.propertyId || (draftRes.data && draftRes.data.id) || draftRes.id;
                        if (!propertyId) throw new Error("Failed to create property draft ID.");

                        await updatePropertyBasic({
                            id: propertyId, data: {
                                title: formData.title || '',
                                description: formData.description || '',
                                guests: Number(formData.capacity) || 0,
                                bedrooms: Number(formData.bedrooms) || 0,
                                bathrooms: Number(formData.bathrooms) || 0,
                                petsAllowed: Number(formData.petsAllowed) || 0,
                                area: Number(formData.sqft) || 0,
                                propertyType: (formData.type || '').toLowerCase(),
                                categoryId: formData.category,
                                privacyType: formData.privacyType
                            }
                        }).unwrap();
                    } else {
                        await updatePropertyBasic({
                            id: propertyId, data: {
                                title: formData.title || '',
                                description: formData.description || '',
                                guests: Number(formData.capacity) || 0,
                                bedrooms: Number(formData.bedrooms) || 0,
                                bathrooms: Number(formData.bathrooms) || 0,
                                petsAllowed: Number(formData.petsAllowed) || 0,
                                area: Number(formData.sqft) || 0,
                                propertyType: (formData.type || '').toLowerCase(),
                                categoryId: formData.category,
                                privacyType: formData.privacyType
                            }
                        }).unwrap();
                    }

                    await updatePropertyAddress({
                        id: propertyId, data: {
                            country: formData.country?.name || (typeof formData.country === 'string' ? formData.country : 'India'),
                            state: formData.state || '',
                            city: formData.city || '',
                            zip_code: formData.pincode || '',
                            street_address: formData.address || '',
                            latitude: formData.latitude !== undefined && formData.latitude !== null ? Number(formData.latitude) : null,
                            longitude: formData.longitude !== undefined && formData.longitude !== null ? Number(formData.longitude) : null,
                            location_privacy: formData.locationPrivacy || 'approximate'
                        }
                    }).unwrap();

                    await handleSubmitProperty(propertyId);
                    await submitProperty(propertyId).unwrap();
                    break;
                }

                case 'event':
                    await handleSubmitEvent();
                    break;

                case 'group':
                    await handleSubmitGroup();
                    break;

                case 'local_guide':
                case 'travel_companion':
                case 'workshop': {
                    const contributionPayload = {
                        type: contributionType,
                        title: formData.title,
                        description: formData.description,
                        location: `${formData.city}, ${formData.country?.name || 'Unknown'}`,
                        userId: userId,
                        details: formData
                    };
                    await hostService.createCommunityContribution(contributionPayload);
                    break;
                }

                default:
                    throw new Error("Invalid contribution type");
            }

            const actionText = editId ? "Updated" : "Submitted";
            toast.success(`${getContributionTypeLabel(contributionType)} ${actionText} Successfully!`);
            navigate("/");

        } catch (error) {
            console.error("❌ Submission Workflow Error:", error);
            const msg = error.message || "Unknown error occurred.";
            toast.error(`Submission Failed: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        handleSubmit
    };
}
