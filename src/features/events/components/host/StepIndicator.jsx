export const StepIndicator = ({ step }) => {
    return (
        <div className="pb-8 mb-8 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">

                {/* STEP 1 */}
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step === 1 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}
                    >
                        <span>1</span>
                    </div>

                    <div className="min-w-0">
                        <h3 className={`font-semibold ${step === 1 ? 'text-gray-900' : 'text-gray-400'}`}>Event Details</h3>
                        <p className="text-sm text-gray-500">
                            Basic information about your event
                        </p>
                    </div>
                </div>

                {/* STEP 2 */}
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step === 2 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}
                    >
                        <span>2</span>
                    </div>

                    <div className="min-w-0">
                        <h3 className={`font-semibold ${step === 2 ? 'text-gray-900' : 'text-gray-400'}`}>Rules & Verification</h3>
                        <p className="text-sm text-gray-500">
                            Complete requirements
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}