import { Link } from "react-router-dom";
import {
    Facebook,
    Instagram,
    Linkedin,
    Globe, // Added Globe icon for Google
    Mail,
    MapPin,
    Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCountry } from "@/context/CountryContext";

const XIcon = ({ size = 16 }) => (
    <svg 
        viewBox="0 0 24 24" 
        width={size} 
        height={size} 
        fill="currentColor"
    >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);
XIcon.displayName = "XIcon";

export function Footer() {
    const { activeCountry } = useCountry();

    const socialLinks = [
        {
            icon: Facebook,
            url: "https://www.facebook.com/people/Nextkinlife-LLC/61577029054815/?mibextid=wwXIfr&rdid=pk37kk7FzbBW2j1M&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1C2FRbhoeA%2F%3Fmibextid%3DwwXIfr"
        },
        {
            icon: XIcon,
            url: "https://x.com/NextKinLife"
        },
        {
            icon: Instagram,
            url: "https://www.instagram.com/nextkinlife?igsh=MXZqenA5cjdqMGt2bw%3D%3D"
        },
        {
            icon: Linkedin,
            url: "https://www.linkedin.com/company/nextkin/"
        },
        {
            icon: Globe, // Using Globe icon for Google
            url: "https://nextkinlife.com/"
        }
    ];

    return (
        <footer className="bg-navy-dark text-white font-sans pt-10 sm:pt-12 md:pt-16 pb-32 lg:pb-8 border-t border-white/5">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-12 md:mb-16">

                    {/* Column 1: Brand */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1">
                                <img
                                    src="/logo.jpeg"
                                    alt="Logo"
                                    className="object-cover w-full h-full rounded"
                                />
                            </div>
                            <span className="text-xl font-bold font-poppins tracking-tight">NextKinLife</span>
                        </Link>
                        <p className="text-white/70 text-sm leading-relaxed max-w-sm">
                            Connecting you with unique stays, travel partners, and experts. The world is yours to explore.
                        </p>
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social, i) => (
                                <a
                                    key={i}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-white transition-all text-white/70 active:scale-95"
                                    aria-label="Social Link"
                                >
                                    <social.icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Company */}
                    <div>
                        <h4 className="font-bold font-poppins mb-4 sm:mb-6 text-white text-base">Company</h4>
                        <ul className="space-y-3 text-sm text-white/70">
                            <li><Link to="/about" className="hover:text-accent transition-colors flex items-center gap-2 py-0.5">About Us</Link></li>
                            <li><Link to="/career" className="hover:text-accent transition-colors flex items-center gap-2 py-0.5">Careers</Link></li>
                            <li><Link to="/contact" className="hover:text-accent transition-colors flex items-center gap-2 py-0.5">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Resources */}
                    <div>
                        <h4 className="font-bold font-poppins mb-4 sm:mb-6 text-white text-base">Resources</h4>
                        <ul className="space-y-3 text-sm text-white/70">
                            <li><Link to="/accommodations" className="hover:text-accent transition-colors flex items-center gap-2 py-0.5">Accommodations</Link></li>
                            <li><Link to="/marketplace" className="hover:text-accent transition-colors flex items-center gap-2 py-0.5">Marketplace</Link></li>
                            <li><Link to="/people" className="hover:text-accent transition-colors flex items-center gap-2 py-0.5">People & Experts</Link></li>
                            <li><Link to="/events" className="hover:text-accent transition-colors flex items-center gap-2 py-0.5">Events</Link></li>
                            <li><Link to="/travel" className="hover:text-accent transition-colors flex items-center gap-2 py-0.5">Travel Partners</Link></li>
                            <li><Link to="/trust" className="hover:text-accent transition-colors flex items-center gap-2 py-0.5">Trust & Safety</Link></li>
                            <li><Link to="/help" className="hover:text-accent transition-colors flex items-center gap-2 py-0.5">Help Center</Link></li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/5 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
                    <p className="text-center sm:text-left">© {new Date().getFullYear()} NextKinLife LLC. All rights reserved.</p>
                    <div className="flex gap-6 items-center">
                        <Link to="/privacy" className="hover:text-white transition-colors py-1">Privacy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors py-1">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}