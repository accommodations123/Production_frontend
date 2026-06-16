import React, { useState } from 'react';
import { Heart, Share2, Grid } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VerificationBadge } from '@/components/ui/VerificationBadge';

export function PropertyHero({ images, price, title, location, type, status = "Rent", isVerified }) {
    const [isLiked, setIsLiked] = useState(false);
    const mainImage = images[0];
    const galleryImages = images.slice(1, 5); // Take next 4 for grid

    return (
        <div className="relative w-full">
            {/* Mobile Card View (< md) */}
            <div className="md:hidden relative w-full aspect-[4/3] rounded-b-3xl overflow-hidden shadow-xl">
                {/* Carousel Container */}
                <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full w-full">
                    {images.map((img, idx) => (
                        <div key={idx} className="min-w-full h-full snap-center relative">
                            <img
                                src={img}
                                alt={`${title} ${idx}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Gradient Overlay needed on each or fixed on top? Fixed on top better */}
                            {idx === 0 && (
                                <div className="absolute top-4 left-4 z-20">
                                    <VerificationBadge isVerified={isVerified} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Top Actions */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center p-0.5 border border-white/30">
                            <img src="/logo.jpeg" alt="Agent" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <span className="text-white font-medium text-xs drop-shadow-md">NextKin</span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
                            onClick={() => setIsLiked(!isLiked)}
                        >
                            <Heart className={cn("w-4 h-4", isLiked && "fill-red-500 text-red-500")} />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
                        >
                            <Grid className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Bottom Overlay Info - Fixed Position absolute regardless of scroll */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {status}
                        </span>
                        <span className="text-white/80 text-[10px]">2m ago</span>
                    </div>

                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-white text-lg font-bold leading-tight line-clamp-2 w-[80%]">{title}</h1>
                            <p className="text-white/80 text-xs mt-0.5">{location}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-white text-xl font-bold">{price}</p>
                            <p className="text-white/60 text-[10px]">Ready to move</p>
                        </div>
                    </div>
                </div>

                {/* Pagination Dots (Optional but good) */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    {images.slice(0, 5).map((_, idx) => (
                        <div key={idx} className="w-1.5 h-1.5 rounded-full bg-white/50" />
                    ))}
                </div>
            </div>

            {/* Desktop Grid View (>= md) */}
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
                {/* Main large image */}
                <div className="col-span-2 row-span-2 relative group cursor-pointer">
                    <img src={mainImage} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-lg w-fit">
                            {status}
                        </span>
                        <VerificationBadge isVerified={isVerified} />
                    </div>
                </div>

                {/* Top right 2 images */}
                {galleryImages.slice(0, 2).map((img, idx) => (
                    <div key={`gallery-top-${idx}`} className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
                        <img src={img} alt={`${title} ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                ))}

                {/* Bottom right 2 images */}
                {galleryImages.slice(2, 4).map((img, idx) => (
                    <div key={`gallery-bot-${idx}`} className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
                        <img src={img} alt={`${title} ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

                        {/* Show 'See all' on the last image if there are more */}
                        {idx === 1 && images.length > 5 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] hover:bg-black/50 transition-colors">
                                <span className="text-white font-bold flex items-center gap-2">
                                    <Grid className="w-5 h-5" />
                                    See all photos
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
