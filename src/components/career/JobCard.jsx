import React, { useMemo } from "react"
import { MapPin, Briefcase, Banknote, Clock, Building, Wifi, Calendar, ShieldCheck, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export const JobCard = React.memo(function JobCard({ job, onViewDetails, onApply }) {
    // Fallback initials or logo
    const companyInitial = job?.vendorName 
        ? job.vendorName.charAt(0).toUpperCase() 
        : (job?.company ? job.company.charAt(0).toUpperCase() : 'N');

    // Visa badges
    const visaList = useMemo(() => {
        if (Array.isArray(job?.visaStatus)) return job.visaStatus;
        if (Array.isArray(job?.visa_status)) return job.visa_status;
        const str = job?.visaStatus || job?.visa_status || '';
        if (typeof str === 'string' && str.trim()) {
            return str.split(/[,/]/).map(v => v.trim()).filter(Boolean);
        }
        return [];
    }, [job?.visaStatus, job?.visa_status]);

    // Color indicators for work mode
    const workModeConfig = useMemo(() => {
        const mode = (job?.workStyle || job?.work_style || job?.workMode || '').toLowerCase().trim();
        if (mode === 'remote') {
            return {
                variant: 'success',
                icon: Wifi,
                label: 'Remote'
            };
        } else if (mode === 'hybrid') {
            return {
                variant: 'info',
                icon: Wifi,
                label: 'Hybrid'
            };
        }
        return {
            variant: 'warning',
            icon: Building,
            label: job?.workStyle || job?.work_style || job?.workMode || 'Onsite'
        };
    }, [job?.workStyle, job?.work_style, job?.workMode]);

    // Format location display
    const locationDisplay = useMemo(() => {
        const parts = [];
        if (job?.city) parts.push(job.city);
        if (job?.state || job?.state_name) parts.push(job.state || job.state_name);
        if (job?.location || job?.country) parts.push(job.location || job.country);
        return parts.length > 0 ? parts.join(', ') : 'Remote';
    }, [job?.city, job?.state, job?.state_name, job?.location, job?.country]);

    const displayTitle = job?.title || job?.job_title || 'Position';
    const displayCompany = job?.company || job?.company_name || 'NextKinLife LLC';
    const displayClient = job?.clientName || job?.client_name;
    const displayVendor = job?.vendorName || job?.vendor_name || displayCompany;
    const displayDepartment = job?.department || job?.category;
    const displayExperience = job?.experience || job?.experience_level || '0-3 Years';
    const displayDuration = job?.duration || job?.contract_duration || '12+ Months';
    const displayStartDate = job?.startDate || job?.start_date;
    const displaySalary = job?.salary || job?.salaryRange || job?.salary_range || 'Competitive';

    return (
        <Card className="group relative bg-card rounded-2xl border border-border/80 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between">
            <div className="p-5 sm:p-6 flex-1">
                {/* Title and Top Metas */}
                <div className="flex items-start gap-3.5 mb-4">
                    <Avatar className="w-11 h-11 rounded-xl">
                        <AvatarFallback className="rounded-xl bg-primary text-primary-foreground font-bold text-base">
                            {companyInitial}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors duration-200 line-clamp-1 leading-snug">
                            {displayTitle}
                        </h3>
                        
                        {/* Client & Vendor details */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-muted-foreground font-medium">
                            {displayClient && displayClient !== 'N/A' && (
                                <>
                                    <span className="text-foreground font-semibold">Client: {displayClient}</span>
                                    <span className="text-border">•</span>
                                </>
                            )}
                            <span>Vendor: {displayVendor}</span>
                            {displayDepartment && (
                                <>
                                    <span className="text-border">•</span>
                                    <Badge variant="secondary" className="text-[10px] font-semibold py-0 px-1.5 rounded">
                                        {displayDepartment}
                                    </Badge>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {/* Position Type Badge */}
                    <Badge variant="secondary" className="text-[11px] font-semibold">
                        {job?.positionType || job?.employment_type || job?.job_type || job?.type || 'Contract'}
                    </Badge>

                    {/* Work Mode Badge */}
                    <Badge variant={workModeConfig.variant} className="gap-1 text-[11px] font-semibold">
                        <workModeConfig.icon className="h-3 w-3" />
                        {workModeConfig.label}
                    </Badge>

                    {/* Visa Eligibility Badges */}
                    {visaList.map((visa, idx) => (
                        <Badge key={idx} variant="outline" className="gap-1 text-[11px] font-medium bg-background">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                            {visa}
                        </Badge>
                    ))}
                </div>

                {/* Structured Metadata Grid */}
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 py-3 border-t border-b border-border/60 mb-4 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-2 min-w-0" title={locationDisplay}>
                        <MapPin className="h-4 w-4 text-accent shrink-0" />
                        <span className="truncate">{locationDisplay}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0" title={`Experience: ${displayExperience}`}>
                        <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{displayExperience}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0" title={`Duration: ${displayDuration}`}>
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{displayDuration}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0" title={`Pay: ${displaySalary}`}>
                        <Banknote className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="truncate font-semibold text-foreground">{displaySalary}</span>
                    </div>
                    {displayStartDate && (
                        <div className="flex items-center gap-2 min-w-0 col-span-2 text-muted-foreground" title={`Start Date: ${displayStartDate}`}>
                            <CalendarClock className="h-4 w-4 text-sky-500 shrink-0" />
                            <span className="truncate">Start: <span className="font-semibold text-foreground">{displayStartDate}</span></span>
                        </div>
                    )}
                </div>

                {/* Skills Preview */}
                {Array.isArray(job?.skills) && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {job.skills.slice(0, 4).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-accent/5 text-accent text-[10px] font-medium border border-accent/15">
                                {skill}
                            </span>
                        ))}
                        {job.skills.length > 4 && (
                            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium">
                                +{job.skills.length - 4} more
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Buttons */}
            <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-border/60 flex flex-col gap-3 xs:flex-row xs:items-center xs:justify-between bg-muted/20">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                    <Calendar className="h-3 w-3" />
                    {job?.posted || 'Active'}
                </span>
                
                <div className="flex items-center gap-2 w-full xs:w-auto justify-end xs:justify-start">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails?.(job)}
                        className="text-xs font-semibold h-8"
                    >
                        View Details
                    </Button>
                    <Button
                        variant="accent"
                        size="sm"
                        onClick={() => onApply?.(job)}
                        className="text-xs font-semibold h-8"
                    >
                        Apply Now
                    </Button>
                </div>
            </div>
        </Card>
    )
})