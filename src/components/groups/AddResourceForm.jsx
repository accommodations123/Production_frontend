import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Link as LinkIcon,
    FileText,
    UserCircle,
    Check,
    Upload,
    Globe,
    Phone,
    Briefcase,
    MapPin,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CONTACT_ROLES = ["Broker", "Owner", "Emergency", "Admin", "Volunteer", "Legal Advisor"];

const AddResourceForm = ({ onResourceAdded }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        title: '',
        resource_type: 'link', // Default to link
        resource_value: '',
        description: '',
        // Sub-fields for contact
        contact: {
            name: '',
            phone: '',
            role: '',
            city: ''
        }
    });

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const updateContactData = (field, value) => {
        setFormData(prev => ({
            ...prev,
            contact: { ...prev.contact, [field]: value }
        }));
    };

    const handleTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            resource_type: type,
            resource_value: '' // Reset value on type change
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (formData.title.length > 200) newErrors.title = "Max 200 characters";

        if (formData.resource_type === 'link') {
            if (!formData.resource_value) {
                newErrors.resource_value = "URL is required";
            } else {
                try {
                    new URL(formData.resource_value);
                } catch (_) {
                    newErrors.resource_value = "Please enter a valid URL (e.g. https://example.com)";
                }
            }
        } else if (formData.resource_type === 'file') {
            if (!formData.resource_value) newErrors.resource_value = "Please upload a file";
        } else if (formData.resource_type === 'contact') {
            if (!formData.contact.name.trim()) newErrors.contactName = "Name is required";
            if (!formData.contact.phone.trim()) newErrors.contactPhone = "Phone is required";
            if (!formData.contact.role) newErrors.contactRole = "Role is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);

        // Prepare final payload
        let finalValue = formData.resource_value;
        if (formData.resource_type === 'contact') {
            finalValue = JSON.stringify(formData.contact);
        }

        const payload = {
            title: formData.title,
            resource_type: formData.resource_type,
            resource_value: finalValue,
            description: formData.description
        };

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setSuccess(true);

        if (onResourceAdded) onResourceAdded(payload);

        // Reset after some time
        setTimeout(() => {
            setSuccess(false);
            setFormData({
                title: '',
                resource_type: 'link',
                resource_value: '',
                description: '',
                contact: { name: '', phone: '', role: '', city: '' }
            });
        }, 3000);
    };

    const Label = ({ children, required }) => (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00142E]/40 ml-1 block mb-2">
            {children} {required && <span className="text-accent">*</span>}
        </label>
    );

    const Input = ({ error, ...props }) => (
        <div className="space-y-1">
            <input
                {...props}
                className={cn(
                    "w-full bg-[#F8F9FA] border border-neutral/20 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-semibold text-primary placeholder:font-medium placeholder:text-[#00142E]/30",
                    error && "border-accent/50 ring-2 ring-accent/10",
                    props.className
                )}
            />
            {error && <p className="text-[10px] font-bold text-accent ml-1 flex items-center gap-1"><AlertCircle size={10} /> {error}</p>}
        </div>
    );

    return (
        <div className="bg-white rounded-[40px] border border-neutral/5 shadow-2xl shadow-primary/5 p-8 md:p-12 relative overflow-hidden">
            {/* Success Overlay */}
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-8"
                    >
                        <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mb-6">
                            <Check size={40} strokeWidth={3} />
                        </div>
                        <h3 className="text-3xl font-black text-primary mb-2">Resource Added!</h3>
                        <p className="text-[#00142E]/50 font-medium max-w-xs">
                            The community can now access this resource in the group library.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <h3 className="text-2xl font-black text-primary tracking-tight mb-2">Share a Resource</h3>
                    <p className="text-[#00142E]/50 font-medium">Add helpful links, files, or contacts for the community.</p>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <Label required>Resource Title</Label>
                    <Input
                        type="text"
                        placeholder="e.g. Affordable PG & Hostel Contacts"
                        value={formData.title}
                        onChange={(e) => updateFormData('title', e.target.value)}
                        error={errors.title}
                    />
                </div>

                {/* Resource Type */}
                <div className="space-y-4">
                    <Label required>Resource Type</Label>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { id: 'link', label: 'Link', icon: LinkIcon },
                            { id: 'file', label: 'File', icon: FileText },
                            { id: 'contact', label: 'Contact', icon: UserCircle },
                        ].map(type => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => handleTypeChange(type.id)}
                                className={cn(
                                    "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all",
                                    formData.resource_type === type.id
                                        ? "border-accent bg-[#F8F9FA] text-primary"
                                        : "border-neutral/10 bg-white text-[#00142E]/40 hover:border-neutral/20"
                                )}
                            >
                                <div className={cn("p-2 rounded-xl", formData.resource_type === type.id ? "bg-accent text-white" : "bg-neutral/5")}>
                                    <type.icon size={20} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dynamic Value Input */}
                <div className="space-y-4">
                    <Label required>Resource Content</Label>

                    <AnimatePresence mode='wait'>
                        {formData.resource_type === 'link' && (
                            <motion.div
                                key="link"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-2"
                            >
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00142E]/20" size={18} />
                                    <Input
                                        placeholder="https://example.com"
                                        className="pl-12"
                                        value={formData.resource_value}
                                        onChange={(e) => updateFormData('resource_value', e.target.value)}
                                        error={errors.resource_value}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {formData.resource_type === 'file' && (
                            <motion.div
                                key="file"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group",
                                        formData.resource_value ? "border-accent bg-accent/5" : "border-neutral/10 hover:border-accent/40 hover:bg-[#F8F9FA]"
                                    )}
                                    onClick={() => {/* Mock file picker */ updateFormData('resource_value', 'https://cdn.example.com/mock-file.pdf') }}
                                >
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", formData.resource_value ? "bg-accent text-white" : "bg-[#F8F9FA] text-accent")}>
                                        {formData.resource_value ? <Check size={24} /> : <Upload size={24} />}
                                    </div>
                                    <p className="font-bold text-primary mb-1">
                                        {formData.resource_value ? "Community-guide.pdf" : "Upload Document"}
                                    </p>
                                    <p className="text-xs text-[#00142E]/50 font-medium">PDF, DOCX, or Images up to 10MB</p>
                                </div>
                                {errors.resource_value && <p className="text-[10px] font-bold text-accent mt-2 ml-1">{errors.resource_value}</p>}
                            </motion.div>
                        )}

                        {formData.resource_type === 'contact' && (
                            <motion.div
                                key="contact"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                <Input
                                    placeholder="Contact Name"
                                    value={formData.contact.name}
                                    onChange={(e) => updateContactData('name', e.target.value)}
                                    error={errors.contactName}
                                />
                                <Input
                                    placeholder="Phone Number"
                                    value={formData.contact.phone}
                                    onChange={(e) => updateContactData('phone', e.target.value)}
                                    error={errors.contactPhone}
                                />
                                <select
                                    className={cn(
                                        "w-full bg-[#F8F9FA] border border-neutral/20 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-semibold text-primary",
                                        errors.contactRole && "border-accent/50"
                                    )}
                                    value={formData.contact.role}
                                    onChange={(e) => updateContactData('role', e.target.value)}
                                >
                                    <option value="" disabled>Select Role</option>
                                    {CONTACT_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                                <Input
                                    placeholder="City (Optional)"
                                    value={formData.contact.city}
                                    onChange={(e) => updateContactData('city', e.target.value)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label>Resource Description (Optional)</Label>
                    <textarea
                        className="w-full bg-[#F8F9FA] border border-neutral/20 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-semibold text-primary placeholder:font-medium placeholder:text-[#00142E]/30 resize-none"
                        rows={3}
                        placeholder="Add any extra context or instructions..."
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                    />
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-primary hover:bg-black disabled:bg-neutral/10 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/10 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <> <Loader2 size={18} className="animate-spin" /> Adding... </>
                        ) : (
                            <> Share Resource <Check size={18} strokeWidth={3} /> </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddResourceForm;
