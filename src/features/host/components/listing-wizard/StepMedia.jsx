import { Plus, X } from 'lucide-react';

export function StepMedia({ formData, setFormData, handleFileChange, removeArrayItem }) {
    return (
        <div className="space-y-6 max-w-3xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Property Photos</h2>

            {/* Images */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Property Photos <span className="text-red-500 ml-1">*</span></label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10">
                            <img src={img.url} alt="Upload" className="w-full h-full object-cover" />
                            <button
                                onClick={() => removeArrayItem('images', idx)}
                                className="absolute top-1 right-1 bg-red-500/80 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    <label className="border-2 border-dashed border-white/20 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-white/5 transition-all text-[#717171] hover:text-white">
                        <Plus className="h-6 w-6 mb-2" />
                        <span className="text-xs">Add Photo</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'images', true)} />
                    </label>
                </div>
            </div>

        </div>
    );
}

