"use client"

import React from "react"
import { ArrowRight, ShieldCheck, Star, Users, Home, Calendar, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useGetMeQuery } from "@/store/api/authApi"
import { toast } from "sonner"

export function Hero() {
  const navigate = useNavigate()
  const { data: userData } = useGetMeQuery()

  const handleJoinCommunity = () => {
    if (!userData?.user) {
      navigate('/signup')
    } else if (userData.user.isHost) {
      toast.info("You are already a registered host!")
    } else {
      navigate('/groups')
    }
  }

  return (
    <div className="relative bg-gradient-to-br from-white via-[#FFF8F7] to-white overflow-hidden min-h-[100dvh] sm:min-h-[90vh] md:min-h-[85vh] flex items-center pt-20 sm:pt-24 pb-6 md:pb-10">

      {/* Premium Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-[#C93A30]/20 to-orange-300/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-gradient-to-tr from-blue-400/10 to-purple-400/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-gradient-to-t from-[#C93A30]/10 to-pink-300/10 rounded-full blur-[60px]" />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,20,46,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,20,46,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Floating Accent Lines */}
        <div className="absolute top-1/4 right-20 w-40 h-px bg-gradient-to-r from-transparent via-[#C93A30]/30 to-transparent animate-pulse" />
        <div className="absolute bottom-1/3 left-10 w-32 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />

        {/* Sparkle Dots */}
        <div className="absolute top-40 left-1/4 w-2 h-2 bg-[#C93A30]/40 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-60 right-1/3 w-1.5 h-1.5 bg-orange-400/50 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-blue-400/30 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>

      {/* Dynamic Background Shape */}
      <div className="absolute top-0 right-0 w-full md:w-2/3 h-full bg-gradient-to-bl from-[#FFF5F5] via-[#FFF0EE] to-transparent skew-y-12 md:skew-y-0 md:skew-x-12 translate-y-32 md:translate-y-0 md:translate-x-32 z-0 opacity-60 md:opacity-80" />

      {/* Content Container */}
      <div className="container mx-auto px-4 sm:px-5 md:px-6 relative z-10 w-full">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">

          {/* LEFT: Content */}
          <div className="space-y-5 sm:space-y-6 md:space-y-8 max-w-2xl pt-4 md:pt-0 animate-in fade-in slide-in-from-left-10 duration-1000">

            {/* Premium Badge with Glow */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#C93A30]/20 text-[#C93A30] text-xs md:text-sm font-bold shadow-lg shadow-[#C93A30]/10 hover:shadow-xl hover:shadow-[#C93A30]/20 transition-all duration-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C93A30] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-br from-[#C93A30] to-orange-500"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5" />
              Most Trusted Community
            </div>

            {/* Headline with Enhanced Typography */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#00142E] leading-[1.05] tracking-tight">
              Feels Like <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#C93A30] via-[#E44D42] to-[#FF6B5E] bg-clip-text text-transparent">
                  Home
                </span>
                {/* Animated Underline */}
                <svg className="absolute w-full h-4 md:h-5 -bottom-1 md:-bottom-2 left-0" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#C93A30" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#E44D42" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#FF6B5E" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  <path d="M0 6 Q 25 12 50 6 T 100 6" stroke="url(#underlineGradient)" strokeWidth="8" fill="none" className="animate-pulse" />
                </svg>
              </span>
              , Everywhere.
            </h1>

            {/* Enhanced Subtext */}
            <p className="text-base sm:text-lg md:text-xl text-[#00142E]/60 font-medium leading-relaxed max-w-lg">
              Find verified accommodations, events, and a <span className="text-[#C93A30] font-semibold">family away from home</span>.
            </p>

            {/* Premium CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                onClick={handleJoinCommunity}
                size="lg"
                className="group h-14 md:h-16 px-8 md:px-12 rounded-full bg-gradient-to-r from-[#C93A30] via-[#D94438] to-[#E44D42] hover:from-[#b02e25] hover:via-[#C93A30] hover:to-[#D94438] text-white text-base md:text-lg font-bold shadow-xl shadow-[#C93A30]/30 hover:shadow-2xl hover:shadow-[#C93A30]/40 transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto cursor-pointer border-0"
              >
                <span>Join Community</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-4 sm:pt-6 md:pt-8 flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8">
              <div className="flex items-center gap-2 text-sm text-[#00142E]/60">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium">Verified Hosts</span>
              </div>

            </div>
          </div>

          {/* RIGHT: Premium Hero Image Collage */}
          <div className="relative h-[300px] sm:h-[350px] md:h-[450px] lg:h-[650px] w-full perspective-1000 mt-6 md:mt-0 hidden sm:block">

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] lg:w-[600px] h-[300px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-[#C93A30]/15 via-orange-300/10 to-pink-300/15 rounded-full blur-[80px] md:blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />

            {/* Main Image Card */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 md:top-10 md:right-10 md:left-auto md:translate-x-0 w-[220px] sm:w-[260px] md:w-[320px] lg:w-[400px] h-[280px] sm:h-[320px] md:h-[400px] lg:h-[500px] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/20 border-[4px] md:border-[6px] border-white transform rotate-3 md:hover:rotate-0 md:hover:scale-105 transition-all duration-700 z-20 group">
              <img
                src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1740&auto=format&fit=crop"
                alt="Indian Community"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content Badge */}
              <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 right-4 md:right-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">Featured</span>
                </div>
                <p className="font-bold text-lg md:text-xl text-white">Community First</p>
                <p className="text-sm text-white/80 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Events & Meetups
                </p>
              </div>
            </div>

            {/* Floating Card 1 */}
            <div className="hidden md:block absolute top-[15%] left-0 md:left-[5%] lg:top-20 lg:left-0 w-40 sm:w-48 md:w-52 lg:w-64 h-28 sm:h-36 md:h-38 lg:h-48 rounded-2xl overflow-hidden shadow-xl shadow-black/15 border-[4px] border-white transform -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-500 z-10 animate-in fade-in slide-in-from-bottom-10 delay-300 group">
              <img
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop"
                alt="Cozy Room"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Badge */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg">
                  <Home className="w-3 h-3 text-[#C93A30]" />
                  <span className="text-xs font-semibold text-[#00142E]">Cozy Stays</span>
                </div>
              </div>
            </div>

            {/* Floating Card 2 */}
            <div className="hidden lg:block absolute bottom-20 right-0 w-56 lg:w-64 h-56 lg:h-64 rounded-[2rem] overflow-hidden shadow-xl shadow-black/15 border-[4px] border-white transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-500 z-30 group">
              <img
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1740&auto=format&fit=crop"
                alt="Friends"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center gap-2">


                </div>
              </div>
            </div>

            {/* Decorative Floating Elements */}
            <div className="absolute top-10 left-10 w-12 h-12 bg-gradient-to-br from-[#C93A30] to-orange-400 rounded-xl rotate-12 opacity-80 shadow-lg animate-bounce" style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-40 left-20 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg -rotate-12 opacity-60 shadow-md animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </div >
  )
}