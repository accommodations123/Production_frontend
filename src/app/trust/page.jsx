"use client"

import React from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { motion } from "framer-motion"
import { Shield, Lock, Eye, UserCheck, AlertTriangle, CheckCircle, HeartHandshake, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

const TrustCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="p-8 rounded-3xl bg-white border border-[#D1CBB7]/30 hover:border-[#CB2A25]/30 hover:shadow-xl transition-all group"
    >
        <div className="w-14 h-14 bg-[#00142E] rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:bg-[#CB2A25] transition-colors">
            <Icon className="text-white h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold text-[#00142E] mb-4">{title}</h3>
        <p className="text-[#00142E]/60 leading-relaxed">
            {description}
        </p>
    </motion.div>
)

export default function TrustPage() {
    return (
        <main className="min-h-screen bg-[#ffffff] font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-[#00142E] via-[#0A1C30] to-[#02152B]">
                <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                {/* Accent Glow */}
                <motion.div
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[30%] -right-[20%] w-[600px] h-[600px] rounded-full bg-[#CB2A25] blur-[200px] z-0"
                />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CB2A25]/20 border border-[#CB2A25]/30 text-white text-sm font-medium mb-8">
                            <Shield className="h-4 w-4 text-[#CB2A25]" />
                            <span>Your Safety is Our Priority</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
                            Trust Built <br />
                            <span className="text-[#CB2A25]">For You.</span>
                        </h1>
                        <p className="text-xl text-[#D1CBB7] max-w-2xl mx-auto leading-relaxed mb-12">
                            We've built a multi-layered defense system to ensure every interaction, booking, and community connection on NextKinLife is secure, verified, and worry-free for Indians abroad.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Core Pillars */}
            <section className="py-20 bg-[#ffffff]">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TrustCard
                            icon={UserCheck}
                            title="Verified  Hosts"
                            delay={0.1}
                            description="Every host in our community is verified with government ID checks. Connect with fellow Indians who understand your needs."
                        />

                        <TrustCard
                            icon={Eye}
                            title="Community Monitoring"
                            delay={0.3}
                            description="Powered algorithms monitor marketplace listings and community groups 24/7 to prevent scams."
                        />
                        <TrustCard
                            icon={AlertTriangle}
                            title="24/7 Support"
                            delay={0.4}
                            description="Our dedicated support team is available around the clock to handle emergencies and assist with any issues."
                        />
                        <TrustCard
                            icon={HeartHandshake}
                            title="Community Guidelines"
                            delay={0.5}
                            description="Clear community guidelines ensure respectful interactions in groups, events, and marketplace."
                        />
                        <TrustCard
                            icon={CheckCircle}
                            title="Verified Listings"
                            delay={0.6}
                            description="All accommodations, events, and marketplace listings are reviewed for accuracy before going live."
                        />
                    </div>
                </div>
            </section>

            {/* Commitment Section */}
            <section className="py-24 bg-[#D1CBB7]/10 border-y border-[#D1CBB7]/30">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl font-bold text-[#00142E]">
                                Our Community <br />
                                <span className="text-[#CB2A25]">Commitment</span>
                            </h2>
                            <p className="text-[#00142E]/70 text-lg leading-relaxed">
                                Trust isn't just about technology; it's about people. We foster a community where respect and inclusion aren't just rules—they're our way of life.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { title: "Zero Tolerance Policy", desc: "We have zero tolerance for discrimination, harassment, or hate speech in our community." },
                                    // { title: "Verified Reviews", desc: "All reviews are from real community members with verified stays or transactions." },
                                    { title: "Data Privacy", desc: "Your personal data is never sold. We comply with international privacy standards." },
                                    // { title: "Secure Messaging", desc: "All in-app communications are encrypted and monitored for safety." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="mt-1">
                                            <div className="w-8 h-8 rounded-full bg-[#CB2A25]/10 flex items-center justify-center text-[#CB2A25]">
                                                <CheckCircle size={16} />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-[#00142E] font-bold text-lg">{item.title}</h4>
                                            <p className="text-[#00142E]/60">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#CB2A25]/20 to-[#00142E]/20 rounded-3xl blur-2xl" />
                            <div className="relative bg-[#00142E] border border-[#D1CBB7]/20 rounded-3xl p-8 shadow-2xl">
                                <h3 className="text-2xl font-bold text-white mb-6">Need help with a safety issue?</h3>
                                <p className="text-[#D1CBB7] mb-8">
                                    Our Trust & Safety team is standing by to assist you.
                                </p>
                                <div className="space-y-4">
                                    <Button className="w-full h-14 bg-[#CB2A25] hover:bg-[#b02420] text-white font-bold text-lg rounded-xl">
                                        Visit Safety Center
                                    </Button>
                                    <Button variant="outline" className="w-full h-14 border-[#D1CBB7]/30 text-white hover:bg-white/5 font-bold text-lg rounded-xl flex items-center justify-center gap-2">
                                        <Phone size={18} /> Emergency Contact
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
