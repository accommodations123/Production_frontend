import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Check, ChevronRight, ChevronLeft, Calendar, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CountryCodeSelect } from '@/components/ui/CountryCodeSelect'

export function ApplicationModal({ job, isOpen, onClose }) {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        phoneCode: '+91',
        linkedin: '',
        portfolio: '',
        experience: [],
        skills: {},
        availability: ''
    })

    if (!isOpen) return null

    const nextStep = () => setStep(s => s + 1)
    const prevStep = () => setStep(s => s - 1)

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0A1128] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0A1128]">
                            <div>
                                <h2 className="text-xl font-bold text-white">Apply for {job?.title}</h2>
                                <p className="text-sm text-gray-400">{job?.location} • {job?.department}</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1 bg-white/5 w-full">
                            <motion.div
                                className="h-full bg-[#7B2CBF]"
                                initial={{ width: "0%" }}
                                animate={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {step === 1 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">First Name</label>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#7B2CBF] focus:outline-none transition-colors" placeholder="Jane" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Last Name</label>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#7B2CBF] focus:outline-none transition-colors" placeholder="Doe" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Email</label>
                                        <input type="email" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#7B2CBF] focus:outline-none transition-colors" placeholder="jane@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Phone</label>
                                        <div className="flex gap-2">
                                            <div className="w-[110px] shrink-0">
                                                <CountryCodeSelect
                                                    value={formData.phoneCode}
                                                    onChange={(code) => setFormData({ ...formData, phoneCode: code })}
                                                    className="w-full"
                                                />
                                            </div>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#7B2CBF] focus:outline-none transition-colors"
                                                placeholder="000-0000"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/10">
                                        <h4 className="text-sm font-medium text-white mb-4">Resume/CV</h4>
                                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-[#7B2CBF]/50 hover:bg-[#7B2CBF]/5 transition-colors cursor-pointer group" onClick={() => document.getElementById('resume-upload').click()}>
                                            <input
                                                id="resume-upload"
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                className="hidden"
                                                onChange={(e) => setFormData(prev => ({ ...prev, resume: e.target.files[0] }))}
                                            />
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3 group-hover:text-[#7B2CBF] transition-colors" />
                                            <p className="text-sm text-gray-300">Drag and drop your resume here, or click to browse</p>
                                            <p className="text-xs text-gray-500 mt-1">PDF, DOCX up to 10MB</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-[#0077b5]/10 border border-[#0077b5]/20 rounded-xl cursor-pointer hover:bg-[#0077b5]/20 transition-colors">
                                        <Linkedin className="w-5 h-5 text-[#0077b5]" />
                                        <span className="text-sm font-medium text-white">Apply with LinkedIn</span>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-white">Experience & Skills</h3>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm text-gray-400">Work Experience</label>
                                            <button className="text-xs text-[#7B2CBF] hover:text-[#7B2CBF]/80 font-medium cursor-pointer">+ Add Role</button>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                                    <span className="text-lg">💼</span>
                                                </div>
                                                <div className="flex-1">
                                                    <input type="text" className="w-full bg-transparent border-b border-white/10 pb-1 mb-2 text-white focus:border-[#7B2CBF] focus:outline-none" placeholder="Job Title" />
                                                    <input type="text" className="w-full bg-transparent border-b border-white/10 pb-1 text-sm text-gray-300 focus:border-[#7B2CBF] focus:outline-none" placeholder="Company Name" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Portfolio / Website</label>
                                        <input type="url" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#7B2CBF] focus:outline-none transition-colors" placeholder="https://" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Earliest Start Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-[#7B2CBF] focus:outline-none transition-colors [color-scheme:dark]" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-[#2DC653]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check className="w-10 h-10 text-[#2DC653]" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Ready to Submit?</h3>
                                    <p className="text-gray-400 max-w-md mx-auto mb-8">
                                        Please review your information before submitting. You'll receive a confirmation email shortly after.
                                    </p>

                                    <div className="bg-white/5 rounded-xl p-6 text-left max-w-md mx-auto border border-white/10">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-400">Name</span>
                                            <span className="text-white">Jane Doe</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-400">Email</span>
                                            <span className="text-white">jane@example.com</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Role</span>
                                            <span className="text-white">{job?.title}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 bg-[#0A1128] flex justify-between">
                            {step > 1 ? (
                                <Button variant="outline" onClick={prevStep} className="border-white/10 text-white hover:bg-white/5 cursor-pointer">
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                            ) : (
                                <div></div>
                            )}

                            {step < 3 ? (
                                <Button onClick={nextStep} className="bg-[#7B2CBF] hover:bg-[#7B2CBF]/90 text-white cursor-pointer">
                                    Next Step <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button onClick={onClose} className="bg-[#2DC653] hover:bg-[#2DC653]/90 text-white cursor-pointer">
                                    Submit Application
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
