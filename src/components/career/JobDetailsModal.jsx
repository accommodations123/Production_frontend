import React, { useEffect, useState } from 'react'
import { X, MapPin, Clock, DollarSign, Briefcase, Building, Calendar, Heart, Share2, User, Mail, Phone, Award, TrendingUp, CheckCircle, Star, Wifi } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'

import { ApplicationForm } from './ApplicationForm'
import { toast } from "sonner"
import { useGetJobByIdQuery } from "@/store/api/hostApi"
import { Loader2 } from "lucide-react"

// Function to get work style icon
const getWorkStyleIcon = (workStyle) => {
    switch (workStyle?.toLowerCase()) {
        case 'remote':
            return <Wifi className="h-5 w-5" />;
        case 'hybrid':
            return <Wifi className="h-5 w-5" />;
        case 'on-site':
        default:
            return <Building className="h-5 w-5" />;
    }
}

// Function to get work style label
const getWorkStyleLabel = (workStyle) => {
    switch (workStyle?.toLowerCase()) {
        case 'remote':
            return 'Remote';
        case 'hybrid':
            return 'Hybrid';
        case 'on-site':
            return 'On-site';
        default:
            return workStyle || 'Not specified';
    }
}

export function JobDetailsModal({ job: initialJob, isOpen, onClose }) {
    const [showApplicationForm, setShowApplicationForm] = React.useState(false)

    // Fetch full job details if we have an ID
    const jobId = initialJob?.id || initialJob?._id;
    const { data: apiJobDetails, isLoading, isError } = useGetJobByIdQuery(jobId, {
        skip: !isOpen || !jobId,
    });

    // Merge initial job data with API data (API takes precedence)
    const job = React.useMemo(() => {
        if (!apiJobDetails) return initialJob;
        // Re-transform API data if needed, or assume API returns same shape
        // For safety, we merge keys.
        return { ...initialJob, ...apiJobDetails };
    }, [initialJob, apiJobDetails]);

    // Reset state when modal opens/closes or job changes
    useEffect(() => {
        if (isOpen) {
            setShowApplicationForm(false);
        }
    }, [isOpen, initialJob]);

    // Prevent scrolling on body when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen || !job) return null

    // Format the posted date safely
    const rawDate = job.postedDate || job.createdAt || job.created_at;
    const postedDate = rawDate ? new Date(rawDate) : new Date();
    const now = new Date();
    const parsedPostedDate = isNaN(postedDate.getTime()) ? now : postedDate;
    const diffTime = Math.abs(now - parsedPostedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Static Close Button (Top Corner of Content Box) */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-all z-[100] cursor-pointer text-gray-400 hover:text-gray-900 group"
                            aria-label="Close modal"
                            type="button"
                        >
                            <X className="h-6 w-6 transform group-hover:rotate-90 transition-transform" />
                        </button>

                        <div className="flex-1 overflow-y-auto">
                            {/* Header Area (No Banner) */}
                            <div className="px-8 pt-12 pb-6 border-b border-gray-100">
                                <div className="flex flex-col md:flex-row md:items-center gap-8">
                                    <div className="w-32 h-32 rounded-2xl bg-white p-3 shadow-xl border border-gray-100 shrink-0">
                                        {job.logo ? (
                                            <img
                                                src={job.logo}
                                                alt={job.company}
                                                className="w-full h-full object-contain rounded-xl"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-4xl font-bold">
                                                {job.company.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">{job.title}</h2>
                                                <div className="flex flex-wrap items-center gap-5 text-base font-semibold text-gray-500">
                                                    <span className="flex items-center gap-2">
                                                        <Building className="h-5 w-5 text-blue-600" />
                                                        {job.company}
                                                    </span>
                                                    <span className="hidden md:inline text-gray-300">•</span>
                                                    <span className="flex items-center gap-2">
                                                        <MapPin className="h-5 w-5 text-blue-600" />
                                                        {job.location}
                                                    </span>
                                                    <span className="hidden md:inline text-gray-300">•</span>
                                                    <span className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-1 rounded-full text-sm">
                                                        {diffDays === 0 ? 'Posted Today' : `Posted ${diffDays}d ago`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="relative">
                                {isLoading && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                                        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                                    </div>
                                )}

                                <div className="p-8">
                                    {showApplicationForm ? (
                                        <ApplicationForm
                                            jobId={job.id || job._id}
                                            jobTitle={job.title}
                                            onSuccess={() => {
                                                onClose();
                                            }}
                                            onCancel={() => setShowApplicationForm(false)}
                                        />
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <div className="lg:col-span-2 space-y-8">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                        <Briefcase className="h-6 w-6 text-blue-600" />
                                                        Job Description
                                                    </h3>
                                                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                                                </div>

                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                        <CheckCircle className="h-6 w-6 text-blue-600" />
                                                        Responsibilities
                                                    </h3>
                                                    <ul className="space-y-3 text-gray-600">
                                                        {job.responsibilities?.map((responsibility, index) => (
                                                            <li key={index} className="flex items-start gap-3">
                                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                                                </div>
                                                                <span>{responsibility}</span>
                                                            </li>
                                                        )) || (
                                                                <li>No specific responsibilities listed</li>
                                                            )}
                                                    </ul>
                                                </div>

                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                        <Award className="h-6 w-6 text-blue-600" />
                                                        Requirements
                                                    </h3>
                                                    <ul className="space-y-3 text-gray-600">
                                                        {job.requirements?.map((requirement, index) => (
                                                            <li key={index} className="flex items-start gap-3">
                                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                                                </div>
                                                                <span>{requirement}</span>
                                                            </li>
                                                        )) || (
                                                                <li>No specific requirements listed</li>
                                                            )}
                                                    </ul>
                                                </div>

                                                {job.benefits && (
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                            <TrendingUp className="h-6 w-6 text-blue-600" />
                                                            Benefits
                                                        </h3>
                                                        <ul className="space-y-3 text-gray-600">
                                                            {job.benefits.map((benefit, index) => (
                                                                <li key={index} className="flex items-start gap-3">
                                                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                        <CheckCircle className="h-4 w-4 text-blue-600" />
                                                                    </div>
                                                                    <span>{benefit}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-8">
                                                <div className="bg-gray-50 rounded-xl p-6">
                                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Job Summary</h3>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Experience</span>
                                                            <span className="font-medium text-gray-900">{job.experience}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Job Type</span>
                                                            <span className="font-medium text-gray-900">{job.type}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Work Style</span>
                                                            <span className="font-medium text-gray-900">{getWorkStyleLabel(job.workStyle)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Salary</span>
                                                            <span className="font-medium text-gray-900">{job.salary}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Location</span>
                                                            <span className="font-medium text-gray-900">{job.location}</span>
                                                        </div>
                                                        {job.applicants && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Applicants</span>
                                                                <span className="font-medium text-gray-900">{job.applicants}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-xl p-6">
                                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                                                    <div className="space-y-3 text-gray-600">
                                                        <div className="flex items-center gap-3">
                                                            <User className="h-5 w-5 text-gray-400" />
                                                            <span>{job.contactPerson || 'Hiring Manager'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Mail className="h-5 w-5 text-gray-400" />
                                                            <span>{job.contactEmail || 'careers@nextkinlife.com'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Phone className="h-5 w-5 text-gray-400" />
                                                            <span>{job.contactPhone || '+1 (555) 123-4567'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-6 border border-blue-200">
                                                    <h3 className="text-xl font-bold text-gray-900 mb-2">About {job.company}</h3>
                                                    <p className="text-gray-600 text-sm leading-relaxed">{job.companyDescription}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {!showApplicationForm && (
                                    <div className="p-8 border-t border-gray-100 bg-gray-50">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Button
                                                variant="outline"
                                                className="flex items-center justify-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all h-12"
                                                onClick={() => {
                                                    toast.success("Job saved to favorites");
                                                }}
                                            >
                                                <Heart className="h-5 w-5" />
                                                Save Job
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex items-center justify-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all h-12"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    toast.success("Link copied to clipboard");
                                                }}
                                            >
                                                <Share2 className="h-5 w-5" />
                                                Share Job
                                            </Button>
                                            <Button
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-all h-12 text-base font-medium"
                                                onClick={() => {
                                                    setShowApplicationForm(true);
                                                }}
                                            >
                                                Apply Now
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}