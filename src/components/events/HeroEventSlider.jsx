import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, MapPin, ArrowRight, Clock, Users, Heart, Globe, Star, TrendingUp, Share2 } from "lucide-react"
import { Link } from "react-router-dom"

export const HeroEventSlider = ({ events = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        if (events.length <= 1 || isPaused) return
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % events.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [events.length, isPaused])

    const currentEvent = events[currentIndex]

    if (!currentEvent) return null

    const handleDotClick = (index) => {
        setCurrentIndex(index)
        setIsPaused(true)
        setTimeout(() => setIsPaused(false), 5000)
    }

    // Format date for international audience
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    // Format number for international audience
    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(num)
    }

    return (
        <div className="flex items-center justify-center py-8 w-full">
            <div
                className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-80 sm:h-96 overflow-hidden rounded-2xl transition-all duration-500 transform hover:scale-105"
                style={{
                    boxShadow: `
                        0 20px 25px -5px rgba(0, 21, 45, 0.1),
                        0 10px 10px -5px rgba(0, 21, 45, 0.04),
                        inset 0 0 0 1px rgba(0, 21, 45, 0.05)
                    `
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="absolute inset-0 bg-[#00152d]">
                    {currentEvent.image ? (
                        <img
                            src={currentEvent.image}
                            alt={currentEvent.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#00152d] to-[#0A1A2F] flex items-center justify-center">
                            <Calendar className="w-20 h-20 text-white/5" />
                        </div>
                    )}
                </div>

                {/* Dark Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-[#00152d]" />
                    <div className="absolute top-0 left-0 w-full h-full">
                        {[...Array(15)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute rounded-full bg-red-500"
                                style={{
                                    width: Math.random() * 30 + 10 + 'px',
                                    height: Math.random() * 30 + 10 + 'px',
                                    left: Math.random() * 100 + '%',
                                    top: Math.random() * 100 + '%',
                                    opacity: Math.random() * 0.5 + 0.1
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 z-10 h-full">
                    {/* Top Section: Category, Date & Location */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-2">
                            <motion.span
                                className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold shadow-md"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                {currentEvent.category}
                            </motion.span>
                            {currentEvent.trending && (
                                <div className="flex items-center gap-1 text-yellow-400 text-xs">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>Trending</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-end text-white">
                            <span className="text-2xl font-bold leading-none">
                                {formatDate(currentEvent.date).split(' ')[1]}
                            </span>
                            <span className="text-xs uppercase">
                                {formatDate(currentEvent.date).split(' ')[0]}
                            </span>
                        </div>
                    </div>

                    {/* Middle Section: Content Animation */}
                    <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="text-center w-full"
                            >
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 line-clamp-2 drop-shadow-lg">
                                    {currentEvent.title}
                                </h3>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-white/90 text-sm">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate max-w-[180px]">{currentEvent.location}</span>
                                    </div>
                                    {currentEvent.country && (
                                        <div className="flex items-center gap-1">
                                            <Globe className="h-3 w-3" />
                                            <span>{currentEvent.country}</span>
                                        </div>
                                    )}
                                </div>
                                {currentEvent.time && (
                                    <div className="flex items-center justify-center gap-1 mt-2 text-white/90 text-sm">
                                        <Clock className="h-3 w-3" />
                                        <span>{currentEvent.time}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-center gap-4 mt-2 text-white/90 text-sm">
                                    {currentEvent.membersGoing && (
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            <span>{formatNumber(currentEvent.membersGoing)} going</span>
                                        </div>
                                    )}
                                    {currentEvent.rating && (
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 text-yellow-400" />
                                            <span>{currentEvent.rating}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Bottom Section: Action */}
                    <div className="flex justify-between items-center">
                        <Link to={`/events/${currentEvent.id}`}>
                            <motion.button
                                className="group relative px-6 py-2 bg-[#C93A30] hover:bg-[#b02e25] text-white rounded-full font-medium text-sm shadow-lg flex items-center gap-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                View Details
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </Link>

                        <div className="flex gap-2">
                            <motion.button
                                className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <Heart className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                                className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <Share2 className="h-4 w-4" />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Slider Dots */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                    {events.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                ? "w-8 bg-red-500"
                                : "w-2 bg-white/50 hover:bg-white/70"
                                }`}
                        />
                    ))}
                </div>

                {/* International Badge */}
                {currentEvent.international && (
                    <div className="absolute top-4 right-4 z-20">
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full">
                            <Globe className="h-3 w-3 text-white" />
                            <span className="text-xs text-white font-medium">International</span>
                        </div>
                    </div>
                )}

                {/* Hover Overlay */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-[#00152d]/20 to-transparent pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </div>
    )
}