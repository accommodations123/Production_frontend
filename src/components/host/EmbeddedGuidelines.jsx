import React from 'react';
import { uploadGuidelines } from '@/lib/upload-guidelines';
import { universalRules } from '@/lib/host-rules-data';
import { Shield, Info } from 'lucide-react';

export function EmbeddedGuidelines({ currentStep, activeCountry, selectedCategory }) {
    // Get universal rules for the active country
    const countryRules = universalRules[activeCountry?.code] || universalRules['US'];

    // Get category specific rules if a category is selected
    const categoryRules = selectedCategory
        ? (selectedCategory.rules[activeCountry?.code] || selectedCategory.rules['US'])
        : [];

    return (
        <div className="h-full flex flex-col gap-4 border-l border-white/20 pl-8 ml-4">
            {/* Dynamic Country Rules Card */}
            <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3 text-indigo-900">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-sm">Rules for {activeCountry?.name || 'Hosting'}</h3>
                </div>

                <div className="space-y-3">
                    {currentStep === 2 && selectedCategory ? (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-700">{selectedCategory.name} Requirements:</p>
                            <ul className="space-y-2">
                                {categoryRules.slice(0, 3).map((rule, idx) => (
                                    <li key={idx} className="text-xs text-gray-600 flex gap-2">
                                        <span className="text-indigo-500">•</span>
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-700">General Requirements:</p>
                            <ul className="space-y-2">
                                {countryRules.slice(0, 3).map((rule, idx) => (
                                    <li key={idx} className="text-xs text-gray-600 flex gap-2">
                                        <span className="text-green-500">✓</span>
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Helpful Tips */}
            <div className="flex-1 flex flex-col">
                <div className="mb-4">
                    <h3 className="font-bold text-gray-900 text-sm">Helpful Tips</h3>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2 max-h-[400px]">
                    {uploadGuidelines.map((guide) => {
                        const Icon = guide.icon;
                        let isRelevant = false;
                        if (currentStep === 1 && [10].includes(guide.id)) isRelevant = true; // Host Identity
                        if (currentStep === 2 && [2, 3, 4].includes(guide.id)) isRelevant = true; // Basic Info
                        if (currentStep === 3 && [5].includes(guide.id)) isRelevant = true; // Location
                        if (currentStep === 4 && [1, 14].includes(guide.id)) isRelevant = true; // Media
                        if (currentStep === 5 && [7, 8, 9, 11, 12, 10].includes(guide.id)) isRelevant = true; // Amenities & Doc
                        if (currentStep === 6 && [6, 13].includes(guide.id)) isRelevant = true; // Pricing
                        if (currentStep === 7 && [15].includes(guide.id)) isRelevant = true; // Review

                        if (!isRelevant) return null;

                        return (
                            <div key={guide.id} className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 p-1.5 rounded-lg bg-blue-50 text-blue-600">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900">
                                            {guide.title}
                                        </h4>
                                        <ul className="mt-1 space-y-1">
                                            {guide.content.map((item, idx) => (
                                                <li key={idx} className="text-xs leading-relaxed text-gray-600 flex items-start gap-1.5">
                                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Fallback if no specific tips */}
                    <div className="text-center p-4 text-gray-400 text-xs">
                        <Info className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p>Complete this step to see more tips</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
