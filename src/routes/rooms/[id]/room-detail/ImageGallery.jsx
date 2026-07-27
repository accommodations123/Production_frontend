import { Share2, Maximize2 } from "lucide-react";
import WishlistButton from "@/shared/ui/WishlistButton";
import { Button } from "@/shared/ui/button";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

/**
 * Photo gallery for the room detail page.
 * Renders a swipeable mobile carousel, a desktop grid layout,
 * floating share/wishlist buttons, and a fullscreen lightbox.
 */
export function ImageGallery({
    photos,
    listingId,
    emblaRef,
    currentImageIndex,
    setCurrentImageIndex,
    isFullscreen,
    setIsFullscreen,
    onShare,
}) {
    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setIsFullscreen(true);
    };

    return (
        <>
            <div className="relative rounded-xl md:rounded-3xl overflow-hidden aspect-[4/3] md:aspect-[3/1] shadow-sm group">
                {photos.length > 0 ? (
                    <>
                        {/* Mobile Swipeable Carousel */}
                        <div className="md:hidden overflow-hidden w-full h-full relative" ref={emblaRef}>
                            <div className="flex h-full">
                                {photos.map((photo, i) => (
                                    <div
                                        key={i}
                                        className="flex-[0_0_100%] min-w-0 h-full relative cursor-pointer"
                                        onClick={() => openLightbox(i)}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`View photo ${i + 1}`}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openLightbox(i); }}
                                    >
                                        <img
                                            src={photo}
                                            alt={`Property image ${i + 1}`}
                                            className="w-full h-full object-cover"
                                            loading={i === 0 ? "eager" : "lazy"}
                                            decoding="async"
                                            fetchpriority={i === 0 ? "high" : "low"}
                                        />
                                    </div>
                                ))}
                            </div>
                            {/* Mobile "See All" overlay counter */}
                            <div className="absolute bottom-4 right-4 bg-black/75 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md z-10 select-none">
                                {currentImageIndex + 1}/{photos.length}
                            </div>
                        </div>

                        {/* Desktop Grid Layout */}
                        <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-2 h-full">
                            {/* Main Photo */}
                            <div
                                className="md:col-span-2 h-full relative cursor-pointer"
                                onClick={() => openLightbox(0)}
                                role="button"
                                tabIndex={0}
                                aria-label="View main photo"
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openLightbox(0); }}
                            >
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
                                <img
                                    src={photos[0]}
                                    alt="Property"
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                    decoding="async"
                                    fetchpriority="high"
                                />
                            </div>

                            {/* Secondary Photos (Desktop Only) */}
                            <div className="hidden md:grid grid-rows-2 gap-2 h-full">
                                {[1, 2].map(i => (
                                    <div
                                        key={i}
                                        className="relative h-full cursor-pointer"
                                        onClick={() => openLightbox(i)}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`View photo ${i + 1}`}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openLightbox(i); }}
                                    >
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors z-10" />
                                        <img
                                            src={photos[i] || photos[0]}
                                            className="w-full h-full object-cover"
                                            alt=""
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="hidden md:grid grid-rows-2 gap-2 h-full">
                                {[3, 4].map(i => (
                                    <div
                                        key={i}
                                        className="relative h-full cursor-pointer"
                                        onClick={() => openLightbox(i)}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`View photo ${i + 1}`}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openLightbox(i); }}
                                    >
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors z-10" />
                                        <img
                                            src={photos[i] || photos[0]}
                                            className="w-full h-full object-cover"
                                            alt=""
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        {i === 4 && (
                                            <Button
                                                variant="secondary"
                                                className="absolute bottom-4 right-4 z-20 font-medium shadow-md bg-white hover:bg-white cursor-pointer"
                                                onClick={(e) => { e.stopPropagation(); openLightbox(4); }}
                                            >
                                                <Maximize2 className="w-4 h-4 mr-2" />
                                                Show all photos
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[#717171]">
                        No photos available
                    </div>
                )}

                {/* Share/Save floating buttons (Mobile) */}
                <div className="absolute top-4 right-4 flex gap-2 md:hidden">
                    <button onClick={onShare} className="p-2 bg-white rounded-full shadow-md"><Share2 className="w-4 h-4" /></button>
                    <div className="bg-white rounded-full shadow-md w-8 h-8 flex items-center justify-center">
                        <WishlistButton
                            itemId={listingId}
                            itemType="property"
                            className="w-full h-full flex items-center justify-center"
                            iconSize={16}
                            outlineColor="text-[#717171]"
                            filledColor="fill-rose-500 text-rose-500"
                        />
                    </div>
                </div>
            </div>

            <Lightbox
                open={isFullscreen}
                close={() => setIsFullscreen(false)}
                index={currentImageIndex}
                slides={photos.map(url => ({ src: url }))}
                on={{
                    view: ({ index }) => setCurrentImageIndex(index)
                }}
            />
        </>
    );
}
