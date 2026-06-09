import React, { useRef } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { CATEGORIES } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Check, AlertCircle, FileText, MapPin, DollarSign, Image, Sparkles, ShieldCheck } from 'lucide-react';

// Import New Hook & Components
import { useHostCreation } from '@/hooks/useHostCreation';

// Import Step Components
import { StepBasics } from '@/components/host/wizard/StepBasics';
import { StepLocation } from '@/components/host/wizard/StepLocation';
import { StepPricing } from '@/components/host/wizard/StepPricing';
import { StepMedia } from '@/components/host/wizard/StepMedia';
import { StepAmenities } from '@/components/host/wizard/StepAmenities';
import { StepReview } from '@/components/host/wizard/StepReview';

export default function HostCreatePage() {
    const {
        formData,
        setFormData,
        customAmenityInput,
        setCustomAmenityInput,
        customRuleInput,
        setCustomRuleInput,
        termsAccepted,
        setTermsAccepted,
        displayedTerms,
        handleFileChange,
        removeArrayItem,
        toggleAmenity,
        addCustomAmenity,
        addRule,
        handleSubmit,
        contributionType,
        isEdit,
        isReadOnly,
        isLoading
    } = useHostCreation();

    // Section Reference DOM IDs
    const sectionRefs = {
        basics: useRef(null),
        location: useRef(null),
        pricing: useRef(null),
        media: useRef(null),
        amenities: useRef(null),
        review: useRef(null)
    };

    // Scroll helper
    const scrollToSection = (id) => {
        sectionRefs[id].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Validation Status Checks (Real-time Feedback)
    const isBasicsValid = () => {
        const hasTitle = formData.title && formData.title.trim() !== "";
        const hasCategory = !!formData.category;
        const hasDescription = formData.description && formData.description.trim() !== "";
        
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
        return !!(hasTitle && hasCategory && hasDescription && hasCapacity && hasBedrooms && hasBathrooms && hasPropertyType && hasPrivacyType);
    };

    const isLocationValid = () => {
        const hasAddress = formData.address && formData.address.trim() !== "";
        const hasCity = formData.city && formData.city.trim() !== "";
        const hasState = formData.state && formData.state.trim() !== "";
        const hasCountry = formData.country && (typeof formData.country === 'object' ? !!formData.country.name : !!formData.country);
        
        const isZipRequired = (country) => {
            if (!country) return false;
            const code = (typeof country === 'object' ? country.code : '') || '';
            const name = (typeof country === 'object' ? country.name : country) || '';
            const codeUpper = code.toUpperCase().trim();
            const nameLower = name.toLowerCase().trim();
            const requiredCodes = ["US", "IN", "GB", "CA", "AU", "DE", "FR"];
            const requiredNames = ["united states", "united states of america", "india", "united kingdom", "great britain", "canada", "australia", "germany", "france"];
            return requiredCodes.includes(codeUpper) || requiredNames.includes(nameLower);
        };
        const zipRequired = isZipRequired(formData.country);
        const hasZip = !zipRequired || (formData.pincode && formData.pincode.trim() !== "");
        return !!(hasAddress && hasCity && hasState && hasCountry && hasZip);
    };

    const isPricingValid = () => {
        const hasPrice = formData.priceMonth !== "" && formData.priceMonth !== null && formData.priceMonth !== undefined;
        const hasCurrency = !!formData.currency;
        return !!(hasPrice && hasCurrency);
    };

    const isMediaValid = () => {
        return formData.images && formData.images.length >= 1;
    };

    const isAmenitiesValid = () => {
        return (formData.amenities.length + formData.customAmenities.length) > 0;
    };

    // Combined Form Verification & Submit Trigger
    const handleFormSubmit = (e) => {
        if (e) e.preventDefault();

        if (isReadOnly) {
            toast.warning("This property listing is approved and cannot be modified.");
            return;
        }

        if (!isBasicsValid()) {
            toast.error("Please complete all required fields in the Property Basics section.");
            scrollToSection('basics');
            return;
        }

        if (!isLocationValid()) {
            toast.error("Please complete all required fields in the Location section.");
            scrollToSection('location');
            return;
        }

        if (!isPricingValid()) {
            toast.error("Please enter a valid monthly price and currency in the Pricing section.");
            scrollToSection('pricing');
            return;
        }

        if (!isMediaValid()) {
            toast.error("Please upload at least one photo of your property in the Media section.");
            scrollToSection('media');
            return;
        }

        if (!termsAccepted) {
            toast.warning("Please accept the terms to complete submission.");
            scrollToSection('review');
            return;
        }

        handleSubmit(e);
    };

    return (
        <main className="min-h-screen bg-[#020b18] text-[#f7eed7] font-sans selection:bg-accent/30 pb-20">
            <Navbar />

            <div className="container mx-auto px-4 pt-28 max-w-7xl">
                {/* Premium Page Header */}
                <div className="mb-10 text-center lg:text-left">
                    <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent tracking-tight">
                        {isEdit ? "Update Your Property Space" : "Host Your Space"}
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">
                        Provide your accommodation details below to list it on NextKinLife.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Sticky Progress Navigation Sidebar */}
                    <div className="lg:col-span-3 sticky top-28 hidden lg:block">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-3">Sections Status</h3>
                            
                            <nav className="flex flex-col gap-2">
                                <button
                                    onClick={() => scrollToSection('basics')}
                                    className="flex items-center justify-between w-full p-3.5 rounded-xl hover:bg-white/5 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-gray-400 group-hover:text-accent transition-colors" />
                                        <span className="text-sm font-semibold text-gray-300">Property Basics</span>
                                    </div>
                                    {isBasicsValid() ? (
                                        <Check className="h-4.5 w-4.5 text-green-500 bg-green-500/10 rounded-full p-0.5 border border-green-500/20" />
                                    ) : (
                                        <AlertCircle className="h-4.5 w-4.5 text-gray-500" />
                                    )}
                                </button>

                                <button
                                    onClick={() => scrollToSection('location')}
                                    className="flex items-center justify-between w-full p-3.5 rounded-xl hover:bg-white/5 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-gray-400 group-hover:text-accent transition-colors" />
                                        <span className="text-sm font-semibold text-gray-300">Location Details</span>
                                    </div>
                                    {isLocationValid() ? (
                                        <Check className="h-4.5 w-4.5 text-green-500 bg-green-500/10 rounded-full p-0.5 border border-green-500/20" />
                                    ) : (
                                        <AlertCircle className="h-4.5 w-4.5 text-gray-500" />
                                    )}
                                </button>

                                <button
                                    onClick={() => scrollToSection('pricing')}
                                    className="flex items-center justify-between w-full p-3.5 rounded-xl hover:bg-white/5 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="h-5 w-5 text-gray-400 group-hover:text-accent transition-colors" />
                                        <span className="text-sm font-semibold text-gray-300">Pricing Options</span>
                                    </div>
                                    {isPricingValid() ? (
                                        <Check className="h-4.5 w-4.5 text-green-500 bg-green-500/10 rounded-full p-0.5 border border-green-500/20" />
                                    ) : (
                                        <AlertCircle className="h-4.5 w-4.5 text-gray-500" />
                                    )}
                                </button>

                                <button
                                    onClick={() => scrollToSection('media')}
                                    className="flex items-center justify-between w-full p-3.5 rounded-xl hover:bg-white/5 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Image className="h-5 w-5 text-gray-400 group-hover:text-accent transition-colors" />
                                        <span className="text-sm font-semibold text-gray-300">Photos & Media</span>
                                    </div>
                                    {isMediaValid() ? (
                                        <Check className="h-4.5 w-4.5 text-green-500 bg-green-500/10 rounded-full p-0.5 border border-green-500/20" />
                                    ) : (
                                        <AlertCircle className="h-4.5 w-4.5 text-gray-500" />
                                    )}
                                </button>

                                <button
                                    onClick={() => scrollToSection('amenities')}
                                    className="flex items-center justify-between w-full p-3.5 rounded-xl hover:bg-white/5 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="h-5 w-5 text-gray-400 group-hover:text-accent transition-colors" />
                                        <span className="text-sm font-semibold text-gray-300">Amenities & Rules</span>
                                    </div>
                                    {isAmenitiesValid() ? (
                                        <Check className="h-4.5 w-4.5 text-green-500 bg-green-500/10 rounded-full p-0.5 border border-green-500/20" />
                                    ) : (
                                        <AlertCircle className="h-4.5 w-4.5 text-gray-500" />
                                    )}
                                </button>

                                <button
                                    onClick={() => scrollToSection('review')}
                                    className="flex items-center justify-between w-full p-3.5 rounded-xl hover:bg-white/5 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="h-5 w-5 text-gray-400 group-hover:text-accent transition-colors" />
                                        <span className="text-sm font-semibold text-gray-300">Submit Review</span>
                                    </div>
                                    {termsAccepted ? (
                                        <Check className="h-4.5 w-4.5 text-green-500 bg-green-500/10 rounded-full p-0.5 border border-green-500/20" />
                                    ) : (
                                        <AlertCircle className="h-4.5 w-4.5 text-gray-500" />
                                    )}
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Right Column: Unified Form Cards */}
                    <div className="lg:col-span-9 space-y-10">
                        
                        {/* Section 1: Property Basics */}
                        <div 
                            ref={sectionRefs.basics} 
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden transition-all hover:border-white/20 shadow-xl"
                        >
                            <StepBasics
                                formData={formData}
                                setFormData={setFormData}
                                categories={CATEGORIES}
                                isEdit={isEdit}
                            />
                        </div>

                        {/* Section 2: Location Details */}
                        <div 
                            ref={sectionRefs.location} 
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden transition-all hover:border-white/20 shadow-xl"
                        >
                            <StepLocation
                                formData={formData}
                                setFormData={setFormData}
                            />
                        </div>

                        {/* Section 3: Pricing Options */}
                        <div 
                            ref={sectionRefs.pricing} 
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden transition-all hover:border-white/20 shadow-xl"
                        >
                            <StepPricing
                                formData={formData}
                                setFormData={setFormData}
                                contributionType={contributionType}
                            />
                        </div>

                        {/* Section 4: Photos & Media */}
                        <div 
                            ref={sectionRefs.media} 
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden transition-all hover:border-white/20 shadow-xl"
                        >
                            <StepMedia
                                formData={formData}
                                setFormData={setFormData}
                                handleFileChange={handleFileChange}
                                removeArrayItem={removeArrayItem}
                            />
                        </div>

                        {/* Section 5: Amenities & Rules */}
                        <div 
                            ref={sectionRefs.amenities} 
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden transition-all hover:border-white/20 shadow-xl"
                        >
                            <StepAmenities
                                formData={formData}
                                toggleAmenity={toggleAmenity}
                                customAmenityInput={customAmenityInput}
                                setCustomAmenityInput={setCustomAmenityInput}
                                addCustomAmenity={addCustomAmenity}
                                removeArrayItem={removeArrayItem}
                                customRuleInput={customRuleInput}
                                setCustomRuleInput={setCustomRuleInput}
                                addRule={addRule}
                            />
                        </div>

                        {/* Section 6: Submit Review */}
                        <div 
                            ref={sectionRefs.review} 
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden transition-all hover:border-white/20 shadow-xl"
                        >
                            <StepReview
                                formData={formData}
                                termsAccepted={termsAccepted}
                                setTermsAccepted={setTermsAccepted}
                                displayedTerms={displayedTerms}
                                handleSubmit={handleFormSubmit}
                                isLoading={isLoading}
                                STEPS={[]}
                                isReadOnly={isReadOnly}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}