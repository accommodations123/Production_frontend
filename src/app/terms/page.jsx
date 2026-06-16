"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FileText, Users, Home, ShoppingBag, Calendar, Plane, AlertTriangle, Scale, Mail } from "lucide-react";

export default function TermsPage() {
    const lastUpdated = "February 1, 2025";

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#00142E] to-[#001a38]">
            <Navbar />

            {/* Hero Section - Premium Design */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Gradient Orbs */}
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

                    {/* Floating Lines */}
                    <div className="absolute top-1/4 left-10 w-32 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                    <div className="absolute top-1/3 right-20 w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="absolute bottom-1/4 left-1/4 w-40 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                </div>

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8">
                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        <span className="text-sm text-white/70">Legal Documentation</span>
                    </div>

                    {/* Glassmorphism Hero Card */}
                    <div className="relative">
                        {/* Icon with Glow */}
                        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
                            <div className="absolute inset-0 bg-accent/30 rounded-3xl blur-xl" />
                            <div className="relative w-full h-full bg-gradient-to-br from-accent to-red-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-accent/30">
                                <FileText className="w-12 h-12 text-white" />
                            </div>
                        </div>

                        {/* Title with Gradient */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 font-poppins">
                            <span className="text-white">Terms of </span>
                            <span className="bg-gradient-to-r from-accent via-red-400 to-orange-400 bg-clip-text text-transparent">Service</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
                            Please read these terms carefully before using NextKinLife. By accessing our platform, you agree to be bound by these terms.
                        </p>

                        {/* Meta Info Pills */}
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
                                <Calendar className="w-4 h-4 text-accent" />
                                <span className="text-sm text-white/70">Last Updated: {lastUpdated}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-white/70">12 Sections</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#001a38] to-transparent" />
            </section>

            {/* Content Sections */}
            <section className="pb-24 px-6">
                <div className="container mx-auto max-w-4xl space-y-8">

                    {/* Introduction */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-4">1. Introduction & Acceptance</h2>
                        <p className="text-white/70 leading-relaxed mb-4">
                            Welcome to NextKinLife! These Terms of Service ("Terms") govern your access to and use of the NextKinLife website, mobile application, and services (collectively, the "Platform"). NextKinLife LLC ("we," "our," or "us") provides an online platform that connects hosts offering accommodations, event organizers, marketplace sellers, and travel companions with users seeking these services.
                        </p>
                        <p className="text-white/70 leading-relaxed">
                            By accessing or using next kinLife, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Platform.
                        </p>
                    </div>

                    {/* Eligibility */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-accent" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">2. Eligibility</h2>
                        </div>
                        <ul className="space-y-3 text-white/70">
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span>You must be at least 18 years old to use NextKinLife.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span>You must provide accurate and complete information when creating an account.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span>You are responsible for maintaining the confidentiality of your account credentials.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span>You may not create multiple accounts or share your account with others.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Accommodations */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                                <Home className="w-5 h-5 text-accent" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">3. Accommodations</h2>
                        </div>
                        <div className="space-y-4 text-white/70">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">For Hosts</h3>
                                <ul className="space-y-2 ml-4">
                                    <li>• You must have legal authority to list your property on NextKinLife.</li>
                                    <li>• Listings must be accurate and not misleading regarding amenities, location, or availability.</li>
                                    <li>• You must comply with all local laws, regulations, and tax requirements.</li>
                                    <li>• You are responsible for maintaining your property in a safe and habitable condition.</li>
                                    <li>• You agree to honor confirmed bookings unless there are exceptional circumstances.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">For Guests</h3>
                                <ul className="space-y-2 ml-4">
                                    <li>• You agree to treat the property with respect and follow house rules.</li>
                                    <li>• You are responsible for any damage caused during your stay.</li>
                                    <li>• You must vacate the property at the agreed checkout time.</li>
                                    <li>• You agree not to exceed the maximum occupancy specified in the listing.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Marketplace */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-accent" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">4. Buy/Sell Marketplace</h2>
                        </div>
                        <div className="space-y-4 text-white/70">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">For Sellers</h3>
                                <ul className="space-y-2 ml-4">
                                    <li>• You must have legal ownership or authorization to sell listed items.</li>
                                    <li>• Product descriptions and images must accurately represent the item.</li>
                                    <li>• Prohibited items include illegal goods, weapons, drugs, and counterfeit products.</li>
                                    <li>• You are responsible for shipping, handling, and any applicable taxes.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">For Buyers</h3>
                                <ul className="space-y-2 ml-4">
                                    <li>• You agree to complete transactions in good faith.</li>
                                    <li>• Disputes between buyers and sellers should first be resolved directly.</li>
                                    <li>• NextKinLife is not responsible for the quality or delivery of items sold through the marketplace.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Events */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-accent" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">5. Events</h2>
                        </div>
                        <div className="space-y-4 text-white/70">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">For Event Organizers</h3>
                                <ul className="space-y-2 ml-4">
                                    <li>• Event information must be accurate and up-to-date.</li>
                                    <li>• You are responsible for obtaining necessary permits and insurance.</li>
                                    <li>• Ticket prices and refund policies must be clearly stated.</li>
                                    <li>• You must ensure the safety of attendees at your events.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">For Attendees</h3>
                                <ul className="space-y-2 ml-4">
                                    <li>• You must follow event rules and guidelines set by organizers.</li>
                                    <li>• You are responsible for understanding the event's cancellation policy before purchasing tickets.</li>
                                    <li>• You agree to behave respectfully towards other attendees and organizers.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Travel Partners */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                                <Plane className="w-5 h-5 text-accent" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">6. Travel Partners</h2>
                        </div>
                        <ul className="space-y-3 text-white/70">
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span>Travel partner connections are made at your own risk. Exercise caution when meeting strangers.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span>Profile information must be accurate and not misleading.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span>You agree to respect the boundaries and preferences of your travel partners.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span>NextKinLife is not responsible for any incidents that occur during travel meetups.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span>We recommend meeting in public places and informing someone of your travel plans.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Community Guidelines */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-accent" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">7. Community Guidelines</h2>
                        </div>
                        <p className="text-white/70 mb-4">All users must adhere to our community standards:</p>
                        <ul className="space-y-2 text-white/70">
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span><strong className="text-white">Respect:</strong> Treat all users with respect and dignity.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span><strong className="text-white">Honesty:</strong> Provide accurate information and do not misrepresent yourself.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span><strong className="text-white">Safety:</strong> Do not engage in harmful, threatening, or illegal activities.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span><strong className="text-white">No Harassment:</strong> Harassment, discrimination, and hate speech are strictly prohibited.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span><strong className="text-white">No Spam:</strong> Do not use the platform for unsolicited advertising or spam.</span>
                            </li>
                        </ul>
                    </div>



                    {/* Limitation of Liability */}
                    <div className="bg-yellow-500/10 backdrop-blur-sm rounded-2xl p-8 border border-yellow-500/30">
                        <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle className="w-6 h-6 text-yellow-400" />
                            <h2 className="text-2xl font-bold text-white">9. Limitation of Liability</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed mb-4">
                            NextKinLife acts as a platform connecting users and is not a party to agreements between hosts and guests, buyers and sellers, or event organizers and attendees. We are not responsible for:
                        </p>
                        <ul className="space-y-2 text-white/70">
                            <li>• The accuracy of user-generated content or listings</li>
                            <li>• The quality of accommodations, products, events, or experiences</li>
                            <li>• Any damages, injuries, or losses resulting from user interactions</li>
                            <li>• Technical issues or service interruptions</li>
                        </ul>
                        <p className="text-white/70 mt-4">
                            To the maximum extent permitted by law, NextKinLife disclaims all warranties and limits liability for any indirect, incidental, or consequential damages.
                        </p>
                    </div>

                    {/* Account Termination */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-4">10. Account Termination</h2>
                        <p className="text-white/70 leading-relaxed mb-4">
                            We reserve the right to suspend or terminate your account if:
                        </p>
                        <ul className="space-y-2 text-white/70">
                            <li>• You violate these Terms of Service</li>
                            <li>• You engage in fraudulent or illegal activities</li>
                            <li>• You receive multiple complaints from other users</li>
                            <li>• We believe your actions may harm NextKinLife or other users</li>
                        </ul>
                        <p className="text-white/70 mt-4">
                            You may also delete your account at any time through your account settings.
                        </p>
                    </div>

                    {/* Dispute Resolution */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                                <Scale className="w-5 h-5 text-accent" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">11. Dispute Resolution</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed mb-4">
                            In the event of a dispute, we encourage users to first attempt to resolve issues directly. If a resolution cannot be reached:
                        </p>
                        <ul className="space-y-2 text-white/70">
                            <li>• Contact our support team for mediation assistance</li>
                            <li>• Disputes may be resolved through binding arbitration</li>
                            <li>• These Terms are governed by the laws of the United States</li>
                        </ul>
                    </div>

                    {/* Changes to Terms */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-4">12. Changes to Terms</h2>
                        <p className="text-white/70 leading-relaxed">
                            We may update these Terms from time to time. We will notify you of significant changes via email or through the platform. Your continued use of NextKinLife after changes are posted constitutes acceptance of the updated Terms. We encourage you to review these Terms periodically.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-2xl p-8 border border-accent/30">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-6 h-6 text-accent" />
                            <h2 className="text-2xl font-bold text-white">Contact Us</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed mb-4">
                            If you have any questions about these Terms of Service, please contact us:
                        </p>
                        <div className="space-y-2 text-white/80">
                            <p><strong>Email:</strong> legal@nextkinlife.com</p>
                            <p><strong>Address:</strong> NextKinLife LLC, United States</p>
                        </div>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
}
