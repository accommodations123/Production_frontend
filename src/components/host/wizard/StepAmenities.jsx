import React from 'react';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this utility exists

export function StepAmenities({
    formData,
    toggleAmenity,
    customAmenityInput,
    setCustomAmenityInput,
    addCustomAmenity,
    removeArrayItem,
    customRuleInput,
    setCustomRuleInput,
    addRule
}) {
    return (
        <div className="space-y-6 max-w-3xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What does it have?</h2>

            <div className="flex flex-wrap gap-3">
                {["Wifi", "AC", "Kitchen", "Washing Machine", "TV", "Parking", "Security", "Gym", "Pool", "Balcony", "Garden", "Elevator", "Pet Friendly"].map(item => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => toggleAmenity(item)}
                        className={cn(
                            "px-5 py-3 rounded-full text-sm border transition-all duration-200 cursor-pointer",
                            formData.amenities.includes(item)
                                ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                        )}
                    >
                        {item}
                    </button>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Add Extra Amenities</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="e.g. Rice Cooker, Gaming Chair..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26] text-slate-900 placeholder:text-slate-400 font-semibold text-sm transition-all"
                        value={customAmenityInput}
                        onChange={e => setCustomAmenityInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCustomAmenity()}
                    />
                    <button
                        onClick={addCustomAmenity}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 rounded-xl font-bold text-sm transition-all cursor-pointer"
                    >
                        Add
                    </button>
                </div>

                {formData.customAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {formData.customAmenities.map((item, i) => (
                            <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-200">
                                {item}
                                <button onClick={() => removeArrayItem('customAmenities', i)} className="hover:text-blue-900 cursor-pointer"><X className="h-3 w-3" /></button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* House Rules Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">House Rules - <span className="text-slate-400 text-xs lowercase">e.g. No smoking, Quiet hours after 10PM</span></label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Add a rule..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26] text-slate-900 placeholder:text-slate-400 font-semibold text-sm transition-all"
                        value={customRuleInput}
                        onChange={e => setCustomRuleInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addRule()}
                    />
                    <button
                        onClick={addRule}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 rounded-xl font-bold text-sm transition-all cursor-pointer"
                    >
                        Add
                    </button>
                </div>

                {formData.rules.length > 0 && (
                    <div className="flex flex-col gap-2 mt-4">
                        {formData.rules.map((rule, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2 bg-red-50 text-red-800 text-sm rounded-xl border border-red-200">
                                <span>{i + 1}. {rule}</span>
                                <button onClick={() => removeArrayItem('rules', i)} className="hover:text-red-950 p-1 cursor-pointer"><X className="h-4 w-4" /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
