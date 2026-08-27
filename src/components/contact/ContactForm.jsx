import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Mail, User, MessageSquare, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { CountryCodeSelect } from "@/components/ui/CountryCodeSelect"
import { useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"

export function ContactForm() {
    const [phoneCode, setPhoneCode] = useState("+91");
    const [phoneIso, setPhoneIso] = useState("");

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [agreed, setAgreed] = useState(false);

    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const canSubmit = firstName && lastName && email && subject && message && agreed && !sending;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        try {
            setSending(true);
            setError("");

            if (supabase) {
                await supabase.from('contacts').insert({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    phone: phone ? `${phoneCode} ${phone}` : "",
                    subject,
                    message,
                });
            }

            setSent(true);
        } catch (error) {
            console.error(
                "Error sending contact message:",
                error
            );

            setError(
                error?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setSending(false);
        }
    };

    const handleReset = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setSubject("");
        setMessage("");
        setAgreed(false);
        setSent(false);
        setError("");
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#CB2A25]/20 via-[#0A1C30]/20 to-[#D1CBB7]/20 rounded-3xl blur-3xl" />
            <div className="relative bg-white/10 backdrop-blur-xl p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20">
                {/* Header Section */}
                <div className="mb-6 sm:mb-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 bg-[#CB2A25]/10 backdrop-blur-sm border border-[#CB2A25]/20 rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6"
                    >
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-xs sm:text-sm text-white/90 font-medium">We respond within 24 hours</span>
                    </motion.div>

                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
                        Start a Conversation
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-[#D1CBB7]/70 max-w-2xl leading-relaxed">
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
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            {/* Personal Information Section */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <User className="h-5 w-5 text-[#CB2A25]" />
                                    Personal Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-white/70 mb-2">First Name *</label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-[#CB2A25] transition-colors" />
                                            <Input
                                                id="firstName"
                                                placeholder="John"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="pl-10 bg-white/5 border-white/10 focus:border-[#CB2A25] focus:bg-white/10 text-white placeholder:text-white/30 transition-all h-12 rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-white/70 mb-2">Last Name *</label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-[#CB2A25] transition-colors" />
                                            <Input
                                                id="lastName"
                                                placeholder="Doe"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="pl-10 bg-white/5 border-white/10 focus:border-[#CB2A25] focus:bg-white/10 text-white placeholder:text-white/30 transition-all h-12 rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-[#D1CBB7]" />
                                    Contact Details
                                </h3>
                                <div className="space-y-5">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">Email Address *</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-[#D1CBB7] transition-colors" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10 bg-white/5 border-white/10 focus:border-[#D1CBB7] focus:bg-white/10 text-white placeholder:text-white/30 transition-all h-12 rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-white/70 mb-2">Phone Number</label>
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
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="123-4567"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="bg-white/5 border-white/10 focus:border-[#D1CBB7] focus:bg-white/10 text-white placeholder:text-white/30 transition-all h-12 rounded-xl flex-1"
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
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-white/70 mb-2">Subject *</label>
                                        <select
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="w-full h-12 px-4 bg-white/5 border border-white/10 focus:border-emerald-400 focus:bg-white/10 text-white rounded-xl transition-all"
                                            required
                                        >
                                            <option value="" className="bg-[#0A1C30]">Select a topic</option>
                                            <option value="General Inquiry" className="bg-[#0A1C30]">General Inquiry</option>
                                            <option value="Technical Support" className="bg-[#0A1C30]">Technical Support</option>
                                            <option value="Billing Question" className="bg-[#0A1C30]">Billing Question</option>
                                            <option value="Partnership Opportunity" className="bg-[#0A1C30]">Partnership Opportunity</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-white/70 mb-2">Message *</label>
                                        <div className="relative">
                                            <textarea
                                                id="message"
                                                rows={6}
                                                maxLength={500}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all resize-none"
                                                placeholder="Tell us more about your inquiry..."
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-white/40 mt-2">{message.length}/500 characters</p>
                                    </div>
                                </div>
                            </div>

                            {/* Error message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3 p-4 bg-[#CB2A25]/10 border border-[#CB2A25]/20 rounded-xl"
                                >
                                    <AlertCircle className="h-5 w-5 text-[#CB2A25] shrink-0" />
                                    <p className="text-sm text-[#CB2A25]">{error}</p>
                                </motion.div>
                            )}

                            {/* Privacy and Submit */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-[#CB2A25] focus:ring-[#CB2A25] focus:ring-offset-0"
                                    />
                                    <span className="text-xs sm:text-sm text-white/70">
                                        I agree to the <Link to="/privacy" className="text-[#CB2A25] hover:text-[#CB2A25]/80 underline">Privacy Policy</Link> and <Link to="/terms" className="text-[#CB2A25] hover:text-[#CB2A25]/80 underline">Terms of Service</Link>
                                    </span>
                                </label>
                                <Button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="w-full sm:w-auto group relative px-8 py-3 bg-[#CB2A25] hover:bg-[#a82220] text-white font-semibold rounded-xl shadow-lg shadow-[#CB2A25]/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
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
