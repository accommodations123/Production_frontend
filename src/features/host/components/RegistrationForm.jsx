import { useHostRegistration } from '../hooks/useHostRegistration';
import { PersonalInfoSection } from './registration/PersonalInfoSection';
import { AddressSection } from './registration/AddressSection';
import { SocialMediaSection } from './registration/SocialMediaSection';

export default function RegistrationForm() {
  const {
    formData, setFormData, handleChange, focusedField, setFocusedField,
    isSubmitting, isSubmitLoading, isError, error, showSuccess, submitError,
    pincodeLoading, activeSocials, toggleSocial, hostProfile, loc, handleSubmit,
  } = useHostRegistration();

  const isDisabled = isSubmitting || isSubmitLoading || hostProfile?.status === 'pending';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-2 pb-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-8 text-center max-w-md transform transition-all animate-bounce-in shadow-2xl border border-green-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Application Submitted!</h3>
            <p className="text-[#222222] mb-6">Your host application has been received and is under review. We'll notify you once it's approved.</p>
            <div className="flex justify-center">
              <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Success
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-none">
        <div className="pb-6 border-b border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Become a Host</h1>
          <p className="text-[#222222] mt-2 text-lg">Join our community and start hosting today</p>
        </div>

        {/* Pending Status */}
        {hostProfile?.status === 'pending' && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 m-6 rounded-lg animate-pulse">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-blue-800">Application Under Review</h3>
                <p className="text-blue-700">We've received your application and our team is reviewing it. You'll be notified via email once approved.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {(isError || submitError) && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-700">{submitError || (error?.data?.message || 'Failed to submit application. Please try again.')}</p>
                {error?.status === 'PARSING_ERROR' && (
                  <p className="mt-2 text-xs text-red-600">Server returned an unexpected response. This might be a temporary issue.</p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <PersonalInfoSection formData={formData} handleChange={handleChange} focusedField={focusedField} setFocusedField={setFocusedField} setFormData={setFormData} />
          <AddressSection loc={loc} formData={formData} handleChange={handleChange} pincodeLoading={pincodeLoading} />
          <SocialMediaSection formData={formData} handleChange={handleChange} setFormData={setFormData} activeSocials={activeSocials} toggleSocial={toggleSocial} />

          {/* Submit */}
          <div className="pt-8 flex justify-end">
            <button type="submit" disabled={isDisabled} className={`inline-flex justify-center py-3 px-8 border border-transparent shadow-lg text-sm font-medium rounded-full text-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:scale-105 ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/80'}`}>
              {isSubmitting || isSubmitLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit for Verification
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
