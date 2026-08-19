"use client"

import React from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

// Components
import { StepIndicator } from "./components/StepIndicator"
import { EventDetailsSection } from "./components/EventDetailsSection"
import { LocationSection } from "./components/LocationSection"
import { MediaUploadSection } from "./components/MediaUploadSection"
import { RulesSection } from "./components/RulesSection"
import { SuccessState } from "./components/SuccessState"

// Hooks
import { useHostEvent } from "./hooks/useHostEvent"
import { useGetHostProfileQuery } from "@/store/api/hostApi"
import { useGetMeQuery } from "@/store/api/authApi"

export default function HostEventPage() {
  const { data: userData } = useGetMeQuery()
  const { data: hostProfile, isLoading: isProfileLoading } = useGetHostProfileQuery(undefined, {
    skip: !userData
  })

  const isVerifiedHost = hostProfile?.status === 'approved';

  const {
    step,
    setStep,
    isSubmitting,
    isSuccess,
    error,
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
    isEdit, // From hook
    isReadOnly
  } = useHostEvent()

  if (isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isVerifiedHost) {
    return (
      <main className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <div className="pt-28 pb-12 px-4 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Verification Pending</h2>
            <p className="text-gray-600 mb-6">
              {hostProfile?.status === 'pending'
                ? "Your host application is currently under review. You can create events once your account is approved."
                : "You need to be an approved host to create events."}
            </p>

          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="pt-28 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header with Brand Text */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isEdit ? "Edit Event" : "Host an Event"}
            </h1>
            <p className="text-gray-600 text-lg">
              {isEdit ? "Update your event details below." : "Create memorable experiences for the NextKinLife community."}
            </p>
          </div>

          {isSuccess ? (
            <SuccessState />
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Step Indicator */}
              <StepIndicator step={step} />

              <form onSubmit={handleSubmit} className="p-8">
                {/* Error Display */}
                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Upload Progress Display */}
                {uploadProgress > 0 && (
                  <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">Uploading Media</span>
                      <span className="text-sm text-blue-700">
                        {Math.round(uploadProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <EventDetailsSection
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />

                      {formData.event_mode !== 'online' && (
                        <LocationSection
                          formData={formData}
                          handleInputChange={handleInputChange}
                        />
                      )}

                      <MediaUploadSection
                        previewImages={previewImages}
                        handleBannerImageChange={handleBannerImageChange}
                        handleGalleryImagesChange={handleGalleryImagesChange}
                        removeGalleryImage={removeGalleryImage}
                        setPreviewImages={(val) => { }} // Managed by hook, but matching signature
                        setFormData={handleInputChange}
                      />

                      <Button
                        type="button"
                        onClick={handleNextStep}
                        disabled={isSubmitting} // Removing disabled={isReadOnly} to allow viewing
                        className="w-full text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg h-12"
                        style={{ backgroundColor: "#00162d" }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Next: Rules & Verification"
                        )}
                      </Button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <RulesSection
                        country={formData.country}
                        handleFileChange={handleFileChange}
                      />

                      <div className="flex space-x-4">
                        <Button
                          type="button"
                          onClick={() => setStep(1)}
                          variant="outline"
                          className="flex-1 font-medium py-3 h-12"
                          style={{ borderColor: "#00162d", borderWidth: "1px", color: "#c92a26" }}
                        >
                          Previous
                        </Button>

                        <Button
                          type="submit"
                          disabled={isSubmitting || isReadOnly}
                          className="flex-1 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg h-12"
                          style={{ backgroundColor: isReadOnly ? "#9ca3af" : "#c92a26" }}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : isReadOnly ? (
                            "View Only (Approved)"
                          ) : (
                            "Submit Event"
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}