import React from 'react';
import { Home, Users, Bed, Bath, Sparkles, Building2, Quote, Layout } from 'lucide-react';
import { motion } from 'framer-motion';
import { PROPERTY_TYPES } from '@/lib/accommodation-data';

export function StepBasics({ formData, setFormData, categories, isEdit }) {
    return (
        <div className="space-y-6 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-white mb-4">
                {isEdit ? "Edit your listing" : "Tell us about your place"}
            </h2>

            {/* Title & Description */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Property Title <span className="text-red-500 ml-1">*</span></label>
                    <div className="relative">
                        <Quote className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="e.g. Cozy Studio in Downtown"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-accent outline-none"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Description <span className="text-red-500 ml-1">*</span></label>
                    <div className="relative">
                        <Layout className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                        <textarea
                            placeholder="Fully furnished private room near metro station. Includes WiFi, electricity, kitchen access, and parking. Walking distance to grocery stores, universities, and offices."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-accent outline-none min-h-[100px]"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed bg-white/5 border border-white/5 p-3 rounded-lg">
                        Mention nearby university, office, metro station, grocery stores, included utilities, parking, internet, and house rules.
                    </p>
                </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Category <span className="text-red-500 ml-1">*</span></label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map(cat => (
                        <button
                            key={cat.slug}
                            onClick={() => setFormData(prev => ({
                                ...prev,
                                category: cat.slug
                            }))}
                            className={`p-4 rounded-xl border text-left transition-all ${formData.category === cat.slug
                                ? 'bg-accent/20 border-accent text-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <span className="text-2xl mb-2 block text-center"><cat.icon className="h-8 w-8 mx-auto" /></span>
                            <span className="font-bold text-sm">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Property Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Users className="h-4 w-4" />
                        <span className="text-xs">Guests <span className="text-red-500 ml-1">*</span></span>
                    </div>
                    <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent text-xl font-bold focus:outline-none"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Bed className="h-4 w-4" />
                        <span className="text-xs">Bedrooms <span className="text-red-500 ml-1">*</span></span>
                    </div>
                    <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent text-xl font-bold focus:outline-none"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    />
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Bath className="h-4 w-4" />
                        <span className="text-xs">Bathrooms <span className="text-red-500 ml-1">*</span></span>
                    </div>
                    <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent text-xl font-bold focus:outline-none"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    />
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs">Sq Ft</span>
                    </div>
                    <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent text-xl font-bold focus:outline-none"
                        value={formData.sqft}
                        onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                    />
                </div>
            </div>

            {/* Property Type & Privacy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Property Type <span className="text-red-500 ml-1">*</span></label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                            value={formData.type}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    type: e.target.value
                                }))
                            }
                            className="
        w-full
        bg-[#1A2B45]
        border border-[#2C3E5D]
        rounded-xl
        px-12 py-4
        text-white
        outline-none
        focus:border-[#C93A30]
        transition
    "
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
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Privacy Type <span className="text-red-500 ml-1">*</span></label>
                    <div className="relative">
                        {/* Using a simple select for now, can be upgraded to custom UI */}
                        <select
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-accent outline-none appearance-none"
                            value={formData.privacyType}
                            onChange={(e) => setFormData({ ...formData, privacyType: e.target.value })}
                        >
                            <option value="entire place" className="bg-gray-800 text-white">Entire Place</option>
                            <option value="private room" className="bg-gray-800 text-white">Private Room</option>
                            <option value="shared room" className="bg-gray-800 text-white">Shared Room</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Pets Allowed Input (Select Dropdown, Optional) */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                    <label className="text-sm font-bold text-white">Pets Allowed</label>
                </div>
                <div className="relative">
                    <select
                        className="w-full bg-[#1A2B45] border border-[#2C3E5D] rounded-xl py-3 px-4 focus:border-accent outline-none text-white [&>option]:bg-gray-800"
                        value={formData.petsAllowed}
                        onChange={(e) => setFormData({ ...formData, petsAllowed: e.target.value })}
                    >
                        <option value="">Select Option</option>
                        <option value="0">No Pets</option>
                        <option value="1">Pets Allowed</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
