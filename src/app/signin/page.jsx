import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, KeyRound, ArrowRight, Loader2, Globe, ShieldCheck, Users, Home } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/auth/Button";
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useLazyGetMeQuery,
} from "@/store/api/authApi";

/* Brand Colors:
  --color-background: #ffffff
  --color-foreground: #00142E
  --color-primary: #00142E
  --color-secondary: #0A1C30
  --color-accent: #CB2A25
  --color-neutral: #D1CBB7
  --color-navy-dark: #02152B
*/

const Signin = () => {
  const navigate = useNavigate();

  const [sendOtp, { isLoading: sendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyOtpMutation();
  const [triggerGetMe] = useLazyGetMeQuery();

  const [step, setStep] = useState("email");
  const [formData, setFormData] = useState({ email: "", otp: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      await sendOtp({ email: formData.email }).unwrap();
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await verifyOtp(formData).unwrap();
      const me = await triggerGetMe().unwrap();
      localStorage.setItem("user", JSON.stringify(me.user || me));
      toast.success("Signed in successfully");
      navigate("/");
    } catch (error) {
      toast.error("Login failed. Please check your OTP.");
    }
  };

  const loginWithGoogle = () => {
    window.location.href = "https://accomodation.api.test.nextkinlife.live/auth/google";
  };

  return (
    <div className="min-h-screen w-full bg-[#ffffff] relative overflow-hidden flex items-center justify-center p-4 md:p-8">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#00142E 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Accent Glow */}
      <motion.div
        animate={{ opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[30%] -right-[20%] w-[80vh] h-[80vh] rounded-full bg-[#CB2A25] blur-[200px] z-0"
      />
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -top-[20%] -left-[20%] w-[60vh] h-[60vh] rounded-full bg-[#00142E] blur-[180px] z-0"
      />

      <div className="relative z-10 w-full max-w-5xl min-h-[650px] bg-white rounded-3xl shadow-2xl shadow-[#00142E]/10 overflow-hidden grid lg:grid-cols-[1.1fr_1fr] border border-[#D1CBB7]/30">

        {/* LEFT PANEL: Premium Branding */}
        <div className="hidden lg:flex relative bg-gradient-to-br from-[#00142E] via-[#0A1C30] to-[#02152B] text-white flex-col justify-between p-10 xl:p-14 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

          {/* Accent Line */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#CB2A25] via-[#CB2A25]/50 to-transparent" />

          {/* Glowing Orb */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#CB2A25] rounded-full blur-[120px]"
          />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl border-2 border-white/10 bg-white/5 backdrop-blur-md">
                <img src="/logo2.png" alt="NextKinLife" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight block">NextKinLife</span>
                <span className="text-xs text-[#D1CBB7]/70 font-medium">Your Community Platform</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-5">
                  {step === 'email' ? (
                    <>Welcome to <br /><span className="text-[#CB2A25]">Your Community</span></>
                  ) : (
                    <>One Step <br /><span className="text-[#CB2A25]">Closer</span></>
                  )}
                </h1>
                <p className="text-[#D1CBB7]/80 text-base xl:text-lg max-w-xs leading-relaxed">
                  {step === 'email'
                    ? "Connect with thousands of members, find accommodations, and build meaningful relationships."
                    : "We've sent a verification code to your email. Enter it below to continue."
                  }
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Feature Pills */}
          <div className="relative z-10 space-y-5">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-full backdrop-blur-md border border-white/10 text-sm">
                <Home size={15} className="text-[#CB2A25]" />
                <span className="text-[#D1CBB7]">Accommodations</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-full backdrop-blur-md border border-white/10 text-sm">
                <Users size={15} className="text-[#CB2A25]" />
                <span className="text-[#D1CBB7]">Community</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-full backdrop-blur-md border border-white/10 text-sm">
                <ShieldCheck size={15} className="text-[#CB2A25]" />
                <span className="text-[#D1CBB7]">Secure</span>
              </div>
            </div>
            <p className="text-xs text-[#D1CBB7]/40">© 2026 NextKinLife. All rights reserved.</p>
          </div>
        </div>

        {/* RIGHT PANEL: Form */}
        <div className="bg-[#ffffff] p-8 md:p-10 lg:p-12 xl:p-14 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">

            {/* Mobile Header */}
            <div className="lg:hidden mb-10 text-center">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl mx-auto mb-5 border-2 border-[#D1CBB7]/20">
                <img src="/logo.jpeg" alt="NextKinLife" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-bold text-[#00142E]">Welcome Back</h2>
              <p className="text-[#00142E]/50 text-sm mt-1">Sign in to continue</p>
            </div>

            <AnimatePresence mode="wait">
              {step === 'email' ? (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8 hidden lg:block">
                    <h2 className="text-3xl font-bold text-[#00142E]">Sign In</h2>
                    <p className="text-[#00142E]/50 mt-2">Enter your email to access your account</p>
                  </div>

                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[#00142E]/70 ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00142E]/30 group-focus-within:text-[#CB2A25] transition-colors h-5 w-5" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className="w-full bg-[#D1CBB7]/10 border-2 border-transparent text-[#00142E] rounded-xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-[#CB2A25] focus:ring-4 focus:ring-[#CB2A25]/10 transition-all font-medium placeholder:text-[#00142E]/30"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={sendingOtp}
                      className="w-full h-14 bg-[#CB2A25] hover:bg-[#b02420] text-white rounded-xl font-bold text-base shadow-lg shadow-[#CB2A25]/25 transition-all hover:shadow-xl hover:shadow-[#CB2A25]/30 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {sendingOtp ? <Loader2 className="animate-spin h-5 w-5" /> : <>Continue <ArrowRight size={18} /></>}
                    </button>
                  </form>

                  <div className="my-8 flex items-center gap-4">
                    <div className="h-px flex-1 bg-[#D1CBB7]/30" />
                    <span className="text-xs font-semibold text-[#00142E]/40 uppercase tracking-wider">Or</span>
                    <div className="h-px flex-1 bg-[#D1CBB7]/30" />
                  </div>

                  <button
                    onClick={loginWithGoogle}
                    className="w-full h-14 bg-white border-2 border-[#D1CBB7]/40 text-[#00142E] hover:bg-[#D1CBB7]/10 hover:border-[#D1CBB7]/60 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <button onClick={() => setStep('email')} className="text-sm font-medium text-[#00142E]/50 hover:text-[#CB2A25] flex items-center gap-1.5 mb-5 transition-colors group">
                      <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
                    </button>
                    <h2 className="text-3xl font-bold text-[#00142E]">Verify OTP</h2>
                    <p className="text-[#00142E]/50 mt-2">Code sent to <span className="text-[#00142E] font-semibold">{formData.email}</span></p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[#00142E]/70 ml-1">Verification Code</label>
                      <div className="relative group">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00142E]/30 group-focus-within:text-[#CB2A25] transition-colors h-5 w-5" />
                        <input
                          type="text"
                          name="otp"
                          value={formData.otp}
                          onChange={handleChange}
                          placeholder="Enter 4-digit code"
                          className="w-full bg-[#D1CBB7]/10 border-2 border-transparent text-[#00142E] rounded-xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-[#CB2A25] focus:ring-4 focus:ring-[#CB2A25]/10 transition-all font-bold tracking-[0.3em] text-lg placeholder:text-[#00142E]/30 placeholder:tracking-normal placeholder:font-medium"
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={verifyingOtp}
                      className="w-full h-14 bg-[#CB2A25] hover:bg-[#b02420] text-white rounded-xl font-bold text-base shadow-lg shadow-[#CB2A25]/25 transition-all hover:shadow-xl hover:shadow-[#CB2A25]/30 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {verifyingOtp ? <Loader2 className="animate-spin h-5 w-5" /> : <>Verify & Sign In <ArrowRight size={18} /></>}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
};

const ArrowLeftIcon = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default Signin;