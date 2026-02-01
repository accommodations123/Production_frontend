import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Mail, User, MessageSquare, Paperclip, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { COUNTRIES } from "@/lib/mock-data"
import { CountryCodeSelect } from "@/components/ui/CountryCodeSelect"
import { useState } from "react"

export function ContactForm() {
    const [phoneCode, setPhoneCode] = useState("+91");
    const [phoneIso, setPhoneIso] = useState("");
    return (
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-cyan-600/20 to-emerald-600/20 rounded-3xl blur-3xl" />
            <div className="relative bg-white/10 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/20">
                {/* Header Section */}
                <div className="mb-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-6"
                    >
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-sm text-white/90 font-medium">We respond within 24 hours</span>
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text">
                        Start a Conversation
                    </h2>
                    <p className="text-lg text-white/60 max-w-2xl leading-relaxed">
                        Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
                    </p>
                </div>

                <form className="space-y-6">
                    {/* Personal Information Section */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-violet-400" />
                            Personal Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-white/70 mb-2">First Name *</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-violet-400 transition-colors" />
                                    <Input
                                        id="firstName"
                                        placeholder="John"
                                        className="pl-10 bg-white/5 border-white/10 focus:border-violet-400 focus:bg-white/10 text-white placeholder:text-white/30 transition-all h-12 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-white/70 mb-2">Last Name *</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-violet-400 transition-colors" />
                                    <Input
                                        id="lastName"
                                        placeholder="Doe"
                                        className="pl-10 bg-white/5 border-white/10 focus:border-violet-400 focus:bg-white/10 text-white placeholder:text-white/30 transition-all h-12 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Mail className="h-5 w-5 text-cyan-400" />
                            Contact Details
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">Email Address *</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        className="pl-10 bg-white/5 border-white/10 focus:border-cyan-400 focus:bg-white/10 text-white placeholder:text-white/30 transition-all h-12 rounded-xl"
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
                                        className="bg-white/5 border-white/10 focus:border-cyan-400 focus:bg-white/10 text-white placeholder:text-white/30 transition-all h-12 rounded-xl flex-1"
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
                                <select className="w-full h-12 px-4 bg-white/5 border-white/10 focus:border-emerald-400 focus:bg-white/10 text-white rounded-xl transition-all">
                                    <option value="" className="bg-slate-800">Select a topic</option>
                                    <option value="general" className="bg-slate-800">General Inquiry</option>
                                    <option value="support" className="bg-slate-800">Technical Support</option>
                                    <option value="billing" className="bg-slate-800">Billing Question</option>
                                    <option value="partnership" className="bg-slate-800">Partnership Opportunity</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-white/70 mb-2">Message *</label>
                                <div className="relative">
                                    <textarea
                                        id="message"
                                        rows={6}
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                    <button type="button" className="absolute bottom-3 right-3 p-2 text-white/40 hover:text-white/60 transition-colors">
                                        <Paperclip className="h-5 w-5" />
                                    </button>
                                </div>
                                <p className="text-xs text-white/40 mt-2">Maximum 500 characters</p>
                            </div>
                        </div>
                    </div>

                    {/* Privacy and Submit */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input type="checkbox" className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-violet-500 focus:ring-violet-400 focus:ring-offset-0" />
                            <span className="text-sm text-white/60">
                                I agree to the <a href="#" className="text-violet-400 hover:text-violet-300 underline">Privacy Policy</a> and <a href="#" className="text-violet-400 hover:text-violet-300 underline">Terms of Service</a>
                            </span>
                        </label>
                        <Button className="group relative px-8 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                            <span className="flex items-center gap-2">
                                <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                Send Message
                            </span>
                        </Button>
                    </div>
                </form>

                {/* Success Message Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3"
                >
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <p className="text-sm text-emerald-300">We'll respond to your inquiry within 24 hours.</p>
                </motion.div>
            </div>
        </div>
    )
}