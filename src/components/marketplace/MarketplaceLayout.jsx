import React from 'react';
import { MapPin, ShoppingBag, Tag, Sparkles, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function MarketplaceLayout({ children, activeTab, onTabChange }) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans">
            {/* Premium Top Bar with Glass Effect */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 md:py-0 md:h-18 flex flex-col md:flex-row items-center justify-between gap-4">

                    {/* Premium Tab Switcher */}
                    <div className="flex bg-gradient-to-br from-gray-100 to-gray-50 p-1.5 rounded-2xl shadow-inner border border-gray-200/50">
                        <motion.button
                            onClick={() => onTabChange('buy')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === 'buy'
                                ? 'bg-white text-[#00142E] shadow-lg shadow-gray-200/50'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {activeTab === 'buy' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white rounded-xl shadow-lg shadow-gray-200/50"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <ShoppingBag className="h-4 w-4 relative z-10" />
                            <span className="hidden sm:inline relative z-10">Buy Items</span>
                            <span className="sm:hidden relative z-10">Buy</span>
                        </motion.button>

                        <motion.button
                            onClick={() => onTabChange('sell')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === 'sell'
                                ? 'bg-gradient-to-r from-[#C93A30] to-[#E04642] text-white shadow-lg shadow-[#C93A30]/30'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {activeTab === 'sell' && (
                                <motion.div
                                    layoutId="activeTabSell"
                                    className="absolute inset-0 bg-gradient-to-r from-[#C93A30] to-[#E04642] rounded-xl shadow-lg shadow-[#C93A30]/30"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Tag className="h-4 w-4 relative z-10" />
                            <span className="hidden sm:inline relative z-10">Sell Items</span>
                            <span className="sm:hidden relative z-10">Sell</span>
                        </motion.button>
                    </div>

                    {/* Premium Quick Actions */}
                    {activeTab !== 'sell' && (
                        <motion.div
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Button
                                onClick={() => onTabChange('sell')}
                                className="relative overflow-hidden group bg-gradient-to-r from-[#C93A30] to-[#E04642] hover:from-[#b02e25] hover:to-[#d03d39] text-white font-bold text-sm h-10 sm:h-11 px-5 sm:px-6 rounded-xl shadow-lg shadow-[#C93A30]/25 hover:shadow-[#C93A30]/40 transition-all duration-300 cursor-pointer border-0"
                            >
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                <Plus className="h-4 w-4 mr-2" />
                                <span className="relative z-10">Sell an Item</span>
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Main Content Area with Premium Background */}
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
            </main>

            {/* Subtle Background Decoration */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#C93A30]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#00142E]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}