"use client"

import * as React from "react"
// import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { useCountry } from "@/context/CountryContext"

export function SearchFilters() {
    const { formatPrice } = useCountry()
    const [priceRange, setPriceRange] = React.useState([50, 500])


    return (
        <div className="w-full md:w-64 space-y-8 pb-20">
            {/* 1. Purpose */}
            <div>
                <h3 className="font-bold mb-4">Purpose</h3>
                <div className="space-y-2">
                    {["Student", "Working Professional", "Family", "Indian Roommates", "Traveller", "Budget Friendly", "Long Term", "Short Term"].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={item} className="border-blue-500" />
                            <Label htmlFor={item}>{item}</Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Stay Type */}
            <div>
                <h3 className="font-bold mb-4">Stay Type</h3>
                <div className="space-y-2">
                    {["Shared Room", "Private Room", "Full Apartment", "House/Villa"].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={item} className="border-blue-500" />
                            <Label htmlFor={item}>{item}</Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Budget */}
            <div>
                <h3 className="font-bold mb-4">Budget Range</h3>
                <div className="px-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">{formatPrice(priceRange[0])}</span>
                        <span className="text-sm">{formatPrice(priceRange[1])}+</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full accent-accent"
                    />
                </div>
            </div>

            {/* 4. Distance */}
            <div>
                <h3 className="font-bold mb-4">Distance</h3>
                <div className="space-y-2">
                    {["< 1 km to University", "< 3 km to Office", "Near Metro/Bus", "Near Indian Grocery"].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={item} className="border-blue-500" />
                            <Label htmlFor={item}>{item}</Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. Community & Comfort */}
            <div>
                <h3 className="font-bold mb-4">Community & Comfort</h3>
                <div className="space-y-2">
                    {["Indian Roommates", "Vegetarian Kitchen", "Girls Only", "Boys Only", "Quiet/Study Friendly"].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={item} className="border-blue-500" />
                            <Label htmlFor={item}>{item}</Label>
                        </div>
                    ))}
                </div>
            </div>

            <Button className="w-full bg-accent hover:bg-accent/90 text-white sticky bottom-4">Apply Filters</Button>
        </div>
    )
}
