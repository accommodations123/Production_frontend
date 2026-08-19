// components/host/wizard/StepSelection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, Users, Building, Plane, BookOpen } from 'lucide-react';

export const StepSelection = ({ formData, setFormData, nextStep, setContributionType }) => {
    const options = [
        {
            id: 'property',
            title: 'Share Your Space',
            description: 'List your property for cultural exchange, community stays, or long-term hosting',
            icon: <Home className="h-10 w-10" />,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20'
        },
        {
            id: 'event',
            title: 'Host an Event',
            description: 'Organize cultural gatherings, festivals, or community meetups',
            icon: <Calendar className="h-10 w-10" />,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20'
        },
        {
            id: 'group',
            title: 'Start a Community',
            description: 'Create a community group based on interests, culture, or location',
            icon: <Users className="h-10 w-10" />,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/20'
        },
        {
            id: 'travel_companion',
            title: 'Travel Companion',
            description: 'Find peers to travel with and share expenses',
            icon: <Plane className="h-10 w-10" />,
            color: 'from-orange-500 to-amber-500',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/20'
        }
    ];

    const handleSelection = (optionId) => {
        setContributionType(optionId);
        // We set formData.type for backward compatibility if needed, but contributionType is main driver
        setFormData(prev => ({
            ...prev,
            type: optionId
        }));
        nextStep();
    };

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
            >
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#f7eed7] to-[#e6d5b5] bg-clip-text text-transparent">
                    How would you like to contribute?
                </h2>
                <p className="text-[#f7eed7]/70 text-lg max-w-2xl mx-auto">
                    Choose how you want to engage with our community and share your culture
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {options.map((option) => (
                    <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelection(option.id)}
                        className={`relative p-6 rounded-2xl border-2 ${option.borderColor} ${option.bgColor} backdrop-blur-sm transition-all duration-300 group cursor-pointer text-left`}
                    >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                        {/* Icon */}
                        <div className={`mb-4 w-16 h-16 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center text-white shadow-lg`}>
                            {option.icon}
                        </div>

                        {/* Content */}
                        <h3 className="text-xl font-bold text-[#f7eed7] mb-2 group-hover:text-white transition-colors">
                            {option.title}
                        </h3>
                        <p className="text-[#f7eed7]/60 text-sm group-hover:text-[#f7eed7]/80 transition-colors">
                            {option.description}
                        </p>

                        {/* Selection Indicator */}
                        {formData.type === option.id && (
                            <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                        )}

                        {/* Hover Arrow */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="mt-12 text-center">
                <p className="text-[#f7eed7]/50 text-sm">
                    Not sure? You can change your selection later.
                </p>
            </div>
        </div>
    );
};