import React from 'react';
import { Home, Users, Bed, Bath, Sparkles, Building2, Quote, Layout } from 'lucide-react';
import { motion } from 'framer-motion';
import { PROPERTY_TYPES } from '@/lib/accommodation-data';

export function StepBasics({ formData, setFormData, categories, isEdit }) {
    return (
        <div className="space-y-6 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {isEdit ? "Edit your listing" : "Tell us about your place"}
            </h2>

            {/* Title & Description */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Property Title *</label>
                    <div className="relative">
                        <Quote className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="e.g. Cozy Studio in Downtown"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26] text-slate-900 placeholder:text-slate-400 font-semibold text-sm transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description *</label>
                    <div className="relative">
                        <Layout className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                        <textarea
                            placeholder="Fully furnished private room near metro station. Includes WiFi, electricity, kitchen access, and parking. Walking distance to grocery stores, universities, and offices."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26] text-slate-900 placeholder:text-slate-400 font-semibold text-sm transition-all min-h-[100px]"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-lg">
                        Mention nearby university, office, metro station, grocery stores, included utilities, parking, internet, and house rules.
                    </p>
                </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Category *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map(cat => (
                        <button
                            key={cat.slug}
                            onClick={() => setFormData(prev => ({
                                ...prev,
                                category: cat.slug
                            }))}
                            className={`p-4 rounded-xl border text-left transition-all ${formData.category === cat.slug
                                ? 'bg-accent/10 border-accent text-accent shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <span className="text-2xl mb-2 block text-center"><cat.icon className="h-8 w-8 mx-auto" /></span>
                            <span className="font-bold text-sm block text-center">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Property Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Users className="h-4 w-4" />
                        <span className="text-xs">Guests *</span>
                    </div>
                    <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent text-xl font-bold focus:outline-none text-slate-900 placeholder:text-slate-300"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Bed className="h-4 w-4" />
                        <span className="text-xs">Bedrooms *</span>
                    </div>
                    <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent text-xl font-bold focus:outline-none text-slate-900 placeholder:text-slate-300"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    />
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Bath className="h-4 w-4" />
                        <span className="text-xs">Bathrooms *</span>
                    </div>
                    <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent text-xl font-bold focus:outline-none text-slate-900 placeholder:text-slate-300"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    />
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs">Sq Ft</span>
                    </div>
                    <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent text-xl font-bold focus:outline-none text-slate-900 placeholder:text-slate-300"
                        value={formData.sqft}
                        onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                    />
                </div>
            </div>

            {/* Property Type & Privacy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Property Type *</label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <select
                            value={formData.type}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    type: e.target.value
                                }))
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-4 text-slate-900 outline-none focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26] font-semibold text-sm transition appearance-none cursor-pointer"
                        >
                            <option value="">
                                Select Property Type
                            </option>

                            {PROPERTY_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          ▼
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Privacy Type *</label>
                    <div className="relative">
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26] text-slate-900 font-semibold text-sm appearance-none cursor-pointer"
                            value={formData.privacyType}
                            onChange={(e) => setFormData({ ...formData, privacyType: e.target.value })}
                        >
                            <option value="entire place">Entire Place</option>
                            <option value="private room">Private Room</option>
                            <option value="shared room">Shared Room</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          ▼
                        </div>
                    </div>
                </div>
            </div>

            {/* Pets Allowed Input (Select Dropdown, Optional) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <label className="text-sm font-bold text-slate-900">Pets Allowed</label>
                </div>
                <div className="relative">
                    <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#CB2A26]/20 focus:border-[#CB2A26] text-slate-900 font-semibold text-sm appearance-none cursor-pointer"
                        value={formData.petsAllowed}
                        onChange={(e) => setFormData({ ...formData, petsAllowed: e.target.value })}
                    >
                        <option value="">Select Option</option>
                        <option value="0">No Pets</option>
                        <option value="1">Pets Allowed</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      ▼
                    </div>
                </div>
            </div>
        </div>
    );
}
