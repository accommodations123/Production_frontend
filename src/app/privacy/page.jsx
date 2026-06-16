"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Eye, Lock, Database, Users, Globe, Mail, Calendar } from "lucide-react";

export default function PrivacyPage() {
    const lastUpdated = "February 1, 2025";

    const sections = [
        {
            icon: Eye,
            title: "Information We Collect",
            content: [
                {
                    subtitle: "Personal Information",
                    text: "When you create an account, we collect your name, email address, phone number, and profile photo. If you become a host, we may also collect identity verification documents and payment information."
                },
                {
                    subtitle: "Usage Information",
                    text: "We automatically collect information about how you use our platform, including pages visited, search queries, bookings made, and interactions with other users."
                },
                {
                    subtitle: "Location Data",
                    text: "With your permission, we collect location data to show you nearby accommodations, events, and travel partners. You can disable this in your device settings."
                },
                {
                    subtitle: "Communication Data",
                    text: "We store messages exchanged through our platform to facilitate bookings and ensure safety, but we never read private messages unless required for safety or legal reasons."
                }
            ]
        },
        {
            icon: Database,
            title: "How We Use Your Information",
            content: [
                {
                    subtitle: "Service Delivery",
                    text: "We use your information to connect you with hosts, guests, event organizers, and travel partners. This includes processing bookings, payments, and communications."
                },
                {
                    subtitle: "Personalization",
                    text: "We personalize your experience by showing relevant accommodations, events, and marketplace listings based on your preferences and location."
                },
                {
                    subtitle: "Safety & Security",
                    text: "We use your information to verify identities, prevent fraud, and maintain the safety of our community. This includes background checks for hosts in certain regions."
                },
                {
                    subtitle: "Communications",
                    text: "We send you booking confirmations, reminders, and important updates about our services. You can opt out of marketing communications at any time."
                }
            ]
        },
        {
            icon: Users,
            title: "Information Sharing",
            content: [
                {
                    subtitle: "With Other Users",
                    text: "When you make a booking or connection request, we share relevant information with the other party (e.g., your name, profile photo, and contact details after acceptance)."
                },
                {
                    subtitle: "Service Providers",
                    text: "We share information with trusted partners who help us operate our platform, including payment processors, cloud hosting providers, and customer support services."
                },
                {
                    subtitle: "Legal Requirements",
                    text: "We may disclose information when required by law, to protect our rights, or to ensure the safety of our users and the public."
                },
                {
                    subtitle: "With Your Consent",
                    text: "We may share your information with third parties when you explicitly consent to such sharing."
                }
            ]
        },
        {
            icon: Lock,
            title: "Data Security",
            content: [
                {
                    subtitle: "Encryption",
                    text: "All data transmitted to and from our platform is encrypted using industry-standard SSL/TLS protocols. Sensitive data is encrypted at rest."
                },
                {
                    subtitle: "Access Controls",
                    text: "We implement strict access controls to ensure only authorized personnel can access user data, and only when necessary for their job functions."
                },
                {
                    subtitle: "Regular Audits",
                    text: "We conduct regular security audits and vulnerability assessments to identify and address potential security risks."
                },
                {
                    subtitle: "Incident Response",
                    text: "We have procedures in place to detect, respond to, and recover from security incidents. We will notify affected users promptly in case of a data breach."
                }
            ]
        },
        {
            icon: Globe,
            title: "Your Rights & Choices",
            content: [
                {
                    subtitle: "Access & Portability",
                    text: "You can access your personal data through your account settings. You can also request a copy of all data we hold about you."
                },
                {
                    subtitle: "Correction & Deletion",
                    text: "You can update your information at any time. You can also request deletion of your account and associated data, subject to legal retention requirements."
                },
                {
                    subtitle: "Opt-Out Rights",
                    text: "You can opt out of marketing communications, personalized advertising, and certain data collection practices through your account settings."
                },
                {
                    subtitle: "Data Protection Rights",
                    text: "Depending on your location, you may have additional rights under GDPR, CCPA, or other privacy laws. Contact us to exercise these rights."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#00142E] to-[#001a38]">
            <Navbar />

            {/* Hero Section - Premium Design */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Gradient Orbs */}
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-20 -left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

                    {/* Floating Lines */}
                    <div className="absolute top-1/4 left-10 w-32 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                    <div className="absolute top-1/3 right-20 w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="absolute bottom-1/4 left-1/4 w-40 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
                </div>

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-sm text-white/70">Your Data, Your Rights</span>
                    </div>

                    {/* Glassmorphism Hero Card */}
                    <div className="relative">
                        {/* Icon with Glow */}
                        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
                            <div className="absolute inset-0 bg-blue-500/30 rounded-3xl blur-xl" />
                            <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                                <Shield className="w-12 h-12 text-white" />
                            </div>
                        </div>

                        {/* Title with Gradient */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 font-poppins">
                            <span className="text-white">Privacy </span>
                            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Policy</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
                            Your privacy matters to us. This policy explains how NextKinLife collects, uses, and protects your personal information.
                        </p>

                        {/* Meta Info Pills */}
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
                                <Calendar className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-white/70">Last Updated: {lastUpdated}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
                                <Lock className="w-4 h-4 text-green-400" />
                                <span className="text-sm text-white/70">GDPR Compliant</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#001a38] to-transparent" />
            </section>

            {/* Content Sections */}
            <section className="pb-24 px-6">
                <div className="container mx-auto max-w-4xl space-y-12">

                    {/* Introduction */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
                        <p className="text-white/70 leading-relaxed">
                            NextKinLife LLC ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services (collectively, the "Platform"). By using NextKinLife, you agree to the collection and use of information in accordance with this policy.
                        </p>
                    </div>

                    {/* Main Sections */}
                    {sections.map((section, index) => (
                        <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                                    <section.icon className="w-5 h-5 text-accent" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                            </div>
                            <div className="space-y-6">
                                {section.content.map((item, idx) => (
                                    <div key={idx}>
                                        <h3 className="text-lg font-semibold text-white mb-2">{item.subtitle}</h3>
                                        <p className="text-white/70 leading-relaxed">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Cookies */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-4">Cookies & Tracking</h2>
                        <p className="text-white/70 leading-relaxed mb-4">
                            We use cookies and similar tracking technologies to enhance your experience on our platform. These include:
                        </p>
                        <ul className="space-y-2 text-white/70">
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span><strong className="text-white">Essential Cookies:</strong> Required for the platform to function properly (e.g., authentication, security).</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span><strong className="text-white">Analytics Cookies:</strong> Help us understand how users interact with our platform to improve our services.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span><strong className="text-white">Preference Cookies:</strong> Remember your settings and preferences for a personalized experience.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Children's Privacy */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
                        <p className="text-white/70 leading-relaxed">
                            NextKinLife is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a minor, please contact us immediately and we will take steps to delete such information.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-2xl p-8 border border-accent/30">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-6 h-6 text-accent" />
                            <h2 className="text-2xl font-bold text-white">Contact Us</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed mb-4">
                            If you have any questions about this Privacy Policy or our data practices, please contact us:
                        </p>
                        <div className="space-y-2 text-white/80">
                            <p><strong>Email:</strong> privacy@nextkinlife.com</p>
                            <p><strong>Address:</strong> NextKinLife LLC, United States</p>
                        </div>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
}
