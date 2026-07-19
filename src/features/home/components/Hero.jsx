import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, ShieldCheck, Heart, Sparkles, MapPin, Search, Compass, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/ui/button';
import { useGetMeQuery } from '@/store/api/authApi';

export function Hero() {
  const navigate = useNavigate();
  const { data: userData } = useGetMeQuery();

  const handleJoinCommunity = () => {
    if (!userData?.user) {
      navigate('/signup');
      return;
    }
    if (userData.user.isHost) {
      toast.info('You are already a registered host!');
      return;
    }
    navigate('/search');
  };

  const handleExploreStays = () => {
    navigate('/search');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };



  return (
    <section className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-b from-cream/20 via-white to-white pt-16 pb-6 lg:pt-12 lg:pb-8" aria-labelledby="home-hero-title">
      {/* Glow Orbs */}
      <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 -z-10 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[90px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent"
          >
            <Compass className="h-3.5 w-3.5 animate-[pulse_2s_infinite]" />
            <span>Premium Expat Stays & Relocation</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            id="home-hero-title"
            variants={itemVariants}
            className="max-w-4xl text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-primary sm:text-5xl lg:text-[60px]"
          >
            Feel at Home, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-accent via-[#D5CBA8] to-primary bg-clip-text text-transparent">Wherever Life Takes You.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-2xl text-base leading-relaxed text-slate-500 font-normal sm:text-lg sm:leading-8"
          >
            Discover verified premium stays, access local relocation support, and connect with a trusted global community of expats and locals in your new city.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md"
          >
            <Button
              type="button"
              onClick={handleExploreStays}
              className="w-full sm:w-auto h-12 rounded-xl bg-accent px-8 text-sm font-semibold text-white shadow-sm shadow-accent/10 hover:bg-accent/95 hover:shadow-md transition-all duration-200 cursor-pointer active:scale-98"
            >
              Explore Stays
            </Button>
            <button
              type="button"
              onClick={handleJoinCommunity}
              className="w-full sm:w-auto h-12 rounded-xl border border-accent text-accent hover:bg-accent/5 px-8 text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-98"
            >
              Join the Community
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

