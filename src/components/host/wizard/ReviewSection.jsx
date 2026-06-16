import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';

const ReviewSection = ({
  formData,
  termsAccepted,
  setTermsAccepted,
  handleSubmit,
  isLoading,
  displayedTerms
}) => {
  return (
    <section className="bg-black/20 rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-accent" />
        Review & Submit
      </h2>

      {/* Summary Card */}
      <div className="bg-black/20 rounded-2xl p-6 border border-white/10 space-y-4 mb-6">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{formData.title || 'Property Title'}</h3>
          <span className="text-accent font-bold">{formData.currency} {formData.priceMonth || '0'}/mo</span>
        </div>
        <p className="text-sm text-gray-400">{formData.address || 'Address'}, {formData.city || 'City'} - {formData.pincode || 'Pincode'}</p>
        <div className="flex gap-2">
          {formData.images.length} Photos • {formData.amenities.length + formData.customAmenities.length} Amenities
        </div>

      </div>

      {/* T&C */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-accent" />
          Terms & Conditions
        </h3>
        <div className="bg-white/5 rounded-xl p-4 overflow-y-auto text-sm text-gray-400 border border-white/10 max-h-[200px]">
          <ul className="list-disc pl-5 space-y-2">
            {displayedTerms.map((term, i) => (
              <li key={i}>{term}</li>
            ))}
          </ul>
        </div>
        <label className="flex items-center gap-3 cursor-pointer mt-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
          <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all ${termsAccepted ? 'bg-accent border-accent' : 'border-gray-500'}`}>
            {termsAccepted && <Check className="h-4 w-4 text-white" />}
          </div>
          <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="hidden" />
          <span className="text-sm font-medium">I agree to the Host Terms & Conditions</span>
        </label>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!termsAccepted || isLoading}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${termsAccepted
          ? 'bg-gradient-to-r from-accent to-purple-600 shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98]'
          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Publishing...
          </span>
        ) : "Publish Listing"}
      </button>
    </section>
  );
};

export default ReviewSection;