import { ListingCard } from "./ListingCard"

import { useGetApprovedHostDetailsQuery } from '@/store/api/hostApi';

export function FeaturedListings() {
    const { data: approvedHosts } = useGetApprovedHostDetailsQuery();

    const listings = approvedHosts?.map(host => ({
        id: host._id,
        title: host.host_full_name,
        location: host.host_city || "Unknown",
        price: 5000,
        image: host.host_id_photo || host.host_selfie_photo || null,
        type: "Verified Host",
        badges: ["Verified Host"]
    })) || [];

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-primary mb-2">Popular for Indians in New Jersey</h2>
                        <p className="text-gray-500">Curated accommodations with Indian roommates and amenities.</p>
                    </div>
                    <a href="/search" className="text-accent font-medium hover:underline">View all</a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {listings.slice(0, 4).map((listing) => (
                        <ListingCard
                            key={listing.id}
                            listing={listing}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
