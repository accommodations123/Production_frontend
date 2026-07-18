import { Button } from "@/shared/ui/button"
import { Send, Mail, User, MessageSquare, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { CountryCodeSelect } from "@/shared/ui/CountryCodeSelect"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { contactSchema } from "@/shared/schemas/contact.schema"
import { TextField, TextareaField, SelectField, CheckboxField } from "@/shared/ui/form-fields"

const API_BASE = import.meta.env.PROD
    ? 'https://api.nextkinlife.live'
    : '/api';

export function ContactForm() {
    const [phoneCode, setPhoneCode] = useState("+91");
    const [phoneIso, setPhoneIso] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(contactSchema),
        mode: "onTouched",
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
            agreed: false
        }
    });

    const messageValue = watch("message") || "";

    const onSubmitForm = async (data) => {
        try {
            setSending(true);
            setError("");

            await axios.post(
                `${API_BASE}/contact/submit`,
                {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone ? `${phoneCode} ${data.phone}` : "",
                    subject: data.subject,
                    message: data.message,
                }
            );

            setSent(true);
        } catch (error) {
            console.error("Error sending contact message:", error);
            setError(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setSending(false);
        }
    };

    const handleReset = () => {
        reset();
        setSent(false);
        setError("");
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E1392A]/20 via-[#0A1C30]/20 to-[#D1CBB7]/20 rounded-3xl blur-3xl" />
            <div className="relative bg-white/10 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/20">
                {/* Header Section */}
                <div className="mb-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 bg-[#E1392A]/10 backdrop-blur-sm border border-[#E1392A]/20 rounded-full px-4 py-2 mb-6"
                    >
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-sm text-white/90 font-medium">We respond within 24 hours</span>
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Start a Conversation
                    </h2>
                    <p className="text-lg text-[#D1CBB7]/60 max-w-2xl leading-relaxed">
                        Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {sent ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-center py-16"
                        >
                            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="h-10 w-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Message Sent Successfully!</h3>
                            <p className="text-[#D1CBB7]/60 mb-8 max-w-md mx-auto">
                                Thank you for reaching out. We'll get back to you within 24 hours.
                            </p>
                            <button
                                onClick={handleReset}
                                className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl transition-all hover:scale-[1.02]"
                            >
                                Send Another Message
                            </button>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubmit(onSubmitForm)}
                            className="space-y-6"
                        >
                            {/* Personal Information Section */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <User className="h-5 w-5 text-[#E1392A]" />
                                    Personal Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <TextField
                                        label="First Name *"
                                        placeholder="John"
                                        icon={User}
                                        error={errors.firstName}
                                        {...register("firstName")}
                                    />
                                    <TextField
                                        label="Last Name *"
                                        placeholder="Doe"
                                        icon={User}
                                        error={errors.lastName}
                                        {...register("lastName")}
                                    />
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-[#D1CBB7]" />
                                    Contact Details
                                </h3>
                                <div className="space-y-5">
                                    <TextField
                                        label="Email Address *"
                                        type="email"
                                        placeholder="john@example.com"
                                        icon={Mail}
                                        error={errors.email}
                                        {...register("email")}
                                    />
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-semibold text-white/70 mb-2">Phone Number</label>
                                        <div className="flex gap-2">
                                            <CountryCodeSelect
                                                value={phoneCode}
                                                isoCode={phoneIso}
                                                onChange={(code, iso) => {
                                                    setPhoneCode(code);
                                                    if (iso) setPhoneIso(iso);
                                                }}
                                                className="w-[110px]"
                                            />
                                            <TextField
                                                placeholder="123-4567"
                                                type="tel"
                                                error={errors.phone}
                                                containerClassName="flex-1"
                                                {...register("phone")}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Message Section */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-emerald-400" />
                                    Your Message
                                </h3>
                                <div className="space-y-5">
                                    <SelectField
                                        label="Subject *"
                                        options={[
                                            "General Inquiry",
                                            "Technical Support",
                                            "Billing Question",
                                            "Partnership Opportunity"
                                        ]}
                                        placeholder="Select a topic"
                                        error={errors.subject}
                                        {...register("subject")}
                                    />
                                    <TextareaField
                                        label="Message *"
                                        placeholder="Tell us more about your inquiry..."
                                        error={errors.message}
                                        charCount={messageValue.length}
                                        {...register("message")}
                                    />
                                </div>
                            </div>

                            {/* Error message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3 p-4 bg-[#E1392A]/10 border border-[#E1392A]/20 rounded-xl"
                                >
                                    <AlertCircle className="h-5 w-5 text-[#E1392A] shrink-0" />
                                    <p className="text-sm text-[#E1392A]">{error}</p>
                                </motion.div>
                            )}

                            {/* Privacy and Submit */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <CheckboxField
                                    label={
                                        <>
                                            I agree to the{" "}
                                            <a href="#" className="text-[#E1392A] hover:text-[#E1392A]/80 underline">
                                                Privacy Policy
                                            </a>{" "}
                                            and{" "}
                                            <a href="#" className="text-[#E1392A] hover:text-[#E1392A]/80 underline">
                                                Terms of Service
                                            </a>
                                        </>
                                    }
                                    error={errors.agreed}
                                    {...register("agreed")}
                                />
                                <Button
                                    type="submit"
                                    disabled={sending}
                                    className="group relative px-8 py-3 bg-[#E1392A] hover:bg-[#a82220] text-white font-semibold rounded-xl shadow-lg shadow-[#E1392A]/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shrink-0"
                                >
                                    <span className="flex items-center gap-2">
                                        {sending ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                Send Message
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Info note */}
                {!sent && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3"
                    >
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                        <p className="text-sm text-emerald-300">We'll respond to your inquiry within 24 hours.</p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
