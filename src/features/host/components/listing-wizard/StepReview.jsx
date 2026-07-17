import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';

export function StepReview({
    formData,
    termsAccepted,
    setTermsAccepted,
    displayedTerms,
    handleSubmit,
    isLoading,
    isReadOnly
}) {
    return (
        <div className="flex h-full w-full flex-col space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Review & Submit</h2>

            {/* Duration Alert */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-sm text-amber-200 flex items-start gap-3 backdrop-blur-sm">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                    <span className="font-bold text-amber-300">Listing Duration:</span> Approved property listings are valid for <span className="font-bold text-white">15 days</span>. You can track remaining days or renew the listing from your Host dashboard.
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-black/20 rounded-2xl p-6 border border-white/10 space-y-4">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{formData.title}</h3>
                    <span className="text-accent font-bold">${formData.priceMonth}/mo</span>
                </div>
                <p className="text-sm text-gray-400">{formData.address}, {formData.city} - {formData.pincode}</p>
                <div className="flex gap-2">
                    {formData.images.length} Photos • {formData.amenities.length + formData.customAmenities.length} Amenities
                </div>

            </div>

            {/* T&C */}
            <div className="flex-1 min-h-0 flex flex-col">
                <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-accent" />
                    Terms & Conditions
                </h3>
                <div className="bg-white/5 rounded-xl p-4 overflow-y-auto text-sm text-gray-400 border border-white/10 flex-1 max-h-[200px]">
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
                onClick={handleSubmit}
                disabled={!termsAccepted || isLoading || isReadOnly}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${termsAccepted && !isReadOnly
                    ? 'bg-gradient-to-r from-accent to-purple-600 shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Publishing...
                    </span>
                ) : isReadOnly ? "View Only (Approved)" : "Publish Listing"}
            </button>
        </div>
    );
}
