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
    const { activeCountry } = useCountry();
    const { data: rawProduct, isLoading: loading, error } = useGetBuySellByIdQuery(id);
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

    if (!rawProduct) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
                <Button onClick={() => navigate('/marketplace')} className="px-6 py-2">Back to Marketplace</Button>
            </div>
        );
    }

    const product = {
        ...rawProduct,
        sellerName: rawProduct.sellerName || rawProduct.name || "Seller",
        sellerPhone: rawProduct.sellerPhone || rawProduct.phone,
        sellerEmail: rawProduct.sellerEmail || rawProduct.email || rawProduct.seller_email,
        sellerInstagram: rawProduct.sellerInstagram || rawProduct.instagram || rawProduct.seller_instagram,
    };

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

                             <div className="relative z-10 space-y-3">
                                 {/* Primary Row: Chat & WhatsApp */}
                                 <div className="grid grid-cols-2 gap-2.5">
                                     <Button
                                         onClick={() => setIsChatOpen(true)}
                                         className="bg-[#CB2A25] hover:bg-[#b0221d] text-white border-0 h-11 sm:h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#CB2A25]/20 text-sm sm:text-base transition-all hover:-translate-y-0.5"
                                     >
                                         <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                         Chat
                                     </Button>

                                     {product.sellerPhone && (
                                         <button
                                             onClick={() => {
                                                 const cleanNumber = product.sellerPhone.replace(/\D/g, '');
                                                 window.open(`https://wa.me/${cleanNumber}`, '_blank');
                                             }}
                                             className="h-11 sm:h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20 hover:-translate-y-0.5 active:scale-95 text-sm sm:text-base"
                                         >
                                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="currentColor">
                                                 <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 480l117.7-30.9c32.4 17.7 68.9 27 106.2 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                                             </svg>
                                             WhatsApp
                                         </button>
                                     )}
                                 </div>

                                 {/* Secondary Row: Call, Gmail, Instagram */}
                                 <div className="flex gap-2 w-full">
                                     {product.sellerPhone && (
                                         <button
                                             onClick={() => window.open(`tel:${product.sellerPhone}`)}
                                             className="flex-1 h-10 bg-white/5 hover:bg-white/15 text-white rounded-xl flex items-center justify-center gap-1.5 border border-white/10 hover:scale-[1.02] active:scale-95 transition-all text-xs font-semibold"
                                             title="Call Seller"
                                         >
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                             </svg>
                                             Call
                                         </button>
                                     )}

                                     {product.sellerEmail && (
                                         <button
                                             onClick={() => window.open(`mailto:${product.sellerEmail}`)}
                                             className="flex-1 h-10 bg-white/5 hover:bg-red-500/10 text-gray-200 hover:text-red-400 rounded-xl font-semibold flex items-center justify-center gap-1.5 border border-white/10 hover:border-red-500/20 hover:scale-[1.02] active:scale-95 transition-all text-xs"
                                         >
                                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                                                 <rect width="20" height="16" x="2" y="4" rx="2" />
                                                 <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                             </svg>
                                             Gmail
                                         </button>
                                     )}

                                     {product.sellerInstagram && (
                                         <button
                                             onClick={() => {
                                                 const value = product.sellerInstagram.trim();
                                                 const url = (value.startsWith("http://") || value.startsWith("https://") || value.includes("instagram.com"))
                                                     ? (value.startsWith("http") ? value : `https://${value}`)
                                                     : `https://instagram.com/${value.replace(/^@/, '')}`;
                                                 window.open(url, '_blank');
                                             }}
                                             className="flex-1 h-10 bg-white/5 hover:bg-pink-500/10 text-gray-200 hover:text-pink-400 rounded-xl font-semibold flex items-center justify-center gap-1.5 border border-white/10 hover:border-pink-500/20 hover:scale-[1.02] active:scale-95 transition-all text-xs"
                                         >
                                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
                                                 <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                                 <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                                 <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                                             </svg>
                                             Instagram
                                         </button>
                                     )}
                                 </div>

                                 {/* Share Button */}
                                 <Button
                                     onClick={() => {
                                         navigator.clipboard.writeText(window.location.href);
                                         toast.success("Link copied to clipboard!");
                                     }}
                                     variant="outline"
                                     className="w-full bg-white/5 hover:bg-white/10 text-white border-white/10 h-10 rounded-xl font-semibold flex items-center justify-center gap-2 backdrop-blur-sm text-sm transition-all"
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