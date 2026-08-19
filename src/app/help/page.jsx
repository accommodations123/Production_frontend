"use client"

import React, { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { motion, AnimatePresence } from "framer-motion"
import { Search, HelpCircle, Book, MessageSquare, CreditCard, Home, Settings, ChevronDown, FileText, Shield, Plus, Minus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const CategoryCard = ({ icon: Icon, title, description }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="text-left p-6 rounded-2xl bg-white border border-[#D1CBB7]/30 shadow-sm hover:shadow-xl hover:border-[#CB2A25]/30 transition-all group h-full"
    >
        <div className="w-12 h-12 bg-[#00142E]/10 text-[#00142E] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#CB2A25] group-hover:text-white transition-colors">
            <Icon size={24} />
        </div>
        <h3 className="text-lg font-bold text-[#00142E] mb-2">{title}</h3>
        <p className="text-sm text-[#00142E]/60 mb-4 h-10">{description}</p>
    </motion.button>
)

// FAQ Data with actual answers
const faqArticles = [
    {
        question: "How to find accommodations with Indian hosts?",
        answer: "Browse our Accommodations section to find verified stays with Indian hosts who understand your cultural needs. Use filters to search by location, amenities like vegetarian kitchen, prayer room, or home-cooked meals. Each listing shows host verification status, reviews, and cultural amenities available. You can message hosts directly to discuss your specific requirements before booking."
    },
    {
        question: "Joining and participating in community groups",
        answer: "Navigate to the Community Groups section to discover groups based on your interests, profession, or location. You can join public groups instantly or request access to private groups. Once joined, participate in discussions, share experiences, attend group events, and connect with fellow Indians abroad. Create your own group if you don't find one that matches your interests."
    },
    {
        question: "How to list your property on NextKinLife?",
        answer: "To become a host, click 'Become Host' in the navigation and complete your host profile with verification. Then go to your dashboard and select 'Add Property'. Fill in property details including photos, amenities, pricing, and house rules. Highlight cultural amenities like vegetarian kitchen, Indian channels, or proximity to temples. Your listing will be reviewed and approved within 24-48 hours."
    },
    {
        question: "Safety tips for meeting travel partners",
        answer: "Always verify your travel partner's profile and reviews before planning a trip together. Start with a video call to get to know them. Share your travel itinerary with a trusted friend or family member. Meet in public places first if possible. Use our in-app messaging to keep all communications documented. Report any suspicious behavior immediately to our Trust & Safety team."
    },
    {
        question: "Buying and selling safely in the marketplace",
        answer: "All marketplace sellers are verified community members. Before purchasing, check the seller's profile, ratings, and previous transaction history. Use our secure messaging to negotiate and arrange details. For high-value items, we recommend meeting in safe public locations. Never share personal financial information outside the platform. If something seems suspicious, report it using the 'Report' button on any listing."
    },
    {
        question: "How to report inappropriate content?",
        answer: "If you encounter any content that violates our community guidelines, click the three-dot menu on the post, listing, or message and select 'Report'. Choose the reason for reporting and provide any additional details. Our Trust & Safety team reviews all reports within 24 hours and takes appropriate action. For urgent safety concerns, contact our 24/7 emergency support line."
    },
    {
        question: "Setting up your profile for the community",
        answer: "A complete profile helps you connect better with the community. Add a clear profile photo and write a brief bio about yourself. Mention your hometown in India, current location, interests, and what you're looking for in the community. Verify your identity to get the verified badge, which increases trust with hosts, sellers, and potential travel partners. Link your social media accounts for additional credibility."
    }
]

const FAQItem = ({ question, answer, isOpen, onToggle }) => (
    <div className="border-b border-[#D1CBB7]/20 last:border-b-0">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-[#D1CBB7]/5 transition-colors"
        >
            <div className="flex items-center gap-3">
                <FileText size={18} className={`transition-colors ${isOpen ? 'text-[#CB2A25]' : 'text-[#00142E]/40'}`} />
                <span className={`font-medium transition-colors ${isOpen ? 'text-[#CB2A25]' : 'text-[#00142E]'}`}>
                    {question}
                </span>
            </div>
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-[#CB2A25] text-white' : 'bg-[#00142E]/10 text-[#00142E]'}`}>
                {isOpen ? <Minus size={14} /> : <Plus size={14} />}
            </div>
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                >
                    <div className="px-5 pb-5 pl-11">
                        <p className="text-[#00142E]/70 leading-relaxed">
                            {answer}
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
)

export default function HelpPage() {
    const [openIndex, setOpenIndex] = useState(null)

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <main className="min-h-screen bg-[#ffffff] font-sans">
            <Navbar />

            {/* Search Hero */}
            <div className="bg-gradient-to-br from-[#00142E] via-[#0A1C30] to-[#02152B] pt-32 pb-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                {/* Accent Glow */}
                <motion.div
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#CB2A25] rounded-full blur-[200px] opacity-20"
                />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            How can we <span className="text-[#CB2A25]">help you?</span>
                        </h1>
                        <p className="text-[#D1CBB7] text-lg mb-8 max-w-xl mx-auto">
                            Find answers to common questions about accommodations, community groups, events, and more.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Content Container */}
            <div className="container mx-auto px-4 -mt-12 relative z-20">
                {/* Categories */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    <CategoryCard
                        icon={Book}
                        title="Getting Started"
                        description="New to NextKinLife? Learn how to find accommodations, join groups, and connect with the community."
                    />
                    <CategoryCard
                        icon={Home}
                        title="Accommodations"
                        description="Find verified stays with Indian hosts, cultural amenities, and home-cooked meals."
                    />
                    <CategoryCard
                        icon={MessageSquare}
                        title="Community Groups"
                        description="Join interest-based groups, connect with fellow Indians, and share experiences."
                    />
                    <CategoryCard
                        icon={CreditCard}
                        title="Events & Meetups"
                        description="Discover cultural events, festivals, and community gatherings near you."
                    />
                    <CategoryCard
                        icon={Settings}
                        title="Marketplace"
                        description="Buy, sell, and trade with trusted community members safely."
                    />
                    <CategoryCard
                        icon={Shield}
                        title="Travel Partners"
                        description="Find travel companions, share trips, and explore together safely."
                    />
                </div>

                {/* Popular Articles - Now Expandable FAQs */}
                <div className="max-w-4xl mx-auto mb-20">
                    <h2 className="text-2xl font-bold text-[#00142E] mb-8 pl-4 border-l-4 border-[#CB2A25]">Frequently Asked Questions</h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-[#D1CBB7]/30 overflow-hidden">
                        {faqArticles.map((faq, index) => (
                            <FAQItem
                                key={index}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openIndex === index}
                                onToggle={() => toggleFAQ(index)}
                            />
                        ))}
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="max-w-4xl mx-auto bg-[#00142E] text-white rounded-3xl p-12 text-center relative overflow-hidden mb-20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#CB2A25]/20 rounded-full blur-3xl -mr-16 -mt-16" />

                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
                        <p className="text-[#D1CBB7] mb-8 max-w-xl mx-auto">
                            Our support team is available 24/7. We usually respond within minutes.
                        </p>
                        <Button className="bg-[#CB2A25] hover:bg-[#b02420] text-white font-bold h-12 px-8 rounded-full">
                            Contact Support
                        </Button>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
