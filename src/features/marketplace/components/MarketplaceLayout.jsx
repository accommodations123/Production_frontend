import { ShoppingBag, Tag, Plus } from 'lucide-react';
import { Button } from "@/shared/ui/button";
import { motion } from "framer-motion";

export function MarketplaceLayout({ children, activeTab, onTabChange, hideHero = false }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Harmonized Hero Section (Matching EventsHero.jsx & Travel Page) */}
      {!hideHero && (
        <div className="relative bg-white pt-8 pb-8 sm:pb-10 md:pb-12 px-4 overflow-hidden border-b border-gray-100">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 lg:gap-12">

            {/* Left Content */}
            <div className="text-center md:text-left max-w-2xl animate-fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#00142E] mb-6 leading-[1.1] tracking-tight">
                Discover Buy & Sell <span className="text-[#E1392A]">Items</span>
              </h1>

              <p className="text-[#00142E]/70 text-base md:text-lg max-w-xl mb-8 font-medium leading-relaxed">
                Explore verified pre-owned items, furniture, electronics, vehicles, and expat relocation deals around the world.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center md:justify-start mb-2">
                {/* Premium Tab Switcher */}
                <div className="flex bg-gradient-to-br from-gray-100 to-gray-50 p-1.5 rounded-2xl shadow-inner border border-gray-200/50">
                  <button
                    onClick={() => onTabChange('buy')}
                    className={`relative flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === 'buy'
                        ? 'bg-white text-[#00142E] shadow-lg shadow-gray-200/50'
                        : 'text-[#484848] hover:text-gray-700'
                      }`}
                  >
                    <ShoppingBag className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Buy Items</span>
                  </button>

                  <button
                    onClick={() => onTabChange('sell')}
                    className={`relative flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === 'sell'
                        ? 'bg-[#E1392A] text-white shadow-lg shadow-[#E1392A]/30'
                        : 'text-[#484848] hover:text-gray-700'
                      }`}
                  >
                    <Tag className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Sell Items</span>
                  </button>
                </div>

                {activeTab !== 'sell' && (
                  <Button
                    onClick={() => onTabChange('sell')}
                    className="h-12 px-6 sm:px-8 bg-[#E1392A] hover:bg-[#E1392A]/90 text-white rounded-xl font-medium shadow-lg shadow-[#00142E]/20 flex items-center gap-2 transform hover:scale-105 transition-all duration-300 text-sm sm:text-base cursor-pointer border-0"
                  >
                    <Plus className="h-5 w-5" />
                    Sell an Item
                  </Button>
                )}
              </div>
            </div>

            {/* Right Side Visual Hero Card (Matching Events & Travel) */}
            <div className="w-full md:w-1/2 flex items-center justify-center animate-slide-in-right">
              <div className="relative w-full max-w-md h-64 sm:h-72 rounded-3xl overflow-hidden bg-gradient-to-br from-[#00142E] via-[#071F3B] to-slate-900 p-6 text-white flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/15">
                    Verified Expat Goods
                  </span>
                  <ShoppingBag className="w-6 h-6 text-[#E1392A]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-extrabold">Fee-Free Community Deals</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Buy and sell directly with verified expat hosts and residents in your destination city.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-emerald-300">Live Marketplace</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      )}

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-none px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      {/* Background Blobs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#E1392A]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#00142E]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
