import React from "react"
import { Upload, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const MediaUploadSection = ({
    previewImages,
    handleBannerImageChange,
    handleGalleryImagesChange,
    removeGalleryImage,
    setPreviewImages,
    setFormData
}) => {
    return (
        <div className="rounded-xl p-6 border bg-[#f8f9fa] border-[#00162d]">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-[#00162d]">
                <Upload className="mr-2 h-5 w-5 text-[#00162d]" />
                Event Media
            </h3>

            <div className="space-y-4">
                <div className="border border-dashed rounded-lg p-4 bg-white border-[#00162d]">
                    <Label className="font-medium text-sm text-[#00162d]">Banner Image</Label>
                    <p className="text-xs text-gray-500 mt-1">Max size: 10MB. Images will be compressed automatically.</p>

                    {previewImages.banner && (
                        <div className="mt-3 relative">
                            <img
                                src={previewImages.banner}
                                alt="Banner preview"
                                className="h-40 w-full object-cover rounded-md"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewImages(prev => ({ ...prev, banner: null }));
                                    setFormData('bannerImage', null);
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerImageChange}
                        className="mt-2 text-gray-900 border-[#00162d]"
                    />
                </div>

                <div className="border border-dashed rounded-lg p-4 bg-white border-[#00162d]">
                    <Label className="font-medium text-sm text-[#00162d]">Gallery Images</Label>
                    <p className="text-xs text-gray-500 mt-1">Max size: 10MB per image. Images will be compressed automatically.</p>

                    {previewImages.gallery.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                            {previewImages.gallery.map((img, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={img}
                                        alt={`Gallery ${index + 1}`}
                                        className="h-24 w-full object-cover rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeGalleryImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImagesChange}
                        className="mt-2 text-gray-900 border-[#00162d]"
                    />
                </div>
            </div>
        </div>
    )
}
