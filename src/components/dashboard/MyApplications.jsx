"use client";

import React, { useMemo } from "react";
import { useGetMyApplicationsQuery } from "@/store/api/hostApi";
import { 
  Briefcase, MapPin, Clock, Building, Loader2, FileText, 
  ExternalLink, ChevronRight, CheckCircle2, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";

// Status pipeline definition
const PIPELINE_STAGES = ["submitted", "reviewing", "interview", "offer"];

const StatusBadge = ({ status }) => {
  const statusStyles = {
    submitted: "bg-blue-50 text-blue-700 border-blue-100",
    viewed: "bg-amber-50 text-amber-700 border-amber-100",
    reviewing: "bg-orange-50 text-orange-700 border-orange-100",
    shortlisted: "bg-indigo-50 text-indigo-700 border-indigo-100",
    interview: "bg-purple-50 text-purple-700 border-purple-100",
    offer: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rejected: "bg-red-50 text-red-700 border-red-100",
    withdrawn: "bg-gray-50 text-gray-700 border-gray-100",
  };

  const statusLabels = {
    submitted: "Submitted",
    viewed: "Viewed",
    reviewing: "Under Review",
    shortlisted: "Shortlisted",
    interview: "Interviewing",
    offer: "Offer Extended",
    rejected: "Not Selected",
    withdrawn: "Withdrawn",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusStyles[status] || statusStyles.submitted}`}>
      {statusLabels[status] || status}
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function MyApplications() {
  const { data, isLoading, error, refetch } = useGetMyApplicationsQuery({});
  const applications = data?.applications || [];

  // Pagination
  const {
    currentItems: paginatedApplications,
    currentPage,
    totalPages,
    goToPage
  } = usePagination(applications, 4); // 4 items per page for clean lists

  // Helper to get active step index for pipeline visual
  const getPipelineIndex = (status) => {
    if (status === "rejected" || status === "withdrawn") return -1;
    if (status === "offer") return 3;
    if (status === "interview") return 2;
    if (status === "reviewing" || status === "shortlisted" || status === "viewed") return 1;
    return 0; // submitted
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-16">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-sm text-gray-500 font-medium animate-pulse">Loading your applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-100 rounded-3xl max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h4 className="font-extrabold text-red-700">Failed to load applications</h4>
        <p className="text-xs text-red-600/70 mt-1">Please try reloading the page to fetch statuses.</p>
        <Button onClick={() => refetch()} className="mt-4 bg-red-600 text-white rounded-xl">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Visual Header Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-full blur-3xl -z-10"></div>
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase block">Careers Tracker 💼</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">My Applications</h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg leading-relaxed">
            Monitor the recruitment stage, interview invitations, and status of your active job applications.
          </p>
        </div>
        <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
          {applications.length} Active Application{applications.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Applications Pipeline Grid */}
      {applications.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 max-w-xl mx-auto">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Briefcase className="w-9 h-9 text-indigo-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Find Career Openings</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
              Explore job vacancies, upload your resume, and connect with recruiting hosts on NextKinLife.
            </p>
          </div>
          <Link to="/career">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 h-11 font-semibold transition-all shadow-sm">
              Browse Open Jobs
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {paginatedApplications.map((app) => {
            const activeStep = getPipelineIndex(app.status);
            const isRejectedOrWithdrawn = activeStep === -1;
            
            return (
              <div 
                key={app.id} 
                className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 space-y-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Job Metadata details */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 shadow-sm border border-indigo-100">
                      {app.job?.company?.charAt(0) || "J"}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base leading-snug">
                        {app.job?.title || "Job Position"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-gray-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          {app.job?.company || "Company"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {app.job?.location || "Remote"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {app.job?.type || "Full-time"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Applied Date & Status */}
                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-start">
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Applied On</p>
                      <p className="text-xs font-bold text-gray-700 mt-0.5">
                        {formatDate(app.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                </div>

                {/* Pipeline visual stepper (only if active) */}
                {!isRejectedOrWithdrawn ? (
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
                    {PIPELINE_STAGES.map((stage, idx) => {
                      const isCompleted = idx <= activeStep;
                      const isCurrent = idx === activeStep;
                      
                      return (
                        <div key={stage} className="flex-1 flex flex-col gap-2 relative">
                          {/* Stepper Dot */}
                          <div className="flex items-center">
                            <div className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all border",
                              isCompleted 
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" 
                                : "bg-white border-gray-200 text-gray-400"
                            )}>
                              {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                            </div>
                            
                            {/* Visual Progress Connector bar */}
                            {idx < PIPELINE_STAGES.length - 1 && (
                              <div className="flex-1 h-1 mx-2 rounded bg-gray-100 overflow-hidden">
                                <div className={cn(
                                  "h-full bg-indigo-600 transition-all duration-300",
                                  idx < activeStep ? "w-full" : "w-0"
                                )}></div>
                              </div>
                            )}
                          </div>
                          
                          {/* Stepper Label */}
                          <span className={cn(
                            "text-[10px] font-bold capitalize leading-tight",
                            isCurrent ? "text-indigo-600" : isCompleted ? "text-gray-700" : "text-gray-400"
                          )}>
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="pt-3 border-t border-gray-50">
                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-xs text-red-700 font-semibold leading-tight">
                        This application status is marked as {app.status === "rejected" ? "Not Selected" : "Withdrawn"}.
                      </p>
                    </div>
                  </div>
                )}

                {/* View Job Redirect footer */}
                <div className="pt-3.5 border-t border-gray-50 flex justify-end">
                  <Link to={`/career?job=${app.job?.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      View Job Openings <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

              </div>
            );
          })}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            className="mt-6"
          />
        </div>
      )}

    </div>
  );
}
