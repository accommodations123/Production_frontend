import React, { useEffect, useState, useMemo } from 'react'
import { X, MapPin, Clock, DollarSign, Briefcase, Building, Calendar, Heart, Share2, User, Mail, Phone, Award, TrendingUp, CheckCircle, Wifi, Linkedin } from 'lucide-react'
import DOMPurify from 'dompurify'
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'
import { ApplicationForm } from './ApplicationForm'
import { toast } from "sonner"
import { useGetJobByIdQuery } from "@/store/api/hostApi"
import { Loader2 } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/events/[id]/hooks/useAuth'

export function JobDetailsModal({ job: initialJob, isOpen, onClose, preOpenApply }) {
    const [showApplicationForm, setShowApplicationForm] = useState(false)
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    // Fetch full job details if we have an ID
    const jobId = initialJob?.id || initialJob?._id;
    const { data: apiJobDetails, isLoading } = useGetJobByIdQuery(jobId, {
        skip: !isOpen || !jobId,
    });

    // Merge initial job data with API data
    const job = useMemo(() => {
        if (!apiJobDetails) return initialJob;
        return { ...initialJob, ...apiJobDetails };
    }, [initialJob, apiJobDetails]);

    // Reset form state on close/open
    useEffect(() => {
        if (isOpen) {
            if (preOpenApply && !isAuthenticated) {
                toast.error("Please login to apply for jobs");
                setShowApplicationForm(false);
            } else {
                setShowApplicationForm(preOpenApply || false);
            }
        }
    }, [isOpen, initialJob, preOpenApply, isAuthenticated]);

    // Prevent background scrolling
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

    // Format visa status list
    const visaList = Array.isArray(job.visaStatus) 
        ? job.visaStatus 
        : typeof job.visaStatus === 'string'
            ? job.visaStatus.split('/').map(v => v.trim()).filter(Boolean)
            : [];

    const parsedPosted = job.posted || "Just posted";

    // Rich text helper
    const isHtml = (str) => /<[a-z][\s\S]*>/i.test(str);
    const renderDescription = (desc) => {
        if (!desc) return null;
        if (isHtml(desc)) {
            return (
                <div 
                    className="prose prose-red max-w-none text-gray-600 text-sm leading-relaxed" 
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(desc || "") }} 
                />
            );
        }
        return <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{desc}</p>;
    };

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

                    {/* Modal Box */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 transition-all z-[100] cursor-pointer text-gray-400 hover:text-gray-950 group"
                            aria-label="Close modal"
                            type="button"
                        >
                            <X className="h-5 w-5 transform group-hover:rotate-90 transition-transform" />
                        </button>

                        <div className="flex-1 overflow-y-auto">
                            {/* Premium Header */}
                            <div className="px-6 py-8 md:p-8 border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white">
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-[#00142E] text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
                                        {job.vendorName ? job.vendorName.charAt(0).toUpperCase() : 'N'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <span className="px-2.5 py-0.5 rounded bg-[#CB2A25]/10 text-[#CB2A25] text-[11px] font-bold uppercase tracking-wider">
                                                {job.positionType || job.type || 'C2C'}
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                                                {job.workStyle || 'Remote'}
                                            </span>
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight mb-2">
                                            {job.title}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 font-semibold">
                                            {job.clientName && (
                                                <span className="flex items-center gap-1.5">
                                                    <Building className="h-4 w-4 text-gray-400" />
                                                    Client: <span className="text-gray-800">{job.clientName}</span>
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1.5">
                                                <Building className="h-4 w-4 text-gray-400" />
                                                Vendor: <span className="text-gray-800">{job.vendorName || 'NextKinLife LLC'}</span>
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                {job.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="relative">
                                {isLoading && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 text-[#CB2A25] animate-spin" />
                                    </div>
                                )}

                                <div className="p-6 md:p-8">
                                    {showApplicationForm ? (
                                        <div className="max-w-2xl mx-auto">
                                            <h3 className="text-lg font-bold text-gray-900 mb-6">
                                                Apply for <span className="text-[#CB2A25]">{job.title}</span>
                                            </h3>
                                            <ApplicationForm
                                                jobId={job.id || job._id}
                                                jobTitle={job.title}
                                                jobLocation={job.location}
                                                onSuccess={() => {
                                                    setShowApplicationForm(false);
                                                    onClose();
                                                }}
                                                onCancel={() => setShowApplicationForm(false)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            {/* Details Left Column */}
                                            <div className="lg:col-span-2 space-y-8">
                                                {/* Description */}
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <Briefcase className="h-4 w-4 text-[#CB2A25]" />
                                                        Job Description
                                                    </h4>
                                                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                                                        {renderDescription(job.description)}
                                                    </div>
                                                </div>

                                                {/* Responsibilities */}
                                                {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <CheckCircle className="h-4 w-4 text-[#CB2A25]" />
                                                            Key Responsibilities
                                                        </h4>
                                                        <ul className="space-y-2.5">
                                                            {job.responsibilities.map((resp, index) => (
                                                                <li key={index} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#CB2A25] mt-2 shrink-0" />
                                                                    <span>{resp}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Requirements */}
                                                {Array.isArray(job.requirements) && job.requirements.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <Award className="h-4 w-4 text-[#CB2A25]" />
                                                            Requirements
                                                        </h4>
                                                        <ul className="space-y-2.5">
                                                            {job.requirements.map((req, index) => (
                                                                <li key={index} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#CB2A25] mt-2 shrink-0" />
                                                                    <span>{req}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Preferred Skills */}
                                                {Array.isArray(job.preferredSkills) && job.preferredSkills.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <Award className="h-4 w-4 text-[#CB2A25]" />
                                                            Preferred Skills
                                                        </h4>
                                                        <ul className="space-y-2.5">
                                                            {job.preferredSkills.map((skill, index) => (
                                                                <li key={index} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#CB2A25] mt-2 shrink-0" />
                                                                    <span>{skill}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Benefits */}
                                                {Array.isArray(job.benefits) && job.benefits.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <TrendingUp className="h-4 w-4 text-[#CB2A25]" />
                                                            Benefits & Perks
                                                        </h4>
                                                        <ul className="space-y-2.5">
                                                            {job.benefits.map((benefit, index) => (
                                                                <li key={index} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                                                    <span>{benefit}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Summary / Recruiter Sidebar */}
                                            <div className="space-y-6">
                                                {/* Job Summary Card */}
                                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200/60">
                                                        Job Summary
                                                    </h3>
                                                    <div className="space-y-3.5 text-xs font-semibold text-gray-600">
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="text-gray-400">Position Type</span>
                                                            <span className="text-gray-900 font-bold">{job.positionType || job.type || 'C2C'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="text-gray-400">Client Name</span>
                                                            <span className="text-gray-900 font-bold truncate max-w-[150px]">{job.clientName || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="text-gray-400">Vendor Name</span>
                                                            <span className="text-gray-900 font-bold truncate max-w-[150px]">{job.vendorName || 'NextKinLife LLC'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="text-gray-400">Location</span>
                                                            <span className="text-gray-900 font-bold truncate max-w-[150px]">{job.location}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="text-gray-400">Work Mode</span>
                                                            <span className="text-gray-900 font-bold">{job.workStyle || 'Remote'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="text-gray-400">Experience</span>
                                                            <span className="text-gray-900 font-bold">{job.experience || '8+ Years'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="text-gray-400">Duration</span>
                                                            <span className="text-gray-900 font-bold">{job.duration || '12+ Months'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="text-gray-400">Salary Range</span>
                                                            <span className="text-emerald-700 font-bold">{job.salary || 'Competitive'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="text-gray-400">Visa Status</span>
                                                            <span className="text-gray-900 font-bold text-right truncate max-w-[150px]">
                                                                {visaList.length > 0 ? visaList.join(', ') : 'All Authorizations'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="text-gray-400">Start Date</span>
                                                            <span className="text-gray-900 font-bold">{job.startDate ? new Date(job.startDate).toLocaleDateString() : 'Immediate'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Recruiter Information */}
                                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200/60">
                                                        Recruiter Contact
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-[#CB2A25]/10 flex items-center justify-center text-[#CB2A25] font-bold">
                                                                {job.recruiterName ? job.recruiterName.charAt(0).toUpperCase() : 'V'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">{job.recruiterName || 'Vinod Kumar'}</p>
                                                                <p className="text-[11px] text-gray-400 font-medium">Hiring Recruiter</p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2.5 text-xs font-semibold text-gray-600">
                                                            <a href={`mailto:${job.recruiterEmail || 'careers@nextkinlife.com'}`} className="flex items-center gap-2 hover:text-[#CB2A25] transition-colors">
                                                                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                                                                <span>{job.recruiterEmail || 'careers@nextkinlife.com'}</span>
                                                            </a>
                                                            <a href={`tel:${job.recruiterPhone || '+1 (555) 123-4567'}`} className="flex items-center gap-2 hover:text-[#CB2A25] transition-colors">
                                                                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                                                                <span>{job.recruiterPhone || '+1 (555) 123-4567'}</span>
                                                            </a>
                                                            <a href={job.recruiterLinkedin ? `https://${job.recruiterLinkedin.replace(/^https?:\/\//, '')}` : 'https://linkedin.com/company/nextkinlife'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                                                                <Linkedin className="h-4 w-4 text-[#0A66C2] shrink-0" />
                                                                <span className="truncate">Recruiter Profile</span>
                                                            </a>
                                                            <a href={job.companyLinkedin || 'https://linkedin.com/company/nextkinlife'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                                                                <Linkedin className="h-4 w-4 text-[#0a66c2] shrink-0" />
                                                                <span>Company Page</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Modal Actions Footer */}
                                {!showApplicationForm && (
                                    <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
                                        <div className="flex gap-2 flex-1 sm:flex-initial">
                                            <Button
                                                variant="outline"
                                                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 border-gray-200 text-gray-700 hover:bg-gray-100 transition-all h-11 px-5 rounded-xl font-bold text-xs"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${window.location.origin}/career/job/${job.id}`);
                                                    toast.success("Job link copied to clipboard");
                                                }}
                                            >
                                                <Share2 className="h-4 w-4 text-gray-400" />
                                                Share Job
                                            </Button>
                                        </div>
                                        <Button
                                            className="flex-1 bg-[#CB2A25] hover:bg-[#b0221e] text-white transition-all h-11 rounded-xl text-xs font-bold shadow-md hover:shadow-lg"
                                            onClick={() => {
                                                if (!isAuthenticated) {
                                                    toast.error("Please login to apply for jobs");
                                                    navigate('/login', { state: { from: window.location.pathname } });
                                                    return;
                                                }
                                                setShowApplicationForm(true);
                                            }}
                                        >
                                            Apply Now
                                        </Button>
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