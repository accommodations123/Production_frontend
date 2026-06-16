"use client"
import React from "react"
import { LifeBuoy, FileText, HelpCircle, PhoneCall, ChevronRight } from "lucide-react"

export const Support = () => {
    const options = [
        { label: "Help Center", count: "150+ articles", icon: HelpCircle },
        { label: "Contact Us", count: "24/7 Available", icon: PhoneCall },
        { label: "Documentation", count: "API & Guides", icon: FileText },
        { label: "Live Support", count: "Average 2min wait", icon: LifeBuoy }
    ]

    return (
        <div className="p-4 md:p-12">
            <div className="mb-8 md:mb-10 pb-6 md:pb-8 border-b border-neutral/10">
                <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Help & Support</h3>
                <p className="text-sm md:text-base text-[#00142E]/50">Get assistance and browse our resources.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 auto-rows-auto">
                {options.map((opt, i) => (
                    <div key={i} className="group p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-[#F8F9FA] border border-transparent hover:border-accent/20 hover:bg-white hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 cursor-pointer flex flex-col h-auto">
                        <div className="flex items-start justify-between mb-4 md:mb-6 shrink-0">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-white shadow-sm rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:shadow-lg group-hover:shadow-accent/20 transition-all duration-300">
                                <opt.icon className="w-6 h-6 md:w-7 md:h-7 text-accent group-hover:text-white transition-colors" />
                            </div>
                            <ChevronRight className="w-5 h-5 text-neutral/30 group-hover:text-accent transition-all shrink-0" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg md:text-xl font-bold mb-1">{opt.label}</h4>
                            <p className="text-sm md:text-base text-[#00142E]/50 font-medium">{opt.count}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 md:mt-12 bg-primary rounded-[32px] md:rounded-[40px] p-6 md:p-10 text-white relative overflow-hidden">
                <div className="relative z-10 max-w-md">
                    <h4 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Dedicated Account Manager</h4>
                    <p className="text-sm md:text-base text-white/60 mb-6 md:mb-8 leading-relaxed">As a premium host, you have access to a personal consultant to help you optimize your listings.</p>
                    <button className="bg-white text-primary px-8 h-10 md:h-12 rounded-xl md:rounded-2xl font-bold hover:bg-accent hover:text-white transition-all text-sm md:text-base w-full sm:w-auto">Schedule a Call</button>
                </div>
                <div className="absolute top-[-20%] right-[-10%] w-48 h-48 md:w-64 md:h-64 bg-accent/20 rounded-full blur-[60px] md:blur-[80px]" />
            </div>
        </div>
    )
}
