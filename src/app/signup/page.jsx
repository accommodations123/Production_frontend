import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import TextInput from '@/components/auth/TextInput';
import Button from '@/components/auth/Button';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtp, verifyOtp, fetchCurrentUser } from '@/store/slices/authSlice';
import { toast } from 'sonner';

const Signup = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user: authUser, error: authError } = useSelector((state) => state.auth || {});
    const isAuthenticated = Boolean(authUser && !authError);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        otp: '',
        password: '',
        confirmPassword: '',
    });

    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSendOtp = async () => {
        if (!formData.email) {
            toast.error("Please enter an email address first.");
            return;
        }
        setIsSendingOtp(true);
        try {
            await dispatch(sendOtp({
                email: formData.email,
                phone: "0000000000" // Backend requires phone field currently
            })).unwrap();
            setOtpSent(true);
            toast.success("OTP sent to your email!");
        } catch (error) {
            console.error("Failed to send OTP:", error);
            toast.error(error || "Failed to send OTP. Please try again.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.otp) {
            toast.error("Please enter the verification code sent to your email.");
            return;
        }

        setIsVerifyingOtp(true);
        try {
            const response = await dispatch(verifyOtp({
                email: formData.email,
                otp: formData.otp
            })).unwrap();

            if (response) {
                await dispatch(fetchCurrentUser()).unwrap();
                toast.success("Account verified successfully!");
                navigate("/");
            } else {
                toast.error("Verified, but login failed. Please try logging in.");
                navigate("/signin");
            }

        } catch (error) {
            console.error("Verification Error:", error);
            toast.error(error || "Wrong OTP. Please try again.");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const loginWithGoogle = () => {
        const googleAuthUrl = import.meta.env.PROD
            ? "https://api.nextkinlife.live/auth/google"
            : "/api/auth/google";

        window.location.href = googleAuthUrl;
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

                {/* Right Side - Form */}
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
                            <p className="text-gray-500">Create your account to get started</p>
                        </div>

                        <div className="hidden md:block mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h2>
                            <p className="text-gray-500">Enter your details to create your account</p>
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
                                />
                                <TextInput
                                    label="Last Name"
                                    name="lastName"
                                    placeholder="Doe"
                                    icon={User}
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="bg-white"
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
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isSendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Get OTP"}
                                    </button>
                                }
                            />

                            <Button type="submit" disabled={isVerifyingOtp} className="mt-6 w-full shadow-blue-500/20 py-3 text-base">
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

                            <div className="flex items-center my-6">
                                <div className="h-px flex-1 bg-gray-200" />
                                <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Or</span>
                                <div className="h-px flex-1 bg-gray-200" />
                            </div>

                            <button
                                type="button"
                                onClick={loginWithGoogle}
                                className="w-full h-12 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer text-sm"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </button>

                            <div className="text-center mt-8">
                                <p className="text-sm text-gray-500">
                                    Already have an account?{' '}
                                    <Link
                                        to="/signin"
                                        className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
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
