"use client";

import React from "react";
import { useGetMyCommunitiesQuery } from "@/store/api/hostApi";
import { 
  Users, Search, Loader2, Plus, MapPin, 
  MessageSquare, ChevronRight, Compass, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export const MyCommunities = () => {
  const navigate = useNavigate();
  const { data: communities = [], isLoading, error, refetch } = useGetMyCommunitiesQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-16">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-sm text-gray-500 font-medium animate-pulse">Loading your communities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-100 rounded-3xl max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h4 className="font-extrabold text-red-700">Failed to load communities</h4>
        <p className="text-xs text-red-600/70 mt-1">Please try reloading the page to fetch your groups.</p>
        <Button onClick={() => refetch()} className="mt-4 bg-red-600 text-white rounded-xl">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Visual Header Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-rose-50/50 to-pink-50/50 rounded-full blur-3xl -z-10"></div>
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-rose-600 tracking-wider uppercase block">Social Hub 💬</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">My Communities</h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg leading-relaxed">
            Interact with fellow hosts and travelers in local community groups and topic forums.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => navigate("/groups")}
            className="bg-[#0A1A2F] hover:bg-blue-600 text-white rounded-xl h-11 px-5 text-sm font-semibold shadow-md transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Explore Groups
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/groups/create")}
            className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl h-11 px-5 text-sm font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Grid view of joined communities */}
      {communities.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 max-w-xl mx-auto">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Users className="w-9 h-9 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Explore Interest Groups</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
              Join neighborhood circles, host roundtables, and traveler discussions to build your network.
            </p>
          </div>
          <Button 
            onClick={() => navigate("/groups")}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-5 h-11 font-semibold transition-all shadow-sm"
          >
            Find a Community
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((group) => {
            // High fidelity image helper
            const banner = group.cover_image || group.avatar_image || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80";
            const topics = Array.isArray(group.topics) ? group.topics : [];

            return (
              <div 
                key={group.id}
                className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
              >
                {/* Image Cover */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-50">
                  <img 
                    src={banner} 
                    alt={group.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  {/* Location badge */}
                  {group.city && (
                    <span className="absolute bottom-3.5 left-3.5 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-xl text-[10px] font-extrabold text-gray-700 shadow-sm border border-gray-100 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {group.city}
                    </span>
                  )}
                </div>

                {/* Card Content details */}
                <div className="p-5 flex flex-col flex-1 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-gray-900 group-hover:text-rose-600 transition-colors text-base line-clamp-1">
                      {group.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {group.description || "Connecting hosts and travelers in the NextKin ecosystem to share stories, properties, and guides."}
                    </p>
                  </div>

                  {/* Topics List */}
                  {topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {topics.slice(0, 3).map((topic, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md text-[9px] font-bold uppercase tracking-wider">
                          {topic}
                        </span>
                      ))}
                      {topics.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md text-[9px] font-bold">
                          +{topics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats & Navigation footer */}
                  <div className="pt-3.5 border-t border-gray-50 mt-auto flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                      <Users className="w-4 h-4 text-rose-500" />
                      {group.members_count || group.member_count || 0} members
                    </span>
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/groups/${group.id}`)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl px-4 text-xs font-bold shadow-sm flex items-center gap-1 h-9 border border-rose-100/50"
                    >
                      Enter Community
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
