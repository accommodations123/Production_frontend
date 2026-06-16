import React from 'react';
import { uploadGuidelines } from '@/lib/upload-guidelines';
import { categories, universalRules } from '@/lib/host-rules-data';
import { Shield, AlertTriangle, Info } from 'lucide-react';

export function GuidelinesSidebar({ currentStep, activeCountry, selectedCategory }) {
    // Get universal rules for the active country
    const countryRules = universalRules[activeCountry?.code] || universalRules['US'];

    // Get category specific rules if a category is selected
    const categoryRules = selectedCategory
        ? (selectedCategory.rules[activeCountry?.code] || selectedCategory.rules['US'])
        : [];

    return (
        <div className="hidden lg:block w-80 h-[calc(100vh-5rem)] sticky top-20 flex flex-col gap-4">
            {/* Dynamic Country Rules Card */}
            <div className="bg-white/80 backdrop-blur-md border border-indigo-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-indigo-900">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-sm">Rules for {activeCountry?.name || 'Hosting'}</h3>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {currentStep === 1 && selectedCategory ? (
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

            {/* Existing Guidelines */}
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 text-sm">Helpful Tips</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {uploadGuidelines.map((guide) => {
                        const Icon = guide.icon;
                        let isRelevant = false;
                        if (currentStep === 1 && [2, 3, 4].includes(guide.id)) isRelevant = true;
                        if (currentStep === 2 && [5].includes(guide.id)) isRelevant = true;
                        if (currentStep === 3 && [1, 14].includes(guide.id)) isRelevant = true;
                        if (currentStep === 4 && [7, 8, 9, 11, 12].includes(guide.id)) isRelevant = true;
                        if (currentStep === 5 && [10].includes(guide.id)) isRelevant = true;
                        if (currentStep === 6 && [6, 13].includes(guide.id)) isRelevant = true;
                        if (currentStep === 7 && [15].includes(guide.id)) isRelevant = true;

                        if (!isRelevant) return null; // Only show relevant tips to keep it clean

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
