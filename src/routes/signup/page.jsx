import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import TextInput from '@/features/auth/components/TextInput';
import Button from '@/features/auth/components/Button';
import { useSendOtpMutation, useVerifyOtpMutation, useLazyGetMeQuery } from '@/store/api/authApi';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        otp: '',
        password: '',
        confirmPassword: '',
    });

    const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
    const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
    const [triggerGetMe] = useLazyGetMeQuery();

    const [otpSent, setOtpSent] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSendOtp = async () => {
        if (!formData.email) {
            toast.error("Please enter an email address first.");
            return;
        }
        try {
            await sendOtp({
                email: formData.email,
                phone: "0000000000" // Backend requires phone field currently
            }).unwrap();
            setOtpSent(true);
            toast.success("OTP sent to your email!");
        } catch (error) {
            console.error("Failed to send OTP:", error);
            toast.error(error?.data?.message || "Failed to send OTP. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.otp) {
            toast.error("Please enter the verification code sent to your email.");
            return;
        }

        try {
            const response = await verifyOtp({
                email: formData.email,
                otp: formData.otp
            }).unwrap();

            if (response) {
                await triggerGetMe();
                toast.success("Account verified successfully!");
                navigate("/"); // Redirect to home, Navbar will refresh auth via getMe query
            } else {
                toast.info("Verified, but login failed. Please try logging in.");
                navigate("/signin");
            }

        } catch (error) {
            console.error("Verification Error:", error);
            toast.error(error?.data?.message || "Wrong OTP. Please try again.");
        }
    };

    return (
        <div className="min-h-screen w-full bg-white overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full min-h-screen grid grid-cols-1 md:grid-cols-2"
            >
                {/* Left Side - Description (Logo Palette) */}
                <div className="hidden md:flex flex-col justify-center items-center p-8 md:p-12 bg-primary relative overflow-hidden h-full">
                    <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
                        <div className="w-70 h-50 rounded-3xl overflow-hidden shadow-2xl mb-8 ">
                            <img src="/logo2.png" alt="NextKinLife Logo" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-gray-300 text-xl leading-relaxed">
                            Connect, explore, and thrive with a community that understands you. Start your journey today.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form (Light Bright Gray) */}
                <div className="w-full bg-gray-50 flex flex-col justify-center items-center p-6 sm:p-8 md:p-12 h-full overflow-y-auto">
                    <div className="w-full max-w-md mx-auto py-8">
                        <div className="text-center mb-8 md:hidden">
                            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg mx-auto mb-4">
                                <img src="/logo.jpeg" alt="NextKinLife Logo" className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                        </div>

                        <div className="md:hidden mb-6 text-center">
                            <h2 className="text-2xl font-bold text-gray-900">Sign Up</h2>
                            <p className="text-[#484848]">Create your account to get started</p>
                        </div>

                        <div className="hidden md:block mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                            <p className="text-[#484848]">Enter your details below to get started</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <TextInput
                                    label="First Name"
                                    name="firstName"
                                    placeholder="John"
                                    icon={User}
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="bg-white"
                                    required
                                />
                                <TextInput
                                    label="Last Name"
                                    name="lastName"
                                    placeholder="Doe"
                                    icon={User}
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="bg-white"
                                    required
                                />
                            </div>

                            <TextInput
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                icon={Mail}
                                value={formData.email}
                                onChange={handleChange}
                                className="bg-white"
                                required
                            />

                            <TextInput
                                label="Verification Code"
                                name="otp"
                                placeholder="Enter OTP"
                                icon={ShieldCheck}
                                value={formData.otp}
                                onChange={handleChange}
                                className="bg-white"
                                rightElement={
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={isSendingOtp || otpSent}
                                        className="text-xs font-semibold text-accent hover:text-accent/90 bg-accent/5 hover:bg-accent/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isSendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Get OTP"}
                                    </button>
                                }
                            />


                            <Button type="submit" disabled={isVerifyingOtp} className="mt-6 w-full shadow-accent/20 py-3 text-base">
                                {isVerifyingOtp ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Sign Up <ArrowRight size={20} />
                                    </>
                                )}
                            </Button>

                            <div className="text-center mt-8">
                                <p className="text-sm text-[#484848]">
                                    Already have an account?{' '}
                                    <Link
                                        to="/signin"
                                        className="font-semibold text-accent hover:text-accent/90 hover:underline transition-all"
                                    >
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
