import { motion } from "framer-motion"
import { Sparkles, ArrowDown, Globe, Users, Zap } from "lucide-react"

export function ContactHeader() {
    const stats = [
        { icon: Users, label: "Happy Clients", value: "10,000+" },
        { icon: Globe, label: "Countries", value: "50+" },
        { icon: Zap, label: "Response Time", value: "< 2hrs" }
    ]

    return (
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
            {/* Badge */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-[#CB2A25]/10 backdrop-blur-sm border border-[#CB2A25]/20 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 max-w-full"
            >
                <Sparkles className="h-4 w-4 text-[#CB2A25] animate-pulse shrink-0" />
                <span className="text-xs sm:text-sm text-white/90 font-medium truncate">Trusted by industry leaders worldwide</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 tracking-tight leading-tight"
            >
                <span className="text-white">
                    Let's Build{" "}
                </span>
                <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CB2A25] to-[#D1CBB7]">
                    Something Amazing
                </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-sm sm:text-lg md:text-xl text-[#D1CBB7]/70 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-12 px-2"
            >
                Transform your ideas into reality with our expert team.
                From concept to launch, we're here to support your journey every step of the way.
            </motion.p>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-3 gap-2 sm:gap-6 md:gap-8 max-w-2xl mx-auto mb-8 sm:mb-12"
            >
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div key={index} className="group p-2 sm:p-4 rounded-2xl bg-white/[0.03] sm:bg-transparent border sm:border-transparent border-white/5">
                            <div className="flex flex-col items-center">
                                <div className="p-2 sm:p-3 bg-[#CB2A25]/10 rounded-xl group-hover:bg-[#CB2A25]/20 transition-colors mb-2 sm:mb-3">
                                    <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-[#CB2A25]" />
                                </div>
                                <div className="text-base sm:text-xl md:text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-[10px] sm:text-xs md:text-sm text-[#D1CBB7]/50">{stat.label}</div>
                            </div>
                        </div>
                    )
                })}
            </motion.div>
        </div>
    )
}