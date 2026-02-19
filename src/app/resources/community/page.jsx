import React, { useState } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Users, CreditCard, Smartphone, ShoppingBasket, Train, PhoneCall, Globe } from "lucide-react";
import { COMMUNITY_DIRECTORY, DAILY_LIVING_GUIDES } from "@/lib/community-data";

export default function CommunityPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = ["All", "Associations", "Student Groups", "Religious", "Media"];

    const filteredDirectory = COMMUNITY_DIRECTORY.filter(item =>
        (activeCategory === "All" || item.category === activeCategory) &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-orange-600 text-white pt-32 pb-16 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Connect With Your Community</h1>
                    <p className="text-xl text-orange-100 mb-8">Find Indian associations, student groups, temples, and essential daily living guides.</p>

                    <div className="bg-white p-2 rounded-xl shadow-lg flex flex-col md:flex-row gap-2 max-w-2xl mx-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search for groups, temples, or cities..."
                                className="pl-10 h-12 border-none focus-visible:ring-0 text-gray-900"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button className="h-12 px-8 bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg">
                            Find Groups
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* Main Content: Directory */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Directory</h2>

                            {/* Category Filter */}
                            <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="grid gap-4">
                                {filteredDirectory.map(item => (
                                    <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                                                <Badge variant="secondary" className="text-xs font-normal bg-orange-50 text-orange-700">
                                                    {item.category}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                                                <MapPin className="h-3 w-3" /> {item.location}
                                            </p>
                                            <p className="text-gray-600 text-sm">{item.description}</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50 whitespace-nowrap">
                                            Contact
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Daily Living Guide */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Living Guide</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {DAILY_LIVING_GUIDES.map(guide => (
                                    <div key={guide.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                                            {guide.icon === 'CreditCard' && <CreditCard className="h-5 w-5" />}
                                            {guide.icon === 'Smartphone' && <Smartphone className="h-5 w-5" />}
                                            {guide.icon === 'ShoppingBasket' && <ShoppingBasket className="h-5 w-5" />}
                                            {guide.icon === 'Train' && <Train className="h-5 w-5" />}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2">{guide.title}</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">{guide.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Emergency & Help */}
                    <div className="space-y-8">

                        {/* Emergency Contacts */}
                        <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                            <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                                <PhoneCall className="h-5 w-5" /> Emergency Contacts
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-red-100">
                                    <span className="text-sm font-medium text-gray-700">Police / Ambulance</span>
                                    <span className="text-sm font-bold text-red-600">911 / 112</span>
                                </div>
                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-red-100">
                                    <span className="text-sm font-medium text-gray-700">Indian Embassy</span>
                                    <span className="text-sm font-bold text-red-600">+1-202-939-7000</span>
                                </div>
                            </div>
                            <p className="text-xs text-red-600 mt-4 text-center">
                                *Numbers vary by country. Always check local listings.
                            </p>
                        </div>

                        {/* Mentorship Program */}
                        <div className="bg-indigo-600 rounded-xl p-6 text-white text-center">
                            <Users className="h-10 w-10 mx-auto mb-4 text-indigo-200" />
                            <h3 className="font-bold text-lg mb-2">Find a Mentor</h3>
                            <p className="text-sm text-indigo-100 mb-6">Connect with experienced Indian expats who can guide you through your journey.</p>
                            <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50">
                                Join Mentorship
                            </Button>
                        </div>

                        {/* Diaspora News */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Globe className="h-5 w-5 text-gray-500" /> Diaspora News
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <a href="#" className="block text-sm text-gray-700 hover:text-orange-600 font-medium line-clamp-2">
                                        "Diwali celebrations light up Times Square this year"
                                    </a>
                                    <span className="text-xs text-gray-400">2 hours ago</span>
                                </li>
                                <li>
                                    <a href="#" className="block text-sm text-gray-700 hover:text-orange-600 font-medium line-clamp-2">
                                        "New visa rules for Indian students in Canada announced"
                                    </a>
                                    <span className="text-xs text-gray-400">5 hours ago</span>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
