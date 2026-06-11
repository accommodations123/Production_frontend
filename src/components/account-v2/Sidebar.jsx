import React from 'react';
import { User, Home, MapPin, Heart, Settings, Briefcase, LayoutDashboard, Users, ShoppingBag, Calendar } from 'lucide-react';

export const Sidebar = ({ activeTab, onTabChange }) => {
    const groups = [
        {
            title: "",
            items: [
                { id: 'overview', label: 'Overview', icon: LayoutDashboard }
            ]
        },
        {
            title: "Hosting",
            items: [
                { id: 'listings', label: 'My Listings', icon: Home },
                { id: 'events', label: 'My Events', icon: Calendar },
                { id: 'trips', label: 'Trips', icon: MapPin },
            ]
        },
        {
            title: "Marketplace",
            items: [
                { id: 'buy-sell', label: 'My Buy/Sell', icon: ShoppingBag },
                { id: 'applications', label: 'My Applications', icon: Briefcase },
            ]
        },
        {
            title: "Community",
            items: [
                { id: 'communities', label: 'My Communities', icon: Users },
                { id: 'wishlist', label: 'My Wishlist', icon: Heart },
            ]
        },
        {
            title: "Account",
            items: [
                { id: 'personal', label: 'Profile', icon: User },
                { id: 'settings', label: 'Settings', icon: Settings },
            ]
        }
    ];

    return (
        <div className="bg-white rounded-3xl p-4.5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 space-y-5">
            {groups.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-1.5">
                    {group.title && (
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 pl-3.5 mb-1.5">
                            {group.title}
                        </h4>
                    )}
                    <nav className="space-y-1">
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onTabChange(item.id)}
                                    className={`w-full flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                        isActive
                                            ? 'bg-gradient-to-r from-[#0A1A2F] to-[#162D4A] text-white shadow-md shadow-[#0A1A2F]/10'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                                    }`}
                                >
                                    <Icon className={`mr-3 h-4.5 w-4.5 transition-colors ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            ))}
        </div>
    );
};

