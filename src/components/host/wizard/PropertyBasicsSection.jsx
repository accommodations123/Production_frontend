import React from 'react';
import { Home, Users, Bed, Bath, Sparkles, Building2, Quote, Layout } from 'lucide-react';
import { PROPERTY_TYPES } from '@/lib/accommodation-data';

const PropertyBasicsSection = ({ formData, setFormData }) => {
  const categories = [
    { name: 'Apartment', slug: 'apartment', icon: Building2 },
    { name: 'House', slug: 'house', icon: Home },
    { name: 'Villa', slug: 'villa', icon: Building2 },
    { name: 'PG', slug: 'pg', icon: Home },
    { name: 'Hostel', slug: 'hostel', icon: Home },
    { name: 'Shared Room', slug: 'shared-room', icon: Users },
    { name: 'Studio', slug: 'studio', icon: Layout },
    { name: 'Townhouse', slug: 'townhouse', icon: Home },
    { name: 'Entire Place', slug: 'entire-place', icon: Sparkles }
  ];

  return (
    <section className="bg-black/20 rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Home className="h-6 w-6 text-accent" />
        Property Basics
      </h2>

      {/* Title & Description */}
      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Property Title</label>
          <div className="relative">
            <Quote className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. Cozy Studio in Downtown"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-accent outline-none"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Description</label>
          <div className="relative">
            <Layout className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            <textarea
              placeholder="Describe your place..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-accent outline-none min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="space-y-2 mb-6">
        <label className="text-sm font-medium text-gray-300">Category</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map(cat => (
            <button
              key={cat.slug}
              type="button"
              onClick={() =>
                setFormData(prev => ({
                  ...prev,
                  category: cat.name,
                  type: cat.name
                }))
              }
              className={`p-4 rounded-xl border text-left transition-all ${formData.category === cat.name
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Users className="h-4 w-4" />
            <span className="text-xs">Guests</span>
          </div>
          <input
            type="number"
            placeholder="0"
            className="w-full bg-transparent text-xl font-bold focus:outline-none"
            value={formData.capacity}
            onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
          />
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Bed className="h-4 w-4" />
            <span className="text-xs">Bedrooms</span>
          </div>
          <input
            type="number"
            placeholder="0"
            className="w-full bg-transparent text-xl font-bold focus:outline-none"
            value={formData.bedrooms}
            onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
          />
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Bath className="h-4 w-4" />
            <span className="text-xs">Bathrooms</span>
          </div>
          <input
            type="number"
            placeholder="0"
            className="w-full bg-transparent text-xl font-bold focus:outline-none"
            value={formData.bathrooms}
            onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
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
            onChange={(e) => setFormData(prev => ({ ...prev, sqft: e.target.value }))}
          />
        </div>
      </div>

      {/* Property Type & Privacy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Property Type</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              className="
    w-full
    bg-white/5
    border border-white/10
    rounded-xl
    py-3 pl-12 pr-4
    focus:border-accent
    outline-none
    text-white
    appearance-none
  "
              value={formData.type}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  type: e.target.value
                }))
              }
            >
              <option value="" className="bg-[#10233E]">
                Select Property Type
              </option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type} className="bg-[#10233E]">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Privacy Type</label>
          <select
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-accent outline-none appearance-none"
            value={formData.privacyType}
            onChange={(e) => setFormData(prev => ({ ...prev, privacyType: e.target.value }))}
          >
            <option value="entire place" className="bg-gray-800 text-white">Entire Place</option>
            <option value="private room" className="bg-gray-800 text-white">Private Room</option>
            <option value="shared room" className="bg-gray-800 text-white">Shared Room</option>
          </select>
        </div>
      </div>

      {/* Pets Allowed */}
      <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          <label className="text-sm font-bold text-white">Pets Allowed</label>
        </div>
        <div className="relative">
          <input
            type="number"
            placeholder="0 (No pets) or Number of pets"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-accent outline-none text-white placeholder:text-gray-500"
            value={formData.petsAllowed}
            onChange={(e) => setFormData(prev => ({ ...prev, petsAllowed: e.target.value }))}
            min="0"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Enter 0 if no pets are allowed.</p>
      </div>
    </section>
  );
};

export default PropertyBasicsSection;