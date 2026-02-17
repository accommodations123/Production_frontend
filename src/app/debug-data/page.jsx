'use client';
import React from 'react';
import { useGetWishlistQuery } from '@/store/api/hostApi';

export default function DebugDataPage() {
    const { data, isLoading, error } = useGetWishlistQuery({ type: 'event', page: 1, limit: 10 });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {JSON.stringify(error)}</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Debug Wishlist Events</h1>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs border border-gray-300">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}
