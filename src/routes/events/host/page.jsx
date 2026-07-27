import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { AlertCircle, Loader2, Calendar } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Breadcrumb } from "@/shared/ui/Breadcrumb"

// Components
import { StepIndicator } from "@/features/events/components/host/StepIndicator"
import { EventDetailsSection } from "@/features/events/components/host/EventDetailsSection"
import { LocationSection } from "@/features/events/components/host/LocationSection"
import { MediaUploadSection } from "@/features/events/components/host/MediaUploadSection"
import { RulesSection } from "@/features/events/components/host/RulesSection"
import { SuccessState } from "@/features/events/components/host/SuccessState"

// Hooks
import { useHostEvent } from "@/features/events/hooks/useHostEvent"
import { useGetHostProfileQuery } from "@/store/api/propertyApi"
import { useGetMeQuery } from "@/store/api/authApi"

export default function HostEventPage() {
  const navigate = useNavigate()
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
      <main className="min-h-screen bg-[#FAF9F6] font-sans py-12 px-4">
        
        <div className="flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-md p-8 text-center border border-slate-200/80">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#00142E] mb-2">Account Verification Pending</h2>
            <p className="text-slate-500 text-sm mb-6 font-medium">
              {hostProfile?.status === 'pending'
                ? "Your host application is currently under review. You can create events once your account is approved."
                : "You need to be an approved host to create events."}
            </p>

          </div>
        </div>
        
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-4 sm:py-6 sm:px-6 lg:px-8 font-sans">
      
      <div className="w-full max-w-5xl mx-auto space-y-5">
        
        {/* Top Return Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/80 pb-4">
          <Breadcrumb
            items={[
              { label: "Events", path: "/events" },
              { label: isEdit ? "Edit Event" : "Host Event" }
            ]}
          />
          <span className="text-xs font-bold text-gray-400">Host an Event</span>
        </div>

        {isSuccess ? (
          <SuccessState />
        ) : (
          <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-md">
            
            {/* Header with Icon & Clean Subtitle */}
            <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-6 text-left">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-[#00142E] shrink-0">
                <Calendar className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#00142E] tracking-tight">
                  {isEdit ? "Edit Event Details" : "Host an Event"}
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">
                  {isEdit ? "Update your event details below." : "Organize local meetups, cultural festivals, and community celebrations."}
                </p>
              </div>
            </div>

            {/* Step Indicator */}
            <StepIndicator step={step} />

            <form onSubmit={handleSubmit} className="py-6 space-y-6">
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
      </main>
    )
  }
