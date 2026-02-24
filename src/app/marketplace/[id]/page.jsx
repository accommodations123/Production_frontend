"use client";

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/layout/Navbar";
import { useGetBuySellByIdQuery } from '@/store/api/hostApi';
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
    MapPin, Clock, ShieldCheck, User, ArrowLeft,
    MessageCircle, Share2, Heart, AlertCircle
} from 'lucide-react';
import WishlistButton from "@/components/ui/WishlistButton";
import { ChatPopup } from "@/components/marketplace/ChatPopup";
import { useCountry } from "@/context/CountryContext";
import { toast } from "sonner";

// Placeholder for missing images
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";

export default function ProductDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: product, isLoading: loading, error } = useGetBuySellByIdQuery(id);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [imageError, setImageError] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CB2A25]"></div>
            </div>
        );
    }

    const { activeCountry } = useCountry();

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
                <Button onClick={() => navigate('/marketplace')} className="px-6 py-2">Back to Marketplace</Button>
            </div>
        );
    }

    if (activeCountry && product.country && product.country !== activeCountry.name) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <AlertCircle className="w-12 h-12 text-[#CB2A25] mb-4" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Item not available</h2>
                    <p className="text-gray-500 mb-6">This item is not listed in {activeCountry.name}.</p>
                    <Button onClick={() => navigate('/marketplace')} className="px-6 py-2">Browse Marketplace</Button>
                </div>
                <Footer />
            </div>
        );
    }

    // Safely get all images
    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    const currentImageSrc = images[activeImage] || PLACEHOLDER_IMAGE;

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-900">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 container mx-auto px-4 sm:px-6 max-w-7xl">
                {/* Back Navigation */}
                <button
                    onClick={() => navigate('/marketplace')}
                    className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#CB2A25] mb-6 sm:mb-8 transition-colors"
                >
                    <div className="p-1 rounded-full bg-white border border-gray-200 group-hover:border-[#CB2A25] transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    Back to Marketplace
                </button>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 xl:gap-12">

                    {/* Left Column: Image Gallery (Span 7) */}
                    <div className="md:col-span-7 space-y-3 sm:space-y-4">
                        <div className="aspect-[4/3] bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative group">
                            <img
                                src={imageError ? PLACEHOLDER_IMAGE : currentImageSrc}
                                onError={() => setImageError(true)}
                                alt={product.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Price Tag Overlay on Image (Mobile only, or generic style) */}
                            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/90 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg border border-white/20">
                                <span className="font-bold text-gray-900 text-sm sm:text-base">
                                    {product.condition || "Used"}
                                </span>
                            </div>
                            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
                                <WishlistButton
                                    itemId={product.id || product._id}
                                    itemType="buysell"
                                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white transition-all hover:scale-105"
                                    iconSize={20}
                                    outlineColor="text-gray-400"
                                    filledColor="fill-red-500 text-red-500"
                                />
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setActiveImage(idx);
                                            setImageError(false);
                                        }}
                                        className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx
                                            ? 'border-[#CB2A25] shadow-md scale-105'
                                            : 'border-white hover:border-gray-200 opacity-70 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={img || PLACEHOLDER_IMAGE}
                                            alt={`View ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = PLACEHOLDER_IMAGE}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Product Info (Span 5) */}
                    <div className="md:col-span-5 space-y-6 sm:space-y-8">

                        {/* Title & Price */}
                        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-gray-100">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#00142E] mb-3 sm:mb-4 leading-tight">
                                {product.title}
                            </h1>

                            <div className="flex flex-wrap items-baseline gap-2 mb-4 sm:mb-6">
                                <span className="text-3xl sm:text-4xl font-black text-[#CB2A25]">
                                    {product.currency || "$"} {product.price?.toLocaleString()}
                                </span>
                                {product.negotiable && (
                                    <span className="text-xs sm:text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        Negotiable
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-[#CB2A25]" />
                                    <span className="font-medium">{product.location || "Location not specified"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span>Posted {new Date(product.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-gray-100">
                            <h3 className="font-bold text-base sm:text-lg text-[#00142E] mb-3 sm:mb-4">Description</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                                {product.description || "No description provided."}
                            </p>
                        </div>

                        {/* Seller Card */}
                        <div className="bg-[#00142E] p-4 sm:p-6 rounded-2xl text-white relative overflow-hidden">
                            {/* Decorative BG */}
                            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#CB2A25]/20 rounded-full blur-3xl -mr-8 sm:-mr-10 -mt-8 sm:-mt-10" />

                            <div className="relative z-10 flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl border border-white/10">
                                    {product.sellerName ? product.sellerName.charAt(0).toUpperCase() : <User />}
                                </div>
                                <div>
                                    <p className="font-bold text-base sm:text-lg">{product.sellerName || "Seller"}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-400" />
                                        <span className="text-xs sm:text-sm text-gray-300 font-medium">Verified Community Member</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:gap-3 relative z-10">
                                <Button
                                    onClick={() => setIsChatOpen(true)}
                                    className="bg-[#CB2A25] hover:bg-[#b0221d] text-white border-0 h-10 sm:h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#CB2A25]/20 text-sm sm:text-base"
                                >
                                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Chat
                                </Button>
                                <Button
                                    variant="outline"
                                    className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-10 sm:h-12 rounded-xl font-semibold flex items-center justify-center gap-2 backdrop-blur-sm text-sm sm:text-base"
                                >
                                    <Share2 className="h-4 w-4" /> Share
                                </Button>
                            </div>
                        </div>

                        {/* Safety Note */}
                        <div className="flex items-start gap-3 p-3 sm:p-4 bg-yellow-50 rounded-xl sm:rounded-2xl border border-yellow-100/50">
                            <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 shrink-0 mt-0.5" />
                            <div className="text-xs sm:text-sm text-yellow-800 leading-relaxed">
                                <span className="font-bold block mb-1">Safety First</span>
                                Always meet in public places. Inspect the item before payment. Never send money online without verification.
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <ChatPopup
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                product={product}
            />

            <Footer />
        </div>
    );
}