import React from "react"
import { MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { COUNTRIES } from "@/lib/mock-data"

export const LocationSection = ({ formData, handleInputChange }) => {
    return (
        <div className="rounded-xl p-6 border bg-[#f8f9fa] border-[#00162d]">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-[#00162d]">
                <MapPin className="mr-2 h-5 w-5 text-[#00162d]" />
                Venue Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <Label className="font-medium text-sm text-[#00162d]">Street Address</Label>
                    <Input
                        value={formData.location || ""}
                        onChange={e => handleInputChange("location", e.target.value)}
                        className="mt-1 text-gray-900 placeholder-gray-400 border-[#00162d]"
                        placeholder="Enter street address"
                    />
                </div>

                <div>
                    <Label className="font-medium text-sm text-[#00162d]">Landmark</Label>
                    <Input
                        value={formData.landmark || ""}
                        onChange={e => handleInputChange("landmark", e.target.value)}
                        className="mt-1 text-gray-900 placeholder-gray-400 border-[#00162d]"
                        placeholder="Nearby landmark"
                    />
                </div>

                <div>
                    <Label className="font-medium text-sm text-[#00162d]">Venue Name</Label>
                    <Input
                        value={formData.venue_name || ""}
                        onChange={e => handleInputChange("venue_name", e.target.value)}
                        className="mt-1 text-gray-900 placeholder-gray-400 border-[#00162d]"
                        placeholder="Venue name"
                    />
                </div>

                <div className="md:col-span-2">
                    <Label className="font-medium text-sm text-[#00162d]">Venue Description</Label>
                    <Textarea
                        value={formData.venue_description || ""}
                        onChange={e => handleInputChange("venue_description", e.target.value)}
                        className="mt-1 text-gray-900 placeholder-gray-400 border-[#00162d]"
                        placeholder="Describe the venue"
                        rows={3}
                    />
                </div>

                <div className="md:col-span-2">
                    <Label className="font-medium text-sm text-[#00162d]">What's Included</Label>
                    <Textarea
                        value={formData.what_is_included || ""}
                        onChange={e => handleInputChange("what_is_included", e.target.value)}
                        className="mt-1 text-gray-900 placeholder-gray-400 border-[#00162d]"
                        placeholder="List what's included in the event"
                        rows={3}
                    />
                </div>

                <div className="md:col-span-2">
                    <Label className="font-medium text-sm text-[#00162d]">What's Not Included</Label>
                    <Textarea
                        value={formData.what_is_not_included || ""}
                        onChange={e => handleInputChange("what_is_not_included", e.target.value)}
                        className="mt-1 text-gray-900 placeholder-gray-400 border-[#00162d]"
                        placeholder="List what's not included in the event"
                        rows={3}
                    />
                </div>

                <div className="md:col-span-2">
                    <Label className="font-medium text-sm text-[#00162d]">Parking Info</Label>
                    <Input
                        value={formData.parking_info || ""}
                        onChange={e => handleInputChange("parking_info", e.target.value)}
                        className="mt-1 text-gray-900 placeholder-gray-400 border-[#00162d]"
                        placeholder="Parking details"
                    />
                </div>

                <div className="md:col-span-2">
                    <Label className="font-medium text-sm text-[#00162d]">Accessibility Info</Label>
                    <Input
                        value={formData.accessibility_info || ""}
                        onChange={e => handleInputChange("accessibility_info", e.target.value)}
                        className="mt-1 text-gray-900 placeholder-gray-400 border-[#00162d]"
                        placeholder="Accessibility information"
                    />
                </div>
            </div>
        </div>
    )
}
