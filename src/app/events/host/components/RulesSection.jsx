import React from "react"
import { FileText, Upload, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


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
            <div className="rounded-xl p-6 border bg-[#f8f9fa] border-[#00162d]">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-[#00162d]">
                    <FileText className="mr-2 h-5 w-5 text-[#00162d]" />
                    Event Rules & Requirements
                </h3>

                <div className="bg-white rounded-lg p-4 border border-[#00162d]">
                    <div className="space-y-3">
                        {activeRules.map((rule, index) => (
                            <div key={index} className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center mr-3 mt-0.5 bg-[#00162d]">
                                    <span className="text-white text-xs font-medium">{index + 1}</span>
                                </div>
                                <p className="text-gray-700">{rule}</p>
                            </div>
                        ))}
                    </div>
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
