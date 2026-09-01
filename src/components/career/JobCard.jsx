import React, { useState, useMemo } from "react"
import { MapPin, Briefcase, Banknote, Clock, Building, Wifi, Sparkles, User, Calendar, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export const JobCard = React.memo(function JobCard({ job, onViewDetails, onApply }) {
    const [imageError, setImageError] = useState(false)

    // Fallback initials or logo
    const companyInitial = job?.vendorName ? job.vendorName.charAt(0).toUpperCase() : 'N'

    // Visa badges
    const visaList = useMemo(() => {
        if (Array.isArray(job?.visaStatus)) return job.visaStatus;
        if (typeof job?.visaStatus === 'string') {
            return job.visaStatus.split('/').map(v => v.trim()).filter(Boolean);
        }
        return [];
    }, [job?.visaStatus]);

    // Color indicators for work mode
    const workModeConfig = useMemo(() => {
        const mode = (job?.workStyle || '').toLowerCase().trim();
        if (mode === 'remote') {
            return {
                bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                icon: Wifi,
                label: 'Remote'
            };
        } else if (mode === 'hybrid') {
            return {
                bg: 'bg-blue-50 text-blue-700 border-blue-200',
                icon: Wifi,
                label: 'Hybrid'
            };
        }
        return {
            bg: 'bg-amber-50 text-amber-700 border-amber-200',
            icon: Building,
            label: job?.workStyle || 'On-site'
        };
    }, [job?.workStyle]);

    // Position type styling
    const positionTypeClass = useMemo(() => {
        const type = (job?.positionType || job?.type || '').toLowerCase();
        if (type.includes('c2c')) return 'bg-purple-50 text-purple-700 border-purple-200';
        if (type.includes('w2')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        if (type.includes('part')) return 'bg-sky-50 text-sky-700 border-sky-200';
        if (type.includes('contract')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }, [job?.positionType, job?.type]);

    return (
        <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-[#CB2A25]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#CB2A25]/5 overflow-hidden flex flex-col justify-between">


            <div className="p-6 flex-1">
                {/* Title and Top Metas */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00142E] to-[#00224b] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                        {companyInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-[#CB2A25] transition-colors duration-200 line-clamp-1">
                            {job?.title || 'Senior Developer'}
                        </h3>
                        
                        {/* Client & Vendor details */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-gray-500 font-medium">
                            {job?.clientName && (
                                <>
                                    <span className="text-gray-900">Client: {job.clientName}</span>
                                    <span className="text-gray-300">•</span>
                                </>
                            )}
                            <span>Vendor: {job?.vendorName || 'NextKinLife LLC'}</span>
                        </div>
                    </div>
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {/* Position Type Badge */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${positionTypeClass}`}>
                        {job?.positionType || job?.type || 'Contract'}
                    </span>

                    {/* Work Mode Badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${workModeConfig.bg}`}>
                        <workModeConfig.icon className="h-3 w-3" />
                        {workModeConfig.label}
                    </span>

                    {/* Visa Eligibility Badges */}
                    {visaList.map((visa, idx) => (
                        <span key={idx} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-gray-50 text-gray-600 text-[11px] font-semibold border border-gray-200">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                            {visa}
                        </span>
                    ))}
                </div>

                {/* Structured Metadata Grid */}
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 py-3 border-t border-b border-gray-50 mb-4 text-xs font-medium text-gray-600">
                    <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="truncate">{job?.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                        <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="truncate">{job?.experience || '8+ Years'}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                        <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="truncate">{job?.duration || '12+ Months'}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                        <Banknote className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="truncate font-semibold text-gray-900">{job?.salary || 'Competitive'}</span>
                    </div>
                </div>

                {/* Skills Preview */}
                {Array.isArray(job?.skills) && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {job.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-[#CB2A25]/5 text-[#CB2A25] text-[10px] font-medium border border-[#CB2A25]/10">
                                {skill}
                            </span>
                        ))}
                        {job.skills.length > 3 && (
                            <span className="px-2 py-0.5 rounded bg-gray-50 text-gray-500 text-[10px] font-medium">
                                +{job.skills.length - 3} more
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Buttons */}
            <div className="px-6 pb-6 pt-2 border-t border-gray-50 flex flex-col gap-3 xs:flex-row xs:items-center xs:justify-between bg-gray-50/50">
                <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                    <Calendar className="h-3 w-3" />
                    {job?.posted || '2 Days Ago'}
                </span>
                
                <div className="flex items-center gap-2 w-full xs:w-auto justify-end xs:justify-start">
                    <Button
                        variant="outline"
                        onClick={() => onViewDetails?.(job)}
                        className="flex-1 xs:flex-initial h-8 text-[11px] font-bold px-3 border-gray-200 text-[#00142E] hover:bg-gray-50 rounded-lg transition-all"
                    >
                        View Details
                    </Button>
                    <Button
                        onClick={() => onApply?.(job)}
                        className="flex-1 xs:flex-initial h-8 text-[11px] font-bold px-3.5 bg-[#CB2A25] hover:bg-[#b0221e] text-white rounded-lg shadow-sm hover:shadow transition-all"
                    >
                        Apply Now
                    </Button>
                </div>
            </div>
        </div>
    )
})