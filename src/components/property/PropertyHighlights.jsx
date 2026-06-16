import React from 'react';
import { Grid, Layers, User, Maximize } from 'lucide-react';

export function PropertyHighlights({ features }) {
    // Default highlights if none provided
    const defaults = [
        { icon: Grid, label: "2 BHK", sub: "and 2 Bath" },
        { icon: Layers, label: "1 out of 2", sub: "floors" },
        { icon: User, label: "For Family", sub: "Only" },
        { icon: Maximize, label: "1,250 sq.ft.", sub: "Carpet Area" }
    ];

    const items = features || defaults;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Key Highlight</h3>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar snap-x">
                {items.map((item, idx) => {
                    let Icon = Layers; // Default icon
                    let label = "";
                    let sub = "Amenity";

                    if (typeof item === 'string') {
                        // Handle String (New Schema)
                        label = item;
                        sub = "Included";

                        // Icon Mapping
                        const lower = item.toLowerCase();
                        if (lower.includes('wifi')) Icon = Grid; // Or Wifi icon if imported
                        else if (lower.includes('gym')) Icon = Maximize;
                        else if (lower.includes('pool')) Icon = Layers;
                        else if (lower.includes('parking')) Icon = Grid;
                        else if (lower.includes('security')) Icon = User;
                        else Icon = Layers; // Fallback
                    } else if (typeof item === 'object' && item.icon) {
                        // Handle Object (Old Schema)
                        Icon = item.icon;
                        label = item.label;
                        sub = item.sub;
                    }

                    // Safety Check
                    if (!Icon) return null;

                    return (
                        <div
                            key={idx}
                            className="flex-shrink-0 w-24 h-28 flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2 snap-center group hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#f3efff] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Icon className="w-5 h-5 text-[#7B2CBF]" />
                            </div>
                            <p className="text-xs font-bold text-gray-800 dark:text-white text-center leading-tight">{label}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-300 text-center mt-1">{sub}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
