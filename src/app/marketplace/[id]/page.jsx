"use client";

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useGetBuySellByIdQuery } from '@/hooks/data/useMarketplaceHooks';
import ProductDetailView from '@/components/marketplace/ProductDetailView';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProductDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: rawProduct, isLoading: loading } = useGetBuySellByIdQuery(id);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E1392A]"></div>
            </div>
        );
    }

    const product = rawProduct?.listing || rawProduct?.item || rawProduct?.data || rawProduct;

    if (!product || (!product.title && !product.name)) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <AlertCircle className="w-12 h-12 text-[#717171] mb-4" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
                    <Button onClick={() => navigate('/marketplace')} className="px-6 py-2 bg-[#E1392A] hover:bg-[#b82a1d] text-white">Back to Marketplace</Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFBFD] font-sans">
            <Navbar />
            <div className="pt-20 flex-1">
                <ProductDetailView product={product} onBack={() => navigate('/marketplace')} />
            </div>
            <Footer />
        </div>
    );
}