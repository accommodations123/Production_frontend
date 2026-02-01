import React, { useState } from 'react';
import { Mail, Phone, MapPin, User, FileText, Check, AlertCircle, Info } from 'lucide-react';
import OtpVerification from '@/components/host/OtpVerification';
import { COUNTRIES } from '@/lib/mock-data';
import { CountryCodeSelect } from '@/components/ui/CountryCodeSelect';

export function StepIdentity({
    formData,
    setFormData,
    handleSendOtp,
    handleVerifyOtp,
    isEmailVerified,
    showOtpModal,
    setShowOtpModal,
    handleFileChange
}) {
    return (
        <div className="space-y-6 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Let's verify your identity</h2>

            {/* Email Verification */}
            <div className="bg-black/20 p-6 rounded-2xl border border-white/10 space-y-4">
                <label className="text-sm font-medium text-gray-300 block">Email Address (Required)</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className={`w-full bg-white/5 border ${isEmailVerified ? 'border-green-500/50' : 'border-white/10'} rounded-xl py-3 pl-12 pr-4 focus:border-accent outline-none transition-all`}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={isEmailVerified}
                        />
                        {isEmailVerified && <Check className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />}
                    </div>
                    {!isEmailVerified && formData.email && (
                        <button
                            onClick={handleSendOtp}
                            className="bg-accent hover:bg-accent/80 text-white px-6 rounded-xl font-bold transition-all text-sm whitespace-nowrap"
                        >
                            Verify
                        </button>
                    )}
                </div>
                {!isEmailVerified && (
                    <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-900/20 p-3 rounded-lg border border-amber-500/20">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Please verify your email to proceed to the next step.</span>
                    </div>
                )}
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-accent outline-none"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Phone Number</label>
                    <div className="flex gap-2">
                        <CountryCodeSelect
                            value={formData.phoneCode || "+91"}
                            isoCode={formData.phoneIso}
                            onChange={(code, iso) => setFormData({ ...formData, phoneCode: code, phoneIso: iso })}
                            className="w-[110px]"
                        />
                        <div className="relative flex-1">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-accent outline-none"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Current Address</label>
                <div className="relative">
                    <MapPin className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                        placeholder="Full Address"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-accent outline-none min-h-[80px]"
                        value={formData.hostAddress}
                        onChange={(e) => setFormData({ ...formData, hostAddress: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <input
                    type="text"
                    placeholder="City"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-accent outline-none"
                    value={formData.hostCity}
                    onChange={(e) => setFormData({ ...formData, hostCity: e.target.value })}
                />
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Country"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-accent outline-none"
                        value={formData.hostCountry}
                        onChange={(e) => setFormData({ ...formData, hostCountry: e.target.value })}
                        disabled
                    />
                    <Info className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
            </div>

            {/* ID Proof & Selfie */}
            <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-lg font-bold">Identity Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">ID Type</label>
                        <select
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-accent outline-none text-gray-300"
                            value={formData.idType}
                            onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                        >
                            <option value="Aadhaar" className="bg-gray-900 text-white">Aadhaar Card</option>
                            <option value="Passport" className="bg-gray-900 text-white">Passport</option>
                            <option value="Driving License" className="bg-gray-900 text-white">Driving License</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">ID Number</label>
                        <input
                            type="text"
                            placeholder="ID Number"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-accent outline-none"
                            value={formData.idNumber}
                            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Upload ID Document *</label>
                        <div className={`border-2 border-dashed rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative flex flex-col items-center justify-center h-32 ${!formData.idProof ? 'border-red-500/50 bg-red-500/5' : 'border-white/20'}`}>
                            {formData.idProof ? (
                                <div className="text-green-400 flex flex-col items-center">
                                    <Check className="h-8 w-8 mb-2" />
                                    <span className="text-xs truncate max-w-[200px]">{formData.idProof.name}</span>
                                </div>
                            ) : (
                                <>
                                    <FileText className="h-8 w-8 text-gray-400 mb-2" />
                                    <span className="text-xs text-gray-500">Upload ID Document</span>
                                </>
                            )}
                            <input type="file" accept=".pdf,image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'idProof')} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Your Selfie (Required) *</label>
                        <div className={`border-2 border-dashed rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative flex flex-col items-center justify-center h-32 ${!formData.profilePhoto ? 'border-red-500/50 bg-red-500/5' : 'border-white/20'}`}>
                            {formData.profilePhoto ? (
                                <div className="text-green-400 flex flex-col items-center">
                                    <Check className="h-8 w-8 mb-2" />
                                    <span className="text-xs truncate max-w-[200px]">{formData.profilePhoto.name}</span>
                                </div>
                            ) : (
                                <>
                                    <User className="h-8 w-8 text-gray-400 mb-2" />
                                    <span className="text-xs text-gray-500">Take/Upload Selfie</span>
                                </>
                            )}
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'profilePhoto')} />
                        </div>
                    </div>
                </div>
            </div>

            {/* OTP Modal */}
            <OtpVerification
                isOpen={showOtpModal}
                onClose={() => setShowOtpModal(false)}
                onVerify={handleVerifyOtp}
                email={formData.email}
                onResend={handleSendOtp}
            />
        </div>
    );
} 