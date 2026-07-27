import { FileText, AlertCircle } from "lucide-react"


export const RulesSection = ({ country, handleFileChange }) => {
    const activeRules = [
        "Event must comply with local laws and regulations",
        "Ensure proper safety measures are in place",
        "Provide accurate event information",
        "Maintain a safe and inclusive environment",
        "Follow platform community guidelines"
    ];

    return (
        <div className="space-y-6">
            <div className="py-8 space-y-6">
                <h3 className="text-xl font-bold flex items-center text-gray-900">
                    <FileText className="mr-2 h-5 w-5" />
                    Event Rules & Requirements
                </h3>

                <div className="space-y-3">
                    {activeRules.map((rule, index) => (
                        <div key={index} className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center mr-3 mt-0.5 bg-primary">
                                <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                            <p className="text-gray-700">{rule}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    <div className="flex items-center p-4 rounded-lg bg-[#fff5f5] border border-[#c92a26]">
                        <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 text-[#c92a26]" />
                        <p className="text-sm text-[#c92a26]">
                            Please ensure your event complies with all the rules and requirements listed above.
                            Non-compliance may result in your event being rejected.
                        </p>
                    </div>
                </div>
            </div>


        </div>
    )
}
