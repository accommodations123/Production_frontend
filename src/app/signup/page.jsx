import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import FormCard from '@/components/auth/FormCard';
import TextInput from '@/components/auth/TextInput';
import Button from '@/components/auth/Button';
import { useDispatch } from 'react-redux';
import { sendOtp, verifyOtp, fetchCurrentUser } from '@/store/slices/authSlice';

const Signup = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSendOtp = async () => {
        if (!formData.email) {
            alert("Please enter an email address first.");
            return;
        }
        setIsSendingOtp(true);
        try {
            await dispatch(sendOtp({
                email: formData.email,
                phone: "0000000000" // Backend requires phone field currently
            })).unwrap();
            setOtpSent(true);
            alert("OTP sent to your email!");
        } catch (error) {
            console.error("Failed to send OTP:", error);
            alert(error || "Failed to send OTP. Please try again.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.otp) {
            alert("Please enter the verification code sent to your email.");
            return;
        }

        setIsVerifyingOtp(true);
        try {
            const response = await dispatch(verifyOtp({
                email: formData.email,
                otp: formData.otp
            })).unwrap();

            if (response) {
                // Await profile fetch so user data is ready before navigation
                try {
                    await dispatch(fetchCurrentUser()).unwrap();
                } catch (fetchErr) {
                    // Profile fetch may fail for brand-new users with minimal data — still proceed
                    console.warn("fetchCurrentUser after signup failed (non-blocking):", fetchErr);
                }
                alert("Account verified successfully!");
                navigate("/"); // Redirect to home, Navbar will refresh auth via getMe query
            } else {
                alert("Verified, but login failed. Please try logging in.");
                navigate("/signin");
            }

        } catch (error) {
            console.error("Verification Error:", error);
            alert(error || "Wrong OTP. Please try again.");
        } finally {
            setIsVerifyingOtp(false);
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
                            <p className="text-gray-500">Create your account to get started</p>
                        </div>

                        <div className="hidden md:block mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                            <p className="text-gray-500">Enter your details below to get started</p>
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
