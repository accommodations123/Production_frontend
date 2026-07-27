import { Link } from "react-router-dom";
import {
    Facebook,
    Instagram,
    Linkedin,
    Globe,
} from "lucide-react";

const XIcon = ({ size = 18 }) => (
    <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
    >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);
XIcon.displayName = "XIcon";

export default function Footer() {
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
        <footer className="border-t border-[#EBEBEB] bg-[#F7F7F7]">
            <div className="mx-auto max-w-7xl px-6 py-14">

                {/* Top */}

                <div className="grid grid-cols-1 gap-10 border-b border-[#E5E5E5] pb-12 md:grid-cols-3">

                    {/* Support */}

                    <div>
                        <h3 className="mb-5 text-[15px] font-semibold text-[#222222]">
                            Support
                        </h3>

                        <ul className="space-y-4">

                            <li>
                                <Link
                                    to="/help"
                                    className="text-[15px] text-[#222222] hover:underline hover:underline"
                                >
                                    Help Center
                                </Link>
                            </li>
                         

                            <li>
                                <Link
                                    to="/trust"
                                    className="text-[15px] text-[#222222] hover:underline hover:underline"
                                >
                                    Trust & Safety
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/community-guidelines"
                                    className="text-[15px] text-[#222222] hover:underline hover:underline"
                                >
                                    Community Guidelines
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/contact"
                                    className="text-[15px] text-[#222222] hover:underline hover:underline"
                                >
                                    Contact Support
                                </Link>
                            </li>

                        </ul>
                    </div>

                    {/* Hosting */}

                    <div>

                        <h3 className="mb-5 text-[15px] font-semibold text-[#222222]">
                            Hosting
                        </h3>

                        <ul className="space-y-4">

                            <li>
                                <Link
                                    to="/host"
                                    className="text-[15px] text-[#222222] hover:underline hover:underline"
                                >
                                    Become a Host
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/travel"
                                    className="text-[15px] text-[#222222] hover:underline hover:underline"
                                >
                                    Travel Partners
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/events"
                                    className="text-[15px] text-[#222222] hover:underline hover:underline"
                                >
                                    Host Events
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/marketplace"
                                    className="text-[15px] text-[#222222] hover:underline hover:underline"
                                >
                                    Sell on Marketplace
                                </Link>
                            </li>

                        </ul>

                    </div>

                    {/* NextKinLife */}

                    <div>

                        <h3 className="mb-5 text-[15px] font-semibold text-[#222222]">
                            NextKinLife
                        </h3>

                        <ul className="space-y-4">

                            <li>
                                <Link
                                    to="/about"
                                    className="text-[15px] text-[#222222] hover:underline hover:underline"
                                >
                                    About Us
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/career"
                                    className="text-[15px] text-[#222222] hover:underline hover:underline"
                                >
                                    Careers
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/privacy"
                                    className="text-[15px] text-[#222222] hover:underline hover:underline"
                                >
                                    Privacy
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/terms"
                                    className="text-[15px] text-[#222222] hover:underline hover:underline"
                                >
                                    Terms
                                </Link>
                            </li>

                        </ul>

                    </div>

                </div>

                {/* Bottom */}

                <div className="flex flex-col gap-5 pt-6 text-[14px] text-[#222222] lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex flex-wrap items-center gap-3">

                        <span>
                            © {new Date().getFullYear()} NextKinLife LLC
                        </span>

                        <span>·</span>

                        <Link
                            to="/privacy"
                            className="hover:underline"
                        >
                            Privacy
                        </Link>

                        <span>·</span>

                        <Link
                            to="/terms"
                            className="hover:underline"
                        >
                            Terms
                        </Link>

                        <span>·</span>

                        <Link
                            to="/company"
                            className="hover:underline"
                        >
                            Company details
                        </Link>

                    </div>

                    <div className="flex flex-wrap items-center gap-5">

                        <button className="flex items-center gap-2 hover:underline">
                            <Globe size={18} strokeWidth={1.75} />
                            English (IN)
                        </button>



                        <div className="flex items-center gap-4">
                            {socialLinks.map((social, i) => (
                                <a
                                    key={i}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                >
                                    <social.icon size={18} strokeWidth={1.75} />
                                </a>
                            ))}
                        </div>

                    </div>

                </div>

            </div>
        </footer>
    );
}
