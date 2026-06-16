import React from 'react';
import { Sparkles, X } from 'lucide-react';

// Utility function for class names
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const AmenitiesSection = ({
  formData,
  setFormData,
  toggleAmenity,
  addCustomAmenity,
  customAmenityInput,
  setCustomAmenityInput,
  addRule,
  customRuleInput,
  setCustomRuleInput,
  removeArrayItem
}) => {
  return (
    <section className="bg-black/20 rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-accent" />
        Amenities & Rules
      </h2>

      <div className="flex flex-wrap gap-3 mb-8">
        {["Wifi", "AC", "Kitchen", "Washing Machine", "TV", "Parking", "Security", "Gym", "Pool", "Balcony", "Garden", "Elevator", "Pet Friendly"].map(item => (
          <button
            key={item}
            type="button"
            onClick={() => toggleAmenity(item)}
            className={cn(
              "px-5 py-3 rounded-full text-sm border transition-all duration-200",
              formData.amenities.includes(item)
                ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:bg-white/10"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mb-8">
        <label className="text-sm font-medium text-gray-300 block mb-2">Add Extra Amenities</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Rice Cooker, Gaming Chair..."
            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none"
            value={customAmenityInput}
            onChange={e => setCustomAmenityInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustomAmenity()}
          />
          <button
            type="button"
            onClick={addCustomAmenity}
            className="bg-white/10 hover:bg-white/20 text-white px-6 rounded-xl font-medium transition-colors"
          >
            Add
          </button>
        </div>

        {formData.customAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {formData.customAmenities.map((item, i) => (
              <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-200 text-sm rounded-lg border border-blue-500/30">
                {item}
                <button type="button" onClick={() => removeArrayItem('customAmenities', i)} className="hover:text-white"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* House Rules Section */}
      <div>
        <label className="text-sm font-medium text-gray-300 block mb-2">House Rules - <span className="text-gray-500 text-xs">e.g. No smoking, Quiet hours after 10PM</span></label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a rule..."
            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none"
            value={customRuleInput}
            onChange={e => setCustomRuleInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addRule()}
          />
          <button
            type="button"
            onClick={addRule}
            className="bg-white/10 hover:bg-white/20 text-white px-6 rounded-xl font-medium transition-colors"
          >
            Add
          </button>
        </div>

        {formData.rules.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            {formData.rules.map((rule, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2 bg-red-500/10 text-red-200 text-sm rounded-xl border border-red-500/20">
                <span>{i + 1}. {rule}</span>
                <button type="button" onClick={() => removeArrayItem('rules', i)} className="hover:text-white p-1"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AmenitiesSection;