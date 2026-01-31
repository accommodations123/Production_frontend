"use client"

import * as React from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { SearchFilters } from "@/components/features/SearchFilters"
import { PropertyCard } from "@/components/home/featured/PropertyCard"
import { MapMock } from "@/components/features/MapMock"
import { Button } from "@/components/ui/button"
import { Map, List } from "lucide-react"
import { useGetApprovedPropertiesQuery } from "@/store/api/hostApi"

import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Filter } from "lucide-react"

export default function SearchPage() {
    const [showMap, setShowMap] = React.useState(false)
    const [activeChip, setActiveChip] = React.useState("Students")

    const { data: approvedProperties, isLoading } = useGetApprovedPropertiesQuery();

    return (
        <main className="min-h-screen bg-background pt-20">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar - Desktop */}
                    <aside className="hidden md:block w-64 shrink-0">
                        <SearchFilters />
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h1 className="text-2xl font-bold text-[#00142E] flex items-center gap-2">
                                {approvedProperties?.length || 0} stays found
                            </h1>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                {/* Mobile Filter Trigger */}
                                <div className="md:hidden w-full sm:w-auto">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="w-full sm:w-auto gap-2">
                                                <Filter className="h-4 w-4" />
                                                Filters
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="overflow-y-auto max-h-[90vh]">
                                            <DialogHeader>
                                                <DialogTitle>Filters</DialogTitle>
                                                <DialogDescription>
                                                    Scale down your search results.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <SearchFilters />
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => setShowMap(!showMap)}
                                    className="gap-2 w-full sm:w-auto"
                                >
                                    {showMap ? <List className="h-4 w-4" /> : <Map className="h-4 w-4" />}
                                    {showMap ? "Show List" : "Show Map"}
                                </Button>
                            </div>
                        </div>

                        {showMap ? (
                            <div className="h-[600px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
                                <MapMock />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {isLoading ? (
                                    <div className="col-span-full py-20 text-center text-gray-500">Loading stays...</div>
                                ) : (
                                    approvedProperties?.map((property) => (
                                        <PropertyCard key={property.id || property._id} property={property} />
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
