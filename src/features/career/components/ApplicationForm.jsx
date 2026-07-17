import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useApplyForJobMutation } from '@/store/api/hostApi';
import { toast } from 'sonner';
import { Loader2, Upload, FileText, X, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useCountry } from '@/context/CountryContext';
import { COUNTRIES } from '@/shared/utils/mock-data';
import { CountryCodeSelect } from '@/shared/ui/CountryCodeSelect';
import { useAuth } from '@/features/events/hooks/useAuth';

export const ApplicationForm = ({ jobId, jobTitle, jobLocation, onSuccess, onCancel }) => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const [applyForJob, { isLoading }] = useApplyForJobMutation();
    const [resumeFile, setResumeFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { activeCountry } = useCountry();

    // Find initial matched country
    const initialCountry = useMemo(() => {
        let matched = null;
        if (jobLocation) {
            matched = COUNTRIES.find(c =>
                c.name.toLowerCase() === jobLocation.toLowerCase() ||
                c.code.toLowerCase() === jobLocation.toLowerCase()
            );
        }
        if (!matched && activeCountry) {
            matched = COUNTRIES.find(c =>
                c.code === activeCountry.code ||
                c.name.toLowerCase() === activeCountry.name.toLowerCase()
            );
        }
        return matched;
    }, [jobLocation, activeCountry]);

    const [phoneCode, setPhoneCode] = useState(initialCountry?.phoneCode || "+91");
    const [phoneIso, setPhoneIso] = useState(initialCountry?.code || "IN");

    useEffect(() => {
        if (initialCountry) {
            setPhoneCode(initialCountry.phoneCode);
            setPhoneIso(initialCountry.code);
        }
    }, [initialCountry]);

    // Validate and set file
    const validateAndSetFile = (file) => {
        if (!file) return;

        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        const fileName = file.name.toLowerCase();
        const isAllowedExtension = fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx');
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/octet-stream'
        ];

        if (!allowedTypes.includes(file.type) && !isAllowedExtension) {
            toast.error("Only PDF and Word documents (.doc, .docx) are allowed");
            return;
        }

        setResumeFile(file);
        setValue('resume', file);
        toast.success("Resume uploaded successfully");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        validateAndSetFile(file);
    };

    // Drag and drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const { isAuthenticated } = useAuth();

    const onSubmit = async (data) => {
        if (!isAuthenticated) {
            toast.error("Please login to apply for jobs");
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }
        if (!resumeFile) {
            toast.error("Please upload your resume");
            return;
        }

        const formData = new FormData();
        formData.append('job_id', jobId);
        formData.append('full_name', data.full_name);
        formData.append('email', data.email);
        let submittedPhone = data.phone || '';
        if (submittedPhone && !submittedPhone.startsWith('+')) {
            submittedPhone = `${phoneCode}${submittedPhone.trim()}`;
        }
        formData.append('phone', submittedPhone);
        formData.append('current_location', data.current_location || '');
        formData.append('linkedin_url', data.linkedin_url || '');
        formData.append('work_authorization', data.work_authorization || '');
        formData.append('years_of_experience', data.years_of_experience || '');
        formData.append('resume', resumeFile);

        try {
            await applyForJob(formData).unwrap();
            setIsSubmitted(true);
            toast.success("Application submitted successfully!");
            setTimeout(() => {
                if (onSuccess) onSuccess();
                navigate('/account-v2?tab=applications');
            }, 2000);
        } catch (error) {
            console.error("Application submission error:", error);
            toast.error(error?.data?.message || "Failed to submit application. Please try again.");
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                    <CheckCircle className="w-10 h-10 text-emerald-600 animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Application Submitted!</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                    Thank you for applying. We have received your application for <strong>{jobTitle}</strong>. Redirecting you to your applications...
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name *</label>
                    <input
                        {...register('full_name', { required: "Full name is required" })}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#CB2A25] focus:ring-4 focus:ring-[#CB2A25]/10 outline-none transition-all text-sm font-medium"
                        placeholder="John Doe"
                    />
                    {errors.full_name && <span className="text-[10px] text-red-500 font-semibold">{errors.full_name.message}</span>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address *</label>
                    <input
                        type="email"
                        {...register('email', {
                            required: "Email is required",
                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
                        })}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#CB2A25] focus:ring-4 focus:ring-[#CB2A25]/10 outline-none transition-all text-sm font-medium"
                        placeholder="john.doe@example.com"
                    />
                    {errors.email && <span className="text-[10px] text-red-500 font-semibold">{errors.email.message}</span>}
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Mobile Number *</label>
                    <div className="flex gap-2">
                        <div className="w-[110px] shrink-0 h-11">
                            <CountryCodeSelect
                                value={phoneCode}
                                isoCode={phoneIso}
                                onChange={(code, iso) => {
                                    setPhoneCode(code);
                                    if (iso) setPhoneIso(iso);
                                }}
                                className="h-full"
                            />
                        </div>
                        <input
                            {...register('phone', { required: "Mobile number is required" })}
                            className="flex-1 h-11 px-4 rounded-xl border border-gray-200 focus:border-[#CB2A25] focus:ring-4 focus:ring-[#CB2A25]/10 outline-none transition-all text-sm font-medium"
                            placeholder="(555) 000-0000"
                        />
                    </div>
                    {errors.phone && <span className="text-[10px] text-red-500 font-semibold">{errors.phone.message}</span>}
                </div>

                {/* Current Location */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Current Location *</label>
                    <input
                        {...register('current_location', { required: "Current location is required" })}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#CB2A25] focus:ring-4 focus:ring-[#CB2A25]/10 outline-none transition-all text-sm font-medium"
                        placeholder="Dallas, TX"
                    />
                    {errors.current_location && <span className="text-[10px] text-red-500 font-semibold">{errors.current_location.message}</span>}
                </div>

                {/* LinkedIn URL */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">LinkedIn URL</label>
                    <input
                        {...register('linkedin_url')}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#CB2A25] focus:ring-4 focus:ring-[#CB2A25]/10 outline-none transition-all text-sm font-medium"
                        placeholder="linkedin.com/in/username"
                    />
                </div>

                {/* Work Authorization */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Work Authorization *</label>
                    <input
                        {...register('work_authorization', { required: "Work authorization is required" })}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#CB2A25] focus:ring-4 focus:ring-[#CB2A25]/10 outline-none transition-all text-sm font-medium"
                        placeholder="e.g. USC, GC, H1B"
                    />
                    {errors.work_authorization && <span className="text-[10px] text-red-500 font-semibold">{errors.work_authorization.message}</span>}
                </div>

                {/* Years of Experience */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Years of Experience *</label>
                    <input
                        {...register('years_of_experience', { required: "Years of experience is required" })}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#CB2A25] focus:ring-4 focus:ring-[#CB2A25]/10 outline-none transition-all text-sm font-medium"
                        placeholder="e.g. 8 Years"
                    />
                    {errors.years_of_experience && <span className="text-[10px] text-red-500 font-semibold">{errors.years_of_experience.message}</span>}
                </div>
            </div>

            {/* Resume Upload Drag & Drop Zone */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Resume Upload *</label>
                <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center ${
                        dragActive ? 'border-[#CB2A25] bg-[#CB2A25]/5' : 
                        resumeFile ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                    {resumeFile ? (
                        <div className="flex items-center gap-3 text-left w-full max-w-sm justify-center">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-xs text-gray-900 truncate">{resumeFile.name}</p>
                                <p className="text-[10px] text-gray-400 font-semibold">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setResumeFile(null); setValue('resume', null); }}
                                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-gray-300 mb-2" />
                            <p className="text-xs font-bold text-gray-700 mb-0.5">Drag and drop resume here</p>
                            <p className="text-[10px] text-gray-400 font-medium mb-3">PDF, DOC, DOCX up to 5MB</p>
                            <label
                                htmlFor="resume-file"
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-all"
                            >
                                Choose File
                            </label>
                            <input
                                type="file"
                                id="resume-file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-3 border-t border-gray-100">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11 text-xs font-bold border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="flex-1 h-11 bg-[#CB2A25] hover:bg-[#b0221e] text-white font-bold text-xs rounded-xl shadow-md"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        "Submit Application"
                    )}
                </Button>
            </div>
        </form>
    );
};