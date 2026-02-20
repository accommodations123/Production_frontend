"use client"

import React, { useState } from 'react';
import {
  Shield, ShieldCheck, Sparkles, MapPin, Users, Calendar,
  ArrowRight, Heart, Globe, Star, Facebook, Instagram, MessageCircle
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCountry } from '@/context/CountryContext';

// API Hooks
import {
  useGetApprovedPropertiesQuery,
  useGetAllPropertiesQuery,
  useGetApprovedEventsQuery,
  useGetCommunitiesQuery,
  useGetBuySellListingsQuery
} from '@/store/api/hostApi';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Child Components
import { SectionHeader } from './featured/SectionHeader.jsx';
import { PropertyCard } from './featured/PropertyCard.jsx';
import { EventCard } from './featured/EventCard.jsx';
import { CommunityGroupCard } from './featured/CommunityGroupCard.jsx';
import { ProductCard } from '../marketplace/ProductCard.jsx';
import { TravelCommunity } from '../dashboard/TravelCommunity';
import {
  SAFETY_TIPS, FEATURE_CARDS
} from './featured/HomeFeaturedConstants.jsx';
const openSocialLink = (platform, value, fallbackPhone) => {
  if (!value && !fallbackPhone) return;

  let url = null;

  switch (platform) {
    case "whatsapp": {
      const num = (value || fallbackPhone || "").replace(/\D/g, "");
      if (!num) return;
      url = `https://wa.me/${num}`;
      break;
    }

    case "instagram": {
      const handle = value?.replace(/^@/, "");
      if (!handle) return;
      url = `https://instagram.com/${handle}`;
      break;
    }

    case "facebook": {
      if (!value) return;
      url = value.startsWith("http")
        ? value
        : `https://facebook.com/${value}`;
      break;
    }

    default:
      return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};

// Inline Skeleton
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-neutral/10 rounded-2xl ${className}`} />
);

const HomeFeatured = () => {
  const navigate = useNavigate();
  const { activeCountry } = useCountry();
  const { data: allProperties, isLoading: propertiesLoading } = useGetAllPropertiesQuery({ country: activeCountry?.name, limit: 4 });
  const { data: approvedEvents, isLoading: eventsLoading } = useGetApprovedEventsQuery({ code: activeCountry?.code, limit: 4 });
  const { data: communities, isLoading: communitiesLoading } = useGetCommunitiesQuery({ country: activeCountry?.name, limit: 4 });
  const { data: marketplaceItems, isLoading: marketplaceLoading } = useGetBuySellListingsQuery({ country: activeCountry?.name, limit: 4 });

  const [viewMode, setViewMode] = useState("grid");

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  return (
    <div className="bg-white font-inter text-[#00142E]">

      {/* 1. Community Stays Section */}
      <section className="py-4 sm:py-6 relative overflow-hidden">
        {/* Decorative Blob */}
        <div className="absolute top-0 right-0 w-[300px] sm:w-[400px] lg:w-[500px] h-[300px] sm:h-[400px] lg:h-[500px] bg-gradient-to-br from-[#CB2A25]/5 to-transparent rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title="Accommodations"
            subtitle="Explore verified homes with Indian hosts and cultural amenities."
            linkText="View All Stays"
            linkTo="/search"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {propertiesLoading ? (
              [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[300px] sm:h-[380px] lg:h-[420px]" />)
            ) : allProperties?.length > 0 ? (
              allProperties.slice(0, 4).filter(Boolean).map((property, idx) => (
                <motion.div
                  key={property.id || property._id}
                  {...fadeInUp}
                  transition={{ delay: idx * 0.1 }}
                >
                  <PropertyCard property={property} />

                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 sm:py-16 lg:py-20 text-center bg-[#F8F9FA] rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-[#D1CBB7]/30">
                <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-[#D1CBB7] mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-[#00142E] mb-2">No Stays Found</h3>
                <p className="text-[#00142E]/60 text-sm sm:text-base">Be the first to list a property in our community.</p>
                <Button onClick={() => navigate('/host/create')} className="mt-4 sm:mt-6 bg-[#CB2A25] hover:bg-[#a0221e] text-white rounded-full text-sm sm:text-base px-4 sm:px-6 py-2">List Your Property</Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Travel Community - Distinct Section (Collapses if empty) */}
      <TravelCommunity
        variant="featured"
        onConnect={() => window.location.href = '/travel'}
      />

      {/* 3. Community Groups Section */}
      <section className="py-4 sm:py-6 relative bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Community Groups"
            subtitle="Connect with fellows based on interests, location, and profession."
            linkText="Explore Groups"
            linkTo="/groups"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {communitiesLoading ? (
              [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[300px] sm:h-[350px] lg:h-[380px]" />)
            ) : communities?.length > 0 ? (
              communities.slice(0, 4).filter(Boolean).map((group, idx) => (
                <motion.div
                  key={group.id || group._id}
                  {...fadeInUp}
                  transition={{ delay: idx * 0.1 }}
                >
                  <CommunityGroupCard group={group} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 sm:py-16 text-[#00142E]/50">No community groups found.</div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Community Events Section */}
      <section className="py-4 sm:py-6 relative bg-[#F8F9FA] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title="Events"
            subtitle="Discover festivals, meetups, and cultural celebrations near you."
            linkText="View All Events"
            linkTo="/events"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {eventsLoading ? (
              [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[300px] sm:h-[350px] lg:h-[380px] bg-gray-100 rounded-2xl" />)
            ) : approvedEvents?.length > 0 ? (
              approvedEvents.slice(0, 4).filter(Boolean).map((event, idx) => (
                <motion.div
                  key={event.id || event._id}
                  {...fadeInUp}
                  transition={{ delay: idx * 0.1 }}
                  className="h-full"
                >
                  <EventCard
                    event={event}
                    viewMode="grid"
                    onViewDetails={(id) => navigate(`/events/${id}`, { state: { eventParam: event } })}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 sm:py-16 lg:py-20 text-center bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#00142E] mb-2">No Events Scheduled</h3>
                <p className="text-[#00142E]/60 text-sm sm:text-base mb-6 sm:mb-8">Be the first to create a community event!</p>
                <Link to="/events/host" className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 bg-[#00142E] text-white rounded-full font-bold hover:bg-[#CB2A25] transition-all shadow-lg hover:shadow-xl text-sm sm:text-base">
                  Host an Event
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Marketplace */}
      <section className="py-4 sm:py-6 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Marketplace"
            subtitle="Buy, sell, and trade with trusted community members."
            linkText="Browse Marketplace"
            linkTo="/marketplace"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {marketplaceLoading ? (
              [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[280px] sm:h-[320px] lg:h-[340px]" />)
            ) : marketplaceItems?.length > 0 ? (
              marketplaceItems.slice(0, 4).filter(Boolean).map((item, idx) => (
                <motion.div key={item.id} {...fadeInUp} transition={{ delay: idx * 0.1 }}>
                  <ProductCard product={item} onClick={(p) => navigate(`/marketplace?product=${p.id}`)} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 sm:py-16 text-[#00142E]/50">No active listings.</div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Safety Tips Section */}
      <section className="py-4 sm:py-6 bg-[#F8F9FA]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Safety Tips"
            subtitle="Important guidelines for a safe and positive community experience."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {SAFETY_TIPS.map((tip, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#00142E]/10 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#00142E]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#00142E] text-base sm:text-lg mb-2">{tip.title}</h3>
                    <p className="text-[#00142E]/60 text-sm">{tip.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Feature Cards Section */}
      <section className="py-4 sm:py-6 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURE_CARDS.map((card, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-[#00142E] to-[#00142E]/80 p-6 sm:p-8 rounded-2xl text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-full flex items-center justify-center mb-4">
                    {card.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3">{card.title}</h3>
                  <p className="text-white/80 mb-6 text-sm sm:text-base">{card.description}</p>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#00142E] rounded-full text-sm sm:text-base">
                    {card.buttonText}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Final Call to Action */}
      <section className="py-6 sm:py-8 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#00142E] tracking-tight">
              Ready to find your <span className="text-[#CB2A25]">home</span>?
            </h2>
            <p className="text-lg sm:text-xl text-[#00142E]/60">
              Join thousands of Indians abroad who are already connecting, living, and celebrating together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                onClick={() => navigate('/search')}
                size="lg"
                className="h-12 sm:h-14 px-6 sm:px-8 lg:px-10 rounded-full bg-[#00142E] text-white hover:bg-[#00142E]/90 text-base sm:text-lg font-bold shadow-xl"
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default HomeFeatured;