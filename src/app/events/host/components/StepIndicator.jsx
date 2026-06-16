export const StepIndicator = ({ step }) => {
    return (
        <div className="px-6 md:px-8 py-6 mb-8 rounded-2xl overflow-hidden shadow-lg"
            style={{ background: "linear-gradient(to right, #00162d, #003366)" }}>

            {/* ✅ FIXED HERE */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">

                {/* STEP 1 */}
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 1 ? 'text-white' : 'bg-white/20 text-white'}`}
                        style={{ backgroundColor: step === 1 ? "#c92a26" : "" }}
                    >
                        <span className="font-semibold">1</span>
                    </div>

                    <div className="text-white min-w-0">
                        <h3 className="font-semibold break-words">Event Details</h3>
                        <p className="text-sm opacity-80 break-words">
                            Basic information about your event
                        </p>
                    </div>
                </div>

                {/* STEP 2 */}
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 2 ? 'text-white' : 'bg-white/20 text-white'}`}
                        style={{ backgroundColor: step === 2 ? "#c92a26" : "" }}
                    >
                        <span className="font-semibold">2</span>
                    </div>

                    <div className="text-white min-w-0">
                        <h3 className="font-semibold break-words">Rules & Verification</h3>
                        <p className="text-sm opacity-80 break-words">
                            Complete requirements
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}