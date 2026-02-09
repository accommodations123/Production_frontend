import React, { useState } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Scale, FileText, Globe, AlertTriangle, CheckCircle, ShieldCheck, ChevronDown } from "lucide-react";
import { VISA_GUIDES, LEGAL_RIGHTS } from "@/lib/legal-data";

export default function LegalPage() {
    const [activeCountry, setActiveCountry] = useState(VISA_GUIDES[0]);
    const [checkedItems, setCheckedItems] = useState({});
    const [expandedRight, setExpandedRight] = useState(null);

    const handleCheck = (item) => {
        setCheckedItems(prev => ({
            ...prev,
            [item]: !prev[item]
        }));
    };

    const completedCount = activeCountry.checklist.filter(item => checkedItems[item]).length;
    const totalCount = activeCountry.checklist.length;
    const progressPercentage = (completedCount / totalCount) * 100;

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-[#07182A] text-white pt-32 pb-16 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Legal & Documentation Help</h1>
                    <p className="text-xl text-gray-300 mb-8">Simplify your visa process, understand your rights, and avoid immigration scams.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content: Visa Guides */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Country Selector */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-2xl font-bold text-[#07182A] mb-6 flex items-center gap-2">
                                <Globe className="h-6 w-6 text-[#07182A]" /> Visa Guides
                            </h2>
                            <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                                {VISA_GUIDES.map(guide => (
                                    <button
                                        key={guide.id}
                                        onClick={() => {
                                            setActiveCountry(guide);
                                            setCheckedItems({}); // Reset checklist on country change
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeCountry.id === guide.id
                                            ? 'bg-[#07182A] text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {guide.country}
                                    </button>
                                ))}
                            </div>

                            {/* Visa Types Cards */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {activeCountry.types.map((type, idx) => (
                                    <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <h3 className="font-bold text-[#07182A] text-lg mb-2">{type.name}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                                        <ul className="space-y-2">
                                            {type.details?.map((detail, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C93A30] flex-shrink-0" />
                                                    <span>{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Interactive Checklist Card */}
                            <div className="bg-white rounded-xl border border-[#07182A] overflow-hidden shadow-sm">
                                {/* Progress Bar Header */}
                                <div className="bg-gray-50 p-6 border-b border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-[#07182A] flex items-center gap-2">
                                            <FileText className="h-5 w-5" /> Document Checklist: {activeCountry.country}
                                        </h3>
                                        <span className="text-sm font-bold text-[#C93A30]">{completedCount} of {totalCount} completed</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-[#C93A30] h-2.5 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Checklist Items */}
                                <div className="p-6 space-y-3">
                                    {activeCountry.checklist.map(item => (
                                        <div
                                            key={item}
                                            onClick={() => handleCheck(item)}
                                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checkedItems[item] ? 'bg-[#C93A30] border-[#C93A30]' : 'border-gray-300 group-hover:border-[#C93A30]'
                                                }`}>
                                                {checkedItems[item] && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                                            </div>
                                            <span className={`text-sm font-medium transition-colors ${checkedItems[item] ? 'text-gray-400 line-through' : 'text-gray-700'
                                                }`}>
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Know Your Rights - Accordion */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-2xl font-bold text-[#07182A] mb-6 flex items-center gap-2">
                                <Scale className="h-6 w-6 text-[#07182A]" /> Know Your Rights
                            </h2>
                            <div className="space-y-4">
                                {LEGAL_RIGHTS.map(right => (
                                    <div key={right.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setExpandedRight(expandedRight === right.id ? null : right.id)}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                        >
                                            <span className="font-bold text-[#07182A]">{right.title}</span>
                                            <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${expandedRight === right.id ? 'rotate-180' : ''}`} />
                                        </button>
                                        {expandedRight === right.id && (
                                            <div className="p-4 bg-white border-t border-gray-200">
                                                <p className="text-gray-600 mb-4 leading-relaxed">{right.content}</p>
                                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                    <h4 className="text-sm font-bold text-[#07182A] mb-2 uppercase tracking-wide">Key Takeaways</h4>
                                                    <ul className="space-y-2">
                                                        {right.takeaways?.map((takeaway, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                                <ShieldCheck className="h-4 w-4 text-[#07182A] mt-0.5 flex-shrink-0" />
                                                                <span>{takeaway}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Warnings & Help */}
                    <div className="space-y-8">

                        {/* Fraud Warning */}
                        <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                            <div className="flex items-center gap-2 text-[#C93A30] mb-3">
                                <AlertTriangle className="h-5 w-5" />
                                <h3 className="font-bold">Immigration Fraud</h3>
                            </div>
                            <p className="text-sm text-gray-700 mb-4">
                                Avoid "guaranteed visa" agents. Only official government websites and accredited lawyers can provide legal immigration advice.
                            </p>
                            <Button variant="destructive" className="w-full bg-[#C93A30] hover:bg-[#a82f26]">
                                Report a Scam
                            </Button>
                        </div>

                        {/* Official Resources */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-[#07182A] mb-4 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-gray-500" /> Official Portals
                            </h3>
                            <div className="space-y-3">
                                <a href="#" className="block p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors border border-gray-100 group">
                                    <span className="block font-semibold text-[#07182A] text-sm group-hover:text-blue-700">USCIS (United States of America)</span>
                                    <span className="text-xs text-gray-500">Official US Immigration Site</span>
                                </a>
                                <a href="#" className="block p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors border border-gray-100 group">
                                    <span className="block font-semibold text-[#07182A] text-sm group-hover:text-blue-700">GOV.UK (UK)</span>
                                    <span className="text-xs text-gray-500">UK Visas and Immigration</span>
                                </a>
                                <a href="#" className="block p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors border border-gray-100 group">
                                    <span className="block font-semibold text-[#07182A] text-sm group-hover:text-blue-700">IRCC (Canada)</span>
                                    <span className="text-xs text-gray-500">Immigration, Refugees Canada</span>
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
