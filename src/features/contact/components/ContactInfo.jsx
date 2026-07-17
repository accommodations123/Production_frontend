import { MapPin, Mail, Phone, Clock, Globe, MessageCircle, Star, Shield } from "lucide-react"
import { motion } from "framer-motion"

const CONTACT_DETAILS = [
    {
        icon: Globe,
        title: "Global Headquarters",
        content: "8795 Stonehouse Dr, Ellicott City, MD - 21043",
        subcontent: "United States",
        badge: "Main Office"
    },
    {
        icon: Mail,
        title: "Email Us",
        content: "accommodations.nextkinlife@gmail.com",
        subcontent: "support@nextkinlife.com",
        badge: "24/7 Support"
    },
    {
        icon: Phone,
        title: "Call Us",
        content: "+1 314 548 9101",
        badge: "Toll Free"
    },
    {
        icon: Clock,
        title: "Business Hours",
        content: "Mon-Fri: 9AM - 6PM EST",
        subcontent: "Sat-Sun: 10AM - 4PM EST",
        badge: "Available"
    }
]

const FEATURES = [
    { icon: Shield, title: "Secure & Private", description: "Your data is always protected" },
    { icon: Star, title: "Expert Support", description: "Professional assistance guaranteed" },
    { icon: MessageCircle, title: "Quick Response", description: "Get replies within hours" }
]

export function ContactInfo() {
    return (
        <div className="space-y-8">
            {/* Contact Cards */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white">Get in Touch</h2>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-sm text-emerald-300 font-medium">Online Now</span>
                    </div>
                </div>

                <div className="grid gap-6">
                    {CONTACT_DETAILS.map((item, index) => {
                        const Icon = item.icon
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#CB2A25]/30 transition-all hover:bg-white/10"
                            >
                                <div className="absolute top-4 right-4">
                                    <span className="px-3 py-1 bg-[#CB2A25]/20 text-[#CB2A25] text-xs font-semibold rounded-full">
                                        {item.badge}
                                    </span>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-[#CB2A25]/10 group-hover:bg-[#CB2A25]/20 transition-all duration-300">
                                        <Icon className="h-6 w-6 text-[#CB2A25]" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                                        <p className="text-white/80 font-medium mb-1">{item.content}</p>
                                        <p className="text-white/50 text-sm">{item.subcontent}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-gradient-to-br from-[#CB2A25]/10 to-[#D1CBB7]/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">Why Choose Us</h3>
                <div className="grid gap-4">
                    {FEATURES.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.4 }}
                                className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                            >
                                <div className="p-2 bg-[#CB2A25]/10 rounded-lg">
                                    <Icon className="h-5 w-5 text-[#CB2A25]" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">{feature.title}</h4>
                                    <p className="text-sm text-white/60">{feature.description}</p>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Enhanced Map Section */}
            <div className="relative rounded-3xl overflow-hidden h-96 group">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1748&auto=format&fit=crop"
                        alt="Map Background"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#00142E] via-[#00142E]/50 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center p-8">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 text-center max-w-md w-full hover:bg-white/15 transition-all"
                    >
                        <MapPin className="h-12 w-12 mx-auto mb-4 text-[#CB2A25] animate-bounce" />
                        <h3 className="text-2xl font-bold text-white mb-2">Visit Our Office</h3>
                        <p className="text-white/70 mb-4">Experience our innovation hub firsthand</p>
                        <button className="px-6 py-3 bg-[#CB2A25] hover:bg-[#a82220] text-white font-semibold rounded-xl transition-all">
                            Get Directions
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}